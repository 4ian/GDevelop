// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ANY_FUNCTION_RETURN
#error "You aren't supposed to directly #include this file.  #include <dlib/any.h> instead."  
#endif

#ifdef _MSC_VER
// When using visual studio 2012, disable the warning "warning C4180: qualifier applied to function type has no meaning; ignored"
// that you get about some template expansions applying & to function types. 
#pragma warning(disable : 4180)
#endif

#ifdef DLIB_ANY_FUNCTION_RETURN

// This file contains the body of the any_function class.  We use the
// preprocessor to generate many different versions.  There are 
// versions which return a value and those which return void.  For
// each of these types there are versions with differing numbers
// of arguments. 

public:
typedef typename sig_traits<function_type>::result_type result_type;
typedef typename sig_traits<function_type>::arg1_type arg1_type;
typedef typename sig_traits<function_type>::arg2_type arg2_type;
typedef typename sig_traits<function_type>::arg3_type arg3_type;
typedef typename sig_traits<function_type>::arg4_type arg4_type;
typedef typename sig_traits<function_type>::arg5_type arg5_type;
typedef typename sig_traits<function_type>::arg6_type arg6_type;
typedef typename sig_traits<function_type>::arg7_type arg7_type;
typedef typename sig_traits<function_type>::arg8_type arg8_type;
typedef typename sig_traits<function_type>::arg9_type arg9_type;
typedef typename sig_traits<function_type>::arg10_type arg10_type;
const static unsigned long num_args = sig_traits<function_type>::num_args;

any_function()
{
}

any_function (
    const any_function& item
)
{
    if (item.data)
    {
        item.data->copy_to(data);
    }
}

template <typename T>
any_function (
    const T& item
)
{
    typedef typename basic_type<T>::type U;
    data.reset(new derived<U,function_type>(item));
}

void clear (
)
{
    data.reset();
}

template <typename T>
bool contains (
) const
{
    typedef typename basic_type<T>::type U;
    return dynamic_cast<derived<U,function_type>*>(data.get()) != 0;
}

bool is_empty(
) const
{
    return data.get() == 0;
}

bool is_set(
) const
{
    return !is_empty();
}

template <typename T>
T& cast_to(
) 
{
    typedef typename basic_type<T>::type U;
    derived<U,function_type>* d = dynamic_cast<derived<U,function_type>*>(data.get());
    if (d == 0)
    {
        throw bad_any_cast();
    }

    return d->item;
}

template <typename T>
const T& cast_to(
) const
{
    typedef typename basic_type<T>::type U;
    derived<U,function_type>* d = dynamic_cast<derived<U,function_type>*>(data.get());
    if (d == 0)
    {
        throw bad_any_cast();
    }

    return d->item;
}

template <typename T>
T& get(
) 
{
    typedef typename basic_type<T>::type U;
    derived<U,function_type>* d = dynamic_cast<derived<U,function_type>*>(data.get());
    if (d == 0)
    {
        d = new derived<U,function_type>();
        data.reset(d);
    }

    return d->item;
}

any_function& operator= (
    const any_function& item
)
{
    any_function(item).swap(*this);
    return *this;
}

void swap (
    any_function& item
)
{
    data.swap(item.data);
}

