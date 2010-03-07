// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_
#ifdef DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"
#include "rmutex_extension_abstract.h"

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

        auto_mutex (
            const mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - m will be locked
        !*/

        auto_mutex (
            const rmutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - m will be locked
        !*/

        ~auto_mutex (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
                - the mutex associated with *this has been unlocked
        !*/

    private:
        // restricted functions
        auto_mutex(auto_mutex&);        // copy constructor
        auto_mutex& operator=(auto_mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AUTO_MUTEX_EXTENSIOn_ABSTRACT_

