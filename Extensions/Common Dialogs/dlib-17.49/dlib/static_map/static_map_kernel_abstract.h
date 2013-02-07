// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STATIC_MAP_KERNEl_ABSTRACT_
#ifdef DLIB_STATIC_MAP_KERNEl_ABSTRACT_

#include "../interfaces/map_pair.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include <functional>

namespace dlib
{

    template <
        typename domain,
        typename range,
        typename compare = std::less<domain>
        >
    class static_map : public enumerable<map_pair<domain,range> >
    {

        /*!
            REQUIREMENTS ON domain
                domain must be comparable by compare where compare is a functor compatible with std::less and
                domain is swappable by a global swap() and                
                domain must have a default constructor

            REQUIREMENTS ON range
                range is swappable by a global swap() and
                range must have a default constructor

            POINTERS AND REFERENCES TO INTERNAL DATA
                Only the destructor and load_from() will invalidate pointers or 
                references to internal data.  

            INITIAL VALUE
                size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the domain (and each associated
                range element) elements in ascending order according to the compare functor. 
                (i.e. the elements are enumerated in sorted order)

            WHAT THIS OBJECT REPRESENTS
                static_map contains items of type domain and range

                This object is similar an array.  It maps items of type domain on to 
                items of type range.  

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.

            NOTE
                definition of equivalent:
                a is equivalent to b if
                a < b == false and
                b < a == false
        !*/
        
        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;

            static_map (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
            !*/

            virtual ~static_map(
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
                        If this exception is thrown then #*this is unusable 
                        until clear() is called and succeeds.
            !*/

            void load (
                pair_remover<domain,range>& source
            );
            /*!
                ensures                  
                    - #size() == source.size()
                    - #source.size() == 0                    
                    - all the pairs in source are removed and placed into #*this
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by domain's or range's 
                      constructor.
                        If this exception is thrown then the call to load() will have
                        no effect on #*this.
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
                static_map& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 
    
        private:

            // restricted functions
            static_map(static_map&);        // copy constructor
            static_map& operator=(static_map&);    // assignment operator
    };

    template <
        typename domain,
        typename range,
        typename compare
        >
    inline void swap (
        static_map<domain,range,compare>& a, 
        static_map<domain,range,compare>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename domain,
        typename range,
        typename compare
        >
    void deserialize (
        static_map<domain,range,compare>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/
}

#endif // DLIB_STATIC_MAP_KERNEl_ABSTRACT_

