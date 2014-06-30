// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CPP_PRETTY_PRINTEr_
#define DLIB_CPP_PRETTY_PRINTEr_


#include "cpp_pretty_printer/cpp_pretty_printer_kernel_1.h"
#include "cpp_pretty_printer/cpp_pretty_printer_kernel_2.h"
#include "cpp_tokenizer.h"
#include "stack.h"

namespace dlib
{

    class cpp_pretty_printer
    {
        cpp_pretty_printer() {}


        typedef stack<unsigned long>::kernel_1a stack;
        typedef cpp_tokenizer::kernel_1a tok;

    public:
        
        //----------- kernels ---------------

        // kernel_1a        
        typedef     cpp_pretty_printer_kernel_1<stack,tok>
                    kernel_1a;

        // kernel_2a        
        typedef     cpp_pretty_printer_kernel_2<stack,tok>
                    kernel_2a;

    };
}

#endif // DLIB_CPP_PRETTY_PRINTEr_

