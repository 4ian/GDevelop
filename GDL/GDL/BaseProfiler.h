/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#ifndef BASEPROFILER_H
#define BASEPROFILER_H
#include <SFML/System.hpp>
#include "GDL/profile.h"

class GD_API BaseProfiler
{
    public:
        BaseProfiler();
        virtual ~BaseProfiler() {};

        unsigned long int lastEventsTime;
        unsigned long int lastRenderingTime;

        btClock eventsClock;
        btClock renderingClock;

        void Update();

    private:
        virtual void UpdateGUI() = 0;

        sf::Clock timeInterval;
};

#endif // BASEPROFILER_H
#endif
