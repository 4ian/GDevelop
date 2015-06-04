// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MODULARITY_ClUSTERING_ABSTRACT_Hh_
#ifdef DLIB_MODULARITY_ClUSTERING_ABSTRACT_Hh_

#include <vector>
#include "../graph_utils/ordered_sample_pair_abstract.h"
#include "../graph_utils/sample_pair_abstract.h"

namespace dlib
{

// -----------------------------------------------------------------------------------------

    double modularity (
        const std::vector<sample_pair>& edges,
        const std::vector<unsigned long>& labels
    );
    /*!
        requires
            - labels.size() == max_index_plus_one(edges)
            - for all valid i:
                - 0 <= edges[i].distance() < std::numeric_limits<double>::infinity()
        ensures
            - Interprets edges as an undirected graph.  That is, it contains the edges on
              the said graph and the sample_pair::distance() values define the edge weights
              (larger values indicating a stronger edge connection between the nodes).
            - This function returns the modularity value obtained when the given input
              graph is broken into subgraphs according to the contents of labels.  In
              particular, we say that two nodes with indices i and j are in the same
              subgraph or community if and only if labels[i] == labels[j].
            - Duplicate edges are interpreted as if there had been just one edge with a
              distance value equal to the sum of all the duplicate edge's distance values.
            - See the paper Modularity and community structure in networks by M. E. J. Newman
              for a detailed definition.
    !*/

// ----------------------------------------------------------------------------------------

    double modularity (
        const std::vector<ordered_sample_pair>& edges,
        const std::vector<unsigned long>& labels
    );
    /*!
        requires
            - labels.size() == max_index_plus_one(edges)
            - for all valid i:
                - 0 <= edges[i].distance() < std::numeric_limits<double>::infinity()
        ensures
            - Interprets edges as a directed graph.  That is, it contains the edges on the
              said graph and the ordered_sample_pair::distance() values define the edge
              weights (larger values indicating a stronger edge connection between the
              nodes).  Note that, generally, modularity is only really defined for
              undirected graphs.  Therefore, the "directed graph" given to this function
              should have symmetric edges between all nodes.  The reason this function is
              provided at all is because sometimes a vector of ordered_sample_pair objects
              is a useful representation of an undirected graph.
            - This function returns the modularity value obtained when the given input
              graph is broken into subgraphs according to the contents of labels.  In
              particular, we say that two nodes with indices i and j are in the same
              subgraph or community if and only if labels[i] == labels[j].
            - Duplicate edges are interpreted as if there had been just one edge with a
              distance value equal to the sum of all the duplicate edge's distance values.
            - See the paper Modularity and community structure in networks by M. E. J. Newman
              for a detailed definition.
    !*/

// ----------------------------------------------------------------------------------------

    unsigned long newman_cluster (
        const std::vector<ordered_sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const double eps = 1e-4,
        const unsigned long max_iterations = 2000
    );
    /*!
        requires
            - is_ordered_by_index(edges) == true
            - for all valid i:
                - 0 <= edges[i].distance() < std::numeric_limits<double>::infinity()
        ensures
            - This function performs the clustering algorithm described in the paper
              Modularity and community structure in networks by M. E. J. Newman.  
            - This function interprets edges as a graph and attempts to find the labeling
              that maximizes modularity(edges, #labels).   
            - returns the number of clusters found.
            - #labels.size() == max_index_plus_one(edges)
            - for all valid i:
                - #labels[i] == the cluster ID of the node with index i in the graph.  
                - 0 <= #labels[i] < the number of clusters found
                  (i.e. cluster IDs are assigned contiguously and start at 0) 
            - The main computation of the algorithm is involved in finding an eigenvector
              of a certain matrix.  To do this, we use the power iteration.  In particular,
              each time we try to find an eigenvector we will let the power iteration loop
              at most max_iterations times or until it reaches an accuracy of eps.
              Whichever comes first.
    !*/

// ----------------------------------------------------------------------------------------

    unsigned long newman_cluster (
        const std::vector<sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const double eps = 1e-4,
        const unsigned long max_iterations = 2000
    );
    /*!
        requires
            - for all valid i:
                - 0 <= edges[i].distance() < std::numeric_limits<double>::infinity()
        ensures
            - This function is identical to the above newman_cluster() routine except that
              it operates on a vector of sample_pair objects instead of
              ordered_sample_pairs.  Therefore, this is simply a convenience routine.  In
              particular, it is implemented by transforming the given edges into
              ordered_sample_pairs and then calling the newman_cluster() routine defined
              above.  
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MODULARITY_ClUSTERING_ABSTRACT_Hh_

