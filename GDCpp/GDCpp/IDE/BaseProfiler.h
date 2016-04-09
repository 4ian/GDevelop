/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#ifndef BASEPROFILER_H
#define BASEPROFILER_H
#include <memory>
#include <vector>
#include <SFML/System.hpp>
#include "GDCpp/Runtime/profile.h"
namespace gd { class BaseEvent; }

/**
 * \brief Internal class used as a link between compiled events code and events.
 */
class ProfileLink
{
public:
    ProfileLink() : time(0) {};

    void Reset();
    void Stop();
    unsigned long int GetTime() const { return time; }

    btClock profileClock;
    unsigned long int time;
    std::weak_ptr<gd::BaseEvent> originalEvent;
};

/**
 * \brief Base class to create a profiler.
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

    std::vector<ProfileLink> profileEventsInformation; ///< Used by events generated code

    void Update();
    void Reset();

protected:
    sf::Uint32 stepTime; ///< Time between each UpdateGUI, in milliseconds.

    /**
     * Redefine this function so as to update GUI.
     */
    virtual void UpdateGUI() = 0;
private:
    sf::Clock stepClock;
};

#endif // BASEPROFILER_H
#endif

