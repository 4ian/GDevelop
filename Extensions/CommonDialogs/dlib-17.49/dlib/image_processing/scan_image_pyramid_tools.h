// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_IMaGE_PYRAMID_TOOLS_H__
#define DLIB_SCAN_IMaGE_PYRAMID_TOOLS_H__

#include "scan_image_pyramid_tools_abstract.h"
#include "scan_image_pyramid.h"
#include "../lsh.h"
#include "../statistics.h"
#include "../image_keypoint.h"
#include <list>
#include "../geometry.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_hash_construction_failure : public error
    {
    public:
        image_hash_construction_failure(
            const std::string& a
        ): error(a) {}
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename pyramid,
        typename feature_extractor
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, hashed_feature_image<feature_extractor, projection_hash> >& scanner,
        const image_array& images,
        const feature_extractor& fe,
        int bits,
        unsigned long num_samples = 200000
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < bits && bits <= 32 &&
                    num_samples > 1 && 
                    images.size() > 0,
            "\t void setup_hashed_features()"
            << "\n\t Invalid inputs were given to this function. "
            << "\n\t bits:          " << bits 
            << "\n\t num_samples:   " << num_samples 
            << "\n\t images.size(): " << images.size() 
            );

        pyramid pyr;

        const random_subset_selector<typename feature_extractor::descriptor_type>& samps = 
            randomly_sample_image_features(images, pyr, fe, num_samples);

        if (samps.size() <= 1)
            throw dlib::image_hash_construction_failure("Images too small, not able to gather enough samples to make hash");

        projection_hash phash = create_random_projection_hash(samps, bits);

        hashed_feature_image<feature_extractor, projection_hash> hfe;
        hfe.set_hash(phash);
        hfe.copy_configuration(fe);
        scanner.copy_configuration(hfe);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename pyramid,
        typename feature_extractor
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, hashed_feature_image<feature_extractor, projection_hash> >& scanner,
        const image_array& images,
        int bits,
        unsigned long num_samples = 200000
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < bits && bits <= 32 &&
                    num_samples > 1 && 
                    images.size() > 0,
            "\t void setup_hashed_features()"
            << "\n\t Invalid inputs were given to this function. "
            << "\n\t bits:          " << bits 
            << "\n\t num_samples:   " << num_samples 
            << "\n\t images.size(): " << images.size() 
            );

        feature_extractor fe;
        setup_hashed_features(scanner, images, fe, bits, num_samples);
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline bool compare_first (
            const std::pair<unsigned long,rectangle>& a,
            const std::pair<unsigned long,rectangle>& b
        )
        {
            return a.first < b.first;
        }
    }


    template <typename image_scanner_type>
    std::vector<rectangle> determine_object_boxes (
        const image_scanner_type& scanner,
        const std::vector<rectangle>& rects,
        double min_match_score
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < min_match_score && min_match_score <= 1,
            "\t std::vector<rectangle> determine_object_boxes()"
            << "\n\t Invalid inputs were given to this function. "
            << "\n\t min_match_score: " << min_match_score 
            );

        typename image_scanner_type::pyramid_type pyr;

        typedef std::list<std::pair<unsigned long, rectangle> > list_type;

        unsigned long max_area = 0;

        // copy rects into sorted_rects and sort them in order of increasing area
        list_type sorted_rects;
        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            max_area = std::max(rects[i].area(), max_area);
            sorted_rects.push_back(std::make_pair(rects[i].area(), rects[i]));
        }
        sorted_rects.sort(dlib::impl::compare_first);

        // Make sure this area value is comfortably larger than all the 
        // rectangles' areas.
        max_area = 3*max_area + 100;

        std::vector<rectangle> object_boxes;

        while (sorted_rects.size() != 0)
        {
            rectangle cur = sorted_rects.front().second;
            sorted_rects.pop_front();
            object_boxes.push_back(centered_rect(point(0,0), cur.width(), cur.height()));

            // Scale cur up the image pyramid and remove any rectangles which match.
            // But also stop when cur gets large enough to not match anything.
            for (unsigned long itr = 0; 
                 itr < scanner.get_max_pyramid_levels() && cur.area() < max_area; 
                 ++itr)
            {
                list_type::iterator i = sorted_rects.begin();
                while (i != sorted_rects.end())
                {
                    const rectangle temp = move_rect(i->second, cur.tl_corner());
                    const double match_score = (cur.intersect(temp).area())/(double)(cur + temp).area();
                    if (match_score > min_match_score)
                    {
                        i = sorted_rects.erase(i);
                    }
                    else
                    {
                        ++i;
                    }
                }

                cur = pyr.rect_up(cur);
            }

        }

        return object_boxes;
    }

// ----------------------------------------------------------------------------------------

    template <typename image_scanner_type>
    std::vector<rectangle> determine_object_boxes (
        const image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        double min_match_score
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < min_match_score && min_match_score <= 1,
            "\t std::vector<rectangle> determine_object_boxes()"
            << "\n\t Invalid inputs were given to this function. "
            << "\n\t min_match_score: " << min_match_score 
            );

        std::vector<rectangle> temp;
        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            for (unsigned long j = 0; j < rects[i].size(); ++j)
            {
                temp.push_back(rects[i][j]);
            }
        }

        return determine_object_boxes(scanner, temp, min_match_score);
    }

// ----------------------------------------------------------------------------------------

    template <typename image_scanner_type>
    void setup_grid_detection_templates (
        image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        unsigned int cells_x,
        unsigned int cells_y,
        double min_match_score = 0.75
    )
    {
        const std::vector<rectangle>& object_boxes = determine_object_boxes(scanner, rects, min_match_score);
        for (unsigned long i = 0; i < object_boxes.size(); ++i)
        {
            scanner.add_detection_template(object_boxes[i], create_grid_detection_template(object_boxes[i], cells_x, cells_y));
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename image_scanner_type>
    void setup_grid_detection_templates_verbose (
        image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        unsigned int cells_x,
        unsigned int cells_y,
        double min_match_score = 0.75
    )
    {
        const std::vector<rectangle>& object_boxes = determine_object_boxes(scanner, rects, min_match_score);
        std::cout << "number of detection templates: "<< object_boxes.size() << std::endl;
        for (unsigned long i = 0; i < object_boxes.size(); ++i)
        {
            std::cout << "  object box " << i << ":  width: " << object_boxes[i].width() 
                      << "  height: "<< object_boxes[i].height() << std::endl;
            scanner.add_detection_template(object_boxes[i], create_grid_detection_template(object_boxes[i], cells_x, cells_y));
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_IMaGE_PYRAMID_TOOLS_H__

