/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
 * Animation used by Sprite objects. Contains directions.
 */
class GD_API Animation
{
    public:
        Animation();
        virtual ~Animation() {};

        const Direction & GetDirection(unsigned int nb) const;
        Direction & GetDirectionToModify(unsigned int nb);
        void SetDirection(const Direction & direction, unsigned int nb);

        void SetDirectionsNumber(unsigned int nb);
        unsigned int GetDirectionsNumber() const;

        bool typeNormal;

    private:

        unsigned int directionsNumber;
        vector < Direction > directions;

        static Direction badDirection;
};

#endif // ANIMATION_H
