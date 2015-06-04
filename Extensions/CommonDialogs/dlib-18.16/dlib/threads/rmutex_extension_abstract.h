// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RMUTEX_EXTENSIOn_ABSTRACT_
#ifdef DLIB_RMUTEX_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rmutex
    {
        /*!
            INITIAL VALUE
                rmutex is in the unlocked state

            WHAT THIS OBJECT REPRESENTS
                This object represents a recursive mutex intended to be used for synchronous 
                thread control of shared data. When a thread wants to access some 
                shared data it locks out other threads by calling lock() and calls 
                unlock() when it is finished.  

                The difference between this and the normal mutex object is that it is safe to
                call lock() from a thread that already has a lock on this mutex.  Doing
                so just increments a counter but otherwise has no effect on the mutex.
                Note that unlock() must be called for each call to lock() to release the
                mutex.
        !*/
    public:

        rmutex (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the rmutex.
        !*/

        ~rmutex (
        );
        /*!
            requires
                - *this is not locked
            ensures
                - all resources allocated by *this have been freed
        !*/

        unsigned long lock_count (
        ) const;
        /*!
            requires
                - the calling thread has a lock on this mutex
            ensures
                - returns the number of times the thread has called lock()
        !*/

        void lock (
            unsigned long times = 1
        ) const;
        /*!
            ensures
                - if (*this is currently locked by another thread) then 
                    - the thread that called lock() on *this is put to sleep until 
                      it becomes available.               
                    - #lock_count() == times
                - if (*this is currently unlocked) then 
                    - #*this becomes locked and the current thread is NOT put to sleep 
                      but now "owns" #*this
                    - #lock_count() == times
                - if (*this is locked and owned by the current thread) then
                    - the calling thread retains its lock on *this and isn't put to sleep.  
                    - #lock_count() == lock_count() + times
        !*/

        void unlock (
            unsigned long times = 1
        ) const;
        /*!
            ensures
                - if (*this is currently locked and owned by the thread calling unlock) then
                    - if (lock_count() <= times ) then
                        - #*this is unlocked (i.e. other threads may now lock this object)
                    - else
                        - #*this will remain locked
                        - #lock_count() == lock_count() - times
                - else
                    - the call to unlock() has no effect
        !*/


    private:
        // restricted functions
        rmutex(rmutex&);        // copy constructor
        rmutex& operator=(rmutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RMUTEX_EXTENSIOn_ABSTRACT_

