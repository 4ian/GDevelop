#include "GDL/Animation.h"
#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include "GDL/MemTrace.h"

Direction Animation::badDirection;

Animation::Animation() :
typeNormal(true),
directionsNumber(0)
{
}

void Animation::SetDirectionsNumber(unsigned int nb)
{
    directionsNumber = nb;

    while ( nb >= directions.size() )
    {
        Direction direction;
        directions.push_back(direction);
    }
    //TODO : erase
}

unsigned int Animation::GetDirectionsNumber() const
{
    return directionsNumber;
}

const Direction & Animation::GetDirection(unsigned int nb) const
{
    if ( !typeNormal )
        nb = 0; //En mode rotation automatique, on est toujours à la direction 0

    if ( nb < directionsNumber )
        return directions[nb];

    return badDirection;
}

Direction & Animation::GetDirectionToModify(unsigned int nb)
{
    if ( !typeNormal )
        nb = 0; //En mode rotation automatique, on est toujours à la direction 0

    if (nb < directionsNumber )
        return directions[nb];

    return badDirection;
}


void Animation::SetDirection(const Direction & direction, unsigned int nb)
{
    if (nb < directionsNumber )
        directions[nb] = direction;

    return;
}

bool Animation::AddSpriteToDirection( const sf::Sprite & sprite, unsigned int nb)
{
    if ( !typeNormal )
        nb = 0; //En mode rotation automatique, on est toujours à la direction 0

    if ( nb < directionsNumber )
    {
        directions[nb].AddSprite(sprite);
        return true;
    }

    cout << "Impossible d'ajouter le sprite à la direction " << nb << endl;
    return false;
}

Animation::~Animation()
{
    //dtor
}
