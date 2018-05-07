/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef PRIMITIVEDRAWINGTOOLS_H
#define PRIMITIVEDRAWINGTOOLS_H
#include <string>
class RuntimeScene;
namespace sf {
class Color;
}
namespace gd {
class String;
}

namespace GDpriv {
namespace PrimitiveDrawingTools {

void GD_EXTENSION_API CopyImageOnAnother(const gd::String& destName,
                                         const gd::String& srcName,
                                         float destX,
                                         float destY,
                                         bool useTransparency,
                                         RuntimeScene& scene);
void GD_EXTENSION_API CaptureScreen(RuntimeScene& scene,
                                    const gd::String& destFileName,
                                    const gd::String& destImageName);
void GD_EXTENSION_API CreateSFMLTexture(RuntimeScene& scene,
                                        const gd::String& imageName,
                                        unsigned int width,
                                        unsigned int height,
                                        const gd::String& color);
void GD_EXTENSION_API OpenSFMLTextureFromFile(RuntimeScene& scene,
                                              const gd::String& fileName,
                                              const gd::String& imageName);
void GD_EXTENSION_API SaveSFMLTextureToFile(RuntimeScene& scene,
                                            const gd::String& fileName,
                                            const gd::String& imageName);

}  // namespace PrimitiveDrawingTools
}  // namespace GDpriv

#endif  // PRIMITIVEDRAWINGTOOLS_H
