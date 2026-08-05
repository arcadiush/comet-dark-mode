/**
 * Skrypt dla panelu popup
 */

let currentDomain = '';
let config = null;
let notificationTimeout = null;

// Inicjalizacja
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});

/**
 * Inicjalizuje popup
 */
async function init() {
  try {
    // Pobierz aktualną kartę
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      currentDomain = url.hostname.replace(/^www\./, '');
    }

    // Załaduj konfigurację
    await loadConfig();

    // Zaktualizuj UI
    updateUI();

    // Załaduj presety
    await loadPresets();

    // Nasłuchuj zmian
    setupListeners();

    // Sprawdź czy strona ma już tryb ciemny
    await checkForNativeDarkMode();
  } catch (error) {
    console.error('Błąd inicjalizacji popup:', error);
  }
}

/**
 * Ładuje konfigurację z storage
 */
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (data) => {
      if (chrome.runtime.lastError) {
        chrome.storage.local.get(null, (data) => {
          config = data;
          resolve();
        });
      } else {
        config = data;
        resolve();
      }
    });
  });
}

/**
 * Zapisuje konfigurację
 */
async function saveConfig(key, value) {
  return new Promise((resolve) => {
    const data = { [key]: value };
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
 * Aktualizuje interfejs użytkownika
 */
function updateUI() {
  const enabled = config?.enabled || false;
  const toggle = document.getElementById('mainToggle');
  const toggleText = document.getElementById('toggleText');
  const domainStatus = document.getElementById('domainStatus');
  const statusText = domainStatus.querySelector('.status-text');
  const slidersSection = document.getElementById('slidersSection');
  const body = document.body;

  // Przełącz motyw okienka w zależności od stanu trybu ciemnego
  if (enabled) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }

  // Ustaw przełącznik
  toggle.checked = enabled;
  toggleText.textContent = enabled ? 'Włączony' : 'Wyłączony';

  // Sprawdź status domeny
  const isWhitelisted = isDomainWhitelisted(currentDomain);
  const isBlacklisted = isDomainBlacklisted(currentDomain);
  const isActive = isBlacklisted || (enabled && !isWhitelisted);

  const presetsSection = document.getElementById('presetsSection');
  
  if (isActive) {
    statusText.textContent = `Aktywny na ${currentDomain}`;
    statusText.className = 'status-text active';
    // Pokaż suwaki i presety tylko gdy wtyczka jest aktywna
    slidersSection.style.display = 'block';
    if (presetsSection) presetsSection.style.display = 'block';
  } else {
    statusText.textContent = `Nieaktywny na ${currentDomain}`;
    statusText.className = 'status-text inactive';
    // Ukryj suwaki i presety gdy wtyczka nie jest aktywna
    slidersSection.style.display = 'none';
    if (presetsSection) presetsSection.style.display = 'none';
  }

  // Zaktualizuj przycisk whitelist
  const addToWhitelistBtn = document.getElementById('addToWhitelist');
  if (isWhitelisted) {
    addToWhitelistBtn.textContent = 'Usuń z wykluczeń';
  } else {
    addToWhitelistBtn.textContent = 'Wyłącz na tej stronie';
  }

  // Ustaw wartości suwaków i pokaż/ukryj zgodnie z ustawieniami widoczności
  if (config) {
    const visibleSliders = config.visibleSliders || Storage.defaults.visibleSliders;
    
    // Jasność
    const brightnessControl = document.querySelector('#brightness').closest('.slider-control');
    if (brightnessControl) {
      brightnessControl.style.display = visibleSliders.brightness !== false ? 'block' : 'none';
      if (visibleSliders.brightness !== false) {
        const brightnessEl = document.getElementById('brightness');
        brightnessEl.value = config.brightness || 0;
        document.getElementById('brightnessValue').textContent = config.brightness || 0;
      }
    }
    
    // Kontrast
    const contrastControl = document.querySelector('#contrast').closest('.slider-control');
    if (contrastControl) {
      contrastControl.style.display = visibleSliders.contrast !== false ? 'block' : 'none';
      if (visibleSliders.contrast !== false) {
        const contrastEl = document.getElementById('contrast');
        contrastEl.value = config.contrast || 100;
        document.getElementById('contrastValue').textContent = config.contrast || 100;
      }
    }
    
    // Sepia
    const sepiaControl = document.querySelector('#sepia').closest('.slider-control');
    if (sepiaControl) {
      sepiaControl.style.display = visibleSliders.sepia !== false ? 'block' : 'none';
      if (visibleSliders.sepia !== false) {
        const sepiaEl = document.getElementById('sepia');
        sepiaEl.value = config.sepia || 0;
        document.getElementById('sepiaValue').textContent = config.sepia || 0;
      }
    }
    
    // Nasycenie
    const saturationControl = document.querySelector('#saturation').closest('.slider-control');
    if (saturationControl) {
      saturationControl.style.display = visibleSliders.saturation !== false ? 'block' : 'none';
      if (visibleSliders.saturation !== false) {
        const saturationEl = document.getElementById('saturation');
        saturationEl.value = config.saturation || 100;
        document.getElementById('saturationValue').textContent = config.saturation || 100;
      }
    }
    
    // Obrót odcienia
    const hueRotateControl = document.querySelector('#hueRotate').closest('.slider-control');
    if (hueRotateControl) {
      hueRotateControl.style.display = visibleSliders.hueRotate !== false ? 'block' : 'none';
      if (visibleSliders.hueRotate !== false) {
        const hueRotateEl = document.getElementById('hueRotate');
        hueRotateEl.value = config.hueRotate || 0;
        document.getElementById('hueRotateValue').textContent = config.hueRotate || 0;
      }
    }
    
    // Szarość
    const grayscaleControl = document.querySelector('#grayscale').closest('.slider-control');
    if (grayscaleControl) {
      grayscaleControl.style.display = visibleSliders.grayscale !== false ? 'block' : 'none';
      if (visibleSliders.grayscale !== false) {
        const grayscaleEl = document.getElementById('grayscale');
        grayscaleEl.value = config.grayscale || 0;
        document.getElementById('grayscaleValue').textContent = config.grayscale || 0;
      }
    }
  }
}

/**
 * Sprawdza czy domena jest na whitelist
 */
function isDomainWhitelisted(domain) {
  if (!config || !config.whitelist || !Array.isArray(config.whitelist)) {
    return false;
  }
  return config.whitelist.some(d => normalizeDomain(d) === normalizeDomain(domain));
}

/**
 * Sprawdza czy domena jest na blacklist
 */
function isDomainBlacklisted(domain) {
  if (!config || !config.blacklist || !Array.isArray(config.blacklist)) {
    return false;
  }
  return config.blacklist.some(d => normalizeDomain(d) === normalizeDomain(domain));
}

/**
 * Normalizuje domenę
 */
function normalizeDomain(domain) {
  return domain.toLowerCase().replace(/^www\./, '').trim();
}

/**
 * Sprawdza czy strona ma już domyślnie włączony tryb ciemny
 */
async function checkForNativeDarkMode() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].id) {
      // Wyślij wiadomość do content script, aby sprawdził tryb ciemny
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkNativeDarkMode' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script może nie być załadowany jeszcze
          console.log('[Popup] Nie można sprawdzić trybu ciemnego:', chrome.runtime.lastError.message);
        } else if (response && response.hasNativeDarkMode) {
          showNotification();
        }
      });
    }
  } catch (error) {
    console.error('[Popup] Błąd sprawdzania trybu ciemnego:', error);
  }
}

