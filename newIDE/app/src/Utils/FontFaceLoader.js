// @flow
import FontFaceObserver from 'fontfaceobserver';
import { checkIfCredentialsRequired } from './CrossOrigin';

/**
 * A simple wrapper around FontFace (if supported) or @font-face + FontFaceObserver
 * to load a font from an url and be notified when loading is done (or failed).
 */
export const loadFontFace = (fontFamily: string, src: string) => {
  // $FlowFixMe - FontFace not recognised by Flow.
  if (typeof FontFace !== 'undefined') {
    return fetch(src, {
      credentials: checkIfCredentialsRequired(src)
        ? // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
          // i.e: its gdevelop.io cookie, to be passed.
          'include'
        : // For other resources, use "same-origin" as done by default by fetch.
          'same-origin',
    })
      .then(response => {
        if (!response.ok) {
          const errorMessage =
            'Unable to fetch ' +
            src +
            ' to be loaded as a font. HTTP status is: ' +
            response.status +
            '.';
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        const fontFace = new FontFace(fontFamily, arrayBuffer, {});

        // $FlowFixMe - FontFace not recognised by Flow.
        document.fonts.add(fontFace);
      });
  } else {
    // TODO: this method of loading font should be removed as old and not allowing
    // to handle loading with credentials. All moderns and not-so-modern browsers
    // that we support also support FontFace API.

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

    // $FlowFixMe
    document.head.appendChild(newStyle);
    return new FontFaceObserver(fontFamily, {}).load().catch(err => {
      console.warn(`Error while loading font ${fontFamily}`, err);

      throw err;
    });
  }
};
