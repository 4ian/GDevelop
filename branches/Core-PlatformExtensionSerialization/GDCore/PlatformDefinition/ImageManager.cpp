/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/PlatformDefinition/ImageManager.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/RessourcesLoader.h"
#include "GDCore/Tools/InvalidImage.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#undef LoadImage //thx windows.h

using namespace std;

namespace gd
{

ImageManager::ImageManager() :
game(NULL)
{
    badTexture = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper);
    badTexture->texture.loadFromMemory(gd::InvalidImageData, sizeof(gd::InvalidImageData));
    badTexture->texture.setSmooth(false);
    badTexture->image = badTexture->texture.copyToImage();
}

boost::shared_ptr<SFMLTextureWrapper> ImageManager::GetSFMLTexture(const std::string & name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return badTexture;
    }

    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return alreadyLoadedImages.find(name)->second.lock();

    std::cout << "ImageManager: Loading " << name;

    //Load only an image when necessary
    try
    {
        ImageResource & image = dynamic_cast<ImageResource&>(game->GetResourcesManager().GetResource(name));

        boost::shared_ptr<SFMLTextureWrapper> texture(new SFMLTextureWrapper(*RessourcesLoader::GetInstance()->LoadSFMLTexture( image.GetFile() )));
        texture->texture.setSmooth(image.smooth);

        alreadyLoadedImages[name] = texture;
        #if defined(GD_IDE_ONLY)
        if ( preventUnloading ) unloadingPreventer.push_back(texture); //If unload prevention is activated, add the image to the list dedicated to prevent images from being unloaded.
        #endif

        std::cout << "." << std::endl;
        return texture;
    }
    catch(...)
    {
    }

    cout << ". Image not found." << endl;

    return badTexture;
}

bool ImageManager::HasLoadedSFMLTexture(const std::string & name) const
{
    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return true;

    return false;
}

void ImageManager::SetSFMLTextureAsPermanentlyLoaded(const std::string & name, boost::shared_ptr<SFMLTextureWrapper> & texture) const
{
    if ( alreadyLoadedImages.find(name) == alreadyLoadedImages.end() || alreadyLoadedImages.find(name)->second.expired() )
        alreadyLoadedImages[name] = texture;

    if ( permanentlyLoadedImages.find(name) == permanentlyLoadedImages.end() )
        permanentlyLoadedImages[name] = texture;
}

void ImageManager::ReloadImage(const std::string & name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return;
    }

    //Verify if image is in memory. If not, it will be automatically reloaded when necessary.
    if ( alreadyLoadedImages.find(name) == alreadyLoadedImages.end() || alreadyLoadedImages.find(name)->second.expired() ) return;

    //Image still in memory, get it and update it.
    boost::shared_ptr<SFMLTextureWrapper> oldTexture = alreadyLoadedImages.find(name)->second.lock();

    try
    {
        ImageResource & image = dynamic_cast<ImageResource&>(game->GetResourcesManager().GetResource(name));

        cout << "ImageManager: Reload " << name << endl;

        oldTexture->texture = *RessourcesLoader::GetInstance()->LoadSFMLTexture( image.GetFile() );
        oldTexture->texture.setSmooth(image.smooth);
        oldTexture->image = oldTexture->texture.copyToImage();

        return;
    }
    catch(...) { /*The ressource is not an image*/ }

    //Image not present anymore in image list.
    cout << "ImageManager: " << name << " is not available anymore." << endl;
    *oldTexture = *badTexture;
}

boost::shared_ptr<OpenGLTextureWrapper> ImageManager::GetOpenGLTexture(const std::string & name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return badOpenGLTexture;
    }

    if ( alreadyLoadedOpenGLTextures.find(name) != alreadyLoadedOpenGLTextures.end() && !alreadyLoadedOpenGLTextures.find(name)->second.expired() )
        return alreadyLoadedOpenGLTextures.find(name)->second.lock();

    cout << "Load OpenGL Texture" << name << endl;

    boost::shared_ptr<OpenGLTextureWrapper> texture = boost::shared_ptr<OpenGLTextureWrapper>(new OpenGLTextureWrapper(GetSFMLTexture(name)));
    alreadyLoadedOpenGLTextures[name] = texture;
    return texture;
}

void ImageManager::LoadPermanentImages()
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return;
    }

    //Create a new list of permanently loaded images but do not delete now the old list
    //so as not to unload images that could be still present.
    map < string, boost::shared_ptr<SFMLTextureWrapper> > newPermanentlyLoadedImages;

    std::vector<std::string> resources = game->GetResourcesManager().GetAllResourcesList();
    for ( unsigned int i = 0;i <resources.size();i++ )
    {
        try
        {
            ImageResource & image = dynamic_cast<ImageResource&>(game->GetResourcesManager().GetResource(resources[i]));

            if ( image.alwaysLoaded )
                newPermanentlyLoadedImages[image.GetName()] = GetSFMLTexture(image.GetName());
        }
        catch(...) { /*The resource is not an image, we don't care about it.*/}
    }

    permanentlyLoadedImages = newPermanentlyLoadedImages;
}

#if defined(GD_IDE_ONLY)
void ImageManager::PreventImagesUnloading()
{
    preventUnloading = true;
    for (map < string, boost::weak_ptr<SFMLTextureWrapper> >::const_iterator it = alreadyLoadedImages.begin();it != alreadyLoadedImages.end();++it)
    {
        boost::shared_ptr<SFMLTextureWrapper> image = (it->second).lock();
        if ( image != boost::shared_ptr<SFMLTextureWrapper>() ) unloadingPreventer.push_back(image);
    }
}

void ImageManager::EnableImagesUnloading()
{
    preventUnloading = false;
    unloadingPreventer.clear(); //Images which are not used anymore will thus be destroyed ( As no shared pointer will be pointing to them ).
}
#endif

}

SFMLTextureWrapper::SFMLTextureWrapper(sf::Texture & texture_) :
    texture(texture_),
    image(texture.copyToImage())
{
}

OpenGLTextureWrapper::OpenGLTextureWrapper(boost::shared_ptr<SFMLTextureWrapper> sfmlTexture_)
{
    sfmlTexture = sfmlTexture_;

    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    gluBuild2DMipmaps(GL_TEXTURE_2D, GL_RGBA, sfmlTexture->image.getSize().x, sfmlTexture->image.getSize().y, GL_RGBA, GL_UNSIGNED_BYTE, sfmlTexture->image.getPixelsPtr());
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
}

OpenGLTextureWrapper::~OpenGLTextureWrapper()
{
    glDeleteTextures(1, &texture);
};

SFMLTextureWrapper::~SFMLTextureWrapper()
{
};
