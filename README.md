# Comet Dark Mode

Lekka i wydajna wtyczka do przeglądarek (Chrome, Firefox, Edge) umożliwiająca globalne przełączanie trybu ciemnego z inteligentną inwersją kolorów.

**Aktualna wersja:** 1.2.2 | [Historia zmian (CHANGELOG)](CHANGELOG.md)

## Funkcjonalności

### Podstawowe
- **Globalny przełącznik** - Intuicyjny przycisk w pasku narzędzi do natychmiastowego włączania/wyłączania trybu ciemnego
- **Inteligentna inwersja** - Automatyczna konwersja kolorów z zachowaniem oryginalnych kolorów obrazów, wideo i iframe

### Konfiguracja Wyglądu
- **Jasność** - Regulacja ogólnego poziomu ciemności tła (0-100)
- **Kontrast** - Dostosowanie kontrastu dla lepszej czytelności (0-200)
- **Sepia** - Filtr sepii dla redukcji niebieskiego światła (0-100)
- **Nasycenie** - Kontrola intensywności kolorów (0-200)
- **Obrót odcienia** - Zmiana palety kolorów (-180 do 180 stopni)
- **Szarość** - Konwersja kolorów na odcienie szarości (0-100)

### Automatyzacja
- **Synchronizacja z systemem** - Automatyczne wykrywanie preferencji systemowych (Windows, macOS, Linux)
- **Harmonogram czasowy** - Automatyczne włączanie/wyłączanie o określonych godzinach
- **Geolokalizacja** - Automatyczne włączanie po lokalnym zachodzie słońca

### Zarządzanie Wyjątkami
- **Biała Lista** - Domeny, na których wtyczka jest zawsze wyłączona
- **Czarna Lista** - Domeny, na których wtyczka jest zawsze włączona

### Zaawansowane
- **Ustawienia per-domena** - Unikalne ustawienia jasności, kontrastu i sepii dla konkretnych stron
- **Własne reguły CSS** - Możliwość wstrzyknięcia własnego kodu CSS dla wybranych stron
- **Silnik renderowania** - Bazuje na `filter: invert()` - błyskawiczny, minimalny narzut

### Presety
- **Szybkie przełączanie** - Zapisz aktualne ustawienia jako preset i przełączaj się między nimi jednym kliknięciem
- **Domyślne presety** - Wbudowane presety: Ciemny, Ciepły, Wysoki kontrast, Delikatny
- **Zarządzanie presetami** - Twórz, edytuj i usuwaj własne presety

### Eksport/Import
- **Eksport ustawień** - Zapisz wszystkie ustawienia do pliku JSON
- **Import ustawień** - Wczytaj ustawienia z pliku JSON (backup, przenoszenie między urządzeniami)

### Skróty klawiszowe
- **Ctrl+Shift+D** (Windows/Linux) / **Cmd+Shift+D** (macOS) - Przełącz tryb ciemny

## Instalacja

### Chrome/Edge
1. Otwórz `chrome://extensions/` (lub `edge://extensions/`)
2. Włącz "Tryb deweloperski"
3. Kliknij "Załaduj rozpakowane"
4. Wybierz folder z wtyczką

### Firefox
1. Otwórz `about:debugging`
2. Kliknij "Ten komputer"
3. Kliknij "Załaduj tymczasowe rozszerzenie"
4. Wybierz plik `manifest.json`

## Struktura Projektu

```
Comet/
├── manifest.json              # Manifest wtyczki (V3)
├── icons/                     # Ikony wtyczki
├── popup/                     # Panel wyskakujący
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/                    # Strona opcji
│   ├── options.html
│   ├── options.css
│   └── options.js
├── content/                    # Content scripts
│   ├── content.js
│   └── dark-mode-engine.js
├── background/                 # Background service worker
│   └── background.js
└── utils/                      # Narzędzia pomocnicze
    ├── storage.js
    ├── domain-matcher.js
    ├── automation.js
    └── css-injector.js
```

## Wymagania Techniczne

- Manifest V3 — jeden `manifest.json` dla Chrome/Edge i Firefoksa (121+)
- HTML5, CSS3, JavaScript (ES6+)
- Bez zewnętrznych zależności (lekka implementacja)

## Wydajność

Wtyczka została zoptymalizowana pod kątem:
- Minimalnego rozmiaru i zużycia zasobów
- Braku wpływu na czas ładowania strony
- Płynnego działania na stronach z dynamiczną treścią
- Efektywnego zarządzania pamięcią

## Licencja

Projekt otwarty do użytku osobistego i komercyjnego.