/**
 * Wyświetla powiadomienie o wykryciu trybu ciemnego
 */
function showNotification() {
  const notification = document.getElementById('darkModeNotification');
  if (!notification) return;

  // Usuń klasę hiding jeśli była
  notification.classList.remove('hiding');
  
  // Pokaż powiadomienie
  notification.style.display = 'block';
  
  // Ukryj po 5 sekundach
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 5000);
}

/**
 * Ukrywa powiadomienie z animacją
 */
function hideNotification() {
  const notification = document.getElementById('darkModeNotification');
  if (!notification || notification.style.display === 'none') return;

  // Dodaj klasę hiding dla animacji
  notification.classList.add('hiding');
  
  // Ukryj po zakończeniu animacji
  setTimeout(() => {
    notification.style.display = 'none';
    notification.classList.remove('hiding');
  }, 300); // Czas trwania animacji
}

/**
 * Konfiguruje nasłuchiwanie zdarzeń
 */
function setupListeners() {
  // Przełącznik główny
  const toggle = document.getElementById('mainToggle');
  toggle.addEventListener('change', async (e) => {
    await saveConfig('enabled', e.target.checked);
    config.enabled = e.target.checked;
    updateUI();
    updateIcon(e.target.checked);
    
    // Powiadom wszystkie karty
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
      }
    });
  });

  // Przycisk dodania do whitelist
  const addToWhitelistBtn = document.getElementById('addToWhitelist');
  addToWhitelistBtn.addEventListener('click', async () => {
    await toggleWhitelist();
  });

  // Przycisk otwarcia opcji
  const openOptionsBtn = document.getElementById('openOptions');
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Suwaki - aktualizacja na żywo
  setupSliders();

  // Nasłuchuj zmian w storage
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      config.enabled = changes.enabled.newValue;
      updateUI();
      updateIcon(changes.enabled.newValue);
    }
    if (changes.brightness || changes.contrast || changes.sepia || changes.saturation || changes.hueRotate || changes.grayscale) {
      if (changes.brightness) config.brightness = changes.brightness.newValue;
      if (changes.contrast) config.contrast = changes.contrast.newValue;
      if (changes.sepia) config.sepia = changes.sepia.newValue;
      if (changes.saturation) config.saturation = changes.saturation.newValue;
      if (changes.hueRotate) config.hueRotate = changes.hueRotate.newValue;
      if (changes.grayscale) config.grayscale = changes.grayscale.newValue;
      updateUI();
    }
    if (changes.visibleSliders) {
      config.visibleSliders = changes.visibleSliders.newValue;
      updateUI();
    }
    if (changes.currentPreset) {
      loadPresets(); // Odśwież presety gdy się zmieni
    }
  });

  // Nasłuchuj wiadomości z content script o wykryciu trybu ciemnego
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'nativeDarkModeDetected') {
      showNotification();
      sendResponse({ success: true });
    }
    return true;
  });
}

