/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ImageManager.h"
#include "GDL/RessourcesLoader.h"

#undef LoadImage //thx windows.h

void MessageLoading( string message, float avancement )
{
    cout << "Chargement :" << message; //TODO : Must change that
} //Prototype de la fonction pour renvoyer un message

ImageManager::ImageManager()
{
    //ctor
}

ImageManager::~ImageManager()
{
    //dtor
}

////////////////////////////////////////////////////////////
/// Chargement des images
///
/// Charge les images pour les utiliser pendant le jeu
////////////////////////////////////////////////////////////
bool ImageManager::LoadImagesFromFile(Game & Jeu)
{
    RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();
    imageVide = ressourcesLoader->LoadImage("vide.png");
    images.clear();

    for ( unsigned int i = 0;i<Jeu.images.size();++i)
    {
        //Ajout de l'image
        images[Jeu.images.at(i).nom] = imageVide;

        //Chargement de l'image
        MessageLoading( "Chargement des images : " + Jeu.images.at(i).nom, static_cast<int>((i/static_cast<float>(Jeu.images.size()))*100));
        //images.at(i) = ressourcesLoader->LoadImage( Jeu.images.at( i ).fichier );
        images[Jeu.images.at(i).nom] = ressourcesLoader->LoadImage( Jeu.images.at( i ).fichier );

        //Lissage ou pas
        images[Jeu.images.at(i).nom].SetSmooth(true);
        if ( !Jeu.images.at(i).smooth )
            images[Jeu.images.at(i).nom].SetSmooth(false);
    }

    MessageLoading( "Chargement terminé.", 100);
    return true;
}

bool ImageManager::LoadImage(Game & Jeu, string imageName)
{
    /*RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();

    for ( unsigned int i = 0;i<Jeu.images.size();++i)
    {
        //L'image existe déjà
        if ( Jeu.images.at(i).nom == imageName)
        {
            MessageLoading( "Chargement de l'image : " + Jeu.images.at(i).nom, 0);
            images.at(i) = ressourcesLoader->LoadImage( Jeu.images.at( i ).fichier );

            //Lissage ou pas
            images.at( i ).SetSmooth(true);
            if ( !Jeu.images.at( i ).smooth )
                images.at( i ).SetSmooth(false);

            return true;
        }
    }
    return false;*/

    return false;
}
