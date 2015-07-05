#include "GDCpp/ManualTimer.h"

ManualTimer::ManualTimer() :
time(0),
isPaused(false)
{
    //ctor
}

ManualTimer::ManualTimer(gd::String name_) :
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

