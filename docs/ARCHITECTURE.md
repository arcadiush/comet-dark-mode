# Architektura — Comet Dark Mode

Dokument opisuje architekturę techniczną wtyczki. Ogólny opis i stan projektu
znajdują się w [`../CLAUDE.md`](../CLAUDE.md).

## Stack techniczny

| Warstwa | Technologia |
|---|---|
| Platforma | WebExtension, **Manifest V3** (Chrome/Edge); wariant V2 dla Firefoksa |
| Język | Vanilla JavaScript **ES6+**, moduły ES w service workerze (`"type": "module"`) |
| UI | HTML5 + CSS3 (popup, strona opcji) |
| Storage | `chrome.storage.sync` z fallbackiem na `chrome.storage.local` |
| Harmonogram | `chrome.alarms` |
| Build | **brak** — kod ładowany bezpośrednio przez przeglądarkę, zero zależności npm |

## Struktura folderów

| Ścieżka | Rola |
|---|---|
| `manifest.json` | Manifest V3: uprawnienia, rejestracja content scripts (z kolejnością), akcja, opcje, skróty |
| `icons/` | Ikony light/dark w rozmiarach 16/48/128 px |
| `background/background.js` | Service worker — automatyzacja, alarmy, synchronizacja między kartami, skróty |
| `content/dark-mode-engine.js` | Silnik renderowania (filtr CSS na `html`) — obiekt globalny `DarkModeEngine` |
| `content/content.js` | Orkiestracja na stronie: ładowanie configu, decyzja o włączeniu, wykrywanie native dark, MutationObserver |
| `popup/` | Panel popup — szybkie przełączanie i suwaki |
| `options/` | Pełna strona ustawień — presety, listy domen, per-domena, CSS, eksport/import |
| `utils/storage.js` | Wrapper `Storage` nad `chrome.storage` (sync → local fallback) |
| `utils/domain-matcher.js` | Dopasowanie whitelist/blacklist do bieżącej domeny |
| `utils/css-injector.js` | Wstrzykiwanie własnych reguł CSS per domena |
| `utils/automation.js` | Logika sync z systemem / harmonogram / geolokalizacja (współdzielona) |
| `utils/presets.js` | Definicje presetów wbudowanych i operacje na własnych |

## Warstwy i przepływ danych

Trzy konteksty wykonania WebExtension, komunikujące się przez `chrome.runtime` /
`chrome.tabs` sendMessage oraz przez współdzielony storage:

```
   ┌─────────────┐   sendMessage / storage    ┌──────────────────────┐
   │   Popup UI  │◄──────────────────────────►│  Service Worker      │
   │  (popup/)   │                            │  (background.js)     │
   └──────┬──────┘                            └──────────┬───────────┘
          │ zapis ustawień                    alarmy /   │ notifyAllTabs
          ▼ (Storage)                         automation │ (configChanged)
   ┌──────────────────────────┐                          ▼
   │   chrome.storage.sync     │◄────── onChanged ──► ┌──────────────────────┐
   │   (fallback: .local)      │                      │  Content Script      │
   └──────────────────────────┘◄─────────────────────│  (content.js +       │
                       storage.onChanged listener      │   DarkModeEngine)    │
                                                       └──────────────────────┘
                                                                 │ wstrzykuje <style>
                                                                 ▼  do strony
```

Kluczowe ścieżki:

1. **Zmiana ustawień w UI** — popup/options zapisuje przez `Storage.set()` →
   `chrome.storage.onChanged` budzi się w każdym content scripcie i w service
   workerze → content przelicza stan i aktualizuje `DarkModeEngine`.
2. **Skrót klawiszowy** (`Ctrl/Cmd+Shift+D`) — `chrome.commands.onCommand` w
   service workerze → `toggleDarkMode()` przełącza `enabled` w storage →
   propagacja jak wyżej.
3. **Automatyzacja** — service worker ustawia `chrome.alarms`; po wyzwoleniu
   liczy pożądany stan (system / harmonogram / zachód słońca) i wywołuje
   `updateEnabledState()`, które zapisuje storage i `notifyAllTabs()`.
4. **Preferencja systemowa** — service worker nie ma `matchMedia`, więc pyta
   content script (`action: 'checkSystemPreference'`), a ten odpowiada `isDark`.
