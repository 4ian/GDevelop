// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_EDGE_LIST_GrAPHS_ABSTRACT_Hh_
#ifdef DLIB_EDGE_LIST_GrAPHS_ABSTRACT_Hh_

#include <vector>
#include "../string.h"
#include "sample_pair_abstract.h"
#include "ordered_sample_pair_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename distance_function_type,
        typename alloc,
        typename T
        >
    void find_percent_shortest_edges_randomly (
        const vector_type& samples,
        const distance_function_type& dist_funct,
        const double percent,
        const unsigned long num,
        const T& random_seed,
        std::vector<sample_pair, alloc>& out
    );
    /*!
        requires
            - 0 < percent <= 1
            - num > 0
            - random_seed must be convertible to a string by dlib::cast_to_string()
            - dist_funct(samples[i], samples[j]) must be a valid expression that evaluates
              to a floating point number 
        ensures
            - This function randomly samples the space of pairs of integers between
              0 and samples.size()-1 inclusive.  For each of these pairs, (i,j), a
              sample_pair is created as follows:    
                sample_pair(i, j, dist_funct(samples[i], samples[j]))
              num such sample_pair objects are generated, duplicates and pairs with distance
              values == infinity are removed, and then the top percent of them with the 
              smallest distance are stored into out.  
            - #out.size() <= num*percent 
            - contains_duplicate_pairs(#out) == false
            - for all valid i:
                - #out[i].distance() == dist_funct(samples[#out[i].index1()], samples[#out[i].index2()])
                - #out[i].distance() < std::numeric_limits<double>::infinity()
            - random_seed is used to seed the random number generator used by this 
              function.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename distance_function_type,
        typename alloc,
        typename T
        >
    void find_approximate_k_nearest_neighbors (
        const vector_type& samples,
        const distance_function_type& dist_funct,
        const unsigned long k,
        const unsigned long num,
        const T& random_seed,
        std::vector<sample_pair, alloc>& out
    );
    /*!
        requires
            - k > 0
            - num > 0
            - random_seed must be convertible to a string by dlib::cast_to_string()
            - dist_funct(samples[i], samples[j]) must be a valid expression that evaluates
              to a floating point number 
        ensures
            - This function computes an approximate form of k nearest neighbors. As num grows 
              larger the output of this function converges to the output of the 
              find_k_nearest_neighbors() function defined below.
            - Specifically, this function randomly samples the space of pairs of integers between
              0 and samples.size()-1 inclusive.  For each of these pairs, (i,j), a
              sample_pair is created as follows:    
                sample_pair(i, j, dist_funct(samples[i], samples[j]))
              num such sample_pair objects are generated and then exact k-nearest-neighbors
              is performed amongst these sample_pairs and the results are stored into #out.
              Note that samples with an infinite distance between them are considered to 
              be not connected at all.
            - contains_duplicate_pairs(#out) == false
            - for all valid i:
                - #out[i].distance() == dist_funct(samples[#out[i].index1()], samples[#out[i].index2()])
                - #out[i].distance() < std::numeric_limits<double>::infinity()
            - random_seed is used to seed the random number generator used by this 
              function.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename distance_function_type,
        typename alloc
        >
    void find_k_nearest_neighbors (
        const vector_type& samples,
        const distance_function_type& dist_funct,
        const unsigned long k,
        std::vector<sample_pair, alloc>& out
    );
    /*!
        requires
            - k > 0
            - dist_funct(samples[i], samples[j]) must be a valid expression that evaluates
              to a floating point number 
        ensures
            - #out == a set of sample_pair objects that represent all the k nearest 
              neighbors in samples according to the given distance function dist_funct.  
              Note that samples with an infinite distance between them are considered to 
              be not connected at all.
            - for all valid i:
                - #out[i].distance() == dist_funct(samples[#out[i].index1()], samples[#out[i].index2()])
                - #out[i].distance() < std::numeric_limits<double>::infinity()
            - contains_duplicate_pairs(#out) == false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    bool contains_duplicate_pairs (
        const vector_type& pairs
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - if (pairs contains any elements that are equal according to operator==) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    unsigned long max_index_plus_one (
        const vector_type& pairs
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - if (pairs.size() == 0) then
                - returns 0
            - else
                - returns a number N such that: 
                    - for all i:  pairs[i].index1()   <  N && pairs[i].index2()   <  N
                    - for some j: pairs[j].index1()+1 == N || pairs[j].index2()+1 == N
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_long_edges (
        vector_type& pairs,
        double distance_threshold
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - Removes all elements of pairs that have a distance value greater than the
              given threshold.
            - #pairs.size() <= pairs.size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_short_edges (
        vector_type& pairs,
        double distance_threshold
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - Removes all elements of pairs that have a distance value less than the
              given threshold.
            - #pairs.size() <= pairs.size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_percent_longest_edges (
        vector_type& pairs,
        double percent 
    );
    /*!
        requires
            - 0 <= percent < 1
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - Removes the given upper percentage of the longest edges in pairs.  I.e.
              this function removes the long edges from pairs.
            - #pairs.size() == (1-percent)*pairs.size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_percent_shortest_edges (
        vector_type& pairs,
        double percent 
    );
    /*!
        requires
            - 0 <= percent < 1
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - Removes the given upper percentage of the shortest edges in pairs.  I.e.
              this function removes the short edges from pairs.
            - #pairs.size() == (1-percent)*pairs.size()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_duplicate_edges (
        vector_type& pairs
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - Removes any duplicate edges from pairs.  That is, for all elements of pairs,
              A and B, such that A == B, only one of A or B will be in pairs after this
              function terminates.
            - #pairs.size() <= pairs.size()
            - is_ordered_by_index(#pairs) == true
            - contains_duplicate_pairs(#pairs) == false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    bool is_ordered_by_index (
        const vector_type& edges
    );
    /*!
        requires
            - vector_type == a type with an interface compatible with std::vector and it
              must in turn contain objects with an interface compatible with
              dlib::sample_pair or dlib::ordered_sample_pair.
        ensures
            - returns true if and only if the contents of edges are in sorted order
              according to order_by_index().  That is, we return true if calling
              std::stable_sort(edges.begin(), edges.end(), &order_by_index<T>) would not
              change the ordering of elements of edges.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename alloc1, 
        typename alloc2
        >
    void find_neighbor_ranges (
        const std::vector<ordered_sample_pair,alloc1>& edges,
        std::vector<std::pair<unsigned long, unsigned long>,alloc2>& neighbors
    );
    /*!
        requires
            - is_ordered_by_index(edges) == true
              (i.e. edges is sorted so that all the edges for a particular node are grouped
              together)
        ensures
            - This function takes a graph, represented by its list of edges, and finds the
              ranges that contain the edges for each node in the graph.  In particular,
              #neighbors[i] will tell you which edges correspond to the ith node in the
              graph.
            - #neighbors.size() == max_index_plus_one(edges)
              (i.e. neighbors will have an entry for each node in the graph defined by the
              list of edges)
            - for all valid i:
                - all elements of edges such that their index1() value == i are in the
                  range [neighbors[i].first, neighbors[i].second).  That is, for all k such
                  that neighbors[i].first <= k < neighbors[i].second:
                    - edges[k].index1() == i.
                    - all edges outside this range have an index1() value != i
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename alloc1, 
        typename alloc2
        >
    void convert_unordered_to_ordered (
        const std::vector<sample_pair,alloc1>& edges,
        std::vector<ordered_sample_pair,alloc2>& out_edges
    );
    /*!
        ensures
            - interprets edges a defining an undirected graph. 
            - This function populates out_edges with a directed graph that represents the
              same graph as the one in edges.  In particular, this means that for all valid
              i we have the following:
                - if (edges[i].index1() != edges[i].index2()) then
                    - #out_edges contains two edges corresponding to edges[i].  They
                      represent the two directions of this edge.  The distance value from
                      edges[i] is also copied into the output edges.
                - else
                    - #out_edges contains one edge corresponding to edges[i] since this is
                      a self edge.  The distance value from edges[i] is also copied into
                      the output edge.
            - max_index_plus_one(edges) == max_index_plus_one(#out_edges) 
              (i.e. both graphs have the same number of nodes)
            - In all but the most trivial cases, we will have is_ordered_by_index(#out_edges) == false
            - contains_duplicate_pairs(#out_edges) == contains_duplicate_pairs(edges)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EDGE_LIST_GrAPHS_ABSTRACT_Hh_

