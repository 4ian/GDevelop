#ifndef ImageManager_H
#define ImageManager_H

#include <SFML/System.hpp>
#include "GDL/ListVariable.h"
#include "GDL/Game.h"
#include <iostream>
#include <SFML/Graphics.hpp>
#include <vector>
#include <string>
#undef LoadImage //thx windows.h

using namespace std;

class GD_API ImageManager
{
    public:
        ImageManager();
        virtual ~ImageManager();
        //vector < sf::Image >    images;
        map < string, sf::Image>    images;
        sf::Image                   imageVide;

        bool LoadImagesFromFile( Game & Jeu );
        bool LoadImage( Game & Jeu, string imageName);

    protected:
    private:
};

#endif // ImageManager_H
