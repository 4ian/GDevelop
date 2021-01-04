# Supported JavaScript features and coding styles

> _tl;dr:_ the game engine/extensions can uses "modern" JavaScript but cautiously. The editor is a modern, shiny codebase with bundling and latest JavaScript features.

## For the game engine (GDJS) and extensions

### Use ES6 ("modern JavaScript"), but very cautiously

The code of the game engine and extensions can be written in "ES6", notably with:

- `const`/`let`,
- arrow functions (`=>`)
- `Class`es,
- but with a _cautious adoption_ of any other new features.

This is because neither Android 4.x nor Internet Explorer 11 are supported - but some old version of Chrome, Safari, Firefox and Edge are still used and may not support some newest features. Notably, avoid "Shorthand property names", avoid object spread, avoid array spread.

> ℹ️ Most of the game engine and extensions used to be written using "classic" JavaScript "ES5" syntax. Notably "classes" are declared using `function` for the constructor, and function declared on the `prototype` of the class for methods.

### Make simple, garbage free code

Games in JavaScript are very sensitive to the **issue of garbage collection**: a code that would create too much garbage variables/functions will not perform well because the JS engine will have to do too much garbage collection and will cause frame drops.

- Avoid any "clever" code that would create functions at runtime.
- Ensure you **allocate memory** (creating objects, arrays etc...) only once at the beginning whenever possible.
- **Reuse objects** if it makes sense. Scrutinize any creation of object (`{}`) or array (`[]`) and see if you could avoid it.
- Don't use the dynamic nature of JavaScript too much. Declare **all your properties at the object creation**, to ease the work of the JS engine (read this article about [hidden classes](https://richardartoul.github.io/jekyll/update/2015/04/26/hidden-classes.html)).

### Can I declare variables in the global scope? (i.e: what about bundling?)

In short: no.

The game engine and extensions don't have any advanced bundling applied using Webpack.
This means that all the JS files from the game engine/extensions are living in the "global scope". Hence, if you writing `let myVariable = 1;` outside of a function, then `myVariable` will be a global variable.

This is problematic because global variables are polluting the global namespace and, worse, can be overriden by other extensions/scripts.

To avoid this:

- Always declare your objects and functions as part of `gdjs`: `gdjs.MyExtension = {};`, `gdjs.MyExtension.someStaticVariableOrFunction`...
- For objects/behaviors, the convention is to attach them to `gdjs` too: `gdjs.MyRuntimeObject`, `gdjs.MyRuntimeBehavior`...
- More generally, don't use `let something = blabla` outside of any function or object.

### What about typing?

> ℹ️ Typing is adding annotation about the type of variables, to enable auto completion and have automatic verification for bugs.

It's good practice to add **[JSDoc annotation](https://jsdoc.app/index.html)** so that the game engine and your extensions can have:

- _documentation_ auto-generated
- _auto-completion_ provided by **[Typescript](https://www.typescriptlang.org/)**.
- _static type checking_ for bugs with **Typescript**.

For the static verification, you must add `// @ts-check` at the top of your file. Learn how to [launch type checking in GJDS Readme](../../GDJS/README.md).

### What about code formatting?

In the future, the whole codebase will be run through Prettier to be autoformatted (it's partially applied now).
It's a good idea to start using it now on your new extensions (install the extension in your IDE).

## For the editor (`newIDE/app`)

The editor sources are processed by Babel, which _transpiles_ the JavaScript latest features so that they run on older browsers. Thus, it's fine to use **all the latest and greatest** syntax and features 🎉

All source files should use the arrow function (`=>`), `class`, `let`/`const` and anything that makes the codebase more readable, concise and less error prone.

### Can I declare variables in the global scope? (i.e: what about bundling?)

In short: you don't need to worry because all files are bundled.

This is because the editor sources are bundled with Webpack. Anything that you declare is scoped to the file - the only thing available outside are the thing that you expose with `export` and that you `import` something else. The joy!

### What about typing?

The codebase is typed using **[Flow](https://flow.org/)**. It's a powerful typechecker that does not require any recompilation.

Annotations can be added directly in the code (not in JSDoc annotations, contrary to the game engine) as they are understood and removed by Babel, and analyzed by Flow.

While properly typing can be seen as cumbersome, it's something that is rather quick to learn and force developers to think about what they are using. It's also an invaluable tool to do refactoring, and ensure that any addition/removal is not breaking anything 🎉. It also provides autocompletion (like in VSCode, with the Flow Language Support plugin).

### What about code formatting?

All the code is auto formatted with Prettier. Install it in your IDE/text editor and never think about formatting again in your life. The joy! 🎉
