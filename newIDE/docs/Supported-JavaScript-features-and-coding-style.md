# Supported JavaScript features and coding styles

> _tl;dr:_ the game engine/extensions are written in TypeScript and can uses "modern" JavaScript but cautiously. The editor is a modern, shiny codebase with bundling and latest JavaScript features.

## For the game engine (GDJS) and extensions

### Use TypeScript and ES6 ("modern JavaScript"), but very cautiously

The code of the game engine and extensions are written in TypeScript in "ES6", notably with:

- `const`/`let`,
- arrow functions (`=>`)
- `Class`es,
- but with a _cautious adoption_ of any other new features.

This is because neither Android 4.x nor Internet Explorer 11 are supported - but some old version of Chrome, Safari, Firefox and Edge are still used and may not support some newest features. Notably, avoid "Shorthand property names", avoid object spread, avoid array spread.

### Make simple, garbage free code

Games in JavaScript are very sensitive to the **issue of garbage collection**: a code that would create too much garbage variables/functions will not perform well because the JS engine will have to do too much garbage collection and will cause frame drops.

- Avoid any "clever" code that would create functions at runtime.
- Ensure you **allocate memory** (creating objects, arrays etc...) only once at the beginning whenever possible.
- **Reuse objects** if it makes sense. Scrutinize any creation of object (`{}`) or array (`[]`) and see if you could avoid it.
- Don't use the dynamic nature of JavaScript too much. Declare **all your properties at the object creation**, to ease the work of the JS engine (read this article about [hidden classes](https://richardartoul.github.io/jekyll/update/2015/04/26/hidden-classes.html)).

### What about typing?

The codebase is typed using **[TypeScript](https://www.typescriptlang.org/)**.

It's good practice to type almost everything (i.e: avoid `any` as much as possible), so that the game engine and your extensions can have _documentation_ auto-generated, _auto-completion_ and _static type checking_ that will catch bugs and mistakes.

Learn how to launch [manually the type checking in GJDS README](../../GDJS/README.md).

## For the editor (`newIDE/app`)

The editor sources are processed by Babel, which _transpiles_ the JavaScript latest features so that they run on older browsers. Thus, it's fine to use **all the latest and greatest** syntax and features 🎉

All source files should use the arrow function (`=>`), `class`, `let`/`const` and anything that makes the codebase more readable, concise and less error prone.

### What about typing?

The codebase is typed using **[Flow](https://flow.org/)**. It's a powerful typechecker that does not require any recompilation. It's very similar to TypeScript

> The IDE is using Flow and not TypeScript for historical reasons. Apart from a few differences, it should not be difficult to get used to the Flow syntax.

While properly typing can be seen as cumbersome, it's something that is rather quick to learn and force developers to think about what they are using. It's also an invaluable tool to do refactoring, and ensure that any addition/removal is not breaking anything. It also provides autocompletion (like in VSCode, with the Flow Language Support plugin).

## What about code formatting?

All the code of the game engine and the IDE is auto formatted with Prettier (run `npm run format` in `newID/app` and in `GDJS` folder). Install it in your IDE/text editor and never think about formatting again in your life. The joy! 🎉
