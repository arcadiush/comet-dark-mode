# Comet Dark Mode — dokumentacja projektu

## Opis

Lekka wtyczka do przeglądarek (Chrome, Edge, Firefox) do globalnego przełączania
trybu ciemnego z inteligentną inwersją kolorów. Zachowuje oryginalne kolory
obrazów, wideo i iframe. Bez zewnętrznych zależności.

**Wersja:** 1.2.1 · Manifest V3

## Stack techniczny

- **Manifest V3** — jeden manifest dla Chrome/Edge i Firefoksa 121+ (`background`
  ma `service_worker` dla Chrome i `scripts` dla Firefoksa; `gecko.id` w `browser_specific_settings`)
- **Vanilla JavaScript (ES6+)** — moduły ES (`"type": "module"` w service workerze)
- **HTML5 + CSS3** — UI popup i strony opcji
- Brak buildu, brak npm/node — czysty kod ładowany bezpośrednio przez przeglądarkę
- API przeglądarki: `chrome.storage`, `chrome.tabs`,
  `chrome.alarms`, `chrome.runtime`

## Struktura projektu

```
Comet/
├── manifest.json              # Manifest V3, uprawnienia, rejestracja skryptów
├── icons/                     # Słońce: icon-* (włączona), icon-off-* (wyłączona, szare);
│                              #   źródła sun-source.svg / sun-off-source.svg; icon-light/dark-* nieużywane
├── popup/                     # Panel popup (popup.html/.css/.js — 628 linii JS)
├── options/                   # Strona opcji (options.html/.css/.js — 820 linii JS)
├── content/
│   ├── content.js             # Content script — orkiestracja, wykrywanie native dark (823 linie)
│   └── dark-mode-engine.js    # Silnik inwersji kolorów (229 linii)
├── background/
│   └── background.js          # Service worker — skróty, alarmy, sync (366 linii)
├── docs/ARCHITECTURE.md       # Architektura, przepływ danych, decyzje
├── blog/                      # Wpis blogowy o wtyczce + zrzuty ekranu
└── utils/
    ├── storage.js             # Warstwa dostępu do chrome.storage (228 linii)
    ├── domain-matcher.js      # Dopasowanie whitelist/blacklist (130 linii)
    ├── automation.js          # Harmonogram, geolokalizacja, sync z systemem (177 linii)
    ├── css-injector.js        # Wstrzykiwanie własnego CSS (98 linii)
    └── presets.js             # Presety wyglądu (126 linii)
```

Kolejność ładowania content scripts (z `manifest.json`):
`storage.js` → `domain-matcher.js` → `css-injector.js` → `dark-mode-engine.js` → `content.js`

## Aktualny stan

### [x] Ukończone (v1.2.0)
- Globalny przełącznik trybu ciemnego (popup + skrót `Ctrl/Cmd+Shift+D`)
- Silnik **Filtr** (`filter: invert()` na `html`, media odwracane z powrotem); tryb "Analiza" usunięty 2026-10-08
- Regulacje: jasność, kontrast, sepia, nasycenie, obrót odcienia, szarość
- Automatyzacja: sync z systemem, harmonogram czasowy, geolokalizacja (zachód słońca)
- Whitelist / blacklist domen, ustawienia per-domena, własne reguły CSS
- Presety (wbudowane: Ciemny, Ciepły, Wysoki kontrast, Delikatny + własne)
- Eksport / import ustawień do JSON
- Wykrywanie natywnego dark mode strony (`detectNativeDarkMode()`) + powiadomienia
  (fix 2026-08-05: przezroczyste tło `rgba(0,0,0,0)` nie jest już uznawane za ciemne)
- Nowe ikony słoneczka (czytelne na jasnym i ciemnym pasku), autor w `manifest.json`
  i stopka z autorem w popupie (2026-08-05)
- Wpis blogowy `blog/comet-dark-mode.md` ze zrzutami (2026-08-05)

### [-] W trakcie
- [DO UZUPEŁNIENIA] — brak aktywnie prowadzonego wątku (ostatnie zmiany w kodzie: 5 sie 2026)

### [ ] Planowane / do zrobienia
- Uzupełnić daty wydań w `CHANGELOG.md` (obecnie `2024-12-XX`, `2024-XX-XX`)
- [DO UZUPEŁNIENIA] — pozostałe priorytety ustalane per sesja w `PROGRESS.md`

## Konwencje i zasady kodu

- Komunikacja w projekcie po polsku; kod, nazwy zmiennych i plików po angielsku
- Nazewnictwo plików: lowercase z myślnikami (`dark-mode-engine.js`, `domain-matcher.js`)
- Bez frameworków i bibliotek zewnętrznych — utrzymać lekką, zerozależną implementację
- Komunikacja content ↔ popup ↔ background przez `chrome.runtime.sendMessage`
- Strony wtyczki (popup, opcje): bez inline `onclick` — CSP MV3 je blokuje; tylko `addEventListener`
- Logi w content scripts przez `debugLog()` / `DarkModeEngine.log()` (wyłączone flagą `DEBUG` / `debug`)
- Trwałość ustawień przez warstwę `utils/storage.js` (nie odwoływać się do `chrome.storage` bezpośrednio z UI)
- `commit messages` po polsku, zwięzłe
- Każda zmiana wtyczki = podbicie wersji (`manifest.json`, `README.md`, `CLAUDE.md`)
  + sekcja w `CHANGELOG.md`; poprawki → patch (1.2.x), funkcje/usunięcia → minor

## Znane problemy i bugi

- Ikony są wymagane do załadowania wtyczki — ich brak = błąd ładowania (patrz `INSTALACJA.md`)
- W Firefoksie wtyczka ładowana tymczasowo (znika po zamknięciu przeglądarki bez pakowania `.xpi`)
- Daty w `CHANGELOG.md` niekompletne
- [DO UZUPEŁNIENIA] — bugi zgłaszane w trakcie sesji dopisywać do `PROGRESS.md`

## Instrukcja dla Claude
- Gdy użytkownik napisze "koniec" lub "end session" – automatycznie zaktualizuj
  CLAUDE.md i PROGRESS.md zgodnie z tym co zostało zrobione w bieżącej sesji
- Zawsze czytaj ten plik na początku każdej nowej sesji
- Nie usuwaj historii z PROGRESS.md – tylko dodawaj nowe wpisy na górze
