// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MIN_CuT_H__
#define DLIB_MIN_CuT_H__

#include "min_cut_abstract.h"
#include "../matrix.h"
#include "general_flow_graph.h"
#include "../is_kind.h"

#include <iostream>
#include <fstream>
#include <deque>


// ----------------------------------------------------------------------------------------


namespace dlib
{

    typedef unsigned char node_label;

// ----------------------------------------------------------------------------------------

    const node_label SOURCE_CUT = 0;
    const node_label SINK_CUT = 254;
    const node_label FREE_NODE = 255;

// ----------------------------------------------------------------------------------------

    template <typename flow_graph>
    typename disable_if<is_directed_graph<flow_graph>,typename flow_graph::edge_type>::type 
    graph_cut_score (
        const flow_graph& g
    )
    {
        typedef typename flow_graph::edge_type edge_weight_type;
        edge_weight_type score = 0;
        typedef typename flow_graph::out_edge_iterator out_edge_iterator;
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            if (g.get_label(i) != SOURCE_CUT)
                continue;

            for (out_edge_iterator n = g.out_begin(i); n != g.out_end(i); ++n)
            {
                if (g.get_label(g.node_id(n)) != SOURCE_CUT)
                {
                    score += g.get_flow(n);
                }
            }
        }

        return score;
    }

    template <typename directed_graph>
    typename enable_if<is_directed_graph<directed_graph>,typename directed_graph::edge_type>::type 
    graph_cut_score (
        const directed_graph& g
    )
    {
        return graph_cut_score(dlib::impl::general_flow_graph<const directed_graph>(g));
    }

