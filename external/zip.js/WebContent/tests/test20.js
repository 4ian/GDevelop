var requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.msRequestFileSystem || window.requestFileSystem;
var filesystem, zipFs = new zip.fs.FS();
var THRESHOLD = 150;

function onerror(message) {
	console.error(message);
}

function generateFs(entry, onend, onerror) {
	var i = 0;

	function next() {
		i++;
		generateNextEntry();
	}

	function generateNextEntry() {
		if (i <= THRESHOLD)
			entry.getFile(i, {
				create: true
			}, next, onerror);
		else
			onend();
	}

	next();
}

function checkZipFileSystemSize() {
	zipFs.root.addFileEntry(filesystem.root, function() {
		console.log(zipFs.root.children.length === THRESHOLD);
	}, onerror);
}

requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(fs) {
	filesystem = fs;
	generateFs(filesystem.root, checkZipFileSystemSize, onerror);
}, onerror);
