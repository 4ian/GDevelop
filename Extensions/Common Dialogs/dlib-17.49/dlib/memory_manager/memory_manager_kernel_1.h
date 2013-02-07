// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_KERNEl_1_
#define DLIB_MEMORY_MANAGER_KERNEl_1_

#include "../algs.h"
#include "memory_manager_kernel_abstract.h"
#include "../assert.h"
#include <new>


namespace dlib
{

    template <
        typename T,
        unsigned long max_pool_size
        >
    class memory_manager_kernel_1
    {
        /*!            
            INITIAL VALUE
                allocations == 0
                next == 0
                pool_size == 0

            REQUIREMENTS ON max_pool_size 
                max_pool_size is the maximum number of nodes we will keep in our linked list at once.
                So you can put any value in for this argument.

            CONVENTION
                This memory manager implementation allocates T objects one at a time when there are
                allocation requests.  Then when there is a deallocate request the returning T object
                is place into a list of free blocks if that list has less than max_pool_size 
                blocks in it.  subsequent allocation requests will be serviced by drawing from the
                free list whenever it isn't empty.


                allocations == get_number_of_allocations()

                - if (next != 0) then
                    - next == the next pointer to return from allocate()
                      and next == pointer to the first node in a linked list.  each node
                      is one item in the memory pool.    
                    - the last node in the linked list has next set to 0
                    - pool_size == the number of nodes in the linked list
                    - pool_size <= max_pool_size
                - else
                    - we need to call new to get the next pointer to return from allocate()

        !*/

        union node
        {
            node* next;
            char item[sizeof(T)];
        };

    public:

        typedef T type;

        template <typename U>
        struct rebind {
            typedef memory_manager_kernel_1<U,max_pool_size> other;
        };


        memory_manager_kernel_1(
        ) :
            allocations(0),
            next(0),
            pool_size(0)
        {
        }

        virtual ~memory_manager_kernel_1(
        )
        {

            while (next != 0)
            {
                node* temp = next;
                next = next->next;
                ::operator delete ( static_cast<void*>(temp));
            }
        }

        unsigned long get_number_of_allocations (
        ) const { return allocations; }

        T* allocate_array (
            unsigned long size
        )
        {
            T* temp = new T[size];
            ++allocations;
            return temp;
        }

        void deallocate_array (
            T* item
        )
        {
            --allocations;
            delete [] item;
        }

        T* allocate (
        ) 
        {              
            T* temp;
            if (next != 0)
            {
                temp = reinterpret_cast<T*>(next);

                node* n = next->next;

                try
                {
                    // construct this new T object with placement new.
                    new (static_cast<void*>(temp))T();
                }
                catch (...)
                {
                    next->next = n;
                    throw;
                }

                next = n;

                --pool_size;
            }
            else
            {
                temp = static_cast<T*>(::operator new(sizeof(node)));
                try
                {
                    // construct this new T object with placement new.
                    new (static_cast<void*>(temp))T();
                }
                catch (...)
                {
                    // construction of the new object threw so delete the block of memory
                    ::operator delete ( static_cast<void*>(temp));
                    throw;
                }
            }

            ++allocations;
            return temp;
        }

        void deallocate (
            T* item
        ) 
        { 
            --allocations;  
            item->~T();

            if (pool_size >= max_pool_size)
            {
                ::operator delete ( static_cast<void*>(item));
                return;
            }

            // add this memory chunk into our linked list.
            node* temp = reinterpret_cast<node*>(item);
            temp->next = next;
            next = temp;                
            ++pool_size;
        }

        void swap (
            memory_manager_kernel_1& item
        ) 
        { 
            exchange(allocations,item.allocations); 
            exchange(next,item.next); 
            exchange(pool_size,item.pool_size);
        }

    private:

        // data members
        unsigned long allocations;
        node* next;
        unsigned long pool_size;

        // restricted functions
        memory_manager_kernel_1(memory_manager_kernel_1&);        // copy constructor
        memory_manager_kernel_1& operator=(memory_manager_kernel_1&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class memory_manager_kernel_1<T,0>
    {
        /*!            
            INITIAL VALUE
                allocations == 0

            CONVENTION
                This memory manager just calls new and delete directly so it doesn't 
                really do anything.

                allocations == get_number_of_allocations()
        !*/

    public:

        typedef T type;

        template <typename U>
        struct rebind {
            typedef memory_manager_kernel_1<U,0> other;
        };


        memory_manager_kernel_1(
        ) :
            allocations(0)
        {
        }

        virtual ~memory_manager_kernel_1(
        )
        {
        }

        unsigned long get_number_of_allocations (
        ) const { return allocations; }

        T* allocate_array (
            unsigned long size
        )
        {
            T* temp = new T[size];
            ++allocations;
            return temp;
        }

        void deallocate_array (
            T* item
        )
        {
            --allocations;
            delete [] item;
        }

        T* allocate (
        ) 
        {              
            T* temp = new T;
            ++allocations;
            return temp;
        }

        void deallocate (
            T* item
        ) 
        { 
            delete item;
            --allocations;  
        }

        void swap (
            memory_manager_kernel_1& item
        ) 
        { 
            exchange(allocations,item.allocations); 
        }

    private:

        // data members
        unsigned long allocations;

        // restricted functions
        memory_manager_kernel_1(memory_manager_kernel_1&);        // copy constructor
        memory_manager_kernel_1& operator=(memory_manager_kernel_1&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long max_pool_size
        >
    inline void swap (
        memory_manager_kernel_1<T,max_pool_size>& a, 
        memory_manager_kernel_1<T,max_pool_size>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MEMORY_MANAGER_KERNEl_1_



