// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/image_keypoint.h>
#include <dlib/array2d.h>
#include <dlib/rand.h>
#include <dlib/pixel.h>
#include <dlib/image_transforms.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.hog_image");

// ----------------------------------------------------------------------------------------

    class test_hog_image : public tester
    {
    public:
        test_hog_image (
        ) :
            tester ("test_hog_image",
                    "Runs tests on the hog_image object.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            array2d<unsigned char> img;
            img.set_size(200,200);

            assign_all_pixels(img, 0);

            hog_image<3,3,1,4,hog_signed_gradient,hog_full_interpolation> hog1, hog1_deserialized;    
            hog_image<4,4,2,4,hog_signed_gradient,hog_full_interpolation> hog2;    

            hog1.load(img);
            hog2.load(img);


            // Just test all the coordinate mapping functions.

            DLIB_TEST(hog1.get_block_rect(0,0).width() == 3*3);
            DLIB_TEST(hog1.get_block_rect(0,0).height() == 3*3);
            DLIB_TEST(hog2.get_block_rect(0,0).width() == 4*4);
            DLIB_TEST(hog2.get_block_rect(0,0).height() == 4*4);

            DLIB_TEST(get_rect(img).contains(hog1.get_block_rect(0,0)));
            DLIB_TEST(get_rect(img).contains(hog1.get_block_rect(hog1.nr()-1,hog1.nc()-1)));
            DLIB_TEST(get_rect(img).contains(hog2.get_block_rect(0,0)));
            DLIB_TEST(get_rect(img).contains(hog2.get_block_rect(hog2.nr()-1,hog2.nc()-1)));

            dlib::rand rnd;
            for (int i = 0; i < 20000; ++i)
            {
                point p(rnd.get_random_16bit_number(), rnd.get_random_16bit_number());
                p.x() -= 20000;
                p.y() -= 20000;

                DLIB_TEST((hog1.feat_to_image_space(hog1.image_to_feat_space(p)) - p).length() <= 3);
                DLIB_TEST((hog2.feat_to_image_space(hog2.image_to_feat_space(p)) - p).length() <= 10);

                DLIB_TEST_MSG((hog1.image_to_feat_space(hog1.feat_to_image_space(p)) - p).length() <= 3,
                              p << "   " << hog1.feat_to_image_space(p) << "   " << hog1.image_to_feat_space(hog1.feat_to_image_space(p)) );
                DLIB_TEST((hog2.image_to_feat_space(hog2.feat_to_image_space(p)) - p).length() <= 10);
            }


            DLIB_TEST(hog1.feat_to_image_space(point(0,0)) == point(5,5));
            DLIB_TEST(hog2.feat_to_image_space(point(0,0)) == point(9,9));

            DLIB_TEST(hog1.feat_to_image_space(point(1,1)) == point(8,8));
            DLIB_TEST(hog2.feat_to_image_space(point(1,1)) == point(17,17));

            DLIB_TEST(hog1.image_to_feat_space(hog1.feat_to_image_space(point(0,0))) == point(0,0));
            DLIB_TEST(hog2.image_to_feat_space(hog2.feat_to_image_space(point(0,0))) == point(0,0));
            DLIB_TEST(hog1.image_to_feat_space(hog1.feat_to_image_space(point(1,1))) == point(1,1));
            DLIB_TEST(hog2.image_to_feat_space(hog2.feat_to_image_space(point(1,1))) == point(1,1));
            DLIB_TEST(hog1.image_to_feat_space(hog1.feat_to_image_space(point(1,2))) == point(1,2));
            DLIB_TEST(hog2.image_to_feat_space(hog2.feat_to_image_space(point(1,2))) == point(1,2));



            DLIB_TEST(hog1_deserialized.size() != hog1.size());
            DLIB_TEST(hog1_deserialized.nr() != hog1.nr());
            DLIB_TEST(hog1_deserialized.nc() != hog1.nc());
            ostringstream sout;
            serialize(hog1, sout);
            istringstream sin(sout.str());
            deserialize(hog1_deserialized, sin);

            DLIB_TEST(hog1_deserialized.size() == hog1.size());
            DLIB_TEST(hog1_deserialized.nr() == hog1.nr());
            DLIB_TEST(hog1_deserialized.nc() == hog1.nc());
            DLIB_TEST(hog1_deserialized(0,2) == hog1(0,2));
            DLIB_TEST(hog1_deserialized.get_block_rect(1,2) == hog1.get_block_rect(1,2));
            DLIB_TEST(hog1_deserialized.image_to_feat_space(hog1_deserialized.feat_to_image_space(point(0,0))) == point(0,0));
            DLIB_TEST(hog1_deserialized.image_to_feat_space(hog1_deserialized.feat_to_image_space(point(1,1))) == point(1,1));
            DLIB_TEST(hog1_deserialized.image_to_feat_space(hog1_deserialized.feat_to_image_space(point(1,2))) == point(1,2));



            DLIB_TEST(hog1.size() > 1);
            DLIB_TEST(hog1.nr() > 1);
            DLIB_TEST(hog1.nc() > 1);
            hog1.clear();
            DLIB_TEST(hog1.size() == 0);
            DLIB_TEST(hog1.nr() == 0);
            DLIB_TEST(hog1.nc() == 0);
        }
    } a;

}




