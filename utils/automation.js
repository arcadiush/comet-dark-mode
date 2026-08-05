/**
 * System automatyzacji dla trybu ciemnego
 */

const Automation = {
  /**
   * Wykrywa preferencje systemowe (jasny/ciemny tryb)
   * @returns {Promise<boolean>} true jeśli system jest w trybie ciemnym
   */
  async detectSystemPreference() {
    return new Promise((resolve) => {
      // W background worker nie mamy dostępu do window.matchMedia
      // Używamy chrome.tabs.query do sprawdzenia preferencji
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        resolve(mediaQuery.matches);
        
        // Nasłuchuj zmian
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', (e) => {
            this.onSystemPreferenceChange(e.matches);
          });
        } else {
          // Fallback dla starszych przeglądarek
          mediaQuery.addListener((e) => {
            this.onSystemPreferenceChange(e.matches);
          });
        }
      } else {
        // Dla background worker - zwracamy false jako domyślne
        resolve(false);
      }
    });
  },

  /**
   * Wywoływane gdy zmienia się preferencja systemowa
   * @param {boolean} isDark - Czy system jest w trybie ciemnym
   */
  async onSystemPreferenceChange(isDark) {
    // Importujemy storage dynamicznie jeśli potrzebne
    if (typeof Storage !== 'undefined') {
      const config = await Storage.getConfig();
      if (config.automation.type === 'system') {
        await Storage.set({ enabled: isDark });
        // Powiadom wszystkie karty o zmianie
        this.notifyAllTabs();
      }
    }
  },

  /**
   * Oblicza czas zachodu słońca dla danej lokalizacji
   * @param {number} latitude - Szerokość geograficzna
   * @param {number} longitude - Długość geograficzna
   * @param {Date} date - Data (domyślnie dzisiaj)
   * @returns {Date} Czas zachodu słońca
   */
  calculateSunset(latitude, longitude, date = new Date()) {
    // Uproszczony algorytm obliczania zachodu słońca
    // Bazuje na równaniu czasu słonecznego
    
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180));
    const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15 - (longitude / 15) - (date.getTimezoneOffset() / 60);
    
    const sunset = new Date(date);
    sunset.setHours(Math.floor(sunsetHour), Math.round((sunsetHour % 1) * 60), 0, 0);
    
    return sunset;
  },

  /**
   * Sprawdza czy aktualnie jest czas na tryb ciemny (na podstawie geolokalizacji)
   * @param {number} latitude - Szerokość geograficzna
   * @param {number} longitude - Długość geograficzna
   * @returns {Promise<boolean>} true jeśli powinien być włączony tryb ciemny
   */
  async shouldEnableByGeolocation(latitude, longitude) {
    if (!latitude || !longitude) {
      return false;
    }

    const now = new Date();
    const sunset = this.calculateSunset(latitude, longitude, now);
    const sunrise = this.calculateSunrise(latitude, longitude, now);

    // Jeśli aktualna godzina jest po zachodzie lub przed wschodem
    return now >= sunset || now < sunrise;
  },

  /**
   * Oblicza czas wschodu słońca
   * @param {number} latitude - Szerokość geograficzna
   * @param {number} longitude - Długość geograficzna
   * @param {Date} date - Data
   * @returns {Date} Czas wschodu słońca
   */
  calculateSunrise(latitude, longitude, date = new Date()) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180));
    const sunriseHour = 12 - (hourAngle * 180 / Math.PI) / 15 - (longitude / 15) - (date.getTimezoneOffset() / 60);
    
    const sunrise = new Date(date);
    sunrise.setHours(Math.floor(sunriseHour), Math.round((sunriseHour % 1) * 60), 0, 0);
    
    return sunrise;
  },

  /**
   * Sprawdza czy aktualnie jest czas na tryb ciemny (na podstawie harmonogramu)
   * @param {string} startTime - Godzina rozpoczęcia (format HH:MM)
   * @param {string} endTime - Godzina zakończenia (format HH:MM)
   * @returns {boolean} true jeśli powinien być włączony tryb ciemny
   */
  shouldEnableBySchedule(startTime, endTime) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Jeśli zakres przekracza północ (np. 20:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime < endMinutes;
    } else {
      return currentTime >= startMinutes && currentTime < endMinutes;
    }
  },

  /**
   * Powiadamia wszystkie karty o zmianie stanu
   */
  async notifyAllTabs() {
    if (chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'configChanged' }).catch(() => {
            // Ignoruj błędy (karta może nie mieć content script)
          });
        }
      });
    }
  },

  /**
   * Ustawia alarm dla harmonogramu
   * @param {string} name - Nazwa alarmu
   * @param {Date} when - Kiedy ma się wykonać
   */
  async setAlarm(name, when) {
    if (chrome.alarms && chrome.alarms.create) {
      chrome.alarms.create(name, { when: when.getTime() });
    }
  },

  /**
   * Usuwa alarm
   * @param {string} name - Nazwa alarmu
   */
  async clearAlarm(name) {
    if (chrome.alarms && chrome.alarms.clear) {
      chrome.alarms.clear(name);
    }
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Automation;
}

