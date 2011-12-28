#ifndef MANUALTIMER_H
#define MANUALTIMER_H
#include <string>

using namespace std;
/**
 * \brief Manual timer updated using UpdateTime member function.
 *
 *  A manual timer is a timer which is updated manually by calling UpdateTime.
 */
class GD_API ManualTimer
{
    public:

        ManualTimer();
        ManualTimer(std::string name_);
        virtual ~ManualTimer();
        /**
         * Get the name of the timer
         * @return Timer's name
         */
        inline std::string GetName() { return name; };

        /**
         * Update the time of the timer
         * @param Time to add in milliseconds
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
         * Change the time
         */
        inline void SetTime(float newTime) { time = newTime; };

        /**
         * Get the paused state of the timer.
         * @return true if paused
         */
        inline bool IsPaused() const { return isPaused; };

        /**
         * Set the paused state of the timer.
         * @param The new state ( true = paused )
         */
        inline void SetPaused(bool newState = true) { isPaused = newState; };

    protected:
    private:

        std::string name;
        unsigned int time;
        bool isPaused;
};

#endif // MANUALTIMER_H
