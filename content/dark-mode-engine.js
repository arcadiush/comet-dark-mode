/**
 * Silnik trybu ciemnego - obsługuje tryb "Filtr" i "Analiza"
 */

const DarkModeEngine = {
  currentEngine: null,
  styleId: 'comet-dark-mode-style',
  cache: new Map(),

  /**
   * Inicjalizuje silnik trybu ciemnego
   * @param {string} engineType - Typ silnika: 'filter' lub 'analyze'
   * @param {object} config - Konfiguracja (brightness, contrast, sepia,
   *   saturation, hueRotate, grayscale)
   */
  init(engineType, config = {}) {
    this.currentEngine = engineType;
    this.config = {
      brightness: config.brightness ?? 0,
      contrast: config.contrast ?? 100,
      sepia: config.sepia ?? 0,
      saturation: config.saturation ?? 100,
      hueRotate: config.hueRotate ?? 0,
      grayscale: config.grayscale ?? 0
    };

    if (engineType === 'filter') {
      this.initFilterMode();
    } else if (engineType === 'analyze') {
      this.initAnalyzeMode();
    }
  },

  /**
   * Włącza tryb ciemny
   */
  enable() {
    if (this.currentEngine === 'filter') {
      this.enableFilterMode();
    } else if (this.currentEngine === 'analyze') {
      this.enableAnalyzeMode();
    }
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
   * Inicjalizuje tryb "Filtr" (szybki)
   */
  initFilterMode() {
    // Tryb filtr jest gotowy do użycia
  },

  /**
   * Buduje wartość właściwości `filter` na podstawie aktualnej konfiguracji.
   * Wspólne dla trybu "Filtr" i "Analiza", aby oba respektowały te same suwaki.
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
   * Inicjalizuje tryb "Analiza" (dokładny)
   */
  initAnalyzeMode() {
    // Lazy loading - analiza będzie wykonana przy pierwszym włączeniu
  },

  /**
   * Włącza tryb "Analiza"
   */
  enableAnalyzeMode() {
    // Użyj cache jeśli dostępny
    // Klucz zawiera filtr, by zmiana suwaków nie zwracała starego CSS z cache
    const cacheKey = `${window.location.href}|${this.buildFilterValue()}`;
    if (this.cache.has(cacheKey)) {
      const cachedCSS = this.cache.get(cacheKey);
      this.injectStyle(cachedCSS);
      return;
    }

    // Analizuj i generuj CSS
    const css = this.analyzeAndGenerateCSS();
    this.cache.set(cacheKey, css);
    this.injectStyle(css);
  },

  /**
   * Analizuje stronę i generuje dedykowane reguły CSS
   * @returns {string} Wygenerowany CSS
   */
  analyzeAndGenerateCSS() {
    const rules = [];

    // Ten sam zestaw filtrów co tryb "Filtr" - respektuje wszystkie suwaki
    // (jasność, kontrast, sepia, nasycenie, obrót odcienia, szarość).
    const filterValue = this.buildFilterValue();

    rules.push(`html { filter: ${filterValue} !important; }`);

    // UWAGA: mimo nazwy "Analiza", tryb ten nie wykonuje jeszcze realnej analizy
    // CSS per-element - używa filtra na html dla wydajności. Jedyną przewagą nad
    // trybem "Filtr" jest cache CSS per URL (patrz enableAnalyzeMode). Realna
    // analiza (generowanie dedykowanych reguł) pozostaje do zaimplementowania.

    // Dodaj wykluczenia dla obrazów, wideo, iframe
    rules.push(`
      img, video, iframe, embed, object, canvas, svg,
      [style*="background-image"], [style*="background: url"],
      [style*="background-image: url"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `);

    // Elementy z przezroczystością - jak w trybie "Filtr"
    rules.push(`
      [style*="opacity"] {
        filter: ${filterValue} !important;
      }
    `);

    return rules.join('\n');
  },

  /**
   * Generuje selektor CSS dla elementu
   * @param {HTMLElement} el - Element
   * @returns {string|null} Selektor CSS
   */
  getElementSelector(el) {
    if (el.id) {
      return `#${el.id}`;
    }
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c).join('.');
      if (classes) {
        return `${el.tagName.toLowerCase()}.${classes}`;
      }
    }
    return el.tagName.toLowerCase();
  },

  /**
   * Wstrzykuje style CSS do dokumentu
   * @param {string} css - Kod CSS
   */
  injectStyle(css) {
    const head = document.head || document.getElementsByTagName('head')[0];
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
  },

  /**
   * Czyści cache (przydatne przy zmianie strony)
   */
  clearCache() {
    this.cache.clear();
  },

  /**
   * Obsługuje dynamiczne zmiany treści (dla infinite scroll)
   */
  handleDynamicContent() {
    // W trybie analizy, nowe elementy będą automatycznie obsłużone przez filtr na html
    // W razie potrzeby można dodać MutationObserver
  }
};

// Eksport dla modułów ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DarkModeEngine;
}

