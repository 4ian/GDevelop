var TEXT_CONTENT = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";
var FILENAME = "lorem.txt";

var dataURI = "data:text/plain;base64," + btoa(TEXT_CONTENT);

function onerror(message) {
	console.error(message);
}

function zipDataURI(dataURI, callback) {
	zip.createWriter(new zip.BlobWriter("application/zip"), function(zipWriter) {
		zipWriter.add(FILENAME, new zip.Data64URIReader(dataURI), function() {
			zipWriter.close(callback);
		});
	}, onerror);
}

function unzipBlob(blob, callback) {
	zip.createReader(new zip.BlobReader(blob), function(zipReader) {
		zipReader.getEntries(function(entries) {
			entries[0].getData(new zip.Data64URIWriter("text/plain"), function(data) {
				zipReader.close();
				callback(data);
			});
		});
	}, onerror);
}

function logDataURI(dataURI) {
	console.log(dataURI);
	console.log("--------------");
}

logDataURI(dataURI);
zipDataURI(dataURI, function(zippedBlob) {
	unzipBlob(zippedBlob, function(unzippedDataURI) {
		logDataURI(unzippedDataURI);
	});
});
