// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_ENCODER_MODEL_KERNEl_4_
#define DLIB_ENTROPY_ENCODER_MODEL_KERNEl_4_

#include "../algs.h"
#include "entropy_encoder_model_kernel_abstract.h"
#include "../assert.h"



namespace dlib
{

    namespace eemk4
    {
        struct node
        {            
            node* next;
            node* child_context;
            node* parent_context;

            unsigned short symbol;
            unsigned short count;
            unsigned short total;
            unsigned short escapes;
        };
    }


    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    class entropy_encoder_model_kernel_4 
    {
        /*!
            REQUIREMENTS ON total_nodes
                - 4096 < total_nodes
                - this is the total number of nodes that we will use in the tree

            REQUIREMENTS ON order
                - 0 <= order
                - this is the maximum depth-1 the tree will be allowed to go (note 
                  that the root level is depth 0).  

            GENERAL NOTES
                This implementation follows more or less the implementation 
                strategy laid out by Alistair Moffat in his paper
                Implementing the PPM data compression scheme.  Published in IEEE 
                Transactions on Communications, 38(11):1917-1921, 1990.

                The escape method used will be method D. 


            INITIAL VALUE
                - root == pointer to an array of total_nodes nodes
                - next_node == 1
                - cur == root
                - cur_order = 0
                - root->next == 0
                - root->parent_context == 0
                - root->child_context == 0
                - root->escapes == 0
                - root->total == 0

            CONVENTION
                - &get_entropy_encoder() == coder
                - root == pointer to an array of total_nodes nodes.
                  this is also the root of the tree.

                - if (next_node < total_nodes) then
                    - next_node == the next node in root that has not yet been allocated                                

                - root->next == 0
                - root->parent_context == 0
              

                - for every node in the tree:
                  {
                    - NOTATION: 
                        - The "context" of a node is the string of symbols seen
                          when you go from the root of the tree down (down though
                          child context pointers) to the node, including the symbol at 
                          the node itself.  (note that the context of the root node 
                          is "" or the empty string)
                        - A set of nodes is in the same "context set" if all the node's
                          contexts are of length n and all the node's contexts share
                          the same prefix of length n-1.
                        - The "child context set" of a node is a set of nodes with
                          contexts that are one symbol longer and prefixed by the node's 
                          context.  For example, if a node has a context "abc" then the 
                          nodes for contexts "abca", "abcb", "abcc", etc. are all in 
                          the child context set of the node.
                        - The "parent context" of a node is the context that is one 
                          symbol shorter than the node's context and includes the 
                          symbol in the node.  So the parent context of a node with 
                          context "abcd" would be the context "bcd".


                    - if (next != 0) then 
                        - next == pointer to the next node in the same context set
                    - if (child_context != 0) then
                        - child_context == pointer to the first node of the child 
                          context set for this node.
                    - if (parent_context != 0) then
                        - parent_context == pointer to the parent context of this node.
                    - else
                        - this node is the root node of the tree
                  

                    - if (this is not the root node) then
                        - symbol == the symbol represented with this node
                        - count == the number of times this symbol has been seen in its
                          parent context.
                    - else
                        - the root doesn't have a symbol.  i.e. the context for the
                          root node is "" or the empty string.

                    - total == The sum of the counts of all the nodes 
                      in the child context set + escapes. 
                    - escapes == the escape count for the context represented
                      by the node.
                }


                - cur_order < order
                - cur_order == the depth of the node cur in the tree.
                  (note that the root node has depth 0)
                - cur == pointer to the node in the tree who's context matches
                  the most recent symbols we have seen.


        !*/

        typedef eemk4::node node;


    public:

        typedef entropy_encoder entropy_encoder_type;

        entropy_encoder_model_kernel_4 (
            entropy_encoder& coder
        );

        virtual ~entropy_encoder_model_kernel_4 (
        );
        
        inline void clear(
        );

        inline void encode (
            unsigned long symbol
        );

        entropy_encoder& get_entropy_encoder (
        ) { return coder; }

        static unsigned long get_alphabet_size (
        ) { return alphabet_size; }

    private:

        inline eemk4::node* allocate_node (
        );
        /*!
            requires
                - space_left() == true
            ensures
                - returns a pointer to a new node
        !*/

        inline void destroy_tree (
        );
        /*!
            ensures
                - deallocates all nodes except the root
                - #root->child_context == 0
                - #root->escapes == 0
                - #root->total == 0
                - #cur == root
                - #cur_order == 0
        !*/


        inline bool space_left (
        ) const;
        /*!
            ensures
                - returns true if there is at least 1 free node left.
                - returns false otherwise
        !*/


        inline void scale_counts (
            node* n
        );
        /*!
            ensures
                - divides all the counts in the child context set of n by 2.
                - none of the nodes in the child context set will have a count of 0
        !*/


        unsigned long next_node;        
        entropy_encoder& coder;
        node* root;
        node* cur;
        unsigned long cur_order;

        
        // restricted functions
        entropy_encoder_model_kernel_4(entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>&);        // copy constructor
        entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>& operator=(entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    entropy_encoder_model_kernel_4 (
        entropy_encoder& coder_
    ) : 
        next_node(1),
        coder(coder_),
        cur_order(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535 );
        COMPILE_TIME_ASSERT( 4096 < total_nodes );

        root = new node[total_nodes];  
        cur = root;

        root->child_context = 0;
        root->escapes = 0;
        root->next = 0;
        root->parent_context = 0;
        root->total = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    ~entropy_encoder_model_kernel_4 (
    )
    {
        delete [] root;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    clear(
    )
    {
        destroy_tree();
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    encode (
        unsigned long sym
    )
    {
        unsigned short symbol = static_cast<unsigned short>(sym);
        node* temp = cur;
        cur = 0;
        unsigned short low_count, high_count, total_count;
        node* new_node = 0;

        // local_order will track the level of temp in the tree
        unsigned long local_order = cur_order;

        while (true)
        {            
            high_count = 0;
            if (space_left())
            {
                total_count = temp->total;
                
                if (total_count > 0)
                {
                    // check if we need to scale the counts
                    if (total_count > 10000)
                    {
                        scale_counts(temp);
                        total_count = temp->total;
                    }

                    // find either the symbol we are looking for or the 
                    // end of the context set
                    node* n = temp->child_context;
                    node* last = 0;   
                    while (true)
                    {
                        high_count += n->count;
                        
                        if (n->symbol == symbol || n->next == 0)
                            break;
                        last = n;
                        n = n->next;
                    }             

                    low_count = high_count - n->count;

                    // if we found the symbol
                    if (n->symbol == symbol)
                    {
                        if (new_node != 0)
                        {
                            new_node->parent_context = n;                            
                        }

                        coder.encode(low_count,high_count,total_count);
                        n->count += 8;
                        temp->total += 8;


                        // move this node to the front 
                        if (last)
                        {
                            last->next = n->next;
                            n->next = temp->child_context;
                            temp->child_context = n;
                        }


                        if (cur == 0)
                        {
                            if (local_order < order)
                            {
                                cur_order = local_order+1;
                                cur = n;
                            }  
                            else
                            {
                                cur = n->parent_context;
                                cur_order = local_order;
                            }
                        }

                        break;
                    
                    }
                    // if we hit the end of the context set without finding the symbol
                    else
                    {   
                        if (new_node != 0)
                        {
                            new_node->parent_context = allocate_node();
                            new_node = new_node->parent_context;
                        }
                        else
                        {
                            new_node = allocate_node();
                        }

                        n->next = new_node;

                        // write an escape to a lower context
                        coder.encode(high_count,total_count,total_count);
                    }
                        
                } 
                else // if (total_count == 0)
                {
                    // this means that temp->child_context == 0 so we should make
                    // a new node here.
                    if (new_node != 0)
                    {
                        new_node->parent_context = allocate_node();
                        new_node = new_node->parent_context;
                    }
                    else
                    {
                        new_node = allocate_node();
                    }

                    temp->child_context = new_node;
                }

                if (cur == 0 && local_order < order)
                {
                    cur = new_node;
                    cur_order = local_order+1;
                }

                // fill out the new node
                new_node->child_context = 0;
                new_node->count = 4;
                new_node->escapes = 0;
                new_node->next = 0;
                new_node->symbol = static_cast<unsigned short>(symbol);
                new_node->total = 0;
                temp->escapes += 4;
                temp->total += 8;

              
                if (temp != root)
                {
                    temp = temp->parent_context;
                    --local_order;
                    continue;
                }

                // since this is the root we are going to the order-(-1) context
                // so we can just take care of that here.
                new_node->parent_context = root;
                coder.encode(symbol,symbol+1,alphabet_size);

                if (cur == 0)
                {
                    cur = root;
                    cur_order = 0;
                }
                break;
            }
            else 
            {
                // there isn't enough space so we should rebuild the tree
                destroy_tree();
                temp = cur;
                local_order = cur_order;
                cur = 0;                  
                new_node = 0;
            }
        } // while (true)

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    eemk4::node* entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    allocate_node (
    )    
    {
        node* temp;
        temp = root + next_node;
        ++next_node;
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    destroy_tree (
    )
    {        
        next_node = 1;
        root->child_context = 0;
        root->escapes = 0;
        root->total = 0;
        cur = root;
        cur_order = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    bool entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    space_left (
    ) const
    {
        return (next_node < total_nodes);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_encoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_encoder_model_kernel_4<alphabet_size,entropy_encoder,total_nodes,order>::
    scale_counts (
        node* temp
    )
    {
        if (temp->escapes > 1)
            temp->escapes >>= 1;
        temp->total = temp->escapes;

        node* n = temp->child_context;
        while (n != 0)
        {
            if (n->count > 1)
                n->count >>= 1;

            temp->total += n->count;
            n = n->next;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ENTROPY_ENCODER_MODEL_KERNEl_4_

