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
    badImage = ressourcesLoader->LoadImage("vide.png");
}

sf::Image & ImageManager::GetImage(std::string name) const
{
    if ( !game )
    {
        cout << "Image manager has no game associated with.";
        return badImage;
    }

    if ( images.find(name) != images.end() )
        return images.find(name)->second;

    cout << "Load " << name << endl;

    //Load only an image when necessary
    RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();
    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
    	{
            images[name] = ressourcesLoader->LoadImage( game->images[i].fichier );
            images[name].SetSmooth(game->images[i].smooth);

            return images[name];
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


    if ( images.find(name) != images.end() )
        return true;

    for (unsigned int i = 0;i<game->images.size();++i)
    {
    	if ( game->images[i].nom == name )
            return true;
    }

    return false;
}
