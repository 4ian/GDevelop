/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef TIMEMANAGER_H
#define TIMEMANAGER_H
#include <map>
#include "GDCpp/Runtime/String.h"
#include "GDCpp/Runtime/ManualTimer.h"

/**
 * \brief Manage the timers and times elapsed during last
 * frame, since the beginning of the scene and other time related values.
 *
 * In particular, each RuntimeScene owns a TimeManager.
 *
 * \see RuntimeScene
 * \ingroup GameEngine
 */
class GD_API TimeManager
{
public:
    /**
     * @brief Default constructor.
     */
    TimeManager()
    {
        Reset();
    }

    void Reset();

    bool Update(signed int realElapsedTime, double minimumFPS);

    /**
     * \brief Change time scale.
     *
     * Time will be slower if time scale is < 1,
     * faster if > 1.
     * \param timeScale The new time scale (must be positive).
     */
    void SetTimeScale(double timeScale_) { timeScale = timeScale_; };

    /**
     * \brief Get the time scale.
     */
    double GetTimeScale() const { return timeScale; };

    /**
     * \brief Get elapsed time since last frame, in microseconds.
     */
    signed long long GetElapsedTime() const { return elapsedTime; };

    /**
     * \brief Get time elapsed since beginning, in microseconds.
     */
    signed long long GetTimeFromStart() const { return timeFromStart; };

    /**
     * \brief Return true if Update was called only once (i.e: if the scene
     * is rendering its first frame).
     */
    bool IsFirstLoop() const { return firstLoop; };

    /**
     * \brief Notify that something (like a file dialog) stopped the scene
     * for a certain amount of time.
     * \param pauseTime_ Pause duration, in microseconds.
     */
    void NotifyPauseWasMade(signed long long pauseTime_) { pauseTime += pauseTime_; }

    /** \name Timers
     * Functions to manipulate timers
     */
    ///@{
    void AddTimer(gd::String name);
    bool HasTimer(gd::String name) const;
    ManualTimer & GetTimer(gd::String name);
    void RemoveTimer(gd::String name);

    /**
     * \brief Provide a direct access to all the timers.
     *
     * Useful to build a custom interface (i.e: debugger) displaying the timers.
     */
    std::map<gd::String, ManualTimer> & GetTimers() { return timers; }
    ///@}

private:
    bool firstLoop;
    bool firstUpdateDone;
    signed int elapsedTime; ///< Elapsed time since last frame, in microseconds ( elapsedTime = realElapsedTime*timeScale ).
    double timeScale; ///< Time scale
    signed long long timeFromStart; ///< Time, in microseconds, elapsed since the beginning.
    signed long long pauseTime; ///< Time to be subtracted to realElapsedTime for the current frame.

    std::map<gd::String, ManualTimer> timers; ///<Timers of the scene.
    ManualTimer nullTimer; ///<Timer with a time which is always 0.
};

#endif
