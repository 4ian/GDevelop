/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/

#include "SoundListener.h"
#include <SFML/Audio/Listener.hpp>

void GD_EXTENSION_API SetListenerX(const float& xpos) {
  sf::Listener::setPosition(
      xpos, sf::Listener::getPosition().y, sf::Listener::getPosition().z);
}

void GD_EXTENSION_API SetListenerY(const float& ypos) {
  sf::Listener::setPosition(
      sf::Listener::getPosition().x, ypos, sf::Listener::getPosition().z);
}

void GD_EXTENSION_API SetListenerZ(const float& zpos) {
  sf::Listener::setPosition(
      sf::Listener::getPosition().x, sf::Listener::getPosition().y, zpos);
}

float GD_EXTENSION_API GetListenerX() { return sf::Listener::getPosition().x; }

float GD_EXTENSION_API GetListenerY() { return sf::Listener::getPosition().y; }

float GD_EXTENSION_API GetListenerZ() { return sf::Listener::getPosition().z; }

void GD_EXTENSION_API SetListenerDirectionX(const float& xdir) {
  sf::Listener::setDirection(
      xdir, sf::Listener::getDirection().y, sf::Listener::getDirection().z);
}

void GD_EXTENSION_API SetListenerDirectionY(const float& ydir) {
  sf::Listener::setDirection(
      sf::Listener::getDirection().x, ydir, sf::Listener::getDirection().z);
}

void GD_EXTENSION_API SetListenerDirectionZ(const float& zdir) {
  sf::Listener::setDirection(
      sf::Listener::getDirection().x, sf::Listener::getDirection().y, zdir);
}

float GD_EXTENSION_API GetListenerDirectionX() {
  return sf::Listener::getDirection().x;
}

float GD_EXTENSION_API GetListenerDirectionY() {
  return sf::Listener::getDirection().y;
}

float GD_EXTENSION_API GetListenerDirectionZ() {
  return sf::Listener::getDirection().z;
}

void GD_EXTENSION_API SetGlobalVolume(const float& globalVolume) {
  sf::Listener::setGlobalVolume(globalVolume);
}

float GD_EXTENSION_API GetGlobalVolume() {
  return sf::Listener::getGlobalVolume();
}
