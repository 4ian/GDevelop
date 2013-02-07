// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_READ_WRITE_MUTEX_EXTENSIOn_
#define DLIB_READ_WRITE_MUTEX_EXTENSIOn_

#include "threads_kernel.h"
#include "read_write_mutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class read_write_mutex
    {
        /*!
            INITIAL VALUE
                - max_locks == defined by constructor 
                - available_locks == max_locks
                - write_lock_in_progress == false
                - write_lock_active == false

            CONVENTION
                - Each time someone gets a read only lock they take one of the "available locks"
                  and each write lock takes all possible locks (i.e. max_locks).  The number of
                  available locks is recorded in available_locks.  Any time you try to lock this 
                  object and there aren't available locks you have to wait.

                - max_locks == max_readonly_locks()

                - if (some thread is on the process of obtaining a write lock) then
                    - write_lock_in_progress == true
                - else
                    - write_lock_in_progress == false

                - if (some thread currently has a write lock on this mutex) then
                    - write_lock_active == true
                - else
                    - write_lock_active == false
        !*/

    public:

        read_write_mutex (
        ) : s(m),
            max_locks(0xFFFFFFFF),
            available_locks(max_locks),
            write_lock_in_progress(false),
            write_lock_active(false)
        {}

        explicit read_write_mutex (
            unsigned long max_locks_
        ) : s(m),
            max_locks(max_locks_),
            available_locks(max_locks_),
            write_lock_in_progress(false),
            write_lock_active(false)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(max_locks > 0,
                "\t read_write_mutex::read_write_mutex(max_locks)"
                << "\n\t You must give a non-zero value for max_locks"
                << "\n\t this: " << this
                );
        }

        ~read_write_mutex (
        )
        {}

        void lock (
        ) const
        {
            m.lock();

            // If another write lock is already in progress then wait for it to finish
            // before we start trying to grab all the available locks.  This way we 
            // don't end up fighting over the locks.
            while (write_lock_in_progress)
                s.wait();

            // grab the right to perform a write lock
            write_lock_in_progress = true;

            // now start grabbing all the locks
            unsigned long locks_obtained = available_locks;
            available_locks = 0;
            while (locks_obtained != max_locks)
            {
                s.wait();
                locks_obtained += available_locks;
                available_locks = 0;
            }

            write_lock_in_progress = false;
            write_lock_active = true;

            m.unlock();
        }

        void unlock (
        ) const
        {
            m.lock();

            // only do something if there really was a lock in place
            if (write_lock_active)
            {
                available_locks = max_locks;
                write_lock_active = false;
                s.broadcast();
            }

            m.unlock();
        }

        void lock_readonly (
        ) const
        {
            m.lock();

            while (available_locks == 0)
                s.wait();

            --available_locks;

            m.unlock();
        }

        void unlock_readonly (
        ) const
        {
            m.lock();

            // If this condition is false then it means there are no more readonly locks
            // to free.  So we don't do anything.
            if (available_locks != max_locks && !write_lock_active)
            {
                ++available_locks;

                // only perform broadcast when there is another thread that might be listening
                if (available_locks == 1 || write_lock_in_progress)
                {
                    s.broadcast();
                }
            }

            m.unlock();
        }

        unsigned long max_readonly_locks (
        ) const
        {
            return max_locks;
        }

    private:
        mutex m;
        signaler s;
        const unsigned long max_locks;
        mutable unsigned long available_locks;
        mutable bool write_lock_in_progress; 
        mutable bool write_lock_active;

        // restricted functions
        read_write_mutex(read_write_mutex&);        // copy constructor
        read_write_mutex& operator=(read_write_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_READ_WRITE_MUTEX_EXTENSIOn_


