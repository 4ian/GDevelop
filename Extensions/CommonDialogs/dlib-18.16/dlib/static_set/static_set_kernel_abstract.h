// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STATIC_SET_KERNEl_ABSTRACT_
#ifdef DLIB_STATIC_SET_KERNEl_ABSTRACT_

#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include <functional>

namespace dlib
{

    template <
        typename T,
        typename compare = std::less<T>
        >
    class static_set : public enumerable<const T>
    {

        /*!
            REQUIREMENTS ON T
                T must be comparable by compare where compare is a functor compatible with std::less and
                T is swappable by a global swap() and                
                T must have a default constructor

            POINTERS AND REFERENCES TO INTERNAL DATA
                Only the destructor will invalidate pointers or references
                to internal data.  

            INITIAL VALUE
                size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the elements in the set in 
                ascending order according to the compare functor. 
                (i.e. the elements are enumerated in sorted order)

            WHAT THIS OBJECT REPRESENTS
                static_set contains items of type T

                This object represents an unaddressed collection of items. 

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.

            NOTE
                definition of equivalent:
                a is equivalent to b if
                a < b == false and
                b < a == false
        !*/
        
        public:

            typedef T type;
            typedef compare compare_type;

            static_set ( 
            );
            /*!
                ensures  
                    - #*this is properly initialized                   
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
            !*/

            virtual ~static_set(
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
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then #*this is unusable 
                        until clear() is called and succeeds.
            !*/

            void load (
                remover<T>& source
            );
            /*!
                ensures
                    - #size() == source.size()
                    - #source.size() == 0
                    - all the elements in source are removed and placed into #*this
                    - #at_start() == true
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then the call to load() will have
                        no effect on #*this.
            !*/

            bool is_member (
                const T& item
            ) const;
            /*!
                ensures
                    - if (there is an item in *this equivalent to item) then
                        - returns true
                    - else
                        - returns false
            !*/

            void swap (
                static_set& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 
    
        private:

            // restricted functions
            static_set(static_set&);        // copy constructor
            static_set& operator=(static_set&);    // assignment operator
    };

    template <
        typename T,
        typename compare
        >
    inline void swap (
        static_set<T,compare>& a, 
        static_set<T,compare>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename compare
        >
    void deserialize (
        static_set<T,compare>& item,  
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_STATIC_SET_KERNEl_ABSTRACT_

