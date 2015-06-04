// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GENERAL_POTTS_PRoBLEM_Hh_
#define DLIB_GENERAL_POTTS_PRoBLEM_Hh_

#include "../graph_utils.h"
#include "min_cut.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename graph_type
            >
        class general_potts_problem 
        {

            const graph_type& g;
            std::vector<node_label>& labels;
        public:
            general_potts_problem (
                const graph_type& g_,
                std::vector<node_label>& labels_
            ) : g(g_), labels(labels_)
            {
                labels.resize(g.number_of_nodes());
            }

            unsigned long number_of_nodes (
            ) const { return g.number_of_nodes(); }

            unsigned long number_of_neighbors (
                unsigned long idx
            ) const { return g.node(idx).number_of_neighbors(); }

            unsigned long get_neighbor (
                unsigned long idx,
                unsigned long n 
            ) const { return g.node(idx).neighbor(n).index(); }

            unsigned long get_neighbor_idx (
                unsigned long idx1,
                unsigned long idx2
            ) const
            {
                for (unsigned long i = 0; i < g.node(idx1).number_of_neighbors(); ++i)
                {
                    if (g.node(idx1).neighbor(i).index() == idx2)
                        return i;
                }

                // This should never ever execute
                return 0;
            }

            void set_label (
                const unsigned long& idx,
                node_label value
            )
            {
                labels[idx] = value;
            }

            node_label get_label (
                const unsigned long& idx
            ) const { return labels[idx]; }

            typedef typename graph_type::edge_type value_type;

            value_type factor_value (
                unsigned long idx
            ) const
            {
                return g.node(idx).data;
            }

            value_type factor_value_disagreement (
                unsigned long idx1, 
                unsigned long idx2
            ) const
            {
                return edge(g, idx1, idx2);
            }

        };
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GENERAL_POTTS_PRoBLEM_Hh_


