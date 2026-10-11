# The Maker’s Spell

A portrait-first, illustrated, roughly ten-minute interactive fantasy designed to motivate someone to make their own game. Monsieur Reiveaux builds a dungeon prototype throughout an epic adventure, is unexpectedly transformed into a woman and joyfully embraces it, then earns admiration and a fortune while continuing to create.

**Play:** https://leroy-jenkins-x.github.io/reiveaux/

## Experience

- Twelve chapters, four original fantasy illustrations, meaningful branching choices, and an always-successful story arc with varied setbacks.
- D&D-inspired skill checks and proficiency, real random d20 rolls, advantage/disadvantage explanations, one Heroic Inspiration reroll, a legal turn planner, spell-slot spending, Hit Die healing, rest choices, and a concentration saving throw.
- Every decision adds an implemented rule and design lesson to the builder’s notebook.
- Final editable game concept, a twenty-minute first-prototype checklist, and plain-text download/copy.
- Mobile portrait layout, full-art viewer, keyboard controls, semantic forms, reduced-motion support, optional gentle sound, and browser-local save/resume. No account, analytics, external fonts, or runtime dependencies.

## Develop and check

Requires Node 22 or later. There are no packages to install.

```sh
npm run check
npm test
npm run build
```

Serve `dist/` with a static server to run ES modules. All asset paths are relative and work at GitHub Pages’ `/reiveaux/` path. The source files are also directly static-servable.

## Publish

In repository **Settings → Pages**, choose **GitHub Actions** as the source. The included workflow checks all narrative branches, builds `dist/`, and publishes it on pushes to `main` or through **Run workflow**. It uses GitHub’s official Pages actions with `contents: read`, `pages: write`, and `id-token: write` permissions. No deploy key or personal token is needed after Pages is enabled.

## Files

- `story.js`: narrative, decisions, illustration descriptions, and design lessons.
- `engine.js`: testable state transitions, dice, resources, persistence validation, and exported game plan.
- `app.js` / `style.css`: responsive UI and interactions.
- `assets/`: optimized illustrations and original favicon.
- `ART_DIRECTION.md`: final illustration prompts and asset provenance.
- `tests/engine.test.js`: probability boundaries, resources, rerolls, persistence, and every story branch.

## Inspiration and credits

Original fictional world and story. Mechanics are independently summarized from the official [D&D Playing the Game](https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game) and [Rules Glossary](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary). The original prototype spells, Signalcraft feature, narrative fallbacks, and resource outcomes are simplifications for this story. It is not a complete D&D rules implementation. Dungeons & Dragons is a trademark of Wizards of the Coast. This project is independent and unaffiliated.

Four story illustrations were made with the built-in image-generation tool. Image prompts and optimized asset paths are documented in `ART_DIRECTION.md`.

Progress and game ideas are saved only in the visitor’s local browser storage. The download provides a portable copy of the visitor’s game plan.
