// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREADED_OBJECT_EXTENSIOn_ABSTRACT_
#ifdef DLIB_THREADED_OBJECT_EXTENSIOn_ABSTRACT_ 

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class threaded_object
    {
        /*!
            INITIAL VALUE
                - is_running() == false
                - is_alive() == false 
                - should_respawn() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a simple threaded object.  To use it you inherit
                from it and define the thread() function.  Then when you call start()
                it will spawn a thread that calls this->thread().  
        !*/
    public:

        threaded_object (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        virtual ~threaded_object (
        );
        /*!
            requires
                - is_alive() == false
                  (i.e. in the destructor for the object you derive from this one you
                  must wait for this->thread() to end.)
            ensures
                - all resources allocated by *this have been freed.  
        !*/

        bool is_running (
        ) const;
        /*!
            requires
                - is not called from this->thread()
            ensures
                - if (is_alive() && this->thread() is currently supposed to be executing) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_alive (
        ) const;
        /*!
            requires
                - is not called from this->thread()
            ensures
                - if (this->thread() has been called by some thread and has yet to terminate) then
                    - returns true
                - else
                    - returns false
        !*/

        void wait (
        ) const;
        /*!
            requires
                - is not called from this->thread()
            ensures
                - if (is_alive() == true) then
                    - blocks until this->thread() terminates
        !*/

        void start (
        );
        /*!
            requires
                - is not called from this->thread()
            ensures
                - #is_alive() == true
                - #is_running() == true
                - #should_stop() == false
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then 
                    #is_alive() == false and #is_running() == false
        !*/

        void set_respawn (
        );
        /*!
            requires
                - is not called from this->thread()
            ensures
                - #should_respawn() == true
        !*/

        bool should_respawn (
        ) const;
        /*!
            requires
                - is not called from this->thread()
            ensures
                - returns true if the thread will automatically restart upon termination and
                  false otherwise.  Note that every time a thread starts it sets should_respawn() 
                  back to false.  Therefore, a single call to set_respawn() can cause at most
                  one respawn to occur. 
        !*/

        void restart (
        );
        /*!
            requires
                - is not called from this->thread()
            ensures
                - This function atomically executes set_respawn() and start().  The precise meaning of this
                  is defined below.
                - if (is_alive()) then
                    - #should_respawn() == true
                - else
                    - #should_respawn() == false 
                - #is_alive() == true
                - #is_running() == true
                - #should_stop() == false
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then 
                    #is_alive() == false and #is_running() == false
        !*/

        void pause (
        );
        /*!
            requires
                - is not called from this->thread()
            ensures
                - #is_running() == false
        !*/

        void stop (
        );
        /*!
            requires
                - is not called from this->thread()
            ensures
                - #should_stop() == true
                - #is_running() == false
                - #should_respawn() == false
        !*/

    protected:

        bool should_stop (
        ) const;
        /*!
            requires
                - is only called from the thread that executes this->thread()
            ensures
                - calls to this function block until (#is_running() == true || #should_stop() == true) 
                - if (this thread is supposed to terminate) then
                    - returns true
                - else
                    - returns false
        !*/

    private:

        virtual void thread (
        ) = 0;
        /*!
            requires
                - is executed in its own thread
                - is only executed in one thread at a time
            throws
                - does not throw any exceptions
        !*/

        // restricted functions
        threaded_object(threaded_object&);        // copy constructor
        threaded_object& operator=(threaded_object&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREADED_OBJECT_EXTENSIOn_ABSTRACT_

