// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EDGE_LIST_GrAPHS_Hh_
#define DLIB_EDGE_LIST_GrAPHS_Hh_

#include "edge_list_graphs_abstract.h"
#include <limits>
#include <vector>
#include "../string.h"
#include "../rand.h"
#include <algorithm>
#include "sample_pair.h"
#include "ordered_sample_pair.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_duplicate_edges (
        vector_type& pairs
    )
    {
        typedef typename vector_type::value_type T;
        if (pairs.size() > 0)
        {
            // sort pairs so that we can avoid duplicates in the loop below
            std::sort(pairs.begin(), pairs.end(), &order_by_index<T>);

            // now put edges into temp while avoiding duplicates
            vector_type temp;
            temp.reserve(pairs.size());
            temp.push_back(pairs[0]);
            for (unsigned long i = 1; i < pairs.size(); ++i)
            {
                if (pairs[i] != pairs[i-1])
                {
                    temp.push_back(pairs[i]);
                }
            }

            temp.swap(pairs);
        }
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename iterator>
        iterator iterator_of_worst (
            iterator begin,
            const iterator& end
        ) 
        /*!
            ensures
                - returns an iterator that points to the element in the given range 
                  that has the biggest distance 
        !*/
        {
            double dist = begin->distance();
            iterator worst = begin;
            for (; begin != end; ++begin)
            {
                if (begin->distance() > dist)
                {
                    dist = begin->distance();
                    worst = begin;
                }
            }

            return worst;
        }

    }

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
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( 0 < percent && percent <= 1 &&
                    num > 0,
            "\t void find_percent_shortest_edges_randomly()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t samples.size(): " << samples.size()
            << "\n\t percent:        " << percent 
            << "\n\t num:            " << num 
            );

        out.clear();

        if (samples.size() <= 1)
        {
            return;
        }

        std::vector<sample_pair, alloc> edges;
        edges.reserve(num);

        dlib::rand rnd;
        rnd.set_seed(cast_to_string(random_seed));

        // randomly sample a bunch of edges
        for (unsigned long i = 0; i < num; ++i)
        {
            const unsigned long idx1 = rnd.get_random_32bit_number()%samples.size();
            const unsigned long idx2 = rnd.get_random_32bit_number()%samples.size();
            if (idx1 != idx2)
            {
                const double dist = dist_funct(samples[idx1], samples[idx2]);
                if (dist < std::numeric_limits<double>::infinity())
                {
                    edges.push_back(sample_pair(idx1, idx2, dist));
                }
            }
        }


        // now put edges into out while avoiding duplicates
        if (edges.size() > 0)
        {
            remove_duplicate_edges(edges);

            // now sort all the edges by distance and take the percent with the smallest distance
            std::sort(edges.begin(), edges.end(), &order_by_distance<sample_pair>);

            const unsigned long out_size = std::min<unsigned long>((unsigned long)(num*percent), edges.size());
            out.assign(edges.begin(), edges.begin() + out_size);
        }
    }

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
        unsigned long num,
        const T& random_seed,
        std::vector<sample_pair, alloc>& out
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( num > 0 && k > 0,
            "\t void find_approximate_k_nearest_neighbors()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t samples.size(): " << samples.size()
            << "\n\t k:              " << k  
            << "\n\t num:            " << num 
            );

        out.clear();

        if (samples.size() <= 1)
        {
            return;
        }

        // we add each edge twice in the following loop.  So multiply num by 2 to account for that.
        num *= 2;

        std::vector<ordered_sample_pair> edges;
        edges.reserve(num);
        std::vector<sample_pair, alloc> temp;
        temp.reserve(num);

        dlib::rand rnd;
        rnd.set_seed(cast_to_string(random_seed));

        // randomly sample a bunch of edges
        for (unsigned long i = 0; i < num; ++i)
        {
            const unsigned long idx1 = rnd.get_random_32bit_number()%samples.size();
            const unsigned long idx2 = rnd.get_random_32bit_number()%samples.size();
            if (idx1 != idx2)
            {
                const double dist = dist_funct(samples[idx1], samples[idx2]);
                if (dist < std::numeric_limits<double>::infinity())
                {
                    edges.push_back(ordered_sample_pair(idx1, idx2, dist));
                    edges.push_back(ordered_sample_pair(idx2, idx1, dist));
                }
            }
        }

        std::sort(edges.begin(), edges.end(), &order_by_index<ordered_sample_pair>);

        std::vector<ordered_sample_pair>::iterator beg, itr;
        // now copy edges into temp when they aren't duplicates and also only move in the k shortest for
        // each index.
        itr = edges.begin();
        while (itr != edges.end())
        {
            // first find the bounding range for all the edges connected to node itr->index1()
            beg = itr; 
            while (itr != edges.end() && itr->index1() == beg->index1())
                ++itr;

            // If the node has more than k edges then sort them by distance so that
            // we will end up with the k best.
            if (static_cast<unsigned long>(itr - beg) > k)
            {
                std::sort(beg, itr, &order_by_distance_and_index<ordered_sample_pair>);
            }

            // take the k best unique edges from the range [beg,itr)
            temp.push_back(sample_pair(beg->index1(), beg->index2(), beg->distance()));
            unsigned long prev_index2 = beg->index2();
            ++beg;
            unsigned long count = 1;
            for (; beg != itr && count < k; ++beg)
            {
                if (beg->index2() != prev_index2)
                {
                    temp.push_back(sample_pair(beg->index1(), beg->index2(), beg->distance()));
                    ++count;
                }
                prev_index2 = beg->index2();
            }
        }


        remove_duplicate_edges(temp);
        temp.swap(out);
    }

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
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(k > 0,
            "\t void find_k_nearest_neighbors()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t samples.size(): " << samples.size()
            << "\n\t k:              " << k 
            );

        out.clear();

        if (samples.size() <= 1)
        {
            return;
        }

        using namespace impl;
        std::vector<sample_pair> edges;

        // Initialize all the edges to an edge with an invalid index
        edges.resize(samples.size()*k, 
                     sample_pair(samples.size(),samples.size(),std::numeric_limits<double>::infinity()));

        // Hold the length for the longest edge for each node.  Initially they are all infinity.
        std::vector<double> worst_dists(samples.size(), std::numeric_limits<double>::infinity());

        std::vector<sample_pair>::iterator begin_i, end_i, begin_j, end_j, itr;
        begin_i = edges.begin();
        end_i = begin_i + k;

        // Loop over all combinations of samples.   We will maintain the iterator ranges so that
        // within the inner for loop we have:
        //   [begin_i, end_i) == the range in edges that contains neighbors of samples[i]
        //   [begin_j, end_j) == the range in edges that contains neighbors of samples[j]
        for (unsigned long i = 0; i+1 < samples.size(); ++i)
        {
            begin_j = begin_i;
            end_j = end_i;

            for (unsigned long j = i+1; j < samples.size(); ++j)
            {
                begin_j += k;
                end_j += k;

                const double dist = dist_funct(samples[i], samples[j]);

                if (dist < worst_dists[i])
                {
                    *iterator_of_worst(begin_i, end_i) = sample_pair(i, j, dist);
                    worst_dists[i] = iterator_of_worst(begin_i, end_i)->distance();
                }

                if (dist < worst_dists[j])
                {
                    *iterator_of_worst(begin_j, end_j) = sample_pair(i, j, dist);
                    worst_dists[j] = iterator_of_worst(begin_j, end_j)->distance();
                }
            }

            begin_i += k;
            end_i += k;
        }

        // sort the edges so that duplicate edges will be adjacent
        std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

        // if the first edge is valid 
        if (edges[0].index1() < samples.size())
        {
            // now put edges into out while avoiding duplicates and any remaining invalid edges.
            out.reserve(edges.size());
            out.push_back(edges[0]);
            for (unsigned long i = 1; i < edges.size(); ++i)
            {
                // if we hit an invalid edge then we can stop
                if (edges[i].index1() >= samples.size())
                    break;

                // if this isn't a duplicate edge
                if (edges[i] != edges[i-1])
                {
                    out.push_back(edges[i]);
                }
            }
        }


    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    bool contains_duplicate_pairs (
        const vector_type& pairs
    )
    {
        typedef typename vector_type::value_type T;
        vector_type temp(pairs);
        std::sort(temp.begin(), temp.end(), &order_by_index<T>);

        for (unsigned long i = 1; i < temp.size(); ++i)
        {
            // if we found a duplicate
            if (temp[i-1] == temp[i])
                return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    typename enable_if_c<(is_same_type<sample_pair, typename vector_type::value_type>::value ||
                          is_same_type<ordered_sample_pair, typename vector_type::value_type>::value),
                          unsigned long>::type
    max_index_plus_one (
        const vector_type& pairs
    )
    {
        if (pairs.size() == 0)
        {
            return 0;
        }
        else
        {
            unsigned long max_idx = 0;
            for (unsigned long i = 0; i < pairs.size(); ++i)
            {
                if (pairs[i].index1() > max_idx)
                    max_idx = pairs[i].index1();
                if (pairs[i].index2() > max_idx)
                    max_idx = pairs[i].index2();
            }

            return max_idx + 1;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_long_edges (
        vector_type& pairs,
        double distance_threshold
    )
    {
        vector_type temp;
        temp.reserve(pairs.size());

        // add all the pairs shorter than the given threshold into temp
        for (unsigned long i = 0; i < pairs.size(); ++i)
        {
            if (pairs[i].distance() <= distance_threshold)
                temp.push_back(pairs[i]);
        }

        // move temp into the output vector
        temp.swap(pairs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_short_edges (
        vector_type& pairs,
        double distance_threshold
    )
    {
        vector_type temp;
        temp.reserve(pairs.size());

        // add all the pairs longer than the given threshold into temp
        for (unsigned long i = 0; i < pairs.size(); ++i)
        {
            if (pairs[i].distance() >= distance_threshold)
                temp.push_back(pairs[i]);
        }

        // move temp into the output vector
        temp.swap(pairs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_percent_longest_edges (
        vector_type& pairs,
        double percent 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( 0 <= percent && percent < 1,
            "\t void remove_percent_longest_edges()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t percent:        " << percent 
            );

        typedef typename vector_type::value_type T;
        std::sort(pairs.begin(), pairs.end(), &order_by_distance<T>);

        const unsigned long num = static_cast<unsigned long>((1.0-percent)*pairs.size());

        // pick out the num shortest pairs
        vector_type temp(pairs.begin(), pairs.begin() + num);

        // move temp into the output vector
        temp.swap(pairs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    void remove_percent_shortest_edges (
        vector_type& pairs,
        double percent 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( 0 <= percent && percent < 1,
            "\t void remove_percent_shortest_edges()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t percent:        " << percent 
            );

        typedef typename vector_type::value_type T;
        std::sort(pairs.rbegin(), pairs.rend(), &order_by_distance<T>);

        const unsigned long num = static_cast<unsigned long>((1.0-percent)*pairs.size());

        // pick out the num shortest pairs
        vector_type temp(pairs.begin(), pairs.begin() + num);

        // move temp into the output vector
        temp.swap(pairs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    bool is_ordered_by_index (
        const vector_type& edges
    )
    {
        for (unsigned long i = 1; i < edges.size(); ++i)
        {
            if (order_by_index(edges[i], edges[i-1]))
                return false;
        }
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename alloc1, 
        typename alloc2
        >
    void find_neighbor_ranges (
        const std::vector<ordered_sample_pair,alloc1>& edges,
        std::vector<std::pair<unsigned long, unsigned long>,alloc2>& neighbors
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_ordered_by_index(edges),
                    "\t void find_neighbor_ranges()"
                    << "\n\t Invalid inputs were given to this function"
        );


        // setup neighbors so that [neighbors[i].first, neighbors[i].second) is the range
        // within edges that contains all node i's edges.
        const unsigned long num_nodes = max_index_plus_one(edges);
        neighbors.assign(num_nodes, std::make_pair(0,0));
        unsigned long cur_node = 0;
        unsigned long start_idx = 0;
        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            if (edges[i].index1() != cur_node)
            {
                neighbors[cur_node] = std::make_pair(start_idx, i);
                start_idx = i;
                cur_node = edges[i].index1();
            }
        }
        if (neighbors.size() != 0)
            neighbors[cur_node] = std::make_pair(start_idx, (unsigned long)edges.size());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename alloc1, 
        typename alloc2
        >
    void convert_unordered_to_ordered (
        const std::vector<sample_pair,alloc1>& edges,
        std::vector<ordered_sample_pair,alloc2>& out_edges
    )
    {
        out_edges.clear();
        out_edges.reserve(edges.size()*2);
        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            out_edges.push_back(ordered_sample_pair(edges[i].index1(), edges[i].index2(), edges[i].distance()));
            if (edges[i].index1() != edges[i].index2())
                out_edges.push_back(ordered_sample_pair(edges[i].index2(), edges[i].index1(), edges[i].distance()));
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EDGE_LIST_GrAPHS_Hh_


