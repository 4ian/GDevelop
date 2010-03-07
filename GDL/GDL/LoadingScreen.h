/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ECRANCHARGEMENTPARA_H
#define ECRANCHARGEMENTPARA_H

#include <string>
#include <vector>

using namespace std;

/**
 * Class containg information so as to display a loading screen
 */
class GD_API LoadingScreen
{
    public:
        LoadingScreen();
        virtual ~LoadingScreen();

        bool afficher;
        bool border;
        bool smooth;
        int width;
        int height;

        bool texte;
        string texteChargement;
        int texteXPos;
        int texteYPos;

        bool pourcent;
        int pourcentXPos;
        int pourcentYPos;

        bool image;
        string imageFichier;


    protected:
    private:
};

#endif // ECRANCHARGEMENTPARA_H
