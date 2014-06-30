// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_PROJECTION_HASh_ABSTRACT_H__
#ifdef DLIB_PROJECTION_HASh_ABSTRACT_H__

#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class projection_hash
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a tool for hashing elements of a vector space into the integers.  
                It is intended to represent locality sensitive hashing functions such as 
                the popular random projection hashing method.
                
                In particular, it represents hash functions of the form:
                    hash bit 0 = sign(rowm(P*v + O,0))
                    hash bit 1 = sign(rowm(P*v + O,1))
                    hash bit 2 = sign(rowm(P*v + O,2))
                    ...
                Where v is the vector to be hashed.  The parameters of the projection
                hash are the P and O matrices.  
        !*/
    public:

        projection_hash(
        );
        /*!
            ensures
                - #get_projection_matrix().size() == 0
                - #get_offset_matrix().size() == 0
        !*/

        template <typename EXP1, typename EXP2>
        projection_hash(
            const matrix_exp<EXP1>& proj,
            const matrix_exp<EXP2>& offset
        ); 
        /*!
            requires
                - proj.nr() == offset.nr()
            ensures
                - #get_projection_matrix() == proj
                - #get_offset_matrix() == offset
        !*/

        const matrix<double>& get_projection_matrix (
        ) const;
        /*!
            ensures
                - returns the P matrix discussed above in the WHAT THIS OBJECT REPRESENTS
                  section.
        !*/

        const matrix<double,0,1>& get_offset_matrix (
        ) const; 
        /*!
            ensures
                - returns the O matrix discussed above in the WHAT THIS OBJECT REPRESENTS
                  section.
        !*/

        unsigned long num_hash_bins (
        ) const;
        /*!
            ensures
                - returns the number of possible outputs from this hashing function.
                - Specifically, returns: std::pow(2, get_offset_matrix().size())
        !*/

        template <typename EXP>
        unsigned long operator() (
            const matrix_exp<EXP>& v
        ) const;
        /*!
            requires
                - is_col_vector(v) == true
                - v.size() == get_projection_matrix().nc()
                - v.size() > 0
            ensures
                - hashes v into the range [0, num_hash_bins()) using the method
                  discussed in the WHAT THIS OBJECT REPRESENTS section.
        !*/
    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const projection_hash& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    void deserialize (
        projection_hash& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PROJECTION_HASh_ABSTRACT_H__

