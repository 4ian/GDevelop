// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ENTROPY_DECODER_MODEL_KERNEl_5_
#define DLIB_ENTROPY_DECODER_MODEL_KERNEl_5_

#include "../algs.h"
#include "entropy_decoder_model_kernel_abstract.h"
#include "../assert.h"


namespace dlib
{

    namespace edmk5
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
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    class entropy_decoder_model_kernel_5 
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

                This also uses Dmitry Shkarin's Information Inheritance scheme.
                (described in "PPM: one step to practicality" and "Improving the 
                Efficiency of the PPM Algorithm")


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
                - stack_size == 0
                - exc_used == false
                - for all i: exc[i] == 0

            CONVENTION
                - exc_used == something_is_excluded()
                - pop() == stack[stack_size-1].n and stack[stack_size-1].nc
                - is_excluded(symbol) == bit symbol&0x1F from exc[symbol>>5]
                - &get_entropy_decoder() == coder
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
                        - escapes > 0 
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
                    - count > 0
                }


                - cur_order < order
                - cur_order == the depth of the node cur in the tree.
                  (note that the root node has depth 0)
                - cur == pointer to the node in the tree who's context matches
                  the most recent symbols we have seen.


        !*/

        typedef edmk5::node node;

    public:

        typedef entropy_decoder entropy_decoder_type;

        entropy_decoder_model_kernel_5 (
            entropy_decoder& coder
        );

        virtual ~entropy_decoder_model_kernel_5 (
        );
        
        inline void clear(
        );

        inline void decode (
            unsigned long& symbol
        );

        entropy_decoder& get_entropy_decoder (
        ) { return coder; }

        static unsigned long get_alphabet_size (
        ) { return alphabet_size; }

    private:


        inline void push (
            node* n,
            node* nc
        );
        /*!
            requires
                - stack_size < order
            ensures
                - #pop(a,b): a == n && b == nc
        !*/

        inline void pop (
            node*& n,
            node*& nc
        );
        /*!
            requires
                - stack_size > 0
            ensures
                - returns the two nodes at the top of the stack
        !*/

        inline edmk5::node* allocate_node (
        );
        /*!
            requires
                - space_left() == true
            ensures
                - returns a pointer to a new node
        !*/

        inline bool space_left (
        ) const;
        /*!
            ensures
                - returns true if there is at least 1 free node left.
                - returns false otherwise
        !*/

        inline void exclude (
            unsigned short symbol
        );
        /*!
            ensures
                - #is_excluded(symbol) == true
                - #something_is_excluded() == true
        !*/

        inline bool is_excluded (
            unsigned short symbol
        );
        /*!
            ensures
                - if (symbol has been excluded) then
                    - returns true
                - else
                    - returns false
        !*/

        inline bool something_is_excluded (
        );
        /*!
            ensures
                - returns true if some symbol has been excluded.
                  returns false otherwise
        !*/

        inline void clear_exclusions (
        );
        /*!
            ensures
                - for all symbols #is_excluded(symbol) == false
                - #something_is_excluded() == false
        !*/

        inline void scale_counts (
            node* n
        );
        /*!
            ensures
                - divides all the counts in the child context set of n by 2.
                - none of the nodes in the child context set will have a count of 0
        !*/

        struct nodes
        {
            node* n;
            node* nc;
        };

        entropy_decoder& coder;
        unsigned long next_node;        
        node* root;
        node* cur;
        unsigned long cur_order;
        unsigned long exc[alphabet_size/32+1];
        nodes stack[order+1];
        unsigned long stack_size;
        bool exc_used;

