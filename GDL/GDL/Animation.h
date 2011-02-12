/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ANIMATION_H
#define ANIMATION_H

#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include "GDL/Direction.h"

using namespace std;

/**
 * \brief Animation class mainly used by Sprite objects. Contains directions.
 */
class GD_API Animation
{
    public:
        Animation();
        virtual ~Animation() {};

        /**
         * Return the n-th direction
         */
        const Direction & GetDirection(unsigned int n) const;

        /**
         * Return the n-th direction
         */
        Direction & GetDirectionToModify(unsigned int n);

        /**
         * Change a direction
         */
        void SetDirection(const Direction & direction, unsigned int nb);

        /**
         * Change direction count
         */
        void SetDirectionsNumber(unsigned int nb);

        /**
         * Get direction count
         */
        unsigned int GetDirectionsNumber() const { return directionsNumber; };

        /**
         * True if there is no direction in the animation
         */
        inline bool HasNoDirections() const { return directions.empty(); };

        bool typeNormal;

    private:

        unsigned int directionsNumber;
        vector < Direction > directions;

        static Direction badDirection;
};

#endif // ANIMATION_H
