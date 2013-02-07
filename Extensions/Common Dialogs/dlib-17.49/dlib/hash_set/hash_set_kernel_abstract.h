// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_HASH_SET_KERNEl_ABSTRACT_
#ifdef DLIB_HASH_SET_KERNEl_ABSTRACT_

#include "../general_hash/general_hash.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include "../algs.h"
#include <functional>

namespace dlib
{

    template <
        typename T,
        unsigned long expnum,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<T>
        >
    class hash_set : public enumerable<const T>,
                     public remover<T>
    {

        /*!                
            REQUIREMENTS ON T
                domain must be comparable by compare where compare is a functor compatible with std::less and
                T must be hashable by general_hash
                (general_hash is defined in dlib/general_hash) and 
                T must be swappable by a global swap() and
                T must have a default constructor

            REQUIREMENTS ON expnum
                expnum < 32
                2^expnum is the number of buckets to hash items of type T into. 
                Note that this is really just a suggestion to the hash table.
                Implementations are free to manage the table size however is most
                appropriate.

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap() and is_member() functions do not invalidate 
                pointers or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0    

            ENUMERATION ORDER
                No order is specified.  Only that each element will be visited once
                and only once.

            WHAT THIS OBJECT REPRESENTS
                hash_set contains items of type T

                This object represents an unaddressed collection 
                of items.  Every element in a hash_set is unique.

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.

                definition of equivalent:
                a is equivalent to b if
                a < b == false and
                b < a == false
        !*/
        
        public:

            typedef T type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            hash_set(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            virtual ~hash_set(
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

            void add (
                T& item
            );
            /*!
                requires
                    - is_member(item) == false
                ensures
                    - #is_member(item) == true 
                    - #item has an initial value for its type 
                    - #size() == size() + 1
                    - #at_start() == true
                throws 
                    - std::bad_alloc or any exception thrown by T's constructor
                        if add() throws then it has no effect
            !*/

            bool is_member (
                const T& item
            ) const;
            /*!
                ensures
                    - returns whether or not there is an element in *this equivalent 
                      to item
            !*/

            void remove (
                const T& item,
                T& item_copy
            );
            /*!
                requires
                    - is_member(item) == true 
                    - &item != &item_copy (i.e. item and item_copy cannot be the 
                      same variable) 
                ensures
                    - #is_member(item) == false 
                    - the element in *this equivalent to item has been removed and 
                      swapped into #item_copy 
                    - #size() == size() - 1
                    - #at_start() == true
            !*/

            void destroy (
                const T& item
            );
            /*!
                requires
                    - is_member(item) == true 
                ensures
                    - #is_member(item) == false 
                    - #size() == size() - 1
                    - #at_start() == true
            !*/

            void swap (
                hash_set& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 
    
        private:

            // restricted functions
            hash_set(hash_set&);        // copy constructor
            hash_set& operator=(hash_set&);    // assignment operator

    };

    template <
        typename T,
        unsigned long expnum,
        typename mem_manager,
        typename compare
        >
    inline void swap (
        hash_set<T,expnum,mem_manager,compare>& a, 
        hash_set<T,expnum,mem_manager,compare>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        unsigned long expnum,
        typename mem_manager,
        typename compare
        >
    void deserialize (
        hash_set<T,expnum,mem_manager,compare>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_HASH_SET_KERNEl_ABSTRACT_

