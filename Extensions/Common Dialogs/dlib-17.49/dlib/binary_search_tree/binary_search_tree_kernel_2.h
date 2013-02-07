// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREE_KERNEl_2_
#define DLIB_BINARY_SEARCH_TREE_KERNEl_2_

#include "binary_search_tree_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"
#include <functional>

namespace dlib 
{

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare = std::less<domain>
        >
    class binary_search_tree_kernel_2 : public enumerable<map_pair<domain,range> >,
                                        public asc_pair_remover<domain,range,compare>
    {

        /*!
            INITIAL VALUE
                NIL == pointer to a node that represents a leaf
                tree_size == 0
                tree_root == NIL     
                at_start == true
                current_element == 0


            CONVENTION
                current_element_valid() == (current_element != 0)
                if (current_element_valid()) then
                    element() == current_element->d and current_element->r
                at_start_ == at_start()


                tree_size   == size()

                NIL == pointer to a node that represents a leaf

                if (tree_size != 0)
                    tree_root == pointer to the root node of the binary search tree
                else
                    tree_root == NIL

                tree_root->color == black                    
                Every leaf is black and all leafs are the NIL node.
                The number of black nodes in any path from the root to a leaf is the 
                same. 

                for all nodes:
                {
                    - left points to the left subtree or NIL if there is no left subtree  
                    - right points to the right subtree or NIL if there is no right 
                      subtree                                                             
                    - parent points to the parent node or NIL if the node is the root     
                    - ordering of nodes is determined by comparing each node's d member  
                    - all elements in a left subtree are <= the node                      
                    - all elements in a right subtree are >= the node                     
                    - color == red or black                                               
                    - if (color == red)                                                   
                        - the node's children are black
                }

        !*/
    
        class node
        {
        public:            
            node* left;
            node* right;
            node* parent;
            domain d;
            range r;
            char color;
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
        
     
        const static char red = 0;
        const static char black = 1;


        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            binary_search_tree_kernel_2(
            ) :
                NIL(pool.allocate()),
                tree_size(0),
                tree_root(NIL),
                current_element(0),
                at_start_(true)
            {
                NIL->color = black;
                NIL->left = 0;
                NIL->right = 0;
                NIL->parent = 0;
            }

            virtual ~binary_search_tree_kernel_2(
            ); 
    
            inline void clear(
            );

            inline short height (
            ) const;

            inline unsigned long count (
                const domain& d
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
                const domain& d
            );

            void remove_any (
                domain& d,
                range& r
            );

            inline const range* operator[] (
                const domain& item
            ) const;

            inline range* operator[] (
                const domain& item
            );

            inline void swap (
                binary_search_tree_kernel_2& item
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
                node* t
            );
            /*!
                requires
                    - t != NIL 
                    - t->right != NIL
                ensures
                    - performs a left rotation around t and its right child
            !*/

            inline void rotate_right (
                node* t
            );
            /*!
                requires
                    - t != NIL 
                    - t->left != NIL
                ensures
                    - performs a right rotation around t and its left child
            !*/

            inline void double_rotate_right (
                node* t
            );
            /*!
                requires
                    - t != NIL 
                    - t->left != NIL 
                    - t->left->right != NIL 
                    - double_rotate_right() is only called in fix_after_add()
                ensures
                    - performs a left rotation around t->left 
                    - then performs a right rotation around t
            !*/

            inline void double_rotate_left (
                node* t
            );
            /*!
                requires
                    - t != NIL 
                    - t->right != NIL 
                    - t->right->left != NIL 
                    - double_rotate_left() is only called in fix_after_add()
                ensures
                    - performs a right rotation around t->right 
                    - then performs a left rotation around t
            !*/

            void remove_biggest_element_in_tree (
                node* t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t != NIL  (i.e. there must be something in the tree to remove)
                ensures
                    - the biggest node in t has been removed 
                    - the biggest node element in t has been put into #d and #r 
                    - #t is still a binary search tree 
            !*/

            bool remove_least_element_in_tree (
                node* t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t != NIL  (i.e. there must be something in the tree to remove)
                ensures
                    - the least node in t has been removed 
                    - the least node element in t has been put into #d and #r 
                    - #t is still a binary search tree 
                    - if (the node that was removed was the one pointed to by current_element) then
                        - returns true
                    - else
                        - returns false
            !*/

            void add_to_tree (
                node* t,
                domain& d,
                range& r
            );
            /*!
                requires
                    - t != NIL
                ensures
                    - d and r are now in #t
                    - there is a mapping from d to r in #t
                    - #d and #r have initial values for their types
                    - #t is still a binary search tree 
            !*/

            void remove_from_tree (
                node* t,
                const domain& d,
                domain& d_copy,
                range& r
            );
            /*!
                requires
                    - return_reference(t,d) != 0
                ensures
                    - #d_copy is equivalent to d                                     
                    - the first element in t equivalent to d that is encountered when searching down the tree
                      from t has been removed and swapped into #d_copy.  Also, the associated range element 
                      has been removed and swapped into #r.
                    - if (the node that got removed wasn't current_element) then
                        - adjusts the current_element pointer if the data in the node that it points to gets moved.
                    - else
                        - the value of current_element is now invalid
                    - #t is still a binary search tree 
            !*/

            void remove_from_tree (
                node* t,
                const domain& d
            );
            /*!
                requires
                    - return_reference(t,d) != 0
                ensures                                  
                    - an element in t equivalent to d has been removed                
                    - #t is still a binary search tree 
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

            void fix_after_add (
                node* t
            );
            /*!
                requires
                    - t == pointer to the node just added
                    - t->color == red 
                    - t->parent != NIL (t must not be the root)
                    - fix_after_add() is only called after a new node has been added
                      to t
                ensures
                    - fixes any deviations from the CONVENTION caused by adding a node
            !*/

            void fix_after_remove (
                node* t
            );
            /*!
                requires
                    - t == pointer to the only child of the node that was spliced out 
                    - fix_after_remove() is only called after a node has been removed
                      from t
                    - the color of the spliced out node was black
                ensures
                    - fixes any deviations from the CONVENTION causes by removing a node
            !*/            


            short tree_height (
                node* t
            ) const;
            /*!
                ensures
                    - returns the number of nodes in the longest path from the root of the 
                      tree to a leaf
            !*/

            void delete_tree (
                node* t
            );
            /*!
                requires
                    - t == root of binary search tree
                    - t != NIL
                ensures
                    - deletes all nodes in t except for NIL
            !*/

            unsigned long get_count (
                const domain& item,
                node* tree_root
            ) const;
            /*!
                requires
                    - tree_root == the root of a binary search tree or NIL
                ensures
                    - if (tree_root == NIL) then
                        - returns 0
                    - else
                        - returns the number of elements in tree_root that are 
                          equivalent to item
            !*/



            // data members
            typename mem_manager::template rebind<node>::other pool;
            node* NIL;
            unsigned long tree_size;
            node* tree_root;
            mutable node* current_element;
            mutable bool at_start_;
            mutable mpair p;
            compare comp;

            

            // restricted functions
            binary_search_tree_kernel_2(binary_search_tree_kernel_2&);        
            binary_search_tree_kernel_2& operator=(binary_search_tree_kernel_2&);


    };

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    inline void swap (
        binary_search_tree_kernel_2<domain,range,mem_manager,compare>& a, 
        binary_search_tree_kernel_2<domain,range,mem_manager,compare>& b 
    ) { a.swap(b); }



    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >   
    void deserialize (
        binary_search_tree_kernel_2<domain,range,mem_manager,compare>& item, 
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
            throw serialization_error(e.info + "\n   while deserializing object of type binary_search_tree_kernel_2"); 
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
    binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    ~binary_search_tree_kernel_2 (
    )
    {     
        if (tree_root != NIL)
            delete_tree(tree_root);
        pool.deallocate(NIL);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    clear (
    )
    {
        if (tree_size > 0)
        {
            delete_tree(tree_root);
            tree_root = NIL;
            tree_size = 0;
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
    unsigned long binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    short binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    height (
    ) const
    {
        return tree_height(tree_root);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    unsigned long binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    add (
        domain& d,
        range& r
    ) 
    {
        if (tree_size == 0)
        {
            tree_root = pool.allocate();
            tree_root->color = black;
            tree_root->left = NIL;
            tree_root->right = NIL;
            tree_root->parent = NIL;
            exchange(tree_root->d,d);
            exchange(tree_root->r,r);
        }
        else 
        {
            add_to_tree(tree_root,d,r);
        }
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove (
        const domain& d,
        domain& d_copy,
        range& r
    ) 
    {
        remove_from_tree(tree_root,d,d_copy,r);
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    destroy (
        const domain& item
    ) 
    {
        remove_from_tree(tree_root,item);
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_any (
        domain& d,
        range& r
    ) 
    {
        remove_least_element_in_tree(tree_root,d,r);
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
    range* binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    operator[] (
        const domain& d
    ) 
    {
        return return_reference(tree_root,d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    const range* binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    operator[] (
        const domain& d
    ) const
    {
        return return_reference(tree_root,d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    swap (
        binary_search_tree_kernel_2<domain,range,mem_manager,compare>& item
    ) 
    {
        pool.swap(item.pool);
        
        exchange(p,item.p);
        exchange(comp,item.comp);

        node* tree_root_temp            = item.tree_root;
        unsigned long tree_size_temp    = item.tree_size;
        node* const NIL_temp            = item.NIL;
        node* current_element_temp      = item.current_element;
        bool at_start_temp              = item.at_start_;
        
        item.tree_root                  = tree_root;
        item.tree_size                  = tree_size;
        item.NIL                        = NIL;
        item.current_element            = current_element;
        item.at_start_                  = at_start_;
        
        tree_root                       = tree_root_temp;
        tree_size                       = tree_size_temp;
        NIL                             = NIL_temp;
        current_element                 = current_element_temp;
        at_start_                       = at_start_temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_last_in_order (
        domain& d,
        range& r
    )
    {
        remove_biggest_element_in_tree(tree_root,d,r);
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_current_element (
        domain& d,
        range& r
    )
    {
        node* t = current_element;
        move_next();
        remove_from_tree(t,t->d,d,r);
        --tree_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    position_enumerator (
        const domain& d
    ) const
    {
        // clear the enumerator state and make sure the stack is empty
        reset();
        at_start_ = false;
        node* t = tree_root;
        node* parent = NIL;
        bool went_left = false;
        while (t != NIL)
        {
            if ( comp(d , t->d ))
            {
                // if item is on the left then look in left
                parent = t;
                t = t->left;
                went_left = true;
            }
            else if (comp(t->d , d))
            {
                // if item is on the right then look in right
                parent = t;
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
        if (parent != NIL)
        {
            current_element = parent;
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
    bool binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    bool binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    const map_pair<domain,range>& binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    map_pair<domain,range>& binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
    bool binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
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
                while (temp != NIL)
                {
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
                bool went_up;  // true if we went up the tree from a child node to parent
                bool from_left = false; // true if we went up and were coming from a left child node
                // find the next element in the tree
                if (current_element->right != NIL)
                {
                    // go right and down                    
                    current_element = current_element->right;
                    went_up = false;
                }
                else
                {
                    went_up = true;
                    node* parent = current_element->parent;
                    if (parent == NIL)
                    {
                        // in this case we have iterated over all the element of the tree
                        current_element = 0;
                        return false;
                    }

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
                            // we should go up
                            node* parent = current_element->parent;
                            from_left = (parent->left == current_element);                            
                            current_element = parent;
                            if (current_element == NIL)
                            {
                                // in this case we have iterated over all the elements
                                // in the tree
                                current_element = 0;
                                return false;
                            }
                        }
                    }
                    else
                    {
                        // we just went down to a child node
                        if (current_element->left != NIL)
                        {
                            // go left
                            went_up = false;
                            current_element = current_element->left;
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    delete_tree (
        node* t
    )  
    {
        if (t->left != NIL)
            delete_tree(t->left);
        if (t->right != NIL)
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    rotate_left (
        node* t
    ) 
    {

        // perform the rotation
        node* temp = t->right;
        t->right = temp->left;
        if (temp->left != NIL)
            temp->left->parent = t;
        temp->left = t;
        temp->parent = t->parent;


        if (t == tree_root)
            tree_root = temp;
        else 
        {
            // if t was on the left
            if (t->parent->left == t)
                t->parent->left = temp;
            else
                t->parent->right = temp;
        }

        t->parent = temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    rotate_right (
        node* t
    ) 
    {
        // perform the rotation
        node* temp = t->left;
        t->left = temp->right;
        if (temp->right != NIL)
            temp->right->parent = t;
        temp->right = t;
        temp->parent = t->parent;

        if (t == tree_root)
            tree_root = temp;
        else 
        {
            // if t is a left child
            if (t->parent->left == t)
                t->parent->left = temp;
            else
                t->parent->right = temp;
        }

        t->parent = temp;
    }


// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    double_rotate_right (
        node* t
    )
    {

        // preform the rotation
        node& temp = *(t->left->right);
        t->left = temp.right;
        temp.right->parent = t;
        temp.left->parent = temp.parent;
        temp.parent->right = temp.left;
        temp.parent->parent = &temp;
        temp.right = t;
        temp.left = temp.parent;
        temp.parent = t->parent;  


        if (tree_root == t)
            tree_root = &temp;
        else
        {
            // t is a left child
            if (t->parent->left == t)
                t->parent->left = &temp;
            else
                t->parent->right = &temp;
        }
        t->parent = &temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    double_rotate_left (
        node* t
    )
    {


        // preform the rotation
        node& temp = *(t->right->left);
        t->right = temp.left;
        temp.left->parent = t;
        temp.right->parent = temp.parent;
        temp.parent->left = temp.right;
        temp.parent->parent = &temp;
        temp.left = t;
        temp.right = temp.parent;
        temp.parent = t->parent;  


        if (tree_root == t)
            tree_root = &temp;
        else
        {
            // t is a left child
            if (t->parent->left == t)
                t->parent->left = &temp;
            else
                t->parent->right = &temp;
        }
        t->parent = &temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_biggest_element_in_tree (
        node* t,
        domain& d,
        range& r
    ) 
    {

        node* next = t->right;
        node* child;  // the child node of the one we will slice out

        if (next == NIL)
        {
            // need to determine if t is a right or left child
            if (t->parent->right == t)
                child = t->parent->right = t->left;
            else
                child = t->parent->left = t->left;

            // update tree_root if necessary
            if (t == tree_root)
                tree_root = child;
        }
        else
        {
            // find the least node
            do 
            {
                t = next;
                next = next->right;
            } while (next != NIL);
            // t is a right child
            child = t->parent->right = t->left;

        }
        
        // swap the item from this node into d and r
        exchange(d,t->d);
        exchange(r,t->r);

        // plug hole right by removing this node
        child->parent = t->parent;

        // keep the red-black properties true
        if (t->color == black)
            fix_after_remove(child);

        // free the memory for this removed node
        pool.deallocate(t);        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    bool binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_least_element_in_tree (
        node* t,
        domain& d,
        range& r
    ) 
    {

        node* next = t->left;
        node* child;  // the child node of the one we will slice out

        if (next == NIL)
        {
            // need to determine if t is a left or right child
            if (t->parent->left == t)
                child = t->parent->left = t->right;
            else
                child = t->parent->right = t->right;

            // update tree_root if necessary
            if (t == tree_root)
                tree_root = child;
        }
        else
        {
            // find the least node
            do 
            {
                t = next;
                next = next->left;
            } while (next != NIL);
            // t is a left child
            child = t->parent->left = t->right;

        }
        
        // swap the item from this node into d and r
        exchange(d,t->d);
        exchange(r,t->r);

        // plug hole left by removing this node
        child->parent = t->parent;

        // keep the red-black properties true
        if (t->color == black)
            fix_after_remove(child);

        bool rvalue = (t == current_element);
        // free the memory for this removed node
        pool.deallocate(t);        
        return rvalue;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    add_to_tree (
        node* t,
        domain& d,
        range& r
    ) 
    {
        // parent of the current node
        node* parent;

        // find a place to add node
        while (true)
        {
            parent = t;
            // if item should be put on the left then go left
            if (comp(d , t->d))
            {
                t = t->left;
                if (t == NIL)
                {
                    t = parent->left = pool.allocate();
                    break;
                }
            }
            // if item should be put on the right then go right
            else
            {
                t = t->right;
                if (t == NIL)
                {
                    t = parent->right = pool.allocate();
                    break;
                }
            }
        }

        // t is now the node where we will add item and
        // parent is the parent of t

        t->parent = parent;
        t->left = NIL;
        t->right = NIL;
        t->color = red;
        exchange(t->d,d);
        exchange(t->r,r);


        // keep the red-black properties true
        fix_after_add(t);
    } 

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_from_tree (
        node* t,
        const domain& d,
        domain& d_copy,
        range& r
    ) 
    {
        while (true)
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
                // found the node we want to remove

                // swap out the item into d_copy and r
                exchange(d_copy,t->d);
                exchange(r,t->r);

                if (t->left == NIL)
                {
                    // if there is no left subtree

                    node* parent = t->parent;
                    
                    // plug hole with right subtree


                    // if t is on the left
                    if (parent->left == t)
                        parent->left = t->right;  
                    else
                        parent->right = t->right;
                    t->right->parent = parent;

                    // update tree_root if necessary
                    if (t == tree_root)
                        tree_root = t->right;

                    if (t->color == black)
                        fix_after_remove(t->right);

                    // delete old node
                    pool.deallocate(t);  
                }
                else if (t->right == NIL)
                {
                    // if there is no right subtree

                    node* parent = t->parent;
                    
                    // plug hole with left subtree
                    if (parent->left == t)
                        parent->left = t->left;  
                    else
                        parent->right = t->left;
                    t->left->parent = parent;

                    // update tree_root if necessary
                    if (t == tree_root)
                        tree_root = t->left;

                    if (t->color == black)
                        fix_after_remove(t->left);

                    // delete old node
                    pool.deallocate(t);
                }
                else
                {
                    // if there is both a left and right subtree
                    // get an element to fill this node now that its been swapped into 
                    // item_copy
                    if (remove_least_element_in_tree(t->right,t->d,t->r))
                    {
                        // the node removed was the one pointed to by current_element so we
                        // need to update it so that it points to the right spot.
                        current_element = t;
                    }
                }

                // quit loop
                break;
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    remove_from_tree (
        node* t,
        const domain& d
    ) 
    {
        while (true)
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
                // found the node we want to remove


                if (t->left == NIL)
                {
                    // if there is no left subtree

                    node* parent = t->parent;
                    
                    // plug hole with right subtree


                    if (parent->left == t)
                        parent->left = t->right;  
                    else
                        parent->right = t->right;
                    t->right->parent = parent;

                    // update tree_root if necessary
                    if (t == tree_root)
                        tree_root = t->right;

                    if (t->color == black)
                        fix_after_remove(t->right);

                    // delete old node
                    pool.deallocate(t);  
                }
                else if (t->right == NIL)
                {
                    // if there is no right subtree

                    node* parent = t->parent;
                    
                    // plug hole with left subtree
                    if (parent->left == t)
                        parent->left = t->left;  
                    else
                        parent->right = t->left;
                    t->left->parent = parent;

                    // update tree_root if necessary
                    if (t == tree_root)
                        tree_root = t->left;

                    if (t->color == black)
                        fix_after_remove(t->left);

                    // delete old node
                    pool.deallocate(t);
                }
                else
                {
                    // if there is both a left and right subtree
                    // get an element to fill this node now that its been swapped into 
                    // item_copy
                    remove_least_element_in_tree(t->right,t->d,t->r);

                }

                // quit loop
                break;
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
    range* binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    return_reference (
        node* t,
        const domain& d
    ) 
    {
        while (t != NIL)
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
    const range* binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    return_reference (
        const node* t,
        const domain& d
    ) const
    {
        while (t != NIL)
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
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    fix_after_add (
        node* t
    )
    {

        while (t->parent->color == red)
        {
            node& grandparent = *(t->parent->parent);

            // if both t's parent and its sibling are red 
            if (grandparent.left->color == grandparent.right->color)
            {
                grandparent.color = red;
                grandparent.left->color = black;
                grandparent.right->color = black;
                t = &grandparent;
            }
            else
            {
                // if t is a left child
                if (t == t->parent->left)
                {
                    // if t's parent is a left child
                    if (t->parent == grandparent.left)
                    {
                        grandparent.color = red;
                        grandparent.left->color = black;
                        rotate_right(&grandparent);
                    }
                    // if t's parent is a right child
                    else
                    {
                        t->color = black;
                        grandparent.color = red;
                        double_rotate_left(&grandparent);
                    }
                }
                // if t is a right child
                else
                {
                    // if t's parent is a left child
                    if (t->parent == grandparent.left)
                    {
                        t->color = black;
                        grandparent.color = red;                        
                        double_rotate_right(&grandparent);
                    }
                    // if t's parent is a right child
                    else
                    {
                        grandparent.color = red;
                        grandparent.right->color = black;
                        rotate_left(&grandparent);
                    }
                }
                break;
            }
        }
        tree_root->color = black;
    }       

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    fix_after_remove (
        node* t
    )
    {

        while (t != tree_root && t->color == black)
        {
            if (t->parent->left == t)
            {
                node* sibling = t->parent->right;
                if (sibling->color == red)
                {
                    sibling->color = black;
                    t->parent->color = red;
                    rotate_left(t->parent);
                    sibling = t->parent->right;
                }

                if (sibling->left->color == black && sibling->right->color == black)
                {
                    sibling->color = red;
                    t = t->parent;
                }
                else
                {
                    if (sibling->right->color == black)
                    {
                        sibling->left->color = black;
                        sibling->color = red;
                        rotate_right(sibling);
                        sibling = t->parent->right;
                    }

                    sibling->color = t->parent->color;
                    t->parent->color = black;
                    sibling->right->color = black;
                    rotate_left(t->parent);
                    t = tree_root;

                }


            }
            else
            {

                node* sibling = t->parent->left;
                if (sibling->color == red)
                {
                    sibling->color = black;
                    t->parent->color = red;
                    rotate_right(t->parent);
                    sibling = t->parent->left;
                }

                if (sibling->left->color == black && sibling->right->color == black)
                {
                    sibling->color = red;
                    t = t->parent;
                }
                else
                {
                    if (sibling->left->color == black)
                    {
                        sibling->right->color = black;
                        sibling->color = red;
                        rotate_left(sibling);
                        sibling = t->parent->left;
                    }

                    sibling->color = t->parent->color;
                    t->parent->color = black;
                    sibling->left->color = black;
                    rotate_right(t->parent);
                    t = tree_root;

                }


            }

        }
        t->color = black;
    
    }         

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    short binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    tree_height (
        node* t
    ) const
    {
        if (t == NIL)
            return 0;

        short height1 = tree_height(t->left);
        short height2 = tree_height(t->right);        
        if (height1 > height2)
            return height1 + 1;
        else
            return height2 + 1;
    }       

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    unsigned long binary_search_tree_kernel_2<domain,range,mem_manager,compare>::
    get_count (
        const domain& d,
        node* tree_root
    ) const
    {
        if (tree_root != NIL)
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

#endif // DLIB_BINARY_SEARCH_TREE_KERNEl_2_

