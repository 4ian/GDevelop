// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LSH_HAShES_Hh_
#define DLIB_LSH_HAShES_Hh_

#include "hashes_abstract.h"
#include "../hash.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class hash_similar_angles_64
    {
    public:
        hash_similar_angles_64 (
        ) : seed(0) {}

        hash_similar_angles_64 (
            const uint64 seed_ 
        ) : seed(seed_) {}

        uint64 get_seed (
        ) const { return seed; }


        typedef uint64 result_type;

        template <
            typename sparse_vector_type
            >
        typename disable_if<is_matrix<sparse_vector_type>,uint64>::type operator() (
            const sparse_vector_type& v
        ) const
        {
            typedef typename sparse_vector_type::value_type::second_type scalar_type;

            uint64 temp = 0;
            for (int i = 0; i < 64; ++i)
            {
                // compute the dot product between v and a Gaussian random vector.
                scalar_type val = 0;
                for (typename sparse_vector_type::const_iterator j = v.begin(); j != v.end(); ++j)
                    val += j->second*gaussian_random_hash(j->first, i, seed);

                if (val > 0)
                    temp |= 1;
                temp <<= 1;
            }
            return temp;
        }

        template <typename EXP>
        uint64 operator() ( 
            const matrix_exp<EXP>& v
        ) const
        {
            typedef typename EXP::type T;
            uint64 temp = 0;
            for (unsigned long i = 0; i < 64; ++i)
            {
                if (dot(matrix_cast<T>(gaussian_randm(v.size(),1,i+seed*64)), v) > 0)
                    temp |= 1;
                temp <<= 1;
            }
            return temp;
        }

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const
        {
            return hamming_distance(a,b);
        }

    private:
        const uint64 seed;
    };

// ----------------------------------------------------------------------------------------

    class hash_similar_angles_128
    {
    public:
        hash_similar_angles_128 (
        ) : seed(0),hasher1(0), hasher2(1) {}

        hash_similar_angles_128 (
            const uint64 seed_
        ) : seed(seed_),hasher1(2*seed),hasher2(2*seed+1) {}

        uint64 get_seed (
        ) const { return seed; }

        typedef std::pair<uint64,uint64> result_type;

        template <
            typename vector_type 
            >
        result_type operator() (
            const vector_type& v
        ) const
        {
            return std::make_pair(hasher1(v), hasher2(v));
        }

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const
        {
            return hamming_distance(a.first,b.first) + 
                   hamming_distance(a.second,b.second);
        }

    private:
        const uint64 seed;
        hash_similar_angles_64 hasher1;
        hash_similar_angles_64 hasher2;

    };

// ----------------------------------------------------------------------------------------

    class hash_similar_angles_256
    {
    public:
        hash_similar_angles_256 (
        ) : seed(0), hasher1(0), hasher2(1) {}

        hash_similar_angles_256 (
            const uint64 seed_
        ) : seed(seed_),hasher1(2*seed),hasher2(2*seed+1) {}

        uint64 get_seed (
        ) const { return seed; }

        typedef std::pair<uint64,uint64> hash128_type;
        typedef std::pair<hash128_type,hash128_type> result_type;

        template <
            typename vector_type 
            >
        result_type operator() (
            const vector_type& v
        ) const
        {
            return std::make_pair(hasher1(v), hasher2(v));
        }

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const
        {
            return hasher1.distance(a.first,b.first) + 
                   hasher1.distance(a.second,b.second);
        }

    private:
        const uint64 seed;
        hash_similar_angles_128 hasher1;
        hash_similar_angles_128 hasher2;

    };

// ----------------------------------------------------------------------------------------

    class hash_similar_angles_512
    {
    public:
        hash_similar_angles_512 (
        ) : seed(0), hasher1(0), hasher2(1) {}

        hash_similar_angles_512 (
            const uint64 seed_
        ) : seed(seed_),hasher1(2*seed),hasher2(2*seed+1) {}

        uint64 get_seed (
        ) const { return seed; }


        typedef hash_similar_angles_256::result_type hash256_type;
        typedef std::pair<hash256_type,hash256_type> result_type;

        template <
            typename vector_type 
            >
        result_type operator() (
            const vector_type& v
        ) const
        {
            return std::make_pair(hasher1(v), hasher2(v));
        }

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const
        {
            return hasher1.distance(a.first,b.first) + 
                   hasher1.distance(a.second,b.second);
        }

    private:
        const uint64 seed;
        hash_similar_angles_256 hasher1;
        hash_similar_angles_256 hasher2;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LSH_HAShES_Hh_