/**
 * Konfiguruje suwaki z aktualizacją na żywo
 */
function setupSliders() {
  let brightnessTimeout = null;
  let contrastTimeout = null;
  let sepiaTimeout = null;
  let saturationTimeout = null;
  let hueRotateTimeout = null;
  let grayscaleTimeout = null;

  // Suwak jasności
  const brightnessSlider = document.getElementById('brightness');
  brightnessSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    document.getElementById('brightnessValue').textContent = value;
    
    // Aktualizuj lokalnie i wyślij na żywo natychmiast
    config.brightness = value;
    updateLivePreview();
    
    // Debounce - zapisz do storage po 300ms od ostatniej zmiany (szybsza synchronizacja)
    clearTimeout(brightnessTimeout);
    brightnessTimeout = setTimeout(async () => {
      await saveConfig('brightness', value);
      console.log('[Popup] Zapisano brightness:', value);
    }, 300);
  });

  // Suwak kontrastu
  const contrastSlider = document.getElementById('contrast');
  contrastSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    document.getElementById('contrastValue').textContent = value;
    
    // Aktualizuj lokalnie i wyślij na żywo natychmiast
    config.contrast = value;
    updateLivePreview();
    
    clearTimeout(contrastTimeout);
    contrastTimeout = setTimeout(async () => {
      await saveConfig('contrast', value);
      console.log('[Popup] Zapisano contrast:', value);
    }, 300);
  });

  // Suwak sepii
  const sepiaSlider = document.getElementById('sepia');
  sepiaSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    document.getElementById('sepiaValue').textContent = value;
    
    // Aktualizuj lokalnie i wyślij na żywo natychmiast
    config.sepia = value;
    updateLivePreview();
    
    clearTimeout(sepiaTimeout);
    sepiaTimeout = setTimeout(async () => {
      await saveConfig('sepia', value);
      console.log('[Popup] Zapisano sepia:', value);
    }, 300);
  });

  // Suwak nasycenia
  const saturationSlider = document.getElementById('saturation');
  if (saturationSlider) {
    saturationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('saturationValue').textContent = value;
      
      config.saturation = value;
      updateLivePreview();
      
      clearTimeout(saturationTimeout);
      saturationTimeout = setTimeout(async () => {
        await saveConfig('saturation', value);
        console.log('[Popup] Zapisano saturation:', value);
      }, 300);
    });
  }

  // Suwak obrotu odcienia
  const hueRotateSlider = document.getElementById('hueRotate');
  if (hueRotateSlider) {
    hueRotateSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('hueRotateValue').textContent = value;
      
      config.hueRotate = value;
      updateLivePreview();
      
      clearTimeout(hueRotateTimeout);
      hueRotateTimeout = setTimeout(async () => {
        await saveConfig('hueRotate', value);
        console.log('[Popup] Zapisano hueRotate:', value);
      }, 300);
    });
  }

  // Suwak szarości
  const grayscaleSlider = document.getElementById('grayscale');
  if (grayscaleSlider) {
    grayscaleSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('grayscaleValue').textContent = value;
      
      config.grayscale = value;
      updateLivePreview();
      
      clearTimeout(grayscaleTimeout);
      grayscaleTimeout = setTimeout(async () => {
        await saveConfig('grayscale', value);
        console.log('[Popup] Zapisano grayscale:', value);
      }, 300);
    });
  }
}

