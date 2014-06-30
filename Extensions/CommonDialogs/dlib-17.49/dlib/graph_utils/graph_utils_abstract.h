// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_GRAPH_UTILs_ABSTRACT_
#ifdef DLIB_GRAPH_UTILs_ABSTRACT_

#include "../directed_graph.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::edge_type& edge(
        T& g,  
        unsigned long i, 
        unsigned long j
    );
    /*!
        requires
            - T is an implementation of graph/graph_kernel_abstract.h 
            - g.has_edge(i,j)
        ensures
            - returns a reference to the edge data for the edge connecting nodes i and j
              (i.e. returns g.node(i).edge(x) such that g.node(i).neighbor(x).index() == j)
    !*/

    template <
        typename T
        >
    typename const T::edge_type& edge(
        const T& g,  
        unsigned long i, 
        unsigned long j
    );
    /*!
        requires
            - T is an implementation of graph/graph_kernel_abstract.h 
            - g.has_edge(i,j)
        ensures
            - returns a const reference to the edge data for the edge connecting nodes i and j
              (i.e. returns g.node(i).edge(x) such that g.node(i).neighbor(x).index() == j)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::edge_type& edge(
        T& g,  
        unsigned long parent_idx, 
        unsigned long child_idx 
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h 
            - g.has_edge(parent_idx,child_idx)
        ensures
            - returns a reference to the edge data for the directed edge connecting parent
              node g.node(parent_idx) to child node g.node(child_idx).
    !*/

    template <
        typename T
        >
    typename const T::edge_type& edge(
        const T& g,  
        unsigned long parent_idx, 
        unsigned long child_idx 
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h 
            - g.has_edge(parent_idx,child_idx)
        ensures
            - returns a const reference to the edge data for the directed edge connecting 
              parent node g.node(parent_idx) to child node g.node(child_idx).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_has_symmetric_edges (
        const T& graph
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h 
        ensures
            - if (All nodes have either 0 edges between them or 2 edges between them.  
              That is, if there is an edge pointing from node A to node B then there is
              also an edge from B to A) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_contains_directed_cycle (
        const T& graph
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h 
        ensures
            - if (there is a directed cycle in the given graph) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_contains_undirected_cycle (
        const T& graph
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              T is an implementation of graph/graph_kernel_abstract.h
        ensures
            - if (there is an undirected cycle in the given graph) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_contains_length_one_cycle (
        const T& graph
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              T is an implementation of graph/graph_kernel_abstract.h
        ensures
            - if (it is the case that graph.has_edge(i,i) == true for some i) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename src_type,
        typename dest_type 
        >
    void copy_graph_structure (
        const src_type& src,
        dest_type& dest
    );
    /*!
        requires
            - src_type is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              src_type is an implementation of graph/graph_kernel_abstract.h
            - dest_type is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              dest_type is an implementation of graph/graph_kernel_abstract.h
            - dest_type is not a directed_graph when src_type is a graph
        ensures
            - this function copies the graph structure from src into dest
            - #dest.number_of_nodes() == src.number_of_nodes()
            - for all valid i: #dest.node(i).item has an initial value for its type
            - for all valid i and j:
                - if (src.has_edge(i,j) == true) then
                    - #dest.has_edge(i,j) == true
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename src_type,
        typename dest_type 
        >
    void copy_graph (
        const src_type& src,
        dest_type& dest
    );
    /*!
        requires
            - src_type is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              src_type is an implementation of graph/graph_kernel_abstract.h
            - dest_type is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              dest_type is an implementation of graph/graph_kernel_abstract.h
            - src_type and dest_type are both the same kind of graph.  That is, they
              are either both directed or both undirected.
            - the node and edge data in the graphs are copyable via operator=().
        ensures
            - #dest is a complete duplicate of src.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename directed_graph_type,
        typename graph_type
        >
    void create_moral_graph (
        const directed_graph_type& g,
        graph_type& moral_graph
    );
    /*!
        requires
            - directed_graph_type is an implementation of directed_graph/directed_graph_kernel_abstract.h
            - graph_type is an implementation of graph/graph_kernel_abstract.h
            - graph_contains_directed_cycle(g) == false
        ensures
            - #moral_graph == the moralized version of the directed graph g
            - #moral_graph.number_of_nodes() == g.number_of_nodes()
            - for all valid i and j:
                - if (g.has_edge(i,j) == true) then
                    - #moral_graph.has_edge(i,j) == true
                      (i.e. all the edges that are in g are also in moral_graph)
            - for all valid i:
                - for all pairs p1 and p2 such that p1 != p2 and g.node(p1) and g.node(p2) are both
                  parents of node g.node(i):
                    - #moral_graph.has_edge(p1,p2) == true
                      (i.e. all the parents of a node are connected in the moral graph)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename S
        >
    void find_connected_nodes (
        const T& n,
        S& visited
    );
    /*!
        requires
            - T is a node_type from an implementation of directed_graph/directed_graph_kernel_abstract.h or
              T is a node_type from an implementation of graph/graph_kernel_abstract.h
            - S is an implementation of set/set_kernel_abstract.h
        ensures
            - let G be the graph that contains node n
            - #visited.is_member(n.index()) == true
            - for all i such that there is an undirected path from n to G.node(i):
                - #visited.is_member(i) == true
            - for all i such that visited.is_member(i):
                - #visited.is_member(i) == true
                  (i.e. this function doesn't remove anything from visited.  So if
                  it contains stuff when you call this function then it will still
                  contain those things once the function ends)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    bool graph_is_connected (
        const T& g
    );
    /*!
        requires
            - T is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              T is an implementation of graph/graph_kernel_abstract.h
        ensures
            - every node in g has an undirected path to every other node in g.  
              I.e. g is a connected graph
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename sets_of_int
        >
    bool is_clique (
        const graph_type& g,
        const sets_of_int& clique
    );
    /*!
        requires
            - graph_type is an implementation of graph/graph_kernel_abstract.h
            - sets_of_int is an implementation of set/set_kernel_abstract.h
              and it contains unsigned long objects. 
            - graph_contains_length_one_cycle(g) == false
            - for all x such that clique.is_member(x):
                - x < g.number_of_nodes()
        ensures
            - if (it is true that for all i and j such that clique.is_member(i) and 
              clique.is_member(j) then g.has_edge(i,j) == true) then
                - returns true
            - else
                - returns false
            - if (clique.size() == 0) then
                - returns true
                  (this is just a special case of the above condition)
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename sets_of_int
        >
    bool is_maximal_clique (
        const graph_type& g,
        const sets_of_int& clique
    );
    /*!
        requires
            - graph_type is an implementation of graph/graph_kernel_abstract.h
            - sets_of_int is an implementation of set/set_kernel_abstract.h
              and it contains unsigned long objects. 
            - graph_contains_length_one_cycle(g) == false
            - for all x such that clique.is_member(x):
                - x < g.number_of_nodes()
            - is_clique(g,clique) == true
        ensures
            - if (there is no x such that clique.is_member(x) == false 
              and g.has_edge(i,x) for all i such that cliques.is_member(i)) then
                - returns true
            - else
                - returns false
            - if (clique.size() == 0) then
                - returns true
                  (this is just a special case of the above condition)
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename set_of_sets_of_int
        >
    void triangulate_graph_and_find_cliques (
        graph_type& g,
        set_of_sets_of_int& cliques
    );
    /*!
        requires
            - graph_type is an implementation of graph/graph_kernel_abstract.h
            - set_of_sets_of_int is an implementation of set/set_kernel_abstract.h
              and it contains another set object which is comparable by operator< and
              itself contains unsigned long objects.  
              (e.g. set<set<unsigned long>::compare_1a>::kernel_1a)
            - graph_contains_length_one_cycle(g) == false
            - graph_is_connected(g) == true
        ensures
            - #g.number_of_nodes() == g.number_of_nodes()
            - all this function does to g is add edges to it until g becomes a 
              chordal graph where a chordal graph is a graph where each cycle
              in the graph of 4 or more nodes has an edge joining two nodes
              that are not adjacent in the cycle. 
            - #cliques.size() == the number of maximal cliques in the graph #g
            - for all valid sets S such that #cliques.is_member(S):
                - for all valid integers i and j such that S.is_member(i) == true
                  and S.is_member(j) == true and i != j:
                    - #g.has_edge(i,j) == true
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename join_tree_type
        >
    bool is_join_tree (
        const graph_type& g,
        const join_tree_type& join_tree
    );
    /*!
        requires
            - graph_type is an implementation of directed_graph/directed_graph_kernel_abstract.h or
              graph_type is an implementation of graph/graph_kernel_abstract.h
            - join_tree_type is an implementation of graph/graph_kernel_abstract.h
            - join_tree_type::type is an implementation of set/set_compare_abstract.h and
              this set type contains unsigned long objects. 
            - join_tree_type::edge_type is an implementation of set/set_compare_abstract.h and
              this set type contains unsigned long objects. 
            - graph_contains_length_one_cycle(g) == false
            - graph_is_connected(g) == true
        ensures
            - if (join_tree is a valid join tree of graph g.  That is, join_tree is a 
              tree decomposition of g) then
                - returns true
            - else
                - returns false

            - a join tree of graph g is defined as follows: 
                - graph_contains_undirected_cycle(join_tree) == false
                - graph_is_connected(join_tree) == true
                - for all valid i:
                    - join_tree.node(i).item == a non-empty set containing node indexes 
                      from g.  That is, this set contains all the nodes from g that are
                      in this cluster in the join tree
                - for all valid i and j such that i and j are both < join_tree.number_of_nodes()
                    - let X be the set of numbers that is contained in both join_tree.node(i).item
                      and join_tree.node(j).item
                    - It is the case that all nodes on the unique path between join_tree.node(i)
                      and join_tree.node(j) contain the numbers from X in their sets.
                    - edge(join_tree,i,j) == a set containing the intersection of 
                      join_tree.node(i).item and join_tree.node(j).item
                - the node index for every node in g appears in some node in join_tree at 
                  least once.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename join_tree_type
        >
    void create_join_tree (
        const graph_type& g,
        join_tree_type& join_tree
    );
    /*!
        requires
            - graph_type is an implementation of graph/graph_kernel_abstract.h
            - join_tree_type is an implementation of graph/graph_kernel_abstract.h
            - join_tree_type::type is an implementation of set/set_compare_abstract.h and
              this set type contains unsigned long objects. 
            - join_tree_type::edge_type is an implementation of set/set_compare_abstract.h and
              this set type contains unsigned long objects. 
            - graph_contains_length_one_cycle(g) == false
            - graph_is_connected(g) == true
        ensures
            - #is_join_tree(g, join_tree) == true
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GRAPH_UTILs_ABSTRACT_

