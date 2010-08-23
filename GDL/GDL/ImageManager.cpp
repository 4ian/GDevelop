/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
    RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();
    badImage = boost::shared_ptr<sf::Image>(ressourcesLoader->LoadImage("vide.png"));
}

boost::shared_ptr<sf::Image> ImageManager::GetImage(std::string name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return badImage;
    }

    if ( alreadyLoadedImages.find(name) != alreadyLoadedImages.end() && !alreadyLoadedImages.find(name)->second.expired() )
        return alreadyLoadedImages.find(name)->second.lock();

    cout << "Load " << name << endl;

    //Load only an image when necessary
    RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();
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

    return badImage;
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
            newPermanentlyLoadedImages[game->images[i].nom] = GetImage(game->images[i].nom);
    }

    permanentlyLoadedImages = newPermanentlyLoadedImages;
}
