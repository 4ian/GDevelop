var requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.msRequestFileSystem || window.requestFileSystem;
var URL = "lorem2.zip";
var filesystem, zipFs = new zip.fs.FS();

function onerror(message) {
	console.error(message);
}

function removeRecursively(entry, onend, onerror) {
	var rootReader = entry.createReader();
	rootReader.readEntries(function(entries) {
		var i = 0;

		function next() {
			i++;
			removeNextEntry();
		}

		function removeNextEntry() {
			var entry = entries[i];
			if (entry) {
				if (entry.isDirectory)
					removeRecursively(entry, next, onerror);
				if (entry.isFile)
					entry.remove(next, onerror);
			} else
				onend();
		}

		removeNextEntry();
	}, onerror);
}

function importZipToFilesystem(callback) {
	zipFs.importHttpContent(URL, false, function() {
		zipFs.root.getFileEntry(filesystem.root, callback, null, onerror);
	}, onerror);
}

function logFile(file) {
	var reader = new FileReader();
	reader.onload = function(event) {
		console.log(event.target.result);
		console.log("--------------");
	};
	reader.onerror = onerror;
	reader.readAsText(file);
}

function test() {
	importZipToFilesystem(function() {
		filesystem.root.getDirectory("aaa", null, function(directoryEntry) {
			directoryEntry.getDirectory("ccc", null, function(directoryEntry) {
				directoryEntry.getFile("lorem.txt", null, function(fileEntry) {
					fileEntry.file(logFile, onerror);
				}, onerror);
			}, onerror);
		}, onerror);
	}, onerror);
}

requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(fs) {
	filesystem = fs;
	removeRecursively(filesystem.root, test, test);
}, onerror);
