// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PIPE_KERNEl_1_ 
#define DLIB_PIPE_KERNEl_1_ 

#include "../algs.h"
#include "../threads.h"
#include "pipe_kernel_abstract.h"

namespace dlib
{

    template <
        typename T
        >
    class pipe 
    {
        /*!
            INITIAL VALUE
                - pipe_size == 0
                - pipe_max_size == defined by constructor
                - enabled == true
                - data == a pointer to an array of ((pipe_max_size>0)?pipe_max_size:1) T objects.
                - dequeue_waiters == 0
                - enqueue_waiters == 0
                - first == 1
                - last == 1
                - unblock_sig_waiters == 0

            CONVENTION
                - size() == pipe_size
                - max_size() == pipe_max_size
                - is_enabled() == enabled

                - m == the mutex used to lock access to all the members of this class

                - dequeue_waiters == the number of threads blocked on calls to dequeue()
                - enqueue_waiters == the number of threads blocked on calls to enqueue() and 
                  wait_until_empty()
                - unblock_sig_waiters == the number of threads blocked on calls to 
                  wait_for_num_blocked_dequeues() and the destructor.  (i.e. the number of
                  blocking calls to unblock_sig.wait())

                - dequeue_sig == the signaler that threads blocked on calls to dequeue() wait on
                - enqueue_sig == the signaler that threads blocked on calls to enqueue() 
                  or wait_until_empty() wait on.
                - unblock_sig == the signaler that is signaled when a thread stops blocking on a call
                  to enqueue() or dequeue().  It is also signaled when a dequeue that will probably
                  block is called.  The destructor and wait_for_num_blocked_dequeues are the only 
                  things that will wait on this signaler.

                - if (pipe_size > 0) then
                    - data[first] == the next item to dequeue
                    - data[last] == the item most recently added via enqueue, so the last to dequeue.
                - else if (pipe_max_size == 0)
                    - if (first == 0 && last == 0) then
                        - data[0] == the next item to dequeue
                    - else if (first == 0 && last == 1) then 
                        - data[0] has been taken out already by a dequeue
        !*/

    public:
        // this is here for backwards compatibility with older versions of dlib.
        typedef pipe kernel_1a;

        typedef T type;

        explicit pipe (  
            unsigned long maximum_size
        );

        virtual ~pipe (
        );

        void empty (
        );

        void wait_until_empty (
        ) const;

        void wait_for_num_blocked_dequeues (
            unsigned long num
        )const;

        void enable (
        );

        void disable (
        );

        bool is_enqueue_enabled (
        ) const;

        void disable_enqueue (
        );

        void enable_enqueue (
        );

        bool is_dequeue_enabled (
        ) const;

        void disable_dequeue (
        );

        void enable_dequeue (
        );

        bool is_enabled (
        ) const;

        unsigned long max_size (
        ) const;

        unsigned long size (
        ) const;

        bool enqueue (
            T& item
        );

        bool dequeue (
            T& item
        );

        bool enqueue_or_timeout (
            T& item,
            unsigned long timeout
        );

        bool dequeue_or_timeout (
            T& item,
            unsigned long timeout
        );

    private:

        unsigned long pipe_size;
        const unsigned long pipe_max_size;
        bool enabled;

        T* const data;

        unsigned long first;
        unsigned long last;

        mutex m;
        signaler dequeue_sig;
        signaler enqueue_sig;
        signaler unblock_sig;

        unsigned long dequeue_waiters;
        mutable unsigned long enqueue_waiters;
        mutable unsigned long unblock_sig_waiters;
        bool enqueue_enabled;
        bool dequeue_enabled;

