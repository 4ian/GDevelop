// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_PIPE_KERNEl_ABSTRACT_ 
#ifdef DLIB_PIPE_KERNEl_ABSTRACT_ 

#include "../threads.h"

namespace dlib
{

    template <
        typename T
        >
    class pipe 
    {
        /*!
            REQUIREMENTS ON T
                T must be swappable by a global swap() 
                T must have a default constructor

            INITIAL VALUE
                size() == 0
                is_enabled() == true
                is_enqueue_enabled() == true
                is_dequeue_enabled() == true

            WHAT THIS OBJECT REPRESENTS
                This is a first in first out queue with a fixed maximum size containing 
                items of type T.  It is suitable for passing objects between threads.
                
            THREAD SAFETY
                All methods of this class are thread safe.  You may call them from any
                thread and any number of threads my call them at once.
        !*/

    public:

        typedef T type;

        explicit pipe (  
            unsigned long maximum_size
        );
        /*!
            ensures                
                - #*this is properly initialized
                - #max_size() == maximum_size
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~pipe (
        );
        /*!
            ensures
                - any resources associated with *this have been released
                - disables (i.e. sets is_enabled() == false) this object so that 
                  all calls currently blocking on it will return immediately. 
        !*/

        void enable (
        );
        /*!
            ensures
                - #is_enabled() == true
        !*/

        void disable (
        );
        /*!
            ensures
                - #is_enabled() == false
                - causes all current and future calls to enqueue(), dequeue(),
                  enqueue_or_timeout() and dequeue_or_timeout() to not block but 
                  to return false immediately until enable() is called.
                - causes all current and future calls to wait_until_empty() and
                  wait_for_num_blocked_dequeues() to not block but return
                  immediately until enable() is called.
        !*/

        bool is_enabled (
        ) const;
        /*!
            ensures
                - returns true if this pipe is currently enabled, false otherwise.
        !*/

        void empty (
        );
        /*!
            ensures
                - #size() == 0
        !*/

        void wait_until_empty (
        ) const;
        /*!
            ensures
                - blocks until one of the following is the case:
                    - size() == 0  
                    - is_enabled() == false
                    - is_dequeue_enabled() == false
        !*/

        void wait_for_num_blocked_dequeues (
           unsigned long num
        ) const;
        /*!
            ensures
                - blocks until one of the following is the case: 
                    - size() == 0 and the number of threads blocked on calls 
                      to dequeue() and dequeue_or_timeout() is greater than 
                      or equal to num.
                    - is_enabled() == false
                    - is_dequeue_enabled() == false
        !*/

        bool is_enqueue_enabled (
        ) const;
        /*!
            ensures
                - returns true if the enqueue() and enqueue_or_timeout() functions are 
                  currently enabled, returns false otherwise.  (note that the higher 
                  level is_enabled() function can overrule this one.  So if 
                  is_enabled() == false then enqueue functions are still disabled even
                  if is_enqueue_enabled() returns true.  But if is_enqueue_enabled() == false 
                  then enqueue functions are always disabled no matter the state of 
                  is_enabled())
        !*/

        void disable_enqueue (
        );
        /*!
            ensures
                - #is_enqueue_enabled() == false 
                - causes all current and future calls to enqueue() and
                  enqueue_or_timeout() to not block but to return false 
                  immediately until enable_enqueue() is called.
        !*/

        void enable_enqueue (
        );
        /*!
            ensures
                - #is_enqueue_enabled() == true
        !*/

        bool is_dequeue_enabled (
        ) const;
        /*!
            ensures
                - returns true if the dequeue() and dequeue_or_timeout() functions are 
                  currently enabled, returns false otherwise.  (note that the higher 
                  level is_enabled() function can overrule this one.  So if 
                  is_enabled() == false then dequeue functions are still disabled even
                  if is_dequeue_enabled() returns true.  But if is_dequeue_enabled() == false 
                  then dequeue functions are always disabled no matter the state of 
                  is_enabled())
        !*/

        void disable_dequeue (
        );
        /*!
            ensures
                - #is_dequeue_enabled() == false 
                - causes all current and future calls to dequeue() and
                  dequeue_or_timeout() to not block but to return false 
                  immediately until enable_dequeue() is called.
        !*/

