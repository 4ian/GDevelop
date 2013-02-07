// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREE_KERNEl_1_
#define DLIB_BINARY_SEARCH_TREE_KERNEl_1_

#include "binary_search_tree_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include <cstdlib>
#include <functional>

namespace dlib 
{

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare = std::less<domain>
        >
    class binary_search_tree_kernel_1 : public enumerable<map_pair<domain,range> >,
                                        public asc_pair_remover<domain,range,compare>
    {

        /*!
            INITIAL VALUE
                tree_size == 0
                tree_root == 0
                tree_height == 0
                at_start_ == true
                current_element == 0
                stack == array of 50 node pointers
                stack_pos == 0


            CONVENTION
                tree_size   == size()
                tree_height == height()

                stack[stack_pos-1] == pop()

                current_element_valid() == (current_element != 0)
                if (current_element_valid()) then
                    element() == current_element->d and current_element->r
                at_start_ == at_start()
                if (current_element != 0 && current_element != tree_root) then
                    stack[stack_pos-1] == the parent of the node pointed to by current_element

                if (tree_size != 0)
                    tree_root == pointer to the root node of the binary search tree
                else
                    tree_root == 0


                for all nodes:
                {
                    left points to the left subtree or 0 if there is no left subtree and
                    right points to the right subtree or 0 if there is no right subtree and
                    all elements in a left subtree are <= the root and
                    all elements in a right subtree are >= the root and
                    d is the item in the domain of *this contained in the node
                    r is the item in the range of *this contained in the node
                    balance:
                        balance == 0 if both subtrees have the same height
                        balance == -1 if the left subtree has a height that is greater 
                                   than the height of the right subtree by 1
                        balance == 1 if the right subtree has a height that is greater 
                                   than the height of the left subtree by 1
                    for all trees:
                        the height of the left and right subtrees differ by at most one
                }

        !*/
    
        class node
        {
        public:
            node* left;
            node* right;
            domain d;
            range r;
            signed char balance;
        };

        class mpair : public map_pair<domain,range>
        {
        public:
            const domain* d;
            range* r;

            const domain& key( 
            ) const { return *d; }

            const range& value(
            ) const { return *r; }

            range& value(
            ) { return *r; }
        };

   
        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            binary_search_tree_kernel_1(
            ) :
                tree_size(0),
                tree_root(0),
                current_element(0),
                tree_height(0),
                at_start_(true),
                stack_pos(0),
                stack(ppool.allocate_array(50))
            {
            }

            virtual ~binary_search_tree_kernel_1(
            ); 
    
            inline void clear(
            );

            inline short height (
            ) const;

            inline unsigned long count (
                const domain& item
            ) const;

            inline void add (
                domain& d,
                range& r
            );

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            void destroy (
                const domain& item
            );

            inline const range* operator[] (
                const domain& item
            ) const;

            inline range* operator[] (
                const domain& item
            );

            inline void swap (
                binary_search_tree_kernel_1& item
            );

            // function from the asc_pair_remover interface
            void remove_any (
                domain& d,
                range& r
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

            const map_pair<domain,range>& element (
            ) const;

            map_pair<domain,range>& element (
            );

            bool move_next (
            ) const;

            void remove_last_in_order (
                domain& d,
                range& r
            );

            void remove_current_element (
                domain& d,
                range& r
            );

            void position_enumerator (
                const domain& d
            ) const;

        private:


            inline void rotate_left (
                node*& t
            );
            /*!
                requires
                    - t->balance == 2 
                    - t->right->balance == 0 or 1 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - #t is still a binary search tree 
                    - #t->balance is between 1 and -1 
                    - #t now has a height smaller by 1 if #t->balance == 0
            !*/

            inline void rotate_right (
                node*& t
            );
            /*!
                requires
                    - t->balance == -2 
                    - t->left->balance == 0 or -1 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - #t is still a binary search tree 
                    - #t->balance is between 1 and -1 
                    - #t now has a height smaller by 1 if #t->balance == 0

            !*/

            inline void double_rotate_right (
                node*& t
            );
            /*!
                requires
                    - t->balance == -2 
                    - t->left->balance == 1 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - #t is still a binary search tree 
                    - #t now has a balance of 0 
                    - #t now has a height smaller by 1             
            !*/

            inline void double_rotate_left (
                node*& t
            );
            /*!
                requires
                    - t->balance == 2 
                    - t->right->balance == -1 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - #t is still a binary search tree 
                    - #t now has a balance of 0 
                    - #t now has a height smaller by 1
            !*/

            bool remove_biggest_element_in_tree (
                node*& t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t != 0  (i.e. there must be something in the tree to remove) 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - the biggest node in t has been removed 
                    - the biggest node domain element in t has been put into #d 
                    - the biggest node range element in t has been put into #r
                    - #t is still a binary search tree 
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            bool remove_least_element_in_tree (
                node*& t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t != 0  (i.e. there must be something in the tree to remove) 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - the least node in t has been removed 
                    - the least node domain element in t has been put into #d 
                    - the least node range element in t has been put into #r
                    - #t is still a binary search tree 
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            bool add_to_tree (
                node*& t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - the mapping (d --> r) has been added to #t 
                    - #d and #r have initial values for their types
                    - #t is still a binary search tree 
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has grown by one
            !*/

            bool remove_from_tree (
                node*& t,
                const domain& d,
                domain& d_copy,
                range& r
            );
            /*!
                requires
                    - return_reference(t,d) != 0
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - #d_copy is equivalent to d                                    
                    - an element in t equivalent to d has been removed and swapped 
                      into #d_copy and its associated range object has been 
                      swapped into #r
                    - #t is still a binary search tree                                     
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            bool remove_from_tree (
                node*& t,
                const domain& item
            );
            /*!
                requires
                    - return_reference(t,item) != 0
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - an element in t equivalent to item has been removed                      
                    - #t is still a binary search tree                                     
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            const range* return_reference (
                const node* t,
                const domain& d
            ) const;
            /*!
                ensures
                    - if (there is a domain element equivalent to d in t) then
                        - returns a pointer to the element in the range equivalent to d
                    - else
                        - returns 0
            !*/

            range* return_reference (
                node* t,
                const domain& d
            );
            /*!
                ensures
                    - if (there is a domain element equivalent to d in t) then
                        - returns a pointer to the element in the range equivalent to d
                    - else
                        - returns 0
            !*/


            inline bool keep_node_balanced (
                node*& t
            );
            /*!
                requires
                    - t != 0 
                    - t == reference to the pointer in t's parent node that points to t
                ensures
                    - if (t->balance is < 1 or > 1) then 
                        - keep_node_balanced() will ensure that #t->balance == 0, -1, or 1
                    - #t is still a binary search tree
                    - returns true if it made the tree one height shorter 
                    - returns false if it didn't change the height
            !*/


            unsigned long get_count (
                const domain& item,
                node* tree_root
            ) const;
            /*!
                requires
                    - tree_root == the root of a binary search tree or 0
                ensures
                    - if (tree_root == 0) then
                        - returns 0
                    - else
                        - returns the number of elements in tree_root that are 
                          equivalent to item
            !*/


            void delete_tree (
                node* t
            );
            /*!
                requires
                    - t != 0
                ensures
                    - deallocates the node pointed to by t and all of t's left and right children
            !*/


            void push (
                node* n
            ) const { stack[stack_pos] = n; ++stack_pos; }
            /*!
                ensures
                    - pushes n onto the stack
            !*/
            

            node* pop (
            ) const { --stack_pos; return stack[stack_pos]; }
            /*!
                ensures
                    - pops the top of the stack and returns it
            !*/



            bool fix_stack (
                node* t,
                unsigned char depth = 0
            );
            /*!
                requires
                    - current_element != 0
                    - depth == 0
                    - t == tree_root
                ensures
                    - makes the stack contain the correct set of parent pointers.
                      also adjusts stack_pos so it is correct.
                    - #t is still a binary search tree                                     
            !*/

            bool remove_current_element_from_tree (
                node*& t,
                domain& d,
                range& r,
                unsigned long cur_stack_pos = 1
            ); 
            /*!
                requires
                    - t == tree_root
                    - cur_stack_pos == 1
                    - current_element != 0
                ensures
                    - removes the data in the node given by current_element and swaps it into 
                      #d and #r.  
                    - #t is still a binary search tree                                     
                    - the enumerator is advances on to the next element but its stack is 
                      potentially corrupted.  so you must call fix_stack(tree_root) to fix
                      it.
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/


            // data members

            mutable mpair p;
            unsigned long tree_size;            
            node* tree_root;
            mutable node* current_element;            
            typename mem_manager::template rebind<node>::other pool;
            typename mem_manager::template rebind<node*>::other ppool;
            short tree_height;
            mutable bool at_start_;
            mutable unsigned char stack_pos;
            mutable node** stack;
            compare comp; 

            // restricted functions
            binary_search_tree_kernel_1(binary_search_tree_kernel_1&);        
            binary_search_tree_kernel_1& operator=(binary_search_tree_kernel_1&); 


    };

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    inline void swap (
        binary_search_tree_kernel_1<domain,range,mem_manager,compare>& a, 
        binary_search_tree_kernel_1<domain,range,mem_manager,compare>& b 
    ) { a.swap(b); }




    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void deserialize (
        binary_search_tree_kernel_1<domain,range,mem_manager,compare>& item, 
        std::istream& in
    )
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            domain d;
            range r;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(d,in);
                deserialize(r,in);
                item.add(d,r);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type binary_search_tree_kernel_1"); 
        }
    }



// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    ~binary_search_tree_kernel_1 (
    )
    {
        ppool.deallocate_array(stack);
        if (tree_size != 0)
        {
            delete_tree(tree_root);
        }        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    clear (
    )
    {
        if (tree_size > 0)
        {
            delete_tree(tree_root);
            tree_root = 0;
            tree_size = 0;
            tree_height = 0;
        }
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    unsigned long binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    size (
    ) const
    {
        return tree_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    short binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    height (
    ) const
    {
        return tree_height;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    unsigned long binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    count (
        const domain& item
    ) const
    {
        return get_count(item,tree_root);        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    add (
        domain& d,
        range& r
    ) 
    {
        tree_height += add_to_tree(tree_root,d,r);
        ++tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove (
        const domain& d,
        domain& d_copy,
        range& r
    ) 
    {
        tree_height -= remove_from_tree(tree_root,d,d_copy,r);
        --tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    destroy (
        const domain& item
    ) 
    {
        tree_height -= remove_from_tree(tree_root,item);
        --tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_any (
        domain& d,
        range& r
    ) 
    {
        tree_height -= remove_least_element_in_tree(tree_root,d,r);
        --tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    range* binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    operator[] (
        const domain& item
    ) 
    {
        return return_reference(tree_root,item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    const range* binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    operator[] (
        const domain& item
    ) const
    {
        return return_reference(tree_root,item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    swap (
        binary_search_tree_kernel_1<domain,range,mem_manager,compare>& item
    ) 
    {
        pool.swap(item.pool);
        ppool.swap(item.ppool);
        exchange(p,item.p);
        exchange(stack,item.stack);
        exchange(stack_pos,item.stack_pos);
        exchange(comp,item.comp);
        

        node* tree_root_temp            = item.tree_root;
        unsigned long tree_size_temp    = item.tree_size;
        short tree_height_temp          = item.tree_height;
        node* current_element_temp      = item.current_element;
        bool at_start_temp              = item.at_start_;

        item.tree_root   = tree_root;
        item.tree_size   = tree_size;
        item.tree_height = tree_height;
        item.current_element = current_element;
        item.at_start_   = at_start_;

        tree_root   = tree_root_temp;
        tree_size   = tree_size_temp;
        tree_height = tree_height_temp;
        current_element = current_element_temp;
        at_start_   = at_start_temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_last_in_order (
        domain& d,
        range& r
    )
    {
        tree_height -= remove_biggest_element_in_tree(tree_root,d,r);
        --tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_current_element (
        domain& d,
        range& r
    )
    {
        tree_height -= remove_current_element_from_tree(tree_root,d,r);
        --tree_size;

        // fix the enumerator stack if we need to
        if (current_element)
            fix_stack(tree_root);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    position_enumerator (
        const domain& d
    ) const
    {
        // clear the enumerator state and make sure the stack is empty
        reset();
        at_start_ = false;
        node* t = tree_root;
        bool went_left = false;
        while (t != 0)
        {
            if ( comp(d , t->d) )
            {
                push(t);
                // if item is on the left then look in left
                t = t->left;
                went_left = true;
            }
            else if (comp(t->d , d))
            {
                push(t);
                // if item is on the right then look in right
                t = t->right;
                went_left = false;
            }
            else
            {
                current_element = t;
                return;
            }
        }

        // if we didn't find any matches but there might be something after the
        // d in this tree.
        if (stack_pos > 0)
        {
            current_element = pop();
            // if we went left from this node then this node is the next
            // biggest.
            if (went_left)
            {
                return;
            }
            else
            {
                move_next();
            }
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    at_start (
    ) const
    {
        return at_start_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
        stack_pos = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    current_element_valid (
    ) const
    {
        return (current_element != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    const map_pair<domain,range>& binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    element (
    ) const
    {
        p.d = &(current_element->d);
        p.r = &(current_element->r);
        return p;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    map_pair<domain,range>& binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    element (
    )
    {
        p.d = &(current_element->d);
        p.r = &(current_element->r);
        return p;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    move_next (
    ) const
    {
        // if we haven't started iterating yet
        if (at_start_)
        {
            at_start_ = false;
            if (tree_size == 0)
            {
                return false;
            }
            else
            {                    
                // find the first element in the tree
                current_element = tree_root;
                node* temp = current_element->left;
                while (temp != 0)
                {
                    push(current_element);
                    current_element = temp;
                    temp = current_element->left;
                }
                return true;
            }
        }
        else
        {
            if (current_element == 0)
            {
                return false;
            }
            else
            {
                node* temp;
                bool went_up;  // true if we went up the tree from a child node to parent
                bool from_left = false; // true if we went up and were coming from a left child node
                // find the next element in the tree
                if (current_element->right != 0)
                {
                    // go right and down    
                    temp = current_element;
                    push(current_element);
                    current_element = temp->right;
                    went_up = false;
                }
                else
                {
                    // go up to the parent if we can
                    if (current_element == tree_root)
                    {
                        // in this case we have iterated over all the element of the tree
                        current_element = 0;
                        return false;
                    }
                    went_up = true;
                    node* parent = pop();


                    from_left = (parent->left == current_element);
                    // go up to parent
                    current_element = parent;
                }


                while (true)
                {
                    if (went_up)
                    {
                        if (from_left)
                        {
                            // in this case we have found the next node
                            break;
                        }
                        else
                        {
                            if (current_element == tree_root)
                            {
                                // in this case we have iterated over all the elements
                                // in the tree
                                current_element = 0;
                                return false;
                            }
                            // we should go up
                            node* parent = pop();
                            from_left = (parent->left == current_element);                            
                            current_element = parent;
                        }
                    }
                    else
                    {
                        // we just went down to a child node
                        if (current_element->left != 0)
                        {
                            // go left
                            went_up = false;
                            temp = current_element;
                            push(current_element);
                            current_element = temp->left;
                        }
                        else
                        {
                            // if there is no left child then we have found the next node
                            break;
                        }
                    }
                }

                return true;               
            }
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    delete_tree (
        node* t
    ) 
    {
        if (t->left != 0)
            delete_tree(t->left);
        if (t->right != 0)
            delete_tree(t->right);
        pool.deallocate(t);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    rotate_left (
        node*& t
    ) 
    {

        // set the new balance numbers
        if (t->right->balance == 1)
        {
            t->balance = 0;
            t->right->balance = 0;
        }
        else
        {
            t->balance = 1;
            t->right->balance = -1;            
        }

        // perform the rotation
        node* temp = t->right;
        t->right = temp->left;
        temp->left = t;
        t = temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    rotate_right (
        node*& t
    ) 
    {
        // set the new balance numbers
        if (t->left->balance == -1)
        {
            t->balance = 0;
            t->left->balance = 0;
        }
        else
        {
            t->balance = -1;
            t->left->balance = 1;            
        }

        // preform the rotation
        node* temp = t->left;
        t->left = temp->right;
        temp->right = t;
        t = temp;    

    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    double_rotate_right (
        node*& t
    )
    {

        node* temp = t;
        t = t->left->right;
        
        temp->left->right = t->left;
        t->left = temp->left;

        temp->left = t->right;
        t->right = temp;

        if (t->balance < 0)
        {  
            t->left->balance = 0;
            t->right->balance = 1;
        }
        else if (t->balance > 0)
        {
            t->left->balance = -1;
            t->right->balance = 0;
        }
        else 
        {
            t->left->balance = 0;
            t->right->balance = 0;
        }
        t->balance = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    double_rotate_left (
        node*& t
    )
    {
        node* temp = t;
        t = t->right->left;
        
        temp->right->left = t->right;
        t->right = temp->right;

        temp->right = t->left;
        t->left = temp;

        if (t->balance < 0)
        {  
            t->left->balance = 0;
            t->right->balance = 1;
        }
        else if (t->balance > 0)
        {
            t->left->balance = -1;
            t->right->balance = 0;
        }
        else 
        {
            t->left->balance = 0;
            t->right->balance = 0;
        }

        t->balance = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_biggest_element_in_tree (
        node*& t,
        domain& d,
        range& r
    ) 
    {
        // make a reference to the current node so we don't have to dereference a 
        // pointer a bunch of times
        node& tree = *t;

        // if the right tree is an empty tree
        if ( tree.right == 0)
        {
            // swap nodes domain and range elements into d and r
            exchange(d,tree.d);
            exchange(r,tree.r);

            // plug hole left by removing this node
            t = tree.left;

            // delete the node that was just removed
            pool.deallocate(&tree);    

            // return that the height of this part of the tree has decreased
            return true;
        }
        else
        {

            // keep going right

            // if remove made the tree one height shorter
            if ( remove_biggest_element_in_tree(tree.right,d,r) ) 
            {
                // if this caused the current tree to strink then report that
                if ( tree.balance == 1)
                {
                    --tree.balance;
                    return true;
                }
                else
                {
                    --tree.balance;
                    return keep_node_balanced(t);
                }                
            }

            return false;            
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_least_element_in_tree (
        node*& t,
        domain& d,
        range& r
    ) 
    {
        // make a reference to the current node so we don't have to dereference a 
        // pointer a bunch of times
        node& tree = *t;

        // if the left tree is an empty tree
        if ( tree.left == 0)
        {
            // swap nodes domain and range elements into d and r
            exchange(d,tree.d);
            exchange(r,tree.r);

            // plug hole left by removing this node
            t = tree.right;

            // delete the node that was just removed
            pool.deallocate(&tree);    

            // return that the height of this part of the tree has decreased
            return true;
        }
        else
        {

            // keep going left

            // if remove made the tree one height shorter
            if ( remove_least_element_in_tree(tree.left,d,r) ) 
            {
                // if this caused the current tree to strink then report that
                if ( tree.balance == -1)
                {
                    ++tree.balance;
                    return true;
                }
                else
                {
                    ++tree.balance;
                    return keep_node_balanced(t);
                }                
            }

            return false;            
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    add_to_tree (
        node*& t,
        domain& d,
        range& r
    ) 
    {

        // if found place to add
        if (t == 0)
        {
            // create a node to add new item into
            t = pool.allocate(); 

            // make a reference to the current node so we don't have to dereference a 
            // pointer a bunch of times
            node& tree = *t;


            // set left and right pointers to NULL to indicate that there are no 
            // left or right subtrees
            tree.left = 0;
            tree.right = 0;
            tree.balance = 0;

            // put d and r into t
            exchange(tree.d,d);
            exchange(tree.r,r);

            // indicate that the height of this tree has increased
            return true;
        }
        else  // keep looking for a place to add the new item
        {
            // make a reference to the current node so we don't have to dereference 
            // a pointer a bunch of times
            node& tree = *t;
            signed char old_balance = tree.balance;

            // add the new item to whatever subtree it should go into
            if (comp( d , tree.d) )
                tree.balance -= add_to_tree(tree.left,d,r);
            else
                tree.balance += add_to_tree(tree.right,d,r);


            // if the tree was balanced to start with
            if (old_balance == 0)
            {
                // if its not balanced anymore then it grew in height
                if (tree.balance != 0)
                    return true;
                else
                    return false;
            }
            else
            {
                // if the tree is now balanced then it didn't grow
                if (tree.balance == 0)
                {
                    return false;
                }
                else
                {
                    // if the tree needs to be balanced
                    if (tree.balance != old_balance)
                    {
                        return !keep_node_balanced(t);
                    }
                    // if there has been no change in the heights
                    else
                    {
                        return false;
                    }
                }
            }
        }
    } 

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    fix_stack (
        node* t,
        unsigned char depth 
    ) 
    {
        // if we found the node we were looking for
        if (t == current_element)
        {
            stack_pos = depth;
            return true;
        }
        else if (t == 0)
        {
            return false;
        }

        if (!( comp(t->d , current_element->d)))
        {
            // go left
            if (fix_stack(t->left,depth+1))
            {
                stack[depth] = t;
                return true;
            }            
        }
        if (!(comp(current_element->d , t->d)))
        {
            // go right
            if (fix_stack(t->right,depth+1))
            {
                stack[depth] = t;
                return true;
            }            
        }
        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_current_element_from_tree (
        node*& t,
        domain& d,
        range& r,
        unsigned long cur_stack_pos 
    ) 
    {
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;

        // if we found the node we were looking for
        if (t == current_element)
        {

            // swap nodes domain and range elements into d_copy and r
            exchange(d,tree.d);
            exchange(r,tree.r);

            // if there is no left node
            if (tree.left == 0)
            {
                // move the enumerator on to the next element before we mess with the 
                // tree
                move_next();

                // plug hole left by removing this node and free memory
                t = tree.right;  // plug hole with right subtree
                
                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height has changed
                return true;
            }
            // if there is no right node
            else if (tree.right == 0)
            {
                // move the enumerator on to the next element before we mess with the 
                // tree
                move_next();

                // plug hole left by removing this node and free memory
                t = tree.left;  // plug hole with left subtree

                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height of this tree has changed
                return true;
            }
            // if there are both a left and right sub node
            else
            {

                // in this case the next current element is going to get swapped back
                // into this t node.
                current_element = t;

                // get an element that can replace the one being removed and do this 
                // if it made the right subtree shrink by one
                if (remove_least_element_in_tree(tree.right,tree.d,tree.r))
                {
                    // adjust the tree height
                    --tree.balance;

                    // if the height of the current tree has dropped by one
                    if (tree.balance == 0)
                    {
                        return true;
                    }
                    else
                    {
                        return keep_node_balanced(t);
                    }
                }
                // else this remove did not effect the height of this tree
                else
                {
                    return false;
                }

            }

        }
        else if (  (cur_stack_pos < stack_pos && stack[cur_stack_pos] == tree.left) || 
                    tree.left == current_element )
        {
            // go left
            if (tree.balance == -1)
            {
                int balance = tree.balance;
                balance += remove_current_element_from_tree(tree.left,d,r,cur_stack_pos+1);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance += remove_current_element_from_tree(tree.left,d,r,cur_stack_pos+1);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
        }
        else if (  (cur_stack_pos < stack_pos && stack[cur_stack_pos] == tree.right) || 
                    tree.right == current_element )
        {
            // go right
            if (tree.balance == 1)
            {
                int balance = tree.balance;
                balance -= remove_current_element_from_tree(tree.right,d,r,cur_stack_pos+1);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance -= remove_current_element_from_tree(tree.right,d,r,cur_stack_pos+1);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
        }
        
        // this return should never happen but do it anyway to suppress compiler warnings
        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_from_tree (
        node*& t,
        const domain& d,
        domain& d_copy,
        range& r
    ) 
    {
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;

        // if item is on the left
        if (comp(d , tree.d))
        {
            // if the left side of the tree has the greatest height
            if (tree.balance == -1)
            {
                int balance = tree.balance;
                balance += remove_from_tree(tree.left,d,d_copy,r);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance += remove_from_tree(tree.left,d,d_copy,r);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
             
        }
        // if item is on the right
        else if (comp(tree.d , d))
        {

            // if the right side of the tree has the greatest height
            if (tree.balance == 1)
            {
                int balance = tree.balance;
                balance -= remove_from_tree(tree.right,d,d_copy,r);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance -= remove_from_tree(tree.right,d,d_copy,r);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
        }
        // if item is found
        else 
        {

            // swap nodes domain and range elements into d_copy and r
            exchange(d_copy,tree.d);
            exchange(r,tree.r);

            // if there is no left node
            if (tree.left == 0)
            {

                // plug hole left by removing this node and free memory
                t = tree.right;  // plug hole with right subtree
                
                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height has changed
                return true;
            }
            // if there is no right node
            else if (tree.right == 0)
            {

                // plug hole left by removing this node and free memory
                t = tree.left;  // plug hole with left subtree

                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height of this tree has changed
                return true;
            }
            // if there are both a left and right sub node
            else
            {

                // get an element that can replace the one being removed and do this 
                // if it made the right subtree shrink by one
                if (remove_least_element_in_tree(tree.right,tree.d,tree.r))
                {
                    // adjust the tree height
                    --tree.balance;

                    // if the height of the current tree has dropped by one
                    if (tree.balance == 0)
                    {
                        return true;
                    }
                    else
                    {
                        return keep_node_balanced(t);
                    }
                }
                // else this remove did not effect the height of this tree
                else
                {
                    return false;
                }

            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    remove_from_tree (
        node*& t,
        const domain& d
    ) 
    {
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;

        // if item is on the left
        if (comp(d , tree.d))
        {
            // if the left side of the tree has the greatest height
            if (tree.balance == -1)
            {
                int balance = tree.balance;
                balance += remove_from_tree(tree.left,d);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance += remove_from_tree(tree.left,d);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
             
        }
        // if item is on the right
        else if (comp(tree.d , d))
        {

            // if the right side of the tree has the greatest height
            if (tree.balance == 1)
            {
                int balance = tree.balance;
                balance -= remove_from_tree(tree.right,d);
                tree.balance = balance;
                return !tree.balance;
            }
            else
            {
                int balance = tree.balance;
                balance -= remove_from_tree(tree.right,d);
                tree.balance = balance;
                return keep_node_balanced(t);
            }
        }
        // if item is found
        else 
        {

            // if there is no left node
            if (tree.left == 0)
            {

                // plug hole left by removing this node and free memory
                t = tree.right;  // plug hole with right subtree
                
                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height has changed
                return true;
            }
            // if there is no right node
            else if (tree.right == 0)
            {

                // plug hole left by removing this node and free memory
                t = tree.left;  // plug hole with left subtree

                // delete old node
                pool.deallocate(&tree);  

                // indicate that the height of this tree has changed
                return true;
            }
            // if there are both a left and right sub node
            else
            {

                // get an element that can replace the one being removed and do this 
                // if it made the right subtree shrink by one
                if (remove_least_element_in_tree(tree.right,tree.d,tree.r))
                {
                    // adjust the tree height
                    --tree.balance;

                    // if the height of the current tree has dropped by one
                    if (tree.balance == 0)
                    {
                        return true;
                    }
                    else
                    {
                        return keep_node_balanced(t);
                    }
                }
                // else this remove did not effect the height of this tree
                else
                {
                    return false;
                }

            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    range* binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    return_reference (
        node* t,
        const domain& d
    ) 
    {
        while (t != 0)
        {

            if ( comp(d , t->d ))
            {
                // if item is on the left then look in left
                t = t->left;
            }
            else if (comp(t->d , d))
            {
                // if item is on the right then look in right
                t = t->right;
            }
            else
            {
                // if it's found then return a reference to it
                return &(t->r);
            }
        }
        return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    const range* binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    return_reference (
        const node* t,
        const domain& d
    ) const
    {
        while (t != 0)
        {

            if ( comp(d , t->d) )
            {
                // if item is on the left then look in left
                t = t->left;
            }
            else if (comp(t->d , d))
            {
                // if item is on the right then look in right
                t = t->right;
            }
            else
            {
                // if it's found then return a reference to it
                return &(t->r);
            }
        }
        return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    bool binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    keep_node_balanced (
        node*& t
    )
    {
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;
 
        // if tree does not need to be balanced then return false
        if (tree.balance == 0)
            return false;


        // if tree needs to be rotated left
        if (tree.balance == 2)
        {
            if (tree.right->balance >= 0)
                rotate_left(t);
            else
                double_rotate_left(t);
        }
        // else if the tree needs to be rotated right
        else if (tree.balance == -2)
        {
            if (tree.left->balance <= 0)
                rotate_right(t);
            else
                double_rotate_right(t);
        }
   

        if (t->balance == 0)
            return true;
        else
            return false; 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    unsigned long binary_search_tree_kernel_1<domain,range,mem_manager,compare>::
    get_count (
        const domain& d,
        node* tree_root
    ) const
    {
        if (tree_root != 0)
        {
            if (comp(d , tree_root->d))
            {
                // go left
                return get_count(d,tree_root->left);                
            }
            else if (comp(tree_root->d , d))
            {
                // go right
                return get_count(d,tree_root->right);
            }
            else
            {
                // go left and right to look for more matches
                return   get_count(d,tree_root->left) 
                       + get_count(d,tree_root->right) 
                       + 1;
            }
        }
        return 0;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BINARY_SEARCH_TREE_KERNEl_1_

