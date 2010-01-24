#ifndef ANIMATION_H
#define ANIMATION_H

#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include "GDL/Direction.h"

using namespace std;

class GD_API Animation
{
    public:
        Animation();
        virtual ~Animation();

        const Direction & GetDirection(unsigned int nb) const;
        Direction & GetDirectionToModify(unsigned int nb);
        void SetDirection(const Direction & direction, unsigned int nb);
        bool AddSpriteToDirection( const sf::Sprite & sprite, unsigned int nb);

        void SetDirectionsNumber(unsigned int nb);
        unsigned int GetDirectionsNumber() const;

        bool typeNormal;

    protected:
    private:

        unsigned int directionsNumber;
        vector < Direction > directions;

        static Direction badDirection;
};

#endif // ANIMATION_H
