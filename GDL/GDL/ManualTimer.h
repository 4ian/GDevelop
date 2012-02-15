#ifndef MANUALTIMER_H
#define MANUALTIMER_H
#include <string>

using namespace std;
/**
 * \brief Manual timer updated using ManualTimer::UpdateTime member function.
 *
 *  A manual timer is a timer which is updated manually by calling UpdateTime.
 */
class GD_API ManualTimer
{
    public:

        ManualTimer();

        /**
         * Constructor
         * \param name_ The name of the timer
         */
        ManualTimer(std::string name_);

        virtual ~ManualTimer();

        /**
         * Get the name of the timer
         * @return Timer's name
         */
        inline std::string GetName() { return name; };

        /**
         * Update the time of the timer
         * @param time_ Time to add in milliseconds
         */
        inline void UpdateTime(float time_) { if (!isPaused) time += time_; };

        /**
         * Reset time to zero.
         */
        inline void Reset() { time = 0; };

        /**
         * Get the current time elapsed, in milliseconds.
         * @return Time elapsed
         */
        inline float GetTime() const { return time; };

        /**
         * Change the timer's value.
         *
         * \param newTime The timer's new value
         */
        inline void SetTime(float newTime) { time = newTime; };

        /**
         * Get the paused state of the timer.
         * @return true if paused
         */
        inline bool IsPaused() const { return isPaused; };

        /**
         * Set the paused state of the timer.
         * @param newState The new state ( true = paused )
         */
        inline void SetPaused(bool newState = true) { isPaused = newState; };

    protected:
    private:

        std::string name; ///< The name of the timer
        unsigned int time; ///< Time elapsed in milliseconds
        bool isPaused; ///< True if timer is paused
};

#endif // MANUALTIMER_H
