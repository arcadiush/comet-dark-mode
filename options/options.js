/**
 * Skrypt dla strony opcji
 */

let config = null;
let currentDomain = '';

// Inicjalizacja
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});

/**
 * Inicjalizuje stronę opcji
 */
async function init() {
  try {
    // Pobierz aktualną domenę jeśli otwarta z karty
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('domain');
    if (domain) {
      currentDomain = domain;
      document.getElementById('currentDomain').value = domain;
      document.getElementById('cssDomain').value = domain;
    }

    // Załaduj konfigurację
    await loadConfig();

    // Wypełnij formularz
    populateForm();

    // Konfiguruj nasłuchiwanie
    setupListeners();
  } catch (error) {
    console.error('Błąd inicjalizacji opcji:', error);
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
          // Użyj domyślnych wartości
          config = {
            ...Storage.defaults,
            ...data
          };
          resolve();
        });
      } else {
        config = {
          ...Storage.defaults,
          ...data
        };
        resolve();
      }
    });
  });
}

/**
 * Wypełnia formularz danymi z konfiguracji
 */
function populateForm() {
  // Wygląd
  document.getElementById('brightness').value = config.brightness || 0;
  document.getElementById('brightnessValue').textContent = config.brightness || 0;
  document.getElementById('contrast').value = config.contrast || 100;
  document.getElementById('contrastValue').textContent = config.contrast || 100;
  document.getElementById('sepia').value = config.sepia || 0;
  document.getElementById('sepiaValue').textContent = config.sepia || 0;
  document.getElementById('saturation').value = config.saturation || 100;
  document.getElementById('saturationValue').textContent = config.saturation || 100;
  document.getElementById('hueRotate').value = config.hueRotate || 0;
  document.getElementById('hueRotateValue').textContent = config.hueRotate || 0;
  document.getElementById('grayscale').value = config.grayscale || 0;
  document.getElementById('grayscaleValue').textContent = config.grayscale || 0;

  // Widoczność suwaków
  const visibleSliders = config.visibleSliders || Storage.defaults.visibleSliders;
  document.getElementById('visibleBrightness').checked = visibleSliders.brightness !== false;
  document.getElementById('visibleContrast').checked = visibleSliders.contrast !== false;
  document.getElementById('visibleSepia').checked = visibleSliders.sepia !== false;
  document.getElementById('visibleSaturation').checked = visibleSliders.saturation !== false;
  document.getElementById('visibleHueRotate').checked = visibleSliders.hueRotate !== false;
  document.getElementById('visibleGrayscale').checked = visibleSliders.grayscale !== false;

  // Automatyzacja
  const automationType = config.automation?.type || 'system';
  document.querySelector(`input[name="automation"][value="${automationType}"]`).checked = true;
  updateAutomationSettings();

  if (config.automation?.schedule) {
    document.getElementById('scheduleStart').value = config.automation.schedule.startTime || '20:00';
    document.getElementById('scheduleEnd').value = config.automation.schedule.endTime || '08:00';
  }

  if (config.automation?.geolocation) {
    document.getElementById('geolocationLat').value = config.automation.geolocation.latitude || '';
    document.getElementById('geolocationLng').value = config.automation.geolocation.longitude || '';
  }

  // Listy
  document.getElementById('whitelist').value = (config.whitelist || []).join('\n');
  document.getElementById('blacklist').value = (config.blacklist || []).join('\n');

  // Zaawansowane
  document.getElementById('renderEngine').value = config.renderEngine || 'filter';

  // Per-domena
  renderPerDomainList();
  renderCustomCSSList();
  
  // Presety
  renderPresetsList();
}

/**
 * Konfiguruje nasłuchiwanie zdarzeń
 */
