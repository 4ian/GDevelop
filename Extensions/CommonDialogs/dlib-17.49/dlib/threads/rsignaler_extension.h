// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RSIGNALER_EXTENSIOn_
#define DLIB_RSIGNALER_EXTENSIOn_ 

#include "rsignaler_extension_abstract.h"
#include "../threads.h"
#include "rmutex_extension.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rsignaler
    {
    public:
        rsignaler (
            const rmutex& associated_mutex
        ) : 
            assoc_mutex(associated_mutex),
            s(m)
        {}

        ~rsignaler (
        )
        {}

        void wait (
        ) const
        {
            m.lock();
            const unsigned long lock_count = assoc_mutex.lock_count();
            assoc_mutex.unlock(lock_count);
            s.wait();
            m.unlock();
            assoc_mutex.lock(lock_count);
        }

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const
        {
            m.lock();
            const unsigned long lock_count = assoc_mutex.lock_count();
            assoc_mutex.unlock(lock_count);
            bool res = s.wait_or_timeout(milliseconds);
            m.unlock();
            assoc_mutex.lock(lock_count);
            return res;
        }

        void signal (
        ) const 
        { 
            m.lock();
            s.signal(); 
            m.unlock();
        }

        void broadcast (
        ) const 
        { 
            m.lock();
            s.broadcast(); 
            m.unlock();
        }

        const rmutex& get_mutex (
        ) const { return assoc_mutex; }

    private:

        const rmutex& assoc_mutex;
        mutex m;
        signaler s;


        // restricted functions
        rsignaler(rsignaler&);        // copy constructor
        rsignaler& operator=(rsignaler&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RSIGNALER_EXTENSIOn_ 



