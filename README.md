# @wahoobay/design

The Wahoo Bay design system: design tokens, component styles and the logo, shared by the wahoobay.net site and the fish-identification app. Plain CSS and SVG, no runtime dependencies.

## What is in the package

Everything consumers use is in `dist/` (committed, because consumers install from Git):

- `tokens.css` - colour, type, spacing and other custom properties.
- `fonts.css` - the `@font-face` rules.
- `components.css` - component styles built on the tokens.
- `logo/` - `wahoobay-logo.svg` and `wahoobay-mark.svg`, drawn in `currentColor`.
- `index.html` - the documentation page, showing the tokens and components.
- `media/` - the photos the documentation page uses.

## Consuming it

Add it as a Git dependency pinned to a release tag, then import the files:

```
npm install github:wahoobay/design#v1.0.0
```

```css
@import '@wahoobay/design/tokens.css';
@import '@wahoobay/design/fonts.css';
@import '@wahoobay/design/components.css';
```

Logos are available as `@wahoobay/design/logo/wahoobay-logo.svg`. The site and the fish-ID app each pin their own tag and upgrade deliberately.

## Developing

```
npm ci
npm run build   # regenerates dist/ from brand/ and src
npm test
npm run check   # the Impeccable detector on dist/index.html
```

CI rebuilds and fails if the committed `dist/` differs, so always commit the rebuilt `dist/`. Node 22 or later.

## Releasing

Releases are tagged from `main` after CI passes.

1. Add an entry for the new version at the top of `CHANGELOG.md`, rebuild, and merge to `main`.
2. Tag the `main` head and push the tag:

   ```
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. The `release` workflow runs on the tag: it builds, tests, runs the detector, checks that the committed `dist/` is current, then creates a GitHub Release with `wahoobay-design-vX.Y.Z.zip` (all of `dist/`) and `tokens.css`, `components.css` and `fonts.css` as separate assets, with generated notes.
4. A consumer upgrades by changing the tag in its pin, for example `"@wahoobay/design": "github:wahoobay/design#vX.Y.Z"`, and reinstalling.

## The mockups

`docs/mockups/` holds the two mockups from the 2026-10-29 visual-direction decision. They are the record of that decision, not a style guide: the tokens and components are the source of truth.
