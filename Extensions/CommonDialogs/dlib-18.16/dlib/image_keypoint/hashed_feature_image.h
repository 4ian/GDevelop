// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASHED_IMAGE_FEATUrES_Hh_
#define DLIB_HASHED_IMAGE_FEATUrES_Hh_

#include "../lsh/projection_hash.h"
#include "hashed_feature_image_abstract.h"
#include <vector>
#include "../algs.h"
#include "../matrix.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type_ = projection_hash
        >
    class hashed_feature_image : noncopyable
    {

    public:
        typedef feature_extractor feature_extractor_type;
        typedef hash_function_type_ hash_function_type;

        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        hashed_feature_image (
        ); 

        void clear (
        );

        void set_hash (
            const hash_function_type& hash_
        );

        const hash_function_type& get_hash (
        ) const;

        void copy_configuration (
            const feature_extractor& item
        );

        void copy_configuration (
            const hashed_feature_image& item
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

        void use_relative_feature_weights (
        );

        void use_uniform_feature_weights (
        );

        bool uses_uniform_feature_weights (
        ) const;

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
            const hashed_feature_image<T>& item,
            std::ostream& out
        );

        template <typename T>
        friend void deserialize (
            hashed_feature_image<T>& item,
            std::istream& in 
        );

    private:

        array2d<unsigned long> feats;
        feature_extractor fe;
        hash_function_type phash;
        std::vector<float> feat_counts;
        bool uniform_feature_weights;


        // This is a transient variable.  It is just here so it doesn't have to be
        // reallocated over and over inside operator()
        mutable descriptor_type hash_feats;

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const hashed_feature_image<T>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.feats, out);
        serialize(item.fe, out);
        serialize(item.phash, out);
        serialize(item.feat_counts, out);
        serialize(item.uniform_feature_weights, out);
    }

    template <typename T>
    void deserialize (
        hashed_feature_image<T>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unexpected version found while deserializing a dlib::hashed_feature_image object.");

        deserialize(item.feats, in);
        deserialize(item.fe, in);
        deserialize(item.phash, in);
        deserialize(item.feat_counts, in);
        deserialize(item.uniform_feature_weights, in);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                        hashed_feature_image member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    hashed_feature_image<feature_extractor,hash_function_type>::
    hashed_feature_image (
    )  
    {
        clear();
        hash_feats.resize(1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    clear (
    )
    {
        fe.clear();
        phash = hash_function_type();
        feats.clear();
        feat_counts.clear();
        uniform_feature_weights = false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    set_hash (
        const hash_function_type& hash_
    )
    {
        phash = hash_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const hash_function_type& hashed_feature_image<feature_extractor,hash_function_type>::
    get_hash (
    ) const
    {
        return phash;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    copy_configuration (
        const feature_extractor& item
    )
    {
        fe.copy_configuration(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    copy_configuration (
        const hashed_feature_image& item
    )
    {
        fe.copy_configuration(item.fe);
        phash = item.phash;
        uniform_feature_weights = item.uniform_feature_weights;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    template <
        typename image_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    load (
        const image_type& img
    )
    {
        fe.load(img);

        if (fe.size() != 0)
        {
            feats.set_size(fe.nr(), fe.nc());
            feat_counts.assign(phash.num_hash_bins(),1);
            if (uniform_feature_weights)
            {
                for (long r = 0; r < feats.nr(); ++r)
                {
                    for (long c = 0; c < feats.nc(); ++c)
                    {
                        feats[r][c] = phash(fe(r,c));
                    }
                }
            }
            else
            {
                for (long r = 0; r < feats.nr(); ++r)
                {
                    for (long c = 0; c < feats.nc(); ++c)
                    {
                        feats[r][c] = phash(fe(r,c));
                        feat_counts[feats[r][c]]++;
                    }
                }
            }
        }
        else
        {
            feats.set_size(0,0);
        }

        if (!uniform_feature_weights)
        {
            // use the inverse frequency as the scale for each feature.  We also scale
            // these counts so that they are invariant to the size of the image (we scale
            // them so they all look like they come from a 500x400 images).
            const double scale = image_size(img)/(500.0*400.0);
            for (unsigned long i = 0; i < feat_counts.size(); ++i)
            {
                feat_counts[i] = scale/feat_counts[i];
            }
        }

        fe.unload();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    unsigned long hashed_feature_image<feature_extractor,hash_function_type>::
    size (
    ) const
    {
        return feats.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    long hashed_feature_image<feature_extractor,hash_function_type>::
    nr (
    ) const
    {
        return feats.nr();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    long hashed_feature_image<feature_extractor,hash_function_type>::
    nc (
    ) const
    {
        return feats.nc();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    long hashed_feature_image<feature_extractor,hash_function_type>::
    get_num_dimensions (
    ) const
    {
        return phash.num_hash_bins();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    use_relative_feature_weights (
    ) 
    {
        uniform_feature_weights = false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void hashed_feature_image<feature_extractor,hash_function_type>::
    use_uniform_feature_weights (
    ) 
    {
        uniform_feature_weights = true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    bool hashed_feature_image<feature_extractor,hash_function_type>::
    uses_uniform_feature_weights (
    ) const
    {
        return uniform_feature_weights;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const std::vector<std::pair<unsigned int,double> >& hashed_feature_image<feature_extractor,hash_function_type>::
    operator() (
        long row,
        long col
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 <= row && row < nr() &&
                    0 <= col && col < nc(),
            "\t descriptor_type hashed_feature_image::operator(row,col)"
            << "\n\t Invalid inputs were given to this function"
            << "\n\t row:  " << row
            << "\n\t col:  " << col 
            << "\n\t nr(): " << nr()
            << "\n\t nc(): " << nc()
            << "\n\t this: " << this
            );

        hash_feats[0] = std::make_pair(feats[row][col],feat_counts[feats[row][col]]);
        return hash_feats;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const rectangle hashed_feature_image<feature_extractor,hash_function_type>::
    get_block_rect (
        long row,
        long col
    ) const
    {
        return fe.get_block_rect(row,col);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const point hashed_feature_image<feature_extractor,hash_function_type>::
    image_to_feat_space (
        const point& p
    ) const
    {
        return fe.image_to_feat_space(p);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const rectangle hashed_feature_image<feature_extractor,hash_function_type>::
    image_to_feat_space (
        const rectangle& rect
    ) const
    {
        return fe.image_to_feat_space(rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const point hashed_feature_image<feature_extractor,hash_function_type>::
    feat_to_image_space (
        const point& p
    ) const
    {
        return fe.feat_to_image_space(p);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const rectangle hashed_feature_image<feature_extractor,hash_function_type>::
    feat_to_image_space (
        const rectangle& rect
    ) const 
    {
        return fe.feat_to_image_space(rect);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASHED_IMAGE_FEATUrES_Hh_


