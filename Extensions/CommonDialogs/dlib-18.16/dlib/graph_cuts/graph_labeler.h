// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GRAPH_LaBELER_Hh_
#define DLIB_GRAPH_LaBELER_Hh_

#include "graph_labeler_abstract.h"
#include "../matrix.h"
#include "../string.h"
#include <vector>
#include "find_max_factor_graph_potts.h"
#include "../svm/sparse_vector.h"
#include "../graph.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    class graph_labeler 
    {

    public:

        typedef std::vector<bool> label_type;
        typedef label_type result_type;

        graph_labeler()
        {
        }

        graph_labeler(
            const vector_type& edge_weights_,
            const vector_type& node_weights_
        ) : 
            edge_weights(edge_weights_),
            node_weights(node_weights_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(edge_weights.size() == 0 || min(edge_weights) >= 0,
                    "\t graph_labeler::graph_labeler()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t min(edge_weights): " << min(edge_weights)
                    << "\n\t this:              " << this
                    );
        }

        const vector_type& get_edge_weights (
        ) const { return edge_weights; }

        const vector_type& get_node_weights (
        ) const { return node_weights; }

        template <typename graph_type>
        void operator() (
            const graph_type& sample,
            std::vector<bool>& labels 
        ) const
        {
            // make sure requires clause is not broken
#ifdef ENABLE_ASSERTS
            DLIB_ASSERT(graph_contains_length_one_cycle(sample) == false,
                        "\t void graph_labeler::operator()"
                        << "\n\t Invalid inputs were given to this function."
                        << "\n\t get_edge_weights().size(): " << get_edge_weights().size()
                        << "\n\t get_node_weights().size(): " << get_node_weights().size()
                        << "\n\t graph_contains_length_one_cycle(sample): " << graph_contains_length_one_cycle(sample)
                        << "\n\t this:                      " << this
                    );
            for (unsigned long i = 0; i < sample.number_of_nodes(); ++i)
            {
                if (is_matrix<vector_type>::value &&
                    is_matrix<typename graph_type::type>::value)
                {
                    // check that dot() is legal.
                    DLIB_ASSERT((unsigned long)get_node_weights().size() == (unsigned long)sample.node(i).data.size(),
                                "\t void graph_labeler::operator()"
                                << "\n\t The size of the node weight vector must match the one in the node."
                                << "\n\t get_node_weights().size():  " << get_node_weights().size()
                                << "\n\t sample.node(i).data.size(): " << sample.node(i).data.size()
                                << "\n\t i: " << i 
                                << "\n\t this:              " << this
                            );
                }

                for (unsigned long n = 0; n < sample.node(i).number_of_neighbors(); ++n)
                {
                    if (is_matrix<vector_type>::value &&
                        is_matrix<typename graph_type::edge_type>::value)
                    {
                        // check that dot() is legal.
                        DLIB_ASSERT((unsigned long)get_edge_weights().size() == (unsigned long)sample.node(i).edge(n).size(),
                                    "\t void graph_labeler::operator()"
                                    << "\n\t The size of the edge weight vector must match the one in graph's edge."
                                    << "\n\t get_edge_weights().size():  " << get_edge_weights().size()
                                    << "\n\t sample.node(i).edge(n).size(): " << sample.node(i).edge(n).size()
                                    << "\n\t i: " << i 
                                    << "\n\t this:              " << this
                        );
                    }

                    DLIB_ASSERT(sample.node(i).edge(n).size() == 0 || min(sample.node(i).edge(n)) >= 0,
                                "\t void graph_labeler::operator()"
                                << "\n\t No edge vectors are allowed to have negative elements."
                                << "\n\t min(sample.node(i).edge(n)): " << min(sample.node(i).edge(n))
                                << "\n\t i:    " << i 
                                << "\n\t n:    " << n 
                                << "\n\t this: " << this
                    );
                }
            }
#endif


            graph<double,double>::kernel_1a g; 
            copy_graph_structure(sample, g);
            for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
            {
                g.node(i).data = dot(node_weights, sample.node(i).data);

                for (unsigned long n = 0; n < g.node(i).number_of_neighbors(); ++n)
                {
                    const unsigned long j = g.node(i).neighbor(n).index();
                    // Don't compute an edge weight more than once. 
                    if (i < j)
                    {
                        g.node(i).edge(n) = dot(edge_weights, sample.node(i).edge(n));
                    }
                }

            }

            labels.clear();
            std::vector<node_label> temp;
            find_max_factor_graph_potts(g, temp);
            for (unsigned long i = 0; i < temp.size(); ++i)
            {
                if (temp[i] != 0)
                    labels.push_back(true);
                else
                    labels.push_back(false);
            }
        }

        template <typename graph_type>
        std::vector<bool> operator() (
            const graph_type& sample 
        ) const
        {
            std::vector<bool> temp;
            (*this)(sample, temp);
            return temp;
        }

    private:

        vector_type edge_weights;
        vector_type node_weights;
    };


// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    void serialize (
        const graph_labeler<vector_type>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.get_edge_weights(), out);
        serialize(item.get_node_weights(), out);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    void deserialize (
        graph_labeler<vector_type>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
        {
            throw dlib::serialization_error("While deserializing graph_labeler, found unexpected version number of " + 
                                            cast_to_string(version) + ".");
        }

        vector_type edge_weights, node_weights;
        deserialize(edge_weights, in);
        deserialize(node_weights, in);

        item = graph_labeler<vector_type>(edge_weights, node_weights);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GRAPH_LaBELER_Hh_


