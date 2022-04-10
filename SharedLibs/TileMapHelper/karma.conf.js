module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    browserNoActivityTimeout: 400000,
    client: {
      mocha: {
        reporter: 'html',
        timeout: 10000,
      },
    },
    files: [
            { pattern: "node_modules/expect.js/index.js" },
            { pattern: "./src/**/*.ts" }
    ],
	preprocessors: {
		"**/*.ts": 'karma-typescript'
	},
    reporters: ['dots', 'karma-typescript'],
    singleRun: true,
	karmaTypescriptConfig: {
		compilerOptions: {
			module: "commonjs",
			noImplicitAny: true,
			outDir: "tmp",
			target: "ES5",
			sourceMap: true,
			types : [
				"mocha",
				"expect.js"
			],
			lib: ["DOM", "ES5", "ES2015"],
		},
		exclude: ["node_modules"]
	}
  });
};
