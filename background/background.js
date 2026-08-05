/**
 * Background Service Worker dla Comet Dark Mode
 * Obsługuje automatyzację i synchronizację między kartami
 */

// Import modułów (w przeglądarce będą dostępne globalnie po załadowaniu)
// W rzeczywistości będą załadowane przez manifest

let config = null;
let systemPreferenceListener = null;

// Inicjalizacja
chrome.runtime.onInstalled.addListener(async () => {
  await init();
});

// Inicjalizacja przy starcie
init();

/**
 * Inicjalizuje background worker
 */
async function init() {
  await loadConfig();
  setupAutomation();
  setupStorageListener();
}

/**
 * Ładuje konfigurację z storage
 */
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (data) => {
      if (chrome.runtime.lastError) {
        chrome.storage.local.get(null, (data) => {
          config = {
            enabled: data.enabled || false,
            automation: data.automation || { type: 'system' },
            brightness: data.brightness || 0,
            contrast: data.contrast || 100,
            sepia: data.sepia || 0
          };
          resolve();
        });
      } else {
        config = {
          enabled: data.enabled || false,
          automation: data.automation || { type: 'system' },
          brightness: data.brightness || 0,
          contrast: data.contrast || 100,
          sepia: data.sepia || 0
        };
        resolve();
      }
    });
  });
}

/**
 * Konfiguruje automatyzację
 */
function setupAutomation() {
  const automationType = config?.automation?.type || 'system';

  // Wyczyść poprzednie alarmy
  chrome.alarms.clearAll();

  if (automationType === 'system') {
    setupSystemAutomation();
  } else if (automationType === 'schedule') {
    setupScheduleAutomation();
  } else if (automationType === 'geolocation') {
    setupGeolocationAutomation();
  }
}

/**
 * Konfiguruje automatyzację opartą na systemie
 */
function setupSystemAutomation() {
  // W background worker nie mamy bezpośredniego dostępu do matchMedia
  // Używamy content script do sprawdzenia preferencji
  checkSystemPreference();
  
  // Sprawdzaj co 5 minut
  chrome.alarms.create('checkSystemPreference', { periodInMinutes: 5 });
}

/**
 * Sprawdza preferencje systemowe
 */
async function checkSystemPreference() {
  try {
    // Pobierz aktywną kartę
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0].id) {
      // Wyślij wiadomość do content script, aby sprawdził preferencje
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkSystemPreference' }, (response) => {
        if (chrome.runtime.lastError) {
          // Jeśli nie ma content script, użyj domyślnej wartości
          return;
        }
        if (response && response.isDark !== undefined) {
          updateEnabledState(response.isDark);
        }
      });
    }
  } catch (error) {
    console.error('Błąd sprawdzania preferencji systemowych:', error);
  }
}

/**
 * Konfiguruje automatyzację harmonogramową
 */
function setupScheduleAutomation() {
  const schedule = config?.automation?.schedule;
  if (!schedule || !schedule.enabled) {
    return;
  }

  const [startHour, startMin] = (schedule.startTime || '20:00').split(':').map(Number);
  const [endHour, endMin] = (schedule.endTime || '08:00').split(':').map(Number);

  // Oblicz czas następnego uruchomienia
  const now = new Date();
  const startTime = new Date();
  startTime.setHours(startHour, startMin, 0, 0);
  
  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  // Jeśli start jest wcześniej niż teraz, ustaw na jutro
  if (startTime < now) {
    startTime.setDate(startTime.getDate() + 1);
  }
  if (endTime < now) {
    endTime.setDate(endTime.getDate() + 1);
  }

  // Ustaw alarmy
  chrome.alarms.create('scheduleEnable', { when: startTime.getTime() });
  chrome.alarms.create('scheduleDisable', { when: endTime.getTime() });

  // Sprawdź aktualny stan
  checkScheduleState();
}

/**
 * Sprawdza aktualny stan harmonogramu
 */
