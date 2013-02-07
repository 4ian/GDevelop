// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUEUE_KERNEl_1_
#define DLIB_QUEUE_KERNEl_1_

#include "queue_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager
        >
    class queue_kernel_1 : public enumerable<T>,
                           public remover<T>
    {

        /*!
            INITIAL VALUE
                queue_size == 0   
                current_element == 0
                at_start_ == true
            
            CONVENTION
                queue_size == the number of elements in the queue
                at_start() == at_start_
                current_element_valid() == (current_element != 0)
                element() == current_element->item

                if (queue_size > 0)
                {
                    in points to the last element to be inserted into the queue
                    out points to the next element to be dequeued

                    each node points to the node inserted after it except for the most 
                    recently inserted node

                    current_element == 0
                }
                
        !*/


        struct node
        {
            node* last;

            T item;
        };


        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            queue_kernel_1 (
            ) :
                in(0),
                out(0),
                queue_size(0),
                current_element(0),
                at_start_(true)
            {
            }

            virtual ~queue_kernel_1 (
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
                queue_kernel_1& item
            );

            T& current (
            );

            const T& current (
            ) const;
            
            void swap (
                queue_kernel_1& item
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
                unsigned long length
            );
            /*!
                requires
                    - start points to a node in a singly linked list 
                    - start->last points to the next node in the list 
                    - there are at least length nodes in the list begining with start
                ensures
                    - length nodes have been deleted starting with the node pointed 
                      to by start
            !*/

            // data members

            node* in;
            node* out;
            unsigned long queue_size;
            mutable node* current_element;
            mutable bool at_start_;

            // restricted functions
            queue_kernel_1(queue_kernel_1&);        // copy constructor
            queue_kernel_1& operator=(queue_kernel_1&);    // assignment operator

    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        queue_kernel_1<T,mem_manager>& a, 
        queue_kernel_1<T,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        queue_kernel_1<T,mem_manager>& item,  
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
            throw serialization_error(e.info + "\n   while deserializing object of type queue_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    queue_kernel_1<T,mem_manager>::
    ~queue_kernel_1 (
    )
    {
        delete_nodes(out,queue_size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    clear (
    )
    {
        delete_nodes(out,queue_size);
        queue_size = 0;

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    enqueue (
        T& item
    )
    {
        // make new node
        node* temp = new node;

        // swap item into new node
        exchange(item,temp->item);
        
        if (queue_size == 0)
            out = temp;
        else
            in->last = temp;

        // make in point to the new node
        in = temp;
        
        ++queue_size;

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    dequeue (
        T& item
    )
    {
        // swap out into item
        exchange(item,out->item);

        --queue_size;

        if (queue_size == 0)
        {
            delete out;
        }
        else
        {
            node* temp = out;
            
            // move out pointer to the next element in the queue
            out = out->last;

            // delete old node
            delete temp;
        }

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    cat (
        queue_kernel_1<T,mem_manager>& item
    )
    {
        if (item.queue_size > 0)
        {
            if (queue_size > 0)
            {
                in->last = item.out;
            }
            else
            {
                out = item.out;
            }


            in = item.in;
            queue_size += item.queue_size;
            item.queue_size = 0;
        }

        // put the enumerator at the start
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& queue_kernel_1<T,mem_manager>::
    current (
    )
    {
        return out->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& queue_kernel_1<T,mem_manager>::
    current (
    ) const
    {
        return out->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    swap (
        queue_kernel_1<T,mem_manager>& item
    )
    {
        node* in_temp = in;
        node* out_temp = out;
        unsigned long queue_size_temp = queue_size;
        node* current_element_temp = current_element;
        bool at_start_temp = at_start_;

        in = item.in;
        out = item.out;
        queue_size = item.queue_size;
        current_element = item.current_element;
        at_start_ = item.at_start_;

        item.in = in_temp;
        item.out = out_temp;
        item.queue_size = queue_size_temp;
        item.current_element = current_element_temp;
        item.at_start_ = at_start_temp;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool queue_kernel_1<T,mem_manager>::
    at_start (
    ) const
    {
        return at_start_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long queue_kernel_1<T,mem_manager>::
    size (
    ) const
    {
        return queue_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool queue_kernel_1<T,mem_manager>::
    current_element_valid (
    ) const
    {
        return (current_element != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& queue_kernel_1<T,mem_manager>::
    element (
    ) const
    {
        return current_element->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& queue_kernel_1<T,mem_manager>::
    element (
    )
    {
        return current_element->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool queue_kernel_1<T,mem_manager>::
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
                return true;
            }
        }
        else
        {
            // if we are at the last element then the enumeration has finished
            if (current_element == in || current_element == 0)
            {
                current_element = 0;
                return false;
            }
            else
            {
                current_element = current_element->last;
                return true;
            }           
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // remover function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
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
        typename mem_manager
        >
    void queue_kernel_1<T,mem_manager>::
    delete_nodes (
        node* start,
        unsigned long length
    )
    {
        node* temp;
        while (length)
        {
            temp = start->last;
            delete start;
            start = temp;
            --length;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUEUE_KERNEl_1_

