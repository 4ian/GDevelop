// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREAD_FUNCTIOn_ABSTRACT_
#ifdef DLIB_THREAD_FUNCTIOn_ABSTRACT_ 

#include "threads_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class thread_function 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a thread on a global C++ function or function
                object.  That is, it allows you to run a function in its own thread.
        !*/
    public:

        template <typename F>
        thread_function (
            F funct
        );
        /*!
            ensures
                - #*this is properly initialized
                - the function funct has been started in its own thread
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        template <typename F, typename T1>
        thread_function (
            F funct,
            T1 arg1
        );
        /*!
            ensures
                - #*this is properly initialized
                - A thread has been created and it will call funct(arg1)
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        template <typename F, typename T1, typename T2>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2
        );
        /*!
            ensures
                - #*this is properly initialized
                - A thread has been created and it will call funct(arg1, arg2)
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        template <typename F, typename T1, typename T2, typename T3>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2,
            T3 arg3
        );
        /*!
            ensures
                - #*this is properly initialized
                - A thread has been created and it will call funct(arg1, arg2, arg3)
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        template <typename F, typename T1, typename T2, typename T3, typename T4>
        thread_function (
            F funct,
            T1 arg1,
            T2 arg2,
            T3 arg3,
            T4 arg4
        );
        /*!
            ensures
                - #*this is properly initialized
                - A thread has been created and it will call funct(arg1, arg2, arg3, arg4)
            throws
                - std::bad_alloc
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create threading objects.
        !*/

        ~thread_function (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed.  
                - blocks until is_alive() == false
        !*/

        bool is_alive (
        ) const;
        /*!
            ensures
                - if (this object's thread has yet to terminate) then
                    - returns true
                - else
                    - returns false
        !*/

        void wait (
        ) const;
        /*!
            ensures
                - if (is_alive() == true) then
                    - blocks until this object's thread terminates
        !*/

    private:

        // restricted functions
        thread_function(thread_function&);        // copy constructor
        thread_function& operator=(thread_function&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREAD_FUNCTIOn_ABSTRACT_


