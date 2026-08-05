# Comet Dark Mode — dokumentacja projektu

## Opis

Lekka wtyczka do przeglądarek (Chrome, Edge, Firefox) do globalnego przełączania
trybu ciemnego z inteligentną inwersją kolorów. Zachowuje oryginalne kolory
obrazów, wideo i iframe. Bez zewnętrznych zależności.

**Wersja:** 1.1.0 · Manifest V3

## Stack techniczny

- **Manifest V3** (Chrome/Edge); wariant V2 dla Firefoksa
- **Vanilla JavaScript (ES6+)** — moduły ES (`"type": "module"` w service workerze)
- **HTML5 + CSS3** — UI popup i strony opcji
- Brak buildu, brak npm/node — czysty kod ładowany bezpośrednio przez przeglądarkę
- API przeglądarki: `chrome.storage`, `chrome.tabs`, `chrome.scripting`,
  `chrome.alarms`, `chrome.runtime`

## Struktura projektu

```
Comet/
├── manifest.json              # Manifest V3, uprawnienia, rejestracja skryptów
├── icons/                     # Ikony (light/dark, 16/48/128 px)
├── popup/                     # Panel popup (popup.html/.css/.js — 628 linii JS)
├── options/                   # Strona opcji (options.html/.css/.js — 808 linii JS)
├── content/
│   ├── content.js             # Content script — orkiestracja, wykrywanie native dark (829 linii)
│   └── dark-mode-engine.js    # Silnik inwersji kolorów (325 linii)
├── background/
│   └── background.js          # Service worker — skróty, alarmy, sync (366 linii)
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

### [x] Ukończone (v1.1.0)
- Globalny przełącznik trybu ciemnego (popup + skrót `Ctrl/Cmd+Shift+D`)
- Dwa silniki: **Filtr** (`filter: invert()`, szybki) i **Analiza** (obecnie ten sam filtr + cache per URL; realna analiza CSS per-element niezaimplementowana — patrz `docs/ARCHITECTURE.md`)
- Regulacje: jasność, kontrast, sepia, nasycenie, obrót odcienia, szarość
- Automatyzacja: sync z systemem, harmonogram czasowy, geolokalizacja (zachód słońca)
- Whitelist / blacklist domen, ustawienia per-domena, własne reguły CSS
- Presety (wbudowane: Ciemny, Ciepły, Wysoki kontrast, Delikatny + własne)
- Eksport / import ustawień do JSON
- Wykrywanie natywnego dark mode strony (`detectNativeDarkMode()`) + powiadomienia

### [-] W trakcie
- [DO UZUPEŁNIENIA] — brak aktywnie prowadzonego wątku (ostatnie zmiany: 15–16 lis 2025)

### [ ] Planowane / do zrobienia
- Uzupełnić daty wydań w `CHANGELOG.md` (obecnie `2024-12-XX`, `2024-XX-XX`)
- [DO UZUPEŁNIENIA] — pozostałe priorytety ustalane per sesja w `PROGRESS.md`

## Konwencje i zasady kodu

- Komunikacja w projekcie po polsku; kod, nazwy zmiennych i plików po angielsku
- Nazewnictwo plików: lowercase z myślnikami (`dark-mode-engine.js`, `domain-matcher.js`)
- Bez frameworków i bibliotek zewnętrznych — utrzymać lekką, zerozależną implementację
- Komunikacja content ↔ popup ↔ background przez `chrome.runtime.sendMessage`
- Trwałość ustawień przez warstwę `utils/storage.js` (nie odwoływać się do `chrome.storage` bezpośrednio z UI)
- `commit messages` po polsku, zwięzłe

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
