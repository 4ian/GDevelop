## Update filters libraries

- Clone [Pixi Filters](https://github.com/pixijs/filters) repository `git@github.com:pixijs/filters.git`
- Checkout a release tag.
- Apply the following patch to build `life` libraries.

```Diff
diff --git a/rollup.config.js b/rollup.config.js
index 39a001c..86bb3a9 100644
--- a/rollup.config.js
+++ b/rollup.config.js
@@ -44,15 +44,33 @@
         const freeze = false;
         const builds = [];
 
+        const name = '__filters';
+        const footer = `Object.assign(PIXI.filters, ${name});`;
+        globals = Object.assign({
+            '@pixi/core': 'PIXI',
+            '@pixi/filter-alpha': 'PIXI.filters',
+            '@pixi/filter-blur': 'PIXI.filters'
+        }, globals);
+
         builds.push({
             input,
             output: [
+                // {
+                //     file: path.join(basePath, main),
+                //     format: 'cjs',
+                //     freeze,
+                //     sourcemap,
+                //     banner,
+                // },
                 {
+                    name,
+                    banner,
+                    globals,
                     file: path.join(basePath, main),
-                    format: 'cjs',
+                    format: 'iife',
+                    footer,
                     freeze,
                     sourcemap,
-                    banner,
                 },
                 {
                     file: path.join(basePath, module),
@@ -74,13 +92,6 @@
         // we'll use this to generate the bundle file
         // this will package all dependencies
         if (bundle) {
-            const name = '__filters';
-            const footer = `Object.assign(PIXI.filters, ${name});`;
-            globals = Object.assign({
-                '@pixi/core': 'PIXI',
-                '@pixi/filter-alpha': 'PIXI.filters',
-                '@pixi/filter-blur': 'PIXI.filters'
-            }, globals);
             builds.push({
                 input,
                 external: Object.keys(globals),
```
- Copy all the library files into a folder.

```
mkdir dist
find filters/ -type f -name 'filter-*.js' -exec cp '{}' dist/ ';'
```

- Move them to `Extensions/Effects/pixi-filters`.
- Remove `//# sourceMappingURL=filter-.*.js.map` with a search and replace.