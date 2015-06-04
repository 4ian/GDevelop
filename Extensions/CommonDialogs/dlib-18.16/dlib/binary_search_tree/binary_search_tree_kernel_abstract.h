// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BINARY_SEARCH_TREE_KERNEl_ABSTRACT_
#ifdef DLIB_BINARY_SEARCH_TREE_KERNEl_ABSTRACT_

#include "../interfaces/map_pair.h"
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
    class binary_search_tree : public enumerable<map_pair<domain,range> >, 
                               public asc_pair_remover<domain,range,compare>
    {

        /*!
            REQUIREMENTS ON domain
                domain must be comparable by compare where compare is a functor compatible with std::less and
                domain is swappable by a global swap() and             
                domain must have a default constructor

            REQUIREMENTS ON range
                range is swappable by a global swap() and
                range must have a default constructor

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.


            POINTERS AND REFERENCES TO INTERNAL DATA
                swap(), count(), height(),  and operator[] functions 
                do not invalidate pointers or references to internal data.

                position_enumerator() invalidates pointers or references to 
                data returned by element() and only by element() (i.e. pointers and
                references returned by operator[] are still valid).

                All other functions have no such guarantees.

            INITIAL VALUE
                size() == 0
                height() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the domain (and each associated
                range element) elements in ascending order according to the compare functor.  
                (i.e. the elements are enumerated in sorted order)              

            WHAT THIS OBJECT REPRESENTS
                this object represents a data dictionary that is built on top of some 
                kind of binary search tree.  It maps objects of type domain to objects
                of type range.  

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

        binary_search_tree(
        );
        /*!
            ensures 
                - #*this is properly initialized
            throws
                - std::bad_alloc or any exception thrown by domain's or range's 
                  constructor.
        !*/

        virtual ~binary_search_tree(
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

        short height (
        ) const;
        /*!
            ensures
                - returns the number of elements in the longest path from the root 
                  of the tree to a leaf
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
                - #count(d) == count(d) - 1
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

        void remove_last_in_order (
            domain& d,
            range& r
        );
        /*!
            requires
                - size() > 0
            ensures
                - the last/biggest (according to the compare functor) element in the domain of *this has
                  been removed and swapped into #d.  The element in the range of *this
                  associated with #d has also been removed and swapped into #r.
                - #count(#d) == count(#d) - 1
                - #size() == size() - 1
                - #at_start() == true
        !*/

        void remove_current_element (
            domain& d,
            range& r
        );
        /*!
            requires
                - current_element_valid() == true
            ensures
                - the current element given by element() has been removed and swapped into d and r.
                - #d == element().key()
                - #r == element().value()
                - #count(#d) == count(#d) - 1
                - #size() == size() - 1
                - moves the enumerator to the next element.  If element() was the last 
                  element in enumeration order then #current_element_valid() == false 
                  and #at_start() == false.
        !*/

        void position_enumerator (
            const domain& d
        ) const;
        /*!
            ensures
                - #at_start() == false
                - if (count(d) > 0) then
                    - #element().key() == d
                - else if (there are any items in the domain of *this that are bigger than 
                  d according to the compare functor) then
                    - #element().key() == the smallest item in the domain of *this that is
                      bigger than d according to the compare functor.
                - else
                    - #current_element_valid() == false
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
            binary_search_tree& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    private:

        // restricted functions
        binary_search_tree(binary_search_tree&);      
        binary_search_tree& operator=(binary_search_tree&);

    };

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    inline void swap (
        binary_search_tree<domain,range,mem_manager,compare>& a, 
        binary_search_tree<domain,range,mem_manager,compare>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void deserialize (
        binary_search_tree<domain,range,mem_manager,compare>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_BINARY_SEARCH_TREE_KERNEl_ABSTRACT_

