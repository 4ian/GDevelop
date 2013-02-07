// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_REFERENCE_COUNTER_KERNEl_ABSTRACT_
#ifdef DLIB_REFERENCE_COUNTER_KERNEl_ABSTRACT_

#include "../algs.h"

namespace dlib
{

    template <
        typename T,
        typename copy = copy_functor<T>
        >
    class reference_counter
    {

        /*!
            REQUIREMENTS ON T
                T must have a default constructor

            REQUIREMENTS ON copy
                it should be a function object that copies an object of type T. and
                it must have a default constructor and
                operator() should be overloaded as 
                void operator()(const T& source, T& destination);
                copy may throw any exception 

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap() and access() functions do not invalidate pointers or 
                references to internal data.
                All other functions have no such guarantee
  

            INITIAL VALUE
                reference_counter contains one object of type T and
                this object of type T has its initial value

            WHAT THIS OBJECT REPRESENTS
                This object represents a container for an object of type T and 
                provides reference counting capabilities for the object it contains   

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.

        !*/

        public:

            typedef T type;

            reference_counter (
            );
            /*!
                ensures 
                    - #*this is properly initialized
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
            !*/

            reference_counter ( 
                const reference_counter& item
            );
            /*!
                ensures
                    - #access() == item.access()
            !*/

            virtual ~reference_counter (
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

            T& modify (
            );
            /*!
                ensures
                    - returns a non-const reference to the item contained in *this 
                    - the item is ok to modify.  i.e. there are no other references to it
                throws
                    - std::bad_alloc or any exception thrown by T's constructor
                        modify() may throw this exception if there are other references
                        to the item and there is not enough memory to copy it. If modify()
                        throws then it has no effect.    
            !*/

            const T& access (
            ) const;
            /*!
                ensures
                    - returns a const reference to the item contained in *this 
                    - there may be other references to to the item
            !*/

            reference_counter& operator= (
                const reference_counter& rhs
            );
            /*!
                ensures
                    - #access() == rhs.access() 
            !*/

            void swap (
                reference_counter& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

    };

    template <
        typename T,
        typename copy
        >
    inline void swap (
        reference_counter<T,copy>& a, 
        reference_counter<T,copy>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_REFERENCE_COUNTER_KERNEl_ABSTRACT_

