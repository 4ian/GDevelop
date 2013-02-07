// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEQUENCE_KERNEl_ABSTRACT_
#ifdef DLIB_SEQUENCE_KERNEl_ABSTRACT_

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
    class sequence : public enumerable<T>,
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
                swap() and operator[] functions do not invalidate pointers or 
                references to internal data.
                All other functions have no such guarantees.

            ENUMERATION ORDER
                The enumerator will iterate over the elements in the sequence from
                the 0th element to the (size()-1)th element.

            INITIAL VALUE
                size() == 0   
             
            WHAT THIS OBJECT REPRESENTS
                sequence contains items of type T

                This object represents an ordered sequence of items, each item is 
                associated with an integer value.   
                The items are numbered from 0 to size()-1

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            sequence (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            virtual ~sequence (
            ); 
            /*!
                ensures
                    - all memory associated with *this has been released
            !*/

            void clear (
            );
            /*!
                ensures
                    - #*this has its initial value
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if this exception is thrown then *this is unusable 
                        until clear() is called and succeeds
            !*/

            void add (
                unsigned long pos,
                T& item
            );
            /*!
                requires
                    - pos <= size()
                ensures
                    - #size() == size() + 1
                    - #item has an initial value for its type
                    - #operator[](pos) == item
                      i.e. item has been inserted into *this between the elements which
                      were previously at position pos-1 and pos
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        if add() throws then it has no effect
            !*/

            void remove (
                unsigned long pos,
                T& item
            );
            /*!
                requires
                    - pos < size()
                ensures
                    - #size() == size() - 1
                    - the element at the position pos in *this has been removed and 
                      swapped into #item
                    - #at_start() == true
            !*/

            void cat (
                sequence& item
            );
            /*!
                requires
                    - &item != this  (i.e. you can't concatenate a sequence onto itself)
                ensures
                    - item has been concatenated onto the end of *this 
                      i.e. item[0] becomes (#*this)[size()], item[1] 
                      becomes (#*this)[size()+1], etc.
                    - #size() == size() + item.size() 
                    - #item has its initial value 
                    - #at_start() == true
            !*/

            const T& operator[] (
                unsigned long pos
            ) const;
            /*!
                requires
                    - pos < size()
                ensures
                    - returns a const reference to the element at position pos
            !*/
            
            T& operator[] (
                unsigned long pos
            );
            /*!
                requires
                    - pos < size()
                ensures
                    - returns a non-const reference to the element at position pos
            !*/

            void swap (
                sequence& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 


        private:

            // restricted functions
            sequence(sequence&);        // copy constructor
            sequence& operator=(sequence&);    // assignment operator        

    };


    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        sequence<T,mem_manager>& a, 
        sequence<T,mem_manager>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        sequence<T,mem_manager>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_SEQUENCE_KERNEl_ABSTRACT_

