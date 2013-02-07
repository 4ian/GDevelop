// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RMUTEX_EXTENSIOn_
#define DLIB_RMUTEX_EXTENSIOn_

#include "threads_kernel.h"
#include "rmutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rmutex
    {
        /*!
            INITIAL VALUE
                count == 0
                thread_id == 0

            CONVENTION
                - count == lock_count()

                - if (no thread currently has a lock on this mutex) then
                    - count == 0
                - else
                    - count == the number of times the thread that owns this mutex has
                      called lock()
                    - thread_id == the id of this thread.
        !*/
    public:

        rmutex (
        ) : s(m),
            thread_id(0),
            count(0)
        {}

        ~rmutex (
        )
        {}

        unsigned long lock_count (
        ) const
        {
            return count;
        }

        void lock (
            unsigned long times = 1
        ) const
        {
            const thread_id_type current_thread_id = get_thread_id();
            m.lock();
            if (thread_id == current_thread_id)
            {
                // we already own this mutex in this case
                count += times;                
            }
            else
            {
                // wait for our turn to claim this rmutex
                while (count != 0)
                    s.wait();

                count = times;
                thread_id = current_thread_id;
            }
            m.unlock();
        }

        void unlock (
            unsigned long times = 1
        ) const
        {
            const thread_id_type current_thread_id = get_thread_id();
            m.lock();
            if (thread_id == current_thread_id)
            {
                if (count <= times)
                {
                    count = 0;
                    s.signal();
                }
                else
                {
                    count -= times;
                }
            }
            m.unlock();
        }

    private:
        mutex m;
        signaler s;
        mutable thread_id_type thread_id;
        mutable unsigned long count;

        // restricted functions
        rmutex(rmutex&);        // copy constructor
        rmutex& operator=(rmutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RMUTEX_EXTENSIOn_

