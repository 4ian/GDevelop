// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MAP_KERNEl_ABSTRACT_
#ifdef DLIB_MAP_KERNEl_ABSTRACT_

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
    class map : public enumerable<map_pair<domain,range> >, 
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
                swap(), is_in_domain(), and operator[] functions do not invalidate 
                pointers or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the domain (and each associated
                range element) elements in ascending order according to the compare functor. 
                (i.e. the elements are enumerated in sorted order)

            WHAT THIS OBJECT REPRESENTS
                map contains items of type domain and range

                This object is similar an array.  It maps items of type domain on to 
                items of type range.   

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.

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

            map(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
            !*/

            virtual ~map(
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

            void add (
                domain& d,
                range& r
            );
            /*!
                requires
                    - &d != &r (i.e. d and r cannot be the same variable)
                    - is_in_domain(d)  == false
                ensures
                    - #is_in_domain(d) == true
                    - #operator[](d)   == r
                    - #d and #r have initial values for their types 
                    - #size() == size() + 1
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
                        if add() throws then it has no effect
            !*/

            bool is_in_domain (
                const domain& d
            ) const;
            /*!
                ensures
                    - returns whether or not an element equivalent to d is in the 
                      domain of *this
            !*/

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );
            /*!
                requires
                    - &d != &r (i.e. d and r cannot be the same variable) 
                    - &d != &d_copy (i.e. d and d_copy cannot be the same variable) 
                    - &r != &d_copy (i.e. r and d_copy cannot be the same variable) 
                    - is_in_domain(d) == true
                ensures
                    - #is_in_domain(d) == false 
                    - #d_copy is equivalent to d 
                    - the element in the range of *this associated with #d_copy has been 
                      swapped into #r 
                    - #size() == size() - 1
                    - #at_start() == true
            !*/

            void destroy (
                const domain& d
            );
            /*!
                requires
                    - is_in_domain(d) == true
                ensures
                    - #is_in_domain(d) == false 
                    - #size() == size() - 1
                    - #at_start() == true
            !*/

            range& operator[] (
                const domain& d
            );
            /*!
                requires
                    - is_in_domain(d) == true
                ensures
                    - returns a non-const reference to the element in the range of *this 
                      associated with the element equivalent to d
            !*/

            const range& operator[] (
                const domain& d
            ) const;
            /*!
                requires
                    - is_in_domain(d) == true
                ensures
                    - returns a const reference to the element in the range of *this 
                      associated with the element equivalent to d
            !*/

            void swap (
                map& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

    
        private:

            // restricted functions
            map(map&);        // copy constructor
            map& operator=(map&);    // assignment operator
    };

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    inline void swap (
        map<domain,range,mem_manager,compare>& a, 
        map<domain,range,mem_manager,compare>& b 
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
        map<domain,range,mem_manager,compare>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_MAP_KERNEl_ABSTRACT_