5. **Inicjalizacja na stronie** — content scripts startują na `document_start`.
   `content.js` ładuje config i od razu wstrzykuje filtr (bez białego błysku),
   po `DOMContentLoaded` na chwilę zdejmuje filtr, wykrywa natywny dark mode
   (`detectNativeDarkMode()`) i przywraca filtr albo go zostawia wyłączonym
   (patrz decyzje niżej).

## Silnik renderowania (`DarkModeEngine`)

Globalny obiekt z jednym trybem: reguła `filter: invert()` na `html` z
odwróceniem inwersji na mediach (obrazy, wideo, iframe). Minimalny narzut.

Wartość `filter` (wszystkie sześć suwaków: jasność, kontrast, sepia, nasycenie,
obrót odcienia, szarość) buduje metoda `buildFilterValue()`. Komplet parametrów
jest utrwalany w `this.config` już w `init(config)`.

Do 2026-10-08 istniał drugi tryb „Analiza” (`analyze`). Dawał ten sam efekt co
filtr, plus cache CSS per URL. Usunięty, bo nie wykonywał realnej analizy CSS,
a jego cache powodował błąd (ignorowanie suwaków). Pole `renderEngine`
w storage zostaje tylko dla zgodności importu/eksportu, silnik go nie czyta.

Stan włączenia wykrywany przez obecność elementu `<style id="comet-dark-mode-style">`.

## Kluczowe decyzje architektoniczne

- **Zero zależności / brak buildu** — wtyczka ma pozostać lekka i ładowalna
  bezpośrednio jako „rozpakowana". Moduły współdzielone (`utils/*`) są ładowane
  jako globalne obiekty w kolejności zadeklarowanej w `manifest.json`, nie przez
  `import` w content scriptach.
- **`storage.sync` z fallbackiem na `local`** — ustawienia synchronizują się
  między urządzeniami użytkownika; przy błędzie sync (limit, brak konta) kod
  cicho przechodzi na `local`. Wzorzec powtórzony w `storage.js`, `content.js`
  i `background.js`.
- **Wykrywanie native dark bez naszego filtra** — detekcja musi widzieć oryginalne
  style strony, inaczej dawałaby fałszywe wyniki. Filtr jest wstrzykiwany już na
  `document_start` (bez białego błysku), więc po `DOMContentLoaded` `content.js`
  zdejmuje go, uruchamia `detectNativeDarkMode()` i przywraca w tym samym zadaniu
  JS (bez odmalowania). Przy trafieniu filtr zostaje zdjęty + powiadomienie.
  Koszt: strona natywnie ciemna może przez ułamek sekundy mignąć odwrócona (jasna).
  Style (silnik, `css-injector.js`) trafiają do `<html>`, gdy `<head>` jeszcze nie istnieje.
- **Guard `window.cometDarkModeLoaded`** — chroni przed podwójnym wykonaniem
  content scriptu (re-injection, wielokrotne dopasowania).
- **Obliczanie wschodu/zachodu lokalnie** — `background.js` liczy je wzorem
  astronomicznym z szer./dł. geograficznej, bez zewnętrznego API (prywatność,
  brak sieci, brak zależności).
- **`MutationObserver`** w content scripcie — obsługa stron o dynamicznej
  treści (SPA), by nowe węzły też podlegały trybowi ciemnemu.

## Integracje zewnętrzne

- **Brak zewnętrznych API/usług.** Wtyczka działa w pełni offline.
- API przeglądarki: `chrome.storage`, `chrome.tabs`, `chrome.runtime`,
  `chrome.alarms`, `chrome.commands`.
- `host_permissions: <all_urls>` — inwersja działa na dowolnej stronie.

## Ograniczenia — czego NIE robimy (i dlaczego)

- **Brak systemu buildu / bundlera** — świadomie, dla prostoty i lekkości.
  Kosztem tego: współdzielenie kodu przez globale i ręczna kolejność w manifeście.
- **Brak testów automatycznych** — projekt prototypowy; weryfikacja ręczna wg
  `INSTALACJA.md`.
- **Firefox tylko tymczasowo** — bez pakowania `.xpi` rozszerzenie znika po
  zamknięciu przeglądarki.
- **Service worker MV3 jest efemeryczny** — nie trzyma trwałego stanu w pamięci;
  dlatego `toggleDarkMode()` przeładowuje config z storage przed użyciem, a
  planowanie opiera się na `chrome.alarms`, nie na `setTimeout`.
