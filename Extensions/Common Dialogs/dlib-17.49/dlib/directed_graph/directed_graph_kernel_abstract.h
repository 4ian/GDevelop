// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DIRECTED_GRAPH_KERNEl_ABSTRACT_
#ifdef DLIB_DIRECTED_GRAPH_KERNEl_ABSTRACT_

#include "../serialize.h"
#include "../algs.h"
#include "../noncopyable.h"

namespace dlib
{

    template <
        typename T,
        typename E = char,
        typename mem_manager = default_memory_manager 
        >
    class directed_graph : noncopyable
    {

        /*!
            REQUIREMENTS ON T 
                T must be swappable by a global swap() and
                T must have a default constructor

            REQUIREMENTS ON E 
                E must be swappable by a global swap() and
                E must have a default constructor

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            POINTERS AND REFERENCES TO INTERNAL DATA
                The only time pointers or references to nodes or edges become invalid is when
                they reference nodes or edges that have been removed from a graph.

            INITIAL VALUE
                number_of_nodes() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a directed graph which is a set of nodes with directed
                edges connecting various nodes.  

                In this object if there is a directed edge from a node A to a node B then I say 
                that A is the parent of B and B is the child of A.

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/

    public:

        typedef T type;
        typedef E edge_type;
        typedef mem_manager mem_manager_type;

        template <typename Tr, typename Er, typename MMr>
        struct rebind {
            typedef directed_graph<Tr,Er,MMr> other;
        };

        directed_graph(
        );
        /*!
            ensures 
                - #*this is properly initialized
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
        !*/

        virtual ~directed_graph(
        ); 
        /*!
            ensures
                - all resources associated with *this has been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                  If this exception is thrown then *this is unusable 
                  until clear() is called and succeeds
        !*/

        void set_number_of_nodes (
            unsigned long new_size
        );
        /*!
            ensures
                - #number_of_nodes() == new_size
                - for all i < new_size:
                    - number_of_parents(i) == 0
                    - number_of_children(i) == 0
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in this graph
        !*/

        struct node_type
        {
            T data;
            typedef directed_graph graph_type;

            unsigned long index(
            ) const;
            /*!
                ensures
                    - let G be the graph that contains the node *this
                    - returns a number N such that G.node(N) == *this
                      (i.e. returns the index of this node in the graph)
            !*/

            unsigned long number_of_parents (
            ) const;
            /*!
                ensures
                    - returns the number of parents of this node 
            !*/

            unsigned long number_of_children (
            ) const;
            /*!
                ensures
                    - returns the number of children of this node 
            !*/

            const node_type& parent (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_parents()
                ensures
                    - returns a const reference to the edge_index'th parent of *this
            !*/

            node_type& parent (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_parents()
                ensures
                    - returns a non-const reference to the edge_index'th parent of *this
            !*/

            const node_type& child (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_children()
                ensures
                    - returns a const reference to the edge_index'th child of *this
            !*/

            node_type& child (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_children()
                ensures
                    - returns a non-const reference to the edge_index'th child of *this
            !*/

            const E& parent_edge (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_parents()
                ensures
                    - returns a const reference to the edge_index'th edge data for the
                      edge connecting to node this->parent(edge_index)
            !*/

            E& parent_edge (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_parents()
                ensures
                    - returns a non-const reference to the edge_index'th edge data for the
                      edge connecting to node this->parent(edge_index)
            !*/

            const E& child_edge (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_children()
                ensures
                    - returns a const reference to the edge_index'th edge data for the
                      edge connecting to node this->child(edge_index)
            !*/

            E& child_edge (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_children()
                ensures
                    - returns a non-const reference to the edge_index'th edge data for the
                      edge connecting to node this->child(edge_index)
            !*/
        };

        node_type& node (
            unsigned long index
        );
        /*!
            requires
                - index < number_of_nodes()
            ensures
                - returns a non-const reference to the node with the given index
        !*/

        const node_type& node (
            unsigned long index
        ) const;
        /*!
            requires
                - index < number_of_nodes()
            ensures
                - returns a const reference to the node with the given index
        !*/

        bool has_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index
        ) const;
        /*!
            requires
                - parent_node_index < number_of_nodes()
                - child_node_index < number_of_nodes()
            ensures
                - if (there is an edge leading from node(parent_node_index) to
                  node(child_node_index)) then
                    - returns true
                - else
                    - returns false
        !*/

        void add_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index
        );
        /*!
            requires
                - parent_node_index < number_of_nodes()
                - child_node_index < number_of_nodes()
                - has_edge(parent_node_index, child_node_index) == false
            ensures
                - #has_edge(parent_node_index, child_node_index) == true 
            throws
                - std::bad_alloc 
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        void remove_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index
        );
        /*!
            requires
                - parent_node_index < number_of_nodes()
                - child_node_index < number_of_nodes()
                - has_edge(parent_node_index, child_node_index) == true 
            ensures
                - #has_edge(parent_node_index, child_node_index) == false 
            throws
                - std::bad_alloc 
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        unsigned long add_node (
        );
        /*!
            ensures
                - does not change the index number of existing nodes
                - adds a node with index N == number_of_nodes() such that:
                    - #node(N).number_of_parents() == 0 
                    - #node(N).number_of_children() == 0 
                    - #number_of_nodes() == number_of_nodes() + 1
                    - returns N  
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        void remove_node (
            unsigned long index
        );
        /*!
            requires
                - index < number_of_nodes()
            ensures
                - removes the node with the given index from the graph. 
                - removes all edges linking the removed node to the rest
                  of the graph.
                - the remaining node indexes are remapped so that they remain
                  contiguous.  (This means that for all valid N, node(N) doesn't
                  necessarily reference the same node as #node(N))
                - #number_of_nodes() == number_of_nodes() - 1
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        void swap (
            directed_graph& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    };

    template <
        typename T, 
        typename mem_manager
        >
    inline void swap (
        directed_graph<T,mem_manager>& a, 
        directed_graph<T,mem_manager>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const directed_graph<T,mem_manager>& item,
        std::ostream& out 
    );   
    /*!
        provides deserialization support 
    !*/

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        directed_graph<T,mem_manager>& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_DIRECTED_GRAPH_KERNEl_ABSTRACT_


