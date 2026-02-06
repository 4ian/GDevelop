var URL = "lorem_store.zip";

var zipFs = new zip.fs.FS();

function onerror(message) {
	console.error(message);
}

function zipImportedZip(callback) {
	var directory = zipFs.root.addDirectory("import");
	directory.importHttpContent(URL, false, function() {
		zipFs.exportBlob(callback);
	}, onerror);
}

function unzipBlob(blob, callback) {
	zipFs.importBlob(blob, function() {
		var directory = zipFs.root.getChildByName("import");
		var firstEntry = directory.children[0];
		firstEntry.getText(callback);
	}, onerror);
}

function logText(text) {
	console.log(text);
	console.log("--------------");
}

zipImportedZip(function(zippedBlob) {
	unzipBlob(zippedBlob, function(unzippedText) {
		logText(unzippedText);
	});
});
