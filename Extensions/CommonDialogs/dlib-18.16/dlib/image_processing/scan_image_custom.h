// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_IMAGE_CuSTOM_Hh_
#define DLIB_SCAN_IMAGE_CuSTOM_Hh_

#include "scan_image_custom_abstract.h"
#include "../matrix.h"
#include "../geometry.h"
#include <vector>
#include "../image_processing/full_object_detection.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    class scan_image_custom : noncopyable
    {

    public:

        typedef matrix<double,0,1> feature_vector_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_image_custom (
        );  

        template <
            typename image_type
            >
        void load (
            const image_type& img
        );

        inline bool is_loaded_with_image (
        ) const;

        inline void copy_configuration(
            const feature_extractor_type& fe
        );

        const Feature_extractor_type& get_feature_extractor (
        ) const { return feats; }

        inline void copy_configuration (
            const scan_image_custom& item
        );

        inline long get_num_dimensions (
        ) const;

        void detect (
            const feature_vector_type& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const;

        void get_feature_vector (
            const full_object_detection& obj,
            feature_vector_type& psi
        ) const;

        full_object_detection get_full_object_detection (
            const rectangle& rect,
            const feature_vector_type& w
        ) const;

        const rectangle get_best_matching_rect (
            const rectangle& rect
        ) const;

        inline unsigned long get_num_detection_templates (
        ) const { return 1; }

        inline unsigned long get_num_movable_components_per_detection_template (
        ) const { return 0; }

        template <typename T>
        friend void serialize (
            const scan_image_custom<T>& item,
            std::ostream& out
        );

        template <typename T>
        friend void deserialize (
            scan_image_custom<T>& item,
            std::istream& in 
        );

    private:
        static bool compare_pair_rect (
            const std::pair<double, rectangle>& a,
            const std::pair<double, rectangle>& b
        )
        {
            return a.first < b.first;
        }


        DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(
            has_compute_object_score,
            double, 
            compute_object_score,
            ( const matrix<double,0,1>& w, const rectangle& obj) const
        );

        template <typename fe_type>
        typename enable_if<has_compute_object_score<fe_type> >::type compute_all_rect_scores (
            const fe_type& feats,
            const feature_vector_type& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const
        {
            for (unsigned long i = 0; i < search_rects.size(); ++i)
            {
                const double score = feats.compute_object_score(w, search_rects[i]);
                if (score >= thresh)
                {
                    dets.push_back(std::make_pair(score, search_rects[i]));
                }
            }
        }

        template <typename fe_type>
        typename disable_if<has_compute_object_score<fe_type> >::type compute_all_rect_scores (
            const fe_type& feats,
            const feature_vector_type& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const
        {
            matrix<double,0,1> psi(w.size());
            psi = 0;
            double prev_dot = 0;
            for (unsigned long i = 0; i < search_rects.size(); ++i)
            {
                // Reset these back to zero every so often to avoid the accumulation of
                // rounding error.  Note that the only reason we do this loop in this
                // complex way is to avoid needing to zero the psi vector every iteration.
                if ((i%500) == 499)
                {
                    psi = 0;
                    prev_dot = 0;
                }

                feats.get_feature_vector(search_rects[i], psi);
                const double cur_dot = dot(psi, w);
                const double score = cur_dot - prev_dot;
                if (score >= thresh)
                {
                    dets.push_back(std::make_pair(score, search_rects[i]));
                }
                prev_dot = cur_dot;
            }
        }


        feature_extractor_type feats;
        std::vector<rectangle> search_rects;
        bool loaded_with_image;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const scan_image_custom<T>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.feats, out);
        serialize(item.search_rects, out);
        serialize(item.loaded_with_image, out);
        serialize(item.get_num_dimensions(), out);
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void deserialize (
        scan_image_custom<T>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unsupported version found when deserializing a scan_image_custom object.");

        deserialize(item.feats, in);
        deserialize(item.search_rects, in);
        deserialize(item.loaded_with_image, in);

        // When developing some feature extractor, it's easy to accidentally change its
        // number of dimensions and then try to deserialize data from an older version of
        // your extractor into the current code.  This check is here to catch that kind of
        // user error.
        long dims;
        deserialize(dims, in);
        if (item.get_num_dimensions() != dims)
            throw serialization_error("Number of dimensions in serialized scan_image_custom doesn't match the expected number.");
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                         scan_image_custom member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    scan_image_custom<Feature_extractor_type>::
    scan_image_custom (
    ) :
        loaded_with_image(false)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    template <
        typename image_type
        >
    void scan_image_custom<Feature_extractor_type>::
    load (
        const image_type& img
    )
    {
        feats.load(img, search_rects);
        loaded_with_image = true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    bool scan_image_custom<Feature_extractor_type>::
    is_loaded_with_image (
    ) const
    {
        return loaded_with_image;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    void scan_image_custom<Feature_extractor_type>::
    copy_configuration(
        const feature_extractor_type& fe
    )
    {
        feats.copy_configuration(fe);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    void scan_image_custom<Feature_extractor_type>::
    copy_configuration (
        const scan_image_custom& item
    )
    {
        feats.copy_configuration(item.feats);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    long scan_image_custom<Feature_extractor_type>::
    get_num_dimensions (
    ) const
    {
        return feats.get_num_dimensions();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    void scan_image_custom<Feature_extractor_type>::
    detect (
        const feature_vector_type& w,
        std::vector<std::pair<double, rectangle> >& dets,
        const double thresh
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    w.size() >= get_num_dimensions(), 
            "\t void scan_image_custom::detect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t w.size():               " << w.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t this: " << this
            );
        
        dets.clear();
        compute_all_rect_scores(feats, w,dets,thresh);
        std::sort(dets.rbegin(), dets.rend(), compare_pair_rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    const rectangle scan_image_custom<Feature_extractor_type>::
    get_best_matching_rect (
        const rectangle& rect
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image(),
            "\t const rectangle scan_image_custom::get_best_matching_rect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t this: " << this
            );


        double best_score = -1;
        rectangle best_rect;
        for (unsigned long i = 0; i < search_rects.size(); ++i)
        {
            const double score = (rect.intersect(search_rects[i])).area()/(double)(rect+search_rects[i]).area();
            if (score > best_score)
            {
                best_score = score;
                best_rect = search_rects[i];
            }
        }
        return best_rect;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    full_object_detection scan_image_custom<Feature_extractor_type>::
    get_full_object_detection (
        const rectangle& rect,
        const feature_vector_type& /*w*/
    ) const
    {
        return full_object_detection(rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type
        >
    void scan_image_custom<Feature_extractor_type>::
    get_feature_vector (
        const full_object_detection& obj,
        feature_vector_type& psi
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    psi.size() >= get_num_dimensions() &&
                    obj.num_parts() == 0,
            "\t void scan_image_custom::get_feature_vector()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t psi.size():             " << psi.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t obj.num_parts():                            " << obj.num_parts()
            << "\n\t this: " << this
            );


        feats.get_feature_vector(get_best_matching_rect(obj.get_rect()), psi);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMAGE_CuSTOM_Hh_

