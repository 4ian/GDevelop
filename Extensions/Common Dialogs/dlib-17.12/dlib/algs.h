// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ALGs_
#define DLIB_ALGs_

// this file contains miscellaneous stuff                      


#ifdef _MSC_VER
// Disable the following warnings for Visual Studio

// this is to disable the "'this' : used in base member initializer list"
// warning you get from some of the GUI objects since all the objects
// require that their parent class be passed into their constructor. 
// In this case though it is totally safe so it is ok to disable this warning.
#pragma warning(disable : 4355)

// This is a warning you get sometimes when Visual Studio performs a Koenig Lookup. 
// This is a bug in visual studio.  It is a totally legitimate thing to 
// expect from a compiler. 
#pragma warning(disable : 4675)

// This is a warning you get from visual studio 2005 about things in the standard C++
// library being "deprecated."  I checked the C++ standard and it doesn't say jack 
// about any of them (I checked the searchable PDF).   So this warning is total Bunk.
#pragma warning(disable : 4996)

// This is a warning you get from visual studio 2003:
//    warning C4345: behavior change: an object of POD type constructed with an initializer 
//    of the form () will be default-initialized.
// I love it when this compiler gives warnings about bugs in previous versions of itself. 
#pragma warning(disable : 4345)


// Disable warnings about conversion from size_t to unsigned long and long.
#pragma warning(disable : 4267)

#endif

#ifdef __BORLANDC__
// Disable the following warnings for the Borland Compilers
//
// These warnings just say that the compiler is refusing to inline functions with
// loops or try blocks in them.  
//
#pragma option -w-8027
#pragma option -w-8026 
#endif

#include <string>       // for the exceptions

#ifdef __CYGWIN__
namespace std
{
   typedef std::basic_string<wchar_t> wstring;
}
#endif



#include <algorithm>    // for std::swap
#include <new>          // for std::bad_alloc
#include <cstdlib>
#include "platform.h"
#include "assert.h"
#include "error.h"
#include "noncopyable.h"
#include "enable_if.h"
#include "uintn.h"



// ----------------------------------------------------------------------------------------
/*!A _dT !*/

template <typename charT>
inline charT _dTcast (const char a, const wchar_t b);
template <>
inline char _dTcast<char> (const char a, const wchar_t ) { return a; }
template <>
inline wchar_t _dTcast<wchar_t> (const char , const wchar_t b) { return b; }

template <typename charT>
inline const charT* _dTcast ( const char* a, const wchar_t* b);
template <>
inline const char* _dTcast<char> ( const char* a, const wchar_t* ) { return a; }
template <>
inline const wchar_t* _dTcast<wchar_t> ( const char* , const wchar_t* b) { return b; }


#define _dT(charT,str) _dTcast<charT>(str,L##str) 
/*!
    requires
        - charT == char or wchar_t
        - str == a string or character literal
    ensures
        - returns the literal in the form of a charT type literal.
!*/

// ----------------------------------------------------------------------------------------



namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!A swap !*/
    // make swap available in the dlib namespace
    using std::swap;

// ----------------------------------------------------------------------------------------

    /*!
        Here is where I define my return codes.  It is 
        important that they all be < 0.
    !*/

    enum general_return_codes
    {
        TIMEOUT     = -1,
        WOULDBLOCK  = -2,
        OTHER_ERROR = -3,
        SHUTDOWN    = -4,
        PORTINUSE   = -5
    };

