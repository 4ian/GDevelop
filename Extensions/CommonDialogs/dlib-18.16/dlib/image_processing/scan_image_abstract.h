// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_iMAGE_ABSTRACT_Hh_
#ifdef DLIB_SCAN_iMAGE_ABSTRACT_Hh_

#include <vector>
#include <utility>
#include "../algs.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    bool all_images_same_size (
        const image_array_type& images
    );
    /*!
        requires
            - image_array_type       == an implementation of array/array_kernel_abstract.h
            - image_array_type::type == an image object that implements the interface
              defined in dlib/image_processing/generic_image.h 
        ensures
            - if (all elements of images have the same dimensions (i.e. 
              for all i and j: get_rect(images[i]) == get_rect(images[j]))) then
                - returns true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    double sum_of_rects_in_images (
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const point& position
    );
    /*!
        requires
            - image_array_type             == an implementation of array/array_kernel_abstract.h
            - image_array_type::type       == an image object that implements the interface
              defined in dlib/image_processing/generic_image.h.  Moreover, these objects must
              contain a scalar pixel type (e.g. int rather than rgb_pixel)
            - all_images_same_size(images) == true
            - for all valid i: rects[i].first < images.size()
              (i.e. all the rectangles must reference valid elements of images)
        ensures
            - returns the sum of the pixels inside the given rectangles.  To be precise, 
              let RECT_SUM[i] = sum of pixels inside the rectangle translate_rect(rects[i].second, position) 
              from the image images[rects[i].first].  Then this function returns the 
              sum of RECT_SUM[i] for all the valid values of i.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    double sum_of_rects_in_images_movable_parts (
        const image_array_type& images,
        const rectangle& window,
        const std::vector<std::pair<unsigned int, rectangle> >& fixed_rects,
        const std::vector<std::pair<unsigned int, rectangle> >& movable_rects,
        const point& position
    );
    /*!
        requires
            - image_array_type             == an implementation of array/array_kernel_abstract.h
            - image_array_type::type       == an image object that implements the interface
              defined in dlib/image_processing/generic_image.h.  Moreover, these objects must
              contain a scalar pixel type (e.g. int rather than rgb_pixel)
            - all_images_same_size(images) == true
            - center(window) == point(0,0)
            - for all valid i: 
                - fixed_rects[i].first < images.size()
                  (i.e. all the rectangles must reference valid elements of images)
            - for all valid i: 
                - movable_rects[i].first < images.size()
                  (i.e. all the rectangles must reference valid elements of images)
                - center(movable_rects[i].second) == point(0,0) 
        ensures
            - returns the sum of the pixels inside fixed_rects as well as the sum of the pixels
              inside movable_rects when these latter rectangles are placed at their highest
              scoring locations inside the given window.  To be precise: 
                - let RECT_SUM(r,x) = sum of pixels inside the rectangle translate_rect(r.second, x) 
                  from the image images[r.first].
                - let WIN_MAX(i) = The maximum value of RECT_SUM(movable_rects[i],X) when maximizing
                  over all the X such that translate_rect(window,position).contains(X) == true.

                - let TOTAL_FIXED   == sum over all elements R in fixed_rects of: RECT_SUM(R,position)
                - let TOTAL_MOVABLE == sum over all valid i of: max(WIN_MAX(i), 0)

              Then this function returns TOTAL_FIXED + TOTAL_MOVABLE.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void find_points_above_thresh (
        std::vector<std::pair<double, point> >& dets,
        const image_type& img,
        const double thresh,
        const unsigned long max_dets
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h.  Moreover, these it must contain a
              scalar pixel type (e.g. int rather than rgb_pixel)
        ensures
            - #dets == a list of points from img which had pixel values >= thresh.  
            - Specifically, we have:
                - #dets.size() <= max_dets
                  (note that dets is cleared before new detections are added by find_points_above_thresh())
                - for all valid i:
                    - #dets[i].first == img[#dets[i].second.y()][#dets[i].second.x()] 
                      (i.e. the first field contains the value of the pixel at this detection location)
                    - #dets[i].first >= thresh
            - if (there are more than max_dets locations that pass the above threshold test) then
                - #dets == a random subsample of all the locations which passed the threshold
                  test.  
            - else
                - #dets == all the points which passed the threshold test.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const double thresh,
        const unsigned long max_dets
    );
    /*!
        requires
            - image_array_type             == an implementation of array/array_kernel_abstract.h
            - image_array_type::type       == an image object that implements the interface
              defined in dlib/image_processing/generic_image.h.  Moreover, these objects must
              contain a scalar pixel type (e.g. int rather than rgb_pixel)
            - images.size() > 0
            - rects.size() > 0 
            - all_images_same_size(images) == true
            - for all valid i: rects[i].first < images.size()
              (i.e. all the rectangles must reference valid elements of images)
        ensures
            - slides the set of rectangles over the image space and reports the locations
              which give a sum bigger than thresh. 
            - Specifically, we have:
                - #dets.size() <= max_dets
                  (note that dets is cleared before new detections are added by scan_image())
                - for all valid i:
                    - #dets[i].first == sum_of_rects_in_images(images,rects,#dets[i].second) >= thresh
            - if (there are more than max_dets locations that pass the threshold test) then
                - #dets == a random subsample of all the locations which passed the threshold
                  test.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image_movable_parts (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const rectangle& window,
        const std::vector<std::pair<unsigned int, rectangle> >& fixed_rects,
        const std::vector<std::pair<unsigned int, rectangle> >& movable_rects,
        const double thresh,
        const unsigned long max_dets
    );
    /*!
        requires
            - image_array_type             == an implementation of array/array_kernel_abstract.h
            - image_array_type::type       == an image object that implements the interface
              defined in dlib/image_processing/generic_image.h.  Moreover, these objects must
              contain a scalar pixel type (e.g. int rather than rgb_pixel)
            - images.size() > 0
            - all_images_same_size(images) == true
            - center(window) == point(0,0)
            - window.area() > 0
            - for all valid i: 
                - fixed_rects[i].first < images.size()
                  (i.e. all the rectangles must reference valid elements of images)
            - for all valid i: 
                - movable_rects[i].first < images.size()
                  (i.e. all the rectangles must reference valid elements of images)
                - center(movable_rects[i].second) == point(0,0) 
                - movable_rects[i].second.area() > 0
        ensures
            - Scans the given window over the images and reports the locations with a score bigger
              than thresh.
            - Specifically, we have:
                - #dets.size() <= max_dets
                  (note that dets is cleared before new detections are added by scan_image_movable_parts())
                - for all valid i:
                    - #dets[i].first == sum_of_rects_in_images_movable_parts(images,
                                                                             window,
                                                                             fixed_rects,
                                                                             movable_rects,
                                                                             #dets[i].second) >= thresh
            - if (there are more than max_dets locations that pass the above threshold test) then
                - #dets == a random subsample of all the locations which passed the threshold
                  test.  
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_iMAGE_ABSTRACT_Hh_



