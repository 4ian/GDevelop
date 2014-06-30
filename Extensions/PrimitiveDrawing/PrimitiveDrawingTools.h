/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

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

