// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIRECTED_GRAPH_KERNEl_1_
#define DLIB_DIRECTED_GRAPH_KERNEl_1_

#include "../serialize.h"
#include "../noncopyable.h"
#include "../std_allocator.h"
#include "../smart_pointers.h"
#include "../algs.h"
#include <vector>
#include "directed_graph_kernel_abstract.h"
#include "../is_kind.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename node_type, typename directed_graph, bool is_checked>
    struct directed_graph_checker_helper 
    { 
        /*!
            This object is used to check preconditions based on the value of is_checked
        !*/

        static void check_parent_edge (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_parents(),
                         "\tnode_type& directed_graph::node_type::parent_edge(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:          " << edge_index 
                         << "\n\tnumber_of_parents(): " << self.number_of_parents() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_child_edge (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_children(),
                         "\tnode_type& directed_graph::node_type::child_edge(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:           " << edge_index 
                         << "\n\tnumber_of_children(): " << self.number_of_children() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_parent (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_parents(),
                         "\tnode_type& directed_graph::node_type::parent(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:          " << edge_index 
                         << "\n\tnumber_of_parents(): " << self.number_of_parents() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_child (
            unsigned long edge_index,
            const node_type& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(edge_index < self.number_of_children(),
                         "\tnode_type& directed_graph::node_type::child(edge_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tedge_index:           " << edge_index 
                         << "\n\tnumber_of_children(): " << self.number_of_children() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_node (
            unsigned long index,
            const directed_graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(index < self.number_of_nodes(),
                         "\tnode_type& directed_graph::node(index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tindex:             " << index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );
        }

        static void check_has_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index,
            const directed_graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(parent_node_index < self.number_of_nodes() &&
                         child_node_index < self.number_of_nodes(),
                         "\tvoid directed_graph::has_edge(parent_node_index, child_node_index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tparent_node_index: " << parent_node_index 
                         << "\n\tchild_node_index:  " << child_node_index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                         << "\n\tthis:              " << &self
            );
        }

        static void check_add_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index,
            const directed_graph& self
        )
        {
            DLIB_CASSERT(parent_node_index < self.number_of_nodes() &&
                         child_node_index < self.number_of_nodes(),
                         "\tvoid directed_graph::add_edge(parent_node_index, child_node_index)" 
                         << "\n\tYou have specified an invalid index"
                         << "\n\tparent_node_index: " << parent_node_index 
                         << "\n\tchild_node_index:  " << child_node_index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );

            DLIB_CASSERT( self.has_edge(parent_node_index, child_node_index) == false,
                          "\tvoid directed_graph::add_edge(parent_node_index, child_node_index)"
                          << "\n\tYou can't add an edge if it already exists in the graph"
                          << "\n\tparent_node_index: " << parent_node_index 
                          << "\n\tchild_node_index:  " << child_node_index 
                          << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                          << "\n\tthis:              " << &self
            );

        }

        static void check_remove_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index,
            const directed_graph& self
        )
        {
            DLIB_CASSERT(parent_node_index < self.number_of_nodes() &&
                         child_node_index < self.number_of_nodes(),
                         "\tvoid directed_graph::remove_edge(parent_node_index, child_node_index)" 
                         << "\n\tYou have specified an invalid index"
                         << "\n\tparent_node_index: " << parent_node_index 
                         << "\n\tchild_node_index:  " << child_node_index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                         << "\n\tthis:              " << &self
            );

            DLIB_CASSERT( self.has_edge(parent_node_index, child_node_index) == true,
                          "\tvoid directed_graph::remove_edge(parent_node_index, child_node_index)"
                          << "\n\tYou can't remove an edge if it isn't in the graph"
                          << "\n\tparent_node_index: " << parent_node_index 
                          << "\n\tchild_node_index:  " << child_node_index 
                          << "\n\tnumber_of_nodes(): " << self.number_of_nodes()
                          << "\n\tthis:              " << &self
            );

        }

        static void check_remove_node (
            unsigned long index,
            const directed_graph& self
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(index < self.number_of_nodes(),
                         "\tvoid directed_graph::remove_node(index)"
                         << "\n\tYou have specified an invalid index"
                         << "\n\tindex:             " << index 
                         << "\n\tnumber_of_nodes(): " << self.number_of_nodes() 
                         << "\n\tthis:              " << &self
            );
        }
    };

    template <typename node_type, typename directed_graph>
    struct directed_graph_checker_helper <node_type, directed_graph, false>
    { 
        static inline void check_parent ( unsigned long , const node_type&) { }
        static inline void check_child ( unsigned long , const node_type& ) { }
        static inline void check_parent_edge ( unsigned long , const node_type&) { }
        static inline void check_child_edge ( unsigned long , const node_type& ) { }
        static inline void check_node ( unsigned long , const directed_graph& ) { }
        static inline void check_has_edge ( unsigned long , unsigned long , const directed_graph& ) { }
        static inline void check_add_edge ( unsigned long , unsigned long , const directed_graph& ) { }
        static inline void check_remove_edge ( unsigned long , unsigned long , const directed_graph& ) { }
        static inline void check_remove_node ( unsigned long , const directed_graph& ) { }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E = char,
        typename mem_manager = default_memory_manager,
        bool is_checked = true 
        >
    class directed_graph_kernel_1 : noncopyable
    {

        /*!
            INITIAL VALUE
                - nodes.size() == 0

            CONVENTION
                - nodes.size() == number_of_nodes()
                - for all valid i:
                    - *nodes[i] == node(i)
                    - nodes[i]->parents.size() == nodes[i]->number_of_parents(i)
                    - nodes[i]->children.size() == nodes[i]->number_of_children(i)
                    - nodes[i]->edge_parents.size() == nodes[i]->number_of_parents(i)
                    - nodes[i]->edge_children.size() == nodes[i]->number_of_children(i)
                    - nodes[i]->idx == i == nodes[i]->index()
                    - for all valid p:
                        - nodes[i]->parents[p] == pointer to the p'th parent node of i
                        - *nodes[i]->parents[p] == nodes[i]->parent(p)
                        - *nodes[i]->edge_parents[p] == nodes[i]->parent_edge(p)
                    - for all valid c:
                        - nodes[i]->children[c] == pointer to the c'th child node of i
                        - *nodes[i]->children[c] == nodes[i]->child(c)
                        - *nodes[i]->edge_children[c] == nodes[i]->child_edge(c)
        !*/

    public:
        struct node_type;

    private:
        typedef directed_graph_checker_helper<node_type, directed_graph_kernel_1, is_checked> checker;


    public:

        typedef T type;
        typedef E edge_type;
        typedef mem_manager mem_manager_type;

        template <typename Tr, typename Er, typename MMr>
        struct rebind {
            typedef directed_graph_kernel_1<Tr,Er,MMr> other;
        };

        directed_graph_kernel_1(
        ) {}

        virtual ~directed_graph_kernel_1(
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
            unsigned long parent_node_index,
            unsigned long child_node_index
        ) const;

        void add_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index
        );

        void remove_edge (
            unsigned long parent_node_index,
            unsigned long child_node_index
        );

        unsigned long add_node (
        );

        void remove_node (
            unsigned long index
        );

        void swap (
            directed_graph_kernel_1& item
        ) { nodes.swap(item.nodes); }

    private:


    public:

        struct node_type
        {
            T data;
            typedef directed_graph_kernel_1 graph_type;

            unsigned long index(
            ) const { return idx; }

            unsigned long number_of_parents (
            ) const { return parents.size(); }

            unsigned long number_of_children (
            ) const { return children.size(); }

            const node_type& parent (
                unsigned long edge_index
            ) const { checker::check_parent(edge_index,*this);  return *parents[edge_index]; }

            node_type& parent (
                unsigned long edge_index
            ) { checker::check_parent(edge_index,*this);  return *parents[edge_index]; }

            const node_type& child (
                unsigned long edge_index
            ) const { checker::check_child(edge_index,*this);  return *children[edge_index]; }

            node_type& child (
                unsigned long edge_index
            ) { checker::check_child(edge_index,*this);  return *children[edge_index]; }

            const E& parent_edge (
                unsigned long edge_index
            ) const { checker::check_parent_edge(edge_index,*this);  return *edge_parents[edge_index]; }

            E& parent_edge (
                unsigned long edge_index
            ) { checker::check_parent_edge(edge_index,*this);  return *edge_parents[edge_index]; }

            const E& child_edge (
                unsigned long edge_index
            ) const { checker::check_child_edge(edge_index,*this);  return *edge_children[edge_index]; }

            E& child_edge (
                unsigned long edge_index
            ) { checker::check_child_edge(edge_index,*this);  return *edge_children[edge_index]; }

        private:
            friend class directed_graph_kernel_1;
            typedef std_allocator<node_type*,mem_manager> alloc_type;
            typedef std_allocator<shared_ptr<E>,mem_manager> alloc_edge_type;
            std::vector<node_type*,alloc_type> parents;
            std::vector<node_type*,alloc_type> children;
            std::vector<shared_ptr<E>,alloc_edge_type> edge_parents;
            std::vector<shared_ptr<E>,alloc_edge_type> edge_children;
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
    struct is_directed_graph<directed_graph_kernel_1<T,E,mem_manager, is_checked> >
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
    inline void swap (
        directed_graph_kernel_1<T,E,mem_manager,is_checked>& a, 
        directed_graph_kernel_1<T,E,mem_manager,is_checked>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    void serialize (
        const directed_graph_kernel_1<T,E,mem_manager,is_checked>& item,
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

                // serialize all the child edges
                serialize(item.node(i).number_of_children(), out);
                for (unsigned long c = 0; c < item.node(i).number_of_children(); ++c)
                {
                    serialize(item.node(i).child(c).index(), out);
                    serialize(item.node(i).child_edge(c), out);
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing object of type directed_graph_kernel_1"); 
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
        directed_graph_kernel_1<T,E,mem_manager,is_checked>& item,
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

                unsigned long num_children;
                deserialize(num_children, in);

                // Add all the edges going to this nodes children nodes
                for (unsigned long c = 0; c < num_children; ++c)
                {
                    unsigned long child_index;
                    deserialize(child_index, in);

                    item.add_edge(i, child_index);

                    // find the edge we just added
                    for (unsigned long j = 0; j < item.node(i).number_of_children(); ++j)
                    {
                        if (item.node(i).child(j).index() == child_index)
                        {
                            deserialize(item.node(i).child_edge(j), in);
                            break;
                        }
                    }
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing object of type directed_graph_kernel_1"); 
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
    void directed_graph_kernel_1<T,E,mem_manager,is_checked>::
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
    bool directed_graph_kernel_1<T,E,mem_manager,is_checked>::
    has_edge (
        unsigned long parent_node_index,
        unsigned long child_node_index
    ) const
    {
        checker::check_has_edge(parent_node_index, child_node_index, *this);

        node_type& n = *nodes[parent_node_index];

        // search all the child nodes to see if there is a link to the right node
        for (unsigned long i = 0; i < n.children.size(); ++i)
        {
            if (n.children[i]->idx == child_node_index)
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
    void directed_graph_kernel_1<T,E,mem_manager,is_checked>::
    add_edge (
        unsigned long parent_node_index,
        unsigned long child_node_index
    )
    {
        checker::check_add_edge(parent_node_index, child_node_index, *this);
        try
        {
            node_type& p = *nodes[parent_node_index];
            node_type& c = *nodes[child_node_index];

            p.children.push_back(&c);
            c.parents.push_back(&p);

            p.edge_children.push_back(shared_ptr<E>(new E));
            c.edge_parents.push_back(p.edge_children.back());
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
    void directed_graph_kernel_1<T,E,mem_manager,is_checked>::
    remove_edge (
        unsigned long parent_node_index,
        unsigned long child_node_index
    )
    {
        checker::check_remove_edge(parent_node_index, child_node_index, *this);

        node_type& p = *nodes[parent_node_index];
        node_type& c = *nodes[child_node_index];

        // remove the record of the link from the parent node
        unsigned long pos = static_cast<unsigned long>(find( p.children.begin(),
                                  p.children.end(),
                                  &c) - p.children.begin());
        p.children.erase(p.children.begin()+pos);
        p.edge_children.erase(p.edge_children.begin()+pos);

        // remove the record of the link from the child node
        pos = static_cast<unsigned long>(find( c.parents.begin(),
                  c.parents.end(),
                  &p) - c.parents.begin());
        c.parents.erase(c.parents.begin() + pos);
        c.edge_parents.erase(c.edge_parents.begin() + pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename E,
        typename mem_manager,
        bool is_checked
        >
    unsigned long directed_graph_kernel_1<T,E,mem_manager,is_checked>::
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
    void directed_graph_kernel_1<T,E,mem_manager,is_checked>::
    remove_node (
        unsigned long index
    )
    {
        checker::check_remove_node(index,*this);

        node_type& n = *nodes[index];

        // remove all edges pointing to this node from its parents 
        for (unsigned long i = 0; i < n.parents.size(); ++i)
        {
            // remove the edge from this specific parent
            unsigned long pos = static_cast<unsigned long>(find(n.parents[i]->children.begin(), 
                     n.parents[i]->children.end(), 
                     &n) - n.parents[i]->children.begin());

            n.parents[i]->children.erase(n.parents[i]->children.begin() + pos);
            n.parents[i]->edge_children.erase(n.parents[i]->edge_children.begin() + pos);
        }

        // remove all edges pointing to this node from its children 
        for (unsigned long i = 0; i < n.children.size(); ++i)
        {
            // remove the edge from this specific child 
            unsigned long pos = static_cast<unsigned long>(find(n.children[i]->parents.begin(),
                     n.children[i]->parents.end(),
                     &n) - n.children[i]->parents.begin());

            n.children[i]->parents.erase(n.children[i]->parents.begin() + pos);
            n.children[i]->edge_parents.erase(n.children[i]->edge_parents.begin() + pos);
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

#endif // DLIB_DIRECTED_GRAPH_KERNEl_1_

