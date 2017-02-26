import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');

export default {
	setBounds: (x, y, width, height) => {
		if (!electron) return;

		electron.remote.getCurrentWindow().setBounds({x, y, width, height});
		electron.remote.getCurrentWindow().showInactive();
	},
	show: () => {
		if (!electron) return;

		electron.remote.getCurrentWindow().showInactive();
	},
  onFocus: (cb) => {
		if (!electron) return;

    return electron.remote.getCurrentWindow().on('focus', cb);
	},
  onBlur: (cb) => {
		if (!electron) return;

    return electron.remote.getCurrentWindow().on('blur', cb);
	},
	getArguments: () => {
		if (!electron) {
			console.warn("Unable to get arguments, electron not defined");
		}

		return electron.remote.getGlobal('args');
	}
}
