// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONDITIONING_CLASS_KERNEl_4_
#define DLIB_CONDITIONING_CLASS_KERNEl_4_

#include "conditioning_class_kernel_abstract.h"
#include "../assert.h"
#include "../algs.h"

namespace dlib
{
    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    class conditioning_class_kernel_4 
    {
        /*!
            REQUIREMENTS ON pool_size
                pool_size > 0
                this will be the number of nodes contained in our memory pool

            REQUIREMENTS ON mem_manager
                mem_manager is an implementation of memory_manager/memory_manager_kernel_abstract.h

            INITIAL VALUE
                total == 1
                escapes == 1
                next == 0
                
            CONVENTION                
                get_total() == total
                get_count(alphabet_size-1) == escapes

                if (next != 0) then
                    next == pointer to the start of a linked list and the linked list
                            is terminated by a node with a next pointer of 0.

                get_count(symbol) == node::count for the node where node::symbol==symbol 
                                     or 0 if no such node currently exists.

                if (there is a node for the symbol) then
                    LOW_COUNT(symbol) == the sum of all node's counts in the linked list
                    up to but not including the node for the symbol.

                get_memory_usage() == global_state.memory_usage
        !*/


        struct node
        {
            unsigned short symbol;
            unsigned short count;
            node* next;
        };

    public:

        class global_state_type
        {
        public:
            global_state_type (
            ) : 
                memory_usage(pool_size*sizeof(node)+sizeof(global_state_type))
                {}
        private:
            unsigned long memory_usage;

            typename mem_manager::template rebind<node>::other pool;

            friend class conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>;
        };

        conditioning_class_kernel_4 (
            global_state_type& global_state_
        );

        ~conditioning_class_kernel_4 (
        );

        void clear(
        );

        bool increment_count (
            unsigned long symbol,
            unsigned short amount = 1
        );

        unsigned long get_count (
            unsigned long symbol
        ) const;

        inline unsigned long get_total (
        ) const;
        
        unsigned long get_range (
            unsigned long symbol,
            unsigned long& low_count,
            unsigned long& high_count,
            unsigned long& total_count
        ) const;

        void get_symbol (
            unsigned long target,
            unsigned long& symbol,            
            unsigned long& low_count,
            unsigned long& high_count
        ) const;

        unsigned long get_memory_usage (
        ) const;

        global_state_type& get_global_state (
        );

        static unsigned long get_alphabet_size (
        );


    private:

        void half_counts (
        );
        /*!
            ensures
                - divides all counts by 2 but ensures that escapes is always at least 1
        !*/

        // restricted functions
        conditioning_class_kernel_4(conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>&);        // copy constructor
        conditioning_class_kernel_4& operator=(conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>&);    // assignment operator

        // data members
        unsigned short total;
        unsigned short escapes;
        node* next;
        global_state_type& global_state;

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    conditioning_class_kernel_4 (
        global_state_type& global_state_
    ) :
        total(1),
        escapes(1),
        next(0),
        global_state(global_state_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65536 );

        // update memory usage
        global_state.memory_usage += sizeof(conditioning_class_kernel_4);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    ~conditioning_class_kernel_4 (
    )
    {
        clear();
        // update memory usage
        global_state.memory_usage -= sizeof(conditioning_class_kernel_4);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    void conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    clear(
    )
    {
        total = 1;
        escapes = 1;
        while (next)
        {
            node* temp = next;
            next = next->next;
            global_state.pool.deallocate(temp);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    unsigned long conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_memory_usage(
    ) const
    {
        return global_state.memory_usage;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    typename conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::global_state_type& conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_global_state(
    )
    {
        return global_state;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    bool conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    increment_count (
        unsigned long symbol,
        unsigned short amount
    )
    {        
        if (symbol == alphabet_size-1)
        {
            // make sure we won't cause any overflow
            if (total >= 65536 - amount )                        
                half_counts();

            escapes += amount;
            total += amount;
            return true;
        }

        
        // find the symbol and increment it or add a new node to the list
        if (next)
        {
            node* temp = next;
            node* previous = 0;
            while (true)
            {
                if (temp->symbol == static_cast<unsigned short>(symbol))
                {
                    // make sure we won't cause any overflow
                    if (total >= 65536 - amount )                        
                        half_counts();
                    
                    // we have found the symbol
                    total += amount;
                    temp->count += amount;

                    // if this node now has a count greater than its parent node
                    if (previous && temp->count > previous->count)
                    {
                        // swap the nodes so that the nodes will be in semi-sorted order
                        swap(temp->count,previous->count);
                        swap(temp->symbol,previous->symbol);
                    }
                    return true;
                }
                else if (temp->next == 0)
                {
                    // we did not find the symbol so try to add it to the list
                    if (global_state.pool.get_number_of_allocations() < pool_size)
                    {
                        // make sure we won't cause any overflow
                        if (total >= 65536 - amount )                        
                            half_counts();

                        node* t = global_state.pool.allocate();
                        t->next = 0;
                        t->symbol = static_cast<unsigned short>(symbol);
                        t->count = amount;
                        temp->next = t;
                        total += amount;
                        return true;
                    }
                    else
                    {
                        // no memory left
                        return false;
                    }
                }
                else if (temp->count == 0)
                {
                    // remove nodes that have a zero count
                    if (previous)
                    {
                        previous->next = temp->next;
                        node* t = temp;
                        temp = temp->next;
                        global_state.pool.deallocate(t);
                    }
                    else
                    {
                        next = temp->next;
                        node* t = temp;
                        temp = temp->next;
                        global_state.pool.deallocate(t);
                    }
                }
                else
                {
                    previous = temp;
                    temp = temp->next;
                }
            } // while (true)
        }
        // if there aren't any nodes in the list yet then do this instead
        else
        {
            if (global_state.pool.get_number_of_allocations() < pool_size)
            {
                // make sure we won't cause any overflow
                if (total >= 65536 - amount )                        
                    half_counts();

                next = global_state.pool.allocate();
                next->next = 0;
                next->symbol = static_cast<unsigned short>(symbol);
                next->count = amount;
                total += amount;
                return true;
            }
            else
            {
                // no memory left
                return false;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    unsigned long conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_count (
        unsigned long symbol
    ) const
    {
        if (symbol == alphabet_size-1)
        { 
            return escapes;
        }
        else
        {
            node* temp = next;
            while (temp)
            {
                if (temp->symbol == symbol)
                    return temp->count;
                temp = temp->next;
            }
            return 0;
        }        
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    unsigned long conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_alphabet_size (        
    ) 
    {
        return alphabet_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    unsigned long conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_total (
    ) const
    {
        return total;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    unsigned long conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_range (
        unsigned long symbol,
        unsigned long& low_count,
        unsigned long& high_count,
        unsigned long& total_count
    ) const
    {   
        if (symbol != alphabet_size-1)
        {
            node* temp = next;
            unsigned long low = 0;
            while (temp)
            {
                if (temp->symbol == static_cast<unsigned short>(symbol))
                {
                    high_count = temp->count + low;
                    low_count = low;                
                    total_count = total;
                    return temp->count;
                }
                low += temp->count;
                temp = temp->next;
            }
            return 0;
        }
        else
        {
            total_count = total;
            high_count = total;
            low_count = total-escapes;
            return escapes;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    void conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    get_symbol (
        unsigned long target,
        unsigned long& symbol,            
        unsigned long& low_count,
        unsigned long& high_count
    ) const
    {
        node* temp = next;
        unsigned long high = 0;
        while (true)
        {
            if (temp != 0)
            {
                high += temp->count;
                if (target < high)
                {
                    symbol = temp->symbol;
                    high_count = high;
                    low_count = high - temp->count;
                    return;
                }
                temp = temp->next;
            }
            else
            {
                // this must be the escape symbol
                symbol = alphabet_size-1;
                low_count = total-escapes;
                high_count = total;
                return;
            }            
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------


    template <
        unsigned long alphabet_size,
        unsigned long pool_size,
        typename mem_manager
        >
    void conditioning_class_kernel_4<alphabet_size,pool_size,mem_manager>::
    half_counts (
    ) 
    {
        total = 0;
        if (escapes > 1)
            escapes >>= 1;

        //divide all counts by 2
        node* temp = next;
        while (temp)
        {
            temp->count >>= 1;
            total += temp->count;
            temp = temp->next;
        }
        total += escapes;
    }

// ----------------------------------------------------------------------------------------
 
}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_4_

