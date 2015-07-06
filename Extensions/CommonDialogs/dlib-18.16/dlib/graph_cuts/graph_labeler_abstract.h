// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_GRAPH_LaBELER_ABSTRACT_Hh_
#ifdef DLIB_GRAPH_LaBELER_ABSTRACT_Hh_

#include "find_max_factor_graph_potts_abstract.h"
#include "../graph/graph_kernel_abstract.h"
#include "../matrix/matrix_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    class graph_labeler 
    {
        /*!
            REQUIREMENTS ON vector_type
                - vector_type is a dlib::matrix capable of representing column 
                  vectors or it is a sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.  

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for labeling each node in a graph with a value 
                of true or false, subject to a labeling consistency constraint between 
                nodes that share an edge.  In particular, this object is useful for 
                representing a graph labeling model learned via some machine learning 
                method.
                
                To elaborate, suppose we have a graph we want to label.  Moreover, 
                suppose we can assign a score to each node which represents how much 
                we want to label the node as true, and we also have scores for each 
                edge which represent how much we wanted the nodes sharing the edge to 
                have the same label.  If we could do this then we could find the optimal 
                labeling using the find_max_factor_graph_potts() routine.  Therefore, 
                the graph_labeler is just an object which contains the necessary data 
                to compute these score functions and then call find_max_factor_graph_potts().  
                Additionally, this object uses linear functions to represent these score 
                functions.    

            THREAD SAFETY
                It is always safe to use distinct instances of this object in different
                threads.  However, when a single instance is shared between threads then
                the following rules apply:
                    It is safe to call the const members of this object from multiple
                    threads.  This is because the const members are purely read-only
                    operations.  However, any operation that modifies a graph_labeler is
                    not threadsafe.
        !*/

    public:

        typedef std::vector<bool> label_type;
        typedef label_type result_type;

        graph_labeler(
        );
        /*!
            ensures
                - this object is properly initialized
                - #get_node_weights() == an initial value of type vector_type.
                - #get_edge_weights() == an initial value of type vector_type.
        !*/

        graph_labeler(
            const vector_type& edge_weights,
            const vector_type& node_weights
        );
        /*!
            requires
                - min(edge_weights) >= 0
            ensures
                - #get_edge_weights() == edge_weights
                - #get_node_weights() == node_weights
        !*/

        const vector_type& get_edge_weights (
        ) const; 
        /*!
            ensures
                - Recall that the score function for an edge is a linear function of
                  the vector stored at that edge.  This means there is some vector, E,
                  which we dot product with the vector in the graph to compute the 
                  score.  Therefore, this function returns that E vector which defines 
                  the edge score function.
        !*/

        const vector_type& get_node_weights (
        ) const; 
        /*!
            ensures
                - Recall that the score function for a node is a linear function of
                  the vector stored in that node.  This means there is some vector, W, 
                  which we dot product with the vector in the graph to compute the score.  
                  Therefore, this function returns that W vector which defines the node 
                  score function.
        !*/

        template <typename graph_type>
        void operator() (
            const graph_type& sample,
            std::vector<bool>& labels 
        ) const;
        /*!
            requires
                - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
                - graph_type::type and graph_type::edge_type must be either matrix objects
                  capable of representing column vectors or some kind of sparse vector
                  type as defined in dlib/svm/sparse_vector_abstract.h.
                - graph_contains_length_one_cycle(sample) == false
                - for all valid i and j:
                    - min(edge(sample,i,j)) >= 0
                    - it must be legal to call dot(edge(sample,i,j), get_edge_weights())
                    - it must be legal to call dot(sample.node(i).data, get_node_weights())
            ensures
                - Computes a labeling for each node in the given graph and stores the result
                  in #labels.  
                - #labels.size() == sample.number_of_nodes()
                - for all valid i:
                    - #labels[i] == the label of the node sample.node(i).
                - The labels are computed by creating a graph, G, with scalar values on each node 
                  and edge.  The scalar values are calculated according to the following:
                    - for all valid i:
                        - G.node(i).data == dot(get_node_weights(), sample.node(i).data)
                    - for all valid i and j:
                        - edge(G,i,j) == dot(get_edge_weights(), edge(sample,i,j))
                  Then the labels are computed by calling find_max_factor_graph_potts(G,#labels).
        !*/

        template <typename graph_type>
        std::vector<bool> operator() (
            const graph_type& sample 
        ) const;
        /*!
            requires
                - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
                - graph_contains_length_one_cycle(sample) == false
                - for all valid i and j:
                    - min(edge(sample,i,j)) >= 0
                    - it must be legal to call dot(edge(sample,i,j), get_edge_weights())
                    - it must be legal to call dot(sample.node(i).data, get_node_weights())
            ensures
                - Performs (*this)(sample, labels); return labels;
                  (i.e. This is just another version of the above operator() routine
                  but instead of returning the labels via the second argument, it
                  returns them as the normal return value).
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    void serialize (
        const graph_labeler<vector_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    void deserialize (
        graph_labeler<vector_type>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GRAPH_LaBELER_ABSTRACT_Hh_