// ----------------------------------------------------------------------------------------

    inline unsigned long square_root (
        unsigned long value
    )
    /*!
        requires
            - value <= 2^32 - 1
        ensures
            - returns the square root of value.  if the square root is not an
                integer then it will be rounded up to the nearest integer.
    !*/
    {
        unsigned long x;

        // set the initial guess for what the root is depending on 
        // how big value is
        if (value < 3)
            return value;
        else if (value < 4096) // 12
            x = 45;
        else if (value < 65536) // 16
            x = 179;
        else if (value < 1048576) // 20
            x = 717;
        else if (value < 16777216) // 24
            x = 2867;
        else if (value < 268435456) // 28
            x = 11469;
        else   // 32
            x = 45875;



        // find the root
        x = (x + value/x)>>1;
        x = (x + value/x)>>1;
        x = (x + value/x)>>1;
        x = (x + value/x)>>1;



        if (x*x < value)
            return x+1;
        else
            return x;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >    
    void median (
        T& one,
        T& two,
        T& three
    );
    /*!
        requires
            - T implements operator< 
            - T is swappable by a global swap()
        ensures
            - #one is the median 
            - #one, #two, and #three is some permutation of one, two, and three.  
    !*/
    
    
    template <
        typename T
        >
    void median (
        T& one,
        T& two,
        T& three
    )    
    {    
        using std::swap;
        using dlib::swap;

        if ( one < two )
        {
            // one < two
            if ( two < three )
            {
                // one < two < three : two
                swap(one,two);
                
            }
            else
            {
                // one < two >= three
                if ( one < three)
                {
                    // three
                    swap(three,one);
                }
            }
            
        }
        else
        {
            // one >= two
            if ( three < one )
            {
                // three <= one >= two
                if ( three < two )
                {
                    // two
                    swap(two,one);
                }
                else
                {
                    // three
                    swap(three,one);
                }
            }
        }        
    }

// ----------------------------------------------------------------------------------------

    namespace relational_operators
    {
        template <
            typename A,
            typename B
            >
        bool operator> (
            const A& a,
            const B& b
        ) { return b < a; }

    // ---------------------------------

        template <
            typename A,
            typename B
            >
        bool operator!= (
            const A& a,
            const B& b
        ) { return !(a == b); }

    // ---------------------------------

        template <
            typename A,
            typename B
            >
        bool operator<= (
            const A& a,
            const B& b
        ) { return !(b < a); }

    // ---------------------------------

        template <
            typename A,
            typename B
            >
        bool operator>= (
            const A& a,
            const B& b
        ) { return !(a < b); }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void exchange (
        T& a,
        T& b
    )
    /*!
        This function does the exact same thing that global swap does and it does it by
        just calling swap.  But a lot of compilers have problems doing a Koenig Lookup
        and the fact that this has a different name (global swap has the same name as
        the member functions called swap) makes them compile right.

        So this is a workaround but not too ugly of one.  But hopefully I get get
        rid of this in a few years.  So this function is alredy deprecated. 

        This also means you should NOT use this function in your own code unless
        you have to support an old buggy compiler that benefits from this hack.
    !*/
    {
        using std::swap;
        using dlib::swap;
        swap(a,b);
    }

// ----------------------------------------------------------------------------------------

    /*!A is_pointer_type

        This is a template where is_pointer_type<T>::value == true when T is a pointer 
        type ane false otherwise.
    !*/

    template <
        typename T
        >
    class is_pointer_type
    {
    public:
        enum { value = false };
    private:
        is_pointer_type();
    };

    template <
        typename T
        >
    class is_pointer_type<T*>
    {
    public:
        enum { value = true };
    private:
        is_pointer_type();
    };

// ----------------------------------------------------------------------------------------

    /*!A is_const_type

        This is a template where is_const_type<T>::value == true when T is a const 
        type ane false otherwise.
    !*/

    template <typename T>
    struct is_const_type
    {
        static const bool value = false;
    };
    template <typename T>
    struct is_const_type<const T>
    {
        static const bool value = true;
    };

// ----------------------------------------------------------------------------------------

    /*!A is_same_type 

        This is a template where is_same_type<T,U>::value == true when T and U are the
        same type and false otherwise.   
    !*/

    template <
        typename T,
        typename U
        >
    class is_same_type
    {
    public:
        enum {value = false};
    private:
        is_same_type();
    };

    template <typename T>
    class is_same_type<T,T>
    {
    public:
        enum {value = true};
    private:
        is_same_type();
    };

// ----------------------------------------------------------------------------------------

    /*!A is_signed_type 

        This is a template where is_signed_type<T>::value == true when T is a signed
        integral type and false when T is an unsigned integral type.
    !*/
    template <
        typename T
        >
    struct is_signed_type
    {
        static const bool value = static_cast<T>((static_cast<T>(0)-static_cast<T>(1))) < 0;
    };

// ----------------------------------------------------------------------------------------

    /*!A is_unsigned_type 

        This is a template where is_unsigned_type<T>::value == true when T is an unsigned
        integral type and false when T is a signed integral type.
    !*/
    template <
        typename T
        >
    struct is_unsigned_type
    {
        static const bool value = static_cast<T>((static_cast<T>(0)-static_cast<T>(1))) > 0;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class copy_functor
    {
    public:
        void operator() (
            const T& source, 
            T& destination
        ) const
        {
            destination = source;
        }
    };

// ----------------------------------------------------------------------------------------

    /*!A static_switch

        To use this template you give it some number of boolean expressions and it
        tells you which one of them is true.   If more than one of them is true then
        it causes a compile time error.

        for example:
            static_switch<1 + 1 == 2, 4 - 1 == 4>::value == 1  // because the first expression is true
            static_switch<1 + 1 == 3, 4 == 4>::value == 2      // because the second expression is true
            static_switch<1 + 1 == 3, 4 == 5>::value == 0      // 0 here because none of them are true 
            static_switch<1 + 1 == 2, 4 == 4>::value == compiler error  // because more than one expression is true 
    !*/

    template < bool v1 = 0, bool v2 = 0, bool v3 = 0, bool v4 = 0, bool v5 = 0,
               bool v6 = 0, bool v7 = 0, bool v8 = 0, bool v9 = 0, bool v10 = 0, 
               bool v11 = 0, bool v12 = 0, bool v13 = 0, bool v14 = 0, bool v15 = 0 >
    struct static_switch; 

    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,0,0,0,0,0> { const static int value = 0; };
    template <> struct static_switch<1,0,0,0,0,0,0,0,0,0,0,0,0,0,0> { const static int value = 1; };
    template <> struct static_switch<0,1,0,0,0,0,0,0,0,0,0,0,0,0,0> { const static int value = 2; };
    template <> struct static_switch<0,0,1,0,0,0,0,0,0,0,0,0,0,0,0> { const static int value = 3; };
    template <> struct static_switch<0,0,0,1,0,0,0,0,0,0,0,0,0,0,0> { const static int value = 4; };
    template <> struct static_switch<0,0,0,0,1,0,0,0,0,0,0,0,0,0,0> { const static int value = 5; };
    template <> struct static_switch<0,0,0,0,0,1,0,0,0,0,0,0,0,0,0> { const static int value = 6; };
    template <> struct static_switch<0,0,0,0,0,0,1,0,0,0,0,0,0,0,0> { const static int value = 7; };
    template <> struct static_switch<0,0,0,0,0,0,0,1,0,0,0,0,0,0,0> { const static int value = 8; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,1,0,0,0,0,0,0> { const static int value = 9; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,1,0,0,0,0,0> { const static int value = 10; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,1,0,0,0,0> { const static int value = 11; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,0,1,0,0,0> { const static int value = 12; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,0,0,1,0,0> { const static int value = 13; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,0,0,0,1,0> { const static int value = 14; };
    template <> struct static_switch<0,0,0,0,0,0,0,0,0,0,0,0,0,0,1> { const static int value = 15; };

// ----------------------------------------------------------------------------------------
    /*!A is_built_in_scalar_type
        
        This is a template that allows you to determine if the given type is a built
        in scalar type such as an int, char, float, short, etc...

        For example, is_built_in_scalar_type<char>::value == true
        For example, is_built_in_scalar_type<std::string>::value == false 
    !*/

    template <typename T> struct is_built_in_scalar_type        { const static bool value = false; };

    template <> struct is_built_in_scalar_type<float>           { const static bool value = true; };
    template <> struct is_built_in_scalar_type<double>          { const static bool value = true; };
    template <> struct is_built_in_scalar_type<long double>     { const static bool value = true; };
    template <> struct is_built_in_scalar_type<short>           { const static bool value = true; };
    template <> struct is_built_in_scalar_type<int>             { const static bool value = true; };
    template <> struct is_built_in_scalar_type<long>            { const static bool value = true; };
    template <> struct is_built_in_scalar_type<unsigned short>  { const static bool value = true; };
    template <> struct is_built_in_scalar_type<unsigned int>    { const static bool value = true; };
    template <> struct is_built_in_scalar_type<unsigned long>   { const static bool value = true; };
    template <> struct is_built_in_scalar_type<uint64>          { const static bool value = true; };
    template <> struct is_built_in_scalar_type<char>            { const static bool value = true; };
    template <> struct is_built_in_scalar_type<signed char>     { const static bool value = true; };
    template <> struct is_built_in_scalar_type<unsigned char>   { const static bool value = true; };
    // Don't define one for wchar_t when using a version of visual studio
    // older than 8.0 (visual studio 2005) since before then they improperly set
    // wchar_t to be a typedef rather than its own type as required by the C++ 
    // standard.
#if !defined(_MSC_VER) || _NATIVE_WCHAR_T_DEFINED
    template <> struct is_built_in_scalar_type<wchar_t>         { const static bool value = true; };
#endif

// ----------------------------------------------------------------------------------------
    
    /*!A assign_zero_if_built_in_scalar_type

        This function assigns its argument the value of 0 if it is a built in scalar
        type according to the is_built_in_scalar_type<> template.  If it isn't a
        built in scalar type then it does nothing.
    !*/

    template <typename T> inline typename disable_if<is_built_in_scalar_type<T>,void>::type assign_zero_if_built_in_scalar_type (T&){}
    template <typename T> inline typename enable_if<is_built_in_scalar_type<T>,void>::type assign_zero_if_built_in_scalar_type (T& a){a=0;}

// ----------------------------------------------------------------------------------------

    template <typename T>
    T put_in_range (
        const T& a, 
        const T& b, 
        const T& val
    )
    /*!
        requires
            - T is a type that looks like double, float, int, or so forth
        ensures
            - if (val is within the range [a,b]) then
                - returns val
            - else 
                - returns the end of the range [a,b] that is closest to val
    !*/
    {
        if (a < b)
        {
            if (val < a)
                return a;
            else if (val > b)
                return b;
        }
        else
        {
            if (val < b)
                return b;
            else if (val > a)
                return a;
        }

        return val;
    }

    // overload for double 
    inline double put_in_range(const double& a, const double& b, const double& val)
    { return put_in_range<double>(a,b,val); }

// ----------------------------------------------------------------------------------------

    /*!A is_function 
        
        This is a template that allows you to determine if the given type is a function.

        For example,
            void funct();

            is_built_in_scalar_type<funct>::value == true
            is_built_in_scalar_type<int>::value == false 
    !*/

    template <typename T> struct is_function { static const bool value = false; };
    template <typename T> 
    struct is_function<T (void)> { static const bool value = true; };
    template <typename T, typename A0> 
    struct is_function<T (A0)> { static const bool value = true; };
    template <typename T, typename A0, typename A1> 
    struct is_function<T (A0, A1)> { static const bool value = true; };
    template <typename T, typename A0, typename A1, typename A2> 
    struct is_function<T (A0, A1, A2)> { static const bool value = true; };
    template <typename T, typename A0, typename A1, typename A2, typename A3> 
    struct is_function<T (A0, A1, A2, A3)> { static const bool value = true; };
    template <typename T, typename A0, typename A1, typename A2, typename A3, typename A4> 
    struct is_function<T (A0, A1, A2, A3, A4)> { static const bool value = true; };


    template <typename T> class funct_wrap0
    {
    public:
        funct_wrap0(T (&f_)()):f(f_){}
        T operator()() const { return f(); }
    private:
        T (&f)();
    };
    template <typename T, typename A0> class funct_wrap1
    {
    public:
        funct_wrap1(T (&f_)(A0)):f(f_){}
        T operator()(A0 a0) const { return f(a0); }
    private:
        T (&f)(A0);
    };
    template <typename T, typename A0, typename A1> class funct_wrap2
    {
    public:
        funct_wrap2(T (&f_)(A0,A1)):f(f_){}
        T operator()(A0 a0, A1 a1) const { return f(a0,a1); }
    private:
        T (&f)(A0,A1);
    };
    template <typename T, typename A0, typename A1, typename A2> class funct_wrap3
    {
    public:
        funct_wrap3(T (&f_)(A0,A1,A2)):f(f_){}
        T operator()(A0 a0, A1 a1, A2 a2) const { return f(a0,a1,a2); }
    private:
        T (&f)(A0,A1,A2);
    };
    template <typename T, typename A0, typename A1, typename A2, typename A3> class funct_wrap4
    {
    public:
        funct_wrap4(T (&f_)(A0,A1,A2,A3)):f(f_){}
        T operator()(A0 a0, A1 a1, A2 a2, A3 a3) const { return f(a0,a1,a2,a3); }
    private:
        T (&f)(A0,A1,A2,A3);
    };
    template <typename T, typename A0, typename A1, typename A2, typename A3, typename A4> class funct_wrap5
    {
    public:
        funct_wrap5(T (&f_)(A0,A1,A2,A3,A4)):f(f_){}
        T operator()(A0 a0, A1 a1, A2 a2, A3 a3, A4 a4) const { return f(a0,a1,a2,a3,a4); }
    private:
        T (&f)(A0,A1,A2,A3,A4);
    };

    /*!A wrap_function 
        
        This is a template that allows you to turn a global function into a 
        function object.  The reason for this templates existance is so you can
        do stuff like this:
            
            template <typename T>
            void call_funct(const T& funct)
            {  cout << funct(); }

            std::string test() { return "asdfasf"; }

            int main()
            {
                call_funct(wrap_function(test));
            }

        The above code doesn't work right on some compilers if you don't
        use wrap_function.  
    !*/

    template <typename T>
    funct_wrap0<T> wrap_function(T (&f)()) { return funct_wrap0<T>(f); }
    template <typename T, typename A0>
    funct_wrap1<T,A0> wrap_function(T (&f)(A0)) { return funct_wrap1<T,A0>(f); }
    template <typename T, typename A0, typename A1>
    funct_wrap2<T,A0,A1> wrap_function(T (&f)(A0, A1)) { return funct_wrap2<T,A0,A1>(f); }
    template <typename T, typename A0, typename A1, typename A2>
    funct_wrap3<T,A0,A1,A2> wrap_function(T (&f)(A0, A1, A2)) { return funct_wrap3<T,A0,A1,A2>(f); }
    template <typename T, typename A0, typename A1, typename A2, typename A3>
    funct_wrap4<T,A0,A1,A2,A3> wrap_function(T (&f)(A0, A1, A2, A3)) { return funct_wrap4<T,A0,A1,A2,A3>(f); }
    template <typename T, typename A0, typename A1, typename A2, typename A3, typename A4>
    funct_wrap5<T,A0,A1,A2,A3,A4> wrap_function(T (&f)(A0, A1, A2, A3, A4)) { return funct_wrap5<T,A0,A1,A2,A3,A4>(f); }

}

#endif // DLIB_ALGs_








