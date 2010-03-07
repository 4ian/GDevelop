/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
actionsHeight(0),
selected(false)
#endif
{
}

Event::~Event()
{
}


