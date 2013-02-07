// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_WEAK_PTr_ABSTRACT_
#ifdef DLIB_WEAK_PTr_ABSTRACT_ 

#include "shared_ptr_abstract.h"

namespace dlib {

    template <
        typename T
        > 
    class weak_ptr 
    {

        /*!
            INITIAL VALUE
                defined by constructor

            WHAT THIS OBJECT REPRESENTS
                The weak_ptr class template stores a weak reference to an object that is 
                already managed by a shared_ptr. To access the object, a weak_ptr can 
                be converted to a shared_ptr using the member function lock().  

                This is an implementation of the std::tr1::weak_ptr template from the 
                document ISO/IEC PDTR 19768, Proposed Draft Technical Report on C++
                Library Extensions.  The only deviation from that document is that this 
                shared_ptr is declared inside the dlib namespace rather than std::tr1.
        !*/

    public:
        typedef T element_type;

        weak_ptr(
        );
        /*!
            ensures
                - #use_count() == 0
                - creates an empty weak_ptr
        !*/

        template<typename Y> 
        weak_ptr(
            const shared_ptr<Y>& r
        );
        /*!
            requires
                - Y* must be convertible to T*
            ensures
                - if (r is empty) then
                    - constructs an empty weak_ptr object
                - else 
                    - constructs a weak_ptr object that shares ownership with r and 
                      stores a copy of the pointer stored in r.
                - #use_count() == #r.use_count()
        !*/

        weak_ptr(
            const weak_ptr& r
        );
        /*!
            ensures
                - if (r is empty) then
                    - constructs an empty weak_ptr object
                - else 
                    - constructs a weak_ptr object that shares ownership with r and 
                      stores a copy of the pointer stored in r.
                - #use_count() == #r.use_count()
        !*/

        template<typename Y> 
        weak_ptr(
            const weak_ptr<Y>& r
        );
        /*!
            requires
                - Y* must be convertible to T*
            ensures
                - if (r is empty) then
                    - constructs an empty weak_ptr object
                - else 
                    - constructs a weak_ptr object that shares ownership with r and 
                      stores a copy of the pointer stored in r.
                - #use_count() == #r.use_count()
        !*/

        ~weak_ptr(
        );
        /*!
            ensures
                - destroys this weak_ptr object but has no effect on the object its 
                  stored pointer points to.
        !*/

        weak_ptr& operator= (
            const weak_ptr& r
        );
        /*!
            ensures
                - equivalent to weak_ptr(r).swap(*this)
        !*/

        template<typename Y> 
        weak_ptr& operator= (
            const weak_ptr<Y>& r
        );
        /*!
            requires
                - Y* must be convertible to T*
            ensures
                - equivalent to weak_ptr(r).swap(*this)
        !*/

        template<typename Y> 
        weak_ptr& operator=(
            const shared_ptr<Y>& r
        );
        /*!
            requires
                - Y* must be convertible to T*
            ensures
                - equivalent to weak_ptr(r).swap(*this)
        !*/

        long use_count(
        ) const;
        /*!
            ensures
                - if (*this is empty) then
                    - returns 0
                - else 
                    - returns the number of shared_ptr instances that share ownership 
                      with *this
        !*/

        bool expired(
        ) const;
        /*!
            ensures
                - returns (use_count() == 0)
        !*/

        shared_ptr<T> lock(
        ) const;
        /*!
            ensures
                - if (expired()) then
                    - returns shared_ptr<T>()
                - else
                    - returns shared_ptr<T>(*this)
        !*/

        void reset(
        );
        /*!
            ensures
                - equivalent to weak_ptr().swap(*this)
        !*/

        void swap(
            weak_ptr<T>& b
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

    template<typename T, typename U>
    bool operator< (
        const weak_ptr<T>& a, 
        const weak_ptr<U>& b
    );
    /*!
        ensures
            - Defines an operator< on shared_ptr types appropriate for use in the associative 
              containers.  
    !*/

    template<typename T>
    void swap(
        weak_ptr<T>& a, 
        weak_ptr<T> & b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/
}

#endif // DLIB_WEAK_PTr_ABSTRACT_


