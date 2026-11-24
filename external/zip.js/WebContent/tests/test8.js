var FILENAME = "lorem.txt", URL = "lorem.txt";

var zipFs = new zip.fs.FS();

function onerror(message) {
	console.error(message);
}

function zipText(callback) {
	zipFs.root.addHttpContent(FILENAME, URL);
	zipFs.exportBlob(callback);
}

function unzipBlob(blob, callback) {
	zipFs.importBlob(blob, function() {
		var firstEntry = zipFs.root.children[0];
		firstEntry.getText(callback);
	}, onerror);
}

function logText(text) {
	console.log(text);
	console.log("--------------");
}

zipText(function(zippedBlob) {
	unzipBlob(zippedBlob, function(unzippedText) {
		logText(unzippedText);
	});
});
