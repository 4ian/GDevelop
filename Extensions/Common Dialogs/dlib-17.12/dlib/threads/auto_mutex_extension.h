// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AUTO_MUTEX_EXTENSIOn_
#define DLIB_AUTO_MUTEX_EXTENSIOn_

#include "threads_kernel.h"
#include "rmutex_extension.h"
#include "auto_mutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class auto_mutex
    {
        /*!
            INITIAL VALUE
                - if (m != 0) then
                    - the mutex pointed to by m is locked
                - if (r != 0) then
                    - the mutex pointed to by r is locked
                - exactly one of r or m is not 0.

            CONVENTION
                - if (m != 0) then
                    - the mutex pointed to by m is locked
                - if (r != 0) then
                    - the mutex pointed to by r is locked
                - exactly one of r or m is not 0.
        !*/
    public:

        auto_mutex (
            const mutex& m_
        ) : m(&m_),
            r(0)
        {
            m->lock();
        }

        auto_mutex (
            const rmutex& r_
        ) : m(0),
            r(&r_)
        {
            r->lock();
        }

        ~auto_mutex (
        )
        {
            if (m != 0)
                m->unlock();
            else
                r->unlock();
        }

    private:

        const mutex* m;
        const rmutex* r;

        // restricted functions
        auto_mutex(auto_mutex&);        // copy constructor
        auto_mutex& operator=(auto_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_MUTEX_EXTENSIOn_

