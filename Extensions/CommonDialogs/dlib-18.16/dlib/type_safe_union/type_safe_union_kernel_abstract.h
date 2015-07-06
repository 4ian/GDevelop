// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TYPE_SAFE_UNION_KERNEl_ABSTRACT_
#ifdef DLIB_TYPE_SAFE_UNION_KERNEl_ABSTRACT_

#include "../algs.h"
#include "../noncopyable.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class bad_type_safe_union_cast : public std::bad_cast 
    {
        /*!
            This is the exception object thrown by type_safe_union::cast_to() if the
            type_safe_union does not contain the type of object being requested.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T1,
        typename T2 = _void,  // _void indicates parameter not used.
        typename T3 = _void,
        typename T4 = _void,
        typename T5 = _void, 
        typename T6 = _void,
        typename T7 = _void,
        typename T8 = _void,
        typename T9 = _void,
        typename T10 = _void,
        typename T11 = _void,
        typename T12 = _void,
        typename T13 = _void,
        typename T14 = _void,
        typename T15 = _void,
        typename T16 = _void,
        typename T17 = _void,
        typename T18 = _void,
        typename T19 = _void,
        typename T20 = _void
        >
    class type_safe_union : noncopyable
    {
        /*!
            REQUIREMENTS ON ALL TEMPLATE ARGUMENTS
                All template arguments must be default constructable and have
                a global swap.

            INITIAL VALUE
                - is_empty() == true
                - contains<U>() == false, for all possible values of U

            WHAT THIS OBJECT REPRESENTS 
                This object is a type safe analogue of the classic C union object. 
                The type_safe_union, unlike a union, can contain non-POD types such 
                as std::string.  

                For example:
                    union my_union
                    {
                        int a;
                        std::string b;   // Error, std::string isn't a POD
                    };

                    type_safe_union<int,std::string> my_type_safe_union;  // No error
        !*/

    public:

        typedef T1 type1;
        typedef T2 type2;
        typedef T3 type3;
        typedef T4 type4;
        typedef T5 type5;
        typedef T6 type6;
        typedef T7 type7;
        typedef T8 type8;
        typedef T9 type9;
        typedef T10 type10;
        typedef T11 type11;
        typedef T12 type12;
        typedef T13 type13;
        typedef T14 type14;
        typedef T15 type15;
        typedef T16 type16;
        typedef T17 type17;
        typedef T18 type18;
        typedef T19 type19;
        typedef T20 type20;

        type_safe_union(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <typename T>
        type_safe_union (
            const T& item
        );
        /*!
            requires
                - T must be one of the types given to this object's template arguments
            ensures
                - this object is properly initialized
                - #get<T>() == item
                  (i.e. this object will contain a copy of item)
        !*/

        ~type_safe_union(
        );
        /*!
            ensures
                - all resources associated with this object have been freed
        !*/

        template <typename T>
        static int get_type_id (
        );
        /*!
           ensures
              - if (T is the same type as one of the template arguments) then
                 - returns a number indicating which template argument it is.
                   (e.g. if T is the same type as T3 then this function returns 3)
               - else
                  - returns -1
        !*/

        template <typename T>
        bool contains (
        ) const;
        /*!
            ensures
                - if (this type_safe_union currently contains an object of type T) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_empty (
        ) const;
        /*!
            ensures
                - if (this type_safe_union currently contains any object at all) then
                    - returns true
                - else
                    - returns false
        !*/

        template <typename T>
        void apply_to_contents (
            T& obj
        );
        /*!
            requires
                - obj is a function object capable of operating on all the types contained
                  in this type_safe_union.  I.e.  obj(this->get<U>()) must be a valid
                  expression for all the possible U types.
            ensures
                - if (is_empty() == false) then
                    - Let U denote the type of object currently contained in this type_safe_union
                    - calls obj(this->get<U>())
                    - The object returned by this->get<U>() will be non-const
        !*/

        template <typename T>
        void apply_to_contents (
            const T& obj
        );
        /*!
            requires
                - obj is a function object capable of operating on all the types contained
                  in this type_safe_union.  I.e.  obj(this->get<U>()) must be a valid
                  expression for all the possible U types.
            ensures
                - if (is_empty() == false) then
                    - Let U denote the type of object currently contained in this type_safe_union
                    - calls obj(this->get<U>())
                    - The object returned by this->get<U>() will be non-const
        !*/

        template <typename T>
        void apply_to_contents (
            T& obj
        ) const;
        /*!
            requires
                - obj is a function object capable of operating on all the types contained
                  in this type_safe_union.  I.e.  obj(this->get<U>()) must be a valid
                  expression for all the possible U types.
            ensures
                - if (is_empty() == false) then
                    - Let U denote the type of object currently contained in this type_safe_union
                    - calls obj(this->get<U>())
                    - The object returned by this->get<U>() will be const
        !*/

        template <typename T>
        void apply_to_contents (
            const T& obj
        ) const;
        /*!
            requires
                - obj is a function object capable of operating on all the types contained
                  in this type_safe_union.  I.e.  obj(this->get<U>()) must be a valid
                  expression for all the possible U types.
            ensures
                - if (is_empty() == false) then
                    - Let U denote the type of object currently contained in this type_safe_union
                    - calls obj(this->get<U>())
                    - The object returned by this->get<U>() will be const
        !*/

        template <typename T> 
        T& get(
        );
        /*!
            requires
                - T must be one of the types given to this object's template arguments
            ensures
                - #is_empty() == false
                - #contains<T>() == true
                - if (contains<T>() == true)
                    - returns a non-const reference to the object contained in this type_safe_union.
                - else
                    - Constructs an object of type T inside *this
                    - Any previous object stored in this type_safe_union is destructed and its
                      state is lost.
                    - returns a non-const reference to the newly created T object.
        !*/

        template <typename T>
        const T& cast_to (
        ) const;
        /*!
            requires
                - T must be one of the types given to this object's template arguments
            ensures
                - if (contains<T>() == true) then
                    - returns a const reference to the object contained in this type_safe_union.
                - else
                    - throws bad_type_safe_union_cast
        !*/

        template <typename T>
        T& cast_to (
        );
        /*!
            requires
                - T must be one of the types given to this object's template arguments
            ensures
                - if (contains<T>() == true) then
                    - returns a non-const reference to the object contained in this type_safe_union.
                - else
                    - throws bad_type_safe_union_cast
        !*/

        template <typename T>
        type_safe_union& operator= (
            const T& item
        );
        /*!
            requires
                - T must be one of the types given to this object's template arguments
            ensures
                - #get<T>() == item
                  (i.e. this object will contain a copy of item)
                - returns *this
        !*/

        void swap (
            type_safe_union& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template < ...  >
    inline void swap (
        type_safe_union<...>& a, 
        type_safe_union<...>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template < ... >
    void serialize (
        const type_safe_union<...>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 

        Note that type_safe_union objects are serialized as follows:
         - if (item.is_empty()) then
            - perform: serialize(0, out)
         - else
            - perform: serialize(item.get_type_id<type_of_object_in_item>(), out);
                       serialize(item.get<type_of_object_in_item>(), out);
    !*/

    template < ...  >
    void deserialize (
        type_safe_union<...>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TYPE_SAFE_UNION_KERNEl_ABSTRACT_

