#ifndef ImageManager_H
#define ImageManager_H

#include "GDL/Game.h" //This include file must be placed first
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include <boost/shared_ptr.hpp>
#include <iostream>
#include <vector>
#include <string>
class OpenGLTextureWrapper;
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

        boost::shared_ptr<OpenGLTextureWrapper> GetOpenGLTexture(std::string name) const;
        boost::shared_ptr<sf::Image> GetSFMLImage(std::string name) const;
        void ReloadImage(std::string name) const;
        bool HasImage(std::string name) const;


    private:
        mutable map < string, boost::weak_ptr<sf::Image> > alreadyLoadedImages;
        mutable map < string, boost::shared_ptr<sf::Image> > permanentlyLoadedImages;
        mutable boost::shared_ptr<sf::Image> badImage;

        mutable map < string, boost::weak_ptr<OpenGLTextureWrapper> > alreadyLoadedOpenGLTextures;
        mutable boost::shared_ptr<OpenGLTextureWrapper> badOpenGLTexture;

        Game * game;
};

/**
 * Class wrapping an OpenGL texture.
 */
class GD_API OpenGLTextureWrapper
{
    public :
        OpenGLTextureWrapper(boost::shared_ptr<sf::Image> sfmlImage_);
        OpenGLTextureWrapper() : texture(0) {};
        ~OpenGLTextureWrapper() { glDeleteTextures(1, &texture); };
        inline GLuint GetOpenGLTexture() const { return texture; }

    private :
        boost::shared_ptr<sf::Image> sfmlImage;
        GLuint texture;
};


#endif // ImageManager_H
