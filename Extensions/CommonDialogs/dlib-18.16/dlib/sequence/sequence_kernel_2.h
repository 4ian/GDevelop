// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_KERNEl_2_
#define DLIB_SEQUENCE_KERNEl_2_

#include "sequence_kernel_abstract.h"
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
    class sequence_kernel_2 : public enumerable<T>,
                              public remover<T>
    {
        /*!
            INITIAL VALUE
                sequence_size   == 0 
                at_start_       == true
                current_enumeration_node == 0

            CONVENTION
                sequence_size == the number of elements in the sequence

                at_start_ == at_start()
                (current_enumeration_node!=0) == current_element_valid()
                if (current_enumeration_node!=0) then
                    current_enumeration_node->item == element()
                    current_enumeration_pos == the position of the node pointed to by
                                               current_enumeration_node

                if ( sequence_size > 0 )
                {
                    current_node        == pointer to a node in the linked list and
                    current_node->right->right->... eventually == current_node and
                    current_node->left->left->... eventually == current_node and
                    current_pos         == the position in the sequence of 
                                           current_node->item
                }

        !*/

        struct node {
            T item;
            node* right;
            node* left;
        };
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            sequence_kernel_2 (
            ) :
                sequence_size(0),
                at_start_(true),
                current_enumeration_node(0)
            {}

            virtual ~sequence_kernel_2 (
            ); 

            inline void clear (
            );

            void add (
                unsigned long pos,
                T& item
            );

            void remove (
                unsigned long pos,
                T& item
            );

            void cat (
                sequence_kernel_2& item
            );

            const T& operator[] (
                unsigned long pos
            ) const;
            
            T& operator[] (
                unsigned long pos
            );

            void swap (
                sequence_kernel_2& item
            );
 
            // functions from the remover interface
            inline void remove_any (
                T& item
            );

            // functions from the enumerable interface
            inline unsigned long size (
            ) const;

            bool at_start (
            ) const;

            inline void reset (
            ) const;

            bool current_element_valid (
            ) const;

            const T& element (
            ) const;

            T& element (
            );

            bool move_next (
            ) const;

        private:

            void delete_nodes (
                node* current_node,
                unsigned long sequence_size
            );
            /*!
                requires
                    CONVENTION IS CORRECT
                ensures
                    all memory associated with the ring of nodes has been freed
            !*/

            void move_to_pos (
                node*& current_node,
                unsigned long& current_pos,
                unsigned long pos,
                unsigned long size
            ) const;
            /*!
                requires
                    everything in the CONVENTION is correct and
                    there is a node corresponding to pos in the CONVENTION and
                    0 <= pos < size
                ensures
                    current_pos == pos and
                    current_node->item is the item in the sequence associated with 
                    position pos
            !*/

            // data members
            unsigned long sequence_size;
            mutable node* current_node;
            mutable unsigned long current_pos;
            mutable bool at_start_;
            mutable node* current_enumeration_node;
            mutable unsigned long current_enumeration_pos;

            // restricted functions
            sequence_kernel_2(sequence_kernel_2&);        // copy constructor
            sequence_kernel_2& operator=(sequence_kernel_2&); // assignment operator        

    };


    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        sequence_kernel_2<T,mem_manager>& a, 
        sequence_kernel_2<T,mem_manager>& b 
    ) { a.swap(b); }   

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        sequence_kernel_2<T,mem_manager>& item, 
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
                item.add(i,temp);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type sequence_kernel_2"); 
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
    sequence_kernel_2<T,mem_manager>::
    ~sequence_kernel_2 (
    )
    {
        delete_nodes(current_node,sequence_size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    clear (
    )
    {
        if (sequence_size != 0)
        {
            delete_nodes(current_node,sequence_size);
            sequence_size = 0;
        }
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    add (
        unsigned long pos,
        T& item
    )
    {
        // make new node and swap item into it
        node* new_node = new node;
        exchange(item,new_node->item);

        if (sequence_size > 0)
        {
            if (pos == sequence_size)
            {
                move_to_pos(current_node,current_pos,pos-1,sequence_size);
                
                node& n_node = *new_node;
                node& c_node = *current_node;

                // make new node point to the nodes to its left and right
                n_node.right = c_node.right;
                n_node.left  = current_node;

                // make the left node point back to new_node
                c_node.right->left = new_node;

                // make the right node point back to new_node
                c_node.right = new_node;
                current_pos = pos;

            }
            else
            {
                move_to_pos(current_node,current_pos,pos,sequence_size);

                node& n_node = *new_node;
                node& c_node = *current_node;

                // make new node point to the nodes to its left and right
                n_node.right = current_node;
                n_node.left  = c_node.left;

                // make the left node point back to new_node
                c_node.left->right = new_node;

                // make the right node point back to new_node
                c_node.left = new_node;
            }
            
        }
        else
        {
            current_pos = 0;
            new_node->left = new_node;
            new_node->right = new_node;
        }

        // make the new node the current node
        current_node = new_node;    
    
        ++sequence_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    remove (
        unsigned long pos,
        T& item
    )
    {
        move_to_pos(current_node,current_pos,pos,sequence_size);
        node& c_node = *current_node;
        exchange(c_node.item,item);
        
        node* temp = current_node;
        
        // close up gap left by remove
        c_node.left->right = c_node.right;
        c_node.right->left = c_node.left;

        current_node = c_node.right;

        --sequence_size;

        delete temp;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& sequence_kernel_2<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) const
    {
        move_to_pos(current_node,current_pos,pos,sequence_size);
        return current_node->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    cat (
        sequence_kernel_2<T,mem_manager>& item
    )
    {
        if (item.sequence_size > 0)
        {
            if (sequence_size > 0)
            {
                // move both sequences to a convenient location
                move_to_pos(current_node,current_pos,0,sequence_size);
                item.move_to_pos (
                    item.current_node,
                    item.current_pos,
                    item.sequence_size-1,
                    item.sequence_size
                );

                // make copies of poitners
                node& item_right = *item.current_node->right;
                node& left = *current_node->left;


                item.current_node->right = current_node;
                current_node->left = item.current_node;

                left.right = &item_right;
                item_right.left = &left;

                // set sizes
                sequence_size += item.sequence_size;
                item.sequence_size = 0;
            }
            else
            {
                // *this is empty so just swap
                item.swap(*this);                
            }
        }
        item.clear();
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& sequence_kernel_2<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) 
    {
        move_to_pos(current_node,current_pos,pos,sequence_size);
        return current_node->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long sequence_kernel_2<T,mem_manager>::
    size (
    ) const
    {
        return sequence_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    swap (
        sequence_kernel_2<T,mem_manager>& item
    )
    {
        unsigned long   sequence_size_temp         = item.sequence_size;
        node*           current_node_temp          = item.current_node;
        unsigned long   current_pos_temp           = item.current_pos;
        bool            at_start_temp              = item.at_start_;
        node*           current_enumeration_node_temp = item.current_enumeration_node;
        unsigned long   current_enumeration_pos_temp = item.current_enumeration_pos;

        item.sequence_size  = sequence_size;
        item.current_node   = current_node;
        item.current_pos    = current_pos;
        item.at_start_      = at_start_;
        item.current_enumeration_node = current_enumeration_node;
        item.current_enumeration_pos = current_enumeration_pos;

        sequence_size   = sequence_size_temp;
        current_node    = current_node_temp;
        current_pos     = current_pos_temp;
        at_start_       = at_start_temp;
        current_enumeration_node = current_enumeration_node_temp;
        current_enumeration_pos = current_enumeration_pos_temp;
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
    bool sequence_kernel_2<T,mem_manager>::
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
    void sequence_kernel_2<T,mem_manager>::
    reset (
    ) const
    {
        at_start_ = true;
        current_enumeration_node = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_2<T,mem_manager>::
    current_element_valid (
    ) const
    {
        return (current_enumeration_node!=0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& sequence_kernel_2<T,mem_manager>::
    element (
    ) const
    {
        return current_enumeration_node->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& sequence_kernel_2<T,mem_manager>::
    element (
    )
    {
        return current_enumeration_node->item;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_2<T,mem_manager>::
    move_next (
    ) const
    {
        if (at_start_ && sequence_size>0)
        {            
            move_to_pos(current_node,current_pos,0,sequence_size);            
            current_enumeration_node = current_node;
            current_enumeration_pos = 0;
        }
        else if (current_enumeration_node!=0)
        {
            ++current_enumeration_pos;
            if (current_enumeration_pos<sequence_size)
            {                
                current_enumeration_node = current_enumeration_node->right;
            }
            else
            {
                // we have reached the end of the sequence
                current_enumeration_node = 0;
            }
        }

        at_start_ = false;
        return (current_enumeration_node!=0);
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
    void sequence_kernel_2<T,mem_manager>::
    remove_any (
        T& item
    ) 
    {
        remove(0,item);
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
    void sequence_kernel_2<T,mem_manager>::
    delete_nodes (
        node* current_node,
        unsigned long sequence_size
    )
    {
        node* temp;
        while (sequence_size)
        {
            temp = current_node->right;
            delete current_node;
            current_node = temp;
            --sequence_size;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_2<T,mem_manager>::
    move_to_pos (
        node*& current_node,
        unsigned long& current_pos,
        unsigned long pos,
        unsigned long size
    ) const
    {
        if ( current_pos > pos)
        {
            // number of hops in each direction needed to reach pos
            unsigned long right = size + pos - current_pos;
            unsigned long left = current_pos - pos;
            current_pos = pos;

            if (left < right)
            {
                // move left to position pos
                for (; left > 0; --left)
                    current_node = current_node->left;
            }
            else
            {
                // move left to position pos
                for (; right > 0; --right)
                    current_node = current_node->right;
            }
        }
        else if (current_pos != pos)
        {
            // number of hops in each direction needed to reach pos
            unsigned long right = pos - current_pos;
            unsigned long left = size - pos + current_pos;
            current_pos = pos;

            if (left < right)
            {
                // move left to position pos
                for (; left > 0; --left)
                    current_node = current_node->left;
            }
            else
            {
                // move left to position pos
                for (; right > 0; --right)
                    current_node = current_node->right;
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_KERNEl_2_

