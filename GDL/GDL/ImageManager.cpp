/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ImageManager.h"
#include "GDL/RessourcesLoader.h"

#undef LoadImage //thx windows.h

void MessageLoading( string message, float avancement )
{
    cout << "Chargement :" << message << endl; //TODO : Must change that
} //Prototype de la fonction pour renvoyer un message

ImageManager::ImageManager() :
game(NULL)
{
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();
    badImage = boost::shared_ptr<sf::Image>(ressourcesLoader->LoadImage("vide.png"));
}

boost::shared_ptr<sf::Image> ImageManager::GetSFMLImage(std::string name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return badImage;
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
    	    boost::shared_ptr<sf::Image> image = boost::shared_ptr<sf::Image>(ressourcesLoader->LoadImage( game->images[i].file ));
    	    image->SetSmooth(game->images[i].smooth);

    	    alreadyLoadedImages[name] = image;
            return image;
    	}
    }

    cout << "ImageManager: Not found:" << name << endl;

    return badImage;
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
    boost::shared_ptr<sf::Image> image = alreadyLoadedImages.find(name)->second.lock();

    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
    	{
            cout << "ImageManager: Reload " << name << endl;

    	    boost::shared_ptr<sf::Image> newImage = boost::shared_ptr<sf::Image>(RessourcesLoader::GetInstance()->LoadImage( game->images[i].file ));

            *image = *newImage;
    	    image->SetSmooth(game->images[i].smooth);

            return;
    	}
    }

    //Image not present anymore in image list.
    cout << "ImageManager: " << name << " is not available anymore." << endl;
    *image = *badImage;
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

    boost::shared_ptr<OpenGLTextureWrapper> texture = boost::shared_ptr<OpenGLTextureWrapper>(new OpenGLTextureWrapper(GetSFMLImage(name)));
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
    map < string, boost::shared_ptr<sf::Image> > newPermanentlyLoadedImages;
    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].alwaysLoaded )
            newPermanentlyLoadedImages[game->images[i].nom] = GetSFMLImage(game->images[i].nom);
    }

    permanentlyLoadedImages = newPermanentlyLoadedImages;
}

OpenGLTextureWrapper::OpenGLTextureWrapper(boost::shared_ptr<sf::Image> sfmlImage_)
{
    sfmlImage = sfmlImage_;
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    gluBuild2DMipmaps(GL_TEXTURE_2D, GL_RGBA, sfmlImage->GetWidth(), sfmlImage->GetHeight(), GL_RGBA, GL_UNSIGNED_BYTE, sfmlImage->GetPixelsPtr());
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
}
