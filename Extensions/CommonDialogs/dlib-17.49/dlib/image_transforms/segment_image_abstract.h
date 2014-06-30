// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEGMENT_ImAGE_ABSTRACT_H__
#ifdef DLIB_SEGMENT_ImAGE_ABSTRACT_H__

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
        const unsigned long k = 200,
        const unsigned long min_diff = 0
    );
    /*!
        requires
            - in_image_type  == an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == an implementation of array2d/array2d_kernel_abstract.h
            - in_image_type::type  == an unsigned 8-bit or 16bit integer type. 
            - out_image_type::type == unsigned integer type 
            - is_same_object(in_img, out_img) == false
        ensures
            - Attempts to segment in_img into regions which have some visual consistency to them.
              In particular, this function implements the algorithm described in the paper:
              Efficient Graph-Based Image Segmentation by Felzenszwalb and Huttenlocher.
            - #out_img.nr() == in_img.nr()
            - #out_img.nc() == in_img.nc()
            - for all valid r and c:
                - #out_img[r][c] == an integer value indicating the identity of the segment
                  containing the pixel in_img[r][c].  
            - The k parameter is a measure used to influence how large the segment regions will
              be.  Larger k generally results in larger segments being produced.  For a deeper 
              discussion of the k parameter you should consult the above referenced paper.
            - Any neighboring segments with an edge between them with a pixel difference <= min_diff 
              will always be merged.  So making min_diff bigger makes this algorithm more eager
              to merge neighboring segments.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEGMENT_ImAGE_ABSTRACT_H__