/**
 * Aktualizuje podgląd na żywo w content script
 */
async function updateLivePreview() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].id) {
      const message = {
        action: 'updateConfig',
        config: {
          brightness: config.brightness || 0,
          contrast: config.contrast || 100,
          sepia: config.sepia || 0,
          saturation: config.saturation || 100,
          hueRotate: config.hueRotate || 0,
          grayscale: config.grayscale || 0
        }
      };
      
      console.log('[Popup] Wysyłam aktualizację do content script:', message);
      
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Popup] Błąd wysyłania wiadomości:', chrome.runtime.lastError.message);
        } else {
          console.log('[Popup] Wiadomość wysłana pomyślnie, odpowiedź:', response);
        }
      });
    } else {
      console.warn('[Popup] Nie znaleziono aktywnej karty');
    }
  } catch (error) {
    console.error('[Popup] Błąd aktualizacji podglądu:', error);
  }
}

/**
 * Przełącza domenę na whitelist
 */
async function toggleWhitelist() {
  if (!currentDomain) return;

  const whitelist = config.whitelist || [];
  const normalizedDomain = normalizeDomain(currentDomain);
  const index = whitelist.findIndex(d => normalizeDomain(d) === normalizedDomain);

  if (index >= 0) {
    // Usuń z whitelist
    whitelist.splice(index, 1);
  } else {
    // Dodaj do whitelist
    whitelist.push(normalizedDomain);
  }

  await saveConfig('whitelist', whitelist);
  config.whitelist = whitelist;
  updateUI();

  // Powiadom aktualną kartę
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && tabs[0].id) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'configChanged' }).catch(() => {});
  }
}

/**
 * Ładuje i wyświetla presety
 */
async function loadPresets() {
  try {
    if (typeof Presets === 'undefined') {
      console.warn('Presets nie jest dostępny');
      return;
    }
    
    const presets = await Presets.getAll();
    const presetsButtons = document.getElementById('presetsButtons');
    const currentPreset = await Presets.getCurrent();
    
    if (!presetsButtons) return;
    
    presetsButtons.innerHTML = '';
    
    Object.keys(presets).forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.textContent = name;
      if (name === currentPreset) {
        btn.classList.add('active');
      }
      btn.addEventListener('click', async () => {
        await applyPreset(name);
      });
      presetsButtons.appendChild(btn);
    });
  } catch (error) {
    console.error('Błąd ładowania presetów:', error);
  }
}

/**
 * Zastosowuje preset
 */
async function applyPreset(name) {
  try {
    if (typeof Presets === 'undefined') {
      console.error('Presets nie jest dostępny');
      return;
    }
    
    await Presets.apply(name);
    await loadConfig();
    updateUI();
    await loadPresets(); // Odśwież przyciski presetów
    
    // Powiadom wszystkie karty
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
      }
    });
  } catch (error) {
    console.error('Błąd zastosowania presetu:', error);
  }
}

/**
 * Aktualizuje ikonę w pasku narzędzi
 */
async function updateIcon(enabled) {
  if (enabled) {
    chrome.action.setIcon({
      path: {
        16: '../icons/icon-dark-16.png',
        48: '../icons/icon-dark-48.png',
        128: '../icons/icon-dark-128.png'
      }
    });
  } else {
    chrome.action.setIcon({
      path: {
        16: '../icons/icon-light-16.png',
        48: '../icons/icon-light-48.png',
        128: '../icons/icon-light-128.png'
      }
    });
  }
}

