// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SYNC_EXTENSION_KERNEl_ABSTRACT_
#ifdef DLIB_SYNC_EXTENSION_KERNEl_ABSTRACT_

#include "../threads/threads_kernel_abstract.h"
#include "../threads/rmutex_extension_abstract.h"
#include "../threads/rsignaler_extension_abstract.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename base
        >
    class sync_extension : public base
    {

        /*!
            REQUIREMENTS ON base
                base must have a default constructor
                base must implement swap(base&)


            WHAT THIS OBJECT REPRESENTS
                This object represents a general extension to any object (given the
                restrictions on base).  This object gives any object which it extends 
                an integrated rmutex and rsignaler object.  The extended object will 
                then be able to be treated as if it was also a rmutex and rsignaler.

                NOTE that just like the threading api, this object does not check
                its requires clauses so be careful with it.

                Also note that swap() does not swap the rmutex and rsignaler objects.
                the rmutex and rsignaler are associated with the object instance itself, 
                not with whatever the object represents.  
        !*/


        public:

        sync_extension (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
                    this is thrown if there is a problem gathering memory
                - dlib::thread_error
                    this is thrown if there is a problem creating threading objects
                - any exception thrown by the constructor for the parent class base
        !*/

        template <
            typename T
            >
        sync_extension (
            const T& one
        );
        /*!
            ensures
                - #*this is properly initialized
                - the argument one will be passed on to the constructor for the parent 
                  class base.
            throws
                - std::bad_alloc
                    this is thrown if there is a problem gathering memory
                - dlib::thread_error
                    this is thrown if there is a problem creating threading objects
                - any exception thrown by the constructor for the parent class base
        !*/

        template <
            typename T,
            typename U
            >
        sync_extension (
            const T& one,
            const T& two 
        );
        /*!
            ensures
                - #*this is properly initialized
                - the argument one will be passed on to the constructor for the parent 
                  class base as its first argument.
                - the argument two will be passed on to the constructor for the parent 
                  class base as its second argument.
            throws
                - std::bad_alloc
                    this is thrown if there is a problem gathering memory
                - dlib::thread_error
                    this is thrown if there is a problem creating threading objects
                - any exception thrown by the constructor for the parent class base
        !*/


        const rmutex& get_mutex (
        ) const;
        /*!
            ensures
                - returns the rmutex embedded in this object
        !*/

        void lock (
        ) const;
        /*!
            requires
                - the thread calling lock() does not already have a lock on *this
            ensures
                - if (*this is currently locked by another thread) then 
                    - the thread that called lock() on *this is put to sleep until 
                      it becomes available                  
                - if (*this is currently unlocked) then 
                    - #*this becomes locked and the current thread is NOT put to sleep 
                      but now "owns" #*this
        !*/

        void unlock (
        ) const;
        /*!
            ensures
                - #*this is unlocked (i.e. other threads may now lock this object)
        !*/


        void wait (
        ) const;
        /*!
            requires
                - *this is locked and owned by the calling thread
            ensures
                - atomically unlocks *this and blocks the calling thread
                - calling thread will wake if another thread calls signal() or broadcast() 
                  on *this
                - when wait returns the calling thread again has a lock on #*this
        !*/


        bool wait_or_timeout (
            unsigned long milliseconds
        ) const;
        /*!
            requires
                - *this is locked and owned by the calling thread
            ensures
                - atomically unlocks *this and blocks the calling thread
                - calling thread will wake if another thread calls signal() or broadcast() 
                  on *this
                - after the specified number of milliseconds has elapsed the calling thread
                  will wake once *this is free to be locked
                - when wait returns the calling thread again has a lock on #*this

                - returns false if the call to wait_or_timeout timed out 
                - returns true if the call did not time out
        !*/
        
        void signal (
        ) const;
        /*!
            ensures
                - if (at least one thread is waiting on *this) then
                    - at least one of the waiting threads will wake 
        !*/

        void broadcast (
        ) const;
        /*!
            ensures
                - any and all threads waiting on *this will wake 
        !*/

    };

    template <
        typename base
        >
    inline void swap (
        sync_extension<base>& a, 
        sync_extension<base>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_SYNC_EXTENSION_KERNEl_ABSTRACT_

