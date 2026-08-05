/**
 * System zarządzania presetami dla Comet Dark Mode
 */

const Presets = {
  /**
   * Pobiera wszystkie presety
   * @returns {Promise<object>} Obiekt z presetami
   */
  async getAll() {
    const data = await Storage.getConfig();
    return data.presets || Storage.defaults.presets;
  },

  /**
   * Zapisuje presety
   * @param {object} presets - Obiekt z presetami
   * @returns {Promise<void>}
   */
  async saveAll(presets) {
    await Storage.saveConfig({ presets });
  },

  /**
   * Pobiera preset po nazwie
   * @param {string} name - Nazwa presetu
   * @returns {Promise<object|null>} Preset lub null
   */
  async get(name) {
    const presets = await this.getAll();
    return presets[name] || null;
  },

  /**
   * Zapisuje lub aktualizuje preset
   * @param {string} name - Nazwa presetu
   * @param {object} settings - Ustawienia presetu
   * @returns {Promise<void>}
   */
  async save(name, settings) {
    const presets = await this.getAll();
    presets[name] = {
      brightness: settings.brightness || 0,
      contrast: settings.contrast || 100,
      sepia: settings.sepia || 0,
      saturation: settings.saturation || 100,
      hueRotate: settings.hueRotate || 0,
      grayscale: settings.grayscale || 0
    };
    await this.saveAll(presets);
  },

  /**
   * Usuwa preset
   * @param {string} name - Nazwa presetu
   * @returns {Promise<void>}
   */
  async delete(name) {
    const presets = await this.getAll();
    delete presets[name];
    await this.saveAll(presets);
  },

  /**
   * Zastosowuje preset (zapisuje jako aktualne ustawienia)
   * @param {string} name - Nazwa presetu
   * @returns {Promise<void>}
   */
  async apply(name) {
    const preset = await this.get(name);
    if (!preset) {
      throw new Error(`Preset "${name}" nie istnieje`);
    }

    // Zastosuj ustawienia presetu
    await Storage.saveConfig({
      brightness: preset.brightness,
      contrast: preset.contrast,
      sepia: preset.sepia,
      saturation: preset.saturation,
      hueRotate: preset.hueRotate,
      grayscale: preset.grayscale,
      currentPreset: name
    });

    // Powiadom wszystkie karty o zmianie
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {});
      }
    });
  },

  /**
   * Pobiera aktualny preset
   * @returns {Promise<string|null>} Nazwa aktualnego presetu lub null
   */
  async getCurrent() {
    const config = await Storage.getConfig();
    return config.currentPreset || null;
  },

  /**
   * Tworzy preset z aktualnych ustawień
   * @param {string} name - Nazwa presetu
   * @returns {Promise<void>}
   */
  async createFromCurrent(name) {
    const config = await Storage.getConfig();
    await this.save(name, {
      brightness: config.brightness || 0,
      contrast: config.contrast || 100,
      sepia: config.sepia || 0,
      saturation: config.saturation || 100,
      hueRotate: config.hueRotate || 0,
      grayscale: config.grayscale || 0
    });
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Presets;
}

