// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_KERNEl_2_
#define DLIB_MEMORY_MANAGER_KERNEl_2_

#include "../algs.h"
#include "memory_manager_kernel_abstract.h"
#include "../assert.h"
#include <new>

namespace dlib
{

    template <
        typename T,
        unsigned long chunk_size
        >
    class memory_manager_kernel_2
    {
        /*!            
            INITIAL VALUE
                allocations == 0
                next == 0
                first_chunk == 0

            REQUIREMENTS ON chunk_size
                chunk_size is the number of items of type T we will allocate at a time. so
                it must be > 0.

            CONVENTION
                This memory manager implementation allocates memory in blocks of chunk_size*sizeof(T)
                bytes.  All the sizeof(T) subblocks are kept in a linked list of free memory blocks
                and are given out whenever an allocation request occurs.  Also, memory is not freed
                until this object is destructed.  

                Note that array allocations are not memory managed.
                


                allocations == get_number_of_allocations()

                - if (next != 0) then
                    - next == the next pointer to return from allocate()
                      and next == pointer to the first node in a linked list.  each node
                      is one item in the memory pool.    
                    - the last node in the linked list has next set to 0
                - else
                    - we need to call new to get the next pointer to return from allocate()


                - if (first_chunk != 0) then
                    - first_chunk == the first node in a linked list that contains pointers 
                      to all the chunks we have ever allocated.  The last link in the list
                      has its next pointer set to 0.
        !*/

        union node
        {
            node* next;
            char item[sizeof(T)];
        };

        struct chunk_node
        {
            node* chunk;
            chunk_node* next;
        };

    public:

        typedef T type;

        template <typename U>
        struct rebind {
            typedef memory_manager_kernel_2<U,chunk_size> other;
        };


        memory_manager_kernel_2(
        ) :
            allocations(0),
            next(0),
            first_chunk(0)
        {
            // You FOOL!  You can't have a zero chunk_size.
            COMPILE_TIME_ASSERT(chunk_size > 0);
        }

        virtual ~memory_manager_kernel_2(
        )
        {
            if (allocations == 0)
            {
                while (first_chunk != 0)
                {
                    chunk_node* temp = first_chunk;
                    first_chunk = first_chunk->next;
                    // delete the memory chunk 
                    ::operator delete ( static_cast<void*>(temp->chunk));
                    // delete the chunk_node
                    delete temp;
                }
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
            T* temp = 0;
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
            }
            else
            {
                // the linked list is empty so we need to allocate some more memory
                node* block = 0;
                block = static_cast<node*>(::operator new (sizeof(node)*chunk_size));

                // the first part of this block can be our new object
                temp = reinterpret_cast<T*>(block);

                try
                {
                    // construct this new T object with placement new.
                    new (static_cast<void*>(temp))T();
                }
                catch (...)
                {
                    // construction of the new object threw so delete the block of memory
                    ::operator delete ( static_cast<void*>(block));
                    throw;
                }

                // allocate a new chunk_node
                chunk_node* chunk;
                try {chunk = new chunk_node; }
                catch (...) 
                { 
                    temp->~T();
                    ::operator delete ( static_cast<void*>(block));
                    throw;
                }

                // add this block into the chunk list
                chunk->chunk = block;
                chunk->next = first_chunk;
                first_chunk = chunk;


                ++block;
                // now add the rest of the block into the linked list of free nodes.
                for (unsigned long i = 0; i < chunk_size-1; ++i)
                {
                    block->next = next;
                    next = block;
                    ++block;
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

            // add this memory into our linked list.
            node* temp = reinterpret_cast<node*>(item);
            temp->next = next;
            next = temp;                
        }

        void swap (
            memory_manager_kernel_2& item
        ) 
        { 
            exchange(allocations,item.allocations); 
            exchange(next,item.next); 
            exchange(first_chunk,item.first_chunk);
        }

    private:

        // data members
        unsigned long allocations;
        node* next;

        chunk_node* first_chunk;




        // restricted functions
        memory_manager_kernel_2(memory_manager_kernel_2&);        // copy constructor
        memory_manager_kernel_2& operator=(memory_manager_kernel_2&);    // assignment operator
    };

    template <
        typename T,
        unsigned long chunk_size
        >
    inline void swap (
        memory_manager_kernel_2<T,chunk_size>& a, 
        memory_manager_kernel_2<T,chunk_size>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MEMORY_MANAGER_KERNEl_2_

