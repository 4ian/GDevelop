// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINNED_VECTOR_IMAGE_FEATUrES_Hh_
#define DLIB_BINNED_VECTOR_IMAGE_FEATUrES_Hh_

#include "../lsh/projection_hash.h"
#include "binned_vector_feature_image_abstract.h"
#include <vector>
#include "../algs.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type_ = projection_hash
        >
    class binned_vector_feature_image : noncopyable
    {

    public:
        typedef feature_extractor feature_extractor_type;
        typedef hash_function_type_ hash_function_type;

        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        binned_vector_feature_image (
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
            const binned_vector_feature_image& item
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
            const binned_vector_feature_image<T>& item,
            std::ostream& out
        );

        template <typename T>
        friend void deserialize (
            binned_vector_feature_image<T>& item,
            std::istream& in 
        );

    private:

        array2d<descriptor_type> feats;
        feature_extractor fe;
        hash_function_type phash;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const binned_vector_feature_image<T>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.feats, out);
        serialize(item.fe, out);
        serialize(item.phash, out);
    }

    template <typename T>
    void deserialize (
        binned_vector_feature_image<T>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw dlib::serialization_error("Unexpected version found while deserializing dlib::binned_vector_feature_image");
        deserialize(item.feats, in);
        deserialize(item.fe, in);
        deserialize(item.phash, in);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                        binned_vector_feature_image member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    binned_vector_feature_image<feature_extractor,hash_function_type>::
    binned_vector_feature_image (
    )  
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void binned_vector_feature_image<feature_extractor,hash_function_type>::
    clear (
    )
    {
        fe.clear();
        phash = hash_function_type();
        feats.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    void binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    const hash_function_type& binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    void binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    void binned_vector_feature_image<feature_extractor,hash_function_type>::
    copy_configuration (
        const binned_vector_feature_image& item
    )
    {
        fe.copy_configuration(item.fe);
        phash = item.phash;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    template <
        typename image_type
        >
    void binned_vector_feature_image<feature_extractor,hash_function_type>::
    load (
        const image_type& img
    )
    {
        fe.load(img);

        if (fe.size() != 0)
        {
            feats.set_size(fe.nr(), fe.nc());
            for (long r = 0; r < feats.nr(); ++r)
            {
                for (long c = 0; c < feats.nc(); ++c)
                {
                    feats[r][c].clear();
                    feats[r][c].reserve(fe.get_num_dimensions()+1);
                    const typename feature_extractor::descriptor_type& des = fe(r,c);
                    const unsigned long idx = phash(des);
                    const unsigned long offset = idx*(fe.get_num_dimensions()+1);

                    for (long i = 0; i < des.size(); ++i)
                    {
                        feats[r][c].push_back(std::make_pair(offset + i, des(i)));
                    }
                    feats[r][c].push_back(std::make_pair(offset + des.size(), 1.0));
                }
            }
        }
        else
        {
            feats.set_size(0,0);
        }

        fe.unload();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    unsigned long binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    long binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    long binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    long binned_vector_feature_image<feature_extractor,hash_function_type>::
    get_num_dimensions (
    ) const
    {
        return phash.num_hash_bins()*(fe.get_num_dimensions()+1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const std::vector<std::pair<unsigned int,double> >& binned_vector_feature_image<feature_extractor,hash_function_type>::
    operator() (
        long row,
        long col
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 <= row && row < nr() &&
                    0 <= col && col < nc(),
            "\t descriptor_type binned_vector_feature_image::operator(row,col)"
            << "\n\t Invalid inputs were given to this function"
            << "\n\t row:  " << row
            << "\n\t col:  " << col 
            << "\n\t nr(): " << nr()
            << "\n\t nc(): " << nc()
            << "\n\t this: " << this
            );

        return feats[row][col];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor,
        typename hash_function_type
        >
    const rectangle binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    const point binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    const rectangle binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    const point binned_vector_feature_image<feature_extractor,hash_function_type>::
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
    const rectangle binned_vector_feature_image<feature_extractor,hash_function_type>::
    feat_to_image_space (
        const rectangle& rect
    ) const 
    {
        return fe.feat_to_image_space(rect);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BINNED_VECTOR_IMAGE_FEATUrES_Hh_


