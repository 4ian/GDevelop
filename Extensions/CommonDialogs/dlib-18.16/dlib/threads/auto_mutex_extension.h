// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AUTO_MUTEX_EXTENSIOn_
#define DLIB_AUTO_MUTEX_EXTENSIOn_

#include "threads_kernel.h"
#include "rmutex_extension.h"
#include "read_write_mutex_extension.h"
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

        explicit auto_mutex (
            const mutex& m_
        ) : m(&m_),
            r(0),
            rw(0)
        {
            m->lock();
        }

        explicit auto_mutex (
            const rmutex& r_
        ) : m(0),
            r(&r_),
            rw(0)
        {
            r->lock();
        }

        explicit auto_mutex (
            const read_write_mutex& rw_
        ) : m(0),
            r(0),
            rw(&rw_)
        {
            rw->lock();
        }

        void unlock()
        {
            if (m != 0)
            {
                m->unlock();
                m = 0;
            }
            else if (r != 0)
            {
                r->unlock();
                r = 0;
            }
            else if (rw != 0)
            {
                rw->unlock();
                rw = 0;
            }
        }

        ~auto_mutex (
        )
        {
            unlock();
        }

    private:

        const mutex* m;
        const rmutex* r;
        const read_write_mutex* rw;

        // restricted functions
        auto_mutex(auto_mutex&);        // copy constructor
        auto_mutex& operator=(auto_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class auto_mutex_readonly
    {
    public:

        explicit auto_mutex_readonly (
            const read_write_mutex& rw_
        ) : rw(rw_), _has_write_lock(false), _has_read_lock(true)
        {
            rw.lock_readonly();
        }

        ~auto_mutex_readonly (
        )
        {
            unlock();
        }

        void lock_readonly (
        )
        {
            if (!_has_read_lock)
            {
                unlock();
                rw.lock_readonly();
                _has_read_lock = true;
            }
        }

        void lock_write (
        )
        {
            if (!_has_write_lock)
            {
                unlock();
                rw.lock();
                _has_write_lock = true;
            }
        }

        void unlock (
        )
        {
            if (_has_write_lock)
            {
                rw.unlock();
                _has_write_lock = false;
            }
            else if (_has_read_lock)
            {
                rw.unlock_readonly();
                _has_read_lock = false;
            }
        }

        bool has_read_lock (
        ) { return _has_read_lock; }

        bool has_write_lock (
        ) { return _has_write_lock; }

    private:

        const read_write_mutex& rw;
        bool _has_write_lock;
        bool _has_read_lock;

        // restricted functions
        auto_mutex_readonly(auto_mutex_readonly&);        // copy constructor
        auto_mutex_readonly& operator=(auto_mutex_readonly&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_MUTEX_EXTENSIOn_