        // restricted functions
        entropy_decoder_model_kernel_5(entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>&);        // copy constructor
        entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>& operator=(entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>&);    // assignment operator

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    entropy_decoder_model_kernel_5 (
        entropy_decoder& coder_
    ) : 
        coder(coder_),
        next_node(1),
        cur_order(0),
        stack_size(0)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65535);
        COMPILE_TIME_ASSERT( 4096 < total_nodes );

        root = new node[total_nodes];  
        cur = root;

        root->child_context = 0;
        root->escapes = 0;
        root->next = 0;
        root->parent_context = 0;
        root->total = 0; 

        clear_exclusions();
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    ~entropy_decoder_model_kernel_5 (
    )
    {
        delete [] root;
    }
    
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    clear(
    )
    {
        next_node = 1;
        root->child_context = 0;
        root->escapes = 0;
        root->total = 0;
        cur = root;
        cur_order = 0;
        stack_size = 0;

        clear_exclusions();
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    decode (
        unsigned long& symbol
    )
    {        
        node* temp = cur;
        cur = 0;
        unsigned long low_count, high_count, total_count;
        unsigned long target;
        node* new_node = 0;

        // local_order will track the level of temp in the tree
        unsigned long local_order = cur_order;


        unsigned short c; // c == t(a|sk)
        unsigned short t; // t == T(sk)


        if (something_is_excluded())
            clear_exclusions();

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

                    if (something_is_excluded())
                    {
                        node* n = temp->child_context;
                        total_count = temp->escapes;
                        while (true)
                        {
                            if (is_excluded(n->symbol) == false)
                            {
                                total_count += n->count;
                            }
                            if (n->next == 0)
                                break;
                            n = n->next;
                        }
                    }
                   


                    target = coder.get_target(total_count);

                    // find either the symbol we are looking for or the 
                    // end of the context set
                    node* n = temp->child_context;
                    node* last = 0;   
                    while (true)
                    {
                        if (is_excluded(n->symbol) == false)
                        {
                            high_count += n->count;
                            exclude(n->symbol);
                        }

                        
                        if (high_count > target || n->next == 0)
                            break;
                        last = n;
                        n = n->next;
                    }             


                    // if we found the symbol
                    if (high_count > target)
                    {
                        low_count = high_count - n->count;

                        if (new_node != 0)
                        {
                            new_node->parent_context = n;                            
                        }

                        symbol = n->symbol;
            
                        coder.decode(low_count,high_count);
                        c = n->count += 8;
                        t = temp->total += 8;


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

                        // get the escape code
                        coder.decode(high_count,total_count);
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
                new_node->escapes = 0;
                new_node->next = 0;
                push(new_node,temp);
                new_node->total = 0;


              
                if (temp != root)
                {
                    temp = temp->parent_context;
                    --local_order;
                    continue;
                }
                
                t = 2056;
                c = 8;

                // since this is the root we are going to the order-(-1) context
                // so we can just take care of that here.
                target = coder.get_target(alphabet_size);
                new_node->parent_context = root;
                coder.decode(target,target+1);
                symbol = target;

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
                clear();
                temp = cur;
                local_order = cur_order;
                cur = 0;   
                new_node = 0;
            }
        } // while (true)

        // initialize the counts and symbol for any new nodes we have added
        // to the tree.
        node* n, *nc;
        while (stack_size > 0)
        {            
            pop(n,nc);        

            n->symbol = static_cast<unsigned short>(symbol);

            // if nc is not a determnistic context
            if (nc->total)
            {
                unsigned long temp2 = t-c+nc->total - nc->escapes - nc->escapes;
                unsigned long temp = nc->total;
                temp *= c;
                temp /= (temp2|1); // this oring by 1 is just to make sure that temp2 is never zero
                temp += 2;
                if (temp > 50000) temp = 50000;
                n->count = static_cast<unsigned short>(temp);

               
                nc->escapes += 4;
                nc->total += static_cast<unsigned short>(temp) + 4;
            }
            else
            {
                n->count = 3 + 5*(c)/(t-c);

                nc->escapes = 4;
                nc->total = n->count + 4;
            }
        
            while (nc->total > 10000)
            {
                scale_counts(nc);
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
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    edmk5::node* entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
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
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    bool entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    space_left (
    ) const
    {
        return (next_node < total_nodes);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    exclude (
        unsigned short symbol
    )
    {
        exc_used = true;
        unsigned long temp = 1;
        temp <<= symbol&0x1F;
        exc[symbol>>5] |= temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    bool entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    is_excluded (
        unsigned short symbol
    )
    {
        unsigned long temp = 1;
        temp <<= symbol&0x1F;
        return ((exc[symbol>>5]&temp) != 0);     
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    clear_exclusions (
    )
    {
        exc_used = false;
        for (unsigned long i = 0; i < alphabet_size/32+1; ++i)
        {
            exc[i] = 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    push (
        node* n,
        node* nc
    )
    {
        stack[stack_size].n = n;
        stack[stack_size].nc = nc;
        ++stack_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    pop (
        node*& n,
        node*& nc
    )
    {   
        --stack_size;
        n = stack[stack_size].n;
        nc = stack[stack_size].nc;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    bool entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
    something_is_excluded (
    )
    {
        return exc_used;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size,
        typename entropy_decoder,
        unsigned long total_nodes,
        unsigned long order
        >
    void entropy_decoder_model_kernel_5<alphabet_size,entropy_decoder,total_nodes,order>::
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

#endif // DLIB_ENTROPY_DECODER_MODEL_KERNEl_5_


