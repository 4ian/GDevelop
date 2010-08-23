#ifndef ImageManager_H
#define ImageManager_H

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <boost/shared_ptr.hpp>
#include "GDL/Game.h"
#include <iostream>
#include <vector>
#include <string>
#undef LoadImage //thx windows.h

using namespace std;

/**
 * Image manager is used by objects to obtain their images from the image name.
 * Images are loaded dynamically when necessary, and are unloaded if there is no
 * more shared_ptr pointing on an image.
 */
class GD_API ImageManager
{
    public:
        ImageManager();
        virtual ~ImageManager() {};
        void SetGame(Game * game_) { game = game_; }

        void LoadPermanentImages();

        boost::shared_ptr<sf::Image> GetImage(std::string name) const;
        bool HasImage(std::string name) const;


    private:
        mutable map < string, boost::weak_ptr<sf::Image> > alreadyLoadedImages;
        mutable map < string, boost::shared_ptr<sf::Image> > permanentlyLoadedImages;
        mutable boost::shared_ptr<sf::Image> badImage;

        Game * game;
};

#endif // ImageManager_H
