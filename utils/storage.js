/**
 * System przechowywania danych dla wtyczki Comet Dark Mode
 * Wrapper dla chrome.storage z fallback na local storage
 */

const Storage = {
  /**
   * Pobiera wartość z storage
   * @param {string|string[]|object} keys - Klucz(klucze) do pobrania
   * @returns {Promise<object>} Obiekt z wartościami
   */
  async get(keys) {
    return new Promise((resolve) => {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            // Fallback na local storage
            chrome.storage.local.get(keys, resolve);
          } else {
            resolve(result);
          }
        });
      } else if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, resolve);
      } else {
        resolve({});
      }
    });
  },

  /**
   * Zapisuje wartość do storage
   * @param {object} items - Obiekt z wartościami do zapisania
   * @returns {Promise<void>}
   */
  async set(items) {
    return new Promise((resolve, reject) => {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set(items, () => {
          if (chrome.runtime.lastError) {
            // Fallback na local storage
            chrome.storage.local.set(items, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      } else if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  },

  /**
   * Usuwa klucz(klucze) z storage
   * @param {string|string[]} keys - Klucz(klucze) do usunięcia
   * @returns {Promise<void>}
   */
  async remove(keys) {
    return new Promise((resolve) => {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.remove(keys, () => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.remove(keys, resolve);
          } else {
            resolve();
          }
        });
      } else if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(keys, resolve);
      } else {
        resolve();
      }
    });
  },

  /**
   * Pobiera wszystkie dane z storage
   * @returns {Promise<object>} Wszystkie dane
   */
  async getAll() {
    return this.get(null);
  },

  /**
   * Domyślne wartości konfiguracji
   */
  defaults: {
    enabled: false,
    brightness: 0,
    contrast: 100,
    sepia: 0,
    saturation: 100,
    hueRotate: 0,
    grayscale: 0,
    automation: {
      type: 'system', // 'system' | 'schedule' | 'geolocation'
      schedule: {
        enabled: false,
        startTime: '20:00',
        endTime: '08:00'
      },
      geolocation: {
        enabled: false,
        latitude: null,
        longitude: null
      }
    },
    whitelist: [],
    blacklist: [],
    perDomainSettings: {},
    customCSS: {},
    renderEngine: 'filter', // jedyny silnik; pole zostaje dla zgodności importu/eksportu
    visibleSliders: {
      brightness: true,
      contrast: true,
      sepia: true,
      saturation: true,
      hueRotate: true,
      grayscale: true
    },
    presets: {
      'Ciemny': {
        brightness: 0,
        contrast: 100,
        sepia: 0,
        saturation: 100,
        hueRotate: 0,
        grayscale: 0
      },
      'Ciepły': {
        brightness: 0,
        contrast: 100,
        sepia: 30,
        saturation: 100,
        hueRotate: -10,
        grayscale: 0
      },
      'Wysoki kontrast': {
        brightness: 0,
        contrast: 150,
        sepia: 0,
        saturation: 100,
        hueRotate: 0,
        grayscale: 0
      },
      'Delikatny': {
        brightness: 20,
        contrast: 90,
        sepia: 0,
        saturation: 100,
        hueRotate: 0,
        grayscale: 0
      },
      'Domyślny': {
        brightness: 0,
        contrast: 100,
        sepia: 0,
        saturation: 100,
        hueRotate: 0,
        grayscale: 0
      }
    },
    currentPreset: 'Domyślny'
  },

  /**
   * Pobiera konfigurację z domyślnymi wartościami
   * @returns {Promise<object>} Pełna konfiguracja
   */
  async getConfig() {
    const data = await this.getAll();
    return {
      ...this.defaults,
      ...data
    };
  },

  /**
   * Zapisuje konfigurację (tylko zmienione wartości)
   * @param {object} config - Konfiguracja do zapisania
   * @returns {Promise<void>}
   */
  async saveConfig(config) {
    await this.set(config);
  },

  /**
   * Resetuje konfigurację do domyślnych wartości
   * @returns {Promise<void>}
   */
  async reset() {
    await this.set(this.defaults);
  },

  /**
   * Nasłuchuje zmian w storage
   * @param {function} callback - Funkcja wywoływana przy zmianie
   */
  onChanged(callback) {
    if (chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' || areaName === 'local') {
          callback(changes, areaName);
        }
      });
    }
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}

