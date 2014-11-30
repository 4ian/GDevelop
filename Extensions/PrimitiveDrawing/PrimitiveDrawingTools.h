/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef PRIMITIVEDRAWINGTOOLS_H
#define PRIMITIVEDRAWINGTOOLS_H
#include <string>
class RuntimeScene;
namespace sf { class Color; }

namespace GDpriv
{
namespace PrimitiveDrawingTools
{

void GD_EXTENSION_API CopyImageOnAnother( const std::string & destName, const std::string & srcName, float destX, float destY, bool useTransparency, RuntimeScene & scene );
void GD_EXTENSION_API CaptureScreen( RuntimeScene & scene, const std::string & destFileName, const std::string & destImageName );
void GD_EXTENSION_API CreateSFMLTexture( RuntimeScene & scene, const std::string & imageName, unsigned int width, unsigned int height, const std::string & color );
void GD_EXTENSION_API OpenSFMLTextureFromFile( RuntimeScene & scene, const std::string & fileName, const std::string & imageName );
void GD_EXTENSION_API SaveSFMLTextureToFile( RuntimeScene & scene, const std::string & fileName, const std::string & imageName );

}
}

#endif // PRIMITIVEDRAWINGTOOLS_H

