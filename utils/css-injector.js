/**
 * Narzędzie do bezpiecznego wstrzykiwania CSS do stron
 */

const CSSInjector = {
  /**
   * ID dla style tagów wtyczki
   */
  STYLE_ID_PREFIX: 'comet-dark-mode-',
  CUSTOM_CSS_ID: 'comet-custom-css',

  /**
   * Wstrzykuje CSS do dokumentu
   * @param {string} css - Kod CSS do wstrzyknięcia
   * @param {string} id - Unikalny ID dla style tagu
   * @returns {HTMLElement} Element style
   */
  inject(css, id) {
    // Usuń istniejący style tag jeśli istnieje
    this.remove(id);

    const style = document.createElement('style');
    style.id = this.STYLE_ID_PREFIX + id;
    style.textContent = css;

    // Wstrzyknij na początku head dla priorytetu
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }

    return style;
  },

  /**
   * Usuwa style tag o podanym ID
   * @param {string} id - ID style tagu
   */
  remove(id) {
    const styleId = this.STYLE_ID_PREFIX + id;
    const existing = document.getElementById(styleId);
    if (existing) {
      existing.remove();
    }
  },

  /**
   * Wstrzykuje własne CSS użytkownika dla domeny
   * @param {string} domain - Domenę
   * @param {string} css - Kod CSS
   */
  injectCustomCSS(domain, css) {
    if (!css || !css.trim()) {
      this.removeCustomCSS();
      return;
    }

    // Usuń istniejący
    this.removeCustomCSS();

    const style = document.createElement('style');
    style.id = this.CUSTOM_CSS_ID;
    style.textContent = css;

    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  },

  /**
   * Usuwa własne CSS użytkownika
   */
  removeCustomCSS() {
    const existing = document.getElementById(this.CUSTOM_CSS_ID);
    if (existing) {
      existing.remove();
    }
  },

  /**
   * Usuwa wszystkie style tagi wtyczki
   */
  removeAll() {
    const styles = document.querySelectorAll(`[id^="${this.STYLE_ID_PREFIX}"], #${this.CUSTOM_CSS_ID}`);
    styles.forEach(style => style.remove());
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSSInjector;
}

