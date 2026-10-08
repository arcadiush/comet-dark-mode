/**
 * Silnik trybu ciemnego - filtr CSS (inwersja) na elemencie html
 */

const DarkModeEngine = {
  styleId: 'comet-dark-mode-style',

  /**
   * Inicjalizuje silnik trybu ciemnego
   * @param {object} config - Konfiguracja (brightness, contrast, sepia,
   *   saturation, hueRotate, grayscale)
   */
  init(config = {}) {
    this.config = {
      brightness: config.brightness ?? 0,
      contrast: config.contrast ?? 100,
      sepia: config.sepia ?? 0,
      saturation: config.saturation ?? 100,
      hueRotate: config.hueRotate ?? 0,
      grayscale: config.grayscale ?? 0
    };
  },

  /**
   * Włącza tryb ciemny
   */
  enable() {
    this.enableFilterMode();
  },

  /**
   * Wyłącza tryb ciemny
   */
  disable() {
    this.removeStyle();
  },

  /**
   * Aktualizuje konfigurację
   * @param {object} config - Nowa konfiguracja
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    // Zawsze aktualizuj style jeśli są włączone (sprawdź czy style istnieją)
    const wasEnabled = this.isEnabled();
    if (wasEnabled) {
      // Wywołaj enable() który zaktualizuje style z nową konfiguracją
      // enable() najpierw usuwa stare style, potem wstrzykuje nowe
      this.enable();
    }
  },

  /**
   * Sprawdza czy tryb ciemny jest włączony
   * @returns {boolean}
   */
  isEnabled() {
    const style = document.getElementById(this.styleId);
    return style !== null;
  },

  /**
   * Buduje wartość właściwości `filter` na podstawie aktualnej konfiguracji.
   * @returns {string} Wartość dla CSS `filter`
   */
  buildFilterValue() {
    const brightness = 100 - (this.config.brightness ?? 0);
    const contrast = this.config.contrast ?? 100;
    const sepia = this.config.sepia ?? 0;
    const saturation = this.config.saturation ?? 100;
    const hueRotate = this.config.hueRotate ?? 0;
    const grayscale = this.config.grayscale ?? 0;

    // Kolejność filtrów jest ważna - niektóre filtry muszą być przed invert
    let filterValue = '';

    // Grayscale na początku (przed inwersją)
    if (grayscale > 0) {
      filterValue += ` grayscale(${grayscale}%)`;
    }

    // Inwersja z domyślnym hue-rotate 180deg
    filterValue += ` invert(1) hue-rotate(180deg)`;

    // Dodatkowy hue-rotate (dodatkowy obrót po inwersji)
    if (hueRotate !== 0) {
      filterValue += ` hue-rotate(${hueRotate}deg)`;
    }

    // Saturation - zawsze dodaj, nawet jeśli 100% (może być zmieniane dynamicznie)
    filterValue += ` saturate(${saturation}%)`;

    // Brightness
    if (brightness !== 100) {
      filterValue += ` brightness(${brightness}%)`;
    }

    // Contrast
    if (contrast !== 100) {
      filterValue += ` contrast(${contrast}%)`;
    }

    // Sepia
    if (sepia > 0) {
      filterValue += ` sepia(${sepia}%)`;
    }

    return filterValue.trim();
  },

  /**
   * Włącza tryb "Filtr"
   */
  enableFilterMode() {
    const filterValue = this.buildFilterValue();

    console.log('[DarkModeEngine] Wygenerowany filtr CSS:', filterValue);

    const css = `
      html {
        filter: ${filterValue} !important;
      }
      /* Wyklucz obrazy, wideo i iframe */
      img, video, iframe, embed, object, canvas, svg,
      [style*="background-image"], [style*="background: url"],
      [style*="background-image: url"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      /* Wyklucz elementy z przezroczystością */
      [style*="opacity"] {
        filter: ${filterValue} !important;
      }
    `;

    this.injectStyle(css);
  },

  /**
   * Wstrzykuje style CSS do dokumentu
   * @param {string} css - Kod CSS
   */
  injectStyle(css) {
    // Przy document_start <head> jeszcze nie istnieje - wtedy wstawiamy do <html>
    const head = document.head || document.documentElement;
    if (!head) {
      console.error('[DarkModeEngine] Brak elementu head!');
      return;
    }

    // Sprawdź czy style już istnieją
    let style = document.getElementById(this.styleId);
    
    if (style) {
      // Aktualizuj istniejący element style
      console.log('[DarkModeEngine] Aktualizuję istniejący element style');
      style.textContent = css;
    } else {
      // Utwórz nowy element style
      console.log('[DarkModeEngine] Tworzę nowy element style');
      style = document.createElement('style');
      style.id = this.styleId;
      style.textContent = css;

      // Wstrzyknij na początku head dla priorytetu
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    }

    // Sprawdź czy style zostały wstrzyknięte/aktualizowane
    const injected = document.getElementById(this.styleId);
    if (injected) {
      console.log('[DarkModeEngine] Style wstrzyknięte/aktualizowane pomyślnie, długość CSS:', css.length);
      
      // Wymuś ponowne obliczenie stylów
      // To może pomóc w niektórych przypadkach gdy przeglądarka nie aktualizuje wizualnie
      if (document.documentElement) {
        // Trigger reflow
        void document.documentElement.offsetHeight;
        
        // Sprawdź computed style na html
        const htmlStyle = window.getComputedStyle(document.documentElement);
        const filterValue = htmlStyle.filter;
        console.log('[DarkModeEngine] Aktualny filtr na html:', filterValue);
        
        // Jeśli filtr nie jest zastosowany, spróbuj bezpośrednio
        if (!filterValue || filterValue === 'none') {
          console.warn('[DarkModeEngine] Filtr nie jest zastosowany w computed style, próbuję bezpośrednio');
          // Wyciągnij wartość filtra z CSS
          const filterMatch = css.match(/html\s*\{[^}]*filter:\s*([^!;]+)/);
          if (filterMatch && filterMatch[1]) {
            const filterValueFromCSS = filterMatch[1].trim();
            console.log('[DarkModeEngine] Ustawiam filtr bezpośrednio:', filterValueFromCSS);
            document.documentElement.style.setProperty('filter', filterValueFromCSS, 'important');
          }
        }
      }
    } else {
      console.error('[DarkModeEngine] Style NIE zostały wstrzyknięte!');
    }
  },

  /**
   * Usuwa style trybu ciemnego
   * @returns {boolean} true jeśli style zostały usunięte
   */
  removeStyle() {
    const style = document.getElementById(this.styleId);
    if (style) {
      style.remove();
      return true;
    }
    return false;
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DarkModeEngine;
}

