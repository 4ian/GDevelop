// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <ctime>
#include <cstdlib>

#include <dlib/conditioning_class.h>

#include "tester.h"
#include "conditioning_class.h"

namespace  
{


    class conditioning_class_tester : public tester
    {
    public:
        conditioning_class_tester (
        ) :
            tester ("test_conditioning_class_c",
                    "Runs tests on the conditioning_class checked components.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_1a_c,
                conditioning_class<2>::kernel_1a_c
                >();
            print_spinner();

            dlog << LINFO << "testing kernel_2a_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_2a_c,
                conditioning_class<2>::kernel_2a_c
                >();
            print_spinner();

            dlog << LINFO << "testing kernel_3a_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_3a_c,
                conditioning_class<2>::kernel_3a_c
                >();
            print_spinner();

            dlog << LINFO << "testing kernel_4a_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_4a_c,
                conditioning_class<2>::kernel_4a_c
                >();
            print_spinner();

            dlog << LINFO << "testing kernel_4b_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_4b_c,
                conditioning_class<2>::kernel_4b_c
                >();
            print_spinner();


            dlog << LINFO << "testing kernel_4c_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_4c_c,
                conditioning_class<2>::kernel_4c_c
                >();
            print_spinner();

            dlog << LINFO << "testing kernel_4d_c";
            conditioning_class_kernel_test<
                conditioning_class<256>::kernel_4d_c,
                conditioning_class<2>::kernel_4d_c
                >();
            print_spinner();


        }
    } a;


}

