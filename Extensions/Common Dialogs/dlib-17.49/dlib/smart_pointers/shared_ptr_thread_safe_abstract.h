// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SHARED_PTr_THREAD_SAFE_ABSTRACT_
#ifdef DLIB_SHARED_PTr_THREAD_SAFE_ABSTRACT_ 

#include <exception>     

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        > 
    class shared_ptr_thread_safe 
    {
        /*!
            INITIAL VALUE
                defined by constructors

            WHAT THIS OBJECT REPRESENTS
                This object represents a reference counted smart pointer.  Each shared_ptr_thread_safe
                contains a pointer to some object and when the last shared_ptr_thread_safe that points
                to the object is destructed or reset() then the object is guaranteed to be 
                deleted.

                This is an implementation of the std::tr1::shared_ptr template from the 
                document ISO/IEC PDTR 19768, Proposed Draft Technical Report on C++
                Library Extensions.  The only deviation from that document is that this 
                shared_ptr_thread_safe is declared inside the dlib namespace rather than std::tr1,
                this one is explicitly thread safe, and there isn't a corresponding weak_ptr.

            THREAD SAFETY
                This is a version of the shared_ptr object that can be used to share pointers
                across more than one thread.  Note however, that individual instances of this object
                must still have access to them serialized by a mutex lock if they are to be modified
                by more than one thread.  But if you have two different shared_ptr_thread_safe objects
                that both point to the same thing from different threads then you are safe.
        !*/

    public:

        typedef T element_type;

        shared_ptr_thread_safe(
        );
        /*!
            ensures
                - #get() == 0
                - #use_count() == 0
        !*/

        template<typename Y> 
        explicit shared_ptr_thread_safe(
            Y* p
        );
        /*!
            requires
                - p is convertible to a T* type pointer
                - p can be deleted by calling "delete p;" and doing so will not throw exceptions
                - p != 0
            ensures
                - #get() == p
                - #use_count() == 1
                - #*this object owns the pointer p
            throws
                - std::bad_alloc
                  if this exception is thrown then "delete p;" is called
        !*/

        template<typename Y, typename D> 
        shared_ptr_thread_safe(
            Y* p, 
            const D& d
        );
        /*!
            requires
                - p is convertible to a T* type pointer
                - D is copy constructable (and the copy constructor of D doesn't throw) 
                - p can be deleted by calling "d(p);" and doing so will not throw exceptions
                - p != 0
            ensures
                - #get() == p
                - #use_count() == 1
                - #*this object owns the pointer p
            throws
                - std::bad_alloc
                  if this exception is thrown then "d(p);" is called
        !*/

        shared_ptr_thread_safe( 
            const shared_ptr_thread_safe& r
        );
        /*!
            ensures
                - #get() == #r.get()
                - #use_count() == #r.use_count()
                - If r is empty, constructs an empty shared_ptr_thread_safe object; otherwise, constructs 
                  a shared_ptr_thread_safe object that shares ownership with r.
        !*/

        template<typename Y> 
        shared_ptr_thread_safe(
            const shared_ptr_thread_safe<Y>& r
        );
        /*!
            requires
                - Y* is convertible to T* 
            ensures
                - #get() == #r.get()
                - #use_count() == #r.use_count()
                - If r is empty, constructs an empty shared_ptr_thread_safe object; otherwise, constructs 
                  a shared_ptr_thread_safe object that shares ownership with r.
        !*/

        template<typename Y>
        explicit shared_ptr_thread_safe(
            std::auto_ptr<Y>& r
        );
        /*!
            requires
                - p.get() != 0
                - p.release() is convertible to a T* type pointer
                - p.release() can be deleted by calling "delete p.release();" and doing so will not throw exceptions
            ensures
                - #get() == p.release()
                - #use_count() == 1
                - #r.get() == 0
                - #*this object owns the pointer p.release()
            throws
                - std::bad_alloc
        !*/

        ~shared_ptr_thread_safe(
        );
        /*!
            ensures
                - if (use_count() > 1)
                    - this object destroys itself but otherwise has no effect (i.e. 
                      the pointer get() is still valid and shared between the remaining
                      shared_ptr_thread_safe objects)
                - else if (use_count() == 1)
                    - deletes the pointer get() by calling delete (or using the deleter passed
                      to the constructor if one was passed in)
                - else
                    - in this case get() == 0 so there is nothing to do so nothing occurs
        !*/

        shared_ptr_thread_safe& operator= (
            const shared_ptr_thread_safe& r
        );
        /*!
            ensures
                - equivalent to shared_ptr_thread_safe(r).swap(*this).
                - returns #*this
        !*/

        template<typename Y> 
        shared_ptr_thread_safe& operator= (
            const shared_ptr_thread_safe<Y>& r
        );
        /*!
            requires
                - Y* is convertible to T* 
            ensures
                - equivalent to shared_ptr_thread_safe(r).swap(*this).
                - returns #*this
        !*/

        template<typename Y> 
        shared_ptr_thread_safe& operator= (
            std::auto_ptr<Y>& r
        );
        /*!
            requires
                - p.get() != 0
                - p.release() is convertible to a T* type pointer
                - p.release() can be deleted by calling "delete p.release();" and doing so will not throw exceptions
            ensures
                - equivalent to shared_ptr_thread_safe(r).swap(*this).
                - returns #*this
        !*/

        void reset(
        );
        /*!
            ensures
                - equivalent to shared_ptr_thread_safe().swap(*this)
        !*/

        template<typename Y> 
        void reset(
            Y* p
        );
        /*!
            requires
                - p is convertible to a T* type pointer
                - p can be deleted by calling "delete p;" and doing so will not throw exceptions
                - p != 0
            ensures
                - equivalent to shared_ptr_thread_safe(p).swap(*this)
        !*/

        template<typename Y, typename D> 
        void reset(
            Y* p, 
            const D& d
        );
        /*!
            requires
                - p is convertible to a T* type pointer
                - D is copy constructable (and the copy constructor of D doesn't throw) 
                - p can be deleted by calling "d(p);" and doing so will not throw exceptions
                - p != 0
            ensures
                - equivalent to shared_ptr_thread_safe(p,d).swap(*this)
        !*/

        T* get(
        ) const; 
        /*!
            ensures
                - returns the stored pointer
        !*/

        T& operator*(
        ) const; 
        /*!
            requires
                - get() != 0
            ensures
                - returns a reference to *get()
        !*/

        T* operator->(
        ) const; 
        /*!
            requires
                - get() != 0
            ensures
                - returns get()
        !*/

        bool unique(
        ) const;
        /*!
            ensures
                - returns (use_count() == 1)
        !*/

        long use_count(
        ) const;
        /*!
            ensures
                - The number of shared_ptr_thread_safe objects, *this included, that share ownership with *this, or 0 when *this
                  is empty.
        !*/

        operator bool(
        ) const;
        /*!
            ensures
                - returns (get() != 0)
        !*/

        void swap(
            shared_ptr_thread_safe& b
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template<typename T, typename U>
    bool operator== (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    );
    /*!
        ensures
            - returns a.get() == b.get()
    !*/

    template<typename T, typename U>
    bool operator!= (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    ) { return a.get() != b.get(); }
    /*!
        ensures
            - returns a.get() != b.get()
    !*/

    template<typename T, typename U>
    bool operator< (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    );
    /*!
        ensures
            - Defines an operator< on shared_ptr_thread_safe types appropriate for use in the associative 
              containers.  
    !*/

    template<typename T> 
    void swap(
        shared_ptr_thread_safe<T>& a, 
        shared_ptr_thread_safe<T>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template<typename T, typename U>
    shared_ptr_thread_safe<T> static_pointer_cast(
        const shared_ptr_thread_safe<U>& r
    );
    /*!
        - if (r.get() == 0) then
            - returns shared_ptr_thread_safe<T>()
        - else
            - returns a shared_ptr_thread_safe<T> object that stores static_cast<T*>(r.get()) and shares 
              ownership with r.
    !*/

    template<typename T, typename U>
    shared_ptr_thread_safe<T> const_pointer_cast(
        const shared_ptr_thread_safe<U>& r
    );
    /*!
        - if (r.get() == 0) then
            - returns shared_ptr_thread_safe<T>()
        - else
            - returns a shared_ptr_thread_safe<T> object that stores const_cast<T*>(r.get()) and shares 
              ownership with r.
    !*/

    template<typename T, typename U>
    shared_ptr_thread_safe<T> dynamic_pointer_cast(
        const shared_ptr_thread_safe<U>& r
    );
    /*!
        ensures
            - if (dynamic_cast<T*>(r.get()) returns a nonzero value) then
                - returns a shared_ptr_thread_safe<T> object that stores a copy of 
                  dynamic_cast<T*>(r.get()) and shares ownership with r
            - else
                - returns an empty shared_ptr_thread_safe<T> object.
    !*/

    template<typename E, typename T, typename Y>
    std::basic_ostream<E, T> & operator<< (
        std::basic_ostream<E, T> & os, 
        const shared_ptr_thread_safe<Y>& p
    );
    /*!
        ensures
            - performs os << p.get()
            - returns os 
    !*/

    template<typename D, typename T>
    D* get_deleter(
        const shared_ptr_thread_safe<T>& p
    );
    /*!
        ensures
            - if (*this owns a deleter d of type cv-unqualified D) then
                - returns &d
            - else
                - returns 0
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SHARED_PTr_THREAD_SAFE_ABSTRACT_

