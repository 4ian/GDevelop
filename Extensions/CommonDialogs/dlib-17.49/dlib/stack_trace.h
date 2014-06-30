// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STACK_TRACe_
#define DLIB_STACK_TRACe_

/*!
    This file defines 3 things.  Two of them are preprocessor macros that
    enable you to tag functions with the dlib stack trace watcher.  The
    third thing is a function named get_stack_trace() which returns the
    current stack trace in std::string form.

    To enable the stack trace you must #define DLIB_ENABLE_STACK_TRACE.
    When this #define isn't set then the 3 things described above
    still exist but they don't do anything.

    Also note that when the stack trace is enabled it changes the DLIB_ASSERT
    and DLIB_CASSERT macros so that they print stack traces when 
    an assert fails.

    See the following example program for details:

    #include <iostream>
    #include <dlib/stack_trace.h>

    void funct2()
    {
        // put this macro at the top of each function you would
        // like to appear in stack traces
        DLIB_STACK_TRACE;

        // you may print the current stack trace as follows. 
        std::cout << dlib::get_stack_trace() << endl;
    }

    void funct()
    {
        // This alternate form of DLIB_STACK_TRACE allows you to specify
        // the string used to name the current function.  The other form
        // will usually output an appropriate function name automatically
        // so this may not be needed.
        DLIB_STACK_TRACE_NAMED("funct");
        funct2();
    }

    int main()
    {
        funct();
    }
!*/


#include <string>
#include "assert.h"

// only setup the stack trace stuff if the asserts are enabled (which happens in debug mode
// basically).  Also, this stuff doesn't work if you use NO_MAKEFILE
#if defined(DLIB_ENABLE_STACK_TRACE) 
#ifdef NO_MAKEFILE 
#error "You can't use the dlib stack trace stuff and NO_MAKEFILE at the same time"
#endif

namespace dlib
{
    const std::string get_stack_trace();
}

// redefine the DLIB_CASSERT macro to include the stack trace
#undef DLIB_CASSERT
#define DLIB_CASSERT(_exp,_message)                                              \
    {if ( !(_exp) )                                                         \
    {                                                                       \
        std::ostringstream dlib__out;                                       \
        dlib__out << "\n\nError occurred at line " << __LINE__ << ".\n";    \
        dlib__out << "Error occurred in file " << __FILE__ << ".\n";      \
        dlib__out << "Error occurred in function " << DLIB_FUNCTION_NAME << ".\n\n";      \
        dlib__out << "Failing expression was " << #_exp << ".\n";           \
        dlib__out << _message << "\n\n";                                      \
        dlib__out << "Stack Trace: \n" << dlib::get_stack_trace() << "\n";        \
        dlib_assert_breakpoint();                                           \
        throw dlib::fatal_error(dlib::EBROKEN_ASSERT,dlib__out.str());      \
    }}                                                                      



namespace dlib
{

    class stack_tracer
    {
    public:
        stack_tracer (
            const char* funct_name,
            const char* file_name,
            const int line_number
        );

        ~stack_tracer();

    };
}

#define DLIB_STACK_TRACE_NAMED(x) dlib::stack_tracer dlib_stack_tracer_object(x,__FILE__,__LINE__)
#define DLIB_STACK_TRACE dlib::stack_tracer dlib_stack_tracer_object(DLIB_FUNCTION_NAME,__FILE__,__LINE__)

#else // don't do anything if ENABLE_ASSERTS isn't defined
#define DLIB_STACK_TRACE_NAMED(x) 
#define DLIB_STACK_TRACE 

namespace dlib
{
    inline const std::string get_stack_trace() { return std::string("stack trace not enabled");}
}

#endif


#endif // DLIB_STACK_TRACe_

