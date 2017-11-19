/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef SPRITE_H
#define SPRITE_H
#include "GDCore/String.h"
#include <memory>
#include <SFML/Graphics/Sprite.hpp>
#include "GDCore/Extensions/Builtin/SpriteExtension/Point.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Polygon2d.h"
class SFMLTextureWrapper;
#undef LoadImage //prevent windows.h to be polluting everything

namespace gd
{

/**
 * \brief Represents a sprite to be displayed on the screen.
 *
 * A sprite contains a SFML sprite to be displayed, some points,
 * and can also have its own texture (rather than a texture from ImageManager).
 *
 * \see Direction
 * \see SpriteObject
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Sprite
{
public:
    Sprite();
    virtual ~Sprite();

    /**
     * \brief Change the name of the sprite image.
     */
    inline void SetImageName(const gd::String & image_) { image = image_; }

    /**
     * \brief Get the name of the sprite image.
     */
    inline const gd::String & GetImageName() const { return image; }

    /**
     * \brief Get the name of the sprite image.
     */
    inline gd::String & GetImageName() { return image; }

    /**
     * \brief Get the collision mask (custom or automatically generated owing to IsCollisionMaskAutomatic())
     *
     * \warning If the image has not been loaded ( using LoadImage ) and the collision mask is set as automatic,
     * the returned mask won't be correct.
     */
    std::vector<Polygon2d> GetCollisionMask() const;

    /**
     * \brief Set the custom collision mask.
     * Call then `SetCollisionMaskAutomatic(false)` to use it.
     */
    void SetCustomCollisionMask(const std::vector<Polygon2d> & collisionMask);

    /**
     * \brief Return true if the collision mask is a bounding box, false if a custom collision mask is used.
     */
    inline bool IsCollisionMaskAutomatic() const { return automaticCollisionMask; }

    /**
     * \brief Un/set use of the custom collision mask.
     */
    inline void SetCollisionMaskAutomatic(bool enabled) { automaticCollisionMask = enabled; };

    /**
     * \brief Return all points, excluding origin and center.
     */
    inline std::vector < Point > & GetAllNonDefaultPoints() { return points; }

    /**
     * \brief Return all points, excluding origin and center.
     */
    inline const std::vector < Point > & GetAllNonDefaultPoints() const { return points; }

    /**
     * \brief Add a point
     */
    void AddPoint( const Point & point );

    /**
     * \brief Delete a point
     */
    void DelPoint( const gd::String & name );

    /**
     * \brief Get the specified point.
     */
    const Point & GetPoint( const gd::String & name) const;

    /**
     * \brief Get the specified point.
     */
    Point & GetPoint(const gd::String & name);

    /**
     * \brief Return true if the point exists.
     */
    bool HasPoint( const gd::String & name ) const;

    /**
     * \brief Return Origin point.
     */
    inline const Point & GetOrigin() const { return origine; }

    /**
     * \brief Return Origin point.
     */
    inline Point & GetOrigin() { return origine; }

    /**
     * \brief Return Center point.
     *
     * \warning If the image has not been loaded (using LoadImage) and the center point is set as automatic,
     * the returned point won't be correct.
     */
    inline const Point & GetCenter() const { return centre; }

    /**
     * \brief Return Center point.
     *
     * \warning If the image has not been loaded (using LoadImage) and the center point is set as automatic,
     * the returned point won't be correct.
     */
    inline Point & GetCenter() { return centre; }

    /**
     * \brief Return true if the center point is automatically computed.
     */
    inline bool IsDefaultCenterPoint() const { return automaticCentre; }

    /**
     * \brief Un/set center as being automatically computed.
     */
    bool SetDefaultCenterPoint(bool enabled);

    #if !defined(EMSCRIPTEN)
    /** \name Sprite runtime management
     * Functions used by the C++ game engine.
     */
    ///@{
    /**
     * \brief Get the SFML sprite associated with the sprite
     */
    inline const sf::Sprite & GetSFMLSprite() const { return sfmlSprite; }

    /**
     * \brief Get the SFML sprite associated with the sprite
     */
    inline sf::Sprite & GetSFMLSprite() { return sfmlSprite; }

    /**
     * \brief Set the SFML texture of the sprite
     */
    void LoadImage(std::shared_ptr<SFMLTextureWrapper> image);

    /**
     * \brief Get SFML texture used by the sprite
     */
    std::shared_ptr<SFMLTextureWrapper> GetSFMLTexture() { return sfmlImage; };

    /**
     * \brief Get SFML texture used by the sprite
     */
    const std::shared_ptr<SFMLTextureWrapper> GetSFMLTexture() const { return sfmlImage; };

    /**
     * \brief Make the sprite, if it uses a texture from ImageManager,
     * copy this texture and take ownership of it.
     */
    void MakeSpriteOwnsItsImage();
    ///@}
    #endif

private:

    #if !defined(EMSCRIPTEN)
    sf::Sprite sfmlSprite; ///< Displayed SFML sprite
    std::shared_ptr<SFMLTextureWrapper> sfmlImage; ///< Pointer to the image displayed by the sprite.
    bool hasItsOwnImage; ///< True if sfmlImage is only owned by this Sprite.
    #endif
    gd::String image; ///< Name of the image to be loaded in Image Manager.

    bool automaticCollisionMask; ///< True to use the custom collision mask. Otherwise, a basic bounding box is returned by GetCollisionMask()
    std::vector<Polygon2d> customCollisionMask; ///< Custom collision mask

    std::vector < Point > points; ///< List of the points used by the sprite
    Point origine; ///< Origin point
    Point centre; ///< Center point
    bool automaticCentre; ///< True to let the sprite compute its center

    static Point badPoint; ///< Returned when no other valid Point object is available.
};


}
#endif // SPRITE_H
