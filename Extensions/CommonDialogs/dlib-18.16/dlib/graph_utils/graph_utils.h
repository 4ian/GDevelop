// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GRAPH_UTILs_
#define DLIB_GRAPH_UTILs_

#include "../algs.h"
#include <vector>
#include "graph_utils_abstract.h"
#include "../is_kind.h"
#include "../enable_if.h"
#include <algorithm>
#include "../set.h"
#include "../memory_manager.h"
#include "../set_utils.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename T>
    typename enable_if<is_graph<T>,typename T::edge_type>::type& edge(
        T& g, 
        unsigned long idx_i, 
        unsigned long idx_j
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(g.has_edge(idx_i,idx_j) == true,
            "\tT::edge_type& edge(g, idx_i, idx_j)"
            << "\n\t you have requested an invalid edge"
            << "\n\t idx_i: " << idx_i
            << "\n\t idx_j: " << idx_j 
            );

        for (unsigned long i = 0; i < g.node(idx_i).number_of_neighbors(); ++i)
        {
            if (g.node(idx_i).neighbor(i).index() == idx_j)
                return g.node(idx_i).edge(i);
        }

        // put this here just so compilers don't complain about a lack of
        // a return here
        DLIB_CASSERT(false,
            "\tT::edge_type& edge(g, idx_i, idx_j)"
            << "\n\t you have requested an invalid edge"
            << "\n\t idx_i: " << idx_i
            << "\n\t idx_j: " << idx_j 
            );
    }

    template <typename T>
    const typename enable_if<is_graph<T>,typename T::edge_type>::type& edge(
        const T& g,  
        unsigned long idx_i,
        unsigned long idx_j
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(g.has_edge(idx_i,idx_j) == true,
            "\tT::edge_type& edge(g, idx_i, idx_j)"
            << "\n\t you have requested an invalid edge"
            << "\n\t idx_i: " << idx_i
            << "\n\t idx_j: " << idx_j 
            );

        for (unsigned long i = 0; i < g.node(idx_i).number_of_neighbors(); ++i)
        {
            if (g.node(idx_i).neighbor(i).index() == idx_j)
                return g.node(idx_i).edge(i);
        }

        // put this here just so compilers don't complain about a lack of
        // a return here
        DLIB_CASSERT(false,
            "\tT::edge_type& edge(g, idx_i, idx_j)"
            << "\n\t you have requested an invalid edge"
            << "\n\t idx_i: " << idx_i
            << "\n\t idx_j: " << idx_j 
            );
    }

// ----------------------------------------------------------------------------------------
    
    template <typename T>
    typename enable_if<is_directed_graph<T>,typename T::edge_type>::type& edge(
        T& g, 
        unsigned long parent_idx, 
        unsigned long child_idx 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(g.has_edge(parent_idx,child_idx) == true,
            "\t T::edge_type& edge(g, parent_idx, child_idx)"
            << "\n\t you have requested an invalid edge"
            << "\n\t parent_idx: " << parent_idx
            << "\n\t child_idx: " << child_idx 
            );

        for (unsigned long i = 0; i < g.node(parent_idx).number_of_children(); ++i)
        {
            if (g.node(parent_idx).child(i).index() == child_idx)
                return g.node(parent_idx).child_edge(i);
        }

        // put this here just so compilers don't complain about a lack of
        // a return here
        DLIB_CASSERT(false,
            "\t T::edge_type& edge(g, parent_idx, child_idx)"
            << "\n\t you have requested an invalid edge"
            << "\n\t parent_idx: " << parent_idx
            << "\n\t child_idx: " << child_idx 
            );
    }

    template <typename T>
    const typename enable_if<is_directed_graph<T>,typename T::edge_type>::type& edge(
        const T& g,  
        unsigned long parent_idx, 
        unsigned long child_idx 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(g.has_edge(parent_idx,child_idx) == true,
            "\t T::edge_type& edge(g, parent_idx, child_idx)"
            << "\n\t you have requested an invalid edge"
            << "\n\t parent_idx: " << parent_idx
            << "\n\t child_idx: " << child_idx 
            );

        for (unsigned long i = 0; i < g.node(parent_idx).number_of_children(); ++i)
        {
            if (g.node(parent_idx).child(i).index() == child_idx)
                return g.node(parent_idx).child_edge(i);
        }

        // put this here just so compilers don't complain about a lack of
        // a return here
        DLIB_ASSERT(false,
            "\t T::edge_type& edge(g, parent_idx, child_idx)"
            << "\n\t you have requested an invalid edge"
            << "\n\t parent_idx: " << parent_idx
            << "\n\t child_idx: " << child_idx 
            );
    }

