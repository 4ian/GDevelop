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
angle(0),
zOrder(0),
layer(""),
personalizedSize(false),
width(0),
height(0)
{
    //ctor
}

InitialPosition::~InitialPosition()
{
    //dtor
}
