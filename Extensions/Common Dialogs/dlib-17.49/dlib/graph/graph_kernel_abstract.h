// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_GRAPH_KERNEl_ABSTRACT_
#ifdef DLIB_GRAPH_KERNEl_ABSTRACT_

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
    class graph : noncopyable
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
                This object represents an undirected graph which is a set of nodes with undirected
                edges connecting various nodes.  

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/

    public:

        typedef T type;
        typedef E edge_type;
        typedef mem_manager mem_manager_type;

        graph(
        );
        /*!
            ensures 
                - #*this is properly initialized
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
        !*/

        virtual ~graph(
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
                    - number_of_neighbors(i) == 0
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
            typedef graph graph_type;

            unsigned long index(
            ) const;
            /*!
                ensures
                    - let G be the graph that contains the node *this
                    - returns a number N such that G.node(N) == *this
                      (i.e. returns the index of this node in the graph)
            !*/

            unsigned long number_of_neighbors (
            ) const;
            /*!
                ensures
                    - returns the number of nodes in this graph that are
                      adjacent to this node.  I.e. the number of nodes
                      that are directly connected to this node via an edge. 
            !*/

            const node_type& neighbor (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_neighbors()
                ensures
                    - returns a const reference to the edge_index'th neighbor of *this
            !*/

            node_type& neighbor (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_neighbors()
                ensures
                    - returns a non-const reference to the edge_index'th neighbor of *this
            !*/

            const E& edge (
                unsigned long edge_index
            ) const;
            /*!
                requires
                    - edge_index < number_of_neighbors()
                ensures
                    - returns a const reference to the edge_index'th edge data for the
                      edge connecting to neighbor this->neighbor(edge_index)
            !*/

            E& edge (
                unsigned long edge_index
            );
            /*!
                requires
                    - edge_index < number_of_neighbors()
                ensures
                    - returns a non-const reference to the edge_index'th edge data for the
                      edge connecting to neighbor this->neighbor(edge_index)
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
            unsigned long node_index1,
            unsigned long node_index2 
        ) const;
        /*!
            requires
                - node_index1 < number_of_nodes()
                - node_index2 < number_of_nodes()
            ensures
                - if (there is an edge connecting node(node_index1) and node(node_index2)) then
                    - returns true
                - else
                    - returns false
        !*/

        void add_edge (
            unsigned long node_index1,
            unsigned long node_index2
        );
        /*!
            requires
                - node_index1 < number_of_nodes()
                - node_index2 < number_of_nodes()
                - has_edge(node_index1, node_index2) == false
            ensures
                - #has_edge(node_index1, node_index2) == true 
            throws
                - std::bad_alloc 
                  If this exception is thrown then this object reverts back 
                  to its initial state.
        !*/

        void remove_edge (
            unsigned long node_index1,
            unsigned long node_index2
        );
        /*!
            requires
                - node_index1 < number_of_nodes()
                - node_index2 < number_of_nodes()
                - has_edge(node_index1, node_index2) == true 
            ensures
                - #has_edge(node_index1, node_index2) == false 
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
                    - #node(N).number_of_neighbors() == 0 
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
            graph& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    };

    template <
        typename T, 
        typename E, 
        typename mem_manager
        >
    inline void swap (
        graph<T,E,mem_manager>& a, 
        graph<T,E,mem_manager>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T,
        typename E,
        typename mem_manager
        >
    void serialize (
        const graph<T,E,mem_manager>& item,
        std::ostream& out 
    );   
    /*!
        provides deserialization support 
    !*/

    template <
        typename T,
        typename E,
        typename mem_manager
        >
    void deserialize (
        graph<T,E,mem_manager>& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_GRAPH_KERNEl_ABSTRACT_


