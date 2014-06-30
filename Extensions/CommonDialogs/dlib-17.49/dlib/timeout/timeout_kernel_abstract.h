// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TIMEOUT_KERNEl_ABSTRACT_
#ifdef DLIB_TIMEOUT_KERNEl_ABSTRACT_

#include "../threads.h"

namespace dlib
{

    class timeout 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object provides a simple way to implement a timeout.  An example will make
                its use clear.  Suppose we want to read from a socket but we want to terminate the
                connection if the read takes longer than 10 seconds.  This could be accomplished
                as follows:

                connection* con = a connection from somewhere;
                {
                    // setup a timer that will call con->shutdown() in 10 seconds
                    timeout::kernel_1a t(*con,&connection::shutdown,10000); 
                    // Now call read on the connection.  If this call to read() takes
                    // more than 10 seconds then the t timeout will trigger and shutdown
                    // the connection.  If read completes in less than 10 seconds then
                    // the t object will be destructed on the next line due to the } 
                    // and then the timeout won't trigger.
                    con->read(buf,100);
                }

            THREAD SAFETY
                All methods of this class are thread safe. 
        !*/

    public:

        template <
            typename T
            >
        timeout (  
            T& object,
            void (T::*callback_function)(),
            unsigned long ms_to_timeout
        );
        /*!
            requires
                - callback_function does not throw
            ensures                
                - does not block.
                - #*this is properly initialized
                - if (this object isn't destructed in ms_to_timeout milliseconds) then
                    - (object.*callback_function)() will be called in ms_to_timeout 
                      milliseconds.
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        template <
            typename T,
            typename U
            >
        timeout (  
            T& object,
            void (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        );
        /*!
            requires
                - callback_function does not throw
            ensures                
                - does not block.
                - #*this is properly initialized
                - if (this object isn't destructed in ms_to_timeout milliseconds) then
                    - (object.*callback_function)(callback_function_argument) will be 
                      called in ms_to_timeout milliseconds.
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        template <
            typename T
            >
        timeout (  
            T& object,
            int (T::*callback_function)(),
            unsigned long ms_to_timeout
        );
        /*!
            requires
                - callback_function does not throw
            ensures                
                - does not block.
                - #*this is properly initialized
                - if (this object isn't destructed in ms_to_timeout milliseconds) then
                    - (object.*callback_function)() will be called in ms_to_timeout 
                      milliseconds.
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        template <
            typename T,
            typename U
            >
        timeout (  
            T& object,
            int (T::*callback_function)(U callback_function_argument),
            unsigned long ms_to_timeout,
            U callback_function_argument
        );
        /*!
            requires
                - callback_function does not throw
            ensures                
                - does not block.
                - #*this is properly initialized
                - if (this object isn't destructed in ms_to_timeout milliseconds) then
                    - (object.*callback_function)(callback_function_argument) will be 
                      called in ms_to_timeout milliseconds.
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~timeout (
        );
        /*!
            requires
                - is not called from inside the callback_function given to the
                  constructor.
            ensures
                - any resources associated with *this have been released
                - if (the callback_function hasn't been called yet) then
                    - the callback_function specified in the constructor will not be called
        !*/

    private:

        // restricted functions
        timeout(const timeout&);        // copy constructor
        timeout& operator=(const timeout&);    // assignment operator

    };    

}

#endif // DLIB_TIMEOUT_KERNEl_ABSTRACT_