function checkScheduleState() {
  const schedule = config?.automation?.schedule;
  if (!schedule) return;

  const [startHour, startMin] = (schedule.startTime || '20:00').split(':').map(Number);
  const [endHour, endMin] = (schedule.endTime || '08:00').split(':').map(Number);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  let shouldBeEnabled = false;
  if (startMinutes > endMinutes) {
    // Zakres przekracza północ
    shouldBeEnabled = currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    shouldBeEnabled = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  updateEnabledState(shouldBeEnabled);
}

/**
 * Konfiguruje automatyzację opartą na geolokalizacji
 */
function setupGeolocationAutomation() {
  const geolocation = config?.automation?.geolocation;
  if (!geolocation || !geolocation.enabled || !geolocation.latitude || !geolocation.longitude) {
    return;
  }

  // Sprawdź aktualny stan
  checkGeolocationState();

  // Sprawdzaj co godzinę
  chrome.alarms.create('checkGeolocation', { periodInMinutes: 60 });
}

/**
 * Sprawdza aktualny stan geolokalizacji
 */
async function checkGeolocationState() {
  const geolocation = config?.automation?.geolocation;
  if (!geolocation || !geolocation.latitude || !geolocation.longitude) {
    return;
  }

  try {
    const shouldBeEnabled = await shouldEnableByGeolocation(
      geolocation.latitude,
      geolocation.longitude
    );
    updateEnabledState(shouldBeEnabled);
  } catch (error) {
    console.error('Błąd sprawdzania geolokalizacji:', error);
  }
}

/**
 * Sprawdza czy tryb ciemny powinien być włączony na podstawie geolokalizacji
 */
async function shouldEnableByGeolocation(latitude, longitude) {
  const now = new Date();
  const sunset = calculateSunset(latitude, longitude, now);
  const sunrise = calculateSunrise(latitude, longitude, now);

  return now >= sunset || now < sunrise;
}

/**
 * Oblicza czas zachodu słońca
 */
function calculateSunset(latitude, longitude, date = new Date()) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180));
  const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15 - (longitude / 15) - (date.getTimezoneOffset() / 60);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), Math.round((sunsetHour % 1) * 60), 0, 0);
  
  return sunset;
}

/**
 * Oblicza czas wschodu słońca
 */
function calculateSunrise(latitude, longitude, date = new Date()) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180));
  const sunriseHour = 12 - (hourAngle * 180 / Math.PI) / 15 - (longitude / 15) - (date.getTimezoneOffset() / 60);
  
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), Math.round((sunriseHour % 1) * 60), 0, 0);
  
  return sunrise;
}

/**
 * Aktualizuje stan włączony/wyłączony
 */
async function updateEnabledState(shouldBeEnabled) {
  if (config.enabled === shouldBeEnabled) {
    return; // Brak zmiany
  }

  config.enabled = shouldBeEnabled;
  await saveConfig({ enabled: shouldBeEnabled });

  // Powiadom wszystkie karty
  notifyAllTabs();
}

/**
 * Zapisuje konfigurację
 */
async function saveConfig(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        chrome.storage.local.set(data, resolve);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Powiadamia wszystkie karty o zmianie
 */
async function notifyAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {
          // Ignoruj błędy (karta może nie mieć content script)
        });
      }
    });
  } catch (error) {
    console.error('Błąd powiadamiania kart:', error);
  }
}

/**
 * Konfiguruje nasłuchiwanie zmian w storage
 */
function setupStorageListener() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' || areaName === 'local') {
      // Zaktualizuj konfigurację
      Object.keys(changes).forEach(key => {
        if (config) {
          config[key] = changes[key].newValue;
        }
      });

      // Przeładuj automatyzację jeśli zmienił się typ
      if (changes.automation) {
        setupAutomation();
      }
    }
  });
}

// Obsługa alarmów
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkSystemPreference') {
    checkSystemPreference();
  } else if (alarm.name === 'scheduleEnable') {
    updateEnabledState(true);
    // Ustaw następny alarm
    setupScheduleAutomation();
  } else if (alarm.name === 'scheduleDisable') {
    updateEnabledState(false);
    // Ustaw następny alarm
    setupScheduleAutomation();
  } else if (alarm.name === 'checkGeolocation') {
    checkGeolocationState();
  }
});

// Obsługa wiadomości z content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'systemPreference') {
    // Odpowiedź z content script o preferencjach systemowych
    if (config?.automation?.type === 'system') {
      updateEnabledState(message.isDark);
    }
    sendResponse({ success: true });
  }
  return true;
});

// Obsługa skrótów klawiszowych
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-dark-mode') {
    await toggleDarkMode();
  }
});

/**
 * Przełącza tryb ciemny (używane przez skrót klawiszowy)
 */
async function toggleDarkMode() {
  await loadConfig();
  const newState = !config.enabled;
  await updateEnabledState(newState);
}

