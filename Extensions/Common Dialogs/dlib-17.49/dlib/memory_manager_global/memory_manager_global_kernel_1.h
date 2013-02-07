// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_GLOBAl_1_
#define DLIB_MEMORY_MANAGER_GLOBAl_1_

#include "../algs.h"
#include "../memory_manager/memory_manager_kernel_abstract.h"
#include "memory_manager_global_kernel_abstract.h"

namespace dlib
{
    template <
        typename T,
        typename factory
        >
    class memory_manager_global_kernel_1
    {
        /*!      
            INITIAL VALUE
                - *global_mm == get_global_memory_manager()

            CONVENTION
                - global_mm->get_number_of_allocations() == get_number_of_allocations()
                - *global_mm == get_global_memory_manager()
        !*/
        
        public:

            typedef typename factory::template return_type<T>::type mm_global_type; 

            typedef T type;

            template <typename U>
            struct rebind {
                typedef memory_manager_global_kernel_1<U,factory> other;
            };

            memory_manager_global_kernel_1(
            ) :
                global_mm(factory::template get_instance<T>())
            {}

            virtual ~memory_manager_global_kernel_1(
            )  {}

            unsigned long get_number_of_allocations (
            ) const { return global_mm->get_number_of_allocations(); }

            mm_global_type& get_global_memory_manager (
            ) { return *global_mm; }

            T* allocate (
            )
            {
                return global_mm->allocate(); 
            }

            void deallocate (
                T* item
            )
            {
                global_mm->deallocate(item); 
            }

            T* allocate_array (
                unsigned long size
            ) 
            { 
                return global_mm->allocate_array(size); 
            }

            void deallocate_array (
                T* item
            ) 
            { 
                global_mm->deallocate_array(item); 
            }

            void swap (
                memory_manager_global_kernel_1& item
            )
            {
                exchange(item.global_mm, global_mm);
            }

        private:

            mm_global_type* global_mm;


            // restricted functions
            memory_manager_global_kernel_1(memory_manager_global_kernel_1&);        // copy constructor
            memory_manager_global_kernel_1& operator=(memory_manager_global_kernel_1&);    // assignment operator
    };

    template <
        typename T,
        typename factory
        >
    inline void swap (
        memory_manager_global_kernel_1<T,factory>& a, 
        memory_manager_global_kernel_1<T,factory>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_MEMORY_MANAGER_GLOBAl_1_



