// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMER_KERNEl_2_CPP
#define DLIB_TIMER_KERNEl_2_CPP

#include "timer_kernel_2.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    timer_kernel_2_global_clock::
    timer_kernel_2_global_clock(
    ): 
        s(m),
        shutdown(false),
        running(false)
    {
    }

// ----------------------------------------------------------------------------------------

    timer_kernel_2_global_clock::
    ~timer_kernel_2_global_clock()
    {
        m.lock();
        shutdown = true;
        s.signal();
        m.unlock();
        wait();
    }

// ----------------------------------------------------------------------------------------

    void timer_kernel_2_global_clock::
    add (
        timer_kernel_2_base* r
    )
    {
        if (r->in_global_clock == false)
        {
            // if the thread isn't running then start it up
            if (!running)
            {
                start();
                running = true;
            }

            uint64 t = ts.get_timestamp() + r->delay*1000;
            tm.reset();
            if (!tm.move_next() || t < tm.element().key())
            {
                // we need to make the thread adjust its next time to
                // trigger if this new event occurrs sooner than the
                // next event in tm
                s.signal();
            }
            timer_kernel_2_base* rtemp = r;
            uint64 ttemp = t;
            tm.add(ttemp,rtemp);
            r->next_time_to_run = t;
            r->in_global_clock = true;
        }
    }

// ----------------------------------------------------------------------------------------

    void timer_kernel_2_global_clock::
    remove (
        timer_kernel_2_base* r
    )
    {
        if (r->in_global_clock)
        {
            tm.position_enumerator(r->next_time_to_run-1);
            do
            {
                if (tm.element().value() == r)
                {
                    uint64 t;
                    timer_kernel_2_base* rtemp;
                    tm.remove_current_element(t,rtemp);
                    r->in_global_clock = false;
                    break;
                }
            } while (tm.move_next());
        }
    }

// ----------------------------------------------------------------------------------------

    void timer_kernel_2_global_clock::
    adjust_delay (
        timer_kernel_2_base* r,
        unsigned long new_delay
    )
    {
        if (r->in_global_clock)
        {
            remove(r);
            // compute the new next_time_to_run and store it in t
            uint64 t = r->next_time_to_run;
            t -= r->delay*1000;
            t += new_delay*1000;

            tm.reset();
            if (!tm.move_next() || t < tm.element().key())
            {
                // we need to make the thread adjust its next time to
                // trigger if this new event occurrs sooner than the
                // next event in tm
                s.signal();
            }

            // set this incase add throws
            r->running = false;
            r->delay = new_delay;

            timer_kernel_2_base* rtemp = r;
            uint64 ttemp = t;
            tm.add(ttemp,rtemp);
            r->next_time_to_run = t;
            r->in_global_clock = true;

            // put this back now that we know add didn't throw
            r->running = true;

        }
        else
        {
            r->delay = new_delay;
        }
    }

// ----------------------------------------------------------------------------------------

    void timer_kernel_2_global_clock::
    thread()
    {
        auto_mutex M(m);
        while (!shutdown)
        {
            unsigned long delay = 100000;

            tm.reset();
            tm.move_next();
            // loop and start all the action functions for timers that should have
            // triggered.
            while(tm.current_element_valid())
            {
                const uint64 cur_time = ts.get_timestamp();
                uint64 t = tm.element().key();
                // if the next event in tm is ready to trigger
                if (t <= cur_time + 999)
                {
                    // remove this event from the tm map
                    timer_kernel_2_base* r = tm.element().value();
                    timer_kernel_2_base* rtemp;
                    tm.remove_current_element(t,rtemp);
                    r->in_global_clock = false;

                    // if this timer is still "running" then start its action function
                    if (r->running)
                    {
                        r->restart();
                    }
                }
                else
                {
                    // there aren't any more timers that should trigger so we compute
                    // the delay to the next timer event.
                    delay = static_cast<unsigned long>((t - cur_time)/1000);
                    break;
                }
            }

            s.wait_or_timeout(delay);
        }
    }

// ----------------------------------------------------------------------------------------

    shared_ptr_thread_safe<timer_kernel_2_global_clock> get_global_clock()
    {
        static shared_ptr_thread_safe<timer_kernel_2_global_clock> d(new timer_kernel_2_global_clock);
        return d;
    }

// ----------------------------------------------------------------------------------------

    // do this just to make sure get_global_clock() gets called at program startup
    class timer_kernel_2_global_clock_helper
    {
    public:
        timer_kernel_2_global_clock_helper()
        {
            get_global_clock();
        }
    };
    static timer_kernel_2_global_clock_helper call_get_global_clock;

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TIMER_KERNEl_2_CPP

