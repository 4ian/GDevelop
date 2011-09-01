/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ImageManager.h"
#include "GDL/RessourcesLoader.h"
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

boost::shared_ptr<SFMLTextureWrapper> ImageManager::GetSFMLTexture(std::string name) const
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
    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
    	{
    	    boost::shared_ptr<SFMLTextureWrapper> texture(new SFMLTextureWrapper(*ressourcesLoader->LoadSFMLTexture( game->images[i].file )));
    	    texture->texture.SetSmooth(game->images[i].smooth);

    	    alreadyLoadedImages[name] = texture;
            return texture;
    	}
    }

    cout << "ImageManager: Not found:" << name << endl;

    return badTexture;
}

void ImageManager::ReloadImage(std::string name) const
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

    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
    	{
            cout << "ImageManager: Reload " << name << endl;

            oldTexture->texture = *RessourcesLoader::GetInstance()->LoadSFMLTexture( game->images[i].file );
    	    oldTexture->texture.SetSmooth(game->images[i].smooth);
    	    oldTexture->image = oldTexture->texture.CopyToImage();

            return;
    	}
    }

    //Image not present anymore in image list.
    cout << "ImageManager: " << name << " is not available anymore." << endl;
    *oldTexture = *badTexture;
}

boost::shared_ptr<OpenGLTextureWrapper> ImageManager::GetOpenGLTexture(std::string name) const
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

bool ImageManager::HasImage(std::string name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return false;
    }

    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return true;

    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
            return true;
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
    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].alwaysLoaded )
            newPermanentlyLoadedImages[game->images[i].nom] = GetSFMLTexture(game->images[i].nom);
    }

    permanentlyLoadedImages = newPermanentlyLoadedImages;
}

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