result_type operator()(DLIB_ANY_FUNCTION_ARG_LIST) const 
{ validate(); DLIB_ANY_FUNCTION_RETURN data->evaluate(DLIB_ANY_FUNCTION_ARGS); }
/* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    If you are getting an error on the above line then it means you
    have attempted to call a dlib::any_function but you have supplied 
    arguments which don't match the function signature used by the
    dlib::any_function. 
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/

private:

void validate () const
{
    // make sure requires clause is not broken
    DLIB_ASSERT(is_empty() == false,
        "\t result_type any_function::operator()"
        << "\n\t You can't call operator() on an empty any_function"
        << "\n\t this: " << this
        );
}


template <typename FT>
struct Tbase
{
    virtual ~Tbase() {}
    virtual result_type evaluate () const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1
    >
struct Tbase<T (A1)>
{
    virtual ~Tbase() {}
    virtual T evaluate ( A1) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2
    >
struct Tbase<T (A1,A2)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3
    >
struct Tbase<T (A1,A2,A3)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4
    >
struct Tbase<T (A1,A2,A3,A4)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5
    >
struct Tbase<T (A1,A2,A3,A4,A5)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5, typename A6
    >
struct Tbase<T (A1,A2,A3,A4,A5,A6)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5,A6) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5, typename A6,
    typename A7
    >
struct Tbase<T (A1,A2,A3,A4,A5,A6,A7)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5,A6,A7) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5, typename A6,
    typename A7, typename A8
    >
struct Tbase<T (A1,A2,A3,A4,A5,A6,A7,A8)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5,A6,A7,A8) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5, typename A6,
    typename A7, typename A8, typename A9
    >
struct Tbase<T (A1,A2,A3,A4,A5,A6,A7,A8,A9)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5,A6,A7,A8,A9) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

template <
    typename T, 
    typename A1, typename A2, typename A3,
    typename A4, typename A5, typename A6,
    typename A7, typename A8, typename A9,
    typename A10
    >
struct Tbase<T (A1,A2,A3,A4,A5,A6,A7,A8,A9,A10)>
{
    virtual ~Tbase() {}
    virtual T evaluate (A1,A2,A3,A4,A5,A6,A7,A8,A9,A10) const = 0;
    virtual void copy_to ( scoped_ptr<Tbase>& dest) const = 0;
};

typedef Tbase<function_type> base;

// -----------------------------------------------

// Some templates to help deal with the weirdness of storing C function types (rather than pointer to functions).
// Basically, we make sure things always get turned into function pointers even if the user gives a function reference.
template <typename T, typename enabled = void>
struct funct_type { typedef T type; };
template <typename T>
struct funct_type<T, typename enable_if<is_function<T> >::type> { typedef T* type; };

template <typename T>
static typename enable_if<is_function<T>,const T*>::type copy (const T& item) { return &item; }
template <typename T>
static typename disable_if<is_function<T>,const T&>::type copy (const T& item) { return item; }

template <typename T, typename U>
static typename enable_if<is_function<T>,const T&>::type deref (const U& item) { return *item; }
template <typename T, typename U>
static typename disable_if<is_function<T>,const T&>::type deref (const U& item) { return item; }

// -----------------------------------------------

#define DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE               \
    typename funct_type<T>::type item;                      \
    derived() {}                                            \
    derived(const T& val) : item(copy(val)) {}              \
    virtual void copy_to ( scoped_ptr<base>& dest) const    \
    { dest.reset(new derived(deref<T>(item))); }

template <typename T, typename FT>
struct derived : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
    ) const { DLIB_ANY_FUNCTION_RETURN item(); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1>
struct derived<T,result_type (A1)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2>
struct derived<T,result_type (A1,A2)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3>
struct derived<T,result_type (A1,A2,A3)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4>
struct derived<T,result_type (A1,A2,A3,A4)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5>
struct derived<T,result_type (A1,A2,A3,A4,A5)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5, typename A6>
struct derived<T,result_type (A1,A2,A3,A4,A5,A6)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5, A6 a6
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5,a6); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5, typename A6,
                      typename A7>
struct derived<T,result_type (A1,A2,A3,A4,A5,A6,A7)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5, A6 a6, A7 a7
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5,a6,a7); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5, typename A6,
                      typename A7, typename A8>
struct derived<T,result_type (A1,A2,A3,A4,A5,A6,A7,A8)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5, A6 a6, A7 a7, A8 a8
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5,a6,a7,a8); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5, typename A6,
                      typename A7, typename A8, typename A9>
struct derived<T,result_type (A1,A2,A3,A4,A5,A6,A7,A8,A9)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5, A6 a6, A7 a7, A8 a8, A9 a9
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5,a6,a7,a8,a9); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

template <typename T, typename A1, typename A2, typename A3,
                      typename A4, typename A5, typename A6,
                      typename A7, typename A8, typename A9,
                      typename A10>
struct derived<T,result_type (A1,A2,A3,A4,A5,A6,A7,A8,A9,A10)> : public base
{
    DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

    virtual result_type evaluate (
        A1 a1, A2 a2, A3 a3, A4 a4, A5 a5, A6 a6, A7 a7, A8 a8, A9 a9, A10 a10
    ) const { DLIB_ANY_FUNCTION_RETURN item(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10); }
    /* !!!!!!!!    ERRORS ON THE ABOVE LINE    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        If you are getting an error on the above line then it means you
        have attempted to assign a function or function object to a
        dlib::any_function but the signatures of the source and
        destination functions don't match.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
};

scoped_ptr<base> data;

#undef DLIB_ANY_FUNCTION_DERIVED_BOILERPLATE

#endif // DLIB_ANY_FUNCTION_RETURN

