# The Maker’s Spell

**Play:** https://leroy-jenkins-x.github.io/reiveaux/

A portrait, manga-style interactive fantasy about Monsieur Reiveaux building a game, joyfully embracing an unexpected transformation into a woman, and earning admiration and a fortune while continuing to create. The player leaves with a playable first-game concept.

## The illustrated edition

The main adventure fits the viewport: no vertical chapter scrolling and no page refresh between scenes. Large painted artwork, short captions, speech bubbles, and tap-to-advance panels replace the long prose chapters. Back navigation and browser-local save/resume keep the player’s place. Only the optional notebook and full-art viewer scroll.

All four original illustrations are retained unchanged. The story takes a few minutes to read; the puzzles and prototype provide the rest of a short, roughly ten-minute session at the player’s pace.

## Playable interactions

- Rotate a 4×4 dungeon’s corridors and test a connected route from entrance to exit. An optional hint lights the relevant tiles.
- Physically tap animated d20s to roll, choose a skill approach, add proficiency, spend one Heroic Inspiration reroll, and try advantage with two dice.
- Solve a 3×3 tactical encounter: move to an adjacent tile, use one action, spend two spell slots to activate distinct seals, and avoid dragon fire. A long rest and encounter revision provide recovery from a failed test.
- Test concentration with a Constitution saving throw. Both success and setbacks continue the story.
- Choose a world, a goal, and a rule for a tiny personal prototype. Play its two-door scene, then download or copy a first-game plan.

These mechanics are simplified, original prototypes inspired by D&D. Movement in the encounter is one tile per turn. Illuminate and Ward are original spells. It is not a complete D&D implementation.

## Development and publishing

Requires Node 22+. There are no dependencies to install.

```sh
npm run check
npm test
npm run build
```

The included GitHub Actions workflow validates and builds `dist/`, then publishes to GitHub Pages on each push to `main`. Pages source is **GitHub Actions**. All asset URLs are relative and work under `/reiveaux/`.

`story.js` owns the short panels and design options; `engine.js` owns testable puzzles, dice, state, and the exported plan; `app.js` and `style.css` own the fixed-screen UI. `tests/engine.test.js` checks puzzle connectivity, legal movement, slot costs, recovery, probability boundaries, complete story paths, and persistence.

The current illustrated edition stores progress separately from the original prose edition, preserving the older browser-local record. No analytics, account, external fonts, or runtime services are required. Sound is optional, keyboard controls and reduced motion are supported, and dynamic text is escaped.

## Credits

Original world and fictional story. Four built-in AI-generated illustrations; see `ART_DIRECTION.md` for the original prompts and asset paths. Rules are independently summarized from the official [Playing the Game](https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game) and [Rules Glossary](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary). Dungeons & Dragons belongs to Wizards of the Coast. This project is independent and unaffiliated.
