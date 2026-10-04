# Task 5: Capstone (advanced portfolio)

Single-page portfolio with: theme toggle (saved), scroll-spy nav, project tag filter + search,
skills filter/sort, notes app (localStorage), validated contact form.

## Folders
- `src/`  readable source (edit these)
- `dist/` optimized build (submit or host this folder)
- `build.cjs` minifier script (esbuild)

## Run
Open `dist/index.html` directly, or rebuild after editing `src/`:

    npm install
    npm run build

## Performance choices
- 2 requests on first load: the HTML (with the minified CSS inlined) and one JS file (`defer`, so it never blocks rendering)
- No web fonts or libraries: system font stack, vanilla JS
- Project images are SVG, `loading="lazy"` with width/height set (no layout shift); none load until scrolled near
- Favicon is an inline data URI (no extra request)
- CSS/JS minified with browser targets (Chrome 90, Firefox 90, Safari 14, iOS 14), which also adds needed vendor prefixes
- Theme is applied by a tiny inline script before first paint (no flash of the wrong theme)

## Contact form (no backend needed)
Edit two constants near the bottom of `src/app.js`, then run `npm run build`:
- `CONTACT_EMAIL`: your real address (also fills the email link in the Contact section)
- `FORM_ENDPOINT`: optional free Formspree or Web3Forms URL. With it, messages land in your inbox.
  Left empty, the form opens the visitor's email app with the message pre-filled.

## Compatibility choices
- `localStorage` wrapped in try/catch (Safari private mode can throw)
- `IntersectionObserver` is feature-checked
- Inputs use 16px text so iOS Safari does not zoom on focus
- `position: -webkit-sticky` fallback, `env(safe-area-inset-bottom)` for iPhone notch/home bar
- `color-scheme` set so native form controls match the theme
- No `color-mix`, `:has()`, or other very new CSS

## Manual test checklist (Chrome, Firefox, Safari, mobile)
1. Page loads with no console errors
2. Menu button opens/closes the nav below 768px; links scroll to the right section
3. Dark/Light toggle works and survives a refresh
4. Project chips and search filter the cards; empty state appears for no match
5. Skills sliders/sort work
6. Add, edit, delete a note; refresh and confirm it persists
7. Submit the contact form empty, with a bad email, then valid
8. No horizontal scrolling at 320px wide
9. Rotate a phone: layout stays intact; tap targets are comfortable

## Credits
Brand logos (Java/OpenJDK, JavaScript, Spring Boot, MySQL, HTML5, React) come from the Simple Icons project (CC0).
The logos are trademarks of their owners. Skills without an official logo use simple generated badges.