        // restricted functions
        pipe(const pipe&);        // copy constructor
        pipe& operator=(const pipe&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                      member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    pipe<T>::
    pipe (  
        unsigned long maximum_size
    ) : 
        pipe_size(0),
        pipe_max_size(maximum_size),
        enabled(true),
        data(new T[(maximum_size>0) ? maximum_size : 1]),
        first(1),
        last(1),
        dequeue_sig(m),
        enqueue_sig(m),
        unblock_sig(m),
        dequeue_waiters(0),
        enqueue_waiters(0),
        unblock_sig_waiters(0),
        enqueue_enabled(true),
        dequeue_enabled(true)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    pipe<T>::
    ~pipe (
    )
    {
        auto_mutex M(m);
        ++unblock_sig_waiters;

        // first make sure no one is blocked on any calls to enqueue() or dequeue()
        enabled = false;
        dequeue_sig.broadcast();
        enqueue_sig.broadcast();
        unblock_sig.broadcast();

        // wait for all threads to unblock
        while (dequeue_waiters > 0 || enqueue_waiters > 0 || unblock_sig_waiters > 1)
            unblock_sig.wait();

        delete [] data;
        --unblock_sig_waiters;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    empty (
    )
    {
        auto_mutex M(m);
        pipe_size = 0;

        // let any calls to enqueue() know that the pipe is now empty
        if (enqueue_waiters > 0)
            enqueue_sig.broadcast();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    wait_until_empty (
    ) const
    {
        auto_mutex M(m);
        // this function is sort of like a call to enqueue so treat it like that
        ++enqueue_waiters;

        while (pipe_size > 0 && enabled && dequeue_enabled )
            enqueue_sig.wait();

        // let the destructor know we are ending if it is blocked waiting
        if (enabled == false)
            unblock_sig.broadcast();

        --enqueue_waiters;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    enable (
    )
    {
        auto_mutex M(m);
        enabled = true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    disable (
    )
    {
        auto_mutex M(m);
        enabled = false;
        dequeue_sig.broadcast();
        enqueue_sig.broadcast();
        unblock_sig.broadcast();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    is_enabled (
    ) const
    {
        auto_mutex M(m);
        return enabled;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    unsigned long pipe<T>::
    max_size (
    ) const
    {
        auto_mutex M(m);
        return pipe_max_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    unsigned long pipe<T>::
    size (
    ) const
    {
        auto_mutex M(m);
        return pipe_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    enqueue (
        T& item
    )
    {
        auto_mutex M(m);
        ++enqueue_waiters;

        // wait until there is room or we are disabled 
        while (pipe_size == pipe_max_size && enabled && enqueue_enabled &&
               !(pipe_max_size == 0 && first == 1) )
            enqueue_sig.wait();

        if (enabled == false || enqueue_enabled == false)
        {
            --enqueue_waiters;
            // let the destructor know we are unblocking
            unblock_sig.broadcast();
            return false;
        }

        // set the appropriate values for first and last
        if (pipe_size == 0)
        {
            first = 0;
            last = 0;
        }
        else
        {
            last = (last+1)%pipe_max_size;
        }


        exchange(item,data[last]);

        // wake up a call to dequeue() if there are any currently blocked
        if (dequeue_waiters > 0)
            dequeue_sig.signal();

        if (pipe_max_size > 0)
        {
            ++pipe_size;
        }
        else
        {
            // wait for a dequeue to take the item out
            while (last == 0 && enabled && enqueue_enabled)
                enqueue_sig.wait();

            if (last == 0 && (enabled == false || enqueue_enabled == false))
            {
                last = 1;
                first = 1;

                // no one dequeued this object to put it back into item
                exchange(item,data[0]);

                --enqueue_waiters;
                // let the destructor know we are unblocking
                if (unblock_sig_waiters > 0)
                    unblock_sig.broadcast();
                return false;
            }

            last = 1;
            first = 1;

            // tell any waiting calls to enqueue() that one of them can proceed
            if (enqueue_waiters > 1)
                enqueue_sig.broadcast();

            // let the destructor know we are unblocking
            if (enabled == false && unblock_sig_waiters > 0)
                unblock_sig.broadcast();
        }

        --enqueue_waiters;
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    dequeue (
        T& item
    )
    {
        auto_mutex M(m);
        ++dequeue_waiters;

        if (pipe_size == 0)
        {
            // notify wait_for_num_blocked_dequeues()
            if (unblock_sig_waiters > 0)
                unblock_sig.broadcast();

            // notify any blocked enqueue_or_timeout() calls
            if (enqueue_waiters > 0)
                enqueue_sig.broadcast();
        }

        // wait until there is something in the pipe or we are disabled 
        while (pipe_size == 0 && enabled && dequeue_enabled &&
               !(pipe_max_size == 0 && first == 0 && last == 0) )
            dequeue_sig.wait();

        if (enabled == false || dequeue_enabled == false)
        {
            --dequeue_waiters;
            // let the destructor know we are unblocking
            unblock_sig.broadcast();
            return false;
        }

        exchange(item,data[first]);

        if (pipe_max_size > 0)
        {
            // set the appropriate values for first 
            first = (first+1)%pipe_max_size;

            --pipe_size;
        }
        else
        {
            // let the enqueue waiting on us know that we took the 
            // item out already.
            last = 1;
        }

        // wake up a call to enqueue() if there are any currently blocked
        if (enqueue_waiters > 0)
            enqueue_sig.broadcast();

        --dequeue_waiters;
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    enqueue_or_timeout (
        T& item,
        unsigned long timeout
    )
    {
        auto_mutex M(m);
        ++enqueue_waiters;

        // wait until there is room or we are disabled or 
        // we run out of time.
        bool timed_out = false;
        while (pipe_size == pipe_max_size && enabled && enqueue_enabled &&
               !(pipe_max_size == 0 && dequeue_waiters > 0 && first == 1) )
        {
            if (timeout == 0 || enqueue_sig.wait_or_timeout(timeout) == false)
            {
                timed_out = true;
                break;
            }
        }

        if (enabled == false || timed_out || enqueue_enabled == false)
        {
            --enqueue_waiters;
            // let the destructor know we are unblocking
            unblock_sig.broadcast();
            return false;
        }

        // set the appropriate values for first and last
        if (pipe_size == 0)
        {
            first = 0;
            last = 0;
        }
        else
        {
            last = (last+1)%pipe_max_size;
        }


        exchange(item,data[last]);

        // wake up a call to dequeue() if there are any currently blocked
        if (dequeue_waiters > 0)
            dequeue_sig.signal();

        if (pipe_max_size > 0)
        {
            ++pipe_size;
        }
        else
        {
            // wait for a dequeue to take the item out
            while (last == 0 && enabled && enqueue_enabled)
                enqueue_sig.wait();

            if (last == 0 && (enabled == false || enqueue_enabled == false))
            {
                last = 1;
                first = 1;

                // no one dequeued this object to put it back into item
                exchange(item,data[0]);

                --enqueue_waiters;
                // let the destructor know we are unblocking
                if (unblock_sig_waiters > 0)
                    unblock_sig.broadcast();
                return false;
            }

            last = 1;
            first = 1;

            // tell any waiting calls to enqueue() that one of them can proceed
            if (enqueue_waiters > 1)
                enqueue_sig.broadcast();

            // let the destructor know we are unblocking
            if (enabled == false && unblock_sig_waiters > 0)
                unblock_sig.broadcast();
        }

        --enqueue_waiters;
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    dequeue_or_timeout (
        T& item,
        unsigned long timeout
    )
    {
        auto_mutex M(m);
        ++dequeue_waiters;

        if (pipe_size == 0)
        {
            // notify wait_for_num_blocked_dequeues()
            if (unblock_sig_waiters > 0)
                unblock_sig.broadcast();

            // notify any blocked enqueue_or_timeout() calls
            if (enqueue_waiters > 0)
                enqueue_sig.broadcast();
        }

        bool timed_out = false;
        // wait until there is something in the pipe or we are disabled or we timeout.
        while (pipe_size == 0 && enabled && dequeue_enabled &&
               !(pipe_max_size == 0 && first == 0 && last == 0) )
        {
            if (timeout == 0 || dequeue_sig.wait_or_timeout(timeout) == false)
            {
                timed_out = true;
                break;
            }
        }

        if (enabled == false || timed_out || dequeue_enabled == false)
        {
            --dequeue_waiters;
            // let the destructor know we are unblocking
            unblock_sig.broadcast();
            return false;
        }

        exchange(item,data[first]);

        if (pipe_max_size > 0)
        {
            // set the appropriate values for first 
            first = (first+1)%pipe_max_size;

            --pipe_size;
        }
        else
        {
            // let the enqueue waiting on us know that we took the 
            // item out already.
            last = 1;
        }

        // wake up a call to enqueue() if there are any currently blocked
        if (enqueue_waiters > 0)
            enqueue_sig.broadcast();

        --dequeue_waiters;
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    wait_for_num_blocked_dequeues (
        unsigned long num
    )const
    {
        auto_mutex M(m);
        ++unblock_sig_waiters;

        while ( (dequeue_waiters < num || pipe_size != 0) && enabled && dequeue_enabled)
            unblock_sig.wait();

        // let the destructor know we are ending if it is blocked waiting
        if (enabled == false)
            unblock_sig.broadcast();

        --unblock_sig_waiters;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    is_enqueue_enabled (
    ) const
    {
        auto_mutex M(m);
        return enqueue_enabled;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    disable_enqueue (
    )
    {
        auto_mutex M(m);
        enqueue_enabled = false;
        enqueue_sig.broadcast();
    }


// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    enable_enqueue (
    )
    {
        auto_mutex M(m);
        enqueue_enabled = true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool pipe<T>::
    is_dequeue_enabled (
    ) const
    {
        auto_mutex M(m);
        return dequeue_enabled;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    disable_dequeue (
    )
    {
        auto_mutex M(m);
        dequeue_enabled = false;
        dequeue_sig.broadcast();
    }


// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void pipe<T>::
    enable_dequeue (
    )
    {
        auto_mutex M(m);
        dequeue_enabled = true;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PIPE_KERNEl_1_

