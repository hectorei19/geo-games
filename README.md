# Geomingo

Daily geography games. Better with friends. Home page live at https://hectorei19.github.io/geo-games/

- Countries: https://hectorei19.github.io/country-grid/
- Cities: https://hectorei19.github.io/city-grid/
- Connections: https://hectorei19.github.io/connections/
- Top 10: https://hectorei19.github.io/top10/
- Silhouette: https://hectorei19.github.io/silhouette/

`index.html` is the home page, styled as a departures board: Mingo counts today's stamps, one trip per game with its gate (A1, A2, B1, B2, C1) and its real state ("Play" or "✓ score"), and Play with friends (rooms in Countries and Silhouette). "Played today" reads each game's own save on this device, so it only works on the live site (same origin as the games).

## The brand: `brand/`

One source for every game. The games load these files from `../geo-games/brand/`:

- `geomingo.css` – the travel / passport look: colour tokens (paper, navy cover, coral, gold, stamp inks; light and dark, `data-theme`), the fonts Archivo, Public Sans and Courier Prime, the brand components (`gm-*`: header with the GeoPass button, theme button, Mingo's bubble, departures board, stamps, big buttons, result card, GeoPass booklet, toast) and the games' common pieces (panel, buttons, grid, answer sheet, Menu) in the brand's look. Load it after the game's own styles.
- `mingo.js` – `window.Geomingo`: Mingo in his poses (`mingo('pass'|'happy'|'sad'|'think'|'head', width)`), his speech bubble (`hello`), the shared header (`header`), the result card (`resultWindow`), the GeoPass (`stamp`, `stamps`, `stampsToday`, `openPass`), the list of games with their gates, "played today" and today's score (`GAMES`, `result`, `nextGame`) and the streak. Load it in the `<head>`, before the page's own scripts: it applies the saved light/dark choice before anything is drawn.
- `icons/` – favicon and app icons (Mingo's head), `og.png` – the picture shown when a link is shared, `site.webmanifest`.

Saved on the device by the brand (new keys; the games' own keys never change): `gm-theme` (light or dark, for every game), `gm-days` (days with at least one daily game played, for the streak; filled in the first time from the games' histories) and `gm-pass` (the GeoPass: total stamps and the last 240, one stamp per right answer in any game; filled in the first time from the games' histories).

A game marked `soon:true` in `GAMES` (`brand/mingo.js`) shows as "Coming soon" and is left out of the menus.

Publishing: change the `?v=` number after the brand files in each page, so phones load the new files. Publish this repository before the games that use a new brand file.
