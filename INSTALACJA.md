# Instrukcja Instalacji Wtyczki Comet Dark Mode

## Wymagania

Przed instalacją upewnij się, że masz:
- ✅ Wszystkie pliki wtyczki w jednym folderze
- ✅ Ikony w folderze `icons/` (6 plików PNG: icon-light-16.png, icon-light-48.png, icon-light-128.png, icon-dark-16.png, icon-dark-48.png, icon-dark-128.png)

**UWAGA:** Jeśli nie masz jeszcze ikon, wtyczka nie załaduje się poprawnie. Musisz najpierw wygenerować ikony.

---

## Google Chrome / Microsoft Edge (Chromium)

### Krok 1: Otwórz stronę zarządzania rozszerzeniami

1. Otwórz Chrome/Edge
2. W pasku adresu wpisz: `chrome://extensions/` (Chrome) lub `edge://extensions/` (Edge)
3. Naciśnij Enter

### Krok 2: Włącz tryb deweloperski

1. W prawym górnym rogu znajdź przełącznik **"Tryb deweloperski"** (Developer mode)
2. Przełącz go na **WŁĄCZONY**

### Krok 3: Załaduj wtyczkę

1. Kliknij przycisk **"Załaduj rozpakowane"** (Load unpacked) w lewym górnym rogu
2. W oknie wyboru folderu przejdź do folderu z wtyczką (tego, w którym jest `manifest.json`)
3. Wybierz folder i kliknij **"Otwórz"** (Open)

### Krok 4: Sprawdź instalację

1. Wtyczka powinna pojawić się na liście rozszerzeń
2. Jeśli widzisz błędy (czerwony tekst), sprawdź:
   - Czy wszystkie pliki są na miejscu
   - Czy ikony istnieją w folderze `icons/`
   - Otwórz konsolę deweloperską (F12) i sprawdź błędy

### Krok 5: Użyj wtyczki

1. Kliknij ikonę wtyczki w pasku narzędzi przeglądarki
2. Panel popup powinien się otworzyć
3. Przełącznik włącza/wyłącza tryb ciemny

---

## Mozilla Firefox

### Krok 1: Otwórz stronę debugowania

1. Otwórz Firefox
2. W pasku adresu wpisz: `about:debugging`
3. Naciśnij Enter

### Krok 2: Przejdź do sekcji "Ten komputer"

1. W menu po lewej stronie kliknij **"Ten komputer"** (This Firefox)
2. Kliknij przycisk **"Załaduj tymczasowe rozszerzenie..."** (Load Temporary Add-on...)

### Krok 3: Wybierz plik manifest

1. W oknie wyboru pliku przejdź do folderu z wtyczką
2. Wybierz plik **`manifest.json`**
3. Kliknij **"Otwórz"**

### Krok 4: Sprawdź instalację

1. Wtyczka powinna pojawić się na liście
2. Jeśli widzisz błędy, sprawdź konsolę przeglądarki (F12)
3. Wymagany Firefox 140 lub nowszy (Android: 142)
4. Jeśli tryb ciemny nie działa na stronach: `about:addons` → Comet Dark Mode →
   zakładka **Uprawnienia** → włącz dostęp do wszystkich stron (w Manifest V3
   Firefox może nie przyznać go automatycznie)

**UWAGA:** W Firefox wtyczka jest ładowana tymczasowo i zniknie po zamknięciu przeglądarki. Aby zainstalować na stałe, musisz spakować wtyczkę jako plik `.xpi`.

---

## Rozwiązywanie Problemów

### Błąd: "Manifest file is missing or unreadable"

- Sprawdź czy plik `manifest.json` istnieje w głównym folderze
- Sprawdź czy ścieżki do plików w manifest.json są poprawne

### Błąd: "Could not load icon"

- Sprawdź czy wszystkie 6 ikon istnieją w folderze `icons/`
- Sprawdź czy nazwy plików są dokładnie takie jak w `manifest.json`:
  - `icon-light-16.png`
  - `icon-light-48.png`
  - `icon-light-128.png`
  - `icon-dark-16.png`
  - `icon-dark-48.png`
  - `icon-dark-128.png`

### Błąd: "Service worker registration failed"

- Sprawdź czy plik `background/background.js` istnieje
- Otwórz konsolę deweloperską (F12) i sprawdź szczegóły błędu

### Wtyczka się nie ładuje

1. Otwórz konsolę deweloperską (F12)
2. Przejdź do zakładki "Console"
3. Sprawdź komunikaty o błędach
4. Sprawdź zakładkę "Errors" w `chrome://extensions/`

---

## Aktualizacja Wtyczki

Po wprowadzeniu zmian w kodzie:

1. **Chrome/Edge:** Kliknij ikonę odświeżenia (🔄) przy wtyczce na stronie `chrome://extensions/`
2. **Firefox:** Załaduj wtyczkę ponownie (zostanie zastąpiona)

---

## Testowanie

Po załadowaniu wtyczki:

1. ✅ Otwórz dowolną stronę internetową
2. ✅ Kliknij ikonę wtyczki w pasku narzędzi
3. ✅ Przełącznik powinien działać
4. ✅ Strona powinna zmienić się na tryb ciemny po włączeniu
5. ✅ Otwórz stronę opcji (przycisk "Opcje" w popup)

---

## Ważne Uwagi

- **Ikony są wymagane** - bez nich wtyczka nie załaduje się poprawnie
- **Chrome/Edge:** Wtyczka pozostaje załadowana po zamknięciu przeglądarki
- **Firefox:** Wtyczka jest tymczasowa i znika po zamknięciu przeglądarki
- W trybie deweloperskim wtyczka może pokazywać ostrzeżenia - to normalne

