/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Event.cpp
 *
 *  Classe contenant un évènement : condition(s) + para et action(s) + paramètres.
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Event.h"
#include "GDL/MemTrace.h"

Event::Event() :
type("AND"),
r(255),
v(230),
b(109),
sceneLinked(""),
start(0),
end(0)
#ifdef GDE
,conditionsHeightNeedUpdate(true),
conditionsHeight(0),
actionsHeightNeedUpdate(true),
actionsHeight(0)
#endif
{
}

Event::~Event()
{
}


