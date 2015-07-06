// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STD_ALLOc_H_
#define DLIB_STD_ALLOc_H_

#include <limits>
#include <memory>
#include "enable_if.h"
#include "algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename M
        >
    class std_allocator 
    {
        /*!
            REQUIREMENTS ON M 
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                M::type can be set to anything.

            WHAT THIS OBJECT REPRESENTS
                This object is an implementation of an allocator that conforms to the C++ standard 
                requirements for allocator objects.  The M template argument is one of the dlib
                memory manager objects and this allocator implementation will do all of its memory allocations
                using whatever dlib memory manager you supply.   

                Thus, using this allocator object you can use any of the dlib memory manager objects with
                the containers in the STL or with any other object that requires a C++ allocator object.

                It is important to note that many STL implementations make the assumption that the memory
                allocated by one allocator can be freed by another.  This effectively means that you should
                only use a global or stateless memory manager with the std_allocator.  Either that or you
                have to verify that your version of the STL isn't going to try and allocate and deallocate
                memory with different allocators.
        !*/

    public:
        //type definitions
        typedef std::size_t     size_type;
        typedef std::ptrdiff_t  difference_type;
        typedef T*              pointer;
        typedef const T*        const_pointer;
        typedef T&              reference;
        typedef const T&        const_reference;
        typedef T               value_type;

        //rebind std_allocator to type U
        template <typename U>
        struct rebind {
            typedef std_allocator<U,M> other;
        };

        //return address of values
        pointer address (reference value) const { return &value; }

        const_pointer address (const_reference value) const { return &value; }

        /*constructors and destructor
         *-nothing to do because the std_allocator has no state
        */
        std_allocator() throw() { }

        std_allocator(const std_allocator&) throw() { } 

        template <typename U>
        std_allocator (const std_allocator<U,M>&) throw() { }

        ~std_allocator() throw() { }

        //return maximum number of elements that can be allocated
        size_type max_size () const throw() 
        {
            //for numeric_limits see Section 4.3, page 59
            return std::numeric_limits<size_t>::max() / sizeof(T);
        }

        //allocate but don't initialize num elements of type T
        pointer allocate (
            size_type num,
            typename std_allocator<void,M>::const_pointer  = 0
        ) 
        {
            return (pointer) pool.allocate_array(num*sizeof(T));
        }

        // This function is not required by the C++ standard but some versions of the STL
        // distributed with gcc erroneously require it.  See the bug report for further
        // details: http://gcc.gnu.org/bugzilla/show_bug.cgi?id=51626
        void construct(pointer p) { return construct(p, value_type()); }

        //initialize elements of allocated storage p with value value
        void construct (pointer p, const T& value) 
        {
            //initialize memory with placement new
            new((void*)p)T(value);
        }


        //destroy elements of initialized storage p
        void destroy (pointer p) 
        {
            // destroy objects by calling their destructor
            p->~T();
        }

        //deallocate storage p of deleted elements
        void deallocate (pointer p, size_type ) 
        {
            pool.deallocate_array((char*)p);
        }

        void swap (
            std_allocator& item
        )
        {
            pool.swap(item.pool);
        }

        std_allocator& operator= (const std_allocator&) { return *this;}

    private:
        typename M::template rebind<char>::other pool; 
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M
        >
    class std_allocator<void,M> 
    {
    public:
        //type definitions
        typedef std::size_t     size_type;
        typedef std::ptrdiff_t  difference_type;
        typedef void*              pointer;
        typedef const void*        const_pointer;
        typedef void               value_type;

        //rebind std_allocator to type U
        template <typename U>
        struct rebind {
            typedef std_allocator<U,M> other;
        };

    };
    
// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename enabled = void>
    struct std_alloc_compare
    { const static bool are_interchangeable = false; };

    template <typename M1, typename M2>
    struct std_alloc_compare<M1,M2,typename enable_if<is_same_type<typename M1::mm_global_type, typename M2::mm_global_type> >::type>
    { const static bool are_interchangeable = true; };

    template <typename M>
	struct std_alloc_compare<M,M,typename enable_if_c<M::is_stateless>::type>
    { const static bool are_interchangeable = true; };

    //return that all specializations of this std_allocator are interchangeable if they use memory_manager_global
    // instances with the same mm_global_type
    template <typename T1, typename M1, typename T2, typename M2>
    bool operator== (
        const std_allocator<T1,M1>&,
        const std_allocator<T2,M2>&
    ) throw() 
    { return std_alloc_compare<M1,M2>::are_interchangeable; }

    template <typename T1, typename M1, typename T2, typename M2>
    bool operator!= (
        const std_allocator<T1,M1>&,
        const std_allocator<T2,M2>&
    ) throw() 
    { return !std_alloc_compare<M1,M2>::are_interchangeable; }

// ----------------------------------------------------------------------------------------

    template <typename T, typename M>
    void swap (
        std_allocator<T,M>& a,
        std_allocator<T,M>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STD_ALLOc_H_

