/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
	"use strict";

	var CHUNK_SIZE = 512 * 1024;

	var TextWriter = zip.TextWriter, //
	BlobWriter = zip.BlobWriter, //
	Data64URIWriter = zip.Data64URIWriter, //
	Reader = zip.Reader, //
	TextReader = zip.TextReader, //
	BlobReader = zip.BlobReader, //
	Data64URIReader = zip.Data64URIReader, //
	createReader = zip.createReader, //
	createWriter = zip.createWriter;

	function ZipBlobReader(entry) {
		var that = this, blobReader;

		function init(callback) {
			that.size = entry.uncompressedSize;
			callback();
		}

		function getData(callback) {
			if (that.data)
				callback();
			else
				entry.getData(new BlobWriter(), function(data) {
					that.data = data;
					blobReader = new BlobReader(data);
					callback();
				}, null, that.checkCrc32);
		}

		function readUint8Array(index, length, callback, onerror) {
			getData(function() {
				blobReader.readUint8Array(index, length, callback, onerror);
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	ZipBlobReader.prototype = new Reader();
	ZipBlobReader.prototype.constructor = ZipBlobReader;
	ZipBlobReader.prototype.checkCrc32 = false;

	function getTotalSize(entry) {
		var size = 0;

		function process(entry) {
			size += entry.uncompressedSize || 0;
			entry.children.forEach(process);
		}

		process(entry);
		return size;
	}

	function initReaders(entry, onend, onerror) {
		var index = 0;

		function next() {
			index++;
			if (index < entry.children.length)
				process(entry.children[index]);
			else
				onend();
		}

		function process(child) {
			if (child.directory)
				initReaders(child, next, onerror);
			else {
				child.reader = new child.Reader(child.data, onerror);
				child.reader.init(function() {
					child.uncompressedSize = child.reader.size;
					next();
				});
			}
		}

		if (entry.children.length)
			process(entry.children[index]);
		else
			onend();
	}

	function detach(entry) {
		var children = entry.parent.children;
		children.forEach(function(child, index) {
			if (child.id == entry.id)
				children.splice(index, 1);
		});
	}

	function exportZip(zipWriter, entry, onend, onprogress, totalSize) {
		var currentIndex = 0;

		function process(zipWriter, entry, onend, onprogress, totalSize) {
			var childIndex = 0;

			function exportChild() {
				var child = entry.children[childIndex];
				if (child)
					zipWriter.add(child.getFullname(), child.reader, function() {
						currentIndex += child.uncompressedSize || 0;
						process(zipWriter, child, function() {
							childIndex++;
							exportChild();
						}, onprogress, totalSize);
					}, function(index) {
						if (onprogress)
							onprogress(currentIndex + index, totalSize);
					}, {
						directory : child.directory,
						version : child.zipVersion
					});
				else
					onend();
			}

			exportChild();
		}

		process(zipWriter, entry, onend, onprogress, totalSize);
	}

	function addFileEntry(zipEntry, fileEntry, onend, onerror) {
		function getChildren(fileEntry, callback) {
			var entries = [];
			if (fileEntry.isDirectory) {
				var directoryReader = fileEntry.createReader();
				(function readEntries() {
					directoryReader.readEntries(function(temporaryEntries) {
						if (!temporaryEntries.length)
							callback(entries);
						else {
							entries = entries.concat(temporaryEntries);
							readEntries();
						}
					}, onerror);
				})();
			}
			if (fileEntry.isFile)
				callback(entries);
		}

		function process(zipEntry, fileEntry, onend) {
			getChildren(fileEntry, function(children) {
				var childIndex = 0;

				function addChild(child) {
					function nextChild(childFileEntry) {
						process(childFileEntry, child, function() {
							childIndex++;
							processChild();
						});
					}

					if (child.isDirectory)
						nextChild(zipEntry.addDirectory(child.name));
					if (child.isFile)
						child.file(function(file) {
							var childZipEntry = zipEntry.addBlob(child.name, file);
							childZipEntry.uncompressedSize = file.size;
							nextChild(childZipEntry);
						}, onerror);
				}

				function processChild() {
					var child = children[childIndex];
					if (child)
						addChild(child);
					else
						onend();
				}

				processChild();
			});
		}

		if (fileEntry.isDirectory)
			process(zipEntry, fileEntry, onend);
		else
			fileEntry.file(function(file) {
				zipEntry.addBlob(fileEntry.name, file);
				onend();
			}, onerror);
	}

	function getFileEntry(fileEntry, entry, onend, onprogress, onerror, totalSize, checkCrc32) {
		var currentIndex = 0;

		function process(fileEntry, entry, onend, onprogress, onerror, totalSize) {
			var childIndex = 0;

			function addChild(child) {
				function nextChild(childFileEntry) {
					currentIndex += child.uncompressedSize || 0;
					process(childFileEntry, child, function() {
						childIndex++;
						processChild();
					}, onprogress, onerror, totalSize);
				}

				if (child.directory)
					fileEntry.getDirectory(child.name, {
						create : true
					}, nextChild, onerror);
				else
					fileEntry.getFile(child.name, {
						create : true
					}, function(file) {
						child.getData(new zip.FileWriter(file, zip.getMimeType(child.name)), nextChild, function(index) {
							if (onprogress)
								onprogress(currentIndex + index, totalSize);
						}, checkCrc32);
					}, onerror);
			}

			function processChild() {
				var child = entry.children[childIndex];
				if (child)
					addChild(child);
				else
					onend();
			}

			processChild();
		}

		if (entry.directory)
			process(fileEntry, entry, onend, onprogress, onerror, totalSize);
		else
			entry.getData(new zip.FileWriter(fileEntry, zip.getMimeType(entry.name)), onend, onprogress, checkCrc32);
	}

	function resetFS(fs) {
		fs.entries = [];
		fs.root = new ZipDirectoryEntry(fs);
	}

	function bufferedCopy(reader, writer, onend, onprogress, onerror) {
		var chunkIndex = 0;

		function stepCopy() {
			var index = chunkIndex * CHUNK_SIZE;
			if (onprogress)
				onprogress(index, reader.size);
			if (index < reader.size)
				reader.readUint8Array(index, Math.min(CHUNK_SIZE, reader.size - index), function(array) {
					writer.writeUint8Array(new Uint8Array(array), function() {
						chunkIndex++;
						stepCopy();
					});
				}, onerror);
			else
				writer.getData(onend);
		}

		stepCopy();
	}

	function addChild(parent, name, params, directory) {
		if (parent.directory)
			return directory ? new ZipDirectoryEntry(parent.fs, name, params, parent) : new ZipFileEntry(parent.fs, name, params, parent);
		else
			throw "Parent entry is not a directory.";
	}

	function ZipEntry() {
	}

	ZipEntry.prototype = {
		init : function(fs, name, params, parent) {
			var that = this;
			if (fs.root && parent && parent.getChildByName(name))
				throw "Entry filename already exists.";
			if (!params)
				params = {};
			that.fs = fs;
			that.name = name;
			that.id = fs.entries.length;
			that.parent = parent;
			that.children = [];
			that.zipVersion = params.zipVersion || 0x14;
			that.uncompressedSize = 0;
			fs.entries.push(that);
			if (parent)
				that.parent.children.push(that);
		},
		getFileEntry : function(fileEntry, onend, onprogress, onerror, checkCrc32) {
			var that = this;
			initReaders(that, function() {
				getFileEntry(fileEntry, that, onend, onprogress, onerror, getTotalSize(that), checkCrc32);
			}, onerror);
		},
		moveTo : function(target) {
			var that = this;
			if (target.directory) {
				if (!target.isDescendantOf(that)) {
					if (that != target) {
						if (target.getChildByName(that.name))
							throw "Entry filename already exists.";
						detach(that);
						that.parent = target;
						target.children.push(that);
					}
				} else
					throw "Entry is a ancestor of target entry.";
			} else
				throw "Target entry is not a directory.";
		},
		getFullname : function() {
			var that = this, fullname = that.name, entry = that.parent;
			while (entry) {
				fullname = (entry.name ? entry.name + "/" : "") + fullname;
				entry = entry.parent;
			}
			return fullname;
		},
		isDescendantOf : function(ancestor) {
			var entry = this.parent;
			while (entry && entry.id != ancestor.id)
				entry = entry.parent;
			return !!entry;
		}
	};
	ZipEntry.prototype.constructor = ZipEntry;

	var ZipFileEntryProto;

	function ZipFileEntry(fs, name, params, parent) {
		var that = this;
		ZipEntry.prototype.init.call(that, fs, name, params, parent);
		that.Reader = params.Reader;
		that.Writer = params.Writer;
		that.data = params.data;
		if (params.getData) {
			that.getData = params.getData;
		}
	}

	ZipFileEntry.prototype = ZipFileEntryProto = new ZipEntry();
	ZipFileEntryProto.constructor = ZipFileEntry;
	ZipFileEntryProto.getData = function(writer, onend, onprogress, onerror) {
		var that = this;
		if (!writer || (writer.constructor == that.Writer && that.data))
			onend(that.data);
		else {
			if (!that.reader)
				that.reader = new that.Reader(that.data, onerror);
			that.reader.init(function() {
				writer.init(function() {
					bufferedCopy(that.reader, writer, onend, onprogress, onerror);
				}, onerror);
			});
		}
	};

	ZipFileEntryProto.getText = function(onend, onprogress, checkCrc32, encoding) {
		this.getData(new TextWriter(encoding), onend, onprogress, checkCrc32);
	};
	ZipFileEntryProto.getBlob = function(mimeType, onend, onprogress, checkCrc32) {
		this.getData(new BlobWriter(mimeType), onend, onprogress, checkCrc32);
	};
	ZipFileEntryProto.getData64URI = function(mimeType, onend, onprogress, checkCrc32) {
		this.getData(new Data64URIWriter(mimeType), onend, onprogress, checkCrc32);
	};

	var ZipDirectoryEntryProto;

	function ZipDirectoryEntry(fs, name, params, parent) {
		var that = this;
		ZipEntry.prototype.init.call(that, fs, name, params, parent);
		that.directory = true;
	}

	ZipDirectoryEntry.prototype = ZipDirectoryEntryProto = new ZipEntry();
	ZipDirectoryEntryProto.constructor = ZipDirectoryEntry;
	ZipDirectoryEntryProto.addDirectory = function(name) {
		return addChild(this, name, null, true);
	};
	ZipDirectoryEntryProto.addText = function(name, text) {
		return addChild(this, name, {
			data : text,
			Reader : TextReader,
			Writer : TextWriter
		});
	};
	ZipDirectoryEntryProto.addBlob = function(name, blob) {
		return addChild(this, name, {
			data : blob,
			Reader : BlobReader,
			Writer : BlobWriter
		});
	};
	ZipDirectoryEntryProto.addData64URI = function(name, dataURI) {
		return addChild(this, name, {
			data : dataURI,
			Reader : Data64URIReader,
			Writer : Data64URIWriter
		});
	};
	ZipDirectoryEntryProto.addFileEntry = function(fileEntry, onend, onerror) {
		addFileEntry(this, fileEntry, onend, onerror);
	};
	ZipDirectoryEntryProto.addData = function(name, params) {
		return addChild(this, name, params);
	};
	ZipDirectoryEntryProto.importBlob = function(blob, onend, onerror) {
		this.importZip(new BlobReader(blob), onend, onerror);
	};
	ZipDirectoryEntryProto.importText = function(text, onend, onerror) {
		this.importZip(new TextReader(text), onend, onerror);
	};
	ZipDirectoryEntryProto.importData64URI = function(dataURI, onend, onerror) {
		this.importZip(new Data64URIReader(dataURI), onend, onerror);
	};
	ZipDirectoryEntryProto.exportBlob = function(onend, onprogress, onerror) {
		this.exportZip(new BlobWriter("application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportText = function(onend, onprogress, onerror) {
		this.exportZip(new TextWriter(), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportFileEntry = function(fileEntry, onend, onprogress, onerror) {
		this.exportZip(new zip.FileWriter(fileEntry, "application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportData64URI = function(onend, onprogress, onerror) {
		this.exportZip(new Data64URIWriter("application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.importZip = function(reader, onend, onerror) {
		var that = this;
		createReader(reader, function(zipReader) {
			zipReader.getEntries(function(entries) {
				entries.forEach(function(entry) {
					var parent = that, path = entry.filename.split("/"), name = path.pop();
					path.forEach(function(pathPart) {
						parent = parent.getChildByName(pathPart) || new ZipDirectoryEntry(that.fs, pathPart, null, parent);
					});
					if (!entry.directory)
						addChild(parent, name, {
							data : entry,
							Reader : ZipBlobReader
						});
				});
				onend();
			});
		}, onerror);
	};
	ZipDirectoryEntryProto.exportZip = function(writer, onend, onprogress, onerror) {
		var that = this;
		initReaders(that, function() {
			createWriter(writer, function(zipWriter) {
				exportZip(zipWriter, that, function() {
					zipWriter.close(onend);
				}, onprogress, getTotalSize(that));
			}, onerror);
		}, onerror);
	};
	ZipDirectoryEntryProto.getChildByName = function(name) {
		var childIndex, child, that = this;
		for (childIndex = 0; childIndex < that.children.length; childIndex++) {
			child = that.children[childIndex];
			if (child.name == name)
				return child;
		}
	};

	function FS() {
		resetFS(this);
	}
	FS.prototype = {
		remove : function(entry) {
			detach(entry);
			this.entries[entry.id] = null;
		},
		find : function(fullname) {
			var index, path = fullname.split("/"), node = this.root;
			for (index = 0; node && index < path.length; index++)
				node = node.getChildByName(path[index]);
			return node;
		},
		getById : function(id) {
			return this.entries[id];
		},
		importBlob : function(blob, onend, onerror) {
			resetFS(this);
			this.root.importBlob(blob, onend, onerror);
		},
		importText : function(text, onend, onerror) {
			resetFS(this);
			this.root.importText(text, onend, onerror);
		},
		importData64URI : function(dataURI, onend, onerror) {
			resetFS(this);
			this.root.importData64URI(dataURI, onend, onerror);
		},
		exportBlob : function(onend, onprogress, onerror) {
			this.root.exportBlob(onend, onprogress, onerror);
		},
		exportText : function(onend, onprogress, onerror) {
			this.root.exportText(onend, onprogress, onerror);
		},
		exportFileEntry : function(fileEntry, onend, onprogress, onerror) {
			this.root.exportFileEntry(fileEntry, onend, onprogress, onerror);
		},
		exportData64URI : function(onend, onprogress, onerror) {
			this.root.exportData64URI(onend, onprogress, onerror);
		}
	};

	zip.fs = {
		FS : FS,
		ZipDirectoryEntry : ZipDirectoryEntry,
		ZipFileEntry : ZipFileEntry
	};

	zip.getMimeType = function() {
		return "application/octet-stream";
	};

})();
