# Postęp prac — Comet Dark Mode

## 2026-10-08

Sesja: analiza wtyczki → testy silników → naprawy (v1.2.0–1.2.3) → publikacja repo
i zgłoszenia do addons.mozilla.org oraz Chrome Web Store.

### Ukończone w tej sesji
- Przegląd stanu repo: od 2026-08-05 brak zmian w kodzie (git czysty, zmienił się
  tylko `.DS_Store`)
- Aktualizacja `CLAUDE.md`: liczby linii (`content.js` 833, `dark-mode-engine.js` 339),
  nowe ikony i katalogi `docs/` + `blog/` w strukturze, prace z 2026-08-05 w "Ukończone",
  data ostatnich zmian, zadania i znane problemy zsynchronizowane z tym plikiem
- Uzupełnienie brakującej historii: 2026-08-05 dodano też autora w `manifest.json`
  (commit `e758569`) i stopkę z autorem w popupie (`popup.html`/`popup.css`, `62acf10`)

- Test obu silników w przeglądarce (harness: strona testowa + prawdziwy
  `dark-mode-engine.js`, odczyt computed `filter` + zrzuty). Filtr OK. Znalezione
  i naprawione 2 bugi:
  - Analiza ignorowała suwaki po 1. włączeniu na stronie (cache per sam URL) →
    klucz cache = URL + wartość filtra
  - Suwaki nie dawały się ustawić na 0 (`||` → `??` w silniku i `content.js`)
  - Retest: 10/10 scenariuszy OK (oba tryby, zmiana na żywo, ponowne init, zera,
    obrazki zachowują kolory)
- Harness odpalany przez `.claude/launch.json` (`engine-harness`, port 8765; gitignored)
- **Decyzja: usunięto tryb "Analiza"** (wariant b). Silnik: `init(config)` bez typu,
  usunięte metody analizy, cache, `getElementSelector()`, `clearCache()`,
  `handleDynamicContent()` (339 → 222 linie). Usunięty wybór silnika w `options.html/.js`
  i martwy blok `analyze` w `content.js`. `renderEngine` zostaje w storage
  i imporcie/eksporcie tylko dla zgodności. Usunięty też nieużywany `.select-input` z `options.css`. Retest harness: filtr, zmiana na żywo,
  ponowne init, zera, wyłączenie — OK. Docs: README, ARCHITECTURE, CLAUDE, CHANGELOG, blog

- Przegląd wtyczki → naprawione 4 rzeczy (osobne commity):
  1. Przyciski w opcjach (import JSON, Edytuj/Usuń/Zastosuj) — inline `onclick`
     blokowany przez CSP MV3 (potwierdzone przez użytkownika: import się nie otwierał).
     Wspólny helper `createListItem()` w `options.js`, teksty przez `textContent`.
     Test atrapą chrome.*: wszystkie przyciski działają, `<img onerror>` w nazwie domeny
     wyświetla się jako tekst
  2. Biały błysk: `run_at: document_start`, filtr od razu po `loadConfig()`, detekcja
     native dark po `DOMContentLoaded` (filtr zdejmowany i przywracany w jednym zadaniu).
     Style idą do `<html>`, gdy brak `<head>`. Test: jasna strona ciemnieje, strona
     z ciemnym tłem / klasą `dark` → filtr zdjęty + powiadomienie
  3. Usunięte `scripting` i `web_accessible_resources`
  4. `console.log` w content scripts za flagą (`DEBUG` w `content.js`, `debug`
     w silniku). Test: 0 logów przy wyłączonej fladze
- Test w prawdziwej wtyczce (użytkownik): brak błysku i przyciski w opcjach — działa
- Ikona na pasku: popup podmieniał ją na stare `icon-light/dark-*` (białe, niewidoczne).
  Logika przeniesiona do `background.js` (`updateIcon()` na starcie + `storage.onChanged`
  → działa też dla skrótu i automatyzacji). Nowe `icon-off-*` (szare słońce,
  `sun-off-source.svg`). Fix gradientu SVG (`userSpaceOnUse`) — promienie poziome/pionowe
  nie miały koloru. Podgląd na jasnym i ciemnym pasku OK
- Nowy zrzut `blog/images/opcje.png` (headless Chrome, 800 px, atrapa chrome.* z pustym
  storage) — bez wyboru silnika, z listą wbudowanych presetów
- **Wersja 1.2.1 — Firefox**: użytkownik nie mógł dodać wtyczki. Przyczyna: tylko
  `background.service_worker` (Firefox go nie obsługuje). Dodane `background.scripts`
  + `browser_specific_settings.gecko` (id `comet-dark-mode@sobacki`, min. 121).
  Jeden manifest dla obu przeglądarek. Docs: README, CLAUDE, INSTALACJA (uprawnienia
  do stron w Firefoksie). Zweryfikowane przez użytkownika: działa w Firefoksie i Chrome
- Wypchnięto na GitHub `main` + tag `v1.2.0` (na prośbę użytkownika)
- **Przygotowanie do sklepów (Chrome Web Store + addons.mozilla.org)**:
  1. Wersja 1.2.2: `data_collection_permissions: none` w `gecko` (wymóg AMO)
  2. `package.sh` → `dist/comet-dark-mode-<wersja>.zip` (28 plików, tylko to, co ładuje
     przeglądarka; `dist/` w `.gitignore`). Sprawdzone: wszystkie pliki z manifestu i HTML są w zip
  3. `store/listing.md` — krótki/pełny opis PL+EN, kategorie, single purpose, uzasadnienia
     uprawnień, deklaracje danych, notatka dla recenzenta AMO
  4. `store/images/` — 3 zrzuty 1280×800 (przed/po, panel, opcje) + kafelek 440×280;
     render headless Chrome z atrapą chrome.* i prawdziwym silnikiem. Odkrycie: podwójna
     inwersja (`invert + hue-rotate`) nie odtwarza zdjęć 1:1 — teksty mówią „bez efektu
     negatywu” zamiast „bez zmian”
  5. `store/privacy-policy.html` — PL+EN, zgodna z kodem (brak sieci, storage.sync,
     geolokalizacja tylko lokalnie). Później: `PRIVACY.md` w publicznym repo, kontakt = GitHub Issues
