// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_
#ifdef DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"
#include "rmutex_extension_abstract.h"
#include "read_write_mutex_extension_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class auto_unlock
    {
        /*!
            INITIAL VALUE
                The mutex given in the constructor is associated with this object.

            WHAT THIS OBJECT REPRESENTS
                This object represents a mechanism for automatically unlocking
                a mutex object.  It is useful when you already have a locked mutex
                and want to make sure it gets unlocked even if an exception is thrown 
                or you quit the function at a weird spot.
        !*/
    public:

        explicit auto_unlock (
            const mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - does not modify m in any way 
        !*/

        explicit auto_unlock (
            const rmutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - does not modify m in any way 
        !*/

        explicit auto_unlock (
            const read_write_mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - does not modify m in any way 
        !*/

        ~auto_unlock (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
                - calls unlock() on the mutex associated with *this
        !*/

    private:
        // restricted functions
        auto_unlock(auto_unlock&);        // copy constructor
        auto_unlock& operator=(auto_unlock&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class auto_unlock_readonly
    {
        /*!
            INITIAL VALUE
                The mutex given in the constructor is associated with this object.

            WHAT THIS OBJECT REPRESENTS
                This object represents a mechanism for automatically unlocking
                a read_write_mutex object.  It is useful when you already have a locked mutex
                and want to make sure it gets unlocked even if an exception is thrown 
                or you quit the function at a weird spot.  Note that the mutex
                is unlocked by calling unlock_readonly() on it.
        !*/
    public:

        explicit auto_unlock_readonly (
            const read_write_mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - does not modify m in any way 
        !*/

        ~auto_unlock_readonly (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
                - calls unlock_readonly() on the mutex associated with *this
        !*/

    private:
        // restricted functions
        auto_unlock_readonly(auto_unlock_readonly&);        // copy constructor
        auto_unlock_readonly& operator=(auto_unlock_readonly&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_


