/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ECRANCHARGEMENTPARA_H
#define ECRANCHARGEMENTPARA_H

#include <string>
#include <vector>

using namespace std;

/**
 * \brief Internal class containg information so as to display a loading screen.
 *
 * \ingroup GameEngine
 */
class GD_API LoadingScreen
{
    public:
        LoadingScreen();
        virtual ~LoadingScreen();

        bool afficher; ///< True if loading screen must be displayed
        bool border;  ///< True if window's border must be displayed
        bool smooth;  ///< True if image must be smoothed
        int width;  ///< Window's width
        int height;  ///< Window's height

        bool texte;   ///< True if text must be displayed
        string texteChargement;  ///< Text displayed
        int texteXPos; ///< Text X position
        int texteYPos; ///< Text Y position

        bool pourcent;
        int pourcentXPos;
        int pourcentYPos;

        bool image;  ///< True if image must be displayed
        string imageFichier; ///< Background image file
};

#endif // ECRANCHARGEMENTPARA_H

