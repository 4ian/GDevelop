/**
 * @constructor
 * @memberof gdjs
 * @class BitmapFontManager
 */
gdjs.BitmapFontManager = function () {
  this._fontUsed = {};
};

gdjs.BitmapFontManager.prototype.setFontUsed = function (name) {
  if (this._fontUsed[name]) {
    this._fontUsed[name].countObjectUsingTheFont =
      this._fontUsed[name].countObjectUsingTheFont + 1 || 1;
  } else {
    this._fontUsed[name] = {
      countObjectUsingTheFont: 1,
    };
  }
};

gdjs.BitmapFontManager.prototype.removeFontUsed = function (name) {
  if (this._fontUsed[name]) {
    this._fontUsed[name].countObjectUsingTheFont =
      this._fontUsed[name].countObjectUsingTheFont - 1 || 0;
  }

  if (this._fontUsed[name].countObjectUsingTheFont <= 0) {
    console.log('- Delete the font: ' + name);
    PIXI.BitmapFont.uninstall(name);
    delete this._fontUsed[name];
  }
};
