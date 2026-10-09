var zipFs = new zip.fs.FS();

function onerror(message) {
	console.error(message);
}

function logText(text) {
	console.log(text);
	console.log("--------------");
}

zipFs.importHttpContent("lorem.zip", false, function() {
	var firstEntry = zipFs.root.children[0];
	firstEntry.getText(function(data) {
		logText(data);
	});
}, onerror);
