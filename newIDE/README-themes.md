# GDevelop Themes

Themes are a consistent set of colors and other styles that unify the look and feel of the application.  

## How themes are handled

Theme styles are held in a `theme.json`, which is used to generate:

- A `.css` file, containing the styles as CSS Custom Properties. These properties are set by applying the theme class
to specific sections of the app. To see where the properties are used, see the stylesheets in the `Global` folder.
- A `.json` file, containing the styles as a flat object, where each style is a field. This is imported and used by the Material UI library
as well as custom components

They are created by leveraging [Style Dictionary](https://amzn.github.io/style-dictionary) to compile them from `theme.json` using
the `build-theme-resources` script in the scripts folder. There is also an npm script to run it (`build-theme-resources`).

## Creating new themes

Themes are stored in [this Theme Folder](./app/src/UI/Theme). Each theme has its own subfolder containing  

- A javascript file (`index.js`) to generate the object describing the theme that is used by the editor (class names, values to apply to Material-UI) and that also imports the css file.
- The `theme.json` file which stores the theme details (colors, widths, etc.)

To create the necessary files, run the following command:

```bash
npm run create-new-theme "<Theme Name>"
```

This will create the files `index.js`, `theme.json` and the folder to contain them, with the theme name filled in and some default values.
It will also update files in the root directory, as well as recompile all themes (including the new one).

## Editing a theme

To edit a theme, make any changes in the `theme.json` file, and then run

```bash
npm run build-theme-resources
```

to compile the styles into the `.css` and `.json` files. This command will need to be run any time changes are made.
