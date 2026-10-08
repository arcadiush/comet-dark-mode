# Polityka prywatności — Comet Dark Mode

Obowiązuje od 8 października 2026 · [English version below](#privacy-policy--comet-dark-mode)

> **Comet Dark Mode nie zbiera, nie wysyła i nie sprzedaje żadnych danych.** Wtyczka nie łączy się z żadnym serwerem, nie używa analityki ani plików cookie.

## Kto odpowiada za wtyczkę

Autor wtyczki: Arkadiusz Sobacki. Pytania w sprawach prywatności: [zgłoszenia w repozytorium](https://github.com/arcadiush/comet-dark-mode/issues).

## Jakie dane przechowuje wtyczka

Wtyczka zapisuje wyłącznie swoje ustawienia, w pamięci przeglądarki (`storage`):

- stan włączenia, wartości suwaków (jasność, kontrast, sepia, nasycenie, odcień, szarość) i presety,
- listy stron z wyjątkami, ustawienia dla wybranych domen i własne reguły CSS,
- ustawienia automatyzacji: godziny harmonogramu albo współrzędne geograficzne.

Jeśli masz włączoną synchronizację w przeglądarce, przeglądarka może synchronizować te ustawienia między Twoimi urządzeniami przez Twoje konto Google lub Mozilla. Odbywa się to na zasadach dostawcy przeglądarki — autor wtyczki nie ma dostępu do tych danych.

## Lokalizacja

Współrzędne są potrzebne tylko do automatycznego włączania trybu ciemnego od zachodu do wschodu słońca. Możesz je wpisać ręcznie albo kliknąć przycisk pobrania lokalizacji — wtedy przeglądarka zapyta o zgodę. Współrzędne są zaokrąglane do 4 miejsc po przecinku, zapisywane razem z ustawieniami i służą wyłącznie do obliczenia godziny zachodu i wschodu słońca na Twoim urządzeniu.

## Treść odwiedzanych stron

Wtyczka nakłada na stronę filtr CSS, który odwraca kolory. Żeby nie odwracać stron, które same mają tryb ciemny, sprawdza ich kolor tła i oznaczenia motywu (np. klasę `dark`). Nie czyta tekstu stron, formularzy ani historii przeglądania i niczego z nich nie zapisuje ani nie wysyła.

## Uprawnienia

- **Dostęp do wszystkich stron** — żeby nałożyć tryb ciemny na każdą odwiedzaną stronę.
- **storage** — zapis ustawień opisanych wyżej.
- **tabs, activeTab** — pokazanie domeny bieżącej karty w panelu i natychmiastowe zastosowanie zmian w otwartych kartach.
- **alarms** — automatyczne włączanie i wyłączanie według harmonogramu.

## Usunięcie danych

Wszystkie ustawienia znikają po odinstalowaniu wtyczki. Możesz je też przywrócić do domyślnych przyciskiem „Resetuj do domyślnych” w opcjach wtyczki.

## Zmiany polityki

O zmianach tej polityki informuje data na górze strony.

---

# Privacy Policy — Comet Dark Mode

Effective October 8, 2026

> **Comet Dark Mode does not collect, send or sell any data.** The extension does not connect to any server and uses no analytics or cookies.

## Who is responsible

Author: Arkadiusz Sobacki. Privacy questions: [repository issues](https://github.com/arcadiush/comet-dark-mode/issues).

## What the extension stores

The extension stores only its own settings in browser storage (`storage`):

- on/off state, slider values (brightness, contrast, sepia, saturation, hue, grayscale) and presets,
- site exception lists, per-domain settings and custom CSS rules,
- automation settings: schedule times or geographic coordinates.

If browser sync is enabled, your browser may sync these settings across your devices through your Google or Mozilla account. This is governed by your browser provider — the author of the extension has no access to this data.

## Location

Coordinates are needed only to turn dark mode on automatically from sunset to sunrise. You can enter them manually or click the button to get your location — your browser will then ask for permission. Coordinates are rounded to 4 decimal places, stored with the other settings and used only to calculate sunset and sunrise times on your device.

## Content of visited pages

The extension applies a CSS filter that inverts page colors. To avoid inverting sites that already have a dark theme, it checks their background color and theme markers (e.g. a `dark` class). It does not read page text, forms or browsing history, and does not store or send anything from them.

## Permissions

- **Access to all websites** — to apply dark mode to any page you visit.
- **storage** — to save the settings described above.
- **tabs, activeTab** — to show the current tab's domain in the popup and apply changes to open tabs immediately.
- **alarms** — to switch dark mode on and off on a schedule.

## Deleting data

All settings are removed when you uninstall the extension. You can also restore defaults with the "Resetuj do domyślnych" (Reset to defaults) button in the extension options.

## Changes

Changes to this policy are indicated by the date at the top of the page.
