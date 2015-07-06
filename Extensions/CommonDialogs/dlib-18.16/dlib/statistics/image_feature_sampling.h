// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IMAGE_FEATURE_SaMPLING_Hh_
#define DLIB_IMAGE_FEATURE_SaMPLING_Hh_

#include "image_feature_sampling_abstract.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename feature_extractor_type,
        typename pyramid_type
        >
    random_subset_selector<typename feature_extractor_type::descriptor_type> randomly_sample_image_features (
        const image_array_type& images,
        const pyramid_type& pyr,
        const feature_extractor_type& fe_,
        unsigned long num
    )
    {
        feature_extractor_type fe;
        fe.copy_configuration(fe_);
        random_subset_selector<typename feature_extractor_type::descriptor_type> basis;
        basis.set_max_size(num);

        typedef typename image_array_type::type image_type;
        image_type temp_img, temp_img2;

        for (unsigned long i = 0; i < images.size(); ++i)
        {
            bool at_pyramid_top = true;
            while (true)
            {
                if (at_pyramid_top)
                    fe.load(images[i]);
                else
                    fe.load(temp_img);
                
                if (fe.size() == 0)
                    break;

                for (long r = 0; r < fe.nr(); ++r)
                {
                    for (long c = 0; c < fe.nc(); ++c)
                    {
                        if (basis.next_add_accepts())
                        {
                            basis.add(fe(r,c));
                        }
                        else
                        {
                            basis.add();
                        }
                    }
                }

                if (at_pyramid_top)
                {
                    at_pyramid_top = false;
                    pyr(images[i], temp_img);
                }
                else
                {
                    pyr(temp_img, temp_img2);
                    swap(temp_img2,temp_img);
                }
            }
        }
        return basis;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_FEATURE_SaMPLING_Hh_

