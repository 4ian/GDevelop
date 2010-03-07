// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCOPED_PTr_
#define DLIB_SCOPED_PTr_ 

#include <algorithm>
#include "../noncopyable.h"
#include "../algs.h"
#include "scoped_ptr_abstract.h"

namespace dlib
{

    template<typename T> 
        class scoped_ptr : noncopyable 
        {
            /*!
                CONVENTION
                    - get() == ptr
            !*/

        public:
            typedef T element_type;

            explicit scoped_ptr (
                T* p = 0
            ) : ptr(p) { }

            ~scoped_ptr() { if (ptr) delete ptr; }

            void reset (
                T* p = 0
            ) 
            { 
                if (ptr) 
                    delete ptr; 
                ptr = p;
            }

            T& operator*() const
            {
                DLIB_ASSERT(get() != 0,
                    "\tscoped_ptr::operator*()"
                    << "\n\tget() can't be null if you are going to dereference it"
                    << "\n\tthis: " << this
                    );

                return *ptr;
            }

            T* operator->() const
            {
                DLIB_ASSERT(get() != 0,
                    "\tscoped_ptr::operator*()"
                    << "\n\tget() can't be null"
                    << "\n\tthis: " << this
                    );

                return ptr;
            }

            T* get() const
            {
                return ptr;
            }

            operator bool() const
            {
                return (ptr != 0);
            }

            void swap(
                scoped_ptr& b
            )
            {
                std::swap(ptr,b.ptr);
            }

        private:

            T* ptr;
        };

    template <
        typename T
        > 
    void swap(
        scoped_ptr<T>& a, 
        scoped_ptr<T>& b
    )
    {
        a.swap(b);
    }

}

#endif // DLIB_SCOPED_PTr_


