// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TO_OPEN_Cv_ABSTRACTh_
#ifdef DLIB_TO_OPEN_Cv_ABSTRACTh_

#include <opencv2/core/core.hpp>
#include "../pixel.h"

namespace dlib
{
    template <
        typename image_type
        >
    cv::Mat toMat (
        image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or a dlib::matrix object which uses a
              row_major_layout.
            - pixel_traits is defined for the contents of img.
        ensures
            - returns an OpenCV Mat object which represents the same image as img.  This
              is done by setting up the Mat object to point to the same memory as img.
              Therefore, the returned Mat object is valid only as long as pointers
              to the pixels in img remain valid.
    !*/
}

#endif // DLIB_TO_OPEN_Cv_ABSTRACTh_



