// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_QUEUE_KERNEl_ABSTRACT_
#ifdef DLIB_QUEUE_KERNEl_ABSTRACT_

#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager
        >
    class queue : public enumerable<T>,
                  public remover<T>
    {

        /*!
            REQUIREMENTS ON T
                T must be swappable by a global swap() 
                T must have a default constructor

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap() and current() functions do not invalidate pointers or 
                references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0    

            ENUMERATION ORDER
                The enumerator will iterate over the elements in the queue in the
                same order they would be removed by repeated calls to dequeue().
                (e.g. current() would be the first element enumerated)

            WHAT THIS OBJECT REPRESENTS
                This is a first in first out queue containing items of type T
                
                e.g. if the queue is {b,c,d,e} and then 'a' is enqueued
                the queue becomes {a,b,c,d,e} and then calling dequeue takes e out
                making the queue {a,b,c,d}

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            queue (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            virtual ~queue (
            ); 
            /*!
                ensures
                    - all memory associated with *this has been released
            !*/

            void clear(
            );
            /*!
                ensures
                    - #*this has its initial value
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if this exception is thrown then *this is unusable 
                        until clear() is called and succeeds
            !*/

            void enqueue (
                T& item
            );
            /*!
                ensures
                    - item is now at the left end of #*this  
                    - #item has an initial value for its type 
                    - #size() == size() + 1
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if enqueue() throws then it has no effect
            !*/

            void dequeue (
                T& item
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - the far right element of *this has been removed and swapped 
                      into #item 
                    - #at_start() == true
            !*/

            void cat (
                queue& item
            );
            /*!
                ensures
                    - item has been concatenated onto the left end of *this. 
                      i.e. item.current() is attached onto the left end of *this and
                      the left most element in item will also be the left most item 
                      in #*this 
                    - #size() == size() + item.size() 
                    - #item has its initial value 
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if cat() throws then the state of #item and *this is undefined
                        until clear() is successfully called on them.
            !*/

            T& current (
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a const reference to the next element to be dequeued.
                      i.e.  the right most element.
            !*/

            const T& current (
            ) const;
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a non-const reference to the next element to be dequeued.
                      i.e.  the right most element.
            !*/
            
            void swap (
                queue& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

        private:

            // restricted functions
            queue(queue&);        // copy constructor
            queue& operator=(queue&);    // assignment operator

    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        queue<T,mem_manager>& a, 
        queue<T,mem_manager>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        queue<T,mem_manager>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_QUEUE_KERNEl_ABSTRACT_

