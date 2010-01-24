/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Position permet de contenir les positions initales des objets et d'autres paramètres.
 *  Dans le jeu, les objets retiennent eux mêmes leurs positions et paramètres.
 */

#include "GDL/Position.h"
#include "GDL/MemTrace.h"

#include <string>

using namespace std;

InitialPosition::InitialPosition() :
objectName(""),
x(0),
y(0),
zOrder(0),
layer(""),
animation(0),
direction(0)
{
    //ctor
}

InitialPosition::~InitialPosition()
{
    //dtor
}
