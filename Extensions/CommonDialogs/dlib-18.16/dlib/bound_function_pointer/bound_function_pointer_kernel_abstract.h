// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BOUND_FUNCTION_POINTER_KERNEl_ABSTRACT_
#ifdef DLIB_BOUND_FUNCTION_POINTER_KERNEl_ABSTRACT_

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class bound_function_pointer
    {
        /*!
            INITIAL VALUE
                is_set() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a function with all its arguments bound to 
                specific objects.  For example:

                    void test(int& var) { var = var+1; }

                    bound_function_pointer funct;

                    int a = 4; 
                    funct.set(test,a); // bind the variable a to the first argument of the test() function 

                    // at this point a == 4
                    funct();
                    // after funct() is called a == 5
        !*/

    public:

        bound_function_pointer (  
        );
        /*!
            ensures                
                - #*this is properly initialized
        !*/

        bound_function_pointer(
            const bound_function_pointer& item
        );
        /*!
            ensures
                - *this == item
        !*/

        ~bound_function_pointer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        bound_function_pointer& operator=(
            const bound_function_pointer& item
        );
        /*!
            ensures
                - *this == item
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
                - calls the bound function on the object(s) specified by the last 
                  call to this->set()
            throws
                - any exception thrown by the function specified by
                  the previous call to this->set().
                    If any of these exceptions are thrown then the call to this 
                    function will have no effect on *this.                  
        !*/

        void swap (
            bound_function_pointer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

        // ----------------------

        template <typename F>
        void set (
            F& function_object
        );
        /*!
            requires
                - function_object() is a valid expression 
            ensures
                - #is_set() == true
                - calls to this->operator() will call function_object()
                  (This seems pointless but it is a useful base case)
        !*/

        template < typename T>
        void set (
            T& object,
            void (T::*funct)()
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)()
        !*/

        template < typename T>
        void set (
            const T& object,
            void (T::*funct)()const
        );
        /*!
            requires
                - funct == a valid bound function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)()
        !*/

        void set (
            void (*funct)()
        );
        /*!
            requires
                - funct == a valid function pointer 
            ensures
                - #is_set() == true
                - calls to this->operator() will call funct()
        !*/

        // ----------------------

        template <typename F, typename A1 >
        void set (
            F& function_object,
            A1& arg1
        );
        /*!
            requires
                - function_object(arg1) is a valid expression 
            ensures
                - #is_set() == true
                - calls to this->operator() will call function_object(arg1)
        !*/

        template < typename T, typename T1, typename A1 >
        void set (
            T& object,
            void (T::*funct)(T1),
            A1& arg1
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1)
        !*/

        template < typename T, typename T1, typename A1 >
        void set (
            const T& object,
            void (T::*funct)(T1)const,
            A1& arg1
        );
        /*!
            requires
                - funct == a valid bound function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1)
        !*/

        template <typename T1, typename A1>
        void set (
            void (*funct)(T1),
            A1& arg1
        );
        /*!
            requires
                - funct == a valid function pointer 
            ensures
                - #is_set() == true
                - calls to this->operator() will call funct(arg1)
        !*/

        // ----------------------
        template <typename F, typename A1, typename A2 >
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2
        );
        /*!
            requires
                - function_object(arg1,arg2) is a valid expression 
            ensures
                - #is_set() == true
                - calls to this->operator() will call function_object(arg1,arg2)
        !*/

        template < typename T, typename T1, typename A1,
                               typename T2, typename A2>
        void set (
            T& object,
            void (T::*funct)(T1,T2),
            A1& arg1,
            A2& arg2
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2)
        !*/

        template < typename T, typename T1, typename A1, 
                               typename T2, typename A2>
        void set (
            const T& object,
            void (T::*funct)(T1,T2)const,
            A1& arg1,
            A2& arg2
        );
        /*!
            requires
                - funct == a valid bound function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2)
        !*/

        template <typename T1, typename A1,
                  typename T2, typename A2>
        void set (
            void (*funct)(T1,T2),
            A1& arg1,
            A2& arg2
        );
        /*!
            requires
                - funct == a valid function pointer 
            ensures
                - #is_set() == true
                - calls to this->operator() will call funct(arg1,arg2)
        !*/

        // ----------------------

        template <typename F, typename A1, typename A2, typename A3 >
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2,
            A3& arg3
        );
        /*!
            requires
                - function_object(arg1,arg2,arg3) is a valid expression 
            ensures
                - #is_set() == true
                - calls to this->operator() will call function_object(arg1,arg2,arg3)
        !*/

        template < typename T, typename T1, typename A1,
                               typename T2, typename A2,
                               typename T3, typename A3>
        void set (
            T& object,
            void (T::*funct)(T1,T2,T3),
            A1& arg1,
            A2& arg2,
            A3& arg3
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2,arg3)
        !*/

        template < typename T, typename T1, typename A1,
                               typename T2, typename A2,
                               typename T3, typename A3>
        void set (
            const T& object,
            void (T::*funct)(T1,T2,T3)const,
            A1& arg1,
            A2& arg2,
            A3& arg3
        );
        /*!
            requires
                - funct == a valid bound function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2,arg3)
        !*/

        template <typename T1, typename A1,
                  typename T2, typename A2,
                  typename T3, typename A3>
        void set (
            void (*funct)(T1,T2,T3),
            A1& arg1,
            A2& arg2,
            A3& arg3
        );
        /*!
            requires
                - funct == a valid function pointer 
            ensures
                - #is_set() == true
                - calls to this->operator() will call funct(arg1,arg2,arg3)
        !*/

        // ----------------------

        template <typename F, typename A1, typename A2, typename A3, typename A4>
        void set (
            F& function_object,
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        );
        /*!
            requires
                - function_object(arg1,arg2,arg3,arg4) is a valid expression 
            ensures
                - #is_set() == true
                - calls to this->operator() will call function_object(arg1,arg2,arg3,arg4)
        !*/

        template < typename T, typename T1, typename A1,
                               typename T2, typename A2,
                               typename T3, typename A3,
                               typename T4, typename A4>
        void set (
            T& object,
            void (T::*funct)(T1,T2,T3,T4),
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        );
        /*!
            requires
                - funct == a valid member function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2,arg3,arg4)
        !*/

        template < typename T, typename T1, typename A1,
                               typename T2, typename A2,
                               typename T3, typename A3,
                               typename T4, typename A4>
        void set (
            const T& object,
            void (T::*funct)(T1,T2,T3,T4)const,
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        );
        /*!
            requires
                - funct == a valid bound function pointer for class T
            ensures
                - #is_set() == true
                - calls to this->operator() will call (object.*funct)(arg1,arg2,arg3,arg4)
        !*/

        template <typename T1, typename A1,
                  typename T2, typename A2,
                  typename T3, typename A3,
                  typename T4, typename A4>
        void set (
            void (*funct)(T1,T2,T3,T4),
            A1& arg1,
            A2& arg2,
            A3& arg3,
            A4& arg4
        );
        /*!
            requires
                - funct == a valid function pointer 
            ensures
                - #is_set() == true
                - calls to this->operator() will call funct(arg1,arg2,arg3,arg4)
        !*/

    };    

// ----------------------------------------------------------------------------------------

    inline void swap (
        bound_function_pointer& a,
        bound_function_pointer& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BOUND_FUNCTION_POINTER_KERNEl_ABSTRACT_

