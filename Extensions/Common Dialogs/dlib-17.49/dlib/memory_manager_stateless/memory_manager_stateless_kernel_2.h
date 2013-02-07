// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_STATELESs_2_
#define DLIB_MEMORY_MANAGER_STATELESs_2_

#include "../algs.h"
#include "memory_manager_stateless_kernel_abstract.h"
#include "../threads.h"

namespace dlib
{
    template <
        typename T,
        typename mem_manager 
        >
    class memory_manager_stateless_kernel_2
    {
        /*!      
            REQUIREMENTS ON mem_manager
                mem_manager must be an implementation of memory_manager/memory_manager_kernel_abstract.h

            CONVENTION
                this object has a single global instance of mem_manager 
        !*/

        public:

            typedef T type;
            const static bool is_stateless = true;

            template <typename U>
            struct rebind {
                typedef memory_manager_stateless_kernel_2<U,mem_manager> other;
            };

            memory_manager_stateless_kernel_2(
            )
            { 
                // call this just to make sure the mutex is is initialized before 
                // multiple threads start calling the member functions.
                global_mutex();
            }

            virtual ~memory_manager_stateless_kernel_2(
            ) {}

            T* allocate (
            )
            {
                auto_mutex M(global_mutex());
                return global_mm().allocate();
            }

            void deallocate (
                T* item
            )
            {
                auto_mutex M(global_mutex());
                return global_mm().deallocate(item);
            }

            T* allocate_array (
                unsigned long size
            ) 
            { 
                auto_mutex M(global_mutex());
                return global_mm().allocate_array(size);
            }

            void deallocate_array (
                T* item
            ) 
            { 
                auto_mutex M(global_mutex());
                return global_mm().deallocate_array(item);
            }

            void swap (memory_manager_stateless_kernel_2&)
            {}

        private:

            static mutex& global_mutex (
            )
            {
                static mutex lock;
                return lock;
            }

            typedef typename mem_manager::template rebind<T>::other rebound_mm_type; 

            static rebound_mm_type& global_mm (
            ) 
            {
                static rebound_mm_type mm;
                return mm;
            }

            // restricted functions
            memory_manager_stateless_kernel_2(memory_manager_stateless_kernel_2&);        // copy constructor
            memory_manager_stateless_kernel_2& operator=(memory_manager_stateless_kernel_2&);    // assignment operator
    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        memory_manager_stateless_kernel_2<T,mem_manager>& a, 
        memory_manager_stateless_kernel_2<T,mem_manager>& b 
    ) { a.swap(b); }   

}

#endif // DLIB_MEMORY_MANAGER_STATELESs_2_




