/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITE_H
#define SPRITE_H
#include <string>
#include <boost/shared_ptr.hpp>
#if defined(EMSCRIPTEN)
#include <SFML/Graphics.hpp>
#endif
#include "GDCpp/Point.h"
#include "GDCpp/Polygon.h"
class SFMLTextureWrapper;
#undef LoadImage //prevent windows.h to be polluting everything

/**
 * \brief Represents a sprite to be included in a Direction and to display on the screen
 *
 * A sprite contains a SFML sprite to be displayed, some points, and can also have its own image ( rather than a image from ImageManager ).
 *
 * \see Direction
 * \see SpriteObject
 * \ingroup SpriteObjectExtension
 */
class GD_API Sprite
{
public:
    Sprite();
    virtual ~Sprite();

    /**
     * Change the name of the Sprite's image
     */
    inline void SetImageName(const std::string & image_) { image = image_; }

    /**
     * Get the name of the Sprite's image
     */
    inline const std::string & GetImageName() const { return image; }

    /**
     * Get a reference to the name of the image
     */
    inline std::string & GetImageName() { return image; }

    /**
     * Get the collision mask ( custom or automatically generated owing to IsCollisionMaskAutomatic() )
     *
     * \warning If the image has not been loaded ( using LoadImage ) and the collision mask is set as automatic,
     * the returned mask won't be correct.
     */
    std::vector<Polygon2d> GetCollisionMask() const;

    /**
     * Set the custom collision mask.
     * Call then SetCollisionMaskAutomatic() to use it.
     */
    void SetCustomCollisionMask(const std::vector<Polygon2d> & collisionMask) {customCollisionMask = collisionMask;};

    /**
     * Return true if the collision mask is a bounding box, false if a custom collision mask is used.
     */
    inline bool IsCollisionMaskAutomatic() const { return automaticCollisionMask; }

    /**
     * Un/Set use of the custom collision mask.
     */
    inline void SetCollisionMaskAutomatic(bool enabled) { automaticCollisionMask = enabled; };

    /**
     * Return all points without origin and center
     */
    inline std::vector < Point > & GetAllNonDefaultPoints() { return points; }

    /**
     * Return all points without origin and center
     */
    inline const std::vector < Point > & GetAllNonDefaultPoints() const { return points; }

    /**
     * Add a point
     */
    void AddPoint( const Point & point );

    /**
     * Delete point with the specified name
     */
    void DelPoint( const std::string & name );

    /**
     * Return point with name passed in argument
     */
    const Point & GetPoint( const std::string & name) const;

    /**
     * Return point with name passed in argument
     */
    Point & GetPoint(const std::string & name);

    /**
     * Return true if the point exists.
     */
    bool HasPoint( const std::string & name ) const;

    /**
     * Return Origin point.
     */
    inline const Point & GetOrigine() const { return origine; }

    /**
     * Return Origin point.
     */
    inline Point & GetOrigine() { return origine; }

    /**
     * Return Centre point.
     *
     * \warning If the image has not been loaded ( using LoadImage ) and the center point is set as automatic,
     * the returned point won't be correct.
     */
    inline const Point & GetCentre() const { return centre; }

    /**
     * Return Centre point.
     *
     * \warning If the image has not been loaded ( using LoadImage ) and the center point is set as automatic,
     * the returned point won't be correct.
     */
    inline Point & GetCentre() { automaticCentre = false; return centre; }

    /**
     * Return true if the center point is automatically computed
     */
    inline bool IsCentreAutomatic() const { return automaticCentre; }

    /**
     * Un/Set automatic centre
     */
    bool SetCentreAutomatic(bool enabled);

    /** \name Sprite runtime management
     * Functions used by the C++ game engine.
     */
    ///@{
    #if !defined(EMSCRIPTEN)
    /**
     * Get the SFML Sprite associated with the Sprite
     */
    inline const sf::Sprite & GetSFMLSprite() const { return sfmlSprite; }

    /**
     * Get the SFML Sprite associated with the Sprite
     */
    inline sf::Sprite & GetSFMLSprite() { return sfmlSprite; }

    /**
     * Set a new image to the Sprite
     */
    void LoadImage(boost::shared_ptr<SFMLTextureWrapper> image);

    /**
     * Get SFML Image used by the sprite
     */
    boost::shared_ptr<SFMLTextureWrapper> GetSFMLTexture() { return sfmlImage; };

    /**
     * Get SFML Image used by the sprite
     */
    const boost::shared_ptr<SFMLTextureWrapper> GetSFMLTexture() const { return sfmlImage; };

    /**
     * Make the sprite, if it uses an image from ImageManager,
     * copy this image and own it inside.
     */
    void MakeSpriteOwnsItsImage();
    #endif
    ///@}

private:

    #if !defined(EMSCRIPTEN)
    sf::Sprite sfmlSprite; ///< Displayed SFML sprite
    boost::shared_ptr<SFMLTextureWrapper> sfmlImage; ///< Pointer to the image displayed by the sprite.
    #endif
    bool hasItsOwnImage; ///< True if sfmlImage is only owned by this Sprite.

    std::string image; ///< Name of the image to be loaded in Image Manager.

    bool automaticCollisionMask; ///< True to use the custom collision mask. Otherwise, a basic bounding box is returned by GetCollisionMask()
    std::vector<Polygon2d> customCollisionMask; ///< Custom collision mask

    std::vector < Point > points; ///< List of the points used by the sprite
    Point origine; ///< Origin point
    Point centre; ///< Center point
    bool automaticCentre; ///< True to let the sprite compute its center

    static Point badPoint; ///< Returned when no other valid Point object is available.
};

#endif // SPRITE_H

