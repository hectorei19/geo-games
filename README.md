# Geomingo

Daily geography games. Better with friends. Home page live at https://hectorei19.github.io/geo-games/

- Countries: https://hectorei19.github.io/country-grid/
- Cities: https://hectorei19.github.io/city-grid/ (coming soon)
- Connections: https://hectorei19.github.io/connections/
- Top 10: https://hectorei19.github.io/top10/
- Silhouette: https://hectorei19.github.io/silhouette/

`index.html` is the home page: Mingo says hello and counts today's games, one card per game with its real state ("Play" or "✓ score"), and Play with friends (Countries' rooms). "Played today" reads each game's own save on this device, so it only works on the live site (same origin as the games).

## The brand: `brand/`

One source for every game. The games load these files from `../geo-games/brand/`:

- `geomingo.css` – colour tokens (light and dark, `data-theme` like the demo), Fredoka and Nunito, the brand components (`gm-*`: header, streak pill, theme button, Mingo's bubble, cards, big buttons, bottom sheet, result window, toast) and the games' common pieces (panel, buttons, grid, answer sheet, Menu) in the brand's look. Load it after the game's own styles.
- `mingo.js` – `window.Geomingo`: Mingo in four poses (`mingo('hello'|'think'|'happy'|'sad', width)`), his speech bubble (`hello`), the shared header (`header`), the result window (`resultWindow`), the list of games with "played today" and today's score (`GAMES`, `result`, `nextGame`) and the streak. Load it in the `<head>`, before the page's own scripts: it applies the saved light/dark choice before anything is drawn.
- `icons/` – favicon and app icons (Mingo's head), `og.png` – the picture shown when a link is shared, `site.webmanifest`.

Saved on the device by the brand (new keys; the games' own keys never change): `gm-theme` (light or dark, for every game) and `gm-days` (days with at least one daily game played, for the streak; filled in the first time from the games' histories).

To open Cities when City Grid is live: remove `soon:true` from its line in `GAMES` in `brand/mingo.js`.

Publishing: change the `?v=` number after the brand files in each page, so phones load the new files. Publish this repository before the games that use a new brand file.
