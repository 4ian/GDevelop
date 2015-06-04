// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_THREADS_KERNEl_ABSTRACT_
#ifdef DLIB_THREADS_KERNEl_ABSTRACT_

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!
        THREAD POOLING
            When threads end they go into a global thread pool and each waits there 
            for 30 seconds before timing out and having its resources returned to the 
            operating system.  When create_new_thread() is called it first looks in the
            thread pool to see if there are any threads it can snatch from the pool, if 
            not then it makes a new one.  

            Note that whenever I say something happens when a thread "terminates" or "ends"
            I mean "when it returns to the thread pool."  From the client programmer point
            of view a thread terminates/ends when it returns to the dlib thread pool and you 
            shouldn't and indeed don't need to know when it actually gets its resources
            reclaimed by the operating system.

            If you want to change the timeout to a different value you can #define 
            DLIB_THREAD_POOL_TIMEOUT to whatever value (in milliseconds) that you like.

        EXCEPTIONS
            Unless specified otherwise, nothing in this file throws exceptions.
    !*/

// ----------------------------------------------------------------------------------------

    thread_id_type get_thread_id (
    );
    /*!
        ensures
            - returns a unique id for the calling thread.  Note that while the id is unique 
              among all currently existing threads it may have been used by a previous
              thread that has terminated.
    !*/

// ----------------------------------------------------------------------------------------

    bool is_dlib_thread (
        thread_id_type id = get_thread_id()
    );
    /*!
        ensures
            - if (the thread with the given id was spawned by a call to
                  dlib::create_new_thread) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void register_thread_end_handler (
        T& obj,
        void (T::*handler)()
    );
    /*!
        requires
            - handler == a valid member function pointer for class T
            - handler does not throw
            - handler does not call register_thread_end_handler()
            - handler does not block
            - is_dlib_thread() == true (i.e. the calling thread was spawned by dlib::create_new_thread())
        ensures
            - let ID == the thread id for the thread calling register_thread_end_handler()
            - (obj.*handler)() will be called when the thread with thread id ID is 
              terminating and it will be called from within that terminating thread.  
              (i.e. inside the handler function get_thread_id() == ID == the id of the 
              thread that is terminating. )
            - each call to this function adds another handler that will be called when
              the given thread terminates.  This means that if you call it a bunch of 
              times then you will end up registering multiple handlers (or single 
              handlers multiple times) that will be called when the thread ends. 
        throws
            - std::bad_alloc
              If this exception is thrown then the call to this function had no effect.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void unregister_thread_end_handler (
        T& obj,
        void (T::*handler)()
    );
    /*!
        requires
            - handler == a valid member function pointer for class T
        ensures
            - Undoes all previous calls to register_thread_end_handler(obj,handler).  
              So the given handler won't be called when any threads end.
        throws
            - std::bad_alloc
              If this exception is thrown then the call to this function had no effect.
    !*/

// ----------------------------------------------------------------------------------------

    bool create_new_thread (
        void (*funct)(void*),
        void* param
    );
    /*!
        ensures
            - creates a new thread for the function pointed to by funct 
            - passes it param as its parameter. (i.e. calls funct(param) from the new thread)
            - returns true upon success and false upon failure to create the new thread
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // mutex object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class mutex
    {
        /*!
            INITIAL VALUE
                mutex is in the unlocked state

            WHAT THIS OBJECT REPRESENTS
                This object represents a mutex intended to be used for synchronous 
                thread control of shared data. When a thread wants to access some 
                shared data it locks out other threads by calling lock() and calls 
                unlock() when it is finished.  
        !*/
    public:

        mutex (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the mutex.
        !*/

        ~mutex (
        );
        /*!
            requires
                - *this is not locked
            ensures
                - all resources allocated by *this have been freed
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
            requires
                - the thread calling unlock() already has a lock on *this
            ensures
                - #*this is unlocked (i.e. other threads may now lock this object)
        !*/


    private:
        // restricted functions
        mutex(mutex&);        // copy constructor
        mutex& operator=(mutex&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // signaler object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class signaler
    {
        /*!

            WHAT THIS OBJECT REPRESENTS
                This object represents an event signaling system for threads.  It gives 
                a thread the ability to wake up other threads that are waiting for a 
                particular signal. 

                Each signaler object is associated with one and only one mutex object.  
                More than one signaler object may be associated with a single mutex
                but a signaler object may only be associated with a single mutex.

                NOTE:
                You must guard against spurious wakeups.  This means that a thread
                might return from a call to wait even if no other thread called
                signal.  This is rare but must be guarded against. 
        !*/
    public:

        signaler (
            const mutex& associated_mutex
        );
        /*!
            ensures
                - #*this is properly initialized 
                - #get_mutex() == associated_mutex
            throws
                - dlib::thread_error
                    the constructor may throw this exception if there is a problem 
                    gathering resources to create the signaler.    
        !*/


        ~signaler (
        );
        /*!
            ensures
                - all resources allocated by *this have been freed
        !*/

        void wait (
        ) const;
        /*!
            requires
                - get_mutex() is locked and owned by the calling thread
            ensures
                - atomically unlocks get_mutex() and blocks the calling thread                      
                - calling thread may wake if another thread calls signal() or broadcast()
                  on *this
                - when wait() returns the calling thread again has a lock on get_mutex()
        !*/

        bool wait_or_timeout (
            unsigned long milliseconds
        ) const;
        /*!
            requires
                - get_mutex() is locked and owned by the calling thread
            ensures
                - atomically unlocks get_mutex() and blocks the calling thread
                - calling thread may wake if another thread calls signal() or broadcast()
                  on *this
                - after the specified number of milliseconds has elapsed the calling thread
                  will wake once get_mutex() is free
                - when wait returns the calling thread again has a lock on get_mutex()

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

        const mutex& get_mutex (
        ) const;
        /*!
            ensures
                - returns a const reference to the mutex associated with *this
        !*/

    private:
        // restricted functions
        signaler(signaler&);        // copy constructor
        signaler& operator=(signaler&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THREADS_KERNEl_ABSTRACT_

