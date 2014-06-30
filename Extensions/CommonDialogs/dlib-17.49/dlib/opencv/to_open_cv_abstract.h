// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TO_OPEN_Cv_ABSTRACT__
#ifdef DLIB_TO_OPEN_Cv_ABSTRACT__

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
            - image_type == an implementation of dlib/array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined
        ensures
            - returns an OpenCV Mat object which represents the same image as img.  This
              is done by setting up the Mat object to point to the same memory as img.
              Therefore, the returned Mat object is valid only as long as pointers
              to the pixels in img remain valid.
    !*/
}

#endif // DLIB_TO_OPEN_Cv_ABSTRACT__



