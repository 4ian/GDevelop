// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_NUM_NONNEGATIVE_WEIGHtS_Hh_
#define DLIB_NUM_NONNEGATIVE_WEIGHtS_Hh_

#include "../enable_if.h"

namespace dlib
{

    namespace impl2
    {
        template <
            typename T,
            unsigned long (T::*funct)()const
            >
        struct hnnf_helper
        {
            typedef char type;
        };

        template <typename T>
        char has_num_nonnegative_weights_helper( typename hnnf_helper<T,&T::num_nonnegative_weights>::type = 0 ) { return 0;}

        struct two_bytes
        {
            char a[2]; 
        };

        template <typename T>
        two_bytes has_num_nonnegative_weights_helper(int) { return two_bytes();}

        template <typename T>
        struct work_around_visual_studio_bug
        {
            const static unsigned long U = sizeof(has_num_nonnegative_weights_helper<T>('a'));
        };


        // This is a template to tell you if a feature_extractor has a num_nonnegative_weights function or not.
        template <typename T, unsigned long U = work_around_visual_studio_bug<T>::U > 
        struct has_num_nonnegative_weights 
        {
            static const bool value = false;
        };

        template <typename T>
        struct has_num_nonnegative_weights <T,1>
        {
            static const bool value = true;
        };


    }

    // call fe.num_nonnegative_weights() if it exists, otherwise return 0.
    template <typename feature_extractor>
    typename enable_if<impl2::has_num_nonnegative_weights<feature_extractor>,unsigned long>::type num_nonnegative_weights (
    const feature_extractor& fe
    )
    {
        return fe.num_nonnegative_weights();
    }

    template <typename feature_extractor>
    typename disable_if<impl2::has_num_nonnegative_weights<feature_extractor>,unsigned long>::type num_nonnegative_weights (
    const feature_extractor& /*fe*/
    )
    {
        return 0;
    }

}

#endif // DLIB_NUM_NONNEGATIVE_WEIGHtS_Hh_

