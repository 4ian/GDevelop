var TEXT_CONTENT = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";
var requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.msRequestFileSystem || window.requestFileSystem;
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

function addFileEntryAndReadFile(fileEntry, callback) {
	zipFs.root.addFileEntry(fileEntry, function() {
		var zipEntry = zipFs.root.getChildByName("lorem.txt");
		zipEntry.getText(callback);
	}, onerror);
}

function logText(text) {
	console.log(text);
	console.log("--------------");
}

function initFileSystem(callback) {
	filesystem.root.getFile("lorem.txt", {
		create : true
	}, function(fileEntry) {
		fileEntry.createWriter(function(writer) {
			writer.onwrite = function() {
				callback(fileEntry);
			};
			writer.onerror = onerror;
			writer.write(new Blob([ TEXT_CONTENT ], {
				type : "text/plain"
			}));
		}, onerror);
	}, onerror);
}

function test() {
	initFileSystem(function(fileEntry) {
		addFileEntryAndReadFile(fileEntry, function(text) {
			logText(text);
		}, onerror);
	});
}

requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(fs) {
	filesystem = fs;
	removeRecursively(filesystem.root, test, onerror);
}, onerror);
