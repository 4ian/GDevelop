// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_HASH_TABLE_KERNEl_ABSTRACT_
#ifdef DLIB_HASH_TABLE_KERNEl_ABSTRACT_

#include "../interfaces/map_pair.h"
#include "../general_hash/general_hash.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include "../algs.h"
#include <functional>

namespace dlib 
{

    template <
        typename domain,
        typename range,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class hash_table : public enumerable<map_pair<domain,range> >,
                       public pair_remover<domain,range>
    {

        /*!
            REQUIREMENTS ON domain
                domain must be comparable by compare where compare is a functor compatible with std::less and
                domain must be hashable by general_hash 
                (general_hash is defined in dlib/general_hash) and 
                domain must be swappable by a global swap() and
                domain must have a default constructor

            REQUIREMENTS ON range
                range must be swappable by a global swap() and
                range must have a default constructor

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap(), count(), and operator[] functions do 
                not invalidate pointers or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0

            ENUMERATION ORDER
                No order is specified.  Only that each element will be visited once
                and only once.
                
            WHAT THIS OBJECT REPRESENTS
                hash_table contains items of type T

                This object represents a data dictionary that is built on top of some 
                kind of hash table.  The number of buckets in the hash table is 
                defined by the constructor argument and is some power of 2.

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
                    
                NOTE:
                    definition of equivalent:
                    a is equivalent to b if
                    a < b == false and
                    b < a == false
        !*/


        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            explicit hash_table(
                unsigned long expnum
            );
            /*!
                requires
                    - expnum < 32
                ensures 
                    - #*this is properly initialized
                    - #*this will use 2^expnum as a suggestion for the initial number
                      of buckets.
                throws
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
            !*/

            virtual ~hash_table(
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
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
                        if this exception is thrown then *this is unusable 
                        until clear() is called and succeeds
            !*/

            unsigned long count (
                const domain& d
            ) const;
            /*!
                ensures
                    - returns the number of elements in the domain of *this that are 
                      equivalent to d
            !*/ 

            void add (
                domain& d,
                range& r
            );
            /*!
                requires
                    - &d != &r (i.e. d and r cannot be the same variable)
                ensures 
                    - adds a mapping between d and r to *this
                    - if (count(d) == 0) then
                        - #*(*this)[d] == r
                    - else
                        - #(*this)[d] != 0
                    - #d and #r have initial values for their types
                    - #count(d) == count(d) + 1
                    - #at_start() == true
                    - #size() == size() + 1
                throws 
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
                        if add() throws then it has no effect
            !*/

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );
            /*!
                requires
                    - (*this)[d] != 0 
                    - &d != &r (i.e. d and r cannot be the same variable) 
                    - &d != &d_copy (i.e. d and d_copy cannot be the same variable) 
                    - &r != &d_copy (i.e. r and d_copy cannot be the same variable) 
                ensures
                    - some element in the domain of *this that is equivalent to d has
                      been removed and swapped into #d_copy.  Additionally, its 
                      associated range element has been removed and swapped into #r.
                    - #count(d) = count(d) - 1
                    - #size() == size() - 1
                    - #at_start() == true  
            !*/

            void destroy (
                const domain& d
            );
            /*!
                requires
                    - (*this)[d] != 0 
                ensures
                    - an element in the domain of *this equivalent to d has been removed.  
                      The element in the range of *this associated with d has also been 
                      removed.
                    - #count(d) == count(d) - 1
                    - #size() == size() - 1
                    - #at_start() == true  
            !*/

            const range* operator[] (
                const domain& d
            ) const;
            /*!
                ensures
                    - if (there is an element in the domain equivalent to d) then
                        - returns a pointer to an element in the range of *this that
                          is associated with an element in the domain of *this 
                          equivalent to d.
                    - else
                        - returns 0
            !*/

            range* operator[] (
                const domain& d
            );
            /*!
                ensures
                    - if (there is an element in the domain equivalent to d) then
                        - returns a pointer to an element in the range of *this that
                          is associated with an element in the domain of *this 
                          equivalent to d.
                    - else
                        - returns 0
            !*/

            void swap (
                hash_table& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

        private:

            // restricted functions
            hash_table(hash_table&);      
            hash_table& operator=(hash_table&);

    };

    template <
        typename domain,
        typename range,
        typename mem_manager
        >
    inline void swap (
        hash_table<domain,range,mem_manager>& a, 
        hash_table<domain,range,mem_manager>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename domain,
        typename range,
        typename mem_manager
        >
    void deserialize (
        hash_table<domain,range,mem_manager>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_HASH_TABLE_KERNEl_ABSTRACT_