        void enable_dequeue (
        );
        /*!
            ensures
                - #is_dequeue_enabled() == true
        !*/

        unsigned long max_size (
        ) const;
        /*!
            ensures
                - returns the maximum number of objects of type T that this 
                  pipe can contain.
        !*/

        unsigned long size (
        ) const;
        /*!
            ensures
                - returns the number of objects of type T that this
                  object currently contains.
        !*/

        bool enqueue (
            T& item
        );
        /*!
            ensures
                - if (size() == max_size()) then
                    - this call to enqueue() blocks until one of the following is the case:
                        - there is room in the pipe for another item
                        - max_size() == 0 and another thread is trying to dequeue from this 
                          pipe and we can pass our item object directly to that thread.
                        - someone calls disable() 
                        - someone calls disable_enqueue()
                - else
                    - this call does not block.
                - if (this call to enqueue() returns true) then
                    - #is_enabled() == true 
                    - #is_enqueue_enabled() == true
                    - if (max_size() == 0) then
                        - using global swap, item was passed directly to a 
                          thread attempting to dequeue from this pipe
                    - else
                        - using global swap, item was added into this pipe.
                    - #item is in an undefined but valid state for its type 
                - else
                    - item was NOT added into the pipe
                    - #item == item (i.e. the value of item is unchanged)
        !*/

        bool enqueue_or_timeout (
            T& item,
            unsigned long timeout
        );
        /*!
            ensures
                - if (size() == max_size() && timeout > 0) then
                    - this call to enqueue_or_timeout() blocks until one of the following is the case:
                        - there is room in the pipe to add another item
                        - max_size() == 0 and another thread is trying to dequeue from this pipe 
                          and we can pass our item object directly to that thread.
                        - someone calls disable() 
                        - someone calls disable_enqueue() 
                        - timeout milliseconds passes
                - else
                    - this call does not block. 
                - if (this call to enqueue() returns true) then
                    - #is_enabled() == true 
                    - #is_enqueue_enabled() == true
                    - if (max_size() == 0) then
                        - using global swap, item was passed directly to a 
                          thread attempting to dequeue from this pipe
                    - else
                        - using global swap, item was added into this pipe.
                    - #item is in an undefined but valid state for its type
                - else
                    - item was NOT added into the pipe
                    - #item == item (i.e. the value of item is unchanged)
        !*/

        bool dequeue (
            T& item
        );
        /*!
            ensures
                - if (size() == 0) then
                    - this call to dequeue() blocks until one of the following is the case:
                        - there is something in the pipe we can dequeue
                        - max_size() == 0 and another thread is trying to enqueue an item 
                          onto this pipe and we can receive our item directly from that thread.  
                        - someone calls disable()
                        - someone calls disable_dequeue()
                - else
                    - this call does not block.
                - if (this call to dequeue() returns true) then
                    - #is_enabled() == true 
                    - #is_dequeue_enabled() == true 
                    - the oldest item that was enqueued into this pipe has been
                      swapped into #item.
                - else
                    - nothing was dequeued from this pipe.
                    - #item == item (i.e. the value of item is unchanged)
        !*/

        bool dequeue_or_timeout (
            T& item,
            unsigned long timeout
        );
        /*!
            ensures
                - if (size() == 0 && timeout > 0) then
                    - this call to dequeue_or_timeout() blocks until one of the following is the case:
                        - there is something in the pipe we can dequeue 
                        - max_size() == 0 and another thread is trying to enqueue an item onto this 
                          pipe and we can receive our item directly from that thread.  
                        - someone calls disable() 
                        - someone calls disable_dequeue()
                        - timeout milliseconds passes
                - else
                    - this call does not block.
                - if (this call to dequeue_or_timeout() returns true) then
                    - #is_enabled() == true 
                    - #is_dequeue_enabled() == true 
                    - the oldest item that was enqueued into this pipe has been
                      swapped into #item.
                - else
                    - nothing was dequeued from this pipe.
                    - #item == item (i.e. the value of item is unchanged)
        !*/

    private:

        // restricted functions
        pipe(const pipe&);        // copy constructor
        pipe& operator=(const pipe&);    // assignment operator

    };    

}

#endif // DLIB_PIPE_KERNEl_ABSTRACT_

