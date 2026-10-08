/**
 * Główny content script wstrzykiwany do stron
 */

// Importujemy moduły (w przeglądarce będą załadowane przez manifest)
// W rzeczywistości będą dostępne globalnie po załadowaniu

(function() {
  'use strict';

  // Sprawdź czy skrypt nie został już załadowany
  if (window.cometDarkModeLoaded) {
    return;
  }
  window.cometDarkModeLoaded = true;

  let config = null;
  let domain = '';
  let isEnabled = false;
  let observer = null;

  /**
   * Inicjalizuje wtyczkę na stronie
   */
  async function init() {
    try {
      console.log('[Comet Dark Mode] Inicjalizacja rozpoczęta');
      
      // Pobierz domenę
      domain = window.location.hostname;
      console.log('[Comet Dark Mode] Domenę:', domain);
      
      // Czekaj na gotowość DOM z retry
      await waitForDOM();
      
      // Sprawdź dostępność DarkModeEngine
      if (typeof DarkModeEngine === 'undefined') {
        console.warn('[Comet Dark Mode] DarkModeEngine nie jest dostępny, używam fallback');
      } else {
        console.log('[Comet Dark Mode] DarkModeEngine dostępny');
      }
      
      // Pobierz konfigurację
      await loadConfig();
      console.log('[Comet Dark Mode] Konfiguracja załadowana, enabled:', isEnabled);
      
      // WAŻNE: Sprawdź czy strona ma już domyślnie włączony tryb ciemny PRZED włączeniem wtyczki
      const hasNativeDarkMode = detectNativeDarkMode();
      
      // Sprawdź czy wtyczka powinna być aktywna dla tej domeny
      const shouldBeActive = shouldBeActiveForDomain();
      console.log('[Comet Dark Mode] Powinna być aktywna:', shouldBeActive);
      
      if (hasNativeDarkMode && shouldBeActive && isEnabled) {
        console.log('[Comet Dark Mode] Strona ma już domyślnie włączony tryb ciemny - pomijam włączenie wtyczki');
        // Wyświetl powiadomienie na stronie
        showPageNotification();
        // Wyślij wiadomość do popup o wykryciu trybu ciemnego
        chrome.runtime.sendMessage({
          action: 'nativeDarkModeDetected',
          domain: domain
        }).catch(() => {
          // Ignoruj błędy jeśli popup nie jest otwarty
        });
      } else if (shouldBeActive && isEnabled) {
        console.log('[Comet Dark Mode] Włączanie trybu ciemnego...');
        enableDarkMode();
        console.log('[Comet Dark Mode] Tryb ciemny włączony');
      } else {
        console.log('[Comet Dark Mode] Tryb ciemny wyłączony');
        disableDarkMode();
      }

      // Nasłuchuj zmian w storage
      setupStorageListener();

      // Obsługa dynamicznych zmian treści
      setupMutationObserver();
    } catch (error) {
      console.error('[Comet Dark Mode] Błąd inicjalizacji:', error);
      console.error(error.stack);
    }
  }

  /**
   * Czeka na gotowość DOM z retry mechanism
   */
  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.body || document.documentElement) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 sekund max
      const interval = setInterval(() => {
        attempts++;
        if (document.body || document.documentElement) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.warn('[Comet Dark Mode] DOM nie jest gotowy po 5 sekundach, kontynuuję...');
          resolve(); // Kontynuuj mimo wszystko
        }
      }, 100);
    });
  }

  /**
   * Ładuje konfigurację z storage
   */
  async function loadConfig() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(null, (data) => {
          if (chrome.runtime.lastError) {
            console.warn('[Comet Dark Mode] Błąd sync storage, używam local:', chrome.runtime.lastError);
            chrome.storage.local.get(null, (data) => {
              if (chrome.runtime.lastError) {
                console.error('[Comet Dark Mode] Błąd local storage:', chrome.runtime.lastError);
                // Użyj domyślnych wartości
                config = { enabled: false };
                isEnabled = false;
                resolve();
              } else {
                config = data;
                isEnabled = config.enabled || false;
                console.log('[Comet Dark Mode] Config z local storage:', config);
                resolve();
              }
            });
          } else {
            config = data;
            isEnabled = config.enabled || false;
            console.log('[Comet Dark Mode] Config z sync storage:', config);
            resolve();
          }
        });
      } catch (error) {
        console.error('[Comet Dark Mode] Błąd w loadConfig():', error);
        config = { enabled: false };
        isEnabled = false;
        resolve(); // Nie reject, żeby wtyczka działała mimo błędu
      }
    });
  }

  /**
   * Sprawdza czy wtyczka powinna być aktywna dla aktualnej domeny
   * @returns {boolean}
   */
  function shouldBeActiveForDomain() {
    if (!config) return false;

    // Sprawdź blacklist (zawsze włączona)
    if (config.blacklist && Array.isArray(config.blacklist)) {
      if (isDomainInList(config.blacklist, domain)) {
        return true;
      }
    }

    // Sprawdź whitelist (zawsze wyłączona)
    if (config.whitelist && Array.isArray(config.whitelist)) {
      if (isDomainInList(config.whitelist, domain)) {
        return false;
      }
    }

    // Zwróć globalny stan
    return isEnabled;
  }

  /**
   * Sprawdza czy domena jest na liście
   * @param {string[]} list - Lista domen
   * @param {string} domain - Domenę do sprawdzenia
   * @returns {boolean}
   */
  function isDomainInList(list, domain) {
    if (!Array.isArray(list) || list.length === 0) {
      return false;
    }

    const normalizedDomain = normalizeDomain(domain);
    
    return list.some(pattern => {
      const normalizedPattern = normalizeDomain(pattern);
      
      // Dokładne dopasowanie
      if (normalizedPattern === normalizedDomain) {
        return true;
      }
      
      // Wildcard na początku
      if (normalizedPattern.startsWith('*.')) {
        const baseDomain = normalizedPattern.substring(2);
        return normalizedDomain === baseDomain || normalizedDomain.endsWith('.' + baseDomain);
      }
      
      return false;
    });
  }

  /**
   * Normalizuje domenę
   * @param {string} domain - Domenę
   * @returns {string} Znormalizowana domena
   */
  function normalizeDomain(domain) {
    return domain.toLowerCase().replace(/^www\./, '').trim();
  }

  /**
   * Wykrywa czy strona ma już domyślnie włączony tryb ciemny
   * @returns {boolean} true jeśli strona ma już tryb ciemny
   */
  function detectNativeDarkMode() {
    try {
      // 1. Sprawdź media query prefers-color-scheme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // To nie wystarczy - to tylko preferencja systemowa, nie stan strony
        // Ale sprawdzimy też inne rzeczy
      }

      // 2. Sprawdź meta tag color-scheme
      const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
      if (colorSchemeMeta && colorSchemeMeta.content) {
        const schemes = colorSchemeMeta.content.toLowerCase().split(/\s+/);
        if (schemes.includes('dark') && !schemes.includes('light')) {
          console.log('[Comet Dark Mode] Wykryto tryb ciemny przez meta color-scheme');
          return true;
        }
      }

      // 3. Sprawdź style color-scheme na html
      const htmlStyle = window.getComputedStyle(document.documentElement);
      const colorScheme = htmlStyle.colorScheme;
      if (colorScheme && colorScheme.includes('dark') && !colorScheme.includes('light')) {
        console.log('[Comet Dark Mode] Wykryto tryb ciemny przez CSS color-scheme');
        return true;
      }

      // 4. Sprawdź klasy CSS na html/body
      const htmlClasses = document.documentElement.className.toLowerCase();
      const bodyClasses = document.body ? document.body.className.toLowerCase() : '';
      const darkClasses = ['dark', 'dark-mode', 'theme-dark', 'dark-theme', 'night-mode', 'nightmode'];
      const hasDarkClass = darkClasses.some(cls => 
        htmlClasses.includes(cls) || bodyClasses.includes(cls)
      );
      if (hasDarkClass) {
        console.log('[Comet Dark Mode] Wykryto tryb ciemny przez klasę CSS');
        return true;
      }

      // 5. Sprawdź atrybut data-theme lub data-color-mode (używany przez GitHub, itp.)
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      const htmlColorMode = document.documentElement.getAttribute('data-color-mode');
      if (htmlTheme === 'dark' || htmlColorMode === 'dark') {
        console.log('[Comet Dark Mode] Wykryto tryb ciemny przez atrybut data-theme/data-color-mode');
        return true;
      }

      // 6. Sprawdź kolor tła TYLKO jeśli nie ma naszego stylu (czyli przed włączeniem wtyczki)
      // i tylko jako ostatnia deska ratunku
      const ourStyle = document.getElementById('comet-dark-mode-style');
      if (!ourStyle) {
        const bodyBg = window.getComputedStyle(document.body || document.documentElement).backgroundColor;
        const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
        
        // Parsuj kolor RGB(A) i sprawdź czy jest ciemny
        const parseRGB = (rgb) => {
          const match = rgb.match(/[\d.]+/g);
          if (match && match.length >= 3) {
            return {
              r: parseInt(match[0]),
              g: parseInt(match[1]),
              b: parseInt(match[2]),
              a: match.length >= 4 ? parseFloat(match[3]) : 1
            };
          }
          return null;
        };

        const bodyColor = parseRGB(bodyBg);
        const htmlColor = parseRGB(htmlBg);

        // Jeśli tło jest ciemne (średnia RGB < 100 - bardziej restrykcyjne), prawdopodobnie strona ma tryb ciemny
        const isDarkBackground = (color) => {
          if (!color) return false;
          // Przezroczyste tło (alpha 0) to BRAK tła - biel pochodzi z elementu pod spodem.
          // Bez tego rgba(0,0,0,0) było błędnie uznawane za czarne tło.
          if (color.a === 0) return false;
          const avg = (color.r + color.g + color.b) / 3;
          return avg < 100; // Bardziej restrykcyjne niż 128
        };

        // Sprawdź tylko jeśli oba (body i html) mają ciemne tło - to zwiększa pewność
        if (bodyColor && htmlColor && isDarkBackground(bodyColor) && isDarkBackground(htmlColor)) {
          console.log('[Comet Dark Mode] Wykryto tryb ciemny przez ciemne tło (body i html)');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[Comet Dark Mode] Błąd w detectNativeDarkMode():', error);
      return false;
    }
  }

  /**
   * Wyświetla powiadomienie na stronie (overlay)
   */
  function showPageNotification() {
    try {
      // Sprawdź czy powiadomienie już istnieje
      let notification = document.getElementById('comet-dark-mode-notification');
      if (notification) {
        return; // Już wyświetlone
      }

      // Utwórz element powiadomienia
      notification = document.createElement('div');
      notification.id = 'comet-dark-mode-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        background: #fff3cd;
        border: 2px solid #ffc107;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        max-width: 350px;
        animation: cometSlideIn 0.4s ease-out;
        pointer-events: auto;
        overflow: hidden;
      `;

      // Utwórz nagłówek
      const header = document.createElement('div');
      header.style.cssText = `
        background: #ffc107;
        color: #856404;
        padding: 10px 16px;
        font-weight: 600;
        font-size: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(133, 100, 4, 0.2);
      `;
      
      const headerIcon = document.createElement('span');
      headerIcon.textContent = '🌙';
      headerIcon.style.cssText = 'font-size: 18px;';
      
      const headerText = document.createElement('span');
      headerText.textContent = 'Comet Dark Mode';
      headerText.style.cssText = 'flex: 1;';
      
      header.appendChild(headerIcon);
      header.appendChild(headerText);

      // Utwórz treść powiadomienia
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 12px 16px;
        color: #856404;
        font-size: 14px;
        line-height: 1.5;
      `;
      content.textContent = 'Ta strona ma już domyślnie włączony tryb ciemny';

      notification.appendChild(header);
      notification.appendChild(content);

      // Dodaj style dla animacji
      if (!document.getElementById('comet-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'comet-notification-styles';
        style.textContent = `
          @keyframes cometSlideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes cometSlideOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(100%);
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Dodaj do strony
      document.body.appendChild(notification);

      // Ukryj po 5 sekundach
      setTimeout(() => {
        hidePageNotification();
      }, 5000);
    } catch (error) {
      console.error('[Comet Dark Mode] Błąd wyświetlania powiadomienia:', error);
    }
  }

  /**
   * Ukrywa powiadomienie na stronie
   */
  function hidePageNotification() {
    const notification = document.getElementById('comet-dark-mode-notification');
    if (notification) {
      notification.style.animation = 'cometSlideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  /**
   * Włącza tryb ciemny
   */
  function enableDarkMode() {
    try {
      console.log('[Comet Dark Mode] enableDarkMode() wywołane');
      
      // Pobierz ustawienia per-domena jeśli istnieją
      const perDomainSettings = config.perDomainSettings && config.perDomainSettings[domain];
      const engineConfig = {
        brightness: perDomainSettings?.brightness ?? config.brightness ?? 0,
        contrast: perDomainSettings?.contrast ?? config.contrast ?? 100,
        sepia: perDomainSettings?.sepia ?? config.sepia ?? 0,
        saturation: perDomainSettings?.saturation ?? config.saturation ?? 100,
        hueRotate: perDomainSettings?.hueRotate ?? config.hueRotate ?? 0,
        grayscale: perDomainSettings?.grayscale ?? config.grayscale ?? 0
      };

      console.log('[Comet Dark Mode] Config:', engineConfig);
      
      if (typeof DarkModeEngine !== 'undefined') {
        console.log('[Comet Dark Mode] Używam DarkModeEngine');
        DarkModeEngine.init(engineConfig);
        DarkModeEngine.enable();
        
        // Sprawdź czy style zostały wstrzyknięte
        const style = document.getElementById('comet-dark-mode-style');
        if (style) {
          console.log('[Comet Dark Mode] Style wstrzyknięte pomyślnie');
        } else {
          console.warn('[Comet Dark Mode] Style nie zostały wstrzyknięte!');
        }
      } else {
        console.log('[Comet Dark Mode] Używam fallback (prosty filtr)');
        // Fallback - użyj prostego filtra
        applySimpleFilter();
        
        // Sprawdź czy style zostały wstrzyknięte
        const style = document.getElementById('comet-dark-mode-style');
        if (style) {
          console.log('[Comet Dark Mode] Fallback style wstrzyknięte');
        } else {
          console.error('[Comet Dark Mode] Fallback style nie zostały wstrzyknięte!');
        }
      }

      // Zastosuj własne CSS jeśli istnieje
      if (config.customCSS && config.customCSS[domain]) {
        applyCustomCSS(config.customCSS[domain]);
      }
    } catch (error) {
      console.error('[Comet Dark Mode] Błąd w enableDarkMode():', error);
      console.error(error.stack);
    }
  }

  /**
   * Wyłącza tryb ciemny
   */
  function disableDarkMode() {
    if (typeof DarkModeEngine !== 'undefined') {
      DarkModeEngine.disable();
    } else {
      removeSimpleFilter();
    }
    
    if (typeof CSSInjector !== 'undefined') {
      CSSInjector.removeCustomCSS();
    } else {
      removeCustomCSS();
    }
  }

  /**
   * Stosuje prosty filtr (fallback gdy silnik nie jest załadowany)
   */
  function applySimpleFilter() {
    const brightness = 100 - (config.brightness || 0);
    const contrast = config.contrast || 100;
    const sepia = config.sepia || 0;
    const saturation = config.saturation || 100;
    const hueRotate = config.hueRotate || 0;
    const grayscale = config.grayscale || 0;

    let filterValue = '';
    
    if (grayscale > 0) {
      filterValue += ` grayscale(${grayscale}%)`;
    }
    
    filterValue += ` invert(1) hue-rotate(180deg)`;
    
    if (hueRotate !== 0) {
      filterValue += ` hue-rotate(${hueRotate}deg)`;
    }
    
    // Saturation - zawsze dodaj, nawet jeśli 100% (może być zmieniane dynamicznie)
    filterValue += ` saturate(${saturation}%)`;
    
    if (brightness !== 100) {
      filterValue += ` brightness(${brightness}%)`;
    }
    
    if (contrast !== 100) {
      filterValue += ` contrast(${contrast}%)`;
    }
    
    if (sepia > 0) {
      filterValue += ` sepia(${sepia}%)`;
    }

    const css = `
      html { filter: ${filterValue} !important; }
      img, video, iframe, embed, object, canvas, svg,
      [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `;

    injectStyle(css, 'comet-dark-mode-style');
  }

  /**
   * Usuwa prosty filtr
   */
  function removeSimpleFilter() {
    const style = document.getElementById('comet-dark-mode-style');
    if (style) {
      style.remove();
    }
  }

  /**
   * Zastosowuje własne CSS użytkownika
   * @param {string} css - Kod CSS
   */
  function applyCustomCSS(css) {
    if (typeof CSSInjector !== 'undefined') {
      CSSInjector.injectCustomCSS(domain, css);
    } else {
      injectStyle(css, 'comet-custom-css');
    }
  }

  /**
   * Usuwa własne CSS
   */
  function removeCustomCSS() {
    const style = document.getElementById('comet-custom-css');
    if (style) {
      style.remove();
    }
  }

  /**
   * Wstrzykuje style CSS
   * @param {string} css - Kod CSS
   * @param {string} id - ID elementu style
   */
  function injectStyle(css, id) {
    // Usuń istniejący
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;

    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
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

        // Zaktualizuj stan
        if (changes.enabled) {
          isEnabled = changes.enabled.newValue;
        }

        const shouldBeActive = shouldBeActiveForDomain();
        
        // Sprawdź czy zmieniły się tylko parametry filtrów (nie enabled)
        const filterKeys = ['brightness', 'contrast', 'sepia', 'saturation', 'hueRotate', 'grayscale'];
        const isFilterChange = Object.keys(changes).some(key => filterKeys.includes(key));
        const isEnabledChange = changes.enabled !== undefined;

        // Jeśli zmieniły się tylko filtry i tryb jest włączony, użyj updateConfig zamiast init
        if (isFilterChange && !isEnabledChange && shouldBeActive && isEnabled) {
          console.log('[Comet Dark Mode] Zmiana filtrów w storage, aktualizuję konfigurację');
          if (typeof DarkModeEngine !== 'undefined' && DarkModeEngine.isEnabled()) {
            // Silnik jest już zainicjalizowany, użyj updateConfig
            const perDomainSettings = config.perDomainSettings && config.perDomainSettings[domain];
            DarkModeEngine.updateConfig({
              brightness: perDomainSettings?.brightness ?? config.brightness ?? 0,
              contrast: perDomainSettings?.contrast ?? config.contrast ?? 100,
              sepia: perDomainSettings?.sepia ?? config.sepia ?? 0,
              saturation: perDomainSettings?.saturation ?? config.saturation ?? 100,
              hueRotate: perDomainSettings?.hueRotate ?? config.hueRotate ?? 0,
              grayscale: perDomainSettings?.grayscale ?? config.grayscale ?? 0
            });
            console.log('[Comet Dark Mode] Konfiguracja zaktualizowana przez storage.onChanged');
          } else {
            // Silnik nie jest zainicjalizowany, użyj enableDarkMode
            enableDarkMode();
          }
        } else {
          // Zmiana enabled lub inna zmiana - użyj standardowej logiki
          // Sprawdź czy strona ma natywny tryb ciemny PRZED włączeniem wtyczki
          const hasNativeDarkMode = detectNativeDarkMode();
          if (hasNativeDarkMode && shouldBeActive && isEnabled) {
            console.log('[Comet Dark Mode] Strona ma natywny tryb ciemny - pomijam włączenie wtyczki');
            showPageNotification();
            disableDarkMode(); // Upewnij się, że wtyczka jest wyłączona
          } else if (shouldBeActive && isEnabled) {
            enableDarkMode();
          } else {
            disableDarkMode();
          }
        }
      }
    });

    // Nasłuchuj wiadomości z background script i popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'configChanged') {
        loadConfig().then(() => {
          const shouldBeActive = shouldBeActiveForDomain();
          // Sprawdź czy strona ma natywny tryb ciemny PRZED włączeniem wtyczki
          const hasNativeDarkMode = detectNativeDarkMode();
          if (hasNativeDarkMode && shouldBeActive && isEnabled) {
            console.log('[Comet Dark Mode] Strona ma natywny tryb ciemny - pomijam włączenie wtyczki');
            showPageNotification();
            disableDarkMode();
          } else if (shouldBeActive && isEnabled) {
            enableDarkMode();
          } else {
            disableDarkMode();
          }
        });
      } else if (message.action === 'updateConfig') {
        // Aktualizacja na żywo z popup (suwaki)
        console.log('[Comet Dark Mode] Aktualizacja konfiguracji na żywo:', message.config);
        
        // Zaktualizuj lokalną konfigurację
        if (message.config.brightness !== undefined) {
          config.brightness = message.config.brightness;
        }
        if (message.config.contrast !== undefined) {
          config.contrast = message.config.contrast;
        }
        if (message.config.sepia !== undefined) {
          config.sepia = message.config.sepia;
        }
        if (message.config.saturation !== undefined) {
          config.saturation = message.config.saturation;
        }
        if (message.config.hueRotate !== undefined) {
          config.hueRotate = message.config.hueRotate;
        }
        if (message.config.grayscale !== undefined) {
          config.grayscale = message.config.grayscale;
        }
        
        // Jeśli tryb ciemny jest włączony, zaktualizuj style na żywo
        const shouldBeActive = shouldBeActiveForDomain();
        console.log('[Comet Dark Mode] shouldBeActive:', shouldBeActive, 'isEnabled:', isEnabled);
        
        if (shouldBeActive && isEnabled) {
          // Zaktualizuj silnik z nową konfiguracją
          if (typeof DarkModeEngine !== 'undefined') {
            console.log('[Comet Dark Mode] Aktualizuję DarkModeEngine z nową konfiguracją:', {
              brightness: config.brightness ?? 0,
              contrast: config.contrast ?? 100,
              sepia: config.sepia ?? 0,
              saturation: config.saturation ?? 100,
              hueRotate: config.hueRotate ?? 0,
              grayscale: config.grayscale ?? 0
            });
            // updateConfig() automatycznie wywołuje enable() jeśli tryb jest włączony
            DarkModeEngine.updateConfig({
              brightness: config.brightness ?? 0,
              contrast: config.contrast ?? 100,
              sepia: config.sepia ?? 0,
              saturation: config.saturation ?? 100,
              hueRotate: config.hueRotate ?? 0,
              grayscale: config.grayscale ?? 0
            });
            console.log('[Comet Dark Mode] Style zaktualizowane');
          } else {
            console.log('[Comet Dark Mode] DarkModeEngine nie jest dostępny, używam fallback');
            // Fallback - zastosuj prosty filtr z nową konfiguracją
            applySimpleFilter();
          }
        } else {
          console.log('[Comet Dark Mode] Tryb ciemny nie jest aktywny, pomijam aktualizację');
        }
        
        sendResponse({ success: true });
      } else if (message.action === 'checkSystemPreference') {
        // Sprawdź preferencje systemowe
        if (window.matchMedia) {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          chrome.runtime.sendMessage({
            action: 'systemPreference',
            isDark: isDark
          });
        }
        sendResponse({ success: true });
      } else if (message.action === 'checkNativeDarkMode') {
        // Sprawdź czy strona ma już domyślnie włączony tryb ciemny
        const hasNativeDarkMode = detectNativeDarkMode();
        sendResponse({ hasNativeDarkMode: hasNativeDarkMode });
        return true; // Asynchroniczna odpowiedź
      }
      return true;
    });
  }

  /**
   * Konfiguruje MutationObserver dla dynamicznych zmian treści
   */
  function setupMutationObserver() {
    if (!window.MutationObserver) {
      return;
    }

    // Debounce dla wydajności - zwiększamy delay dla lepszej wydajności
    let timeout = null;
    const debounceDelay = 300; // Zwiększony delay dla mniejszego obciążenia CPU

    // Ograniczamy obserwację tylko do istotnych zmian
    observer = new MutationObserver((mutations) => {
      // Sprawdź czy są istotne zmiany (dodane węzły)
      const hasSignificantChanges = mutations.some(mutation => 
        mutation.addedNodes.length > 0 && 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && // Element node
          !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(node.tagName)
        )
      );

      if (!hasSignificantChanges) {
        return; // Pomiń nieistotne zmiany
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Nowe elementy są automatycznie obsłużone przez filtr na html
      }, debounceDelay);
    });

    // Obserwuj zmiany w DOM - tylko childList dla lepszej wydajności
    const target = document.body || document.documentElement;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true
      });
    }
  }

  // Inicjalizuj - document_idle powinien zapewnić gotowość DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // DOM jest gotowy lub prawie gotowy
    init();
  } else {
    // Fallback - uruchom po krótkim opóźnieniu
    setTimeout(init, 100);
  }
})();

