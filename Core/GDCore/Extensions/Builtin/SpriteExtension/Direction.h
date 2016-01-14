/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_DIRECTION_H
#define GDCORE_DIRECTION_H
#include <vector>
namespace gd { class Sprite; }
namespace gd { class SerializerElement; }

namespace gd {

/**
 * \brief Class defining a direction of an Animation.
 *
 * \see SpriteObject
 * \see Animation
 * \see Sprite
 * \ingroup SpriteObjectExtension
 *
 * \todo Support UTF8 (currently convert all loaded strings from UTF8 to the current locale)
 */
class GD_CORE_API Direction
{
public:
    Direction();
    virtual ~Direction();

    /**
     * Return true if sprites looping is activated
     */
    inline bool IsLooping() const { return loop; }

    /**
     * Set if the sprites must be looping or not.
     */
    void SetLoop(bool loop_);

    /**
     * Get the time between each sprite
     */
    inline float GetTimeBetweenFrames() const { return timeBetweenFrame; }

    /**
     * Set the time between each sprite
     * \param time Time between each sprite, in seconds.
     */
    void SetTimeBetweenFrames(float time);

    /**
     * Return a reference to a sprite of the direction.
     * \param nb The index of the sprite to be accessed. Bound checking is not made.
     * \return A reference to the sprite.
     */
    const Sprite & GetSprite(std::size_t nb) const;

    /**
     * Return a reference to a sprite of the direction.
     * \param nb The index of the sprite to be accessed. Bound checking is not made.
     * \return A reference to the sprite.
     */
    Sprite & GetSprite(std::size_t nb);

    /**
     * Check if the direction contains sprites.
     * \return true if the direction does not have any sprite.
     */
    bool HasNoSprites() const;

    /**
     * Return the number of sprite used in the direction
     * \return The number of sprite used in the direction
     */
    std::size_t GetSpritesCount() const;

    /**
     * Remove the sprite at the specified position.
     * Bound-checking is made.
     */
    void RemoveSprite(std::size_t index);

    /**
     * Clear the direction from all of its sprites
     */
    void RemoveAllSprites();

    /**
     * Add a new sprite at the end of the list.
     */
    void AddSprite( const Sprite & sprite );

    /**
     * Swap the position of two sprites
     */
    void SwapSprites(std::size_t firstSpriteIndex, std::size_t secondSpriteIndex);

    void UnserializeFrom(const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    void SerializeTo(gd::SerializerElement & element) const;
    #endif

private:
    bool loop; ///< true if the animation must loop.
    float timeBetweenFrame; ///< The time between each sprite of the animation.
    std::vector < Sprite > sprites; ///< The sprites of the direction.
};

}
#endif // GDCORE_DIRECTION_H
