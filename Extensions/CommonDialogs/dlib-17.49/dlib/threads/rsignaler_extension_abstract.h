// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RSIGNALER_EXTENSIOn_ABSTRACT_
#ifdef DLIB_RSIGNALER_EXTENSIOn_ABSTRACT_ 

#include "threads_kernel_abstract.h"
#include "rmutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rsignaler
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents an event signaling system for threads.  It gives 
                a thread the ability to wake up other threads that are waiting for a 
                particular signal. 

                Each rsignaler object is associated with one and only one rmutex object.  
                More than one rsignaler object may be associated with a single rmutex
                but a signaler object may only be associated with a single rmutex.

                NOTE:
                You must guard against spurious wakeups.  This means that a thread
                might return from a call to wait even if no other thread called
                signal.  This is rare but must be guarded against. 

                Also note that this object is identical to the signaler object 
                except that it works with rmutex objects rather than mutex objects.
        !*/

    public:

        rsignaler (
            const rmutex& associated_mutex
        );
        /*!
            ensures
                - #*this is properly initialized 
                - #get_mutex() == associated_mutex
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the signaler.    
        !*/


        ~rsignaler (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
        !*/

        void wait (
        ) const;
        /*!
            requires
                - get_mutex() is locked and owned by the calling thread
            ensures
                - atomically unlocks get_mutex() and blocks the calling thread                      
                - calling thread may wake if another thread calls signal() or broadcast()
                  on *this
                - when wait() returns the calling thread again has a lock on get_mutex()
        !*/

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const;
        /*!
            requires
                - get_mutex() is locked and owned by the calling thread
            ensures
                - atomically unlocks get_mutex() and blocks the calling thread
                - calling thread may wake if another thread calls signal() or broadcast()
                  on *this
                - after the specified number of milliseconds has elapsed the calling thread
                  will wake once get_mutex() is free
                - when wait returns the calling thread again has a lock on get_mutex()

                - returns false if the call to wait_or_timeout timed out 
                - returns true if the call did not time out
        !*/

        void signal (
        ) const;
        /*!
            ensures
                - if (at least one thread is waiting on *this) then
                    - at least one of the waiting threads will wake 
        !*/

        void broadcast (
        ) const;
        /*!
            ensures
                - any and all threads waiting on *this will wake 
        !*/

        const rmutex& get_mutex (
        ) const;
        /*!
            ensures
                - returns a const reference to the rmutex associated with *this
        !*/


    private:
        // restricted functions
        rsignaler(rsignaler&);        // copy constructor
        rsignaler& operator=(rsignaler&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RSIGNALER_EXTENSIOn_ABSTRACT_ 