function setupListeners() {
  // Suwaki wyglądu
  document.getElementById('brightness').addEventListener('input', (e) => {
    document.getElementById('brightnessValue').textContent = e.target.value;
  });

  document.getElementById('contrast').addEventListener('input', (e) => {
    document.getElementById('contrastValue').textContent = e.target.value;
  });

  document.getElementById('sepia').addEventListener('input', (e) => {
    document.getElementById('sepiaValue').textContent = e.target.value;
  });

  document.getElementById('saturation').addEventListener('input', (e) => {
    document.getElementById('saturationValue').textContent = e.target.value;
  });

  document.getElementById('hueRotate').addEventListener('input', (e) => {
    document.getElementById('hueRotateValue').textContent = e.target.value;
  });

  document.getElementById('grayscale').addEventListener('input', (e) => {
    document.getElementById('grayscaleValue').textContent = e.target.value;
  });

  // Checkboxy widoczności suwaków
  document.getElementById('visibleBrightness').addEventListener('change', (e) => {
    saveVisibleSliders();
  });
  document.getElementById('visibleContrast').addEventListener('change', (e) => {
    saveVisibleSliders();
  });
  document.getElementById('visibleSepia').addEventListener('change', (e) => {
    saveVisibleSliders();
  });
  document.getElementById('visibleSaturation').addEventListener('change', (e) => {
    saveVisibleSliders();
  });
  document.getElementById('visibleHueRotate').addEventListener('change', (e) => {
    saveVisibleSliders();
  });
  document.getElementById('visibleGrayscale').addEventListener('change', (e) => {
    saveVisibleSliders();
  });

  // Automatyzacja
  document.querySelectorAll('input[name="automation"]').forEach(radio => {
    radio.addEventListener('change', updateAutomationSettings);
  });

  // Geolokalizacja
  document.getElementById('getLocation').addEventListener('click', getCurrentLocation);

  // Per-domena
  document.getElementById('addPerDomain').addEventListener('click', showPerDomainDialog);
  document.getElementById('addCustomCSS').addEventListener('click', showCustomCSSDialog);

  // Presety
  document.getElementById('savePreset').addEventListener('click', savePresetFromCurrent);

  // Eksport/Import
  document.getElementById('exportBtn').addEventListener('click', exportSettings);
  document.getElementById('importFile').addEventListener('change', importSettings);

  // Zapisz
  document.getElementById('saveBtn').addEventListener('click', saveOptions);
  document.getElementById('resetBtn').addEventListener('click', resetOptions);

  // Nasłuchuj zmian w storage (synchronizacja z popup)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' || areaName === 'local') {
      // Zaktualizuj lokalną konfigurację
      let configChanged = false;
      
      if (changes.brightness) {
        config.brightness = changes.brightness.newValue;
        document.getElementById('brightness').value = config.brightness || 0;
        document.getElementById('brightnessValue').textContent = config.brightness || 0;
        configChanged = true;
      }
      
      if (changes.contrast) {
        config.contrast = changes.contrast.newValue;
        document.getElementById('contrast').value = config.contrast || 100;
        document.getElementById('contrastValue').textContent = config.contrast || 100;
        configChanged = true;
      }
      
      if (changes.sepia) {
        config.sepia = changes.sepia.newValue;
        document.getElementById('sepia').value = config.sepia || 0;
        document.getElementById('sepiaValue').textContent = config.sepia || 0;
        configChanged = true;
      }
      
      if (changes.saturation) {
        config.saturation = changes.saturation.newValue;
        document.getElementById('saturation').value = config.saturation || 100;
        document.getElementById('saturationValue').textContent = config.saturation || 100;
        configChanged = true;
      }
      
      if (changes.hueRotate) {
        config.hueRotate = changes.hueRotate.newValue;
        document.getElementById('hueRotate').value = config.hueRotate || 0;
        document.getElementById('hueRotateValue').textContent = config.hueRotate || 0;
        configChanged = true;
      }
      
      if (changes.grayscale) {
        config.grayscale = changes.grayscale.newValue;
        document.getElementById('grayscale').value = config.grayscale || 0;
        document.getElementById('grayscaleValue').textContent = config.grayscale || 0;
        configChanged = true;
      }
      
      if (configChanged) {
        console.log('[Options] Zaktualizowano wartości z storage:', {
          brightness: config.brightness,
          contrast: config.contrast,
          sepia: config.sepia,
          saturation: config.saturation,
          hueRotate: config.hueRotate,
          grayscale: config.grayscale
        });
      }
    }
  });
}

