// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_Hh_
#define DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_Hh_

#include "nearest_neighbor_feature_image_abstract.h"
#include <vector>
#include "../algs.h"
#include "../matrix.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class nearest_neighbor_feature_image : noncopyable
    {
        /*!
            INITIAL VALUE
                - nn_feats.size() == 1

            CONVENTION
                - nn_feats.size() == 1

        !*/

    public:

        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        nearest_neighbor_feature_image (
        ); 

        void clear (
        );

        void copy_configuration (
            const feature_extractor& item
        );

        void copy_configuration (
            const nearest_neighbor_feature_image& item
        );

        template <
            typename image_type
            >
        inline void load (
            const image_type& img
        );

        inline unsigned long size (
        ) const;

        inline long nr (
        ) const;

        inline long nc (
        ) const;

        inline long get_num_dimensions (
        ) const;

        template <typename vector_type>
        void set_basis (
            const vector_type& new_basis
        );

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const;

        inline const rectangle get_block_rect (
            long row,
            long col
        ) const;

        inline const point image_to_feat_space (
            const point& p
        ) const;

        inline const rectangle image_to_feat_space (
            const rectangle& rect
        ) const;

        inline const point feat_to_image_space (
            const point& p
        ) const;

        inline const rectangle feat_to_image_space (
            const rectangle& rect
        ) const;

        template <typename T>
        friend void serialize (
            const nearest_neighbor_feature_image<T>& item,
            std::ostream& out
        );

        template <typename T>
        friend void deserialize (
            nearest_neighbor_feature_image<T>& item,
            std::istream& in 
        );

    private:

        array2d<unsigned long> feats;
        feature_extractor fe;
        std::vector<typename feature_extractor::descriptor_type> basis;

        // This is a transient variable.  It is just here so it doesn't have to be
        // reallocated over and over inside operator()
        mutable descriptor_type nn_feats;

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const nearest_neighbor_feature_image<T>& item,
        std::ostream& out
    )
    {
        serialize(item.feats, out);
        serialize(item.fe, out);
        serialize(item.basis, out);
    }

    template <typename T>
    void deserialize (
        nearest_neighbor_feature_image<T>& item,
        std::istream& in 
    )
    {
        deserialize(item.feats, in);
        deserialize(item.fe, in);
        deserialize(item.basis, in);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                        nearest_neighbor_feature_image member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    nearest_neighbor_feature_image<feature_extractor>::
    nearest_neighbor_feature_image (
    )  
    {
        nn_feats.resize(1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void nearest_neighbor_feature_image<feature_extractor>::
    clear (
    )
    {
        feats.clear();
        fe.clear();
        basis.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void nearest_neighbor_feature_image<feature_extractor>::
    copy_configuration (
        const feature_extractor& item
    )
    {
        fe.copy_configuration(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void nearest_neighbor_feature_image<feature_extractor>::
    copy_configuration (
        const nearest_neighbor_feature_image& item
    )
    {
        fe.copy_configuration(item.fe);
        basis = item.basis;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    template <
        typename image_type
        >
    void nearest_neighbor_feature_image<feature_extractor>::
    load (
        const image_type& img
    )
    {
        fe.load(img);

        feats.set_size(fe.nr(), fe.nc());

        // find the nearest neighbor for each feature vector and store the
        // result in feats.
        for (long r = 0; r < feats.nr(); ++r)
        {
            for (long c = 0; c < feats.nc(); ++c)
            {
                const typename feature_extractor::descriptor_type& local_feat = fe(r,c);

                double best_dist = std::numeric_limits<double>::infinity();
                unsigned long best_idx = 0;
                for (unsigned long i = 0; i < basis.size(); ++i)
                {
                    double dist = length_squared(local_feat - basis[i]);
                    if (dist < best_dist)
                    {
                        best_dist = dist;
                        best_idx = i;
                    }
                }

                feats[r][c] = best_idx;
            }
        }

        fe.unload();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    unsigned long nearest_neighbor_feature_image<feature_extractor>::
    size (
    ) const
    {
        return feats.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    long nearest_neighbor_feature_image<feature_extractor>::
    nr (
    ) const
    {
        return feats.nr();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    long nearest_neighbor_feature_image<feature_extractor>::
    nc (
    ) const
    {
        return feats.nc();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    long nearest_neighbor_feature_image<feature_extractor>::
    get_num_dimensions (
    ) const
    {
        return basis.size();
    }

// ----------------------------------------------------------------------------------------

    template <typename feature_extractor>
    template <typename vector_type>
    void nearest_neighbor_feature_image<feature_extractor>::
    set_basis (
        const vector_type& new_basis
    )
    {
        basis.assign(new_basis.begin(), new_basis.end());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const typename nearest_neighbor_feature_image<feature_extractor>::descriptor_type& 
    nearest_neighbor_feature_image<feature_extractor>::
    operator() (
        long row,
        long col
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 <= row && row < nr() &&
                    0 <= col && col < nc(),
            "\t descriptor_type nearest_neighbor_feature_image::operator(row,col)"
            << "\n\t Invalid inputs were given to this function"
            << "\n\t row:  " << row
            << "\n\t col:  " << col 
            << "\n\t nr(): " << nr()
            << "\n\t nc(): " << nc()
            << "\n\t this: " << this
            );

        nn_feats[0] = std::make_pair(feats[row][col],1);
        return nn_feats;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const rectangle nearest_neighbor_feature_image<feature_extractor>::
    get_block_rect (
        long row,
        long col
    ) const
    {
        return fe.get_block_rect(row,col);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const point nearest_neighbor_feature_image<feature_extractor>::
    image_to_feat_space (
        const point& p
    ) const
    {
        return fe.image_to_feat_space(p);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const rectangle nearest_neighbor_feature_image<feature_extractor>::
    image_to_feat_space (
        const rectangle& rect
    ) const
    {
        return fe.image_to_feat_space(rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const point nearest_neighbor_feature_image<feature_extractor>::
    feat_to_image_space (
        const point& p
    ) const
    {
        return fe.feat_to_image_space(p);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    const rectangle nearest_neighbor_feature_image<feature_extractor>::
    feat_to_image_space (
        const rectangle& rect
    ) const 
    {
        return fe.feat_to_image_space(rect);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_NEAREST_NEIGHBOR_FeATURE_IMAGE_Hh_


