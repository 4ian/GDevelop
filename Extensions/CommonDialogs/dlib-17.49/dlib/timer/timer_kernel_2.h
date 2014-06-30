// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIMER_KERNEl_2_
#define DLIB_TIMER_KERNEl_2_

#include "../threads.h"
#include "../algs.h"
#include "../misc_api.h"
#include "timer_kernel_abstract.h"
#include "../uintn.h"
#include "../binary_search_tree.h"
#include "../smart_pointers_thread_safe.h"

namespace dlib
{

    struct timer_kernel_2_base : public threaded_object
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object contains the base members of the timer_kernel_2 object.
                It exists so that we can access them from outside any templated functions.
        !*/

        unsigned long delay;
        // these are only modified by the global_clock
        uint64 next_time_to_run;
        timestamper ts;
        bool running;
        bool in_global_clock;
    };

// ----------------------------------------------------------------------------------------

    class timer_kernel_2_global_clock : private threaded_object
    {
        /*!
            This object sets up a timer that triggers the action function
            for timer_kernel_2 objects that are tracked inside this object. 
            INITIAL VALUE
                - shutdown == false
                - running == false

            CONVENTION
                - if (shutdown) then
                    - thread() should terminate
                - else (running) then
                    - thread() is running

                - tm[time] == pointer to a timer_kernel_2_base object 
        !*/
        typedef binary_search_tree<uint64,timer_kernel_2_base*,memory_manager<char>::kernel_2b>::kernel_2a_c time_map;
    public:

        ~timer_kernel_2_global_clock();

        void add (
            timer_kernel_2_base* r
        );
        /*!
            requires
                - m is locked
            ensures
                - starts the thread if it isn't already started
                - adds r to tm
                - #r->in_global_clock == true
                - updates r->next_time_to_run appropriately according to
                    r->delay
        !*/

        void remove (
            timer_kernel_2_base* r
        );
        /*!
            requires
                - m is locked
            ensures
                - if (r is in tm) then
                    - removes r from tm
                - #r->in_global_clock == false
        !*/

        void adjust_delay (
            timer_kernel_2_base* r,
            unsigned long new_delay
        );
        /*!
            requires
                - m is locked
            ensures
                - #r->delay == new_delay
                - if (r->in_global_clock) then
                    - the time to the next event will have been appropriately adjusted
        !*/

        mutex m;

        friend shared_ptr_thread_safe<timer_kernel_2_global_clock> get_global_clock();

    private:
        timer_kernel_2_global_clock();

        time_map tm;  
        signaler s;
        bool shutdown;
        bool running;
        timestamper ts;

        void thread();
        /*!
            ensures
                - spawns timer tasks as is appropriate
        !*/
    };
    shared_ptr_thread_safe<timer_kernel_2_global_clock> get_global_clock();
    /*!
        ensures
            - returns the global instance of the timer_kernel_2_global_clock object
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class timer_kernel_2 : private timer_kernel_2_base 
    {
        /*!
            INITIAL VALUE
                - running   == false
                - delay     == 1000
                - ao        == a pointer to the action_object()
                - af        == a pointer to the action_function()
                - in_global_clock == false
                - next_time_to_run == 0
                - gc == get_global_clock()

            CONVENTION
                - the mutex used to lock everything is gc->m
                - running == is_running()
                - delay == delay_time()
                - *ao == action_object()
                - af == action_function()    
                - if (!running) then
                    - in_global_clock == false
                - else 
                    - next_time_to_run == the next time this timer should run according
                      to the timestamper in the global_clock
        !*/

    public:

        typedef void (T::*af_type)();

        timer_kernel_2(  
            T& ao_,
            af_type af_
        );

        virtual ~timer_kernel_2(
        );

        void clear(
        );

        af_type action_function (
        ) const;

        const T& action_object (
        ) const;

        T& action_object (
        );

        bool is_running (
        ) const;

        unsigned long delay_time (
        ) const;

        void set_delay_time (
            unsigned long milliseconds
        );
        
        void start (            
        );

        void stop (
        );

        void stop_and_wait (
        );

    private: 

        void thread (
        );
        /*!
            ensures
                - calls the action function
        !*/

        // data members
        T& ao;
        const af_type af;
        shared_ptr_thread_safe<timer_kernel_2_global_clock> gc;

        // restricted functions
        timer_kernel_2(const timer_kernel_2&);        // copy constructor
        timer_kernel_2& operator=(const timer_kernel_2&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    template <
        typename T
        >
    timer_kernel_2<T>::
    timer_kernel_2(  
        T& ao_,
        af_type af_
    ) : 
        ao(ao_),
        af(af_),
        gc(get_global_clock())
    {
        delay = 1000;
        next_time_to_run = 0;
        running = false;
        in_global_clock = false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    timer_kernel_2<T>::
    ~timer_kernel_2(
    )
    {
        clear();
        wait();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    clear(
    )
    {
        auto_mutex M(gc->m);
        running = false;
        gc->remove(this);
        delay = 1000;        
        next_time_to_run = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename timer_kernel_2<T>::af_type timer_kernel_2<T>::
    action_function (
    ) const
    {
        return af;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const T& timer_kernel_2<T>::
    action_object (
    ) const
    {
        return ao;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T& timer_kernel_2<T>::
    action_object (
    )
    {
        return ao;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool timer_kernel_2<T>::
    is_running (
    ) const
    {
        auto_mutex M(gc->m);
        return running;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    unsigned long timer_kernel_2<T>::
    delay_time (
    ) const
    {
        auto_mutex M(gc->m);
        return delay;        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    set_delay_time (
        unsigned long milliseconds
    )
    {
        auto_mutex M(gc->m);
        gc->adjust_delay(this,milliseconds);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    start (            
    )
    {
        auto_mutex M(gc->m);
        if (!running)
        {
            gc->add(this);
            running = true;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    stop (
    )
    {
        gc->m.lock();
        running = false;
        gc->remove(this);
        gc->m.unlock();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    thread (
    )
    {
        // call the action function
        (ao.*af)(); 
        auto_mutex M(gc->m);
        if (running)
        {
            gc->remove(this);
            gc->add(this);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void timer_kernel_2<T>::
    stop_and_wait (
    )
    {
        gc->m.lock();
        running = false;
        gc->remove(this);
        gc->m.unlock();
        wait();
    }

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "timer_kernel_2.cpp"
#endif

#endif // DLIB_TIMER_KERNEl_2_


