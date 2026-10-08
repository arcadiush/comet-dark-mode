# Karta sklepu — Comet Dark Mode

Teksty do wklejenia w Chrome Web Store (CWS) i addons.mozilla.org (AMO).
Wersja PL jako główna, EN jako drugi język (oba sklepy pozwalają dodać tłumaczenia).

---

## Podstawowe dane

| Pole | Wartość |
|---|---|
| Nazwa | Comet Dark Mode |
| Kategoria CWS | Ułatwienia dostępu (Accessibility) |
| Kategoria AMO | Wygląd (Appearance) |
| Licencja AMO | do wyboru przez autora (brak pliku LICENSE w repo) |
| Strona domowa | https://github.com/arcadiush/comet-dark-mode |
| Polityka prywatności | https://github.com/arcadiush/comet-dark-mode/blob/main/PRIVACY.md (ta sama treść co `store/privacy-policy.html` — do hostowania gdzie indziej; zmieniać oba pliki razem) |
| Grafiki | `store/images/` (zrzuty 1280×800, kafelek 440×280) |
| Paczka | `./package.sh` → `dist/comet-dark-mode-<wersja>.zip` |

---

## Krótki opis

CWS: maks. 132 znaki · AMO: maks. 250 znaków

**PL (129 znaków):**
Tryb ciemny na każdej stronie. Odwraca kolory stron, a zdjęcia i wideo nie zamieniają się w negatyw. Bez kont i zbierania danych.

**EN (131 znaków):**
Dark mode for every website. Inverts page colors without turning photos and videos into negatives. No accounts, no data collection.

---

## Pełny opis — PL

Nie każda strona ma tryb ciemny. Comet Dark Mode wymusza go wszędzie — jednym kliknięciem albo skrótem klawiszowym.

Wtyczka odwraca kolory tekstu i tła, a zdjęcia, filmy i osadzone ramki odwraca z powrotem, więc nie wyglądają jak negatyw. Filtr działa od pierwszej chwili ładowania strony, więc nie ma białego błysku.

NAJWAŻNIEJSZE FUNKCJE

• Przełącznik w pasku narzędzi i skrót Ctrl+Shift+D (Cmd+Shift+D na Macu)
• Sześć regulacji: jasność, kontrast, sepia, nasycenie, obrót odcienia, szarość — zmiany widać na żywo
• Presety: Ciemny, Ciepły, Wysoki kontrast, Delikatny + własne zestawy ustawień
• Automatyczne włączanie: według ustawień systemu, o wybranych godzinach albo od zachodu do wschodu słońca
• Wyjątki: lista stron, na których wtyczka jest wyłączona, i lista stron, na których działa zawsze
• Osobne ustawienia dla wybranych domen i własne reguły CSS
• Wykrywanie stron, które mają już własny tryb ciemny — wtyczka ich nie odwraca
• Eksport i import ustawień do pliku JSON

PRYWATNOŚĆ

Comet Dark Mode nie zbiera, nie wysyła i nie sprzedaje żadnych danych. Nie ma kont, analityki ani połączeń z serwerami. Ustawienia są zapisywane w pamięci przeglądarki.

Dostęp do wszystkich stron jest potrzebny wyłącznie po to, by nałożyć na nie tryb ciemny.

---

## Pełny opis — EN

Not every website has a dark mode. Comet Dark Mode adds one everywhere — with a single click or a keyboard shortcut.

The extension inverts text and background colors and flips photos, videos and embedded frames back, so they don't look like negatives. The filter is applied from the very first moment a page loads, so there is no white flash.

KEY FEATURES

• Toolbar toggle and Ctrl+Shift+D shortcut (Cmd+Shift+D on Mac)
• Six adjustments: brightness, contrast, sepia, saturation, hue rotation, grayscale — changes apply live
• Presets: Dark, Warm, High contrast, Soft + your own setting sets
• Automatic switching: follow system settings, a time schedule, or sunset to sunrise
• Exceptions: sites where the extension is always off and sites where it is always on
• Per-domain settings and custom CSS rules
• Detects sites that already have their own dark mode and leaves them alone
• Export and import settings as a JSON file

PRIVACY

Comet Dark Mode does not collect, send or sell any data. No accounts, no analytics, no connections to any server. Settings are stored in your browser's storage.

Access to all websites is required solely to apply dark mode to them.

Note: the interface of the extension is in Polish.

---

## Chrome Web Store — zakładka „Praktyki dotyczące prywatności”

### Jedyne przeznaczenie (Single purpose)

**PL:** Wtyczka nakłada tryb ciemny na strony internetowe, odwracając ich kolory, i pozwala dostosować jego wygląd.

**EN:** The extension applies a dark mode to websites by inverting their colors and lets the user adjust how it looks.

### Uzasadnienie uprawnień (pole tylko po angielsku)

| Uprawnienie | Uzasadnienie (do wklejenia) |
|---|---|
| `storage` | Stores the user's settings (on/off state, slider values, presets, site exceptions, schedule) in browser storage. |
| `tabs` | Reads the URL of the active tab to show its domain in the popup, and sends updated settings to open tabs so dark mode changes immediately without reloading. |
| `activeTab` | Lets the popup apply settings to the tab the user is currently viewing. |
| `alarms` | Runs the automatic schedule (turning dark mode on and off at set times or at sunset and sunrise). |
| Host permission `<all_urls>` | Dark mode must work on any website the user visits; the content script injects a CSS filter into the page. No page content is read, stored or transmitted. |

### Kod zdalny (Remote code)

Wybierz: **Nie, nie używam kodu zdalnego** (No, I am not using remote code). Cały kod jest w paczce.

### Wykorzystanie danych (Data usage)

Nie zaznaczaj żadnej kategorii danych. Zaznacz trzy oświadczenia:
- nie sprzedaję ani nie przekazuję danych osobom trzecim poza zatwierdzonymi przypadkami,
- nie używam ani nie przekazuję danych w celach niezwiązanych z głównym przeznaczeniem,
- nie używam ani nie przekazuję danych do oceny zdolności kredytowej ani udzielania pożyczek.

Uwaga: współrzędne z automatyzacji „zachód słońca” (wpisane ręcznie lub pobrane z lokalizacji przeglądarki) są zapisywane w `chrome.storage.sync`. Jeśli użytkownik ma włączoną synchronizację przeglądarki, synchronizuje je przeglądarka z jego kontem — wtyczka nigdzie ich nie wysyła. Ujawnione w polityce prywatności.

---

## addons.mozilla.org — dodatkowe pola

| Pole | Wartość |
|---|---|
| Zbieranie danych | deklarowane w manifeście: `data_collection_permissions: none` |
| Kod źródłowy | niewymagany — kod nie jest minifikowany ani budowany |
| Notatki dla recenzenta | „No build step — the uploaded files are the source. No network requests. `<all_urls>` is used only to inject a CSS filter.” |
