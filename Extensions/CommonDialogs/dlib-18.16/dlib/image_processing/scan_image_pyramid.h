// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_IMaGE_PYRAMID_Hh_
#define DLIB_SCAN_IMaGE_PYRAMID_Hh_

#include "scan_image_pyramid_abstract.h"
#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing.h"
#include "../array2d.h"
#include <vector>
#include "full_object_detection.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    class scan_image_pyramid : noncopyable
    {

    public:

        typedef matrix<double,0,1> feature_vector_type;

        typedef Pyramid_type pyramid_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_image_pyramid (
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

        inline void copy_configuration (
            const scan_image_pyramid& item
        );

        const Feature_extractor_type& get_feature_extractor (
        ) const { return feats_config; }

        void add_detection_template (
            const rectangle& object_box,
            const std::vector<rectangle>& stationary_feature_extraction_regions,
            const std::vector<rectangle>& movable_feature_extraction_regions
        );

        void add_detection_template (
            const rectangle& object_box,
            const std::vector<rectangle>& stationary_feature_extraction_regions
        );

        inline unsigned long get_num_detection_templates (
        ) const;

        inline unsigned long get_num_movable_components_per_detection_template (
        ) const;

        inline unsigned long get_num_stationary_components_per_detection_template (
        ) const;

        inline unsigned long get_num_components_per_detection_template (
        ) const;

        inline long get_num_dimensions (
        ) const;

        unsigned long get_max_pyramid_levels (
        ) const;

        void set_max_pyramid_levels (
            unsigned long max_levels
        );

        inline unsigned long get_max_detections_per_template (
        ) const;

        void set_min_pyramid_layer_size (
            unsigned long width,
            unsigned long height 
        );

        inline unsigned long get_min_pyramid_layer_width (
        ) const;

        inline unsigned long get_min_pyramid_layer_height (
        ) const;

        void set_max_detections_per_template (
            unsigned long max_dets
        );

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

        template <typename T, typename U>
        friend void serialize (
            const scan_image_pyramid<T,U>& item,
            std::ostream& out
        );

        template <typename T, typename U>
        friend void deserialize (
            scan_image_pyramid<T,U>& item,
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

        struct detection_template
        {
            rectangle object_box; // always centered at (0,0)
            std::vector<rectangle> rects; // template with respect to (0,0)
            std::vector<rectangle> movable_rects; 
        };

        friend void serialize(const detection_template& item, std::ostream& out)
        {
            int version = 1;
            serialize(version, out);
            serialize(item.object_box, out);
            serialize(item.rects, out);
            serialize(item.movable_rects, out);
        }
        friend void deserialize(detection_template& item, std::istream& in)
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw serialization_error("Unexpected version found while deserializing a dlib::scan_image_pyramid::detection_template object.");

            deserialize(item.object_box, in);
            deserialize(item.rects, in);
            deserialize(item.movable_rects, in);
        }

        void get_mapped_rect_and_metadata (
            const unsigned long number_pyramid_levels,
            rectangle rect,
            rectangle& mapped_rect,
            detection_template& best_template,
            rectangle& object_box,
            unsigned long& best_level,
            unsigned long& detection_template_idx
        ) const;

        double get_match_score (
            rectangle r1,
            rectangle r2
        ) const
        {
            // make the rectangles overlap as much as possible before computing the match score.
            r1 = move_rect(r1, r2.tl_corner());
            return (r1.intersect(r2).area())/(double)(r1 + r2).area();
        }

        void test_coordinate_transforms()
        {
            for (long x = -10; x <= 10; x += 10)
            {
                for (long y = -10; y <= 10; y += 10)
                {
                    const rectangle rect = centered_rect(x,y,5,6);
                    rectangle a;

                    a = feats_config.image_to_feat_space(rect);
                    if (a.width()  > 10000000 || a.height() > 10000000 )
                    {
                        DLIB_CASSERT(false, "The image_to_feat_space() routine is outputting rectangles of an implausibly "
                                     << "\nlarge size.  This means there is probably a bug in your feature extractor.");
                    }
                    a = feats_config.feat_to_image_space(rect);
                    if (a.width()  > 10000000 || a.height() > 10000000 )
                    {
                        DLIB_CASSERT(false, "The feat_to_image_space() routine is outputting rectangles of an implausibly "
                                     << "\nlarge size.  This means there is probably a bug in your feature extractor.");
                    }
                }
            }
            
        }

        feature_extractor_type feats_config; // just here to hold configuration.  use it to populate the feats elements.
        array<feature_extractor_type> feats;
        std::vector<detection_template> det_templates;
        unsigned long max_dets_per_template;
        unsigned long max_pyramid_levels;
        unsigned long min_pyramid_layer_width;
        unsigned long min_pyramid_layer_height;

    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void serialize (
        const scan_image_pyramid<T,U>& item,
        std::ostream& out
    )
    {
        int version = 3;
        serialize(version, out);
        serialize(item.feats_config, out);
        serialize(item.feats, out);
        serialize(item.det_templates, out);
        serialize(item.max_dets_per_template, out);
        serialize(item.max_pyramid_levels, out);
        serialize(item.min_pyramid_layer_width, out);
        serialize(item.min_pyramid_layer_height, out);
        serialize(item.get_num_dimensions(), out);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void deserialize (
        scan_image_pyramid<T,U>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 3)
            throw serialization_error("Unsupported version found when deserializing a scan_image_pyramid object.");

        deserialize(item.feats_config, in);
        deserialize(item.feats, in);
        deserialize(item.det_templates, in);
        deserialize(item.max_dets_per_template, in);
        deserialize(item.max_pyramid_levels, in);
        deserialize(item.min_pyramid_layer_width, in);
        deserialize(item.min_pyramid_layer_height, in);

        // When developing some feature extractor, it's easy to accidentally change its
        // number of dimensions and then try to deserialize data from an older version of
        // your extractor into the current code.  This check is here to catch that kind of
        // user error.
        long dims;
        deserialize(dims, in);
        if (item.get_num_dimensions() != dims)
            throw serialization_error("Number of dimensions in serialized scan_image_pyramid doesn't match the expected number.");
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                         scan_image_pyramid member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    scan_image_pyramid (
    ) : 
        max_dets_per_template(10000),
        max_pyramid_levels(1000),
        min_pyramid_layer_width(20),
        min_pyramid_layer_height(20)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    template <
        typename image_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    load (
        const image_type& img
    )
    {
        unsigned long levels = 0;
        rectangle rect = get_rect(img);

        // figure out how many pyramid levels we should be using based on the image size
        pyramid_type pyr;
        do
        {
            rect = pyr.rect_down(rect);
            ++levels;
        } while (rect.width() >= min_pyramid_layer_width && rect.height() >= min_pyramid_layer_height &&
                 levels < max_pyramid_levels);

        if (feats.max_size() < levels)
            feats.set_max_size(levels);
        feats.set_size(levels);

        for (unsigned long i = 0; i < feats.size(); ++i)
            feats[i].copy_configuration(feats_config);

        // build our feature pyramid
        feats[0].load(img);
        if (feats.size() > 1)
        {
            image_type temp1, temp2;
            pyr(img, temp1);
            feats[1].load(temp1);
            swap(temp1,temp2);

            for (unsigned long i = 2; i < feats.size(); ++i)
            {
                pyr(temp2, temp1);
                feats[i].load(temp1);
                swap(temp1,temp2);
            }
        }


    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_max_detections_per_template (
    ) const
    {
        return max_dets_per_template;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    set_max_detections_per_template (
        unsigned long max_dets
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_dets > 0 ,
            "\t void scan_image_pyramid::set_max_detections_per_template()"
            << "\n\t The max number of possible detections can't be zero. "
            << "\n\t max_dets: " << max_dets
            << "\n\t this: " << this
            );

        max_dets_per_template = max_dets;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    bool scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    is_loaded_with_image (
    ) const
    {
        return feats.size() != 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    copy_configuration(
        const feature_extractor_type& fe
    )
    {
        test_coordinate_transforms();
        feats_config.copy_configuration(fe);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    copy_configuration (
        const scan_image_pyramid& item
    )
    {
        feats_config.copy_configuration(item.feats_config);
        det_templates = item.det_templates;
        max_dets_per_template = item.max_dets_per_template;
        max_pyramid_levels = item.max_pyramid_levels;
        min_pyramid_layer_width = item.min_pyramid_layer_width;
        min_pyramid_layer_height = item.min_pyramid_layer_height;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    add_detection_template (
        const rectangle& object_box,
        const std::vector<rectangle>& stationary_feature_extraction_regions,
        const std::vector<rectangle>& movable_feature_extraction_regions
    )
    {
#ifdef ENABLE_ASSERTS
        // make sure requires clause is not broken
        DLIB_ASSERT((get_num_detection_templates() == 0 || 
                        (get_num_stationary_components_per_detection_template() == stationary_feature_extraction_regions.size() &&
                        get_num_movable_components_per_detection_template() == movable_feature_extraction_regions.size())) &&
                        center(object_box) == point(0,0),
            "\t void scan_image_pyramid::add_detection_template()"
            << "\n\t The number of rects in this new detection template doesn't match "
            << "\n\t the number in previous detection templates."
            << "\n\t get_num_stationary_components_per_detection_template(): " << get_num_stationary_components_per_detection_template()
            << "\n\t stationary_feature_extraction_regions.size():           " << stationary_feature_extraction_regions.size()
            << "\n\t get_num_movable_components_per_detection_template():    " << get_num_movable_components_per_detection_template()
            << "\n\t movable_feature_extraction_regions.size():              " << movable_feature_extraction_regions.size()
            << "\n\t this: " << this
            );

        for (unsigned long i = 0; i < movable_feature_extraction_regions.size(); ++i)
        {
            DLIB_ASSERT(center(movable_feature_extraction_regions[i]) == point(0,0),
                        "Invalid inputs were given to this function."
                        << "\n\t center(movable_feature_extraction_regions["<<i<<"]): " << center(movable_feature_extraction_regions[i]) 
                        << "\n\t this: " << this
            );
        }
#endif

        detection_template temp;
        temp.object_box = object_box;
        temp.rects = stationary_feature_extraction_regions;
        temp.movable_rects = movable_feature_extraction_regions;
        det_templates.push_back(temp);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    add_detection_template (
        const rectangle& object_box,
        const std::vector<rectangle>& stationary_feature_extraction_regions
    )
    {
        // an empty set of movable feature regions
        const std::vector<rectangle> movable_feature_extraction_regions;
        add_detection_template(object_box, stationary_feature_extraction_regions,
                               movable_feature_extraction_regions);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_num_detection_templates (
    ) const
    {
        return det_templates.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_num_stationary_components_per_detection_template (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 ,
            "\t unsigned long scan_image_pyramid::get_num_stationary_components_per_detection_template()"
            << "\n\t You need to give some detection templates before calling this function. "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t this: " << this
            );

        return det_templates[0].rects.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_num_movable_components_per_detection_template (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 ,
            "\t unsigned long scan_image_pyramid::get_num_movable_components_per_detection_template()"
            << "\n\t You need to give some detection templates before calling this function. "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t this: " << this
            );

        return det_templates[0].movable_rects.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_num_components_per_detection_template (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 ,
            "\t unsigned long scan_image_pyramid::get_num_components_per_detection_template()"
            << "\n\t You need to give some detection templates before calling this function. "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t this: " << this
            );

        return get_num_movable_components_per_detection_template() +
               get_num_stationary_components_per_detection_template();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_num_dimensions (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 ,
            "\t long scan_image_pyramid::get_num_dimensions()"
            << "\n\t You need to give some detection templates before calling this function. "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t this: " << this
            );

        return feats_config.get_num_dimensions()*get_num_components_per_detection_template() + get_num_detection_templates();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_max_pyramid_levels (
    ) const
    {
        return max_pyramid_levels;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    set_max_pyramid_levels (
        unsigned long max_levels
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_levels > 0 ,
            "\t void scan_image_pyramid::set_max_pyramid_levels()"
            << "\n\t You can't have zero levels. "
            << "\n\t max_levels: " << max_levels 
            << "\n\t this: " << this
            );

        max_pyramid_levels = max_levels;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    detect (
        const feature_vector_type& w,
        std::vector<std::pair<double, rectangle> >& dets,
        const double thresh
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 &&
                    is_loaded_with_image() &&
                    w.size() >= get_num_dimensions(), 
            "\t void scan_image_pyramid::detect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t w.size():               " << w.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t this: " << this
            );

        dets.clear();

        array<array2d<double> > saliency_images;
        saliency_images.set_max_size(get_num_components_per_detection_template());
        saliency_images.set_size(get_num_components_per_detection_template());
        std::vector<std::pair<unsigned int,rectangle> > stationary_region_rects(get_num_stationary_components_per_detection_template()); 
        std::vector<std::pair<unsigned int,rectangle> > movable_region_rects(get_num_movable_components_per_detection_template()); 
        pyramid_type pyr;
        std::vector<std::pair<double, point> > point_dets;

        // for all pyramid levels
        for (unsigned long l = 0; l < feats.size(); ++l)
        {
            for (unsigned long i = 0; i < saliency_images.size(); ++i)
            {
                saliency_images[i].set_size(feats[l].nr(), feats[l].nc());
                const unsigned long offset = get_num_detection_templates() + feats_config.get_num_dimensions()*i;

                // build saliency images for pyramid level l 
                for (long r = 0; r < feats[l].nr(); ++r)
                {
                    for (long c = 0; c < feats[l].nc(); ++c)
                    {
                        const typename feature_extractor_type::descriptor_type& descriptor = feats[l](r,c);

                        double sum = 0;
                        for (unsigned long k = 0; k < descriptor.size(); ++k)
                        {
                            sum += w(descriptor[k].first + offset)*descriptor[k].second;
                        }
                        saliency_images[i][r][c] = sum;
                    }
                }
            }

            // now search the saliency images
            for (unsigned long i = 0; i < det_templates.size(); ++i)
            {
                const point offset = -feats[l].image_to_feat_space(point(0,0));
                for (unsigned long j = 0; j < stationary_region_rects.size(); ++j)
                {
                    stationary_region_rects[j] = std::make_pair(j, translate_rect(feats[l].image_to_feat_space(det_templates[i].rects[j]),offset)); 
                }
                for (unsigned long j = 0; j < movable_region_rects.size(); ++j)
                {
                    // Scale the size of the movable rectangle but make sure its center
                    // stays at point(0,0).
                    const rectangle temp = feats[l].image_to_feat_space(det_templates[i].movable_rects[j]);
                    movable_region_rects[j] = std::make_pair(j+stationary_region_rects.size(),
                                                             centered_rect(point(0,0),temp.width(), temp.height())); 
                }

                // Scale the object box into the feature extraction image, but keeping it
                // centered at point(0,0).
                rectangle scaled_object_box = feats[l].image_to_feat_space(det_templates[i].object_box);
                scaled_object_box = centered_rect(point(0,0),scaled_object_box.width(), scaled_object_box.height());

                // Each detection template gets its own special threshold in addition to
                // the global detection threshold.  This allows us to model the fact that
                // some detection templates might be more prone to false alarming or since
                // their size is different naturally require a larger or smaller threshold
                // (since they integrate over a larger or smaller region of the image).
                const double template_specific_thresh = w(i);

                scan_image_movable_parts(point_dets, saliency_images, scaled_object_box,
                                         stationary_region_rects, movable_region_rects,
                                         thresh+template_specific_thresh, max_dets_per_template); 

                // convert all the point detections into rectangles at the original image scale and coordinate system
                for (unsigned long j = 0; j < point_dets.size(); ++j)
                {
                    const double score = point_dets[j].first-template_specific_thresh;
                    point p = point_dets[j].second;
                    p = feats[l].feat_to_image_space(p);
                    rectangle rect = translate_rect(det_templates[i].object_box, p);
                    rect = pyr.rect_up(rect, l);

                    dets.push_back(std::make_pair(score, rect));
                }
            }
        }

        std::sort(dets.rbegin(), dets.rend(), compare_pair_rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    const rectangle scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_best_matching_rect (
        const rectangle& rect
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 ,
            "\t const rectangle scan_image_pyramid::get_best_matching_rect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t this: " << this
            );

        rectangle mapped_rect, object_box;
        detection_template best_template;
        unsigned long best_level, junk;
        get_mapped_rect_and_metadata(max_pyramid_levels, rect, mapped_rect, best_template, object_box, best_level, junk);
        return mapped_rect;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_mapped_rect_and_metadata (
        const unsigned long number_pyramid_levels,
        rectangle rect,
        rectangle& mapped_rect,
        detection_template& best_template,
        rectangle& object_box,
        unsigned long& best_level,
        unsigned long& detection_template_idx
    ) const
    {
        pyramid_type pyr;
        // Figure out the pyramid level which best matches rect against one of our 
        // detection template object boxes.
        best_level = 0;
        double best_match_score = -1;


        // Find the best matching detection template for rect
        for (unsigned long l = 0; l < number_pyramid_levels; ++l)
        {
            const rectangle temp = pyr.rect_down(rect,l);
            if (temp.area() <= 1) 
                break;

            // At this pyramid level, what matches best?
            for (unsigned long t = 0; t < det_templates.size(); ++t)
            {
                const double match_score = get_match_score(det_templates[t].object_box, temp);
                if (match_score > best_match_score)
                {
                    best_match_score = match_score;
                    best_level = l;
                    best_template = det_templates[t];
                    detection_template_idx = t;
                }
            }
        }


        // Now we translate best_template into the right spot (it should be centered at the location 
        // determined by rect) and convert it into the feature image coordinate system.
        rect = pyr.rect_down(rect,best_level);
        const point offset = -feats_config.image_to_feat_space(point(0,0));
        const point origin = feats_config.image_to_feat_space(center(rect)) + offset;
        for (unsigned long k = 0; k < best_template.rects.size(); ++k)
        {
            rectangle temp = best_template.rects[k];
            temp = feats_config.image_to_feat_space(temp);
            temp = translate_rect(temp, origin);
            best_template.rects[k] = temp;
        }
        for (unsigned long k = 0; k < best_template.movable_rects.size(); ++k)
        {
            rectangle temp = best_template.movable_rects[k];
            temp = feats_config.image_to_feat_space(temp);
            temp = centered_rect(point(0,0), temp.width(), temp.height());
            best_template.movable_rects[k] = temp;
        }

        const rectangle scaled_object_box = feats_config.image_to_feat_space(best_template.object_box);
        object_box = centered_rect(origin-offset, scaled_object_box.width(), scaled_object_box.height());

        // The input rectangle was mapped to one of the detection templates.  Reverse the process
        // to figure out what the mapped rectangle is in the original input space.
        mapped_rect = translate_rect(best_template.object_box, feats_config.feat_to_image_space(origin-offset));
        mapped_rect = pyr.rect_up(mapped_rect, best_level);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    full_object_detection scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_full_object_detection (
        const rectangle& rect,
        const feature_vector_type& w
    ) const
    {
        // fill in movable part positions.  

        rectangle mapped_rect;
        detection_template best_template;
        unsigned long best_level, junk;
        rectangle object_box;
        get_mapped_rect_and_metadata(feats.size(), rect, mapped_rect, best_template, object_box, best_level, junk);

        Pyramid_type pyr;

        array2d<double> saliency_image, sum_img;

        double total_temp_score = 0;
        // convert into feature space.
        object_box = object_box.intersect(get_rect(feats[best_level]));

        std::vector<point> movable_parts;
        movable_parts.reserve(get_num_movable_components_per_detection_template());
        for (unsigned long i = 0; i < get_num_movable_components_per_detection_template(); ++i)
        {
            // make the saliency_image for the ith movable part.

            const rectangle part_rect = best_template.movable_rects[i];
            const rectangle area = grow_rect(object_box, 
                                             part_rect.width()/2, 
                                             part_rect.height()/2).intersect(get_rect(feats[best_level]));

            saliency_image.set_size(area.height(), area.width());
            const unsigned long offset = get_num_detection_templates() + feats_config.get_num_dimensions()*(i+get_num_stationary_components_per_detection_template());

            // build saliency image for pyramid level best_level 
            for (long r = area.top(); r <= area.bottom(); ++r)
            {
                for (long c = area.left(); c <= area.right(); ++c)
                {
                    const typename feature_extractor_type::descriptor_type& descriptor = feats[best_level](r,c);

                    double sum = 0;
                    for (unsigned long k = 0; k < descriptor.size(); ++k)
                    {
                        sum += w(descriptor[k].first + offset)*descriptor[k].second;
                    }
                    saliency_image[r-area.top()][c-area.left()] = sum;
                }
            }

            sum_img.set_size(saliency_image.nr(), saliency_image.nc());
            sum_filter_assign(saliency_image, sum_img, part_rect);
            // Figure out where the maximizer is in sum_img.  Note that we
            // only look in the part of sum_img that corresponds to a location inside
            // object_box.
            rectangle valid_area = get_rect(sum_img);
            valid_area.left()   += object_box.left()   - area.left();
            valid_area.top()    += object_box.top()    - area.top();
            valid_area.right()  += object_box.right()  - area.right();
            valid_area.bottom() += object_box.bottom() - area.bottom();
            double max_val = 0;
            point max_loc;
            for (long r = valid_area.top(); r <= valid_area.bottom(); ++r)
            {
                for (long c = valid_area.left(); c <= valid_area.right(); ++c)
                {
                    if (sum_img[r][c] > max_val)
                    {
                        //if (object_box.contains(point(c,r) + area.tl_corner()))
                        {
                            max_loc = point(c,r);
                            max_val = sum_img[r][c];
                        }
                    }
                }
            }

            if (max_val <= 0)
            {
                max_loc = OBJECT_PART_NOT_PRESENT;
            }
            else
            {
                total_temp_score += max_val;
                // convert max_loc back into feature image space from our cropped image.
                max_loc += area.tl_corner();

                // now convert from feature space to image space.
                max_loc = feats[best_level].feat_to_image_space(max_loc);
                max_loc = pyr.point_up(max_loc, best_level);
                max_loc = nearest_point(rect, max_loc);
            }

            movable_parts.push_back(max_loc);
        }

        return full_object_detection(rect, movable_parts);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_feature_vector (
        const full_object_detection& obj,
        feature_vector_type& psi
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(get_num_detection_templates() > 0 &&
                    is_loaded_with_image() &&
                    psi.size() >= get_num_dimensions() &&
                    obj.num_parts() == get_num_movable_components_per_detection_template(),
            "\t void scan_image_pyramid::get_feature_vector()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t get_num_detection_templates(): " << get_num_detection_templates()
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t psi.size():             " << psi.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t get_num_movable_components_per_detection_template(): " << get_num_movable_components_per_detection_template()
            << "\n\t obj.num_parts():                            " << obj.num_parts()
            << "\n\t this: " << this
            );
        DLIB_ASSERT(all_parts_in_rect(obj), 
            "\t void scan_image_pyramid::get_feature_vector()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t obj.get_rect(): " << obj.get_rect()
            << "\n\t this: " << this
        );



        rectangle mapped_rect;
        detection_template best_template;
        unsigned long best_level, detection_template_idx;
        rectangle object_box;
        get_mapped_rect_and_metadata(feats.size(), obj.get_rect(), mapped_rect, best_template, object_box, best_level, detection_template_idx);

        psi(detection_template_idx) -= 1;

        Pyramid_type pyr;

        // put the movable rects at the places indicated by obj.
        std::vector<rectangle> rects = best_template.rects;
        for (unsigned long i = 0; i < obj.num_parts(); ++i)
        {
            if (obj.part(i) != OBJECT_PART_NOT_PRESENT)
            {
                // map from the original image to scaled feature space.
                point loc = feats[best_level].image_to_feat_space(pyr.point_down(obj.part(i), best_level));
                // Make sure the movable part always stays within the object_box.
                // Otherwise it would be at a place that the detect() function can never
                // look.  
                loc = nearest_point(object_box, loc);
                rects.push_back(translate_rect(best_template.movable_rects[i], loc));
            }
            else
            {
                // add an empty rectangle since this part wasn't observed.
                rects.push_back(rectangle());
            }
        }

        // pull features out of all the boxes in rects.
        for (unsigned long j = 0; j < rects.size(); ++j)
        {
            const rectangle rect = rects[j].intersect(get_rect(feats[best_level]));
            const unsigned long template_region_id = j;
            const unsigned long offset = get_num_detection_templates() + feats_config.get_num_dimensions()*template_region_id;
            for (long r = rect.top(); r <= rect.bottom(); ++r)
            {
                for (long c = rect.left(); c <= rect.right(); ++c)
                {
                    const typename feature_extractor_type::descriptor_type& descriptor = feats[best_level](r,c);
                    for (unsigned long k = 0; k < descriptor.size(); ++k)
                    {
                        psi(descriptor[k].first + offset) += descriptor[k].second;
                    }
                }
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    void scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    set_min_pyramid_layer_size (
        unsigned long width,
        unsigned long height 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(width > 0 && height > 0 ,
            "\t void scan_image_pyramid::set_min_pyramid_layer_size()"
            << "\n\t These sizes can't be zero. "
            << "\n\t width:  " << width 
            << "\n\t height: " << height 
            << "\n\t this:   " << this
            );

        min_pyramid_layer_width = width;
        min_pyramid_layer_height = height;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_min_pyramid_layer_width (
    ) const
    {
        return min_pyramid_layer_width;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type
        >
    unsigned long scan_image_pyramid<Pyramid_type,Feature_extractor_type>::
    get_min_pyramid_layer_height (
    ) const
    {
        return min_pyramid_layer_height;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMaGE_PYRAMID_Hh_


