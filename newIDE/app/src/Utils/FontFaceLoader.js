import FontFaceObserver from 'fontfaceobserver';

/**
 * A simple wrapper around FontFace (if supported) or @font-face + FontFaceObserver
 * to load a font from an url and be notified when loading is done (or failed).
 * @param {*} fontFamily
 * @param {*} src
 * @param {*} descriptors
 */
export const loadFontFace = (fontFamily, src, descriptors = {}) => {
  if (typeof FontFace !== 'undefined') {
    // Load the given font using CSS Font Loading API.
    const fontFace = new FontFace(fontFamily, src, descriptors);
    document.fonts.add(fontFace);
    return fontFace.load();
  } else {
    // Add @font-face and use FontFaceObserver to be notified when the
    // font is ready.
    const newStyle = document.createElement('style');
    newStyle.appendChild(
      document.createTextNode(
        `@font-face {
          font-family: ${fontFamily};
          src: ${src};
        }`
      )
    );

    document.head.appendChild(newStyle);
    return new FontFaceObserver(fontFamily, descriptors).load().catch(err => {
      console.warn(`Error while loading font ${fontFamily}`, err);

      throw err;
    });
  }
};
