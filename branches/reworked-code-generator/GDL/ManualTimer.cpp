#include "GDL/ManualTimer.h"

ManualTimer::ManualTimer() :
time(0),
isPaused(false)
{
    //ctor
}

ManualTimer::ManualTimer(string name_) :
name(name_),
time(0),
isPaused(false)
{
    //ctor
}

ManualTimer::~ManualTimer()
{
    //dtor
}