// ----------------------------------------------------------------------------------------

    class min_cut
    {

    public:

        min_cut()
        {
        }

        min_cut( const min_cut& )
        {
            // Intentionally left empty since all the member variables
            // don't logically contribute to the state of this object.
            // This copy constructor is here to explicitly avoid the overhead
            // of copying these transient variables.  
        }

        template <
            typename directed_graph
            >
        typename enable_if<is_directed_graph<directed_graph> >::type operator() (
            directed_graph& g,
            const unsigned long source_node,
            const unsigned long sink_node
        ) const
        {
            DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
                        "\t void min_cut::operator()"
                        << "\n\t Invalid arguments were given to this function."
                        );
            DLIB_ASSERT(graph_has_symmetric_edges(g) == true,
                        "\t void min_cut::operator()"
                        << "\n\t Invalid arguments were given to this function."
                        );

            dlib::impl::general_flow_graph<directed_graph> temp(g);
            (*this)(temp, source_node, sink_node);
        }

        template <
            typename flow_graph
            >
        typename disable_if<is_directed_graph<flow_graph> >::type operator() (
            flow_graph& g,
            const unsigned long source_node,
            const unsigned long sink_node
        ) const
        {
#ifdef ENABLE_ASSERTS
            DLIB_ASSERT(source_node != sink_node &&
                        source_node < g.number_of_nodes() &&
                        sink_node < g.number_of_nodes(),
                    "\t void min_cut::operator()"
                    << "\n\t Invalid arguments were given to this function."
                    << "\n\t g.number_of_nodes(): " << g.number_of_nodes() 
                    << "\n\t source_node: " << source_node 
                    << "\n\t sink_node:   " << sink_node 
                    << "\n\t this:   " << this
            );

            for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
            {
                typename flow_graph::out_edge_iterator j, end = g.out_end(i);
                for (j = g.out_begin(i); j != end; ++j)
                {
                    const unsigned long jj = g.node_id(j);
                    DLIB_ASSERT(g.get_flow(i,jj) >= 0,
                                "\t void min_cut::operator()"
                                << "\n\t Invalid inputs were given to this function." 
                                << "\n\t i: "<< i 
                                << "\n\t jj: "<< jj
                                << "\n\t g.get_flow(i,jj): "<< g.get_flow(i,jj)
                                << "\n\t this: "<< this
                                );

                }
            }
#endif
            parent.clear();
            active.clear();
            orphans.clear();

            typedef typename flow_graph::edge_type edge_type;
            COMPILE_TIME_ASSERT(is_signed_type<edge_type>::value);

            typedef typename flow_graph::out_edge_iterator out_edge_iterator;
            typedef typename flow_graph::in_edge_iterator in_edge_iterator;

            // initialize labels
            for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
                g.set_label(i, FREE_NODE);

            g.set_label(source_node, SOURCE_CUT);
            g.set_label(sink_node, SINK_CUT);

            // used to indicate "no parent"
            const unsigned long nil = g.number_of_nodes();

            parent.assign(g.number_of_nodes(), nil);

            time = 1;
            dist.assign(g.number_of_nodes(), 0);
            ts.assign(g.number_of_nodes(), time);

            active.push_back(source_node);
            active.push_back(sink_node);


            in_edge_iterator in_begin = g.in_begin(active[0]);
            out_edge_iterator out_begin = g.out_begin(active[0]);

            unsigned long source_side, sink_side;
            while (grow(g,source_side,sink_side, in_begin, out_begin))
            {
                ++time;
                ts[source_node] = time;
                ts[sink_node] = time;

                augment(g, source_node, sink_node, source_side, sink_side);
                adopt(g, source_node, sink_node);
            }

        }


    private:

        unsigned long distance_to_origin (
            const unsigned long nil,
            unsigned long p,
            unsigned long 
        ) const
        {
            unsigned long start = p;
            unsigned long count = 0;
            while (p != nil)
            {
                if (ts[p] == time)
                {
                    count += dist[p];

                    unsigned long count_down = count;
                    // adjust the dist and ts for the nodes on this path.
                    while (start != p)
                    {
                        ts[start] = time;
                        dist[start] = count_down;
                        --count_down;
                        start = parent[start];
                    }

                    return count;
                }
                p = parent[p];
                ++count;
            }

            return std::numeric_limits<unsigned long>::max();
        }

        template <typename flow_graph>
        void adopt (
            flow_graph& g,
            const unsigned long source,
            const unsigned long sink
        ) const
        {
            typedef typename flow_graph::edge_type edge_type;
            typedef typename flow_graph::out_edge_iterator out_edge_iterator;
            typedef typename flow_graph::in_edge_iterator in_edge_iterator;

            // used to indicate "no parent"
            const unsigned long nil = g.number_of_nodes();

            while (orphans.size() > 0)
            {
                const unsigned long p = orphans.back();
                orphans.pop_back();

                const unsigned char label_p = g.get_label(p);

                // Try to find a valid parent for p.
                if (label_p == SOURCE_CUT)
                {
                    const in_edge_iterator begin(g.in_begin(p));
                    const in_edge_iterator end(g.in_end(p));
                    unsigned long best_dist = std::numeric_limits<unsigned long>::max();
                    unsigned long best_node = 0;
                    for(in_edge_iterator q = begin; q != end; ++q)
                    {
                        const unsigned long id = g.node_id(q);

                        if (g.get_label(id) != label_p || g.get_flow(q) <= 0 )
                            continue;

                        unsigned long temp = distance_to_origin(nil, id,source);
                        if (temp < best_dist)
                        {
                            best_dist = temp;
                            best_node = id;
                        }

                    }
                    if (best_dist != std::numeric_limits<unsigned long>::max())
                    {
                        parent[p] = best_node;
                        dist[p] = dist[best_node] + 1;
                        ts[p] = time;
                    }

                    // if we didn't find a parent for p
                    if (parent[p] == nil)
                    {
                        for(in_edge_iterator q = begin; q != end; ++q)
                        {
                            const unsigned long id = g.node_id(q);

                            if (g.get_label(id) != SOURCE_CUT)
                                continue;

                            if (g.get_flow(q) > 0)
                                active.push_back(id);

                            if (parent[id] == p)
                            {
                                parent[id] = nil;
                                orphans.push_back(id);
                            }
                        }
                        g.set_label(p, FREE_NODE);
                    }
                }
                else
                {
                    unsigned long best_node = 0;
                    unsigned long best_dist = std::numeric_limits<unsigned long>::max();
                    const out_edge_iterator begin(g.out_begin(p));
                    const out_edge_iterator end(g.out_end(p));
                    for(out_edge_iterator q = begin; q != end; ++q)
                    {
                        const unsigned long id = g.node_id(q);
                        if (g.get_label(id) != label_p || g.get_flow(q) <= 0)
                            continue;

                        unsigned long temp = distance_to_origin(nil, id,sink);

                        if (temp < best_dist)
                        {
                            best_dist = temp;
                            best_node = id;
                        }
                    }

                    if (best_dist != std::numeric_limits<unsigned long>::max())
                    {
                        parent[p] = best_node;
                        dist[p] = dist[best_node] + 1;
                        ts[p] = time;
                    }

                    // if we didn't find a parent for p
                    if (parent[p] == nil)
                    {
                        for(out_edge_iterator q = begin; q != end; ++q)
                        {
                            const unsigned long id = g.node_id(q);

                            if (g.get_label(id) != SINK_CUT)
                                continue;

                            if (g.get_flow(q) > 0)
                                active.push_back(id);

                            if (parent[id] == p)
                            {
                                parent[id] = nil;
                                orphans.push_back(id);
                            }
                        }

                        g.set_label(p, FREE_NODE);
                    }
                }

                
            }

        }

        template <typename flow_graph>
        void augment (
            flow_graph& g,
            const unsigned long& source,
            const unsigned long& sink,
            const unsigned long& source_side, 
            const unsigned long& sink_side
        ) const
        {
            typedef typename flow_graph::edge_type edge_type;
            typedef typename flow_graph::out_edge_iterator out_edge_iterator;
            typedef typename flow_graph::in_edge_iterator in_edge_iterator;

            // used to indicate "no parent"
            const unsigned long nil = g.number_of_nodes();

            unsigned long s = source_side;
            unsigned long t = sink_side;
            edge_type min_cap = g.get_flow(s,t);

            // find the bottleneck capacity on the current path.

            // check from source_side back to the source for the min capacity link.
            t = s;
            while (t != source)
            {
                s = parent[t];
                const edge_type temp = g.get_flow(s, t);
                if (temp < min_cap)
                {
                    min_cap = temp;
                }
                t = s;
            }

            // check from sink_side back to the sink for the min capacity link
            s = sink_side;
            while (s != sink)
            {
                t = parent[s];
                const edge_type temp = g.get_flow(s, t);
                if (temp < min_cap)
                {
                    min_cap = temp;
                }
                s = t;
            }


            // now push the max possible amount of flow though the path
            s = source_side;
            t = sink_side;
            g.adjust_flow(t,s, min_cap);

            // trace back towards the source
            t = s;
            while (t != source)
            {
                s = parent[t];
                g.adjust_flow(t,s, min_cap);
                if (g.get_flow(s,t) <= 0)
                {
                    parent[t] = nil;
                    orphans.push_back(t);
                }

                t = s;
            }

            // trace back towards the sink 
            s = sink_side;
            while (s != sink)
            {
                t = parent[s];
                g.adjust_flow(t,s, min_cap);
                if (g.get_flow(s,t) <= 0)
                {
                    parent[s] = nil;
                    orphans.push_back(s);
                }
                s = t;
            }
        }

        template <typename flow_graph>
        bool grow (
            flow_graph& g,
            unsigned long& source_side, 
            unsigned long& sink_side,
            typename flow_graph::in_edge_iterator& in_begin,
            typename flow_graph::out_edge_iterator& out_begin
        ) const
        /*!
            ensures
                - if (an augmenting path was found) then 
                    - returns true
                    - (#source_side, #sink_side) == the point where the two trees meet.
                      #source_side is part of the source tree and #sink_side is part of
                      the sink tree.
                - else
                    - returns false
        !*/
        {
            typedef typename flow_graph::edge_type edge_type;
            typedef typename flow_graph::out_edge_iterator out_edge_iterator;
            typedef typename flow_graph::in_edge_iterator in_edge_iterator;


            while (active.size() != 0)
            {
                // pick an active node
                const unsigned long A = active[0];

                const unsigned char label_A = g.get_label(A);

                // process its neighbors
                if (label_A == SOURCE_CUT)
                {
                    const out_edge_iterator out_end = g.out_end(A);
                    for(out_edge_iterator& i = out_begin; i != out_end; ++i)
                    {
                        if (g.get_flow(i) > 0)
                        {
                            const unsigned long id = g.node_id(i);
                            const unsigned char label_i = g.get_label(id); 
                            if (label_i == FREE_NODE)
                            {
                                active.push_back(id);
                                g.set_label(id,SOURCE_CUT);
                                parent[id] = A;
                                ts[id] = ts[A];
                                dist[id] = dist[A] + 1;
                            }
                            else if (label_A != label_i)
                            {
                                source_side = A;
                                sink_side = id;
                                return true;
                            }
                            else if (is_closer(A, id))
                            {
                                parent[id] = A;
                                ts[id] = ts[A];
                                dist[id] = dist[A] + 1;
                            }
                        }
                    }
                }
                else if (label_A == SINK_CUT)
                {
                    const in_edge_iterator in_end = g.in_end(A);
                    for(in_edge_iterator& i = in_begin; i != in_end; ++i)
                    {
                        if (g.get_flow(i) > 0)
                        {
                            const unsigned long id = g.node_id(i);
                            const unsigned char label_i = g.get_label(id); 
                            if (label_i == FREE_NODE)
                            {
                                active.push_back(id);
                                g.set_label(id,SINK_CUT);
                                parent[id] = A;
                                ts[id] = ts[A];
                                dist[id] = dist[A] + 1;
                            }
                            else if (label_A != label_i)
                            {
                                sink_side = A;
                                source_side = id;
                                return true;
                            }
                            else if (is_closer(A, id))
                            {
                                parent[id] = A;
                                ts[id] = ts[A];
                                dist[id] = dist[A] + 1;
                            }
                        }
                    }
                }

                active.pop_front();
                if (active.size() != 0)
                {
                    in_begin = g.in_begin(active[0]);
                    out_begin = g.out_begin(active[0]);
                }
            }

            return false;
        }

        inline bool is_closer (
            unsigned long p,
            unsigned long q
        ) const
        {
            // return true if p is closer to a terminal than q
            return ts[q] <= ts[p] && dist[q] > dist[p];
        }

        mutable std::vector<uint32> dist;
        mutable std::vector<uint32> ts;
        mutable uint32 time;
        mutable std::vector<unsigned long> parent;

        mutable std::deque<unsigned long> active;
        mutable std::vector<unsigned long> orphans;
    };

// ----------------------------------------------------------------------------------------

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_MIN_CuT_H__

