// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEGMENT_ImAGE_ABSTRACT_Hh_
#ifdef DLIB_SEGMENT_ImAGE_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void segment_image (
        const in_image_type& in_img,
        out_image_type& out_img,
        const double k = 200,
        const unsigned long min_size = 10
    );
    /*!
        requires
            - in_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - out_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - in_image_type can contain any pixel type with a pixel_traits specialization
              or a dlib matrix object representing a row or column vector.
            - out_image_type must contain an unsigned integer pixel type.
            - is_same_object(in_img, out_img) == false
        ensures
            - Attempts to segment in_img into regions which have some visual consistency to
              them.  In particular, this function implements the algorithm described in the
              paper: Efficient Graph-Based Image Segmentation by Felzenszwalb and Huttenlocher.
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - for all valid r and c:
                - #out_img[r][c] == an integer value indicating the identity of the segment
                  containing the pixel in_img[r][c].  
            - The k parameter is a measure used to influence how large the segment regions
              will be.  Larger k generally results in larger segments being produced.  For
              a deeper discussion of the k parameter you should consult the above
              referenced paper.
            - min_size is a lower bound on the size of the output segments.  That is, it is
              guaranteed that all output segments will have at least min_size pixels in
              them (unless the whole image contains fewer than min_size pixels, in this
              case the entire image will be put into a single segment).
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename EXP
        >
    void find_candidate_object_locations (
        const in_image_type& in_img,
        std::vector<rectangle>& rects,
        const matrix_exp<EXP>& kvals = linspace(50, 200, 3),
        const unsigned long min_size = 20,
        const unsigned long max_merging_iterations = 50
    );
    /*!
        requires
            - in_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - is_vector(kvals) == true
            - kvals.size() > 0
        ensures
            - This function takes an input image and generates a set of candidate
              rectangles which are expected to bound any objects in the image.  It does
              this by running a version of the segment_image() routine on the image and
              then reports rectangles containing each of the segments as well as rectangles
              containing unions of adjacent segments.  The basic idea is described in the
              paper: 
                  Segmentation as Selective Search for Object Recognition by Koen E. A. van de Sande, et al.
              Note that this function deviates from what is described in the paper slightly. 
              See the code for details.
            - The basic segmentation is performed kvals.size() times, each time with the k
              parameter (see segment_image() and the Felzenszwalb paper for details on k)
              set to a different value from kvals.   
            - When doing the basic segmentations prior to any box merging, we discard all
              rectangles that have an area < min_size.  Therefore, all outputs and
              subsequent merged rectangles are built out of rectangles that contain at
              least min_size pixels.  Note that setting min_size to a smaller value than
              you might otherwise be interested in using can be useful since it allows a
              larger number of possible merged boxes to be created.
            - There are max_merging_iterations rounds of neighboring blob merging.
              Therefore, this parameter has some effect on the number of output rectangles
              you get, with larger values of the parameter giving more output rectangles.
            - This function appends the output rectangles into #rects.  This means that any
              rectangles in rects before this function was called will still be in there
              after it terminates.  Note further that #rects will not contain any duplicate
              rectangles.  That is, for all valid i and j where i != j it will be true
              that:
                - #rects[i] != rects[j]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename alloc
        >
    void remove_duplicates (
        std::vector<rectangle,alloc>& rects
    );
    /*!
        ensures
            - This function finds any duplicate rectangles in rects and removes the extra
              instances.  This way, the result is that rects contains only unique rectangle
              instances.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEGMENT_ImAGE_ABSTRACT_Hh_


