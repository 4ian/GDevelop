function createTempFile(callback) {
	var TMP_FILENAME = "file.tmp";
	requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
		function create() {
			filesystem.root.getFile(TMP_FILENAME, {
				create : true
			}, function(entry) {
				callback(entry);
			}, onerror);
		}

		filesystem.root.getFile(TMP_FILENAME, null, function(entry) {
			entry.remove(create, create);
		}, create);
	});
}
