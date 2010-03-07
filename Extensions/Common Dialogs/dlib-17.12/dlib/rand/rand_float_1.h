// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RAND_FLOAt_1_
#define DLIB_RAND_FLOAt_1_ 

#include "rand_float_abstract.h"
#include "../algs.h"
#include <limits>
#include "../uintn.h"

namespace dlib
{

    template <
        typename rand_base 
        >
    class rand_float_1 : public rand_base
    {
        double max_val;
        public:
            rand_float_1 ()
            {
                max_val =  0xFFFFFF;
                max_val *= 0x1000000;
                max_val += 0xFFFFFF;
                max_val += 0.01;
            }


            double get_random_double (
            )
            {
                uint32 temp;

                temp = rand_base::get_random_32bit_number();
                temp &= 0xFFFFFF;

                double val = static_cast<double>(temp);

                val *= 0x1000000;

                temp = rand_base::get_random_32bit_number();
                temp &= 0xFFFFFF;

                val += temp;

                val /= max_val;

                if (val < 1.0)
                {
                    return val;
                }
                else
                {
                    // return a value slightly less than 1.0
                    return 1.0 - std::numeric_limits<double>::epsilon();
                }
            }

            float get_random_float (
            )
            {
                uint32 temp;

                temp = rand_base::get_random_32bit_number();
                temp &= 0xFFFFFF;

                const float scale = 1.0/0x1000000;

                const float val = static_cast<float>(temp)*scale;
                if (val < 1.0f)
                {
                    return val;
                }
                else
                {
                    // return a value slightly less than 1.0
                    return 1.0f - std::numeric_limits<float>::epsilon();
                }
            }

    };

    template <
        typename rand_base
        >
    inline void swap (
        rand_float_1<rand_base>& a, 
        rand_float_1<rand_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RAND_FLOAt_1_ 


