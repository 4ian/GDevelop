// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MULTITHREADED_OBJECT_EXTENSIOn_ABSTRACT_
#ifdef DLIB_MULTITHREADED_OBJECT_EXTENSIOn_ABSTRACT_ 

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class multithreaded_object
    {
        /*!
            INITIAL VALUE
                - is_running() == false
                - number_of_threads_alive() == 0
                - number_of_threads_registered() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a multithreaded object.  It is similar to 
                the threaded_object except it allows you to have many threads in a 
                single object rather than just one.  To use it you inherit from it 
                and register the member functions in your new class that you want 
                to run in their own threads by calling register_thread().  Then when 
                you call start() it will spawn all the registered functions
                in their own threads.
        !*/

    public:

        multithreaded_object (
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

        virtual ~multithreaded_object (
        ) = 0;
        /*!
            requires
                - number_of_threads_alive() == 0
                  (i.e. in the destructor for the object you derive from this one you
                  must wait for all the threads to end.)
            ensures
                - all resources allocated by *this have been freed.  
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
                - blocks until all threads have terminated
            throws
                - std::bad_alloc or dlib::thread_error
                    if an exception is thrown then *this is unusable 
                    until clear() is called and succeeds
        !*/

        bool is_running (
        ) const;
        /*!
            ensures
                - if (number_of_threads_alive() > 0 && the threads are currently supposed to be executing) then
                    - returns true
                - else
                    - returns false
        !*/

        unsigned long number_of_threads_alive (
        ) const;
        /*!
            ensures
                - returns the number of threads that are currently alive (i.e.
                  the number of threads that have started but not yet terminated)
        !*/

        unsigned long number_of_threads_registered (
        ) const;
        /*!
            ensures
                - returns the number of threads that have been registered by
                  calls to register_thread()
        !*/

        void wait (
        ) const;
        /*!
            requires
                - is not called from one of this object's threads 
            ensures
                - if (number_of_threads_alive() > 0) then
                    - blocks until all the threads in this object have terminated 
                      (i.e. blocks until number_of_threads_alive() == 0)
        !*/

        void start (
        );
        /*!
            ensures
                - #number_of_threads_alive() == number_of_threads_registered()
                - #is_running() == true
                - #should_stop() == false
                - all the threads registered are up and running. 
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then 
                    #is_running() == false and should_stop() == true
        !*/

        void pause (
        );
        /*!
            ensures
                - #is_running() == false
        !*/

        void stop (
        );
        /*!
            ensures
                - #should_stop() == true
                - #is_running() == false
        !*/

    protected:

        template <
            typename T
            >
        void register_thread (
            T& object,
            void (T::*thread)()
        );
        /*!
            requires
                - (object.*thread)() forms a valid function call
                - the thread function does not throw
            ensures
                - registers the member function pointed to by thread as one of the threads
                  that runs when is_running() == true
                - #number_of_threads_registered() == number_of_threads_registered() + 1
                - if (is_running() == true)
                    - spawns this new member function in its own thread
                    - #number_of_threads_alive() += number_of_threads_alive() + 1
            throws
                - std::bad_alloc or dlib::thread_error
                    If either of these exceptions are thrown then 
                    #is_running() == false and should_stop() == true
        !*/

        bool should_stop (
        ) const;
        /*!
            requires
                - is only called from one of the registered threads in this object 
            ensures
                - if (is_running() == false && should_stop() == false) then
                    - blocks until (#is_running() == true || #should_stop() == true) 
                - if (this thread is supposed to terminate) then
                    - returns true
                - else
                    - returns false
        !*/

    private:

        // restricted functions
        multithreaded_object(multithreaded_object&);        // copy constructor
        multithreaded_object& operator=(multithreaded_object&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MULTITHREADED_OBJECT_EXTENSIOn_ABSTRACT_

