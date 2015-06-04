// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TIMER_KERNEl_ABSTRACT_
#ifdef DLIB_TIMER_KERNEl_ABSTRACT_

#include "../threads.h"

namespace dlib
{

    template <
        typename T
        >
    class timer 
    {
        /*!
            INITIAL VALUE
                is_running()      == false
                delay_time()      == 1000
                action_object()   == The object that is passed into the constructor
                action_function() == The member function pointer that is passed to 
                                     the constructor.

            WHAT THIS OBJECT REPRESENTS
                This object represents a timer that will call a given member function 
                (the action function) repeatedly at regular intervals and in its own
                thread.

                Note that the delay_time() is measured in milliseconds but you are not 
                guaranteed to have that level of resolution.  The actual resolution
                is implementation dependent.

            THREAD SAFETY
                All methods of this class are thread safe. 
        !*/

    public:

        typedef void (T::*af_type)();

        timer (  
            T& ao,
            af_type af
        );
        /*!
            requires
                - af does not throw
            ensures                
                - does not block.
                - #*this is properly initialized
                - #action_object() == ao
                - #action_function() == af
                  (af is a member function pointer to a member in the class T)
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~timer (
        );
        /*!
            requires
                - is not called from inside the action_function()
            ensures
                - any resources associated with *this have been released
                - will not call the action_function() anymore.
                - if (the action function is currently executing) then
                    - blocks until it finishes
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
                - does not block
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then #*this is unusable 
                    until clear() is called and succeeds.
        !*/

        af_type action_function (
        ) const;
        /*!
            ensures
                - does not block.
                - returns a pointer to the member function of action_object() that is
                  called by *this.
        !*/

        const T& action_object (
        ) const;
        /*!
            ensures
                - does not block.
                - returns a const reference to the object used to call the member
                  function pointer action_function()
        !*/

        T& action_object (
        );
        /*!
            ensures
                - does not block.
                - returns a non-const reference to the object used to call the member
                  function pointer action_function()
        !*/

        bool is_running (
        ) const;
        /*!
            ensures
                - does not block.
                - if (*this is currently scheduled to call the action_function()) then
                    - returns true
                - else
                    - returns false
        !*/

        unsigned long delay_time (
        ) const;
        /*!
            ensures
                - does not block.
                - returns the amount of time, in milliseconds, that *this will wait between
                  the return of one call to the action_function() and the beginning of the
                  next call to the action_function().
        !*/

        void set_delay_time (
            unsigned long milliseconds
        );
        /*!            
            ensures
                - does not block.
                - #delay_time() == milliseconds
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then #is_running() == false
                    but otherwise this function succeeds
        !*/
        
        void start (            
        );
        /*!
            ensures
                - does not block.
                - if (is_running() == false) then
                    - #is_running() == true
                    - The action_function() will run in another thread.
                    - The first call to the action_function() will occur in roughly 
                      delay_time() milliseconds.
                - else
                    - this call to start() has no effect
            throws
                - dlib::thread_error or std::bad_alloc
                    If this exception is thrown then #is_running() == false but 
                    otherwise this call to start() has no effect.
        !*/

        void stop (
        );
        /*!
            ensures
                - #is_running() == false
                - does not block.
        !*/

        void stop_and_wait (
        );
        /*!
            ensures 
                - #is_running() == false
                - if (the action function is currently executing) then
                    - blocks until it finishes
        !*/

    private:

        // restricted functions
        timer(const timer<T>&);        // copy constructor
        timer<T>& operator=(const timer<T>&);    // assignment operator

    };    

}

#endif // DLIB_TIMER_KERNEl_ABSTRACT_

