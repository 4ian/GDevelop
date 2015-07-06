// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LINKER_KERNEl_ABSTRACT_
#ifdef DLIB_LINKER_KERNEl_ABSTRACT_

#include "../threads/threads_kernel_abstract.h"
#include "../sockets/sockets_kernel_abstract.h"

namespace dlib
{

    class linker 
    {

        /*!
            INITIAL VALUE
                is_running() == false

               
            WHAT THIS OBJECT REPRESENTS
                This object represents something that takes two connections and lets
                them talk to each other.  i.e. any incoming data from one connection is
                passed unaltered to the other and vice versa.

                note that linker objects are not swappable.

                Also note that when one connection is closed shutdown_outgoing()
                is called on the other to signal that no more data will be sent
                in that direction on the connection.
                (i.e. the FIN packet is effectively also forwarded by the linker object)

            THREAD SAFETY
                all member functions are thread-safe.

        !*/

        public:

            linker(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc
                    - dlib::thread_error
            !*/

            linker (
                connection& a,
                connection& b
            );
            /*!
                ensures 
                    - #*this is properly initialized
                    - immediately invokes link(a,b); 
                      (i.e. using this constructor is the same as creating a linker with
                      the default constructor and then immediately invoking link() on it)
                throws
                    - std::bad_alloc
                    - dlib::thread_error
            !*/

            virtual ~linker(
            ); 
            /*!
                ensures
                    - all resources associated with *this have been released
            !*/

            void clear(
            );
            /*!
                ensures
                    - #*this has its initial value 
                    - if (is_running()) then 
                        - the two connections being linked will be shutdown()
                throws
                    - std::bad_alloc
                        if this exception is thrown then the linker object is unusable
                        until clear() is called and succeeds and
                        if is_running() then the connections will STILL be shutdown() 
                        even though an exception is being thrown
            !*/

            bool is_running(
            ) const;
            /*!
                ensures
                    - returns true if link() is running else
                    - returns false if link() is not running or has released all its 
                      resources and is about to terminate
                throws
                    - std::bad_alloc
            !*/


            void link (
                connection& a,
                connection& b
            );
            /*!
                requires
                    - is_running() == false
                ensures
                    - all incoming data from connection a will be forwarded to b 
                    - all incoming data from connection b will be forwarded to a 
                    - #a and #b will have been shutdown() 
                    - link() will block until both of the connections have ended
                      or an error occurs                     
                throws
                    - std::bad_alloc
                        link() may throw this exception and if it does then the object 
                        will be unusable until clear() is called and succeeds and
                        connections a and b will be shutdown()
                    - dlib::socket_error
                        link() will throw a this exception if one of the connections
                        returns an error value (being shutdown is not an error). 
                        If this happens then the linker object will be cleared and 
                        have its initial value.  note that if this happens then the 
                        connections being linked will be shutdown()
                    - dlib::thread_error
                        link() will throw a this exception if there is a problem 
                        creating new threads.  Or it may throw this exception if there
                        is a problem creating threading objects. If this happens 
                        then the linker object will be cleared and have its initial value.
                        note that if this happens then the connections being linked will
                        be shutdown().
            !*/

        private:

            // restricted functions
            linker(linker&);        // copy constructor
            linker& operator=(linker&);    // assignment operator
    };

}

#endif // DLIB_LINKER_KERNEl_ABSTRACT_

