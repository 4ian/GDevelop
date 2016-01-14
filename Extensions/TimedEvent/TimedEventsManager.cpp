/**

GDevelop - Timed Event Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TimedEventsManager.h"

std::map < RuntimeScene* , TimedEventsManager > TimedEventsManager::managers; //List of managers associated with scenes.

