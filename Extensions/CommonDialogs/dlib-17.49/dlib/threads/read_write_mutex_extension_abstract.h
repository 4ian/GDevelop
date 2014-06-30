// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_READWRITE_MUTEX_EXTENSIOn_ABSTRACT_
#ifdef DLIB_READWRITE_MUTEX_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class read_write_mutex
    {
        /*!
            INITIAL VALUE
                read_write_mutex is in the fully unlocked state

            WHAT THIS OBJECT REPRESENTS
                This object represents a mutex intended to be used for synchronous 
                thread control of shared data. When a thread wants to access some 
                shared data it locks out other threads by calling lock() and calls 
                unlock() when it is finished.   

                This mutex also has the additional ability to distinguish between
                a lock for the purposes of modifying some shared data, a write lock,
                and a lock for the purposes of only reading shared data, a readonly
                lock.  The lock() and unlock() functions are used for write locks while
                the lock_readonly() and unlock_readonly() are for readonly locks.  

                The difference between a readonly and write lock can be understood as 
                follows.  The read_write_mutex will allow many threads to obtain simultaneous
                readonly locks but will only allow a single thread to obtain a write lock.
                Moreover, while the write lock is obtained no other threads are allowed
                to have readonly locks.  
        !*/
    public:

        read_write_mutex (
        );
        /*!
            ensures
                - #*this is properly initialized
                - max_readonly_locks() == 0xFFFFFFFF
                  (i.e. about 4 billion)
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the read_write_mutex.
        !*/

        explicit read_write_mutex (
            unsigned long max_locks
        );
        /*!
            requires
                - max_locks > 0
            ensures
                - #*this is properly initialized
                - max_readonly_locks() == max_locks
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the read_write_mutex.
        !*/

        ~read_write_mutex (
        );
        /*!
            requires
                - *this is not locked
            ensures
                - all resources allocated by *this have been freed
        !*/

        void lock (
        ) const;
        /*!
            requires
                - The thread calling this function does not have any kind of lock on this 
                  object
            ensures
                - if (there is any kind of lock on *this) then 
                    - the calling thread is put to sleep until a write lock becomes available. 
                      Once available, a write lock is obtained on this mutex and this function 
                      terminates.
                - else  
                    - a write lock is obtained on this mutex and the calling thread is not put to sleep 
        !*/

        void unlock (
        ) const;
        /*!
            ensures
                - if (there is a write lock on *this) then
                    - #*this is unlocked (i.e. other threads may now lock this object)
                - else
                    - the call to unlock() has no effect
        !*/

        unsigned long max_readonly_locks (
        ) const;
        /*!
            ensures
                - returns the maximum number of concurrent readonly locks this object will allow.
        !*/

        void lock_readonly (
        ) const;
        /*!
            requires
                - The thread calling this function does not already have a write
                  lock on this object
            ensures
                - if (there is a write lock on *this or there are no free readonly locks) then
                    - the calling thread is put to sleep until there is no longer a write lock
                      and a free readonly lock is available.  Once this is the case, a readonly 
                      lock is obtained and this function terminates.
                - else 
                    - a readonly lock is obtained on *this and the calling thread is not put
                      to sleep.  Note that multiple readonly locks can be obtained at once.
        !*/

        void unlock_readonly (
        ) const;
        /*!
            ensures
                - if (there is a readonly lock on *this) then
                    - one readonly lock is removed from *this.  
                - else
                    - the call to unlock_readonly() has no effect.
        !*/

    private:
        // restricted functions
        read_write_mutex(read_write_mutex&);        // copy constructor
        read_write_mutex& operator=(read_write_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_READWRITE_MUTEX_EXTENSIOn_ABSTRACT_


