# Postęp prac — Comet Dark Mode

## 2026-08-05

### Ukończone
- Inicjalizacja dokumentacji projektu: utworzono `CLAUDE.md` i `PROGRESS.md`
  (projekt nie miał wcześniej tych plików ani notatek w Obsidian)
- Utworzono `docs/ARCHITECTURE.md` na podstawie lektury kodu (`background.js`,
  `content.js`, `dark-mode-engine.js`, `storage.js`) — stack, struktura folderów,
  diagram przepływu danych, decyzje architektoniczne, ograniczenia
- **Fix silnika `dark-mode-engine.js`**: tryb "Analiza" gubił nasycenie, obrót
  odcienia, szarość i regułę `opacity` (robił mniej niż "Filtr"); dodatkowo
  `init()` nie utrwalał tych 3 parametrów przy pierwszym włączeniu (dotyczyło
  obu trybów). Wprowadzono wspólną metodę `buildFilterValue()`, poprawiono
  `init()`. Zsynchronizowano opisy w `docs/ARCHITECTURE.md` i `CLAUDE.md`.
  Składnia zweryfikowana `node --check`; renderowanie NIE przetestowane w przeglądarce.
- Poprawiono mylącą podpowiedź UI w `options.html:183` — obiecywała, że "Analiza
  zapewnia lepszą jakość"; teraz opisuje stan faktyczny (ten sam efekt co "Filtr"
  + cache per URL, realna analiza niezaimplementowana). Spójne z fixem silnika.
- Zrobiono zrzuty ekranu popupu (stan wyłączony + makieta stanu włączonego) oraz
  pełnej strony opcji — na potrzeby przeglądu UI.
- Złagodzono etykietę silnika w `options.html` z "Analiza (Dokładny)" na samo
  "Analiza" oraz poprawiono ten sam overpromise w `README.md:35`; zsynchronizowano
  wzmiankę w `docs/ARCHITECTURE.md`. Wszystkie user-facing opisy trybu "Analiza"
  są teraz zgodne z rzeczywistością.
- Przygotowano wpis blogowy `blog/comet-dark-mode.md` (opis wtyczki po polsku)
  wraz z 4 zrzutami w `blog/images/` (logo, popup wyłączony, popup włączony,
  pełna strona opcji). Zrzuty wygenerowane headless Chrome + przycięte
  (ImageMagick). Post w czystym Markdownie (bez HTML) + frontmatter Astro
  (title, description, pubDate, heroImage, tags, draft); usunięto zduplikowany
  nagłówek H1. Opis trybu "Analiza" w poście zgodny z realnym stanem.
- **Nowe ikony słoneczka** (poprzednie słabo widoczne na pasku). Zaprojektowano
  SVG (`icons/sun-source.svg`) — bursztynowy gradient + ciemny obrys, czytelny na
  jasnym i ciemnym pasku (walidacja w podglądzie na obu tłach, 16/32/48 px).
  Wyrenderowano `rsvg-convert` do `icon-16/32/48/128.png`; `manifest.json`
  przepięty na nowy zestaw + dodane 32 px (retina). Stare ikony (`icon-light-*`,
  `icon-dark-*`) zachowane. Wpis dodany też do `CHANGELOG.md` (sekcja [Nieopublikowane]).

### W trakcie
- Brak aktywnego wątku implementacyjnego

### Do zrobienia
- Uzupełnić daty wydań w `CHANGELOG.md` (`[1.1.0] - 2024-12-XX`, `[1.0.0] - 2024-XX-XX`)
- Zweryfikować w przeglądarce oba tryby silnika z ustawionym nasyceniem/szarością
  (przeładować wtyczkę na `chrome://extensions/`)
- Ustalić priorytety na kolejną sesję

### Decyzje do podjęcia
- **Przyszłość trybu "Analiza"**: po fixie daje wynik identyczny jak "Filtr",
  różni je tylko cache CSS per URL. Do rozstrzygnięcia jeden z wariantów:
  (a) dokończyć realną analizę CSS per-element (`getElementSelector()` to zaczątek),
  (b) usunąć tryb, by nie wprowadzać użytkownika w błąd nazwą "Dokładny".
  Do czasu decyzji dokumentacja jawnie zaznacza, że realna analiza jest niezaimplementowana.

### Znane problemy i bugi
- **Pułapka operacyjna (NIE bug w kodzie):** po przeładowaniu rozpakowanej wtyczki
  na `chrome://extensions/` content script w już otwartych kartach jest osierocony —
  przełącznik w popupie reaguje, ale strona się nie zmienia. Objaw "włączam tryb
  ciemny, nic się nie dzieje". Lek: przeładuj wtyczkę **i odśwież kartę** (`Cmd+R`);
  po zmianie `manifest.json` najlepiej usuń i dodaj wtyczkę ponownie, potem odśwież
  karty. Weryfikacja: `F12` → Console → logi `[Comet Dark Mode]`. Zgłoszone w sesji
  2026-08-05 jako regresja po zmianie ikon; okazało się przyczyną operacyjną.
  Silnik zweryfikowany empirycznie (harness ładujący `dark-mode-engine.js`) —
  oba tryby (Filtr i Analiza) poprawnie odwracają stronę; `manifest.json` poprawny,
  wszystkie skrypty przechodzą `node --check`.
- Tryb "Analiza" nie wykonuje realnej analizy CSS per-element mimo nazwy "Dokładny"
  (patrz sekcja "Decyzje do podjęcia")
- `getElementSelector()` w `dark-mode-engine.js` — martwy kod (zaczątek analizy, nieużywany)
- Ikony wymagane do załadowania wtyczki (brak = błąd)
- Firefox: ładowanie tymczasowe bez pakowania `.xpi`
