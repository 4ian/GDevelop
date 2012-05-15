/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ImageManager_H
#define ImageManager_H

#include <iostream>
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/weak_ptr.hpp>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
class Game;
class OpenGLTextureWrapper;
class SFMLTextureWrapper;
#undef LoadImage //thx windows.h

using namespace std;

/**
 * \brief Manage images at runtime, providing an easy way to get SFML images or OpenGL textures.
 *
 * Image manager is used by objects to obtain their images from the image name.
 * Images are loaded dynamically when necessary, and are unloaded if there is no
 * more shared_ptr pointing on an image.
 *
 * \ingroup ResourcesManagement
 */
class GD_API ImageManager
{
    public:
        ImageManager();
        virtual ~ImageManager() {};

        /**
         * Set the game associated with the image manager.
         */
        void SetGame(Game * game_) { game = game_; }

        /**
         * Load all images of the game which are flagged as alwaysLoaded.
         * \see ImageResource
         */
        void LoadPermanentImages();

        /**
         * Get a shared pointer to an OpenGL texture. The shared pointer must be kept alive as long as the texture is used.
         */
        boost::shared_ptr<OpenGLTextureWrapper> GetOpenGLTexture(std::string name) const;

        /**
         * Get a shared pointer to a SFML texture.  The shared pointer must be kept alive as long as the texture is used.
         * For example, if the texture is used in an object, you should store the shared pointer in a member to make sure the texture
         * is available as long as the object is alive.
         */
        boost::shared_ptr<SFMLTextureWrapper> GetSFMLTexture(std::string name) const;

        /**
         * Reload a single image
         */
        void ReloadImage(std::string name) const;

        /**
         * Return true if the image called "name" can be found in the game resources list.
         */
        bool HasImage(std::string name) const;

        /**
         * When called, images won't be unloaded from memory until EnableImagesUnloading is called.
         * Can be used when reloading a scene so as to prevent images from being unloaded and then immediately reloaded.
         */
        void PreventImagesUnloading();

        /**
         * Enable again unused images to be unloaded from memory.
         */
        void EnableImagesUnloading();

    private:
        mutable map < string, boost::weak_ptr<SFMLTextureWrapper> > alreadyLoadedImages; ///< Reference all images loaded in memory.
        mutable map < string, boost::shared_ptr<SFMLTextureWrapper> > permanentlyLoadedImages; ///< Contains (smart) pointers to images which should stay loaded even if they are not (currently) used.

        #if defined(GD_IDE_ONLY)

        /** This list is filled, when PreventImagesUnloading is called, with images already loaded in memory ( and any image loaded after the call to PreventImagesUnloading ).
        * It will thus prevent these images from being unloaded.
        * This list is destroyed when EnableImagesUnloading is called.
        *
        * \see PreventImagesUnloading
        * \see EnableImagesUnloading
        */
        mutable std::vector< boost::shared_ptr<SFMLTextureWrapper> > unloadingPreventer;
        bool preventUnloading; ///< True if no images must be currently unloaded.
        #endif

        mutable map < string, boost::weak_ptr<OpenGLTextureWrapper> > alreadyLoadedOpenGLTextures; ///< Reference all OpenGL textures loaded in memory.

        mutable boost::shared_ptr<SFMLTextureWrapper> badTexture;
        mutable boost::shared_ptr<OpenGLTextureWrapper> badOpenGLTexture;

        Game * game;
};

/**
 * \brief Class wrapping an SFML texture.
 *
 * \ingroup ResourcesManagement
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
 *
 * \ingroup ResourcesManagement
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
