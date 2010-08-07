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
        virtual ~ImageManager() {};
        void SetGame(Game * game_) { game = game_; }

        sf::Image & GetImage(std::string name) const;
        bool HasImage(std::string name) const;

    private:
        mutable map < string, sf::Image > images;
        mutable sf::Image badImage;

        Game * game;
};

#endif // ImageManager_H
