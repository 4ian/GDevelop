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
class SFMLTextureWrapper;
#undef LoadImage //thx windows.h

using namespace std;

/**
 * \brief Manage images at runtime, providing an easy way to get SFML images or OpenGL textures.
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
        boost::shared_ptr<SFMLTextureWrapper> GetSFMLTexture(std::string name) const;
        void ReloadImage(std::string name) const;
        bool HasImage(std::string name) const;


    private:
        mutable map < string, boost::weak_ptr<SFMLTextureWrapper> > alreadyLoadedImages;
        mutable map < string, boost::shared_ptr<SFMLTextureWrapper> > permanentlyLoadedImages;
        mutable boost::shared_ptr<SFMLTextureWrapper> badTexture;

        mutable map < string, boost::weak_ptr<OpenGLTextureWrapper> > alreadyLoadedOpenGLTextures;
        mutable boost::shared_ptr<OpenGLTextureWrapper> badOpenGLTexture;

        Game * game;
};

/**
 * \brief Class wrapping an SFML texture.
 */
class GD_API SFMLTextureWrapper
{
    public :
        SFMLTextureWrapper(sf::Texture & texture);
        SFMLTextureWrapper() {};
        ~SFMLTextureWrapper() {};

        sf::Texture texture;
        sf::Image image; ///< Associated sfml image, used for pixel perfect collision for example. If you update the image, call LoadFromImage on texture to update it also.
};

/**
 * \brief Class wrapping an OpenGL texture.
 */
class GD_API OpenGLTextureWrapper
{
    public :
        OpenGLTextureWrapper(boost::shared_ptr<SFMLTextureWrapper> sfmlTexture_);
        OpenGLTextureWrapper() : texture(0) {};
        ~OpenGLTextureWrapper() { glDeleteTextures(1, &texture); };
        inline GLuint GetOpenGLTexture() const { return texture; }

    private :
        boost::shared_ptr<SFMLTextureWrapper> sfmlTexture;
        GLuint texture;
};


#endif // ImageManager_H
