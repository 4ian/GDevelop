/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Animation.h"
#include <iostream>
#include <string>
#include <vector>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include "GDL/Direction.h"

Direction Animation::badDirection;

Animation::Animation() :
typeNormal(true),
directionsNumber(0)
{
}

Animation::~Animation()
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
