// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CONFIG_READER_THREAD_SAFe_ABSTRACT_
#ifdef DLIB_CONFIG_READER_THREAD_SAFe_ABSTRACT_

#include <string>
#include <iosfwd>
#include "config_reader_kernel_abstract.h"
#include "../threads/threads_kernel_abstract.h"

namespace dlib
{

    class config_reader_thread_safe 
    {

        /*!                
            WHAT THIS EXTENSION DOES FOR config_reader 
                This object extends a normal config_reader by simply wrapping all 
                its member functions inside mutex locks to make it safe to use
                in a threaded program.  

                So this object provides an interface identical to the one defined
                in the config_reader/config_reader_kernel_abstract.h file except that
                the rmutex returned by get_mutex() is always locked when this 
                object's member functions are called.
        !*/
    
    public:

        const rmutex& get_mutex (
        ) const;
        /*!
            ensures
                - returns the rmutex used to make this object thread safe.  i.e. returns
                  the rmutex that is locked when this object's functions are called.
        !*/

    };

}

#endif // DLIB_CONFIG_READER_THREAD_SAFe_ABSTRACT_


