// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STACK_KERNEl_ABSTRACT_
#ifdef DLIB_STACK_KERNEl_ABSTRACT_

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
    class stack : public enumerable<T>,
                  public remover<T>
    {

        /*!
            REQUIREMENTS ON T
                T must be swappable by a global swap() and
                T must have a default constructor

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap() and current() functions do not invalidate pointers 
                or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0    
            
            ENUMERATION ORDER
                The enumerator will iterate over the elements in the stack in the
                same order they would be removed in by repeated calls to pop().
                (e.g. current() would be the first element enumerated)

            WHAT THIS OBJECT REPRESENTS
                This is a last in first out stack containing items of type T.
                
                e.g. if the stack is {b,c,d,e} then a is put in
                the stack becomes {a,b,c,d,e} and then pop takes a back out
                returning the stack to {b,c,d,e}

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            stack (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            virtual ~stack (
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

            void push (
                T& item
            );
            /*!
                ensures
                    - item has been swapped onto the top of the stack
                    - #current() == item
                    - #item has an initial value for its type 
                    - #size() == size() + 1
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if push() throws then it has no effect
            !*/

            void pop (
                T& item
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - #size() == size() - 1
                    - #item   == current()
                      i.e. the top element of *this has been removed and swapped 
                      into #item
                    - #at_start() == true
            !*/

            T& current (
            );
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a const reference to the element at the top of *this
            !*/

            const T& current (
            ) const;
            /*!
                requires
                    - size() != 0
                ensures
                    - returns a non-const reference to the element at the top of *this
            !*/
            
            void swap (
                stack& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 


        private:

            // restricted functions
            stack(stack&);        // copy constructor
            stack& operator=(stack&);    // assignment operator

    };


    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        stack<T,mem_manager>& a, 
        stack<T,mem_manager>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        stack<T,mem_manager>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_STACK_KERNEl_ABSTRACT_

