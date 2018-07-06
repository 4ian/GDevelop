Jaguar.js template for JSDoc 3
---
- [Jaguar.js](https://davidshimjs.github.io/jaguarjs/)
- [Jaguar.js Documentations](https://davidshimjs.github.io/jaguarjs/doc/)
- [JSDoc3](https://github.com/jsdoc3/jsdoc)
- [JSDoc3 API Documentations](http://usejsdoc.org)

Usage
---
1. If you want to create documentations with sample files, you can use commands below.
```
$ npm install
$ grunt demo
```

2. You can see any output related jsdoc process with a `--debug` flag.
```
$ grunt demo --debug
```

3. If you already have jsdoc system, you can use this project as jsdoc template.
```
$ jsdoc -t `project folder` -c `configuration file` `source files` `README.md file`
```

conf.json
---
You can set options for customizing your documentations.

```
"templates": {
    "applicationName": "Demo",
    "disqus": "",
    "googleAnalytics": "",
    "openGraph": {
        "title": "",
        "type": "website",
        "image": "",
        "site_name": "",
        "url": ""
    },
    "meta": {
        "title": "",
        "description": "",
        "keyword": ""
    },
    "linenums": true
}
```

License
---
This project under the MIT License. and this project refered by default template for JSDoc 3.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/davidshimjs/jaguarjs-jsdoc/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

