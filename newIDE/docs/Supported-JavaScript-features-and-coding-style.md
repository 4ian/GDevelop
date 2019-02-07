# Supported JavaScript features and coding styles

## For the game engine (GDJS) and extensions

Most of the game engine and extensions are written using "classic" JavaScript "ES5" syntax, i.e: using `function` and `var` for declaring functions. "Classes" are declared using `function` for the constructor, and function declared on the `prototype` of the class for methods.

> ℹ️ This was done to ensure a maximum compatibility with browsers. Some features like arrow functions and let/const are getting gradually supported everywhere, but not everything from latest JavaScript proposals is getting implemented at the same speed. Some players can also use older browsers 😢

Hence the recommendation **currently** is to stay with "ES5" syntax and do a *cautious adoption* of new features. If you know that your extension will only be used on evergreen browsers and platforms like Electron, arrow functions and const/let are good practice.

In the **future**, we might default to newer JavaScript syntax if supported on most platforms (and potentially run a "codemod" to transform and modernize the whole codebase).

### What about typing?

> ℹ️ Typing is adding annotation about the type of variables, to enable auto completion and have automatic verification for bugs.

It's recommended to add JSDoc annotation so that the game engine and your extensions can have:
* *documentation* auto-generated
* *auto-completion* provided by **[Typescript]**.
* in the **future**, static verification for bugs with **Typescript**.

### What about code formatting?

In the future, the whole codebase will be run through Prettier to be autoformatted.
It's a good idea to start using it now on your new extensions (install the extension in your IDE).

## For the editor (`newIDE/app`)

The editor sources are processed by Babel, which *transpiles* the JavaScript latest features so that they run on older browsers. Thus, it's fine to use **all the latest and greatest** syntax and features 🎉

All source files should use the arrow function (`=>`), `class`, `let`/`const` and anything that makes the codebase more readable, concise and less error prone.

### What about typing?

The codebase is typed using **[Flow](https://flow.org/)**. It's a powerful typechecker that does not require any recompilation.

Annotations can be added directly in the code (not in JSDoc annotations, contrary to the game engine) as they are understood and removed by Babel, and analyzed by Flow.

While properly typing can be seen as cumbersome, it's something that is rather quick to learn and force developers to think about what they are using. It's also an invaluable tool to do refactoring, and ensure that any addition/removal is not breaking anything  🎉. It also provides autocompletion (like in VSCode, with the Flow Language Support plugin).

### What about code formatting?

All the code is auto formatted with Prettier. Install it in your IDE/text editor and never think about formatting again in your life 🎉
