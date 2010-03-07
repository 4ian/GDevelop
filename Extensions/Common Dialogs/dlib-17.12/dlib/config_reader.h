// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONFIG_READEr_
#define DLIB_CONFIG_READEr_

#include "config_reader/config_reader_kernel_1.h"
#include "map.h"
#include "tokenizer.h"

#include "algs.h"

#ifndef DLIB_ISO_CPP_ONLY
#include "config_reader/config_reader_thread_safe_1.h"
#endif

namespace dlib
{


    class config_reader
    {
        config_reader() {}

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     config_reader_kernel_1<
                        map<std::string,std::string>::kernel_1b,
                        map<std::string,void*>::kernel_1b,
                        tokenizer::kernel_1a
                        > kernel_1a;
        // kernel_1a_c        
        typedef     config_reader_kernel_1<
                        map<std::string,std::string>::kernel_1b,
                        map<std::string,void*>::kernel_1b,
                        tokenizer::kernel_1a,
                        true
                        > kernel_1a_c;
 
 
#ifndef DLIB_ISO_CPP_ONLY
        // thread_safe_1a
        typedef     config_reader_thread_safe_1<
                        kernel_1a,
                        map<std::string,void*>::kernel_1b,
                        false
                        > thread_safe_1a;

        // thread_safe_1a_c
        typedef     config_reader_thread_safe_1<
                        kernel_1a_c,
                        map<std::string,void*>::kernel_1b,
                        true
                        > thread_safe_1a_c;
#endif // DLIB_ISO_CPP_ONLY

    };

}

#endif // DLIB_CONFIG_READEr_

