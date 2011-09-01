/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITE_H
#define SPRITE_H
#include <SFML/Graphics.hpp>
#include <boost/shared_ptr.hpp>
#include "GDL/Point.h"
#include <string>
#include "GDL/RotatedRectangle.h"
class SFMLTextureWrapper;
#undef LoadImage //prevent windows.h polluting everything

/**
 * \brief Game Develop Sprite class.
 * A sprite contains a SFML sprite to be displayed,
 * some points, and can also have its own image ( rather than a image from ImageManager ).
 */
class GD_API Sprite
{
public:
    Sprite();
    virtual ~Sprite();

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
     * Change the name of the Sprite's image
     */
    inline void SetImageName(const std::string & image_) { image = image_; }

    /**
     * Get the name of the Sprite's image
     */
    inline const std::string & GetImageName() const { return image; }

    /**
     * Get the collision mask ( custom or automatically generated owing to IsCollisionMaskAutomatic() )
     */
    std::vector<RotatedRectangle> GetCollisionMask() const;

    /**
     * Set the custom collision mask.
     * Call then SetCollisionMaskAutomatic() to use it.
     */
    void SetCustomCollisionMask(const std::vector<RotatedRectangle> & collisionMask) {customCollisionMask = collisionMask;};

    /**
     * Return true if a custom collision mask is used.
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
     */
    inline const Point & GetCentre() const { return centre; }

    /**
     * Return Centre point.
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

    /**
     * Make the sprite, if it uses an image from ImageManager,
     * copy this image and own it inside.
     */
    void MakeSpriteOwnsItsImage();

private:

    sf::Sprite sfmlSprite; ///< Displayed SFML sprite
    boost::shared_ptr<SFMLTextureWrapper> sfmlImage; ///< Pointer to the image displayed by the sprite.
    bool hasItsOwnImage; ///< True if sfmlImage is only owned by this Sprite.
    std::string image; ///< Name of the image to be loaded in Image Manager.

    bool automaticCollisionMask; ///< True to use the custom collision mask. Otherwise, a basic bounding box is returned by GetCollisionMask()
    std::vector<RotatedRectangle> customCollisionMask; ///< Custom collision mask

    std::vector < Point > points; ///< List of the points used by the sprite
    Point origine; ///< Origin point
    Point centre; ///< Center point
    bool automaticCentre; ///< True to let the sprite compute its center

    static Point badPoint; //Si on ne peut pas retourner de points valide.
};

#endif // SPRITE_H
