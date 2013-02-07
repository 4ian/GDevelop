// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MEMORY_MANAGER_KERNEl_3_
#define DLIB_MEMORY_MANAGER_KERNEl_3_

#include "../algs.h"
#include "memory_manager_kernel_abstract.h"
#include "../assert.h"
#include <new>
#include "memory_manager_kernel_2.h"
#include "../binary_search_tree/binary_search_tree_kernel_2.h"


namespace dlib
{

    template <
        typename T,
        unsigned long chunk_size
        >
    class memory_manager_kernel_3
    {
        /*!            
            INITIAL VALUE
                allocations == 0
                next == 0
                first_chunk == 0
                bst_of_arrays == 0

            REQUIREMENTS ON chunk_size
                chunk_size is the number of items of type T we will allocate at a time. so
                it must be > 0.

            CONVENTION
                This memory manager implementation allocates memory in blocks of chunk_size*sizeof(T)
                bytes.  All the sizeof(T) subblocks are kept in a linked list of free memory blocks
                and are given out whenever an allocation request occurs.  Also, memory is not freed
                until this object is destructed.  
                


                allocations == get_number_of_allocations()

                - if (next != 0) then
                    - next == the next pointer to return from allocate()
                      and next == pointer to the first node in a linked list.  each node
                      is one item in the memory pool.    
                    - the last node in the linked list has next set to 0
                - else
                    - we need to call new to get the next pointer to return from allocate()

                - if (arrays != 0) then
                    - someone has called allocate_array()
                    - (*arrays)[size] == an array of size bytes of memory  

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


        typedef binary_search_tree_kernel_2<
            size_t,
            char*,
            memory_manager_kernel_2<char,5>
            > bst_of_arrays; 

    public:

        typedef T type;

        template <typename U>
        struct rebind {
            typedef memory_manager_kernel_3<U,chunk_size> other;
        };


        memory_manager_kernel_3(
        ) :
            allocations(0),
            next(0),
            first_chunk(0),
            arrays(0)
        {
            // You FOOL!  You can't have a zero chunk_size.
            COMPILE_TIME_ASSERT(chunk_size > 0);
        }

        virtual ~memory_manager_kernel_3(
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

            if (arrays)
            {
                arrays->reset();
                while (arrays->move_next())
                {
                    ::operator delete (arrays->element().value());
                }
                delete arrays;
            }
        }

        unsigned long get_number_of_allocations (
        ) const { return allocations; }

        T* allocate_array (
            unsigned long size
        )
        {
            size_t block_size = sizeof(T)*size + sizeof(size_t)*2;

            // make sure we have initialized the arrays object.
            if (arrays == 0)
            {
                arrays = new bst_of_arrays;
            }

            char* temp;

            // see if we have a suitable block of memory already.
            arrays->position_enumerator(block_size);
            if (arrays->current_element_valid())
            {
                // we have a suitable block of memory already so use that one.
                arrays->remove_current_element(block_size,temp); 
            }
            else
            {
                temp = static_cast<char*>(::operator new(block_size));
            }

            reinterpret_cast<size_t*>(temp)[0] = block_size;
            reinterpret_cast<size_t*>(temp)[1] = size;
            temp += sizeof(size_t)*2;

            try
            {
                initialize_array(reinterpret_cast<T*>(temp),size);
            }
            catch (...)
            {
                // something was thrown while we were initializing the array so
                // stick our memory block into arrays and rethrow the exception
                temp -= sizeof(size_t)*2;
                arrays->add(block_size,temp);
                throw;
            }

            ++allocations;
            return reinterpret_cast<T*>(temp);
        }

        void deallocate_array (
            T* item
        )
        {
            char* temp = reinterpret_cast<char*>(item);
            temp -= sizeof(size_t)*2;
            size_t block_size = reinterpret_cast<size_t*>(temp)[0];
            size_t size = reinterpret_cast<size_t*>(temp)[1];

            deinitialize_array(item,size);

            arrays->add(block_size,temp);
            
            --allocations;
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
            }
            else
            {
                // the linked list is empty so we need to allocate some more memory
                node* block = static_cast<node*>(::operator new (sizeof(node)*chunk_size));

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
            memory_manager_kernel_3& item
        ) 
        { 
            exchange(allocations,item.allocations); 
            exchange(next,item.next); 
            exchange(first_chunk,item.first_chunk);
            exchange(arrays,item.arrays);
        }

    private:

        // data members
        unsigned long allocations;
        node* next;

        chunk_node* first_chunk;
        bst_of_arrays* arrays;


        void initialize_array (
            T* array,
            size_t size
        ) const
        {
            size_t i;
            try
            {
                for (i = 0; i < size; ++i)
                {
                    // construct this new T object with placement new.
                    new (static_cast<void*>(array+i))T();
                }
            }
            catch (...)
            {
                // Catch any exceptions thrown during the construction process
                // and then destruct any T objects that actually were successfully
                // constructed.
                for (size_t j = 0; j < i; ++j)
                {
                    array[i].~T();
                }
                throw;
            }
        }

        void deinitialize_array (
            T* array,
            size_t size
        ) const
        {
            for (size_t i = 0; i < size; ++i)
            {
                array[i].~T();
            }
        }

        // don't do any initialization for the built in types
        void initialize_array(unsigned char*, size_t) {} 
        void deinitialize_array(unsigned char*, size_t) {}
        void initialize_array(signed char*, size_t) {} 
        void deinitialize_array(signed char*, size_t) {}
        void initialize_array(char*, size_t) {} 
        void deinitialize_array(char*, size_t) {}
        void initialize_array(int*, size_t) {} 
        void deinitialize_array(int*, size_t) {}
        void initialize_array(unsigned int*, size_t) {} 
        void deinitialize_array(unsigned int*, size_t) {}
        void initialize_array(unsigned long*, size_t) {} 
        void deinitialize_array(unsigned long*, size_t) {}
        void initialize_array(long*, size_t) {} 
        void deinitialize_array(long*, size_t) {}
        void initialize_array(float*, size_t) {} 
        void deinitialize_array(float*, size_t) {}
        void initialize_array(double*, size_t) {} 
        void deinitialize_array(double*, size_t) {}
        void initialize_array(short*, size_t) {} 
        void deinitialize_array(short*, size_t) {}
        void initialize_array(unsigned short*, size_t) {} 
        void deinitialize_array(unsigned short*, size_t) {}



        // restricted functions
        memory_manager_kernel_3(memory_manager_kernel_3&);        // copy constructor
        memory_manager_kernel_3& operator=(memory_manager_kernel_3&);    // assignment operator
    };

    template <
        typename T,
        unsigned long chunk_size
        >
    inline void swap (
        memory_manager_kernel_3<T,chunk_size>& a, 
        memory_manager_kernel_3<T,chunk_size>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MEMORY_MANAGER_KERNEl_3_

