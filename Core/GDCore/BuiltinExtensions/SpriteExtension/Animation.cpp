/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Sprite.h"
#include <string>
#include <vector>

namespace gd {

Direction Animation::badDirection;

Animation::Animation() :
    useMultipleDirections(false)
{
}

Animation::~Animation()
{
}

unsigned int Animation::GetDirectionsCount() const
{
    return directions.size();
};

bool Animation::HasNoDirections() const
{
    return directions.empty();
};

void Animation::SetDirectionsCount(unsigned int nb)
{
    while ( directions.size() < nb ) {
        Direction direction;
        directions.push_back(direction);
    }
    while ( directions.size() > nb )
        directions.erase(directions.begin()+directions.size()-1);
}

const Direction & Animation::GetDirection(unsigned int nb) const
{
    if (!useMultipleDirections) nb = 0;

    if ( nb < directions.size() )
        return directions[nb];

    return badDirection;
}

Direction & Animation::GetDirection(unsigned int nb)
{
    if (!useMultipleDirections) nb = 0;

    if (nb < directions.size() )
        return directions[nb];

    return badDirection;
}


void Animation::SetDirection(const Direction & direction, unsigned int nb)
{
    if (nb < directions.size() ) directions[nb] = direction;

    return;
}

}
