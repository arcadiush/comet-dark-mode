# Historia zmian - Comet Dark Mode

Wszystkie znaczące zmiany w projekcie będą dokumentowane w tym pliku.

Format jest oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a projekt przestrzega [Semantic Versioning](https://semver.org/lang/pl/).

## [Nieopublikowane]

### Usunięto
- **Tryb renderowania "Analiza"** i wybór silnika w opcjach. Dawał ten sam efekt
  co "Filtr" (jedyna różnica: cache CSS per URL, który powodował błędy). Zapisane
  ustawienie `renderEngine: 'analyze'` jest ignorowane — działa zawsze Filtr

### Naprawiono
- **Tryb "Analiza" ignorował zmiany suwaków** po pierwszym włączeniu na stronie —
  cache CSS był kluczowany samym URL, więc przy kolejnym `enable()` / `updateConfig()`
  zwracał stary filtr. Klucz cache zawiera teraz wartość filtra
- **Suwaków nie dało się ustawić na 0** (np. nasycenie 0% = strona czarno-biała,
  kontrast 0%) — `||` zamieniało 0 na wartość domyślną. Zamienione na `??`
  w `dark-mode-engine.js` i w ścieżce suwaków na żywo w `content.js`
- **Krytyczne: tryb ciemny nie włączał się na wielu stronach** (m.in. x-kom.pl).
  `detectNativeDarkMode()` błędnie uznawał przezroczyste tło (`rgba(0,0,0,0)`) za
  czarne — parser koloru ignorował kanał alpha — więc wtyczka "wykrywała" nieistniejący
  tryb ciemny strony i pomijała włączenie. Parser uwzględnia teraz alpha: tło
  przezroczyste = brak tła, nie ciemne. Zweryfikowane wizualnie na x-kom.pl
- **Tryb "Analiza"** respektuje teraz wszystkie suwaki (nasycenie, obrót odcienia,
  szarość) oraz regułę dla elementów przezroczystych — wcześniej je pomijał i dawał
  gorszy efekt niż tryb "Filtr". Wprowadzono wspólną metodę `buildFilterValue()`
  używaną przez oba tryby
- Silnik (`DarkModeEngine.init()`) nie utrwalał nasycenia / obrotu odcienia /
  szarości przy pierwszym włączeniu — błąd dotyczył obu trybów renderowania

### Zmieniono
- **Nowe ikony wtyczki** - słońce przeprojektowane na ciepły bursztynowy gradient
  z ciemnym obrysem, aby było czytelne zarówno na jasnym, jak i ciemnym pasku
  narzędzi przeglądarki (poprzednie, wyblakłe ikony były słabo widoczne)
- Dodano wariant ikony **32 px** dla ostrości na ekranach o wysokiej gęstości (retina)
- `manifest.json` przepięty na nowy zestaw ikon (`icons/icon-16/32/48/128.png`);
  źródło wektorowe zachowane w `icons/sun-source.svg`
- Ujednolicono opisy trybu "Analiza" (podpowiedź i etykieta w `options.html`,
  `README.md`, dokumentacja) — bez obietnicy "lepszej jakości", zgodnie ze stanem faktycznym

## [1.1.0] - 2024-12-XX

### Dodano
- **Wykrywanie natywnego trybu ciemnego na stronach** - wtyczka automatycznie rozpoznaje strony, które już mają domyślnie włączony tryb ciemny
- **Inteligentne pomijanie włączenia wtyczki** - gdy strona ma już tryb ciemny, wtyczka nie zmienia jej wyglądu, aby uniknąć niepożądanych efektów wizualnych
- **Automatyczne powiadomienie na stronie** - eleganckie okienko powiadomienia pojawia się automatycznie w prawym górnym rogu strony, gdy wykryto natywny tryb ciemny
- **Powiadomienie w popup** - informacja o wykryciu trybu ciemnego wyświetla się również w panelu popup wtyczki
- **Nagłówek w powiadomieniu** - powiadomienie zawiera nagłówek z nazwą rozszerzenia "Comet Dark Mode" dla lepszej identyfikacji

### Zmieniono
- **Logika inicjalizacji** - wykrywanie trybu ciemnego następuje PRZED włączeniem wtyczki, aby uniknąć błędnego wykrywania na jasnych stronach po włączeniu wtyczki
- **Usprawnione wykrywanie** - dodano sprawdzanie atrybutów `data-theme` i `data-color-mode` (używanych m.in. przez GitHub)
- **Bardziej precyzyjne wykrywanie koloru tła** - sprawdzanie koloru tła jest bardziej restrykcyjne i działa tylko przed włączeniem wtyczki

### Techniczne
- Funkcja `detectNativeDarkMode()` sprawdza:
  - Meta tag `color-scheme`
  - CSS `color-scheme` na elemencie html
  - Klasy CSS (`dark`, `dark-mode`, `theme-dark`, itp.)
  - Atrybuty `data-theme` i `data-color-mode`
  - Kolor tła (tylko przed włączeniem wtyczki)
- Funkcja `showPageNotification()` tworzy overlay z powiadomieniem
- Komunikacja między content script a popup przez `chrome.runtime.sendMessage`

## [1.0.0] - 2024-XX-XX

### Dodano
- Podstawowa funkcjonalność wtyczki do przełączania trybu ciemnego
- Panel popup z kontrolami
- Suwaki do regulacji jasności, kontrastu, sepii, nasycenia, obrotu odcienia i szarości
- System presetów
- Whitelist i blacklist domen
- Ustawienia per-domena
- Tryb "Filtr" i "Analiza"
- Automatyzacja oparta na preferencjach systemowych
- Skrót klawiszowy Ctrl+Shift+D (Cmd+Shift+D na Mac)

