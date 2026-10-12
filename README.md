# Reiveaux: Métamorphose

**Play:** https://leroy-jenkins-x.github.io/reiveaux/

A portrait, manga-style interactive fantasy about Monsieur Reiveaux building a game, joyfully embracing an unexpected transformation into a woman, and earning admiration and a fortune while continuing to create. The player leaves with a playable first-game concept.

## The illustrated edition

Tap the artwork or dialogue to continue the story. Choices, corridors, seals, dice, and doors respond directly to taps, with short magical ripples. In the tactical encounter, tapping a neighboring tile moves Reiveaux and performs the matching action; movement and spell-slot limits still apply.

The main adventure fits the viewport: no vertical chapter scrolling and no page refresh between scenes. Large painted artwork, short captions, speech bubbles, and tap-to-advance panels replace the long prose chapters. Back navigation and browser-local save/resume keep the player’s place. Only the optional notebook and full-art viewer scroll.

During play, the navbar is removed. A small floating options button opens the notebook, previous panel and full-art viewer without reserving a navigation strip.

Dice throws automatically use the full 4.4-second ritual: a real numbered, 20-face solid with obsidian facets and gold edges materializes, spins on three axes, flies, bounces, rolls across a glowing rune circle, and settles on the actual result. Trails, multiple contact shockwaves, sparks, shadows follow the throw. The renderer caches the background and numbered glyphs, avoids repeated blur and facet-gradient work, and uses a lighter pixel budget. The die spins more slowly with a continuous bounce-and-roll path. The result and modifier remain visible until **Keep this roll**. **Replay the throw** replays the same result without rerolling or changing progress. Advantage throws two dice; the player’s risky prototype route uses the same animation. Per the requested experience, dice animation plays automatically even when reduced motion is enabled; other decorative motion still respects that preference.

This is a silent tap adventure. Sound controls, playback code, audio assets, and audio-generation scripts have been removed.

Before the page-nine mirror reveal, an animated suspense splash asks what Reiveaux is becoming: a dragon, or a croissant with extremely strong opinions? The guesses unfold over approximately ten seconds, leaving 2.4–4.6 seconds for each before the next appears. The last line stays until the player presses **Look in the mirror**. **Replay transformation** appears beneath Continue on both revealed mirror panels and replays the entire sequence without changing the current panel, choices, or game progress. Refreshing during the initial splash resumes before the reveal, preserving the story beat.

Captions and speech occupy separate rows above and below the illustration; neither can overlap the character. Individual image crops keep Reiveaux’s face prominent. The next-action button pulses with warm gold magic. Hints glow violet and carry small animated sparkles.

After implementing the tactical encounter, Reiveaux steps into an original, Zelda-inspired living temple. Tap a path or rune to walk there, and tap a roaming wisp to cast magic. The touch D-pad, arrow keys, and WASD remain available. Gather three floating runes, pulse magic to stun patrolling wisps, and unlock the northern portal; that rescued rune leads directly into the mirror transformation. Animated walking, cloak motion, flames, water, particles, orbiting runes, and portal light make it a playable scene. A wisp returns you to your last rune without losing collected progress. **Hint** automatically plays one legal movement step with a short protective shimmer. Existing saves migrate without moving players to a different story beat.

The floating **⋯** story menu includes **Play the living temple** for a direct jump, and the completed temple can be replayed. These reset that mini-scene alone, preserving the player’s other choices and prototype.

Fantasy effects include drifting magical particles, scene entrances, speech-bubble motion, corridor enchantments, character hops, igniting seals, spell and healing effects, a suspenseful mirror transformation, and a shower of gold in the finale. Reduced-motion preferences skip decorative movement while retaining the requested full dice throw.

All four original illustrations are retained unchanged. The story takes a few minutes to read; the puzzles and prototype provide the rest of a short, roughly ten-minute session at the player’s pace.

## Playable interactions

- Rotate a 4×4 dungeon’s corridors and test a connected route from entrance to exit. An optional hint lights the relevant tiles.
- **Hint** automatically completes the next corridor or a safe legal encounter turn. It works from partial puzzle progress and restores depleted encounter resources when necessary. Dice and prototype scenes also offer an automatic next-action hint.
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

The included GitHub Actions workflow validates and builds `dist/`, then publishes to GitHub Pages on each push to `main`. Pages source is **GitHub Actions**. All asset URLs are relative and work under `/reiveaux/`. Only the current experience is deployed at the regular URL. The build fingerprints JavaScript and CSS filenames to refresh browser caches; no version query is needed. Old shared `?v=` links open the current story and remove that obsolete parameter.

`story.js` owns the short panels and design options; `engine.js` owns testable puzzles, dice, state, and the exported plan; `dice.js` renders animated throws; `app.js` and `style.css` own the fixed-screen UI. `tests/engine.test.js` checks puzzle connectivity, legal movement, slot costs, recovery, probability boundaries, complete story paths, persistence, helper behavior across varied puzzle states, and dice geometry/result correspondence.

The current illustrated edition stores progress separately from the original prose edition, preserving the older browser-local record. No analytics, account, external fonts, or runtime services are required. Keyboard controls and reduced motion are supported, and dynamic text is escaped.

## Credits

Original world and fictional story. Four built-in AI-generated illustrations; see `ART_DIRECTION.md` for the original prompts and asset paths. Rules are independently summarized from the official [Playing the Game](https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game) and [Rules Glossary](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary). Dungeons & Dragons belongs to Wizards of the Coast. This project is independent and unaffiliated.
