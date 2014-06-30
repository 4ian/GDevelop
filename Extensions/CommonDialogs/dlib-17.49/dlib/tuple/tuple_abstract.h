// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TUPLe_ABSTRACT_H_
#ifdef DLIB_TUPLe_ABSTRACT_H_

#include "../algs.h"
#include "../serialize.h"
#include "tuple_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct null_type
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is the default type used as the default
                template argument to the tuple object's template arguments. 

                Also note that it has no state associated with it.
        !*/
    };

    inline void serialize (
        const null_type& ,
        std::ostream&
    ){}
    inline void deserialize (
        null_type& ,
        std::istream&
    ){}
    /*!
        Serialization support is provided for null_type because in some cases 
        it makes your code a little more concise and easier to deal with
        when using tuple objects and serialization.  The serialization literally
        does nothing though.
    !*/

// ----------------------------------------------------------------------------------------

    template < 
        typename T0 = null_type, 
        typename T1 = null_type, 
        typename T2 = null_type, 
        typename T3 = null_type, 
           ... 
        typename T31 = null_type
        >
    class tuple
    {
        /*!
            INITIAL VALUE
                Each object in the tuple is default initialized by its own constructor.
                The tuple object itself does not modify them or add any additional
                state.

            WHAT THIS OBJECT REPRESENTS
                This object represents a container of between 0 and 31 objects 
                where the objects contained are specified in the template
                arguments.

            EXAMPLE
                We can declare a tuple that contains an int, a float, and a char like so:
                tuple<int,float,char> ex;

                Then we can access each of these by their index number.  The index number
                is just the order each type has in the template argument list.  So we have:
                ex.get<0>() = 5;     // assign the int the value 5 
                ex.get<1>() = 3.14;  // assign the float the value 3.14
                ex.get<2>() = 'c';   // assign the char the value 'c'

                Also, since we only have one of each type in this example tuple we can
                unambiguously access each field in the tuple by their types.  So for
                example, we can use this syntax to access our fields:
                ex.get<int>()   // returns 5
                ex.get<float>() // returns 3.14
                ex.get<char>()  // returns 'c'

                We can also get the indexes of each of these fields like so:
                ex.index<int>()   // returns 0 
                ex.index<float>() // returns 1 
                ex.index<char>()  // returns 2 
        !*/

    public:
        // the maximum number of items this tuple template can contain
        const static long max_fields = 32;

        template <long index> 
        struct get_type 
        { 
            typedef (the type of the Tindex template argument) type;
        };

        template <long index> 
        const get_type<index>::type& get (
        ) const;
        /*!
            requires
                - 0 <= index <= 31
            ensures
                - returns a const reference to the index(th) object contained
                  inside this tuple
        !*/

        template <long index>       
        get_type<index>::type& get (
        );
        /*!
            requires
                - 0 <= index <= 31
            ensures
                - returns a non-const reference to the index(th) object contained
                  inside this tuple
        !*/

        template <typename Q>  
        const long index (
        ) const;
        /*!
            requires
                - Q is a type of object contained in this tuple and there is
                  only one object of that type in the tuple
            ensures
                - returns the index of the object in this tuple with type Q
        !*/

        template <typename Q>  
        const Q& get (
        ) const;
        /*!
            requires
                - Q is a type of object contained in this tuple and there is
                  only one object of that type in the tuple
            ensures
                - returns a const reference to the object in this tuple
                  with type Q 
        !*/

        template <typename Q> 
        Q& get (
        ); 
        /*!
            requires
                - Q is a type of object contained in this tuple and there is
                  only one object of that type in the tuple
            ensures
                - returns a non-const reference to the object in this tuple
                  with type Q 
        !*/

        template <typename F>
        void for_each (
            F& funct
        );
        /*!
            requires
                - funct is a templated function object 
            ensures
                - for each item X in this tuple that isn't a null_type object: 
                    - calls funct(X);
        !*/

        template <typename F>
        void for_each (
            F& funct
        ) const;
        /*!
            requires
                - funct is a templated function object 
            ensures
                - for each item X in this tuple that isn't a null_type object: 
                    - calls funct(X);
        !*/

        template <typename F>
        void for_each (
            const F& funct
        );
        /*!
            requires
                - funct is a templated function object 
            ensures
                - for each item X in this tuple that isn't a null_type object: 
                    - calls funct(X);
        !*/

        template <typename F>
        void for_each (
            const F& funct
        ) const;
        /*!
            requires
                - funct is a templated function object 
            ensures
                - for each item X in this tuple that isn't a null_type object: 
                    - calls funct(X);
        !*/

        template <typename F>
        void for_index (
            F& funct,
            long idx
        );
        /*!
            requires
                - funct is a templated function object 
                - 0 <= idx < max_fields && get_type<idx>::type != null_type
                  (i.e. idx must be the index of a non-null_type object in this tuple)
            ensures
                - calls funct(this->get<idx>());
        !*/

        template <typename F>
        void for_index (
            F& funct,
            long idx
        ) const;
        /*!
            requires
                - funct is a templated function object 
                - 0 <= idx < max_fields && get_type<idx>::type != null_type
                  (i.e. idx must be the index of a non-null_type object in this tuple)
            ensures
                - calls funct(this->get<idx>());
        !*/

        template <typename F>
        void for_index (
            const F& funct,
            long idx
        );
        /*!
            requires
                - funct is a templated function object 
                - 0 <= idx < max_fields && get_type<idx>::type != null_type
                  (i.e. idx must be the index of a non-null_type object in this tuple)
            ensures
                - calls funct(this->get<idx>());
        !*/

        template <typename F>
        void for_index (
            const F& funct,
            long idx
        ) const;
        /*!
            requires
                - funct is a templated function object 
                - 0 <= idx < max_fields && get_type<idx>::type != null_type
                  (i.e. idx must be the index of a non-null_type object in this tuple)
            ensures
                - calls funct(this->get<idx>());
        !*/

        void swap (
            tuple& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

        // -------------------------------------------------
        //        global functions for tuple objects
        // -------------------------------------------------

        friend void swap (
            tuple& a, 
            tuple& b 
        ) { a.swap(b); }   
        /*!
            provides a global swap function
        !*/

        friend void serialize (
            const tuple& item, 
            std::ostream& out 
        );   
        /*!
            provides serialization support 
        !*/

        friend void deserialize (
            tuple& item, 
            std::istream& in
        );   
        /*!
            provides deserialization support 
        !*/

    };
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TUPLe_ABSTRACT_H_


