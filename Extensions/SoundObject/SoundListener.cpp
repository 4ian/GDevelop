/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "SoundListener.h"
#include <SFML/Audio/Listener.hpp>

void GD_EXTENSION_API SetListenerX(const float & xpos)
{
    sf::Listener::setPosition(xpos, sf::Listener::getPosition().y, sf::Listener::getPosition().z);
}

void GD_EXTENSION_API SetListenerY(const float & ypos)
{
    sf::Listener::setPosition(sf::Listener::getPosition().x, ypos, sf::Listener::getPosition().z);
}

void GD_EXTENSION_API SetListenerZ(const float & zpos)
{
    sf::Listener::setPosition(sf::Listener::getPosition().x, sf::Listener::getPosition().y, zpos);
}

float GD_EXTENSION_API GetListenerX()
{
    return sf::Listener::getPosition().x;
}

float GD_EXTENSION_API GetListenerY()
{
    return sf::Listener::getPosition().y;
}

float GD_EXTENSION_API GetListenerZ()
{
    return sf::Listener::getPosition().z;
}

void GD_EXTENSION_API SetListenerDirectionX(const float & xdir)
{
    sf::Listener::setDirection(xdir, sf::Listener::getDirection().y, sf::Listener::getDirection().z);
}

void GD_EXTENSION_API SetListenerDirectionY(const float & ydir)
{
    sf::Listener::setDirection(sf::Listener::getDirection().x, ydir, sf::Listener::getDirection().z);
}

void GD_EXTENSION_API SetListenerDirectionZ(const float & zdir)
{
    sf::Listener::setDirection(sf::Listener::getDirection().x, sf::Listener::getDirection().y, zdir);
}

float GD_EXTENSION_API GetListenerDirectionX()
{
    return sf::Listener::getDirection().x;
}

float GD_EXTENSION_API GetListenerDirectionY()
{
    return sf::Listener::getDirection().y;
}

float GD_EXTENSION_API GetListenerDirectionZ()
{
    return sf::Listener::getDirection().z;
}

void GD_EXTENSION_API SetGlobalVolume(const float & globalVolume)
{
    sf::Listener::setGlobalVolume(globalVolume);
}

float GD_EXTENSION_API GetGlobalVolume()
{
    return sf::Listener::getGlobalVolume();
}

