// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LBP_ABSTRACT_Hh_
#ifdef DLIB_LBP_ABSTRACT_Hh_

#include "../image_processing/generic_image.h"
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename image_type2
        >
    void make_uniform_lbp_image (
        const image_type& img,
        image_type2& lbp
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type2 should contain a grayscale pixel type such as unsigned char.
        ensures
            - #lbp.nr() == img.nr()
            - #lbp.nc() == img.nc()
            - This function extracts the uniform local-binary-pattern feature at every pixel
              and stores it into #lbp.  In particular, we have the following for all valid 
              r and c:
                - #lbp[r][c] == the uniform LBP for the 3x3 pixel window centered on img[r][c].  
                  In particular, this is a value in the range 0 to 58 inclusive. 
            - We use the idea of uniform LBPs from the paper: 
                Face Description with Local Binary Patterns: Application to Face Recognition
                by Ahonen, Hadid, and Pietikainen.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_histogram_descriptors (
        const image_type& img,
        const point& loc,
        std::vector<T>& histograms,
        const unsigned int cell_size = 10,
        const unsigned int block_size = 4,
        const unsigned int max_val = 58
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
            - image_type contains unsigned char valued pixels.
            - T is some scalar type like int or double
            - All pixel values in img are <= max_val
            - cell_size >= 1
            - block_size >= 1
            - max_val < 256
        ensures
            - This function extracts histograms of pixel values from block_size*block_size
              windows in the area in img immediately around img[loc.y()][loc.x()].  The
              histograms are appended onto the end of #histograms.  Each window is
              cell_size pixels wide and tall.  Moreover, the windows do not overlap.
            - #histograms.size() == histograms.size() + block_size*block_size*(max_val+1)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_uniform_lbp_descriptors (
        const image_type& img,
        std::vector<T>& feats,
        const unsigned int cell_size = 10
    );
    /*!
        requires
            - cell_size >= 1
            - T is some scalar type like int or double
        ensures
            - Extracts histograms of uniform local-binary-patterns from img.  The
              histograms are from densely tiled windows that are cell_size pixels wide and
              tall.  The windows do not overlap and cover all of img.
            - #feats.size() == 59*(number of windows that fit into img)
              (i.e. #feats contains the LBP histograms)
            - We will have taken the square root of all the histogram elements.  That is,
              #feats[i] is the square root of the number of LBPs that appeared in its
              corresponding window.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_highdim_face_lbp_descriptors (
        const image_type& img,
        const full_object_detection& det,
        std::vector<T>& feats
    );
    /*!
        requires
            - T is some scalar type like int or double
            - det.num_parts() == 68
        ensures
            - This function extracts the high-dimensional LBP feature described in the
              paper:
                Blessing of Dimensionality: High-dimensional Feature and Its Efficient
                Compression for Face Verification by Dong Chen, Xudong Cao, Fang Wen, and
                Jian Sun
            - #feats == the high-dimensional LBP descriptor.  It is the concatenation of
              many LBP histograms, each extracted from different scales and from different
              windows around different face landmarks.  We also take the square root of
              each histogram element before storing it into #feats.
            - #feats.size() == 99120
            - This function assumes img has already been aligned and normalized to a
              standard size.
            - This function assumes det contains a human face detection with face parts
              annotated using the annotation scheme from the iBUG 300-W face landmark
              dataset.  This means that det.part(i) gives the locations of different face
              landmarks according to the iBUG 300-W annotation scheme.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LBP_ABSTRACT_Hh_

