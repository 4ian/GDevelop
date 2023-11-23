// @flow

import { getInputAcceptedMimesAndExtensions } from './FileToCloudProjectResourceUploader';

describe('FileToCloudProjectResourceUploader', () => {
  it('gives the accepted mime/extensions for an input', () => {
    expect(getInputAcceptedMimesAndExtensions('audio')).toMatchInlineSnapshot(
      `"audio/aac,audio/x-wav,audio/mpeg,audio/mp3,audio/ogg,.aac,.wav,.mp3,.ogg"`
    );
    expect(
      getInputAcceptedMimesAndExtensions('bitmapFont')
    ).toMatchInlineSnapshot(`".fnt,.xml"`);
    expect(getInputAcceptedMimesAndExtensions('font')).toMatchInlineSnapshot(
      `"font/ttf,font/otf,.ttf,.otf"`
    );
    expect(getInputAcceptedMimesAndExtensions('image')).toMatchInlineSnapshot(
      `"image/jpeg,image/png,image/webp,.png,.jpg,.jpeg,.webp"`
    );
    expect(getInputAcceptedMimesAndExtensions('json')).toMatchInlineSnapshot(
      `"application/json,.json"`
    );
    expect(getInputAcceptedMimesAndExtensions('tilemap')).toMatchInlineSnapshot(
      `"application/json,.json,.ldtk,.tmj"`
    );
    expect(getInputAcceptedMimesAndExtensions('tileset')).toMatchInlineSnapshot(
      `"application/json,.json,.tsj"`
    );
    expect(getInputAcceptedMimesAndExtensions('video')).toMatchInlineSnapshot(
      `"video/mp4,video/webm,.mp4,.webm"`
    );
    expect(getInputAcceptedMimesAndExtensions('model3D')).toMatchInlineSnapshot(
      `"file,.glb"`
    );
    expect(getInputAcceptedMimesAndExtensions('atlas')).toMatchInlineSnapshot(
      `".atlas"`
    );
    expect(getInputAcceptedMimesAndExtensions('spine')).toMatchInlineSnapshot(
      `"application/json,.json"`
    );
  });
});