- **Wersja 1.2.0** (manifest, README, CLAUDE, CHANGELOG). Zasada od teraz: każda zmiana
  = podbicie wersji (poprawka → patch)
- Edytor CSS: jeden listener + `editedCSSDomain` zamiast listenera przy każdym otwarciu.
  Test: 3 domeny edytowane po kolei, każda zapisuje tylko swój tekst

- **Repo upublicznione** (https://github.com/arcadiush/comet-dark-mode). Przed tym audyt
  całej historii: brak sekretów/IP/nazw serwerów; usunięta lokalna ścieżka z `INSTALACJA.md`;
  e-mail autora w 25 commitach zamieniony na `62109157+arcadiush@users.noreply.github.com`
  (`git filter-repo --mailmap`, force push `main` + tagi; drzewa i opisy commitów bez zmian;
  kopia zapasowa przed przepisaniem: bundle w scratchpadzie sesji). Lokalny `user.email`
  repo ustawiony na noreply. `PRIVACY.md` (PL/EN, kontakt przez GitHub Issues) —
  link do sklepów: https://github.com/arcadiush/comet-dark-mode/blob/main/PRIVACY.md

- **Wysłano do addons.mozilla.org** wersję 1.2.2 (formularz wypełniony przez Claude in Chrome
  na prośbę użytkownika): opis PL, kategoria „Modyfikacje interfejsu”, wsparcie = GitHub Issues,
  licencja MIT, bez polityki prywatności (brak zbierania danych), „bez narzędzi budujących”.
  Publikacja do 24 h. Dodany plik `LICENSE` (MIT)
- AMO: użytkownik wgrał 1.2.3 jako aktualizację (1 ostrzeżenie — `service_worker`, celowe).
  Claude dodał 3 zrzuty ze `store/images/` z podpisami PL na stronie dodatku (sekcja Obrazy)
  oraz ikonę `icons/icon-128.png` (zamiast domyślnego puzzla). Status AMO: oczekuje na sprawdzenie
- **Wysłano do Chrome Web Store** wersję 1.2.3 (formularz wypełnił użytkownik — Chrome blokuje
  rozszerzeniom, także Claude in Chrome, dostęp do stron Web Store). Ostrzeżenie „Publikowanie
  będzie opóźnione” (szerokie uprawnienia hostów) zaakceptowane: `activeTab` zepsułby
  automatyczne przyciemnianie. Dodana ikona sklepu z marginesem `store/images/store-icon-128.png`
- README: zrzut przed/po (`store/images/screenshot-1-przed-po.png`) pod numerem wersji
- Blog autora: zaktualizowany wpis o wtyczce (jeden silnik, nowy zrzut opcji, link do GitHuba,
  ostrożniej o zdjęciach i białym błysku) oraz karta projektu (bez „zdjęcia bez zmian”)

### Przerwane / W trakcie
- Publikacja w sklepach — czeka na recenzje, nic do zrobienia po naszej stronie:
  addons.mozilla.org (1.2.3, do 24 h) i Chrome Web Store (1.2.3, do ~2 tygodni,
  „publikowanie opóźnione” przez `<all_urls>`)

### Na następną sesję
- Sprawdzić e-maile od Mozilli i Google; przy odrzuceniu — poprawki wg uwag recenzenta
- README/CLAUDE (repo wtyczki) obiecują „zachowuje oryginalne kolory obrazów” — w praktyce lekko się
  zmieniają (ograniczenie `hue-rotate`); złagodzić opis albo poprawić silnik
- Martwy kod: MutationObserver w `content.js` (pusty callback), `utils/automation.js`
  (nigdzie nieładowany)
- Strona natywnie ciemna (np. GitHub w trybie ciemnym) → sprawdzić powiadomienie w prawdziwej wtyczce
- Daty w `CHANGELOG.md` (pominięte na razie — brak dat wydań w git)

### Napotkane problemy
- Chrome 152 nie ładuje rozpakowanych wtyczek z linii poleceń → testy na harnessie
  (strony testowe + atrapa `chrome.*` + prawdziwe pliki wtyczki), finalne potwierdzenie
  przez użytkownika w prawdziwej przeglądarce
- Headless Chrome (`--screenshot`) zapisuje plik, ale nie kończy procesu → `perl -e 'alarm 25'`
  jako limit czasu + `pkill`
- Chrome blokuje rozszerzeniom (Claude in Chrome) strony Chrome Web Store („extensions
  gallery cannot be scripted”) → formularz CWS wypełnił użytkownik; AMO wypełnił Claude
- AMO: kliknięcie „Edytuj” w sekcji Obrazy przez narzędzie nie otwierało edytora →
  `element.click()` przez JS. `form_input` wpisał adres pomocy do ukrytego pola `_init`
  zamiast `_pl` → poprawione przez JS i zweryfikowane odczytem wartości formularza
- Podwójna inwersja (`invert(1) hue-rotate(180deg)` ×2) nie odtwarza zdjęć 1:1 —
  ograniczenie CSS, nie naprawione; opisy w sklepach złagodzone

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
