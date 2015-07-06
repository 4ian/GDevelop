// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_Hh_
#define DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_Hh_

#include "find_k_nearest_neighbors_lsh_abstract.h"
#include "../threads.h"
#include "../lsh/hashes.h"
#include <vector>
#include <queue>
#include "sample_pair.h"
#include "edge_list_graphs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        struct compare_sample_pair_with_distance 
        {
            inline bool operator() (const sample_pair& a, const sample_pair& b) const
            { 
                return a.distance() < b.distance();
            }
        };

        template <
            typename vector_type,
            typename hash_function_type
            >
        class hash_block
        {
        public:
            hash_block(
                const vector_type& samples_,
                const hash_function_type& hash_funct_,
                std::vector<typename hash_function_type::result_type>& hashes_
            ) : 
                samples(samples_),
                hash_funct(hash_funct_),
                hashes(hashes_)
            {}

            void operator() (long i) const
            {
                hashes[i] = hash_funct(samples[i]);
            }

            const vector_type& samples;
            const hash_function_type& hash_funct;
            std::vector<typename hash_function_type::result_type>& hashes;
        };

        template <
            typename vector_type,
            typename distance_function_type,
            typename hash_function_type,
            typename alloc
            >
        class scan_find_k_nearest_neighbors_lsh
        {
        public:
            scan_find_k_nearest_neighbors_lsh (
                const vector_type& samples_,
                const distance_function_type& dist_funct_,
                const hash_function_type& hash_funct_,
                const unsigned long k_,
                std::vector<sample_pair, alloc>& edges_,
                const unsigned long k_oversample_,
                const std::vector<typename hash_function_type::result_type>& hashes_
            ) :
                samples(samples_),
                dist_funct(dist_funct_),
                hash_funct(hash_funct_),
                k(k_),
                edges(edges_),
                k_oversample(k_oversample_),
                hashes(hashes_)
            {
                edges.clear();
                edges.reserve(samples.size()*k/2);
            }

            mutex m;
            const vector_type& samples;
            const distance_function_type& dist_funct;
            const hash_function_type& hash_funct;
            const unsigned long k;
            std::vector<sample_pair, alloc>& edges;
            const unsigned long k_oversample;
            const std::vector<typename hash_function_type::result_type>& hashes;

            void operator() (unsigned long i) const
            {
                const unsigned long k_hash = k*k_oversample;

                std::priority_queue<std::pair<unsigned long, unsigned long> > best_hashes;
                std::priority_queue<sample_pair, std::vector<sample_pair>, dlib::impl::compare_sample_pair_with_distance> best_samples;
                unsigned long worst_distance = std::numeric_limits<unsigned long>::max();
                // scan over the hashes and find the best matches for hashes[i]
                for (unsigned long j = 0; j < hashes.size(); ++j)
                {
                    if (i == j) 
                        continue;

                    const unsigned long dist = hash_funct.distance(hashes[i], hashes[j]);
                    if (dist < worst_distance || best_hashes.size() < k_hash)
                    {
                        if (best_hashes.size() >= k_hash)
                            best_hashes.pop();
                        best_hashes.push(std::make_pair(dist, j));
                        worst_distance = best_hashes.top().first;
                    }
                }

                // Now figure out which of the best_hashes are actually the k best matches
                // according to dist_funct()
                while (best_hashes.size() != 0)
                {
                    const unsigned long j = best_hashes.top().second;
                    best_hashes.pop();

                    const double dist = dist_funct(samples[i], samples[j]);
                    if (dist < std::numeric_limits<double>::infinity())
                    {
                        if (best_samples.size() >= k)
                            best_samples.pop();
                        best_samples.push(sample_pair(i,j,dist));
                    }
                }

                // Finally, now put the k best matches according to dist_funct() into edges
                auto_mutex lock(m);
                while (best_samples.size() != 0)
                {
                    edges.push_back(best_samples.top());
                    best_samples.pop();
                }
            }
        };

    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename hash_function_type
        >
    void hash_samples (
        const vector_type& samples,
        const hash_function_type& hash_funct,
        const unsigned long num_threads,
        std::vector<typename hash_function_type::result_type>& hashes
    )
    {
        hashes.resize(samples.size());

        typedef impl::hash_block<vector_type,hash_function_type> block_type;
        block_type temp(samples, hash_funct, hashes);
        parallel_for(num_threads, 0, samples.size(), temp);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename distance_function_type,
        typename hash_function_type,
        typename alloc
        >
    void find_k_nearest_neighbors_lsh (
        const vector_type& samples,
        const distance_function_type& dist_funct,
        const hash_function_type& hash_funct,
        const unsigned long k,
        const unsigned long num_threads,
        std::vector<sample_pair, alloc>& edges,
        const unsigned long k_oversample = 20 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(k > 0 && k_oversample > 0,
            "\t void find_k_nearest_neighbors_lsh()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t samples.size(): " << samples.size()
            << "\n\t k:              " << k 
            << "\n\t k_oversample:   " << k_oversample 
            );

        edges.clear();

        if (samples.size() <= 1)
        {
            return;
        }

        typedef typename hash_function_type::result_type hash_type;
        std::vector<hash_type> hashes;
        hash_samples(samples, hash_funct, num_threads, hashes);

        typedef impl::scan_find_k_nearest_neighbors_lsh<vector_type, distance_function_type,hash_function_type,alloc> scan_type;
        scan_type temp(samples, dist_funct, hash_funct, k, edges, k_oversample, hashes);
        parallel_for(num_threads, 0, hashes.size(), temp);

        remove_duplicate_edges(edges);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_Hh_


