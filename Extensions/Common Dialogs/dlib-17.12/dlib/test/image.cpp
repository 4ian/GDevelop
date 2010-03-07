// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/pixel.h>
#include <dlib/array2d.h>
#include <dlib/image_transforms.h>
#include <dlib/image_io.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.image");


    void image_test (
    )
    /*!
        ensures
            - runs tests on pixel objects and functions for compliance with the specs 
    !*/
    {        

        print_spinner();

        array2d<unsigned char>::kernel_1a_c img1, img2;

        img1.set_size(100,100);

        assign_all_pixels(img1,7);

        assign_image(img2, img1);

        DLIB_CASSERT(img1.nr() == 100 && img1.nc() == 100 &&
                     img2.nr() == 100 && img2.nc() == 100,"");


        for (long r = 0; r < img1.nr(); ++r)
        {
            for (long c = 0; c < img1.nc(); ++c)
            {
                DLIB_CASSERT(img1[r][c] == 7,"");
                DLIB_CASSERT(img2[r][c] == 7,"");
            }
        }


        threshold_image(img1, img2, 4);

        for (long r = 0; r < img1.nr(); ++r)
        {
            for (long c = 0; c < img1.nc(); ++c)
            {
                DLIB_CASSERT(img1[r][c] == 7,"");
                DLIB_CASSERT(img2[r][c] == on_pixel,"");
            }
        }

        {
            array2d<hsi_pixel>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c].h = static_cast<unsigned char>(r*14 + c + 1);
                    img[r][c].s = static_cast<unsigned char>(r*14 + c + 2);
                    img[r][c].i = static_cast<unsigned char>(r*14 + c + 3);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            istringstream sin(sout.str());

            img.clear();
            DLIB_CASSERT(img.nr() == 0,"");
            DLIB_CASSERT(img.nc() == 0,"");

            load_dng(img, sin);
            
            DLIB_CASSERT(img.nr() == 14,"");
            DLIB_CASSERT(img.nc() == 15,"");

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_CASSERT(img[r][c].h == r*14 + c + 1, "");
                    DLIB_CASSERT(img[r][c].s == r*14 + c + 2, "");
                    DLIB_CASSERT(img[r][c].i == r*14 + c + 3, "");
                }
            }
        }




        {
            array2d<rgb_alpha_pixel>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c].red = static_cast<unsigned char>(r*14 + c + 1);
                    img[r][c].green = static_cast<unsigned char>(r*14 + c + 2);
                    img[r][c].blue = static_cast<unsigned char>(r*14 + c + 3);
                    img[r][c].alpha = static_cast<unsigned char>(r*14 + c + 4);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            istringstream sin(sout.str());

            img.clear();
            DLIB_CASSERT(img.nr() == 0,"");
            DLIB_CASSERT(img.nc() == 0,"");

            load_dng(img, sin);
            
            DLIB_CASSERT(img.nr() == 14,"");
            DLIB_CASSERT(img.nc() == 15,"");

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_CASSERT(img[r][c].red == r*14 + c + 1, "");
                    DLIB_CASSERT(img[r][c].green == r*14 + c + 2, "");
                    DLIB_CASSERT(img[r][c].blue == r*14 + c + 3, "");
                    DLIB_CASSERT(img[r][c].alpha == r*14 + c + 4, "");
                }
            }
        }



        {
            array2d<rgb_pixel>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c].red = static_cast<unsigned char>(r*14 + c + 1);
                    img[r][c].green = static_cast<unsigned char>(r*14 + c + 2);
                    img[r][c].blue = static_cast<unsigned char>(r*14 + c + 3);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            save_bmp(img, sout);
            save_dng(img, sout);
            save_bmp(img, sout);
            istringstream sin(sout.str());

            for (int i  = 0; i < 2; ++i)
            {
                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_dng(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c].red == r*14 + c + 1, "");
                        DLIB_CASSERT(img[r][c].green == r*14 + c + 2, "");
                        DLIB_CASSERT(img[r][c].blue == r*14 + c + 3, "");
                    }
                }

                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_bmp(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c].red == r*14 + c + 1, "got " << (int)img[r][c].red << "  but expected " << r*14 + c + 1);
                        DLIB_CASSERT(img[r][c].green == r*14 + c + 2, "");
                        DLIB_CASSERT(img[r][c].blue == r*14 + c + 3, "");
                    }
                }
            }
        }




        {
            array2d<unsigned short>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned short>(r*14 + c + 0xFF);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            istringstream sin(sout.str());

            img.clear();
            DLIB_CASSERT(img.nr() == 0,"");
            DLIB_CASSERT(img.nc() == 0,"");

            load_dng(img, sin);
            
            DLIB_CASSERT(img.nr() == 14,"");
            DLIB_CASSERT(img.nc() == 15,"");

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_CASSERT(img[r][c] == r*14 + c + 0xFF, "");
                }
            }
        }



        {
            array2d<unsigned char>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned char>(r*14 + c);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            save_bmp(img, sout);
            save_dng(img, sout);
            save_bmp(img, sout);
            istringstream sin(sout.str());

            for (int i = 0; i < 2; ++i)
            {
                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_dng(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c] == r*14 + c, "");
                    }
                }


                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_bmp(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c] == r*14 + c, "");
                    }
                }
            }
        }



        {
            // in this test we will only assign pixel values that can be
            // represented with 8 bits even though we are using a wider pixel type.
            array2d<unsigned short>::kernel_1a img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned char>(r*14 + c);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            save_bmp(img, sout);
            save_dng(img, sout);
            save_bmp(img, sout);
            istringstream sin(sout.str());

            for (int i = 0; i < 2; ++i)
            {
                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_dng(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c] == r*14 + c, "");
                    }
                }


                img.clear();
                DLIB_CASSERT(img.nr() == 0,"");
                DLIB_CASSERT(img.nc() == 0,"");

                load_bmp(img, sin);

                DLIB_CASSERT(img.nr() == 14,"");
                DLIB_CASSERT(img.nc() == 15,"");

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_CASSERT(img[r][c] == r*14 + c, "");
                    }
                }
            }
        }

        {
            array2d<unsigned short>::kernel_1a_c img1;
            array2d<unsigned char>::kernel_1a_c img2;
            img1.set_size(10,10);
            assign_all_pixels(img1, 0);

            img1[5][5] = 10000;
            img1[7][7] = 10000;

            equalize_histogram(img1, img2);

            for (long r = 0; r < img1.nr(); ++r)
            {
                for (long c = 0; c < img2.nc(); ++c)
                {
                    if ((r == 5 && c == 5) ||
                        (r == 7 && c == 7))
                    {
                        DLIB_CASSERT(img2[r][c] == 255, "");
                    }
                    else
                    {
                        DLIB_CASSERT(img2[r][c] == 0, "");
                    }
                }
            }

        }



    }




    class image_tester : public tester
    {
    public:
        image_tester (
        ) :
            tester ("test_image",
                    "Runs tests on the image processing objects and functions.")
        {}

        void perform_test (
        )
        {
            image_test();
        }
    } a;

}



