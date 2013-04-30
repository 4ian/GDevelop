/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
namespace gd { class Project; }
class OpenGLTextureWrapper;
class SFMLTextureWrapper;
#undef LoadImage //thx windows.h

namespace gd
{

/**
 * \brief Manage images for the IDE as well as at runtime for GD C++ Platform, providing an easy way to get SFML images or OpenGL textures.
 *
 * Image manager is used by objects to obtain their images from the image name.<br>
 * Images are loaded dynamically when necessary, and are unloaded if there is no
 * more shared_ptr pointing on an image.
 *
 * You should in particular be interested by gd::ImageManager::GetOpenGLTexture and gd::ImageManager::GetSFMLTexture.
 *
 * \see SFMLTextureWrapper
 * \see OpenGLTextureWrapper
 *
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ImageManager
{
public:
    ImageManager();
    virtual ~ImageManager() {};

    /**
     * \brief Get a shared pointer to an OpenGL texture. The shared pointer must be kept alive as long as the texture is used.
     */
    boost::shared_ptr<OpenGLTextureWrapper> GetOpenGLTexture(const std::string & name) const;

    /**
     * \brief Get a shared pointer to a SFML texture.  The shared pointer must be kept alive as long as the texture is used.
     *
     * For example, if the texture is used in an object, you should store the shared pointer in a member to make sure the texture
     * is available as long as the object is alive.
     */
    boost::shared_ptr<SFMLTextureWrapper> GetSFMLTexture(const std::string & name) const;

    /**
     * \brief Set the project associated with the image manager.
     */
    void SetGame(gd::Project * game_) { game = game_; }

    /**
     * \brief Load all images of the project which are flagged as alwaysLoaded.
     * \see ImageResource
     */
    void LoadPermanentImages();

    /**
     * \brief Check if a SFML texture with the specified name is available and loaded in memory.
     * \return true if the texture called \a name if available and loaded in memory.
     */
    bool HasLoadedSFMLTexture(const std::string & name) const;

    /**
     * \brief Add the SFMLTextureWrapper to loaded images ( so that it can be accessed thanks to ImageManager::GetSFMLTexture ) with the specified name and
     * mark it as permanently loaded ( so that is is unloaded only when the layout is unloaded ).
     */
    void SetSFMLTextureAsPermanentlyLoaded(const std::string & name, boost::shared_ptr<SFMLTextureWrapper> & texture) const;

    /**
     * \brief Reload a single image from the game resources
     */
    void ReloadImage(const std::string & name) const;

    #if defined(GD_IDE_ONLY)
    /**
     * \brief When called, images won't be unloaded from memory until EnableImagesUnloading is called.
     * Can be used when reloading a layout so as to prevent images from being unloaded and then immediately reloaded.
     */
    void PreventImagesUnloading();

    /**
     * \brief Enable again unused images to be unloaded from memory.
     */
    void EnableImagesUnloading();
    #endif

private:
    mutable std::map < std::string, boost::weak_ptr<SFMLTextureWrapper> > alreadyLoadedImages; ///< Reference all images loaded in memory.
    mutable std::map < std::string, boost::shared_ptr<SFMLTextureWrapper> > permanentlyLoadedImages; ///< Contains (smart) pointers to images which should stay loaded even if they are not (currently) used.

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

    mutable std::map < std::string, boost::weak_ptr<OpenGLTextureWrapper> > alreadyLoadedOpenGLTextures; ///< Reference all OpenGL textures loaded in memory.

    mutable boost::shared_ptr<SFMLTextureWrapper> badTexture;
    mutable boost::shared_ptr<OpenGLTextureWrapper> badOpenGLTexture;

    gd::Project * game;
};

}

/**
 * \brief Class wrapping an SFML texture.
 *
 * \see gd::ImageManager
 * \ingroup ResourcesManagement
 */
class GD_CORE_API SFMLTextureWrapper
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
 * \see gd::ImageManager
 * \ingroup ResourcesManagement
 */
class GD_CORE_API OpenGLTextureWrapper
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
