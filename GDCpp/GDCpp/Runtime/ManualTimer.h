/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef MANUALTIMER_H
#define MANUALTIMER_H
#include <string>
#include "GDCpp/Runtime/String.h"

/**
 * \brief Manual timer, updated using ManualTimer::UpdateTime member function.
 *
 * \ingroup GameEngine
 */
class GD_API ManualTimer
{
public:
    ManualTimer();

    virtual ~ManualTimer() {};

    /**
     * \brief Update the time of the timer
     * \param time Time to add in microseconds
     */
    inline void UpdateTime(signed long long time_) { if (!isPaused) time += time_; };

    /**
     * \brief Reset time to zero.
     */
    inline void Reset() { time = 0; };

    /**
     * \brief Get the timer elapsed time, in microseconds.
     * \return Elapsed time, in microseconds.
     */
    inline signed long long GetTime() const { return time; };

    /**
     * \brief Change the timer's value.
     * \param newTime The timer's new value
     */
    inline void SetTime(signed long long newTime) { time = newTime; };

    /**
     * \brief Return true if the timer is paused.
     */
    inline bool IsPaused() const { return isPaused; };

    /**
     * \brief Set the paused state of the timer.
     * @param newState true to pause the timer, false to unpause it.
     */
    inline void SetPaused(bool newState = true) { isPaused = newState; };

private:
    signed long long time; ///< Time elapsed in microseconds
    bool isPaused; ///< True if timer is paused
};

#endif // MANUALTIMER_H
