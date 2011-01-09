/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef BASEPROFILER_H
#define BASEPROFILER_H
#include <SFML/System.hpp>
#include "GDL/profile.h"

/**
 * Base class to create a profiler.
 */
class GD_API BaseProfiler
{
    public:
        BaseProfiler();
        virtual ~BaseProfiler() {};

        bool profilingActivated; ///< Set this to true so as to activate profiling.

        unsigned long int lastEventsTime; ///< Time used by events during the last frame
        unsigned long int lastRenderingTime; ///< Time used by rendering during the last frame
        unsigned long int totalSceneTime; ///< Total time used by events and rendering since the beginning.
        unsigned long int totalEventsTime; ///< Total time used by events since the beginning.

        btClock eventsClock; ///< Used to compute time used by events during the frame
        btClock renderingClock; ///< Used to compute time used by rendering during the frame

        void Update();
        void Reset();

    protected:
        float stepTime; ///< Time between each UpdateGUI.

        /**
         * Redefine this function so as to update GUI.
         */
        virtual void UpdateGUI() = 0;
    private:
        sf::Clock stepClock;
};

#endif // BASEPROFILER_H
#endif
