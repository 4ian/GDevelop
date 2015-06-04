// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LSH_HAShES_ABSTRACT_Hh_
#ifdef DLIB_LSH_HAShES_ABSTRACT_Hh_

#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class hash_similar_angles_64
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for computing locality sensitive hashes that give
                vectors with small angles between each other similar hash values.  In
                particular, this object creates 64 random planes which pass though the
                origin and uses them to create a 64bit hash.  To compute the hash for a new
                vector, this object checks which side of each plane the vector falls on and
                records this information into a 64bit integer.  
        !*/

    public:

        hash_similar_angles_64 (
        ); 
        /*!
            ensures
                - #get_seed() == 0
        !*/

        hash_similar_angles_64 (
            const uint64 seed
        );
        /*!
            ensures
                - #get_seed() == seed
        !*/

        uint64 get_seed (
        ) const;
        /*!
            ensures
                - returns the random seed used to generate the random planes used for
                  hashing.
        !*/

        typedef uint64 result_type;

        template <typename vector_type>
        result_type perator() (
            const vector_type& v
        ) const;
        /*!
            requires
                - v is an unsorted sparse vector or a dlib matrix representing either a
                  column or row vector.
            ensures
                - returns a 64 bit hash of the input vector v.  The bits in the hash record
                  which side of each random plane v falls on.  

        !*/

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const;
        /*!
            ensures
                - returns the Hamming distance between the two hashes given to this
                  function.  That is, we return the number of bits in a and b which differ.
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct hash_similar_angles_128
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for computing locality sensitive hashes that give
                vectors with small angles between each other similar hash values.  In
                particular, this object creates 128 random planes which pass though the
                origin and uses them to create a 128bit hash.  To compute the hash for a new
                vector, this object checks which side of each plane the vector falls on and
                records this information into a 128bit integer.  
        !*/

    public:

        hash_similar_angles_128 (
        ); 
        /*!
            ensures
                - #get_seed() == 0
        !*/

        hash_similar_angles_128 (
            const uint64 seed
        );
        /*!
            ensures
                - #get_seed() == seed
        !*/

        uint64 get_seed (
        ) const;
        /*!
            ensures
                - returns the random seed used to generate the random planes used for
                  hashing.
        !*/

        typedef std::pair<uint64,uint64> result_type;

        template <typename vector_type>
        result_type perator() (
            const vector_type& v
        ) const;
        /*!
            requires
                - v is an unsorted sparse vector or a dlib matrix representing either a
                  column or row vector.
            ensures
                - returns a 128 bit hash of the input vector v.  The bits in the hash record
                  which side of each random plane v falls on.  

        !*/

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const;
        /*!
            ensures
                - returns the Hamming distance between the two hashes given to this
                  function.  That is, we return the number of bits in a and b which differ.
        !*/

    };

// ----------------------------------------------------------------------------------------

    struct hash_similar_angles_256
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for computing locality sensitive hashes that give
                vectors with small angles between each other similar hash values.  In
                particular, this object creates 256 random planes which pass though the
                origin and uses them to create a 256bit hash.  To compute the hash for a new
                vector, this object checks which side of each plane the vector falls on and
                records this information into a 256bit integer.  
        !*/

    public:

        hash_similar_angles_256 (
        ); 
        /*!
            ensures
                - #get_seed() == 0
        !*/

        hash_similar_angles_256 (
            const uint64 seed
        );
        /*!
            ensures
                - #get_seed() == seed
        !*/

        uint64 get_seed (
        ) const;
        /*!
            ensures
                - returns the random seed used to generate the random planes used for
                  hashing.
        !*/

        typedef std::pair<uint64,uint64> hash128_type;
        typedef std::pair<hash128_type,hash128_type> result_type;

        template <typename vector_type>
        result_type perator() (
            const vector_type& v
        ) const;
        /*!
            requires
                - v is an unsorted sparse vector or a dlib matrix representing either a
                  column or row vector.
            ensures
                - returns a 256 bit hash of the input vector v.  The bits in the hash record
                  which side of each random plane v falls on.  

        !*/

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const;
        /*!
            ensures
                - returns the Hamming distance between the two hashes given to this
                  function.  That is, we return the number of bits in a and b which differ.
        !*/

    };

// ----------------------------------------------------------------------------------------

    struct hash_similar_angles_512
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for computing locality sensitive hashes that give
                vectors with small angles between each other similar hash values.  In
                particular, this object creates 512 random planes which pass though the
                origin and uses them to create a 512bit hash.  To compute the hash for a new
                vector, this object checks which side of each plane the vector falls on and
                records this information into a 512bit integer.  
        !*/

    public:

        hash_similar_angles_512 (
        ); 
        /*!
            ensures
                - #get_seed() == 0
        !*/

        hash_similar_angles_512 (
            const uint64 seed
        );
        /*!
            ensures
                - #get_seed() == seed
        !*/

        uint64 get_seed (
        ) const;
        /*!
            ensures
                - returns the random seed used to generate the random planes used for
                  hashing.
        !*/

        typedef hash_similar_angles_256::result_type hash256_type;
        typedef std::pair<hash256_type,hash256_type> result_type;

        template <typename vector_type>
        result_type perator() (
            const vector_type& v
        ) const;
        /*!
            requires
                - v is an unsorted sparse vector or a dlib matrix representing either a
                  column or row vector.
            ensures
                - returns a 512 bit hash of the input vector v.  The bits in the hash record
                  which side of each random plane v falls on.  

        !*/

        unsigned int distance (
            const result_type& a,
            const result_type& b
        ) const;
        /*!
            ensures
                - returns the Hamming distance between the two hashes given to this
                  function.  That is, we return the number of bits in a and b which differ.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LSH_HAShES_ABSTRACT_Hh_


