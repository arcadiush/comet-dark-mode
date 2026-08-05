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
- **[NAPRAWIONE 2026-08-05] Tryb ciemny nie włączał się na wielu stronach** (objaw:
  "włączam, nic się nie dzieje", popup pokazuje "Aktywny", logi lecą, strona jasna).
  KOREKTA wcześniejszej hipotezy: to NIE była pułapka operacyjna (osierocony skrypt),
  tylko realny bug w `content.js`. `detectNativeDarkMode()` (krok 6) parsował kolor tła
  ignorując alpha, więc `rgba(0,0,0,0)` (przezroczyste `html`/`body`, typowe dla wielu
  witryn, m.in. x-kom.pl) było uznawane za czarne → fałszywe wykrycie natywnego dark
  → pominięcie włączenia. Fix: parser uwzględnia alpha (alpha 0 = brak tła, nie ciemne).
  Zweryfikowane: (a) jednostkowo (`rgba(0,0,0,0)`→nie-ciemne, `rgb(20,20,20)`→ciemne),
  (b) wizualnie — x-kom.pl poprawnie się odwraca. Silnik i cała ścieżka `content.js`
  wcześniej zweryfikowane harnessem (działały przy wymuszonym `enabled`), co pomogło
  zawęzić problem właśnie do `detectNativeDarkMode()`.
- Uwaga operacyjna (osobna sprawa): po przeładowaniu rozpakowanej wtyczki trzeba
  odświeżyć wcześniej otwarte karty (content script się reinjectuje) — dobra praktyka,
  ale NIE była przyczyną powyższego buga.
- Tryb "Analiza" nie wykonuje realnej analizy CSS per-element mimo nazwy "Dokładny"
  (patrz sekcja "Decyzje do podjęcia")
- `getElementSelector()` w `dark-mode-engine.js` — martwy kod (zaczątek analizy, nieużywany)
- Ikony wymagane do załadowania wtyczki (brak = błąd)
- Firefox: ładowanie tymczasowe bez pakowania `.xpi`
