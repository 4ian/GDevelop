// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_REFERENCE_WRAPpER_H_
#define DLIB_REFERENCE_WRAPpER_H_

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template<
        typename T
        > 
    class reference_wrapper 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple object that just holds a reference to another object. 
                It is useful because it can serve as a kind of "copyable reference".  
        !*/

    public:
        typedef T type;

        explicit reference_wrapper(T& o) : obj(&o) {}

        operator T&()    const { return  *obj; }
        T& get()         const { return  *obj; }

    private:
        T* obj;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    reference_wrapper<T> ref(
        T& obj
    ) { return reference_wrapper<T>(obj); }
    /*!
        ensures
            - returns a reference_wrapper that contains a reference to obj.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    reference_wrapper<T> ref(
        reference_wrapper<T> obj
    ) { return obj; }
    /*!
        ensures
            - returns the given reference_wrapper object without modification
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    reference_wrapper<const T> cref(
        const T& obj
    ) { return reference_wrapper<const T>(obj); }
    /*!
        ensures
            - returns a reference_wrapper that contains a constant reference to obj.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    reference_wrapper<const T> cref(
        reference_wrapper<T> obj
    ) { return cref(obj.get()); }
    /*!
        ensures
            - converts the given reference_wrapper into a reference_wrapper that contains a
              constant reference.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REFERENCE_WRAPpER_H_

