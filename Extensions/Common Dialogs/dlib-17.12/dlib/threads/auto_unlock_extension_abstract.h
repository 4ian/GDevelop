// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_
#ifdef DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_

#include "threads_kernel_abstract.h"
#include "rmutex_extension_abstract.h"

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

        auto_unlock (
            const mutex& m
        );
        /*!
            ensures
                - #*this is properly initialized
                - does not modify m in any way 
        !*/

        auto_unlock (
            const rmutex& m
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

}

#endif // DLIB_AUTO_UNLOCK_EXTENSIOn_ABSTRACT_


