// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_IMAGE_bOXES_Hh_
#define DLIB_SCAN_IMAGE_bOXES_Hh_

#include "scan_image_boxes_abstract.h"
#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing.h"
#include "../array2d.h"
#include <vector>
#include "../image_processing/full_object_detection.h"
#include "../image_transforms.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class default_box_generator
    {
    public:
        template <typename image_type>
        void operator() (
            const image_type& img,
            std::vector<rectangle>& rects
        ) const
        {
            rects.clear();
            find_candidate_object_locations(img, rects);
        }
    };

    inline void serialize(const default_box_generator&, std::ostream& ) {}
    inline void deserialize(default_box_generator&, std::istream& ) {}

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator = default_box_generator
        >
    class scan_image_boxes : noncopyable
    {

    public:

        typedef matrix<double,0,1> feature_vector_type;

        typedef Feature_extractor_type feature_extractor_type;
        typedef Box_generator box_generator;

        scan_image_boxes (
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

        inline void copy_configuration(
            const box_generator& bg
        );

        const box_generator& get_box_generator (
        ) const { return detect_boxes; } 

        const Feature_extractor_type& get_feature_extractor (
        ) const { return feats; }

        inline void copy_configuration (
            const scan_image_boxes& item
        );

        inline long get_num_dimensions (
        ) const;

        unsigned long get_num_spatial_pyramid_levels (
        ) const;

        void set_num_spatial_pyramid_levels (
            unsigned long levels
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
        /*!
            requires
                - is_loaded_with_image() == true
        !*/

        inline unsigned long get_num_detection_templates (
        ) const { return 1; }

        inline unsigned long get_num_movable_components_per_detection_template (
        ) const { return 0; }

        template <typename T, typename U>
        friend void serialize (
            const scan_image_boxes<T,U>& item,
            std::ostream& out
        );

        template <typename T, typename U>
        friend void deserialize (
            scan_image_boxes<T,U>& item,
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

        void test_coordinate_transforms()
        {
            for (long x = -10; x <= 10; x += 10)
            {
                for (long y = -10; y <= 10; y += 10)
                {
                    const rectangle rect = centered_rect(x,y,5,6);
                    rectangle a;

                    a = feats.image_to_feat_space(rect);
                    if (a.width()  > 10000000 || a.height() > 10000000 )
                    {
                        DLIB_CASSERT(false, "The image_to_feat_space() routine is outputting rectangles of an implausibly "
                                     << "\nlarge size.  This means there is probably a bug in your feature extractor.");
                    }
                    a = feats.feat_to_image_space(rect);
                    if (a.width()  > 10000000 || a.height() > 10000000 )
                    {
                        DLIB_CASSERT(false, "The feat_to_image_space() routine is outputting rectangles of an implausibly "
                                     << "\nlarge size.  This means there is probably a bug in your feature extractor.");
                    }
                }
            }
            
        }

        static void add_grid_rects (
            std::vector<rectangle>& rects,
            const rectangle& object_box,
            unsigned int cells_x,
            unsigned int cells_y
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(cells_x > 0 && cells_y > 0,
                "\t void add_grid_rects()"
                << "\n\t The number of cells along a dimension can't be zero. "
                << "\n\t cells_x: " << cells_x
                << "\n\t cells_y: " << cells_y
            );

            const matrix_range_exp<double>& x = linspace(object_box.left(), object_box.right(), cells_x+1);
            const matrix_range_exp<double>& y = linspace(object_box.top(), object_box.bottom(), cells_y+1);

            for (long j = 0; j+1 < y.size(); ++j)
            {
                for (long i = 0; i+1 < x.size(); ++i)
                {
                    const dlib::vector<double,2> tl(x(i),y(j));
                    const dlib::vector<double,2> br(x(i+1),y(j+1));
                    rects.push_back(rectangle(tl,br));
                }
            }
        }

        void get_feature_extraction_regions (
            const rectangle& rect,
            std::vector<rectangle>& regions
        ) const 
        /*!
            ensures
                - #regions.size() is always the same number no matter what the input is.  The
                  regions also have a consistent ordering.
                - all the output rectangles are contained within rect.
        !*/
        {
            regions.clear();

            for (unsigned int l = 1; l <= num_spatial_pyramid_levels; ++l)
            {
                const int cells = (int)std::pow(2.0, l-1.0);
                add_grid_rects(regions, rect, cells, cells);
            }
        }

        unsigned int get_num_components_per_detection_template(
        ) const
        {
            return (unsigned int)(std::pow(4.0,(double)num_spatial_pyramid_levels)-1)/3;
        }

        feature_extractor_type feats;
        std::vector<rectangle> search_rects;
        bool loaded_with_image;
        unsigned int num_spatial_pyramid_levels;
        box_generator detect_boxes;

        const long box_sizedims;
        const long box_maxsize;
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void serialize (
        const scan_image_boxes<T,U>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.feats, out);
        serialize(item.search_rects, out);
        serialize(item.loaded_with_image, out);
        serialize(item.num_spatial_pyramid_levels, out);
        serialize(item.detect_boxes, out);
        serialize(item.get_num_dimensions(), out);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void deserialize (
        scan_image_boxes<T,U>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unsupported version found when deserializing a scan_image_boxes object.");

        deserialize(item.feats, in);
        deserialize(item.search_rects, in);
        deserialize(item.loaded_with_image, in);
        deserialize(item.num_spatial_pyramid_levels, in);
        deserialize(item.detect_boxes, in);

        // When developing some feature extractor, it's easy to accidentally change its
        // number of dimensions and then try to deserialize data from an older version of
        // your extractor into the current code.  This check is here to catch that kind of
        // user error.
        long dims;
        deserialize(dims, in);
        if (item.get_num_dimensions() != dims)
            throw serialization_error("Number of dimensions in serialized scan_image_boxes doesn't match the expected number.");
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                         scan_image_boxes member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    scan_image_boxes<Feature_extractor_type,Box_generator>::
    scan_image_boxes (
    ) :
        loaded_with_image(false),
        num_spatial_pyramid_levels(3),
        box_sizedims(20),
        box_maxsize(1200)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    template <
        typename image_type
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    load (
        const image_type& img
    )
    {
        feats.load(img);
        detect_boxes(img, search_rects);
        loaded_with_image = true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    bool scan_image_boxes<Feature_extractor_type,Box_generator>::
    is_loaded_with_image (
    ) const
    {
        return loaded_with_image;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    copy_configuration(
        const feature_extractor_type& fe
    )
    {
        test_coordinate_transforms();
        feats.copy_configuration(fe);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    copy_configuration(
        const box_generator& bg 
    )
    {
        detect_boxes = bg;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    copy_configuration (
        const scan_image_boxes& item
    )
    {
        feats.copy_configuration(item.feats);
        detect_boxes = item.detect_boxes;
        num_spatial_pyramid_levels = item.num_spatial_pyramid_levels;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    unsigned long scan_image_boxes<Feature_extractor_type,Box_generator>::
    get_num_spatial_pyramid_levels (
    ) const
    {
        return num_spatial_pyramid_levels;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    set_num_spatial_pyramid_levels (
        unsigned long levels
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(levels > 0, 
            "\t void scan_image_boxes::set_num_spatial_pyramid_levels()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t levels: " << levels 
            << "\n\t this: " << this
            );
        

        num_spatial_pyramid_levels = levels;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    long scan_image_boxes<Feature_extractor_type,Box_generator>::
    get_num_dimensions (
    ) const
    {
        return feats.get_num_dimensions()*get_num_components_per_detection_template() + box_sizedims*2;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    detect (
        const feature_vector_type& w,
        std::vector<std::pair<double, rectangle> >& dets,
        const double thresh
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    w.size() >= get_num_dimensions(), 
            "\t void scan_image_boxes::detect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t w.size():               " << w.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t this: " << this
            );
        
        dets.clear();

        array<integral_image_generic<double> > saliency_images(get_num_components_per_detection_template());

        array2d<double> temp_img(feats.nr(), feats.nc());

        // build saliency images  
        for (unsigned long i = 0; i < saliency_images.size(); ++i)
        {
            const unsigned long offset = 2*box_sizedims + feats.get_num_dimensions()*i;

            // make the basic saliency image for the i-th feature extraction region
            for (long r = 0; r < feats.nr(); ++r)
            {
                for (long c = 0; c < feats.nc(); ++c)
                {
                    const typename feature_extractor_type::descriptor_type& descriptor = feats(r,c);

                    double sum = 0;
                    for (unsigned long k = 0; k < descriptor.size(); ++k)
                    {
                        sum += w(descriptor[k].first + offset)*descriptor[k].second;
                    }
                    temp_img[r][c] = sum;
                }
            }

            // now convert base saliency image into final integral image
            saliency_images[i].load(temp_img);
        }


        // now search the saliency images
        std::vector<rectangle> regions;
        const rectangle bounds = get_rect(feats);
        for (unsigned long i = 0; i < search_rects.size(); ++i)
        {
            const rectangle rect = feats.image_to_feat_space(search_rects[i]).intersect(bounds);
            if (rect.is_empty())
                continue;
            get_feature_extraction_regions(rect, regions);
            double score = 0;
            for (unsigned long k = 0; k < regions.size(); ++k)
            {
                score += saliency_images[k].get_sum_of_area(regions[k]);
            }
            const double width = search_rects[i].width();
            const double height = search_rects[i].height();

            score += dot(linpiece(width,  linspace(0, box_maxsize, box_sizedims+1)), rowm(w, range(0,box_sizedims-1)));
            score += dot(linpiece(height, linspace(0, box_maxsize, box_sizedims+1)), rowm(w, range(box_sizedims,2*box_sizedims-1)));

            if (score >= thresh)
            {
                dets.push_back(std::make_pair(score, search_rects[i]));
            }
        }

        std::sort(dets.rbegin(), dets.rend(), compare_pair_rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    const rectangle scan_image_boxes<Feature_extractor_type,Box_generator>::
    get_best_matching_rect (
        const rectangle& rect
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image(),
            "\t const rectangle scan_image_boxes::get_best_matching_rect()"
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
        typename Feature_extractor_type,
        typename Box_generator
        >
    full_object_detection scan_image_boxes<Feature_extractor_type,Box_generator>::
    get_full_object_detection (
        const rectangle& rect,
        const feature_vector_type& /*w*/
    ) const
    {
        return full_object_detection(rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Feature_extractor_type,
        typename Box_generator
        >
    void scan_image_boxes<Feature_extractor_type,Box_generator>::
    get_feature_vector (
        const full_object_detection& obj,
        feature_vector_type& psi
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    psi.size() >= get_num_dimensions() &&
                    obj.num_parts() == 0,
            "\t void scan_image_boxes::get_feature_vector()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t psi.size():             " << psi.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t obj.num_parts():                            " << obj.num_parts()
            << "\n\t this: " << this
            );



        const rectangle best_rect = get_best_matching_rect(obj.get_rect());
        const rectangle mapped_rect = feats.image_to_feat_space(best_rect).intersect(get_rect(feats));
        if (mapped_rect.is_empty())
            return;

        std::vector<rectangle> regions;
        get_feature_extraction_regions(mapped_rect, regions);

        // pull features out of all the boxes in regions.
        for (unsigned long j = 0; j < regions.size(); ++j)
        {
            const rectangle rect = regions[j];

            const unsigned long template_region_id = j;
            const unsigned long offset = box_sizedims*2 + feats.get_num_dimensions()*template_region_id;
            for (long r = rect.top(); r <= rect.bottom(); ++r)
            {
                for (long c = rect.left(); c <= rect.right(); ++c)
                {
                    const typename feature_extractor_type::descriptor_type& descriptor = feats(r,c);
                    for (unsigned long k = 0; k < descriptor.size(); ++k)
                    {
                        psi(descriptor[k].first + offset) += descriptor[k].second;
                    }
                }
            }
        }

        const double width = best_rect.width();
        const double height = best_rect.height();
        set_rowm(psi, range(0,box_sizedims-1))              += linpiece(width,  linspace(0, box_maxsize, box_sizedims+1));
        set_rowm(psi, range(box_sizedims,box_sizedims*2-1)) += linpiece(height, linspace(0, box_maxsize, box_sizedims+1));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMAGE_bOXES_Hh_



