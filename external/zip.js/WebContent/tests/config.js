// configure all test cases.

zip.useWebWorkers = true;

// to test third party deflate implementations, comment out 'zip.workerScriptsPath =...' and uncomment 'zip.workerScripts = ...'
zip.workerScriptsPath = '../';

/*
zip.workerScripts = {
	// default zip.js implementation
	deflater: ['../z-worker.js', '../deflate.js'],
	inflater: ['../z-worker.js', '../inflate.js'],

	// zlib-asm
	// deflater: ['../z-worker.js', '../zlib-asm/zlib.js', '../zlib-asm/codecs.js'],
	// inflater: ['../z-worker.js', '../zlib-asm/zlib.js', '../zlib-asm/codecs.js'],

	// pako
	// deflater: ['../z-worker.js', '../pako/pako.min.js', '../pako/codecs.js'],
	// inflater: ['../z-worker.js', '../pako/pako.min.js', '../pako/codecs.js'],
};
*/
