// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MEMORY_MANAGER_GLOBAl_ABSTRACT_
#ifdef DLIB_MEMORY_MANAGER_GLOBAl_ABSTRACT_

#include "../algs.h"
#include "../memory_manager/memory_manager_kernel_abstract.h"

namespace dlib
{
    template <
        typename T,
        typename factory
        >
    class memory_manager_global
    {
        /*!      
            REQUIREMENTS ON T
                T must have a default constructor.      

            REQUIREMENTS ON factory
                factory must be defined as follows:
                struct factory
                {
                    template <typename U>
                    struct return_type {
                        typedef typename memory_manager_type<U> type;
                    };

                    template <typename U>
                    static typename return_type<U>::type* get_instance (
                    );
                    / *!
                        ensures
                            - returns a pointer to an instance of a memory_manager object
                              where memory_manager_type implements the interface defined 
                              by dlib/memory_manager/memory_manager_kernel_abstract.h
                    !* /
                };

            WHAT THIS OBJECT REPRESENTS
                This object represents some kind of global memory manager or memory pool.  
                It is identical to the memory_manager object except that it gets all of 
                its allocations from a global instance of a memory_manager object which 
                is provided by the factory object's static member get_instance().

            THREAD SAFETY
                This object is, by itself, threadsafe.  However, if you want to use this
                object in multiple threads then you must ensure that your factory is
                threadsafe.  This means its factory::get_instance() method should be 
                threadsafe and the memory_manager object it returns must also be threadsafe.
        !*/
        
        public:

            typedef typename factory::template return_type<T>::type mm_global_type; 

            typedef T type;

            template <typename U>
            struct rebind {
                typedef memory_manager_global<U,factory> other;
            };

            memory_manager_global(
            );
            /*!
                ensures 
                    - #*this is properly initialized
                    - #get_global_memory_manager() == the memory manager that was 
                      returned by a call to factory::get_instance<T>()
                throws
                    - std::bad_alloc
            !*/

            virtual ~memory_manager_global(
            ); 
            /*!
                ensures
                    - This destructor has no effect on the global memory_manager
                      get_global_memory_manager().
            !*/

            unsigned long get_number_of_allocations (
            ) const;
            /*!
                ensures
                    - returns get_global_memory_manager().get_number_of_allocations()
            !*/

            mm_global_type& get_global_memory_manager (
            );
            /*!
                ensures
                    - returns a reference to the global memory manager instance being
                      used by *this.
            !*/

            T* allocate (
            );
            /*!
                ensures
                    - #get_number_of_allocations() == get_number_of_allocations() + 1
                    - returns get_global_memory_manager().allocate()
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then the call to allocate() 
                        has no effect on #*this.
            !*/

            void deallocate (
                T* item
            );
            /*!
                requires
                    - item == is a pointer to memory that was obtained from a call to
                      the get_global_memory_manager() object's allocate() method.
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - calls get_global_memory_manager().deallocate(item)
                    - #get_number_of_allocations() == get_number_of_allocations() - 1
            !*/

            T* allocate_array (
                unsigned long size
            );
            /*!
                ensures
                    - #get_number_of_allocations() == get_number_of_allocations() + 1
                    - returns get_global_memory_manager().allocate_array()
                throws
                    - std::bad_alloc or any exception thrown by T's constructor.
                        If this exception is thrown then the call to allocate_array() 
                        has no effect on #*this.
            !*/

            void deallocate_array (
                T* item
            );
            /*!
                requires
                    - item == is a pointer to memory that was obtained from a call to
                      the get_global_memory_manager() object's allocate_array() method.
                    - the memory pointed to by item hasn't already been deallocated.
                ensures
                    - calls get_global_memory_manager().deallocate_array(item)
                    - #get_number_of_allocations() == get_number_of_allocations() - 1
            !*/

            void swap (
                memory_manager_global& item
            );
            /*!
                ensures
                    - swaps *this and item
            !*/ 

        private:

            // restricted functions
            memory_manager_global(memory_manager_global&);        // copy constructor
            memory_manager_global& operator=(memory_manager_global&);    // assignment operator
    };

    template <
        typename T,
        typename factory
        >
    inline void swap (
        memory_manager_global<T,factory>& a, 
        memory_manager_global<T,factory>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_MEMORY_MANAGER_GLOBAl_ABSTRACT_


