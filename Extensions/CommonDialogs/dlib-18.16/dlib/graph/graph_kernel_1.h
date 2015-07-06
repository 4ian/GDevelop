// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GRAPH_KERNEl_1_
#define DLIB_GRAPH_KERNEl_1_

#include "../serialize.h"
#include "../noncopyable.h"
#include "../std_allocator.h"
#include "../smart_pointers.h"
#include "../algs.h"
#include <vector>
#include "graph_kernel_abstract.h"
#include "../is_kind.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename node_type, typename graph, bool is_checked>
    struct graph_checker_helper 
    { 
        /*!
            This object is used to check preconditions based on the value of is_checked
        !*/

        static void check_neighbor (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_neighbors(),
                         "\tnode_type& graph::node_type::neighbor(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:            " << edge_index 
                         << "\n\tnumber_of_neighbors(): " << self.number_of_neighbors() 
                         << "\n\tthis:                  " << &self
            );
        }

        static void check_edge (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_neighbors(),
                         "\tE& graph::node_type::edge(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:            " << edge_index 
                         << "\n\tnumber_of_neighbors(): " << self.number_of_neighbors() 
                         << "\n\tthis:                  " << &self
            );
        }

        static void check_node (
            unsigned long index,
            const graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(index < self.number_of_nodes(),
                         "\tnode_type& graph::node(index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tindex:             " << index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );
        }

        static void check_has_edge (
            unsigned long node_index1,
            unsigned long node_index2,
            const graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(node_index1 < self.number_of_nodes() &&
                         node_index2 < self.number_of_nodes(),
                         "\tvoid graph::has_edge(node_index1, node_index2)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tnode_index1:       " << node_index1 
                         << "\n\tnode_index2:       " << node_index2 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_add_edge (
            unsigned long node_index1,
            unsigned long node_index2,
            const graph& self
        )
        {
            DLIB_CASSERT(node_index1 < self.number_of_nodes() &&
                         node_index2 < self.number_of_nodes(),
                         "\tvoid graph::add_edge(node_index1, node_index2)" 
                         << "\n\tYou have specified an invalid index"
                         << "\n\tnode_index1:       " << node_index1 
                         << "\n\tnode_index2:       " << node_index2 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );

            DLIB_CASSERT( self.has_edge(node_index1, node_index2) == false,
                          "\tvoid graph::add_edge(node_index1, node_index2)"
                          << "\n\tYou can't add an edge if it already exists in the graph"
                          << "\n\tnode_index1:       " << node_index1 
                          << "\n\tnode_index2:       " << node_index2 
                          << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                          << "\n\tthis:              " << &self
            );

        }

        static void check_remove_edge (
            unsigned long node_index1,
            unsigned long node_index2,
            const graph& self
        )
        {
            DLIB_CASSERT(node_index1 < self.number_of_nodes() &&
                         node_index2 < self.number_of_nodes(),
                         "\tvoid graph::remove_edge(node_index1, node_index2)" 
                         << "\n\tYou have specified an invalid index"
                         << "\n\tnode_index1:       " << node_index1 
                         << "\n\tnode_index2:       " << node_index2 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );

            DLIB_CASSERT( self.has_edge(node_index1, node_index2) == true,
                          "\tvoid graph::remove_edge(node_index1, node_index2)"
                          << "\n\tYou can't remove an edge if it isn't in the graph"
                          << "\n\tnode_index1:       " << node_index1 
                          << "\n\tnode_index2:       " << node_index2 
                          << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                          << "\n\tthis:              " << &self
            );

        }

        static void check_remove_node (
            unsigned long index,
            const graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(index < self.number_of_nodes(),
                         "\tvoid graph::remove_node(index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tindex:             " << index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                         << "\n\tthis:              " << &self
            );
        }
    };

    template <typename node_type, typename graph>
    struct graph_checker_helper <node_type, graph, false>
    { 
        static inline void check_edge ( unsigned long , const node_type& ) { }
        static inline void check_neighbor ( unsigned long , const node_type& ) { }
        static inline void check_node ( unsigned long , const graph& ) { }
        static inline void check_has_edge ( unsigned long , unsigned long , const graph& ) { }
        static inline void check_add_edge ( unsigned long , unsigned long , const graph& ) { }
        static inline void check_remove_edge ( unsigned long , unsigned long , const graph& ) { }
        static inline void check_remove_node ( unsigned long , const graph& ) { }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E = char,
        typename mem_manager = default_memory_manager,
        bool is_checked = true 
        >
    class graph_kernel_1 : noncopyable
    {

        /*!
            INITIAL VALUE
                - nodes.size() == 0

            CONVENTION
                - nodes.size() == number_of_nodes()
                - for all valid i:
                    - *nodes[i] == node(i)
                    - nodes[i]->neighbors.size() == nodes[i]->number_of_neighbors(i)
                    - nodes[i]->idx == i == nodes[i]->index()
                    - for all valid n:
                        - nodes[i]->neighbors[n] == pointer to the n'th parent node of i
                        - *nodes[i]->neighbors[n] == node(i).neighbor(n)
                        - *nodes[i]->edges[n] == node(i).edge(n)
        !*/

    public:
        struct node_type;

    private:
        typedef graph_checker_helper<node_type, graph_kernel_1, is_checked> checker;


    public:

        typedef T type;
        typedef E edge_type;
        typedef mem_manager mem_manager_type;

        graph_kernel_1(
        ) {}

        virtual ~graph_kernel_1(
        ) {}

        void clear(
        ) { nodes.clear(); }

        void set_number_of_nodes (
            unsigned long new_size
        );

        unsigned long number_of_nodes (
        ) const { return nodes.size(); }

        node_type& node (
            unsigned long index
        ) { checker::check_node(index,*this); return *nodes[index]; }

        const node_type& node (
            unsigned long index
        ) const { checker::check_node(index,*this); return *nodes[index]; }

        bool has_edge (
            unsigned long node_index1,
            unsigned long node_index2
        ) const;

        void add_edge (
            unsigned long node_index1,
            unsigned long node_index2
        );

        void remove_edge (
            unsigned long node_index1,
            unsigned long node_index2
        );

        unsigned long add_node (
        );

        void remove_node (
            unsigned long index
        );

        void swap (
            graph_kernel_1& item
        ) { nodes.swap(item.nodes); }

    public:

        struct node_type
        {
            T data;
            typedef graph_kernel_1 graph_type;

            unsigned long index(
            ) const { return idx; }

            unsigned long number_of_neighbors (
            ) const { return neighbors.size(); }

            const node_type& neighbor (
                unsigned long edge_index
            ) const { checker::check_neighbor(edge_index,*this);  return *neighbors[edge_index]; }

            node_type& neighbor (
                unsigned long edge_index
            ) { checker::check_neighbor(edge_index,*this);  return *neighbors[edge_index]; }

            const E& edge (
                unsigned long edge_index
            ) const { checker::check_edge(edge_index,*this);  return *edges[edge_index]; }

            E& edge (
                unsigned long edge_index
            ) { checker::check_edge(edge_index,*this);  return *edges[edge_index]; }

        private:
            friend class graph_kernel_1;
            typedef std_allocator<node_type*,mem_manager> alloc_type;
            typedef std_allocator<shared_ptr<E>,mem_manager> alloc_edge_type;
            std::vector<node_type*,alloc_type> neighbors;
            std::vector<shared_ptr<E>,alloc_edge_type> edges;
            unsigned long idx;
        };

    private:

        typedef std_allocator<shared_ptr<node_type>,mem_manager> alloc_type;
        typedef std::vector<shared_ptr<node_type>, alloc_type> vector_type;
        vector_type nodes;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename E, 
        typename mem_manager,
        bool is_checked
        >
    inline void swap (
        graph_kernel_1<T,E,mem_manager,is_checked>& a, 
        graph_kernel_1<T,E,mem_manager,is_checked>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename E, 
        typename mem_manager,
        bool is_checked
        >
    struct is_graph<graph_kernel_1<T,E,mem_manager, is_checked> >
    {
        static const bool value = true; 
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void serialize (
        const graph_kernel_1<T,E,mem_manager,is_checked>& item,
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.number_of_nodes(), out);

            // serialize each node
            for (unsigned long i = 0; i < item.number_of_nodes(); ++i)
            {
                serialize(item.node(i).data, out);

                // serialize all the edges
                for (unsigned long n = 0; n < item.node(i).number_of_neighbors(); ++n)
                {
                    // only serialize edges that we haven't already serialized 
                    if (item.node(i).neighbor(n).index() >= i)
                    {
                        serialize(item.node(i).neighbor(n).index(), out);
                        serialize(item.node(i).edge(n), out);
                    }
                }
                const unsigned long stop_mark = 0xFFFFFFFF;
                serialize(stop_mark, out);
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type graph_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void deserialize (
        graph_kernel_1<T,E,mem_manager,is_checked>& item,
        std::istream& in
    )   
    {
        try
        {
            unsigned long size;
            deserialize(size, in);

            item.clear();
            item.set_number_of_nodes(size);

            // deserialize each node
            for (unsigned long i = 0; i < item.number_of_nodes(); ++i)
            {
                deserialize(item.node(i).data, in);

                const unsigned long stop_mark = 0xFFFFFFFF;
                // Add all the edges going to this node's neighbors
                unsigned long index;
                deserialize(index, in);
                while (index != stop_mark)
                {
                    item.add_edge(i, index);
                    // find the edge
                    unsigned long j = 0;
                    for (j = 0; j < item.node(i).number_of_neighbors(); ++j)
                        if (item.node(i).neighbor(j).index() == index)
                            break;

                    deserialize(item.node(i).edge(j), in);
                    deserialize(index, in);
                }

            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type graph_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                             member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void graph_kernel_1<T,E,mem_manager,is_checked>::
    set_number_of_nodes (
        unsigned long new_size
    )
    {
        try
        {
            nodes.resize(new_size);
            for (unsigned long i = 0; i < nodes.size(); ++i)
            {
                nodes[i].reset(new node_type);
                nodes[i]->idx = i;
            }
        }
        catch (...)
        {
            clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    bool graph_kernel_1<T,E,mem_manager,is_checked>::
    has_edge (
        unsigned long node_index1,
        unsigned long node_index2
    ) const
    {
        checker::check_has_edge(node_index1, node_index2, *this);

        node_type& n = *nodes[node_index1];

        // search all the child nodes to see if there is a link to the right node
        for (unsigned long i = 0; i < n.neighbors.size(); ++i)
        {
            if (n.neighbors[i]->idx == node_index2)
                return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void graph_kernel_1<T,E,mem_manager,is_checked>::
    add_edge (
        unsigned long node_index1,
        unsigned long node_index2
    )
    {
        checker::check_add_edge(node_index1, node_index2, *this);
        try
        {
            node_type& n1 = *nodes[node_index1];
            node_type& n2 = *nodes[node_index2];

            n1.neighbors.push_back(&n2);

            shared_ptr<E> e(new E);
            n1.edges.push_back(e);

            // don't add this twice if this is an edge from node_index1 back to itself
            if (node_index1 != node_index2)
            {
                n2.neighbors.push_back(&n1);
                n2.edges.push_back(e);
            }
        }
        catch (...)
        {
            clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void graph_kernel_1<T,E,mem_manager,is_checked>::
    remove_edge (
        unsigned long node_index1,
        unsigned long node_index2
    )
    {
        checker::check_remove_edge(node_index1, node_index2, *this);

        node_type& n1 = *nodes[node_index1];
        node_type& n2 = *nodes[node_index2];

        // remove the record of the link from n1 
        unsigned long pos = static_cast<unsigned long>(find(n1.neighbors.begin(), n1.neighbors.end(), &n2) - n1.neighbors.begin());
        n1.neighbors.erase(n1.neighbors.begin() + pos); 
        n1.edges.erase(n1.edges.begin() + pos); 

        // check if this is an edge that goes from node_index1 back to itself
        if (node_index1 != node_index2)
        {
            // remove the record of the link from n2 
            unsigned long pos = static_cast<unsigned long>(find(n2.neighbors.begin(), n2.neighbors.end(), &n1) - n2.neighbors.begin());
            n2.neighbors.erase(n2.neighbors.begin() + pos); 
            n2.edges.erase(n2.edges.begin() + pos); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    unsigned long graph_kernel_1<T,E,mem_manager,is_checked>::
    add_node (
    )
    {
        try
        {
            shared_ptr<node_type> n(new node_type);
            n->idx = nodes.size();
            nodes.push_back(n);
            return n->idx;
        }
        catch (...)
        {
            clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void graph_kernel_1<T,E,mem_manager,is_checked>::
    remove_node (
        unsigned long index
    )
    {
        checker::check_remove_node(index,*this);

        node_type& n = *nodes[index];

        // remove all edges pointing to this node from its neighbors 
        for (unsigned long i = 0; i < n.neighbors.size(); ++i)
        {
            // remove the edge from this specific parent
            unsigned long pos = static_cast<unsigned long>(find(n.neighbors[i]->neighbors.begin(), n.neighbors[i]->neighbors.end(), &n) - 
                                n.neighbors[i]->neighbors.begin());
            n.neighbors[i]->neighbors.erase(n.neighbors[i]->neighbors.begin() + pos); 
            n.neighbors[i]->edges.erase(n.neighbors[i]->edges.begin() + pos); 
        }

        // now remove this node by replacing it with the last node in the nodes vector
        nodes[index] = nodes[nodes.size()-1];

        // update the index for the node we just moved
        nodes[index]->idx = index;

        // now remove the duplicated node at the end of the vector
        nodes.pop_back();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GRAPH_KERNEl_1_

