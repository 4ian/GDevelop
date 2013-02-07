// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STACK_KERNEl_1_
#define DLIB_STACK_KERNEl_1_

#include "stack_kernel_abstract.h"
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
    class stack_kernel_1 : public enumerable<T>,
                           public remover<T>
    {

        /*!
            INITIAL VALUE
                stack_size == 0 
                top == 0
                current_element == 0
                _at_start == true


            CONVENTION
                at_start() == _at_start
                current_element_valid() == (current_element != 0)
                if (current_element != 0) then
                    element() == current_element->item

                stack_size == the number of elements in the stack. 
                Each node points to the next node to be poped off the stack.
                The last node in the list has its next pointer is set to 0.
                
                if (size == 0)
                {
                    top == 0
                }
                else
                {
                    top == pointer to the last element added to the stack
                }
        !*/
        
        struct node
        {
            node* next;
            T item;
        };
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            stack_kernel_1(
            ):
                top(0),
                stack_size(0),
                current_element(0),
                _at_start(true)
            {}
    
            virtual ~stack_kernel_1(
            );

            inline void clear(
            );

            inline void push(
                T& item
            );

            void pop(
                T& item
            );

            T& current(
            );

            const T& current(
            ) const;

            inline void swap (
                stack_kernel_1& item
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

            void delete_elements_in_stack(
                node*& top
            );
            /*!
                requires
                    - top points to the top of the stack
                ensures
                    - all memory has been freed 
                    - #top = 0
            !*/


            // data members
            typename mem_manager::template rebind<node>::other pool;
            node* top;
            unsigned long stack_size;
            mutable node* current_element;
            mutable bool _at_start;


            // restricted functions
            stack_kernel_1(stack_kernel_1&);        // copy constructor
            stack_kernel_1& operator=(stack_kernel_1&); // assignment operator

    };


    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        stack_kernel_1<T,mem_manager>& a, 
        stack_kernel_1<T,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        stack_kernel_1<T,mem_manager>& item, 
        std::istream& in
    )
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            T temp = T();
            stack_kernel_1<T> temp_stack;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(temp,in);
                temp_stack.push(temp);
            }
            while (temp_stack.size() > 0)
            {
                temp_stack.pop(temp);
                item.push(temp);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type stack_kernel_1"); 
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
    stack_kernel_1<T,mem_manager>::
    ~stack_kernel_1(
    ) 
    {
        delete_elements_in_stack(top);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void stack_kernel_1<T,mem_manager>::
    clear(
    )
    {
        if (stack_size != 0)
        {
            delete_elements_in_stack(top);
            stack_size = 0;
        }
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& stack_kernel_1<T,mem_manager>::
    current(
    )
    {
        return top->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& stack_kernel_1<T,mem_manager>::
    current(
    ) const
    {
        return top->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void stack_kernel_1<T,mem_manager>::
    swap(
        stack_kernel_1<T,mem_manager>& item
    )
    {
        pool.swap(item.pool);

        // declare temp variables
        node* top_temp;
        unsigned long stack_size_temp;

        // swap stack_size variables
        stack_size_temp = item.stack_size;
        item.stack_size = stack_size;
        stack_size = stack_size_temp;

        // swap top pointers
        top_temp = item.top;
        item.top = top;
        top = top_temp;

        exchange(current_element,item.current_element);
        exchange(_at_start,item._at_start);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void stack_kernel_1<T,mem_manager>::
    push(
        T& item
    )
    {
        // allocate memory for new node
        node* new_node = pool.allocate();

        // swap item into new_node
        exchange(new_node->item,item);
        
        // put new_node into stack
        new_node->next = top;
        top = new_node;
        ++stack_size;

        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void stack_kernel_1<T,mem_manager>::
    pop(
        T& item
    )
    {
        node* old_node = top;
        top = top->next;

        // swap the item from the stack into item
        exchange(old_node->item,item);
        
        // free the memory
        pool.deallocate(old_node);
        --stack_size;

        reset();
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
    void stack_kernel_1<T,mem_manager>::
    delete_elements_in_stack(
        node*& top
    )
    {
        node* temp;
        while (top != 0)
        {
            temp = top->next;
            pool.deallocate(top);
            top = temp;
        }
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
    unsigned long stack_kernel_1<T,mem_manager>::
    size (
    ) const
    {
        return stack_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool stack_kernel_1<T,mem_manager>::
    at_start (
    ) const
    {
        return _at_start;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void stack_kernel_1<T,mem_manager>::
    reset (
    ) const
    {
        _at_start = true;
        current_element = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool stack_kernel_1<T,mem_manager>::
    current_element_valid (
    ) const
    {
        return current_element != 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& stack_kernel_1<T,mem_manager>::
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
    T& stack_kernel_1<T,mem_manager>::
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
    bool stack_kernel_1<T,mem_manager>::
    move_next (
    ) const
    {
        if (!_at_start)
        {
            if (current_element)
            {
                current_element = current_element->next;
                if (current_element)
                    return true;
                else
                    return false;
                }
            else
            {
                return false;
            }
        }
        else
        {
            _at_start = false;
            if (stack_size)
            {
                current_element = top;
                return true;
            }
            else
            {
                return false;
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
    void stack_kernel_1<T,mem_manager>::
    remove_any (
        T& item
    ) 
    {
        pop(item);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STACK_KERNEl_1_

