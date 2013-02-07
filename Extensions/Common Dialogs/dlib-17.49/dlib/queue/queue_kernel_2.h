// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUEUE_KERNEl_2_
#define DLIB_QUEUE_KERNEl_2_

#include "queue_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager = default_memory_manager
        >
    class queue_kernel_2 : public enumerable<T>,
                           public remover<T>
    {

        /*!
            REQUIREMENTS ON block_size
                0 < block_size < 2000000000

            INITIAL VALUE
                queue_size == 0   
                current_element == 0
                at_start_ == true
            
            CONVENTION
                queue_size == the number of elements in the queue
                at_start() == at_start_
                current_element_valid() == (current_element != 0)
                if (current_element_valid()) then
                    element() == current_element->item[current_element_pos]

                if (queue_size > 0)                
                {                    
                    in->item[in_pos] == the spot where we will put the next item added
                                        into the queue
                    out->item[out_pos] == current()

                    when enqueuing elements inside each node item[0] is filled first, then 
                    item[1], then item[2], etc.
                                                         

                    each node points to the node inserted after it except for the most 
                    recently inserted node.  
                }
                
        !*/


        struct node
        {
            node* next;

            T item[block_size];
        };

        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            queue_kernel_2 (
            ) :
                in(0),
                out(0),
                queue_size(0),
                current_element(0),
                at_start_(true)
            {
            }

            virtual ~queue_kernel_2 (
            ); 

            inline void clear(
            );

            void enqueue (
                T& item
            );

            void dequeue (
                T& item
            );

            void cat (
                queue_kernel_2& item
            );

            T& current (
            );

            const T& current (
            ) const;            

            void swap (
                queue_kernel_2& item
            );

            // functions from the remover interface
            inline void remove_any (
                T& item
            );

            // functions from the enumerable interface
            inline unsigned long size (
            ) const;

            inline bool at_start (
            ) const;

            inline void reset (
            ) const;

            bool current_element_valid (
            ) const;

            inline const T& element (
            ) const;

            inline T& element (
            );

            bool move_next (
            ) const;

        private:

            void delete_nodes (
                node* start,
                node* end
            );
            /*!
                requires
                    - start points to a node in a singly linked list 
                    - start->next points to the next node in the list 
                    - by following the next pointers you eventually hit the node pointed
                      to by end
                ensures
                    - calls delete on the start node, the end node, and all nodes in between
            !*/

            // data members

            typename mem_manager::template rebind<node>::other pool; 

            node* in;
            node* out;
            unsigned long queue_size;
            unsigned long in_pos;
            unsigned long out_pos;


            mutable node* current_element;
            mutable unsigned long current_element_pos;
            mutable bool at_start_;

            // restricted functions
            queue_kernel_2(queue_kernel_2&);        // copy constructor
            queue_kernel_2& operator=(queue_kernel_2&);    // assignment operator

    };

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    inline void swap (
        queue_kernel_2<T,block_size,mem_manager>& a, 
        queue_kernel_2<T,block_size,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void deserialize (
        queue_kernel_2<T,block_size,mem_manager>& item, 
        std::istream& in
    )
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            T temp;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(temp,in);
                item.enqueue(temp);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type queue_kernel_2"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    queue_kernel_2<T,block_size,mem_manager>::
    ~queue_kernel_2 (
    )
    {
        COMPILE_TIME_ASSERT(0 < block_size && block_size < (unsigned long)(2000000000));

        if (queue_size > 0)
            delete_nodes(out,in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    clear (
    )
    {
        if (queue_size > 0)
        {
            delete_nodes(out,in);
            queue_size = 0;
        }

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    enqueue (
        T& item
    )
    {
        if (queue_size == 0)
        {
            out = in = pool.allocate();
            in_pos = 0;
            out_pos = 0;
        }
        else if (in_pos >= block_size)
        {            
            in->next = pool.allocate();
            in_pos = 0;
            in = in->next;
        }

        exchange(item,in->item[in_pos]);
        ++in_pos;

        ++queue_size;

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    dequeue (
        T& item
    )
    {
        // swap out into item
        exchange(item,out->item[out_pos]);
        
        ++out_pos;
        --queue_size;

        // if this was the last element in this node then remove this node
        if (out_pos == block_size)
        {
            out_pos = 0;
            node* temp = out;
            out = out->next;
            pool.deallocate(temp);
        }
        else if (queue_size == 0)
        {
            pool.deallocate(out);
        }

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    cat (
        queue_kernel_2<T,block_size,mem_manager>& item
    )
    {
        if (queue_size > 0)
        {
            T temp;
            assign_zero_if_built_in_scalar_type(temp);
            while (item.size() > 0)
            {
                item.dequeue(temp);
                enqueue(temp);
            }
        }
        else
        {
            in = item.in;
            out = item.out;
            out_pos = item.out_pos;
            in_pos = item.in_pos;

            queue_size = item.queue_size;
            item.queue_size = 0;

            // put the enumerator at the start
            reset();
        }       
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    T& queue_kernel_2<T,block_size,mem_manager>::
    current (
    )
    {
        return out->item[out_pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    const T& queue_kernel_2<T,block_size,mem_manager>::
    current (
    ) const
    {
        return out->item[out_pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    swap (
        queue_kernel_2<T,block_size,mem_manager>& item
    )
    {
        exchange(in,item.in);
        exchange(out,item.out);
        exchange(queue_size,item.queue_size);
        exchange(in_pos,item.in_pos);
        exchange(out_pos,item.out_pos);
        exchange(current_element,item.current_element);
        exchange(current_element_pos,item.current_element_pos);
        exchange(at_start_,item.at_start_);        
        pool.swap(item.pool);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    unsigned long queue_kernel_2<T,block_size,mem_manager>::
    size (
    ) const
    {
        return queue_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    bool queue_kernel_2<T,block_size,mem_manager>::
    at_start (
    ) const
    {
        return at_start_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    bool queue_kernel_2<T,block_size,mem_manager>::
    current_element_valid (
    ) const
    {
        return (current_element != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    const T& queue_kernel_2<T,block_size,mem_manager>::
    element (
    ) const
    {
        return current_element->item[current_element_pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    T& queue_kernel_2<T,block_size,mem_manager>::
    element (
    )
    {
        return current_element->item[current_element_pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    bool queue_kernel_2<T,block_size,mem_manager>::
    move_next (
    ) const
    {
        if (at_start_)
        {
            at_start_ = false;
            // if the queue is empty then there is nothing to do
            if (queue_size == 0)
            {
                return false;
            }
            else
            {
                current_element = out;
                current_element_pos = out_pos;
                return true;
            }
        }
        else if (current_element == 0)
        {
            return false;
        }
        else
        {
            ++current_element_pos;
            // if we are at the last element then the enumeration has finished
            if (current_element == in && current_element_pos == in_pos )
            {
                current_element = 0;
                return false;
            }
            else if (current_element_pos == block_size)
            {
                current_element_pos = 0;
                current_element = current_element->next;               
            }           

            return true;
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // remover function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    remove_any (
        T& item
    ) 
    {
        dequeue(item);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long block_size,
        typename mem_manager
        >
    void queue_kernel_2<T,block_size,mem_manager>::
    delete_nodes (
        node* start,
        node* end
    )
    {
        node* temp;
        while (start != end)
        {
            temp = start;
            start = start->next;
            pool.deallocate(temp);
        }
        pool.deallocate(start);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUEUE_KERNEl_2_

