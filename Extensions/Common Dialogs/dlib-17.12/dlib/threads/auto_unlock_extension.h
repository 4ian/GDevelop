// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AUTO_UNLOCK_EXTENSIOn_
#define DLIB_AUTO_UNLOCK_EXTENSIOn_

#include "threads_kernel.h"
#include "rmutex_extension.h"
#include "auto_unlock_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class auto_unlock
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

        auto_unlock (
            const mutex& m_
        ) : m(&m_),
            r(0)
        {}

        auto_unlock (
            const rmutex& r_
        ) : m(0),
            r(&r_)
        {}

        ~auto_unlock (
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
        auto_unlock(auto_unlock&);        // copy constructor
        auto_unlock& operator=(auto_unlock&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_UNLOCK_EXTENSIOn_