/**
 * Aktualizuje widoczność ustawień automatyzacji
 */
function updateAutomationSettings() {
  const automationType = document.querySelector('input[name="automation"]:checked').value;
  
  document.getElementById('scheduleSettings').style.display = 
    automationType === 'schedule' ? 'block' : 'none';
  document.getElementById('geolocationSettings').style.display = 
    automationType === 'geolocation' ? 'block' : 'none';
}

/**
 * Pobiera aktualną lokalizację użytkownika
 */
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showStatus('Geolokalizacja nie jest obsługiwana w tej przeglądarce', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById('geolocationLat').value = position.coords.latitude.toFixed(4);
      document.getElementById('geolocationLng').value = position.coords.longitude.toFixed(4);
      showStatus('Lokalizacja pobrana pomyślnie', 'success');
    },
    (error) => {
      showStatus('Nie udało się pobrać lokalizacji: ' + error.message, 'error');
    }
  );
}

/**
 * Zapisuje widoczność suwaków
 */
async function saveVisibleSliders() {
  const visibleSliders = {
    brightness: document.getElementById('visibleBrightness').checked,
    contrast: document.getElementById('visibleContrast').checked,
    sepia: document.getElementById('visibleSepia').checked,
    saturation: document.getElementById('visibleSaturation').checked,
    hueRotate: document.getElementById('visibleHueRotate').checked,
    grayscale: document.getElementById('visibleGrayscale').checked
  };
  await Storage.saveConfig({ visibleSliders });
  
  // Powiadom wszystkie karty o zmianie
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
    }
  });
}

/**
 * Zapisuje opcje
 */
async function saveOptions() {
  try {
    // Zbierz dane z formularza
    const newConfig = {
      brightness: parseInt(document.getElementById('brightness').value) || 0,
      contrast: parseInt(document.getElementById('contrast').value) || 100,
      sepia: parseInt(document.getElementById('sepia').value) || 0,
      saturation: parseInt(document.getElementById('saturation').value) || 100,
      hueRotate: parseInt(document.getElementById('hueRotate').value) || 0,
      grayscale: parseInt(document.getElementById('grayscale').value) || 0,
      visibleSliders: {
        brightness: document.getElementById('visibleBrightness').checked,
        contrast: document.getElementById('visibleContrast').checked,
        sepia: document.getElementById('visibleSepia').checked,
        saturation: document.getElementById('visibleSaturation').checked,
        hueRotate: document.getElementById('visibleHueRotate').checked,
        grayscale: document.getElementById('visibleGrayscale').checked
      },
      automation: {
        type: document.querySelector('input[name="automation"]:checked').value,
        schedule: {
          enabled: document.querySelector('input[name="automation"]:checked').value === 'schedule',
          startTime: document.getElementById('scheduleStart').value || '20:00',
          endTime: document.getElementById('scheduleEnd').value || '08:00'
        },
        geolocation: {
          enabled: document.querySelector('input[name="automation"]:checked').value === 'geolocation',
          latitude: parseFloat(document.getElementById('geolocationLat').value) || null,
          longitude: parseFloat(document.getElementById('geolocationLng').value) || null
        }
      },
      whitelist: parseDomainList(document.getElementById('whitelist').value),
      blacklist: parseDomainList(document.getElementById('blacklist').value),
      renderEngine: document.getElementById('renderEngine').value
    };

    // Zachowaj istniejące ustawienia per-domena i custom CSS
    if (config.perDomainSettings) {
      newConfig.perDomainSettings = config.perDomainSettings;
    }
    if (config.customCSS) {
      newConfig.customCSS = config.customCSS;
    }

    // Zapisz
    await Storage.saveConfig(newConfig);
    config = { ...config, ...newConfig };

    showStatus('Ustawienia zapisane pomyślnie!', 'success');

    // Powiadom wszystkie karty
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
      }
    });
  } catch (error) {
    console.error('Błąd zapisywania opcji:', error);
    showStatus('Błąd zapisywania ustawień', 'error');
  }
}

/**
 * Resetuje opcje do domyślnych
 */
