# Supported JavaScript features and coding styles

> *tl;dr:* the game engine is a classic "ES5" JavaScript project and needs caution. The editor is a modern, shiny codebase with bundling and latest JavaScript features.

## For the game engine (GDJS) and extensions

Most of the game engine and extensions are written using "classic" JavaScript "ES5" syntax, i.e: using `function` and `var` for declaring functions. "Classes" are declared using `function` for the constructor, and function declared on the `prototype` of the class for methods.

> ℹ️ This was done to ensure a maximum compatibility with browsers. Some features like arrow functions and let/const are getting gradually supported everywhere, but not everything from latest JavaScript proposals is getting implemented at the same speed. Some players can also use older browsers 😢

Hence the recommendation **currently** is to stay with "ES5" syntax and do a *cautious adoption* of new features. If you know that your extension will only be used on evergreen browsers and platforms like Electron, arrow functions and const/let are good practice.

> Android 4.x is supported by GDevelop so we still need to avoid fat arrows functions (`=>`) and `let`/`const`.

In the **future**, we might default to newer JavaScript syntax if supported on most platforms (and potentially run a "codemod" to transform and modernize the whole codebase).

### Can I declare variables in the global scope? (i.e: what about bundling?)

In short: no.

The game engine and extensions don't have any advanced bundling applied using Webpack.
This means that all the JS files from the game engine/extensions are living in the "global scope". Hence, if you writing `var myVariable = 1;` outside of a function, then `myVariable` will be a global variable.

This is problematic because global variables are polluting the global namespace and, worse, can be overriden by other extensions/scripts.

To avoid this:

* Always declare your objects and functions as part of `gdjs`: `gdjs.MyExtension = {};`, `gdjs.MyExtension.someStaticVariableOrFunction`...
* For objects/behaviors, the convention is to attach them to `gdjs` too: `gdjs.MyRuntimeObject`, `gdjs.MyRuntimeBehavior`...
* More generally, don't use `var something = blabla` outside of any function or object.

### What about typing?

> ℹ️ Typing is adding annotation about the type of variables, to enable auto completion and have automatic verification for bugs.

It's recommended to add **[JSDoc annotation](https://jsdoc.app/index.html)** so that the game engine and your extensions can have:
* *documentation* auto-generated
* *auto-completion* provided by **[Typescript](https://www.typescriptlang.org/)**.
* in the **future**, static verification for bugs with **Typescript**.

### What about code formatting?

In the future, the whole codebase will be run through Prettier to be autoformatted.
It's a good idea to start using it now on your new extensions (install the extension in your IDE).

## For the editor (`newIDE/app`)

The editor sources are processed by Babel, which *transpiles* the JavaScript latest features so that they run on older browsers. Thus, it's fine to use **all the latest and greatest** syntax and features 🎉

All source files should use the arrow function (`=>`), `class`, `let`/`const` and anything that makes the codebase more readable, concise and less error prone.

### Can I declare variables in the global scope? (i.e: what about bundling?)

In short: you don't need to worry because all files are bundled.

This is because the editor sources are bundled with Webpack. Anything that you declare is scoped to the file - the only thing available outside are the thing that you expose with `export` and that you `import` something else. The joy!

### What about typing?

The codebase is typed using **[Flow](https://flow.org/)**. It's a powerful typechecker that does not require any recompilation.

Annotations can be added directly in the code (not in JSDoc annotations, contrary to the game engine) as they are understood and removed by Babel, and analyzed by Flow.

While properly typing can be seen as cumbersome, it's something that is rather quick to learn and force developers to think about what they are using. It's also an invaluable tool to do refactoring, and ensure that any addition/removal is not breaking anything  🎉. It also provides autocompletion (like in VSCode, with the Flow Language Support plugin).

### What about code formatting?

All the code is auto formatted with Prettier. Install it in your IDE/text editor and never think about formatting again in your life. The joy! 🎉
