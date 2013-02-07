// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_KERNEl_1_
#define DLIB_SEQUENCE_KERNEl_1_

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
    class sequence_kernel_1 : public enumerable<T>,
                              public remover<T>
    {

        /*!
            INITIAL VALUE
                - tree_root == 0
                - tree_size == 0 
                - at_start_ == true
                - current_element == 0
                - stack == array of 50 node pointers
                - stack_pos == 0         

            CONVENTION
                
                - if (tree_size > 0)
                    - tree_root == pointer to the root node of the binary search tree
                - else
                    - tree_root == 0



                - stack[stack_pos-1] == pop()

                - current_element_valid() == (current_element != 0)
                
                - at_start_ == at_start()
                - if (current_element != 0 && current_element != tree_root) then
                    - stack[stack_pos-1] == the parent of the node pointed to by current_element

                - if (current_element_valid()) then
                    - element() == current_element->item



                - tree_size == size()
                - (*this)[i] == return_reference(i)


                - for all nodes:
                    - left_size == the number of elements in the left subtree. 
                    - left points to the left subtree or 0 if there is no left subtree. 
                    - right points to the right subtree or 0 if there is no right subtree. 

                    - all elements in a left subtree have a position in the sequence < that 
                      of the root of the current tree. 

                    - all elements in a right subtree have a position in the 
                      sequence > that of the root of the current tree.      

                    - item is the sequence element for that node. 
                    - balance:
                        - balance == 0 if both subtrees have the same height
                        - balance == -1 if the left subtree has a height that is 
                          greater than the height of the right subtree by 1
                        - balance == 1 if the right subtree has a height that is 
                          greater than the height of the left subtree by 1
                    - for all subtrees:
                        - the height of the left and right subtrees differ by at most one

        !*/


        class node
        {
        public:
            node* left;
            node* right;
            unsigned long left_size;
            T item;
            signed char balance;            
        };


        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            sequence_kernel_1 (
            ) : 
                tree_root(0),
                tree_size(0),
                stack(ppool.allocate_array(50)),
                current_element(0),
                at_start_(true),
                stack_pos(0)
            {}

            virtual ~sequence_kernel_1 (
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
                sequence_kernel_1& item
            );

            const T& operator[] (
                unsigned long pos
            ) const;
            
            T& operator[] (
                unsigned long pos
            );

            inline void swap (
                sequence_kernel_1& item
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
                node* t
            );
            /*!
                requires
                    - t == a pointer to a valid node
                ensures
                    - deletes t and all its sub nodes.
            !*/

            inline void rotate_left (
                node*& t
            );
            /*!
                requires
                    - t->balance == 2 
                    - t->right->balance == 0 or 1
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
                    - #t->balance == -2 
                    - #t->left->balance == 1
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
                    - #t->balance == 2 
                    - #t->right->balance == -1
                ensures
                    - #t is still a binary search tree 
                    - #t now has a balance of 0 and
                    - #t now has a height smaller by 1
            !*/

            bool remove_least_element_in_tree (
                node*& t,
                T& item
            );
            /*!
                requires
                    - t != 0  (i.e. there must be something in the tree to remove)
                ensures
                    - the least node in t has been removed 
                    - the least node element in t has been put into #item 
                    - #t is still a binary search tree 
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            bool add_to_tree (
                node*& t,
                unsigned long pos,
                T& item
            );
            /*!
                requires
                    - pos <= the number of items in the tree
                ensures
                    - item has been added to #t 
                    - #return_reference(pos) == item 
                    - the convention is still satisfied 
                    - #item has an initial value for its type 
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has grown by one
            !*/

            bool remove_from_tree (
                node*& t,
                unsigned long pos,
                T& item
            );
            /*!
                requires
                    - there is an item in the tree associated with pos
                ensures
                    - the element in the tree associated with pos has been removed 
                      and put into #item                                                  
                    - the convention is still satisfied                                   
                    - returns false if the height of the tree has not changed 
                    - returns true if the height of the tree has shrunk by one
            !*/

            const T& return_reference (
                const node* t,
                unsigned long pos
            ) const;
            /*!
                requires
                    - there is an item in the tree associated with pos
                ensures
                    - returns a const reference to the item in the tree associated with pos
            !*/

            T& return_reference (
                node* t,
                unsigned long pos
            );
            /*!
                requires
                    - there is an item in the tree associated with pos
                ensures
                    - returns a non-const reference to the item in the tree associated 
                      with pos
            !*/

            inline bool keep_node_balanced (
                node*& t
            );
            /*!
                requires
                    - t != 0
                ensures
                    - if (t->balance is < 1 or > 1) then 
                        - keep_node_balanced() will ensure that t->balance == 0, -1, or 1
                    - returns true if it made the tree one height shorter 
                    - returns false if it didn't change the height
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

            // data members
            typename mem_manager::template rebind<node>::other pool;
            typename mem_manager::template rebind<node*>::other ppool;

            node* tree_root;
            unsigned long tree_size;

            mutable node** stack;
            mutable node* current_element;
            mutable bool at_start_;
            mutable unsigned char stack_pos;

            // restricted functions
            sequence_kernel_1(sequence_kernel_1&);        // copy constructor
            sequence_kernel_1& operator=(sequence_kernel_1&); // assignment operator        

    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        sequence_kernel_1<T,mem_manager>& a, 
        sequence_kernel_1<T,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        sequence_kernel_1<T,mem_manager>& item, 
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
            throw serialization_error(e.info + "\n   while deserializing object of type sequence_kernel_1"); 
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
    sequence_kernel_1<T,mem_manager>::
    ~sequence_kernel_1 (
    )
    {
        ppool.deallocate_array(stack);
        if (tree_size > 0)
        {
            delete_nodes(tree_root);
        }
    }

// ----------------------------------------------------------------------------------------
    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
    swap (
        sequence_kernel_1<T,mem_manager>& item
    )
    {        
        exchange(stack,item.stack);
        exchange(stack_pos,item.stack_pos);
        
        pool.swap(item.pool);
        ppool.swap(item.ppool);

        node* tree_root_temp            = item.tree_root;
        unsigned long tree_size_temp    = item.tree_size;
        node* current_element_temp      = item.current_element;
        bool at_start_temp              = item.at_start_;

        item.tree_root = tree_root;
        item.tree_size = tree_size;
        item.current_element = current_element;
        item.at_start_   = at_start_;

        tree_root = tree_root_temp;
        tree_size = tree_size_temp;
        current_element = current_element_temp;
        at_start_   = at_start_temp;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long sequence_kernel_1<T,mem_manager>::
    size (
    ) const
    {
        return tree_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& sequence_kernel_1<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) const
    {
        return return_reference(tree_root,pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& sequence_kernel_1<T,mem_manager>::
    operator[] (
        unsigned long pos
    )
    {
        return return_reference(tree_root,pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
    add (
        unsigned long pos,
        T& item
    )
    {
        add_to_tree(tree_root,pos,item);
        ++tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
    remove (
        unsigned long pos,
        T& item
    )
    {
        remove_from_tree(tree_root,pos,item);
        --tree_size;
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
    cat (
        sequence_kernel_1<T,mem_manager>& item
    )
    {   
        for (unsigned long i = 0; i < item.tree_size; ++i)
        {
            add_to_tree(
                tree_root,
                tree_size,
                return_reference(item.tree_root,i)
            );

            ++tree_size;
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
    void sequence_kernel_1<T,mem_manager>::
    clear (
    )
    {
        if (tree_size > 0)
        {
            delete_nodes(tree_root);
            tree_root = 0;
            tree_size = 0;
        }    
        // reset the enumerator
        reset();    
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
    bool sequence_kernel_1<T,mem_manager>::
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
    void sequence_kernel_1<T,mem_manager>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
        stack_pos = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_1<T,mem_manager>::
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
    const T& sequence_kernel_1<T,mem_manager>::
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
    T& sequence_kernel_1<T,mem_manager>::
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
    bool sequence_kernel_1<T,mem_manager>::
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
    // remover function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
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
    void sequence_kernel_1<T,mem_manager>::
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


        // set left_size to its correct value
        t->left_size += t->left->left_size + 1;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
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


        // set left_size to its correct value
        t->right->left_size -= t->left_size + 1;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
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


        // set left_size to its correct value
        t->left_size += t->left->left_size + 1;
        t->right->left_size -= t->left_size + 1;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
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

        // set left_size to its correct value
        t->right->left_size -= t->left_size + 1;
        t->left_size += t->left->left_size + 1;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_1<T,mem_manager>::
    remove_least_element_in_tree (
        node*& t,
        T& item
    ) 
    {
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;

        // if the left tree is an empty tree
        if ( tree.left == 0)
        {
            // swap nodes element into item
            exchange(tree.item,item);

            // plug hole left by removing this node
            t = tree.right;

            // delete the node that was just removed
            tree.right = 0;
            delete_nodes(&tree);    

            // return that the height of this part of the tree has decreased
            return true;
        }
        else
        {
            // subtract one from the left size
            --tree.left_size;

            // keep going left

            // if remove made the tree one height shorter
            if ( remove_least_element_in_tree(tree.left,item) ) 
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
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_1<T,mem_manager>::
    add_to_tree (
        node*& t,
        unsigned long pos,
        T& item
    ) 
    {
        // if found place to add
        if (t == 0)
        {
            // create a node to add new item into
            t = pool.allocate();

            // make a reference to the current node so we don't have to dereference 
            // a pointer a bunch of times
            node& tree = *t;


            // set left and right pointers to 0 to indicate that there are no 
            // left or right subtrees
            tree.left = 0;
            tree.right = 0;
            tree.balance = 0;
            tree.left_size = 0;

            // put item into t
            exchange(item,tree.item);

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
            if ( pos < tree.left_size + 1 )
            {
                tree.balance -= add_to_tree(tree.left,pos,item);
                ++tree.left_size;
            }
            else
                tree.balance += add_to_tree(tree.right,pos - tree.left_size - 1,item);


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
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_1<T,mem_manager>::
    remove_from_tree (
        node*& t,
        unsigned long pos,
        T& item
    ) 
    {
        
        // make a reference to the current node so we don't have to dereference 
        // a pointer a bunch of times
        node& tree = *t;

        // if item is on the left
        if (pos < tree.left_size)
        {
            // adjust the left size
            --tree.left_size;

            // if the left side of the tree has the greatest height
            if (tree.balance == -1)
            {
                tree.balance += remove_from_tree(tree.left,pos,item);
                return !tree.balance;
            }
            else
            {
                tree.balance += remove_from_tree(tree.left,pos,item);
                return keep_node_balanced(t);
            }
             
        }
        // if item is found
        else if (pos == tree.left_size)
        {
            // if there is no left node
            if (tree.left == 0)
            {
                // swap nodes element into item
                exchange(tree.item,item);

                // plug hole left by removing this node and free memory
                t = tree.right;  // plug hole with right subtree
                
                // delete old node
                tree.right = 0;
                delete_nodes(&tree);  

                // indicate that the height has changed
                return true;
            }
            // if there is no right node
            else if (tree.right == 0)
            {
                // swap nodes element into item
                exchange(tree.item,item);

                // plug hole left by removing this node and free memory
                t = tree.left;  // plug hole with left subtree

                // delete old node
                tree.left = 0;
                delete_nodes(&tree);  

                // indicate that the height of this tree has changed
                return true;
            }
            // if there are both a left and right sub node
            else
            {
                // get an element that can replace the one being removed and do this 
                // if it made the right subtree shrink by one
                if (remove_least_element_in_tree(tree.right,item))
                {
                    // adjust the tree height
                    --tree.balance;

                    // put the element into item copy and also plug the 
                    // hole with the smallest element from the right.
                    exchange(item,tree.item);

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
                    // put the element into item copy and also plug the 
                    // hole with the smallest element from the right.
                    exchange(item,tree.item);

                    return false;
                }

            }
        }
        // if item is on the right
        else
        {

            // if the right side of the tree has the greatest height
            if (tree.balance == 1)
            {
                tree.balance -= remove_from_tree(tree.right,pos - tree.left_size - 1,item);
                return !tree.balance;
            }
            else
            {
                tree.balance -= remove_from_tree(tree.right,pos - tree.left_size - 1,item);
                return keep_node_balanced(t);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& sequence_kernel_1<T,mem_manager>::
    return_reference (
        node* t,
        unsigned long pos
    ) 
    {
        while (true)
        {
            // if we have found the node
            if (pos == t->left_size)
                return t->item;
            
            if (pos < t->left_size)
            {
                // go left
                t = t->left;
            }
            else
            {
                // go right
                pos -= t->left_size+1;
                t = t->right;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& sequence_kernel_1<T,mem_manager>::
    return_reference (
        const node* t,
        unsigned long pos
    ) const
    {
        while (true)
        {
            // if we have found the node
            if (pos == t->left_size)
                return t->item;
            
            if (pos < t->left_size)
            {
                // go left
                t = t->left;
            }
            else
            {
                // go right
                pos -= t->left_size+1;
                t = t->right;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool sequence_kernel_1<T,mem_manager>::
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
        typename T,
        typename mem_manager
        >
    void sequence_kernel_1<T,mem_manager>::
    delete_nodes (
        node* t
    )
    {
        if (t->left) 
            delete_nodes(t->left); 
        if (t->right) 
            delete_nodes(t->right); 
        pool.deallocate(t);
    }

// ----------------------------------------------------------------------------------------
}

#endif // DLIB_SEQUENCE_KERNEl_1_

