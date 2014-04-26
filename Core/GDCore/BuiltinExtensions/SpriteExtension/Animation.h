/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_ANIMATION_H
#define GDCORE_ANIMATION_H
#include <vector>
namespace gd { class Direction; }

namespace gd
{

/**
 * \brief Class representing an animation of a SpriteObject.
 *
 * \see SpriteObject
 * \see Direction
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Animation
{
public:
    Animation();
    virtual ~Animation();

    /**
     * \brief Return the n-th direction
     */
    const Direction & GetDirection(unsigned int n) const;

    /**
     * \brief Return the n-th direction
     */
    Direction & GetDirection(unsigned int n);

    /**
     * \brief Change a direction
     */
    void SetDirection(const Direction & direction, unsigned int nb);

    /**
     * \brief Change direction count
     */
    void SetDirectionsCount(unsigned int nb);

    /**
     * \brief Get direction count
     */
    unsigned int GetDirectionsCount() const;

    /**
     * \brief Return true if there isn't any direction in the animation
     */
    bool HasNoDirections() const;

    bool useMultipleDirections;

private:
    std::vector < Direction > directions;

    static Direction badDirection;
};

}
#endif // GDCORE_ANIMATION_H
