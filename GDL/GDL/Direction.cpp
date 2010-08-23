#include "GDL/Direction.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include <iostream>

using namespace std;

Sprite Direction::badSprite;

Direction::Direction() :
loop(false),
timeBetweenFrame(1)
{
    //ctor
}

Direction::~Direction()
{
    //dtor
}

void Direction::SetLoop( bool loop_ )
{
    loop = loop_;
}

void  Direction::SetTimeBetweenFrames( float time )
{
    timeBetweenFrame = time;
}

void Direction::AddSprite( const Sprite & sprite )
{
    sprites.push_back(sprite);
}

const Sprite & Direction::GetSprite(unsigned int nb) const
{
    if ( nb < sprites.size() )
        return sprites[nb];

    cout << "Impossible d'accéder au sprite " << nb << endl;
    return badSprite;
}

Sprite & Direction::GetSprite(unsigned int nb)
{
    if ( nb < sprites.size() )
        return sprites[nb];

    cout << "Impossible d'accéder pour modifier le sprite " << nb << endl;
    return badSprite;
}