async function resetOptions() {
  if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia do wartości domyślnych?')) {
    await Storage.reset();
    config = { ...Storage.defaults };
    populateForm();
    showStatus('Ustawienia zresetowane', 'success');
  }
}

/**
 * Parsuje listę domen z tekstu
 */
function parseDomainList(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Wyświetla status zapisu
 */
function showStatus(message, type) {
  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = message;
  statusEl.className = `save-status ${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'save-status';
  }, 3000);
}

/**
 * Renderuje listę ustawień per-domena
 */
function renderPerDomainList() {
  const listEl = document.getElementById('perDomainList');
  listEl.innerHTML = '';

  if (!config.perDomainSettings || Object.keys(config.perDomainSettings).length === 0) {
    listEl.innerHTML = '<p style="color: #666; font-size: 13px;">Brak ustawień per-domena</p>';
    return;
  }

  Object.keys(config.perDomainSettings).forEach(domain => {
    const settings = config.perDomainSettings[domain];
    const item = document.createElement('div');
    item.className = 'per-domain-item';
    item.innerHTML = `
      <div>
        <div class="domain-name">${domain}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">
          Jasność: ${settings.brightness || 0}, Kontrast: ${settings.contrast || 100}, Sepia: ${settings.sepia || 0}
        </div>
      </div>
      <div class="domain-actions">
        <button class="btn btn-secondary btn-small" onclick="editPerDomain('${domain}')">Edytuj</button>
        <button class="btn btn-danger btn-small" onclick="removePerDomain('${domain}')">Usuń</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

/**
 * Renderuje listę własnych CSS
 */
function renderCustomCSSList() {
  const listEl = document.getElementById('customCSSList');
  listEl.innerHTML = '';

  if (!config.customCSS || Object.keys(config.customCSS).length === 0) {
    listEl.innerHTML = '<p style="color: #666; font-size: 13px;">Brak własnych reguł CSS</p>';
    return;
  }

  Object.keys(config.customCSS).forEach(domain => {
    const item = document.createElement('div');
    item.className = 'per-domain-item';
    item.innerHTML = `
      <div>
        <div class="domain-name">${domain}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">
          ${config.customCSS[domain].substring(0, 50)}...
        </div>
      </div>
      <div class="domain-actions">
        <button class="btn btn-secondary btn-small" onclick="editCustomCSS('${domain}')">Edytuj</button>
        <button class="btn btn-danger btn-small" onclick="removeCustomCSS('${domain}')">Usuń</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

/**
 * Wyświetla dialog dla ustawień per-domena
 */
function showPerDomainDialog() {
  const domain = document.getElementById('currentDomain').value.trim();
  if (!domain) {
    alert('Podaj domenę');
    return;
  }

  const existing = config.perDomainSettings && config.perDomainSettings[domain];
  const brightness = existing?.brightness ?? config.brightness ?? 0;
  const contrast = existing?.contrast ?? config.contrast ?? 100;
  const sepia = existing?.sepia ?? config.sepia ?? 0;

  const newBrightness = prompt(`Jasność dla ${domain}:`, brightness);
  const newContrast = prompt(`Kontrast dla ${domain}:`, contrast);
  const newSepia = prompt(`Sepia dla ${domain}:`, sepia);

  if (newBrightness !== null && newContrast !== null && newSepia !== null) {
    if (!config.perDomainSettings) {
      config.perDomainSettings = {};
    }
    config.perDomainSettings[domain] = {
      brightness: parseInt(newBrightness) || 0,
      contrast: parseInt(newContrast) || 100,
      sepia: parseInt(newSepia) || 0
    };
    Storage.saveConfig({ perDomainSettings: config.perDomainSettings });
    renderPerDomainList();
  }
}

/**
 * Edytuje ustawienia per-domena
 */
window.editPerDomain = function(domain) {
  document.getElementById('currentDomain').value = domain;
  showPerDomainDialog();
};

/**
 * Usuwa ustawienia per-domena
 */
window.removePerDomain = function(domain) {
  if (confirm(`Usunąć ustawienia dla ${domain}?`)) {
    delete config.perDomainSettings[domain];
    Storage.saveConfig({ perDomainSettings: config.perDomainSettings });
    renderPerDomainList();
  }
};

/**
 * Wyświetla dialog dla własnych CSS
 */
function showCustomCSSDialog() {
  const domain = document.getElementById('cssDomain').value.trim();
  if (!domain) {
    alert('Podaj domenę');
    return;
  }

  const existing = config.customCSS && config.customCSS[domain];
  document.getElementById('customCSS').value = existing || '';

  // Zapisz przy zmianie
  document.getElementById('customCSS').addEventListener('input', function() {
    if (!config.customCSS) {
      config.customCSS = {};
    }
    config.customCSS[domain] = this.value;
    Storage.saveConfig({ customCSS: config.customCSS });
  }, { once: false });
}

/**
 * Edytuje własne CSS
 */
window.editCustomCSS = function(domain) {
  document.getElementById('cssDomain').value = domain;
  document.getElementById('customCSS').value = config.customCSS[domain] || '';
  showCustomCSSDialog();
};

/**
 * Usuwa własne CSS
 */
window.removeCustomCSS = function(domain) {
  if (confirm(`Usunąć CSS dla ${domain}?`)) {
    delete config.customCSS[domain];
    Storage.saveConfig({ customCSS: config.customCSS });
    renderCustomCSSList();
    document.getElementById('customCSS').value = '';
  }
};

/**
 * Renderuje listę presetów
 */
function renderPresetsList() {
  const listEl = document.getElementById('presetsList');
  if (!listEl) return;
  
  listEl.innerHTML = '';

  if (typeof Presets === 'undefined') {
    listEl.innerHTML = '<p style="color: #666; font-size: 13px;">Ładowanie presetów...</p>';
    return;
  }

  Presets.getAll().then(presets => {
    if (!presets || Object.keys(presets).length === 0) {
      listEl.innerHTML = '<p style="color: #666; font-size: 13px;">Brak zapisanych presetów</p>';
      return;
    }

    Object.keys(presets).forEach(name => {
      const item = document.createElement('div');
      item.className = 'per-domain-item';
      item.innerHTML = `
        <div>
          <div class="domain-name">${name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">
            Jasność: ${presets[name].brightness || 0}, Kontrast: ${presets[name].contrast || 100}, 
            Sepia: ${presets[name].sepia || 0}, Nasycenie: ${presets[name].saturation || 100}
          </div>
        </div>
        <div class="domain-actions">
          <button class="btn btn-secondary btn-small" onclick="applyPresetFromOptions('${name}')">Zastosuj</button>
          <button class="btn btn-danger btn-small" onclick="deletePreset('${name}')">Usuń</button>
        </div>
      `;
      listEl.appendChild(item);
    });
  }).catch(error => {
    console.error('Błąd renderowania presetów:', error);
    listEl.innerHTML = '<p style="color: #f44336; font-size: 13px;">Błąd ładowania presetów</p>';
  });
}

/**
 * Zapisuje preset z aktualnych ustawień
 */
async function savePresetFromCurrent() {
  const name = document.getElementById('presetName').value.trim();
  if (!name) {
    showStatus('Podaj nazwę presetu', 'error');
    return;
  }

  try {
    if (typeof Presets === 'undefined') {
      showStatus('System presetów nie jest dostępny', 'error');
      return;
    }

    const currentSettings = {
      brightness: parseInt(document.getElementById('brightness').value) || 0,
      contrast: parseInt(document.getElementById('contrast').value) || 100,
      sepia: parseInt(document.getElementById('sepia').value) || 0,
      saturation: parseInt(document.getElementById('saturation').value) || 100,
      hueRotate: parseInt(document.getElementById('hueRotate').value) || 0,
      grayscale: parseInt(document.getElementById('grayscale').value) || 0
    };

    await Presets.save(name, currentSettings);
    document.getElementById('presetName').value = '';
    renderPresetsList();
    showStatus(`Preset "${name}" zapisany pomyślnie!`, 'success');
  } catch (error) {
    console.error('Błąd zapisywania presetu:', error);
    showStatus('Błąd zapisywania presetu', 'error');
  }
}

/**
 * Zastosowuje preset z opcji
 */
window.applyPresetFromOptions = async function(name) {
  try {
    if (typeof Presets === 'undefined') {
      showStatus('System presetów nie jest dostępny', 'error');
      return;
    }

    await Presets.apply(name);
    await loadConfig();
    populateForm();
    renderPresetsList();
    showStatus(`Preset "${name}" zastosowany!`, 'success');
  } catch (error) {
    console.error('Błąd zastosowania presetu:', error);
    showStatus('Błąd zastosowania presetu', 'error');
  }
};

/**
 * Usuwa preset
 */
window.deletePreset = async function(name) {
  if (!confirm(`Usunąć preset "${name}"?`)) {
    return;
  }

  try {
    if (typeof Presets === 'undefined') {
      showStatus('System presetów nie jest dostępny', 'error');
      return;
    }

    await Presets.delete(name);
    renderPresetsList();
    showStatus(`Preset "${name}" usunięty`, 'success');
  } catch (error) {
    console.error('Błąd usuwania presetu:', error);
    showStatus('Błąd usuwania presetu', 'error');
  }
};

/**
 * Eksportuje ustawienia do pliku JSON
 */
async function exportSettings() {
  try {
    const allConfig = await Storage.getConfig();
    
    // Przygotuj dane do eksportu (bez wrażliwych danych)
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      settings: {
        brightness: allConfig.brightness || 0,
        contrast: allConfig.contrast || 100,
        sepia: allConfig.sepia || 0,
        saturation: allConfig.saturation || 100,
        hueRotate: allConfig.hueRotate || 0,
        grayscale: allConfig.grayscale || 0,
        visibleSliders: allConfig.visibleSliders || Storage.defaults.visibleSliders,
        automation: allConfig.automation || Storage.defaults.automation,
        whitelist: allConfig.whitelist || [],
        blacklist: allConfig.blacklist || [],
        perDomainSettings: allConfig.perDomainSettings || {},
        customCSS: allConfig.customCSS || {},
        renderEngine: allConfig.renderEngine || 'filter',
        presets: allConfig.presets || Storage.defaults.presets
      }
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `comet-dark-mode-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Ustawienia wyeksportowane pomyślnie!', 'success');
  } catch (error) {
    console.error('Błąd eksportu:', error);
    showStatus('Błąd eksportu ustawień', 'error');
  }
}

/**
 * Importuje ustawienia z pliku JSON
 */
async function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    if (!importData.settings) {
      showStatus('Nieprawidłowy format pliku', 'error');
      return;
    }

    if (!confirm('Zaimportować ustawienia? Zastąpi to obecne ustawienia.')) {
      event.target.value = ''; // Reset input
      return;
    }

    const settings = importData.settings;
    
    // Zaktualizuj konfigurację
    await Storage.saveConfig({
      brightness: settings.brightness ?? Storage.defaults.brightness,
      contrast: settings.contrast ?? Storage.defaults.contrast,
      sepia: settings.sepia ?? Storage.defaults.sepia,
      saturation: settings.saturation ?? Storage.defaults.saturation,
      hueRotate: settings.hueRotate ?? Storage.defaults.hueRotate,
      grayscale: settings.grayscale ?? Storage.defaults.grayscale,
      visibleSliders: settings.visibleSliders || Storage.defaults.visibleSliders,
      automation: settings.automation || Storage.defaults.automation,
      whitelist: settings.whitelist || [],
      blacklist: settings.blacklist || [],
      perDomainSettings: settings.perDomainSettings || {},
      customCSS: settings.customCSS || {},
      renderEngine: settings.renderEngine || 'filter',
      presets: settings.presets || Storage.defaults.presets
    });

    // Przeładuj konfigurację i formularz
    await loadConfig();
    populateForm();
    renderPresetsList();
    
    // Powiadom wszystkie karty
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
      }
    });

    event.target.value = ''; // Reset input
    showStatus('Ustawienia zaimportowane pomyślnie!', 'success');
  } catch (error) {
    console.error('Błąd importu:', error);
    showStatus('Błąd importu ustawień: ' + error.message, 'error');
    event.target.value = ''; // Reset input
  }
}

