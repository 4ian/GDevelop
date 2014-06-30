// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MEMBER_FUNCTION_POINTER_KERNEl_ABSTRACT_
#ifdef DLIB_MEMBER_FUNCTION_POINTER_KERNEl_ABSTRACT_

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1 = void,
        typename PARAM2 = void,
        typename PARAM3 = void,
        typename PARAM4 = void
        >
    class member_function_pointer;

// ----------------------------------------------------------------------------------------

    template <>
    class member_function_pointer<void,void,void,void>
    {
        /*!
            INITIAL VALUE
                is_set() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a member function pointer.  It is useful because
                instances of this object can be created without needing to know the type
                of object whose member function we will be calling.

                There are five template specializations of this object.  The first 
                represents a pointer to a member function taking no parameters, the
                second represents a pointer to a member function taking one parameter, 
                the third to one taking two parameters, and so on.

                You specify the parameters to your member function pointer by filling in
                the PARAM template parameters.  For example:

                    To use a pointer to a function with no parameters you would say:
                        member_function_pointer<> my_pointer;
                    To use a pointer to a function that takes a single int you would say:
                        member_function_pointer<int> my_pointer;
                    To use a pointer to a function that takes an int and then a reference
                    to a string you would say:
                        member_function_pointer<int,string&> my_pointer;

                Also note that the formal comments are only present for the first 
                template specialization.  They are all exactly the same except for the 
                number of parameters each takes in its member function pointer.
        !*/

    public:
        typedef void param1_type;
        typedef void param2_type;
        typedef void param3_type;
        typedef void param4_type;

        member_function_pointer (  
        );
        /*!
            ensures                
                - #*this is properly initialized
        !*/

        member_function_pointer(
            const member_function_pointer& item
        );
        /*!
            ensures
                - *this == item
        !*/

        ~member_function_pointer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        member_function_pointer& operator=(
            const member_function_pointer& item
        );
        /*!
            ensures
                - *this == item
        !*/

        bool operator == (
            const member_function_pointer& item
        ) const;
        /*!
            ensures
                - if (is_set() == false && item.is_set() == false) then
                    - returns true
                - else if (both *this and item point to the same member function
                  in the same object instance) then
                    - returns true
                - else
                    - returns false
        !*/

        bool operator != (
            const member_function_pointer& item
        ) const;
        /*!
            ensures
                - returns !(*this == item)
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
        !*/

        bool is_set (
        ) const;
        /*!
            ensures
                - if (this->set() has been called) then
                    - returns true
                - else
                    - returns false
        !*/

        template <
            typename T
            >
        void set (
            T& object,
            void (T::*cb)()
        );
        /*!
            requires
                - cb == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*cb)()
        !*/

        template <
            typename T
            >
        void set (
            const T& object,
            void (T::*cb)()const
        );
        /*!
            requires
                - cb == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*cb)()
        !*/

        operator some_undefined_pointer_type (
        ) const;
        /*!
            ensures
                - if (is_set()) then
                    - returns a non 0 value
                - else
                    - returns a 0 value
        !*/

        bool operator! (
        ) const;
        /*!
            ensures
                - returns !is_set()
        !*/

        void operator () (
        ) const;
        /*!
            requires
                - is_set() == true
            ensures
                - calls the member function on the object specified by the last 
                  call to this->set()
            throws
                - any exception thrown by the member function specified by
                  the previous call to this->set().
                    If any of these exceptions are thrown then the call to this 
                    function will have no effect on *this.                  
        !*/

        void swap (
            member_function_pointer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1
        >
    class member_function_pointer<PARAM1,void,void,void>
    {
    public:
        typedef PARAM1 param1_type;
        typedef void param2_type;
        typedef void param3_type;
        typedef void param4_type;

        member_function_pointer ();

        member_function_pointer(
            const member_function_pointer& item
        );

        ~member_function_pointer (
        );

        member_function_pointer& operator=(
            const member_function_pointer& item
        );

        bool operator == (
            const member_function_pointer& item
        ) const;

        bool operator != (
            const member_function_pointer& item
        ) const;

        void clear();

        bool is_set () const;

        template <typename T>
        void set (
            T& object,
            void (T::*cb)(PARAM1)
        );

        template <typename T>
        void set (
            const T& object,
            void (T::*cb)(PARAM1)const
        );

        operator some_undefined_pointer_type (
        ) const;

        bool operator! (
        ) const;

        void operator () (
            PARAM1 param1
        ) const;

        void swap (
            member_function_pointer& item
        );

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2
        >
    class member_function_pointer<PARAM1,PARAM2,void,void>
    {
    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef void param3_type;
        typedef void param4_type;

        member_function_pointer ();

        member_function_pointer(
            const member_function_pointer& item
        );

        ~member_function_pointer (
        );

        member_function_pointer& operator=(
            const member_function_pointer& item
        );

        bool operator == (
            const member_function_pointer& item
        ) const;

        bool operator != (
            const member_function_pointer& item
        ) const;

        void clear();

        bool is_set () const;

        template <typename T>
        void set (
            T& object,
            void (T::*cb)(PARAM1,PARAM2)
        );

        template <typename T>
        void set (
            const T& object,
            void (T::*cb)(PARAM1,PARAM2)const
        );

        operator some_undefined_pointer_type (
        ) const;

        bool operator! (
        ) const;

        void operator () (
            PARAM1 param1,
            PARAM2 param2
        ) const;

        void swap (
            member_function_pointer& item
        );

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2,
        typename PARAM3
        >
    class member_function_pointer<PARAM1,PARAM2,PARAM3,void>
    {
    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef PARAM3 param3_type;
        typedef void param4_type;

        member_function_pointer ();

        member_function_pointer(
            const member_function_pointer& item
        );

        ~member_function_pointer (
        );

        member_function_pointer& operator=(
            const member_function_pointer& item
        );

        bool operator == (
            const member_function_pointer& item
        ) const;

        bool operator != (
            const member_function_pointer& item
        ) const;

        void clear();

        bool is_set () const;

        template <typename T>
        void set (
            T& object,
            void (T::*cb)(PARAM1,PARAM2,PARAM3)
        );

        template <typename T>
        void set (
            const T& object,
            void (T::*cb)(PARAM1,PARAM2,PARAM3)const
        );

        operator some_undefined_pointer_type (
        ) const;

        bool operator! (
        ) const;

        void operator () (
            PARAM1 param1,
            PARAM2 param2,
            PARAM2 param3
        ) const;

        void swap (
            member_function_pointer& item
        );

    };    

// ----------------------------------------------------------------------------------------

    template <
        typename PARAM1,
        typename PARAM2,
        typename PARAM3,
        typename PARAM4
        >
    class member_function_pointer
    {
    public:
        typedef PARAM1 param1_type;
        typedef PARAM2 param2_type;
        typedef PARAM3 param3_type;
        typedef PARAM4 param4_type;

        member_function_pointer ();

        member_function_pointer(
            const member_function_pointer& item
        );

        ~member_function_pointer (
        );

        member_function_pointer& operator=(
            const member_function_pointer& item
        );

        bool operator == (
            const member_function_pointer& item
        ) const;

        bool operator != (
            const member_function_pointer& item
        ) const;

        void clear();

        bool is_set () const;

        template <typename T>
        void set (
            T& object,
            void (T::*cb)(PARAM1,PARAM2,PARAM3,PARAM4)
        );

        template <typename T>
        void set (
            const T& object,
            void (T::*cb)(PARAM1,PARAM2,PARAM3,PARAM4)const
        );

        operator some_undefined_pointer_type (
        ) const;

        bool operator! (
        ) const;

        void operator () (
            PARAM1 param1,
            PARAM2 param2,
            PARAM2 param3,
            PARAM2 param4
        ) const;

        void swap (
            member_function_pointer& item
        );

    };    

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_MEMBER_FUNCTION_POINTER_KERNEl_ABSTRACT_

