/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ImageManager.h"
#include "GDL/RessourcesLoader.h"
#include "GDL/Game.h"
#include "GDL/InvalidImage.h"

#undef LoadImage //thx windows.h

void MessageLoading( string message, float avancement )
{
    cout << "Chargement :" << message << endl; //TODO : Must change that
} //Prototype de la fonction pour renvoyer un message

ImageManager::ImageManager() :
game(NULL)
{
    badTexture = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper);
    badTexture->texture.LoadFromMemory(GDpriv::InvalidImageData, sizeof(GDpriv::InvalidImageData));
    badTexture->texture.SetSmooth(false);
    badTexture->image = badTexture->texture.CopyToImage();
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

    cout << "ImageManager: Load " << name << endl;

    //Load only an image when necessary
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();
    for (unsigned int i = 0;i<game->resourceManager.resources.size();++i)
    {
        if ( game->resourceManager.resources[i] != boost::shared_ptr<Resource>() && game->resourceManager.resources[i]->name == name  )
        {
            boost::shared_ptr<ImageResource> image = boost::dynamic_pointer_cast<ImageResource>(game->resourceManager.resources[i]);

            if ( image != boost::shared_ptr<ImageResource>() )
            {
                boost::shared_ptr<SFMLTextureWrapper> texture(new SFMLTextureWrapper(*ressourcesLoader->LoadSFMLTexture( image->file )));
                texture->texture.SetSmooth(image->smooth);

                alreadyLoadedImages[name] = texture;
                #if defined(GD_IDE_ONLY)
                if ( preventUnloading ) unloadingPreventer.push_back(texture); //If unload prevention is activated, add the image to the list dedicated to prevent images from being unloaded.
                #endif

                return texture;
            }

        }
    }

    cout << "ImageManager: Not found:" << name << endl;

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

    for (unsigned int i = 0;i<game->resourceManager.resources.size();++i)
    {
        if ( game->resourceManager.resources[i] != boost::shared_ptr<Resource>() && game->resourceManager.resources[i]->name == name  )
        {
            boost::shared_ptr<ImageResource> image = boost::dynamic_pointer_cast<ImageResource>(game->resourceManager.resources[i]);

            if ( image != boost::shared_ptr<ImageResource>() )
            {
                cout << "ImageManager: Reload " << name << endl;

                oldTexture->texture = *RessourcesLoader::GetInstance()->LoadSFMLTexture( image->file );
                oldTexture->texture.SetSmooth(image->smooth);
                oldTexture->image = oldTexture->texture.CopyToImage();

                return;
            }
    	}
    }

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

bool ImageManager::HasImage(const std::string & name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return false;
    }

    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return true;

    for (unsigned int i = 0;i<game->resourceManager.resources.size();++i)
    {
        if ( game->resourceManager.resources[i] != boost::shared_ptr<Resource>() && game->resourceManager.resources[i]->name == name  )
        {
            boost::shared_ptr<ImageResource> image = boost::dynamic_pointer_cast<ImageResource>(game->resourceManager.resources[i]);

            if ( image != boost::shared_ptr<ImageResource>() )
                return true;
        }
    }

    return false;
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
    for (unsigned int i = 0;i<game->resourceManager.resources.size();++i)
    {
        if ( game->resourceManager.resources[i] != boost::shared_ptr<Resource>() )
        {
            boost::shared_ptr<ImageResource> image = boost::dynamic_pointer_cast<ImageResource>(game->resourceManager.resources[i]);

            if ( image != boost::shared_ptr<ImageResource>() )
            {
                if ( image->alwaysLoaded )
                    newPermanentlyLoadedImages[image->name] = GetSFMLTexture(image->name);
            }
        }
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

SFMLTextureWrapper::SFMLTextureWrapper(sf::Texture & texture_) :
    texture(texture_),
    image(texture.CopyToImage())
{
}

OpenGLTextureWrapper::OpenGLTextureWrapper(boost::shared_ptr<SFMLTextureWrapper> sfmlTexture_)
{
    sfmlTexture = sfmlTexture_;

    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    gluBuild2DMipmaps(GL_TEXTURE_2D, GL_RGBA, sfmlTexture->image.GetWidth(), sfmlTexture->image.GetHeight(), GL_RGBA, GL_UNSIGNED_BYTE, sfmlTexture->image.GetPixelsPtr());
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
}

