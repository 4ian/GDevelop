/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

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
#include <SFML/Graphics.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "GDL/CommonTools.h"
#include "PrimitiveDrawingTools.h"

namespace GDpriv
{
namespace PrimitiveDrawingTools
{

void GD_EXTENSION_API CopyImageOnAnother( const std::string & destName, const std::string & srcName, float destX, float destY, bool useTransparency,RuntimeScene & scene )
{
    if ( !scene.game->imageManager->HasLoadedSFMLTexture(destName) ) return;
    if ( !scene.game->imageManager->HasLoadedSFMLTexture(srcName) ) return;

    boost::shared_ptr<SFMLTextureWrapper> dest = scene.game->imageManager->GetSFMLTexture(destName);

    //Make sure the coordinates are correct.
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest->texture.GetWidth()) return;
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest->texture.GetWidth()) return;

    dest->image.Copy(scene.game->imageManager->GetSFMLTexture(srcName)->image, destX, destY, sf::IntRect(0, 0, 0, 0), useTransparency);
    dest->texture.LoadFromImage(dest->image);
}

void GD_EXTENSION_API CaptureScreen( RuntimeScene & scene, const std::string & destFileName, const std::string & destImageName )
{
    if ( !scene.renderWindow ) return;
    sf::Image capture = scene.renderWindow->Capture();

    if ( !destFileName.empty() ) capture.SaveToFile(destFileName);
    if ( !destImageName.empty() && scene.game->imageManager->HasLoadedSFMLTexture(destImageName) )
    {
        boost::shared_ptr<SFMLTextureWrapper> sfmlTexture = scene.game->imageManager->GetSFMLTexture(destImageName);
        sfmlTexture->image = capture;
        sfmlTexture->texture.LoadFromImage(sfmlTexture->image); //Do not forget to update the associated texture
    }
}

namespace
{

}

void GD_EXTENSION_API CreateSFMLTexture( RuntimeScene & scene, const std::string & imageName, unsigned int width, unsigned int height, const std::string & colorStr )
{
    //Get or create the texture in memory
    boost::shared_ptr<SFMLTextureWrapper> newTexture;
    if ( !scene.game->imageManager->HasLoadedSFMLTexture(imageName) )
        newTexture = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper);
    else
        newTexture = scene.game->imageManager->GetSFMLTexture(imageName);

    //Get the color
    sf::Color color;
    bool colorIsOk = false;
    std::vector < string > colors = SplitString<string>(colorStr, ';');
    if ( colors.size() == 3 )
    {
        colorIsOk = true;
        color = sf::Color(ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2]));
    }

    //Create the SFML image and the SFML texture
    if ( width != 0 && height != 0 && colorIsOk )
        newTexture->image.Create(width, height, color);

    newTexture->texture.LoadFromImage(newTexture->image); //Do not forget to update the associated texture

    scene.game->imageManager->SetSFMLTextureAsPermanentlyLoaded(imageName, newTexture); //Otherwise
}

void GD_EXTENSION_API OpenSFMLTextureFromFile( RuntimeScene & scene, const std::string & fileName, const std::string & imageName )
{
    //Get or create the texture in memory
    boost::shared_ptr<SFMLTextureWrapper> newTexture;
    if ( !scene.game->imageManager->HasLoadedSFMLTexture(imageName) )
        newTexture = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper);
    else
        newTexture = scene.game->imageManager->GetSFMLTexture(imageName);

    //Open the SFML image and the SFML texture
    newTexture->image.LoadFromFile(fileName);
    newTexture->texture.LoadFromImage(newTexture->image); //Do not forget to update the associated texture

    scene.game->imageManager->SetSFMLTextureAsPermanentlyLoaded(imageName, newTexture);
}

void GD_EXTENSION_API SaveSFMLTextureToFile( RuntimeScene & scene, const std::string & fileName, const std::string & imageName )
{
    if ( !scene.game->imageManager->HasLoadedSFMLTexture(imageName) ) return;

    scene.game->imageManager->GetSFMLTexture(imageName)->image.SaveToFile(fileName);
}

}
}

