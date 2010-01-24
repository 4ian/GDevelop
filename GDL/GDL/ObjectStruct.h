/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  ObjectStruct.h
 *
 *  Structure des objets
 */

#ifndef OBJECTSTRUCT_H_INCLUDED
#define OBJECTSTRUCT_H_INCLUDED

#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
using namespace std;

struct ObjectDirection
{
    vector<sf::Sprite> sprites;
    float tempEntreEachSprite;
    bool boucle;
};

struct ObjectStruct
{
    string nom;
    int direction; //Direction, entre 0 et 7 ( sens aiguilles d'une montre )
    vector<ObjectDirection> directions;
};


#endif // OBJECTSTRUCT_H_INCLUDED