// ----------------------------------------------------------------------------------------
    
    namespace graph_helpers 
    {
        template <typename T, typename U>
        inline bool is_same_object (
            const T& a,
            const U& b
        )
        {
            if (is_same_type<const T,const U>::value == false)
                return false;
            if ((void*)&a == (void*)&b)
                return true;
            else
                return false;
        }

        template <
            typename T
            >
        bool search_for_directed_cycles (
            const T& node,
            std::vector<bool>& visited,
            std::vector<bool>& temp
        )
        /*!
            requires
                - visited.size() >= number of nodes in the graph that contains the given node 
                - temp.size() >= number of nodes in the graph that contains the given node 
                - for all i in temp: 
                    - temp[i] == false
            ensures
                - checks the connected subgraph containing the given node for directed cycles
                  and returns true if any are found and false otherwise.
                - for all nodes N in the connected subgraph containing the given node:
                    - #visited[N.index()] == true
                - for all i in temp: 
                    - #temp[i] == false
        !*/
        {
            if (temp[node.index()] == true)
                return true;

            visited[node.index()] = true;
            temp[node.index()] = true;

            for (unsigned long i = 0; i < node.number_of_children(); ++i)
            {
                if (search_for_directed_cycles(node.child(i), visited, temp))
                    return true;
            }
                
            temp[node.index()] = false;

            return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        typename enable_if<is_directed_graph<typename T::graph_type>,bool>::type search_for_undirected_cycles (
            const T& node,
            std::vector<bool>& visited,
            unsigned long prev = std::numeric_limits<unsigned long>::max()
        )
        /*!
            requires
                - visited.size() >= number of nodes in the graph that contains the given node 
                - for all nodes N in the connected subgraph containing the given node:
                    - visited[N.index] == false
            ensures
                - checks the connected subgraph containing the given node for directed cycles
                  and returns true if any are found and false otherwise.
                - for all nodes N in the connected subgraph containing the given node:
                    - #visited[N.index()] == true
        !*/
        {
            using namespace std;
            if (visited[node.index()] == true)
                return true;

            visited[node.index()] = true;

            for (unsigned long i = 0; i < node.number_of_children(); ++i)
            {
                if (node.child(i).index() != prev && 
                    search_for_undirected_cycles(node.child(i), visited, node.index()))
                    return true;
            }
                
            for (unsigned long i = 0; i < node.number_of_parents(); ++i)
            {
                if (node.parent(i).index() != prev && 
                    search_for_undirected_cycles(node.parent(i), visited, node.index()))
                    return true;
            }

            return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        typename enable_if<is_graph<typename T::graph_type>,bool>::type search_for_undirected_cycles (
            const T& node,
            std::vector<bool>& visited,
            unsigned long prev = std::numeric_limits<unsigned long>::max()
        )
        /*!
            requires
                - visited.size() >= number of nodes in the graph that contains the given node 
                - for all nodes N in the connected subgraph containing the given node:
                    - visited[N.index] == false
            ensures
                - checks the connected subgraph containing the given node for directed cycles
                  and returns true if any are found and false otherwise.
                - for all nodes N in the connected subgraph containing the given node:
                    - #visited[N.index()] == true
        !*/
        {
            using namespace std;
            if (visited[node.index()] == true)
                return true;

            visited[node.index()] = true;

            for (unsigned long i = 0; i < node.number_of_neighbors(); ++i)
            {
                if (node.neighbor(i).index() != prev && 
                    search_for_undirected_cycles(node.neighbor(i), visited, node.index()))
                    return true;
            }
                
            return false;
        }

    }

// ------------------------------------------------------------------------------------

    template <
        typename graph_type1,
        typename graph_type2
        >
    typename enable_if<is_graph<graph_type1> >::type copy_graph_structure (
        const graph_type1& src,
        graph_type2& dest
    )
    {
        COMPILE_TIME_ASSERT(is_graph<graph_type1>::value);
        COMPILE_TIME_ASSERT(is_graph<graph_type2>::value);
        if (graph_helpers::is_same_object(src,dest))
            return;

        dest.clear();
        dest.set_number_of_nodes(src.number_of_nodes());

        // copy all the edges from src into dest 
        for (unsigned long i = 0; i < src.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < src.node(i).number_of_neighbors(); ++j)
            {
                const unsigned long nidx = src.node(i).neighbor(j).index();
                if (nidx >= i)
                {
                    dest.add_edge(i,nidx);
                }
            }
        }
    }

    template <
        typename graph_type1,
        typename graph_type2
        >
    typename enable_if<is_directed_graph<graph_type1> >::type copy_graph_structure (
        const graph_type1& src,
        graph_type2& dest
    )
    {
        COMPILE_TIME_ASSERT(is_directed_graph<graph_type1>::value);
        COMPILE_TIME_ASSERT(is_directed_graph<graph_type2>::value || is_graph<graph_type2>::value );
        if (graph_helpers::is_same_object(src,dest))
            return;

        dest.clear();
        dest.set_number_of_nodes(src.number_of_nodes());

        // copy all the edges from src into dest 
        for (unsigned long i = 0; i < src.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < src.node(i).number_of_children(); ++j)
            {
                const unsigned long nidx = src.node(i).child(j).index();
                if (dest.has_edge(i,nidx) == false)
                {
                    dest.add_edge(i,nidx);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type1,
        typename graph_type2
        >
    typename enable_if<is_graph<graph_type1> >::type copy_graph (
        const graph_type1& src,
        graph_type2& dest
    )
    {
        COMPILE_TIME_ASSERT(is_graph<graph_type1>::value);
        COMPILE_TIME_ASSERT(is_graph<graph_type2>::value);
        if (graph_helpers::is_same_object(src,dest))
            return;

        copy_graph_structure(src,dest);

        // copy all the node and edge content 
        for (unsigned long i = 0; i < src.number_of_nodes(); ++i)
        {
            dest.node(i).data = src.node(i).data;

            for (unsigned long j = 0; j < src.node(i).number_of_neighbors(); ++j)
            {
                const unsigned long nidx = src.node(i).neighbor(j).index();
                if (nidx >= i)
                {
                    dest.node(i).edge(j) = src.node(i).edge(j);
                }
            }
        }
    }

    template <
        typename graph_type1,
        typename graph_type2
        >
    typename enable_if<is_directed_graph<graph_type1> >::type copy_graph (
        const graph_type1& src,
        graph_type2& dest
    )
    {
        COMPILE_TIME_ASSERT(is_directed_graph<graph_type1>::value);
        COMPILE_TIME_ASSERT(is_directed_graph<graph_type2>::value);
        if (graph_helpers::is_same_object(src,dest))
            return;

        copy_graph_structure(src,dest);

        // copy all the node and edge content 
        for (unsigned long i = 0; i < src.number_of_nodes(); ++i)
        {
            dest.node(i).data = src.node(i).data;
            for (unsigned long j = 0; j < src.node(i).number_of_children(); ++j)
            {
                dest.node(i).child_edge(j) = src.node(i).child_edge(j);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename S
        >
    typename enable_if<is_graph<typename T::graph_type> >::type find_connected_nodes (
    const T& n,
    S& visited
    )
    {
        if (visited.is_member(n.index()) == false)
        {
            unsigned long temp = n.index();
            visited.add(temp);

            for (unsigned long i = 0; i < n.number_of_neighbors(); ++i)
                find_connected_nodes(n.neighbor(i), visited);
        }
    }

    template <
        typename T,
        typename S
        >
    typename enable_if<is_directed_graph<typename T::graph_type> >::type find_connected_nodes (
    const T& n,
    S& visited
    )
    {
        if (visited.is_member(n.index()) == false)
        {
            unsigned long temp = n.index();
            visited.add(temp);

            for (unsigned long i = 0; i < n.number_of_parents(); ++i)
                find_connected_nodes(n.parent(i), visited);
            for (unsigned long i = 0; i < n.number_of_children(); ++i)
                find_connected_nodes(n.child(i), visited);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    bool graph_is_connected (
        const T& g
    )
    {
        if (g.number_of_nodes() == 0)
            return true;

        set<unsigned long>::kernel_1b_c visited;
        find_connected_nodes(g.node(0), visited);
        return (visited.size() == g.number_of_nodes());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_has_symmetric_edges (
        const T& graph
    )
    {
        for (unsigned long i = 0; i < graph.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < graph.node(i).number_of_children(); ++j)
            {
                const unsigned long jj = graph.node(i).child(j).index();
                // make sure every edge from a parent to a child has an edge linking back
                if (graph.has_edge(jj,i) == false)
                    return false;
            }

            for (unsigned long j = 0; j < graph.node(i).number_of_parents(); ++j)
            {
                const unsigned long jj = graph.node(i).parent(j).index();
                // make sure every edge from a child to a parent has an edge linking back
                if (graph.has_edge(i,jj) == false)
                    return false;
            }
        }

        return true;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename T
        >
    bool graph_contains_directed_cycle (
        const T& graph
    )
    {
        using namespace std;
        using namespace graph_helpers;
        std::vector<bool> visited(graph.number_of_nodes(), false);
        std::vector<bool> temp(graph.number_of_nodes(), false);

        while (true)
        {
            // find the first node that hasn't been visited yet
            unsigned long i;
            for (i = 0; i < visited.size(); ++i)
            {
                if (visited[i] == false)
                    break;
            }

            // if we didn't find any non-visited nodes then we are done
            if (i == visited.size())
                return false;

            if (search_for_directed_cycles(graph.node(i), visited, temp))
                return true;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool graph_contains_undirected_cycle (
        const T& graph
    )
    {
        using namespace std;
        using namespace graph_helpers;
        std::vector<bool> visited(graph.number_of_nodes(), false);

        while (true)
        {
            // find the first node that hasn't been visited yet
            unsigned long i;
            for (i = 0; i < visited.size(); ++i)
            {
                if (visited[i] == false)
                    break;
            }

            // if we didn't find any non-visited nodes then we are done
            if (i == visited.size())
                return false;

            if (search_for_undirected_cycles(graph.node(i), visited))
                return true;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename directed_graph_type,
        typename graph_type
        >
    void create_moral_graph (
        const directed_graph_type& g,
        graph_type& moral_graph
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_directed_cycle(g) == false,
            "\tvoid create_moral_graph(g, moral_graph)"
            << "\n\tYou can only make moral graphs if g doesn't have directed cycles"
            );
        COMPILE_TIME_ASSERT(is_graph<graph_type>::value);
        COMPILE_TIME_ASSERT(is_directed_graph<directed_graph_type>::value);

        copy_graph_structure(g, moral_graph);

        // now marry all the parents (i.e. add edges between parent nodes)
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            // loop over all combinations of parents of g.node(i)
            for (unsigned long j = 0; j < g.node(i).number_of_parents(); ++j)
            {
                for (unsigned long k = 0; k < g.node(i).number_of_parents(); ++k)
                {
                    const unsigned long p1 = g.node(i).parent(j).index();
                    const unsigned long p2 = g.node(i).parent(k).index();
                    if (p1 == p2)
                        continue;

                    if (moral_graph.has_edge(p1,p2) == false)
                        moral_graph.add_edge(p1,p2);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename sets_of_int
        >
    bool is_clique (
        const graph_type& g,
        const sets_of_int& clique
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
            "\tvoid is_clique(g, clique)"
            << "\n\tinvalid graph"
            );
#ifdef ENABLE_ASSERTS
        clique.reset();
        while (clique.move_next())
        {
            const unsigned long x = clique.element();
            DLIB_ASSERT( x < g.number_of_nodes(), 
                "\tvoid is_clique(g, clique)"
                << "\n\tthe clique set contained an invalid node index"
                << "\n\tx:                   " << x 
                << "\n\tg.number_of_nodes(): " << g.number_of_nodes()
                );
        }
#endif

        COMPILE_TIME_ASSERT(is_graph<graph_type>::value);

        std::vector<unsigned long> v;
        v.reserve(clique.size());
        clique.reset();
        while (clique.move_next())
        {
            v.push_back(clique.element());
        }

        for (unsigned long i = 0; i < v.size(); ++i)
        {
            for (unsigned long j = 0; j < v.size(); ++j)
            {
                if (v[i] == v[j])
                    continue;
                if (g.has_edge(v[i], v[j]) == false)
                    return false;
            }
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename sets_of_int
        >
    bool is_maximal_clique (
        const graph_type& g,
        const sets_of_int& clique
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
            "\tvoid is_maximal_clique(g, clique)"
            << "\n\tinvalid graph"
            );
        DLIB_ASSERT(is_clique(g,clique) == true,
            "\tvoid is_maximal_clique(g, clique)"
            << "\n\tinvalid graph"
            );
#ifdef ENABLE_ASSERTS
        clique.reset();
        while (clique.move_next())
        {
            const unsigned long x = clique.element();
            DLIB_ASSERT( x < g.number_of_nodes(), 
                "\tvoid is_maximal_clique(g, clique)"
                << "\n\tthe clique set contained an invalid node index"
                << "\n\tx:                   " << x 
                << "\n\tg.number_of_nodes(): " << g.number_of_nodes()
                );
        }
#endif

        COMPILE_TIME_ASSERT(is_graph<graph_type>::value);

        if (clique.size() == 0)
            return true;

        // get an element in the clique and make sure that
        // none of its neighbors that aren't in the clique are connected 
        // to all the elements of the clique.
        clique.reset();
        clique.move_next();
        const unsigned long idx = clique.element();

        for (unsigned long i = 0; i < g.node(idx).number_of_neighbors(); ++i)
        {
            const unsigned long n = g.node(idx).neighbor(i).index();
            if (clique.is_member(n))
                continue;

            // now loop over all the clique members and make sure they don't all
            // share an edge with node n
            bool all_share_edge = true;
            clique.reset();
            while (clique.move_next())
            {
                if (g.has_edge(clique.element(), n) == false)
                {
                    all_share_edge = false;
                    break;
                }
            }

            if (all_share_edge == true)
                return false;
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename enable_if<is_directed_graph<T>,bool>::type graph_contains_length_one_cycle (
        const T& graph
    )
    {
        for (unsigned long i = 0; i < graph.number_of_nodes(); ++i)
        {
            // make sure none of this guys children are actually itself
            for (unsigned long n = 0; n < graph.node(i).number_of_children(); ++n)
            {
                if (graph.node(i).child(n).index() == i)
                    return true;
            }
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename enable_if<is_graph<T>,bool>::type graph_contains_length_one_cycle (
        const T& graph
    )
    {
        for (unsigned long i = 0; i < graph.number_of_nodes(); ++i)
        {
            // make sure none of this guys neighbors are actually itself
            for (unsigned long n = 0; n < graph.node(i).number_of_neighbors(); ++n)
            {
                if (graph.node(i).neighbor(n).index() == i)
                    return true;
            }
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    namespace graph_helpers
    {
        struct pair
        {
            unsigned long index;
            unsigned long num_neighbors;

            bool operator< (const pair& p) const { return num_neighbors < p.num_neighbors; }
        };

        template <
            typename T,
            typename S,
            typename V
            >
        void search_graph_for_triangulate (
            const T& n,
            S& visited,
            V& order_visited
        )
        {
            // base case of recursion.  stop when we hit a node we have
            // already visited.
            if (visited.is_member(n.index()))
                return;

            // record that we have visited this node
            order_visited.push_back(n.index());
            unsigned long temp = n.index();
            visited.add(temp);

            // we want to visit all the neighbors of this node but do
            // so by visiting the nodes with the most neighbors first.  So
            // lets make a vector that lists the nodes in the order we 
            // want to visit them
            std::vector<pair> neighbors;
            for (unsigned long i = 0; i < n.number_of_neighbors(); ++i)
            {
                pair p;
                p.index = i;
                p.num_neighbors = n.neighbor(i).number_of_neighbors();
                neighbors.push_back(p);
            }

            // now sort the neighbors array so that the neighbors with the
            // most neighbors come first.
            std::sort(neighbors.rbegin(), neighbors.rend());

            // now visit all the nodes
            for (unsigned long i = 0; i < neighbors.size(); ++i)
            {
                search_graph_for_triangulate(n.neighbor(neighbors[i].index), visited, order_visited);
            }
        }
    } // end namespace graph_helpers

    template <
        typename graph_type,
        typename set_of_sets_of_int
        >
    void triangulate_graph_and_find_cliques (
        graph_type& g,
        set_of_sets_of_int& cliques
    )
    {

        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
            "\tvoid triangulate_graph_and_find_cliques(g, cliques)"
            << "\n\tInvalid graph"
            );
        DLIB_ASSERT(graph_is_connected(g) == true,
            "\tvoid triangulate_graph_and_find_cliques(g, cliques)"
            << "\n\tInvalid graph"
            );

        COMPILE_TIME_ASSERT(is_graph<graph_type>::value);


        using namespace graph_helpers;
        using namespace std;
        typedef typename set_of_sets_of_int::type set_of_int;

        cliques.clear();

        // first we find the node with the most neighbors
        unsigned long max_index = 0;
        unsigned long num_neighbors = 0;
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            if (g.node(i).number_of_neighbors() > num_neighbors)
            {
                max_index = i;
                num_neighbors = g.node(i).number_of_neighbors();
            }
        }

        // now we do a depth first search of the entire graph starting
        // with the node we just found.  We record the order in which
        // we visit each node in the vector order_visited.
        std::vector<unsigned long> order_visited;
        set_of_int visited;
        search_graph_for_triangulate(g.node(max_index), visited, order_visited);

        set_of_int clique;

        // now add edges to the graph to make it triangulated  
        while (visited.size() > 0)
        {
            // we are going to enumerate over the nodes in the reverse of the
            // order in which they were visited.  So get the last node out.
            const unsigned long idx = order_visited.back();
            order_visited.pop_back();
            visited.destroy(idx);

            // as a start add this node to our current clique
            unsigned long temp = idx;
            clique.clear();
            clique.add(temp);

            // now we want to make a clique that contains node g.node(idx) and
            // all of its neighbors that are still recorded in the visited set 
            // (except for neighbors that have only one edge).
            for (unsigned long i = 0; i < g.node(idx).number_of_neighbors(); ++i)
            {
                // get the index of the i'th neighbor
                unsigned long nidx = g.node(idx).neighbor(i).index();

                // add it to the clique if it is still in visited and it isn't
                // a node with only one neighbor
                if (visited.is_member(nidx) == true && 
                    g.node(nidx).number_of_neighbors() != 1)
                {
                    // add edges between this new node and all the nodes 
                    // that are already in the clique
                    clique.reset();
                    while (clique.move_next())
                    {
                        if (g.has_edge(nidx, clique.element()) == false)
                            g.add_edge(nidx, clique.element());
                    }

                    // now also record that we added this node to the clique
                    clique.add(nidx);
                }
            }

            if (cliques.is_member(clique) == false && is_maximal_clique(g,clique) )
            {
                cliques.add(clique);
            }

            // now it is possible that we are missing some cliques of size 2 since
            // above we didn't add nodes with only one edge to any of our cliques.
            // Now lets make sure all these nodes are accounted for
            for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
            {
                clique.clear();
                if (g.node(i).number_of_neighbors() == 1)
                {
                    unsigned long temp = i;
                    clique.add(temp);
                    temp = g.node(i).neighbor(0).index();
                    clique.add(temp);

                    if (cliques.is_member(clique) == false)
                        cliques.add(clique);
                }
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type,
        typename join_tree_type
        >
    void create_join_tree (
        const graph_type& g,
        join_tree_type& join_tree
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
            "\tvoid create_join_tree(g, join_tree)"
            << "\n\tInvalid graph"
            );
        DLIB_ASSERT(graph_is_connected(g) == true,
            "\tvoid create_join_tree(g, join_tree)"
            << "\n\tInvalid graph"
            );

        COMPILE_TIME_ASSERT(is_graph<graph_type>::value);
        COMPILE_TIME_ASSERT(is_graph<join_tree_type>::value);



        typedef typename join_tree_type::type set_of_int;
        typedef typename join_tree_type::edge_type set_of_int_edge;
        typedef typename set<set_of_int>::kernel_1b_c set_of_sets_of_int;

        copy_graph_structure(g, join_tree);

        // don't even bother in this case
        if (g.number_of_nodes() == 0)
            return;

        set_of_sets_of_int cliques;
        set_of_int s;

        triangulate_graph_and_find_cliques(join_tree, cliques);

        join_tree.set_number_of_nodes(cliques.size());

        // copy the cliques into each of the nodes of tree
        for (unsigned long i = 0; i < join_tree.number_of_nodes(); ++i)
        {
            cliques.remove_any(s);
            s.swap(join_tree.node(i).data);
        }

        set_of_int_edge e;

        // add all possible edges to the join_tree
        for (unsigned long i = 0; i < join_tree.number_of_nodes(); ++i)
        {
            for (unsigned long j = i+1; j < join_tree.number_of_nodes(); ++j)
            {
                set_intersection(
                    join_tree.node(i).data,
                    join_tree.node(j).data,
                    e);

                if (e.size() > 0)
                {
                    join_tree.add_edge(i,j);
                    edge(join_tree,i,j).swap(e);
                }
            }
        }

        // now we just need to remove the unnecessary edges so that we get a 
        // proper join tree
        s.clear();
        set_of_int& good = s; // rename s to something slightly more meaningful
        // good will contain nodes that have been "approved"
        unsigned long n = 0;
        good.add(n);

        std::vector<unsigned long> vtemp;

        while (good.size() < join_tree.number_of_nodes())
        {
            // figure out which of the neighbors of nodes in good has the best edge
            unsigned long best_bad_idx = 0;
            unsigned long best_good_idx = 0;
            unsigned long best_overlap = 0;
            good.reset();
            while (good.move_next())
            {
                // loop over all the neighbors of the current node in good
                for (unsigned long i = 0; i < join_tree.node(good.element()).number_of_neighbors(); ++i)
                {
                    const unsigned long idx = join_tree.node(good.element()).neighbor(i).index();
                    if (!good.is_member(idx))
                    {
                        const unsigned long overlap = join_tree.node(good.element()).edge(i).size();

                        if (overlap > best_overlap)
                        {
                            best_overlap = overlap;
                            best_bad_idx = idx;
                            best_good_idx = good.element();
                        }
                    }
                }
            }

            // now remove all the edges from best_bad_idx to the nodes in good except for the
            // edge to best_good_idx.
            for (unsigned long i = 0; i < join_tree.node(best_bad_idx).number_of_neighbors(); ++i)
            {
                const unsigned long idx = join_tree.node(best_bad_idx).neighbor(i).index();
                if (idx != best_good_idx && good.is_member(idx))
                {
                    vtemp.push_back(idx);
                }
            }

            for (unsigned long i = 0; i < vtemp.size(); ++i)
                join_tree.remove_edge(vtemp[i], best_bad_idx);

            vtemp.clear();


            // and finally add this bad index into the good set
            good.add(best_bad_idx);
        }
    }

// ----------------------------------------------------------------------------------------

    namespace graph_helpers
    {
        template <
            typename T,
            typename U
            >
        bool validate_join_tree (
            const T& n,
            U& deads,
            unsigned long parent = 0xffffffff
        )
        /*!
            this function makes sure that a join tree satisfies the following criterion for paths starting at the given node:
                - for all valid i and j such that i and j are both < #join_tree.number_of_nodes()
                    - let X be the set of numbers that is contained in both #join_tree.node(i).data
                      and #join_tree.node(j).data
                    - It is the case that all nodes on the unique path between #join_tree.node(i)
                      and #join_tree.node(j) contain the numbers from X in their sets.

            returns true if validation passed and false if there is a problem with the tree
        !*/
        {
            n.data.reset();
            while (n.data.move_next())
            {
                if (deads.is_member(n.data.element()))
                    return false;
            }


            for (unsigned long i = 0; i < n.number_of_neighbors(); ++i)
            {
                if (n.neighbor(i).index() == parent)
                    continue;

                // add anything to dead stuff
                n.data.reset();
                while (n.data.move_next())
                {
                    if (n.neighbor(i).data.is_member(n.data.element()) == false)
                    {
                        unsigned long temp = n.data.element();
                        deads.add(temp);
                    }
                }

                if (validate_join_tree(n.neighbor(i), deads, n.index()) == false)
                    return false;

                // remove this nodes stuff from dead stuff
                n.data.reset();
                while (n.data.move_next())
                {
                    if (n.neighbor(i).data.is_member(n.data.element()) == false)
                    {
                        unsigned long temp = n.data.element();
                        deads.destroy(temp);
                    }
                }
            }

            return true;
        }
    }

    template <
        typename graph_type,
        typename join_tree_type
        >
    bool is_join_tree (
        const graph_type& g,
        const join_tree_type& join_tree
    )
    {

        // make sure requires clause is not broken
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
            "\tvoid create_join_tree(g, join_tree)"
            << "\n\tInvalid graph"
            );
        DLIB_ASSERT(graph_is_connected(g) == true,
            "\tvoid create_join_tree(g, join_tree)"
            << "\n\tInvalid graph"
            );

        COMPILE_TIME_ASSERT(is_graph<graph_type>::value || is_directed_graph<graph_type>::value);
        COMPILE_TIME_ASSERT(is_graph<join_tree_type>::value);


        if (graph_contains_undirected_cycle(join_tree))
            return false;

        if (graph_is_connected(join_tree) == false)
            return false;

        // verify that the path condition of the join tree is valid
        for (unsigned long i = 0; i < join_tree.number_of_nodes(); ++i)
        {
            typename join_tree_type::type deads;
            if (graph_helpers::validate_join_tree(join_tree.node(i), deads) == false)
                return false;
        }

        typename join_tree_type::edge_type e;
        typename join_tree_type::edge_type all;
        // now make sure that the edges contain correct intersections
        for (unsigned long i = 0; i < join_tree.number_of_nodes(); ++i)
        {
            set_union(all,join_tree.node(i).data, all);
            for (unsigned long j = 0; j < join_tree.node(i).number_of_neighbors(); ++j)
            {
                set_intersection(join_tree.node(i).data,
                                 join_tree.node(i).neighbor(j).data,
                                 e);

                if (!(e == join_tree.node(i).edge(j)))
                    return false;
            }
        }

        // and finally check that all the nodes in g show up in the join tree 
        if (all.size() != g.number_of_nodes())
            return false;
        all.reset();
        while (all.move_next())
        {
            if (all.element() >= g.number_of_nodes())
                return false;
        }


        return true;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GRAPH_UTILs_


