// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GENERAL_FLOW_GRaPH_H__
#define DLIB_GENERAL_FLOW_GRaPH_H__

#include "../graph_utils.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        template <
            typename directed_graph_type
            >
        class general_flow_graph 
        {
            /*!
                this is a utility class used by dlib::min_cut to convert a directed_graph
                into the kind of flow graph expected by the min_cut object's main block
                of code.
            !*/

            directed_graph_type& g;

            typedef typename directed_graph_type::node_type node_type;
            typedef typename directed_graph_type::type node_label;

        public:

            general_flow_graph(
                directed_graph_type& g_
            ) : g(g_)
            {
            }

            class out_edge_iterator
            {
                friend class general_flow_graph;
                unsigned long idx; // base node idx
                unsigned long cnt; // count over the neighbors of idx
            public:

                out_edge_iterator(
                ):idx(0),cnt(0) {}

                out_edge_iterator(
                    unsigned long idx_,
                    unsigned long cnt_
                ):idx(idx_),cnt(cnt_)
                {}

                bool operator!= (
                    const out_edge_iterator& item
                ) const { return cnt != item.cnt; }

                out_edge_iterator& operator++(
                )
                {
                    ++cnt;
                    return *this;
                }
            };

            class in_edge_iterator
            {

                friend class general_flow_graph;
                unsigned long idx; // base node idx
                unsigned long cnt; // count over the neighbors of idx
            public:

                in_edge_iterator(
                ):idx(0),cnt(0) {}

                in_edge_iterator(
                    unsigned long idx_,
                    unsigned long cnt_
                ):idx(idx_),cnt(cnt_)
                {}

                bool operator!= (
                    const in_edge_iterator& item
                ) const { return cnt != item.cnt; }

                in_edge_iterator& operator++(
                )
                {
                    ++cnt;
                    return *this;
                }
            };

            unsigned long number_of_nodes (
            ) const { return g.number_of_nodes(); }

            out_edge_iterator out_begin(
                const unsigned long& it
            ) const { return out_edge_iterator(it, 0); }

            in_edge_iterator in_begin(
                const unsigned long& it
            ) const { return in_edge_iterator(it, 0); }

            out_edge_iterator out_end(
                const unsigned long& it
            ) const { return out_edge_iterator(it, g.node(it).number_of_children()); }

            in_edge_iterator in_end(
                const unsigned long& it
            ) const { return in_edge_iterator(it, g.node(it).number_of_parents()); }

            unsigned long node_id (
                const out_edge_iterator& it
            ) const { return g.node(it.idx).child(it.cnt).index(); }
            unsigned long node_id (
                const in_edge_iterator& it
            ) const { return g.node(it.idx).parent(it.cnt).index(); }

            typedef typename directed_graph_type::edge_type edge_type;

            edge_type get_flow (const unsigned long& it1,     const unsigned long& it2) const
            {
                return edge(g, it1, it2);
            }
            edge_type get_flow (const out_edge_iterator& it) const
            {
                return g.node(it.idx).child_edge(it.cnt);
            }
            edge_type get_flow (const in_edge_iterator& it) const
            {
                return g.node(it.idx).parent_edge(it.cnt);
            }

            void adjust_flow (
                const unsigned long& it1,
                const unsigned long& it2,
                const edge_type& value
            )
            {
                edge(g, it1, it2) += value;
                edge(g, it2, it1) -= value;
            }

            void set_label (
                const unsigned long& it,
                node_label value
            )
            {
                g.node(it).data = value;
            }

            node_label get_label (
                const unsigned long& it
            ) const
            {
                return g.node(it).data;
            }

        };

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GENERAL_FLOW_GRaPH_H__

