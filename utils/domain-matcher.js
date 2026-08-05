/**
 * Narzędzie do dopasowywania domen dla whitelist i blacklist
 */

const DomainMatcher = {
  /**
   * Normalizuje domenę (usuwa protokół, ścieżkę, parametry)
   * @param {string} domain - Domenę do normalizacji
   * @returns {string} Znormalizowana domena
   */
  normalize(domain) {
    try {
      // Usuń protokół jeśli istnieje
      domain = domain.replace(/^https?:\/\//, '');
      // Usuń ścieżkę i parametry
      domain = domain.split('/')[0];
      // Usuń port jeśli istnieje
      domain = domain.split(':')[0];
      // Usuń www. jeśli istnieje (opcjonalnie)
      domain = domain.replace(/^www\./, '');
      return domain.toLowerCase().trim();
    } catch (e) {
      return domain.toLowerCase().trim();
    }
  },

  /**
   * Parsuje listę domen z tekstu (rozdzielone przecinkami lub nowymi liniami)
   * @param {string} text - Tekst z domenami
   * @returns {string[]} Tablica znormalizowanych domen
   */
  parseList(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return text
      .split(/[,\n]/)
      .map(domain => this.normalize(domain))
      .filter(domain => domain.length > 0);
  },

  /**
   * Sprawdza czy domena pasuje do wzorca (obsługuje wildcards)
   * @param {string} pattern - Wzorzec domeny (może zawierać *)
   * @param {string} domain - Domenę do sprawdzenia
   * @returns {boolean} true jeśli pasuje
   */
  matchesPattern(pattern, domain) {
    const normalizedPattern = this.normalize(pattern);
    const normalizedDomain = this.normalize(domain);

    // Dokładne dopasowanie
    if (normalizedPattern === normalizedDomain) {
      return true;
    }

    // Wildcard na początku (np. *.example.com)
    if (normalizedPattern.startsWith('*.')) {
      const baseDomain = normalizedPattern.substring(2);
      return normalizedDomain === baseDomain || normalizedDomain.endsWith('.' + baseDomain);
    }

    // Wildcard na końcu (np. example.*)
    if (normalizedPattern.endsWith('.*')) {
      const baseDomain = normalizedPattern.substring(0, normalizedPattern.length - 2);
      return normalizedDomain.startsWith(baseDomain + '.');
    }

    return false;
  },

  /**
   * Sprawdza czy domena jest na liście
   * @param {string[]} list - Lista domen/wzorców
   * @param {string} domain - Domenę do sprawdzenia
   * @returns {boolean} true jeśli domena jest na liście
   */
  isInList(list, domain) {
    if (!Array.isArray(list) || list.length === 0) {
      return false;
    }

    const normalizedDomain = this.normalize(domain);

    return list.some(pattern => {
      const normalizedPattern = this.normalize(pattern);
      return this.matchesPattern(normalizedPattern, normalizedDomain);
    });
  },

  /**
   * Pobiera aktualną domenę z URL
   * @param {string} url - URL strony
   * @returns {string} Domenę
   */
  getDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return this.normalize(urlObj.hostname);
    } catch (e) {
      return '';
    }
  },

  /**
   * Sprawdza czy domena jest na whitelist (wyłączona)
   * @param {string[]} whitelist - Lista domen wyłączonych
   * @param {string} domain - Domenę do sprawdzenia
   * @returns {boolean} true jeśli domena jest wyłączona
   */
  isWhitelisted(whitelist, domain) {
    return this.isInList(whitelist, domain);
  },

  /**
   * Sprawdza czy domena jest na blacklist (zawsze włączona)
   * @param {string[]} blacklist - Lista domen zawsze włączonych
   * @param {string} domain - Domenę do sprawdzenia
   * @returns {boolean} true jeśli domena jest zawsze włączona
   */
  isBlacklisted(blacklist, domain) {
    return this.isInList(blacklist, domain);
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DomainMatcher;
}

