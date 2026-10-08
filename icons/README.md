# Ikony Wtyczki

Ikona na pasku pokazuje stan wtyczki (ustawia ją `updateIcon()` w `background/background.js`):

- **Włączona** — kolorowe słońce: `icon-16/32/48/128.png` (źródło: `sun-source.svg`)
- **Wyłączona** — szare słońce: `icon-off-16/32/48/128.png` (źródło: `sun-off-source.svg`)

Renderowanie z SVG:

```bash
for s in 16 32 48 128; do rsvg-convert -w $s -h $s sun-source.svg -o icon-$s.png; rsvg-convert -w $s -h $s sun-off-source.svg -o icon-off-$s.png; done
```

Gradient w SVG ma `gradientUnits="userSpaceOnUse"` — przy domyślnym `objectBoundingBox`
poziome i pionowe promienie (zerowa wysokość/szerokość) nie dostają koloru.

Stare ikony `icon-light-*` / `icon-dark-*` nie są już używane.
