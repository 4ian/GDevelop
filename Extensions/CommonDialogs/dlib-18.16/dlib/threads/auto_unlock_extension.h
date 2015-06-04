// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AUTO_UNLOCK_EXTENSIOn_
#define DLIB_AUTO_UNLOCK_EXTENSIOn_

#include "threads_kernel.h"
#include "rmutex_extension.h"
#include "read_write_mutex_extension.h"
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
                - if (rw != 0) then
                    - the mutex pointed to by rw is locked
                - exactly one of r, m, or rw is not 0.

            CONVENTION
                - if (m != 0) then
                    - the mutex pointed to by m is locked
                - if (r != 0) then
                    - the mutex pointed to by r is locked
                - if (rw != 0) then
                    - the mutex pointed to by rw is locked
                - exactly one of r, m, or rw is not 0.
        !*/
    public:

        explicit auto_unlock (
            const mutex& m_
        ) : m(&m_),
            r(0),
            rw(0)
        {}

        explicit auto_unlock (
            const rmutex& r_
        ) : m(0),
            r(&r_),
            rw(0)
        {}

        explicit auto_unlock (
            const read_write_mutex& rw_
        ) : m(0),
            r(0),
            rw(&rw_)
        {}

        ~auto_unlock (
        )
        {
            if (m != 0)
                m->unlock();
            else if (r != 0)
                r->unlock();
            else
                rw->unlock();
        }

    private:

        const mutex* m;
        const rmutex* r;
        const read_write_mutex* rw;

        // restricted functions
        auto_unlock(auto_unlock&);        // copy constructor
        auto_unlock& operator=(auto_unlock&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class auto_unlock_readonly
    {

    public:

        explicit auto_unlock_readonly (
            const read_write_mutex& rw_
        ) :
            rw(rw_)
        {}

        ~auto_unlock_readonly (
        )
        {
            rw.unlock_readonly();
        }

    private:

        const read_write_mutex& rw;

        // restricted functions
        auto_unlock_readonly(auto_unlock_readonly&);        // copy constructor
        auto_unlock_readonly& operator=(auto_unlock_readonly&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_UNLOCK_EXTENSIOn_


