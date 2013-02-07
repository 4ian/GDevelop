// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_STATELESs_1_
#define DLIB_MEMORY_MANAGER_STATELESs_1_

#include "memory_manager_stateless_kernel_abstract.h"

namespace dlib
{
    template <
        typename T
        >
    class memory_manager_stateless_kernel_1
    {
        /*!      
            this implementation just calls new and delete directly
        !*/
        
        public:

            typedef T type;
            const static bool is_stateless = true;

            template <typename U>
            struct rebind {
                typedef memory_manager_stateless_kernel_1<U> other;
            };

            memory_manager_stateless_kernel_1(
            )
            {}

            virtual ~memory_manager_stateless_kernel_1(
            ) {}

            T* allocate (
            )
            {
                return new T; 
            }

            void deallocate (
                T* item
            )
            {
                delete item;
            }

            T* allocate_array (
                unsigned long size
            ) 
            { 
                return new T[size];
            }

            void deallocate_array (
                T* item
            ) 
            { 
                delete [] item;
            }

            void swap (memory_manager_stateless_kernel_1&)
            {}

        private:

            // restricted functions
            memory_manager_stateless_kernel_1(memory_manager_stateless_kernel_1&);        // copy constructor
            memory_manager_stateless_kernel_1& operator=(memory_manager_stateless_kernel_1&);    // assignment operator
    };

    template <
        typename T
        >
    inline void swap (
        memory_manager_stateless_kernel_1<T>& a, 
        memory_manager_stateless_kernel_1<T>& b 
    ) { a.swap(b); }   

}

#endif // DLIB_MEMORY_MANAGER_STATELESs_1_



