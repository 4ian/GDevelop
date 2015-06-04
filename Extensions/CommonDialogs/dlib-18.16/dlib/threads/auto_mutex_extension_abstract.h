// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_
#ifdef DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"
#include "rmutex_extension_abstract.h"
#include "read_write_mutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class auto_mutex
    {
        /*!
            INITIAL VALUE
                The mutex given in the constructor is locked and associated with this 
                object.

            WHAT THIS OBJECT REPRESENTS
                This object represents a mechanism for automatically locking and unlocking
                a mutex object.
        !*/
    public:

        explicit auto_mutex (
            const mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - m will be locked
        !*/

        explicit auto_mutex (
            const rmutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - m will be locked
        !*/

        explicit auto_mutex (
            const read_write_mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - m will be locked via m.lock() (i.e. a write lock will be obtained)
        !*/

        void unlock(
        );
        /*!
            ensures
                - if (unlock() has not already been called) then
                    - The mutex associated with *this has been unlocked.  This is useful if
                      you want to unlock a mutex before the auto_mutex destructor executes.
        !*/

        ~auto_mutex (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
                - calls unlock()
        !*/

    private:
        // restricted functions
        auto_mutex(auto_mutex&);        // copy constructor
        auto_mutex& operator=(auto_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class auto_mutex_readonly
    {
        /*!
            INITIAL VALUE
                The mutex given in the constructor is locked using a read-only lock and
                associated with this object.

            WHAT THIS OBJECT REPRESENTS
                This object represents a mechanism for automatically locking and unlocking
                a read_write_mutex object.  In particular, a readonly lock is used.
        !*/
    public:

        explicit auto_mutex_readonly (
            const read_write_mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - a readonly lock will be obtained on m using m.lock_readonly()
                - #has_read_lock() == true
        !*/

        ~auto_mutex_readonly (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
                - the mutex associated with *this has been unlocked
        !*/

        bool has_read_lock (
        );
        /*!
            ensures
                - returns true if this object has called read_write_mutex::lock_readonly()
                  on its associated mutex and has yet to release that lock.
        !*/

        bool has_write_lock (
        ); 
        /*!
            ensures
                - returns true if this object has called read_write_mutex::lock() on its
                  associated mutex and has yet to release that lock.
        !*/

        void lock_readonly (
        );
        /*!
            ensures
                - This function converts the lock on the associated mutex into a readonly lock.
                  Specifically:
                  if (!has_read_lock()) then
                    - if (has_write_lock()) then
                        - unlocks the associated mutex and then relocks it by calling
                          read_write_mutex::lock_readonly()
                    - else
                        - locks the associated mutex by calling read_write_mutex::lock_readonly()
                - #has_read_lock() == true
                - Note that the lock switch is not atomic.  This means that whatever
                  resource is protected by the mutex might have been modified during the
                  call to lock_readonly().
        !*/

        void lock_write (
        );
        /*!
            ensures
                - This function converts the lock on the associated mutex into a write lock.
                  Specifically:
                  if (!has_write_lock()) then
                    - if (has_read_lock()) then
                        - unlocks the associated mutex and then relocks it by calling
                          read_write_mutex::lock()
                    - else
                        - locks the associated mutex by calling read_write_mutex::lock()
                - #has_write_lock() == true
                - Note that the lock switch is not atomic.  This means that whatever
                  resource is protected by the mutex might have been modified during the
                  call to lock_write().
        !*/

        void unlock (
        );
        /*!
            ensures
                - if (has_read_lock() || has_write_lock()) then
                    - unlocks the associated mutex.  This is useful if you want to unlock a
                      mutex before the auto_mutex_readonly destructor executes.
                - #has_read_lock() == false
                - #has_write_lock() == false
        !*/

    private:
        // restricted functions
        auto_mutex_readonly(auto_mutex_readonly&);        // copy constructor
        auto_mutex_readonly& operator=(auto_mutex_readonly&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_

