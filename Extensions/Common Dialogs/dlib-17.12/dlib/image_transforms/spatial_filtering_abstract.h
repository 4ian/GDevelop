// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SPATIAL_FILTERINg_ABSTRACT_
#ifdef DLIB_SPATIAL_FILTERINg_ABSTRACT_

#include "../pixel.h"

namespace dlib
{

    template <
        typename in_image_type,
        typename out_image_type,
        typename filter_type,
        long M,
        long N
        >
    void spatially_filter_image (
        const in_image_type& in_img,
        out_image_type& out_img,
        const filter_type (&filter)[M][N],
        unsigned long scale = 1,
        bool use_abs = false
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - &in_img != &out_img
            - scale > 0
            - M % 2 == 1  (i.e. M must be odd)
            - N % 2 == 1  (i.e. N must be odd)
        ensures
            - Applies the given spatial filter to in_img and stores the result in out_img.  Also 
              divides each resulting pixel by scale.  
            - pixel values after filtering that are > pixel_traits<out_image_type>::max() are
              set to pixel_traits<out_image_type>::max()
            - if (pixel_traits<typename in_image_type::type>::grayscale == false) then
                - the pixel values are converted to the HSI color space and the filtering
                  is done on the intensity channel only.
            - if (use_abs == true) then
                - pixel values after filtering that are < 0 are converted to their absolute values
            - else
                - pixel values after filtering that are < 0 are assigned the value of 0
            - Pixels close enough to the edge of in_img to not have the filter still fit 
              inside the image are not modified.  i.e. Whatever value the border of out_img
              had to begin with is what it will have after this function returns.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/


}

#endif // DLIB_SPATIAL_FILTERINg_ABSTRACT_

