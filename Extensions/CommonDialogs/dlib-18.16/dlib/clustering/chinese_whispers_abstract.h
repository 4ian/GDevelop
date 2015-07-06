// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CHINESE_WHISPErS_ABSTRACT_Hh_
#ifdef DLIB_CHINESE_WHISPErS_ABSTRACT_Hh_

#include <vector>
#include "../rand.h"
#include "../graph_utils/ordered_sample_pair_abstract.h"
#include "../graph_utils/sample_pair_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    unsigned long chinese_whispers (
        const std::vector<ordered_sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const unsigned long num_iterations,
        dlib::rand& rnd
    );
    /*!
        requires
            - is_ordered_by_index(edges) == true
        ensures
            - This function implements the graph clustering algorithm described in the
              paper: Chinese Whispers - an Efficient Graph Clustering Algorithm and its
              Application to Natural Language Processing Problems by Chris Biemann.
            - Interprets edges as a directed graph.  That is, it contains the edges on the
              said graph and the ordered_sample_pair::distance() values define the edge
              weights (larger values indicating a stronger edge connection between the
              nodes).  If an edge has a distance() value of infinity then it is considered
              a "must link" edge.
            - returns the number of clusters found.
            - #labels.size() == max_index_plus_one(edges)
            - for all valid i:
                - #labels[i] == the cluster ID of the node with index i in the graph.  
                - 0 <= #labels[i] < the number of clusters found
                  (i.e. cluster IDs are assigned contiguously and start at 0) 
            - Duplicate edges are interpreted as if there had been just one edge with a
              distance value equal to the sum of all the duplicate edge's distance values.
            - The algorithm performs exactly num_iterations passes over the graph before
              terminating.
    !*/

// ----------------------------------------------------------------------------------------

    unsigned long chinese_whispers (
        const std::vector<sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const unsigned long num_iterations,
        dlib::rand& rnd
    );
    /*!
        ensures
            - This function is identical to the above chinese_whispers() routine except
              that it operates on a vector of sample_pair objects instead of
              ordered_sample_pairs.  Therefore, this is simply a convenience routine.  In
              particular, it is implemented by transforming the given edges into
              ordered_sample_pairs and then calling the chinese_whispers() routine defined
              above.  
    !*/

// ----------------------------------------------------------------------------------------

    unsigned long chinese_whispers (
        const std::vector<ordered_sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const unsigned long num_iterations = 100
    );
    /*!
        requires
            - is_ordered_by_index(edges) == true
        ensures
            - performs: return chinese_whispers(edges, labels, num_iterations, rnd)
              where rnd is a default initialized dlib::rand object.
    !*/

// ----------------------------------------------------------------------------------------

    unsigned long chinese_whispers (
        const std::vector<sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const unsigned long num_iterations = 100
    );
    /*!
        ensures
            - performs: return chinese_whispers(edges, labels, num_iterations, rnd)
              where rnd is a default initialized dlib::rand object.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CHINESE_WHISPErS_ABSTRACT_Hh_

