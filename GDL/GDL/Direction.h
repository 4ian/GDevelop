/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DIRECTION_H
#define DIRECTION_H
#include <string>
#include <vector>
#include <SFML/Graphics.hpp>
#include "GDL/Sprite.h"

using namespace std;

/**
 * \brief Class defining a direction of an Animation.
 *
 * \see SpriteObject
 * \see Animation
 * \see Sprite
 * \ingroup SpriteObjectExtension
 */
class GD_API Direction
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
     * \param nb The index of the sprite to be accessed. Bound checking is made.
     * \return A reference to the sprite.
     */
    const Sprite & GetSprite(unsigned int nb) const;

    /**
     * Return a reference to a sprite of the direction.
     * \param nb The index of the sprite to be accessed. Bound checking is made.
     * \return A reference to the sprite.
     */
    Sprite & GetSprite(unsigned int nb);

    /**
     * Check if the direction contains sprites.
     * \return true if the direction does not have any sprite.
     */
    inline bool HasNoSprites() const { return sprites.empty(); }

    /**
     * Return the number of sprite used in the direction
     * \return The number of sprite used in the direction
     */
    inline unsigned int GetSpritesNumber() const { return sprites.size(); }

    /**
     * Clear the direction from all of its sprites
     */
    inline void RemoveAllSprites() { sprites.clear(); }

    /**
     * Add a new sprite at the end of the list.
     */
    void AddSprite( const Sprite & sprite );

    /**
     * Provide raw read-only access to the sprite list.
     */
    inline const vector < Sprite > & GetSprites() const { return sprites; }

    /**
     * Provide raw access to the sprite list.
     */
    inline vector < Sprite > & GetSpritesToModify() { return sprites; }

    /**
     * Replace the entire sprite list by a new one.
     */
    inline void SetSprites(const vector < Sprite > & sprites_) { sprites = sprites_; }


private:
    bool loop;
    float timeBetweenFrame;
    vector < Sprite > sprites; ///< List of the sprite of the direction

    static Sprite badSprite;
};

#endif // DIRECTION_H
