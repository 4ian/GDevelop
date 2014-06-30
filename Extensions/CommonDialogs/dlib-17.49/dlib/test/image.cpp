// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/pixel.h>
#include <dlib/array2d.h>
#include <dlib/image_transforms.h>
#include <dlib/image_io.h>
#include <dlib/matrix.h>
#include <dlib/rand.h>

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

        array2d<unsigned char> img1, img2;

        img1.set_size(100,100);

        assign_all_pixels(img1,7);

        assign_image(img2, img1);

        DLIB_TEST_MSG(img1.nr() == 100 && img1.nc() == 100 &&
                     img2.nr() == 100 && img2.nc() == 100,"");


        for (long r = 0; r < img1.nr(); ++r)
        {
            for (long c = 0; c < img1.nc(); ++c)
            {
                DLIB_TEST(img1[r][c] == 7);
                DLIB_TEST(img2[r][c] == 7);
            }
        }

        img2.clear();
        DLIB_TEST(img2.size() == 0);
        DLIB_TEST(img2.nr() == 0);
        DLIB_TEST(img2.nc() == 0);
        assign_image(img2, array_to_matrix(img1));

        DLIB_TEST_MSG(img1.nr() == 100 && img1.nc() == 100 &&
                     img2.nr() == 100 && img2.nc() == 100,"");


        for (long r = 0; r < img1.nr(); ++r)
        {
            for (long c = 0; c < img1.nc(); ++c)
            {
                DLIB_TEST(img1[r][c] == 7);
                DLIB_TEST(img2[r][c] == 7);
            }
        }


        threshold_image(img1, img2, 4);

        for (long r = 0; r < img1.nr(); ++r)
        {
            for (long c = 0; c < img1.nc(); ++c)
            {
                DLIB_TEST(img1[r][c] == 7);
                DLIB_TEST(img2[r][c] == on_pixel);
            }
        }

        {
            array2d<hsi_pixel> img;
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
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_dng(img, sin);
            
            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c].h == r*14 + c + 1);
                    DLIB_TEST(img[r][c].s == r*14 + c + 2);
                    DLIB_TEST(img[r][c].i == r*14 + c + 3);
                }
            }
        }




        {
            array2d<rgb_alpha_pixel> img;
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
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_dng(img, sin);
            
            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c].red == r*14 + c + 1);
                    DLIB_TEST(img[r][c].green == r*14 + c + 2);
                    DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    DLIB_TEST(img[r][c].alpha == r*14 + c + 4);
                }
            }
        }

#ifdef DLIB_PNG_SUPPORT
        {
            array2d<rgb_alpha_pixel> img;
            array2d<rgb_pixel> img2, img3;
            img.set_size(14,15);
            img2.set_size(img.nr(),img.nc());
            img3.set_size(img.nr(),img.nc());
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

            save_png(img, "test.png");

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_png(img, "test.png");
            
            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            assign_all_pixels(img2, 255);
            assign_all_pixels(img3, 0);
            load_png(img2, "test.png");
            assign_image(img3, img);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c].red == r*14 + c + 1);
                    DLIB_TEST(img[r][c].green == r*14 + c + 2);
                    DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    DLIB_TEST(img[r][c].alpha == r*14 + c + 4);

                    DLIB_TEST(img2[r][c].red == img3[r][c].red);
                    DLIB_TEST(img2[r][c].green == img3[r][c].green);
                    DLIB_TEST(img2[r][c].blue == img3[r][c].blue);
                }
            }
        }
#endif // DLIB_PNG_SUPPORT



        {
            array2d<rgb_pixel> img;
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
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_dng(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c].red == r*14 + c + 1);
                        DLIB_TEST(img[r][c].green == r*14 + c + 2);
                        DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    }
                }

                img.clear();
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_bmp(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST_MSG(img[r][c].red == r*14 + c + 1, "got " << (int)img[r][c].red << "  but expected " << r*14 + c + 1);
                        DLIB_TEST(img[r][c].green == r*14 + c + 2);
                        DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    }
                }
            }
        }
        {
            array2d<bgr_pixel> img;
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
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_dng(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c].red == r*14 + c + 1);
                        DLIB_TEST(img[r][c].green == r*14 + c + 2);
                        DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    }
                }

                img.clear();
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_bmp(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST_MSG(img[r][c].red == r*14 + c + 1, "got " << (int)img[r][c].red << "  but expected " << r*14 + c + 1);
                        DLIB_TEST(img[r][c].green == r*14 + c + 2);
                        DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                    }
                }
            }
        }

#ifdef DLIB_PNG_SUPPORT
        {
            array2d<rgb_pixel> img;
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

            save_png(img, "test.png");

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_png(img, "test.png");

            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c].red == r*14 + c + 1);
                    DLIB_TEST(img[r][c].green == r*14 + c + 2);
                    DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                }
            }
        }
        {
            array2d<bgr_pixel> img;
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

            save_png(img, "test.png");

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_png(img, "test.png");

            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c].red == r*14 + c + 1);
                    DLIB_TEST(img[r][c].green == r*14 + c + 2);
                    DLIB_TEST(img[r][c].blue == r*14 + c + 3);
                }
            }
        }
#endif // DLIB_PNG_SUPPORT



        {
            array2d<unsigned short> img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned short>(r*14 + c + 0xF0);
                }
            }

            ostringstream sout;
            save_dng(img, sout);
            istringstream sin(sout.str());

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_dng(img, sin);
            
            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c] == r*14 + c + 0xF0);
                }
            }
        }


#ifdef DLIB_PNG_SUPPORT
        {
            array2d<unsigned short> img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned short>(r*14 + c + 0xF0);
                }
            }

            save_png(img, "test.png");

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_png(img, "test.png");
            
            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c] == r*14 + c + 0xF0);
                }
            }
        }
#endif // DLIB_PNG_SUPPORT



        {
            array2d<unsigned char> img;
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
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_dng(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c] == r*14 + c);
                    }
                }


                img.clear();
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_bmp(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c] == r*14 + c);
                    }
                }
            }
        }


#ifdef DLIB_PNG_SUPPORT
        {
            array2d<unsigned char> img;
            img.set_size(14,15);
            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    img[r][c] = static_cast<unsigned char>(r*14 + c);
                }
            }

            save_png(img, "test.png");

            img.clear();
            DLIB_TEST(img.nr() == 0);
            DLIB_TEST(img.nc() == 0);

            load_png(img, "test.png");

            DLIB_TEST(img.nr() == 14);
            DLIB_TEST(img.nc() == 15);

            for (long r = 0; r < 14; ++r)
            {
                for (long c = 0; c < 15; ++c)
                {
                    DLIB_TEST(img[r][c] == r*14 + c);
                }
            }

        }
#endif // DLIB_PNG_SUPPORT


        {
            // in this test we will only assign pixel values that can be
            // represented with 8 bits even though we are using a wider pixel type.
            array2d<unsigned short> img;
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
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_dng(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c] == r*14 + c);
                    }
                }


                img.clear();
                DLIB_TEST(img.nr() == 0);
                DLIB_TEST(img.nc() == 0);

                load_bmp(img, sin);

                DLIB_TEST(img.nr() == 14);
                DLIB_TEST(img.nc() == 15);

                for (long r = 0; r < 14; ++r)
                {
                    for (long c = 0; c < 15; ++c)
                    {
                        DLIB_TEST(img[r][c] == r*14 + c);
                    }
                }
            }
        }

        {
            array2d<unsigned short> img1;
            array2d<unsigned char> img2;
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
                        DLIB_TEST(img2[r][c] == 255);
                    }
                    else
                    {
                        DLIB_TEST(img2[r][c] == 0);
                    }
                }
            }

        }

        {
            array2d<unsigned char> img;
            img.set_size(10,10);
            assign_all_pixels(img, 0);

            assign_border_pixels(img, 2,2, 4);

            DLIB_TEST(zeros_matrix<unsigned char>(6,6) == subm(array_to_matrix(img), rectangle(2,2,7,7)));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(array_to_matrix(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(array_to_matrix(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(array_to_matrix(img), 8));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(array_to_matrix(img), 9));

            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(array_to_matrix(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(array_to_matrix(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(array_to_matrix(img), 8));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(array_to_matrix(img), 9));


            assign_border_pixels(img, 7, 7, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(10,10, 5) == array_to_matrix(img));
            assign_border_pixels(img, 37, 47, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(10,10, 5) == array_to_matrix(img));
        }

        {
            array2d<unsigned char> img;
            img.set_size(11,11);
            assign_all_pixels(img, 0);

            assign_border_pixels(img, 2,2, 4);

            DLIB_TEST(zeros_matrix<unsigned char>(7,7) == subm(array_to_matrix(img), rectangle(2,2,8,8)));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(array_to_matrix(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(array_to_matrix(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(array_to_matrix(img), 9));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(array_to_matrix(img), 10));

            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(array_to_matrix(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(array_to_matrix(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(array_to_matrix(img), 9));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(array_to_matrix(img), 10));

            assign_border_pixels(img, 7, 7, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(11,11, 5) == array_to_matrix(img));
            assign_border_pixels(img, 70, 57, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(11,11, 5) == array_to_matrix(img));
        }


    }


    template <typename T, typename pixel_type>
    void test_integral_image (
    )
    {
        dlib::rand rnd;

        array2d<pixel_type> img;
        integral_image_generic<T> int_img;

        int_img.load(img);
        DLIB_TEST(int_img.nr() == 0);
        DLIB_TEST(int_img.nc() == 0);

        // make 5 random images
        for (int i = 0; i < 5; ++i)
        {
            print_spinner();
            img.set_size(rnd.get_random_16bit_number()%200+1, rnd.get_random_16bit_number()%200+1);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    img[r][c] = (int)rnd.get_random_8bit_number() - 100;
                }
            }

            int_img.load(img);
            DLIB_TEST(int_img.nr() == img.nr());
            DLIB_TEST(int_img.nc() == img.nc());

            // make 200 random rectangles
            for (int j = 0; j < 500; ++j)
            {
                point p1(rnd.get_random_32bit_number()%img.nc(), rnd.get_random_32bit_number()%img.nr());
                point p2(rnd.get_random_32bit_number()%img.nc(), rnd.get_random_32bit_number()%img.nr());
                rectangle rect(p1,p2);
                DLIB_TEST(int_img.get_sum_of_area(rect) == sum(subm(matrix_cast<T>(array_to_matrix(img)), rect)));
                rect = rectangle(p1,p1);
                DLIB_TEST(int_img.get_sum_of_area(rect) == sum(subm(matrix_cast<T>(array_to_matrix(img)), rect)));
            }

        }


    }

    template <typename T>
    void test_filtering(bool use_abs, unsigned long scale )
    {
        print_spinner();
        dlog << LINFO << "test_filtering(" << use_abs << "," << scale << ")";
        array2d<T> img, img2, img3;
        img.set_size(10,11);

        assign_all_pixels(img, 10);

        matrix<int,3,5> filter2;
        filter2 = 1,1,1,1,1,
                  1,1,1,1,1,
                  1,1,1,1,1;

        assign_all_pixels(img2,3);
        rectangle brect = spatially_filter_image(img, img2, filter2);
        DLIB_TEST(brect == shrink_rect(get_rect(img), filter2.nc()/2, filter2.nr()/2));

        const rectangle rect(2,1,img.nc()-3,img.nr()-2);

        for (long r = 0; r<img2.nr(); ++r)
        {
            for (long c = 0; c<img2.nc(); ++c)
            {
                if (rect.contains(c,r))
                {
                    DLIB_TEST_MSG(img2[r][c] == 150, (int)img2[r][c]);
                }
                else
                {
                    DLIB_TEST_MSG(img2[r][c] == 0,(int)img2[r][c]);
                }
            }
        }


        assign_all_pixels(img2,3);
        assign_all_pixels(img3,3);
        brect = spatially_filter_image(img, img2, filter2);
        DLIB_TEST(brect == shrink_rect(get_rect(img), filter2.nc()/2, filter2.nr()/2));

        matrix<int,1,5> row_filter;
        matrix<int,1,3> col_filter;

        row_filter = 1,1,1,1,1;
        col_filter = 1,1,1;

        spatially_filter_image_separable(img, img3, row_filter, col_filter);

        DLIB_TEST(array_to_matrix(img2) == array_to_matrix(img3));


        dlib::rand  rnd;

        for (int i = 0; i < 30; ++i)
        {
            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    img[r][c] = rnd.get_random_8bit_number();
                }
            }

            row_filter(0) = ((int)rnd.get_random_8bit_number() - 100)/10;
            row_filter(1) = ((int)rnd.get_random_8bit_number() - 100)/10;
            row_filter(2) = ((int)rnd.get_random_8bit_number() - 100)/10;
            row_filter(3) = ((int)rnd.get_random_8bit_number() - 100)/10;
            row_filter(4) = ((int)rnd.get_random_8bit_number() - 100)/10;
            col_filter(0) = ((int)rnd.get_random_8bit_number() - 100)/10;
            col_filter(1) = ((int)rnd.get_random_8bit_number() - 100)/10;
            col_filter(2) = ((int)rnd.get_random_8bit_number() - 100)/10;

            const matrix<int,3,5> filter = trans(col_filter)*row_filter;

            assign_all_pixels(img2,3);
            assign_all_pixels(img3,3);
            // Just make sure both filtering methods give the same results.
            rectangle brect1, brect2;
            brect1 = spatially_filter_image(img, img2, filter, scale, use_abs);
            brect2 = spatially_filter_image_separable(img, img3, row_filter, col_filter, scale, use_abs);
            DLIB_TEST(array_to_matrix(img2) == array_to_matrix(img3));

            DLIB_TEST(brect1 == shrink_rect(get_rect(img), filter.nc()/2, filter.nr()/2));
            DLIB_TEST(brect1 == brect2);
        }

        {
            array2d<int> img, img2;
            img.set_size(3,4);

            matrix<int> filter(3,3);
            filter = 1;
            assign_all_pixels(img,-1);

            spatially_filter_image(img,img2,filter);

            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(img2[1][1] == -9);
            DLIB_TEST(img2[1][2] == -9);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

            assign_all_pixels(img,-1);

            spatially_filter_image(img,img2,filter,2,true);

            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(img2[1][1] == 4);
            DLIB_TEST(img2[1][2] == 4);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

            matrix<int> rowf(3,1), colf(3,1);
            rowf = 1;
            colf = 1;
            assign_all_pixels(img,-1);

            spatially_filter_image_separable(img,img2,rowf,colf);
            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(img2[1][1] == -9);
            DLIB_TEST(img2[1][2] == -9);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

            spatially_filter_image_separable(img,img2,rowf,colf,1,true);
            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(img2[1][1] == 9);
            DLIB_TEST(img2[1][2] == 9);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

            assign_all_pixels(img2, 3);
            spatially_filter_image_separable(img,img2,rowf,colf,1,true, true);
            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST_MSG(img2[1][1] == 9+3, img2[1][1] );
            DLIB_TEST(img2[1][2] == 9+3);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);
        }
        {
            array2d<double> img, img2;
            img.set_size(3,4);

            matrix<double> filter(3,3);
            filter = 1;
            assign_all_pixels(img,-1);

            spatially_filter_image(img,img2,filter,2);

            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(std::abs(img2[1][1] -  -4.5) < 1e-14);
            DLIB_TEST(std::abs(img2[1][2] -  -4.5) < 1e-14);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

        }
        {
            array2d<double> img, img2;
            img.set_size(3,4);
            img2.set_size(3,4);
            assign_all_pixels(img2, 8);

            matrix<double> filter(3,3);
            filter = 1;
            assign_all_pixels(img,-1);

            spatially_filter_image(img,img2,filter,2, false, true);

            DLIB_TEST(img2[0][0] == 0);
            DLIB_TEST(img2[0][1] == 0);
            DLIB_TEST(img2[0][2] == 0);
            DLIB_TEST(img2[0][3] == 0);

            DLIB_TEST(img2[1][0] == 0);
            DLIB_TEST(std::abs(img2[1][1] -  -4.5 - 8) < 1e-14);
            DLIB_TEST(std::abs(img2[1][2] -  -4.5 - 8) < 1e-14);
            DLIB_TEST(img2[1][3] == 0);

            DLIB_TEST(img2[2][0] == 0);
            DLIB_TEST(img2[2][1] == 0);
            DLIB_TEST(img2[2][2] == 0);
            DLIB_TEST(img2[2][3] == 0);

        }
    }

    void test_zero_border_pixels(
    )
    {
        array2d<unsigned char> img;
        img.set_size(4,5);

        assign_all_pixels(img, 1);
        zero_border_pixels(img, 2,1);

        DLIB_TEST(img[0][0] == 0);
        DLIB_TEST(img[1][0] == 0);
        DLIB_TEST(img[2][0] == 0);
        DLIB_TEST(img[3][0] == 0);
        DLIB_TEST(img[0][1] == 0);
        DLIB_TEST(img[1][1] == 0);
        DLIB_TEST(img[2][1] == 0);
        DLIB_TEST(img[3][1] == 0);

        DLIB_TEST(img[0][3] == 0);
        DLIB_TEST(img[1][3] == 0);
        DLIB_TEST(img[2][3] == 0);
        DLIB_TEST(img[3][3] == 0);
        DLIB_TEST(img[0][4] == 0);
        DLIB_TEST(img[1][4] == 0);
        DLIB_TEST(img[2][4] == 0);
        DLIB_TEST(img[3][4] == 0);

        DLIB_TEST(img[0][2] == 0);
        DLIB_TEST(img[3][2] == 0);

        DLIB_TEST(img[1][2] == 1);
        DLIB_TEST(img[2][2] == 1);
    }


    void test_label_connected_blobs()
    {
        array2d<unsigned char> img;
        img.set_size(400,401);

        assign_all_pixels(img,0);

        rectangle rect1, rect2, rect3;

        rect1 = centered_rect(99,120, 50,70);
        rect2 = centered_rect(199,80, 34,68);
        rect3 = centered_rect(249,180, 120,78);

        fill_rect(img, rect1, 255);
        fill_rect(img, rect2, 255);
        fill_rect(img, rect3, 255);

        array2d<unsigned char> labels;
        unsigned long num;
        num = label_connected_blobs(img, 
                                    zero_pixels_are_background(),
                                    neighbors_8(),
                                    connected_if_both_not_zero(),
                                    labels);

        DLIB_TEST(num == 4);
        DLIB_TEST(labels.nr() == img.nr());
        DLIB_TEST(labels.nc() == img.nc());

        const unsigned char l1 = labels[rect1.top()][rect1.left()];
        const unsigned char l2 = labels[rect2.top()][rect2.left()];
        const unsigned char l3 = labels[rect3.top()][rect3.left()];

        DLIB_TEST(l1 != 0 && l2 != 0 && l3 != 0);
        DLIB_TEST(l1 != l2 && l1 != l3 && l2 != l3);

        for (long r = 0; r < labels.nr(); ++r)
        {
            for (long c = 0; c < labels.nc(); ++c)
            {
                if (rect1.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l1);
                }
                else if (rect2.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l2);
                }
                else if (rect3.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l3);
                }
                else
                {
                    DLIB_TEST(labels[r][c] == 0);
                }
            }
        }
    }

    void test_label_connected_blobs2()
    {
        array2d<unsigned char> img;
        img.set_size(400,401);

        assign_all_pixels(img,0);

        rectangle rect1, rect2, rect3;

        rect1 = centered_rect(99,120, 50,70);
        rect2 = centered_rect(199,80, 34,68);
        rect3 = centered_rect(249,180, 120,78);

        fill_rect(img, rect1, 255);
        fill_rect(img, rect2, 253);
        fill_rect(img, rect3, 255);

        array2d<unsigned char> labels;
        unsigned long num;
        num = label_connected_blobs(img, 
                                    nothing_is_background(),
                                    neighbors_4(),
                                    connected_if_equal(),
                                    labels);

        DLIB_TEST(num == 5);
        DLIB_TEST(labels.nr() == img.nr());
        DLIB_TEST(labels.nc() == img.nc());

        const unsigned char l0 = labels[0][0];
        const unsigned char l1 = labels[rect1.top()][rect1.left()];
        const unsigned char l2 = labels[rect2.top()][rect2.left()];
        const unsigned char l3 = labels[rect3.top()][rect3.left()];

        DLIB_TEST(l0 != 0 && l1 != 0 && l2 != 0 && l3 != 0);
        DLIB_TEST(l1 != l2 && l1 != l3 && l2 != l3 && 
                  l0 != l1 && l0 != l2 && l0 != l3);

        for (long r = 0; r < labels.nr(); ++r)
        {
            for (long c = 0; c < labels.nc(); ++c)
            {
                if (rect1.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l1);
                }
                else if (rect2.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l2);
                }
                else if (rect3.contains(c,r))
                {
                    DLIB_TEST(labels[r][c] == l3);
                }
                else
                {
                    DLIB_TEST(labels[r][c] == l0);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void downsample_image (
        const unsigned long downsample,
        const in_image_type& in_img,
        out_image_type& out_img,
        bool add_to
    )
    {
        out_img.set_size((in_img.nr()+downsample-1)/downsample,
                         (in_img.nc()+downsample-1)/downsample);

        for (long r = 0; r < out_img.nr(); ++r)
        {
            for (long c = 0; c < out_img.nc(); ++c)
            {
                if (add_to)
                    out_img[r][c] += in_img[r*downsample][c*downsample];
                else
                    out_img[r][c] = in_img[r*downsample][c*downsample];
            }
        }
    }

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP1,
        typename EXP2,
        typename T
        >
    void test_spatially_filter_image_separable_down_simple (
        const unsigned long downsample,
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP1>& row_filter,
        const matrix_exp<EXP2>& col_filter,
        T scale,
        bool use_abs = false,
        bool add_to = false
    )
    {
        out_image_type temp;
        spatially_filter_image_separable(in_img, temp, row_filter, col_filter, scale, use_abs, false);
        downsample_image(downsample, temp, out_img, add_to);
    }




    template <unsigned long downsample>
    void test_downsampled_filtering_helper(long row_filt_size, long col_filt_size)
    {
        print_spinner();
        dlog << LTRACE << "***********************************";
        dlog << LTRACE << "downsample: " << downsample;
        dlog << LTRACE << "row_filt_size: "<< row_filt_size;
        dlog << LTRACE << "col_filt_size: "<< col_filt_size;
        dlib::rand rnd;
        array2d<int> out1, out2;
        for (long nr = 0; nr < 3; ++nr)
        {
            for (long nc = 0; nc < 3; ++nc)
            {
                dlog << LTRACE << "nr: "<< nr;
                dlog << LTRACE << "nc: "<< nc;
                array2d<unsigned char> img(25+nr,25+nc);
                for (int k = 0; k < 5; ++k)
                {
                    for (long r = 0; r < img.nr(); ++r)
                    {
                        for (long c = 0; c < img.nc(); ++c)
                        {
                            img[r][c] = rnd.get_random_8bit_number();
                        }
                    }

                    matrix<int,0,1> row_filter(row_filt_size);
                    matrix<int,0,1> col_filter(col_filt_size);

                    row_filter = matrix_cast<int>(10*randm(row_filt_size,1, rnd));
                    col_filter = matrix_cast<int>(10*randm(col_filt_size,1, rnd));

                    row_filter -= 3;
                    col_filter -= 3;


                    test_spatially_filter_image_separable_down_simple(downsample, img, out1, row_filter, col_filter,1 );
                    spatially_filter_image_separable_down(downsample, img, out2, row_filter, col_filter);

                    DLIB_TEST(get_rect(out1) == get_rect(out2));
                    DLIB_TEST(array_to_matrix(out1) == array_to_matrix(out2));

                    test_spatially_filter_image_separable_down_simple(downsample, img, out1, row_filter, col_filter,3, true, true );
                    spatially_filter_image_separable_down(downsample, img, out2, row_filter, col_filter, 3, true, true);

                    DLIB_TEST(get_rect(out1) == get_rect(out2));
                    DLIB_TEST(array_to_matrix(out1) == array_to_matrix(out2));

                }
            }
        }
    }

    void test_downsampled_filtering()
    {
        test_downsampled_filtering_helper<1>(5,5);
        test_downsampled_filtering_helper<2>(5,5);
        test_downsampled_filtering_helper<3>(5,5);
        test_downsampled_filtering_helper<1>(3,5);
        test_downsampled_filtering_helper<2>(3,5);
        test_downsampled_filtering_helper<3>(3,5);
        test_downsampled_filtering_helper<1>(5,3);
        test_downsampled_filtering_helper<2>(5,3);
        test_downsampled_filtering_helper<3>(5,3);

        test_downsampled_filtering_helper<1>(3,3);
        test_downsampled_filtering_helper<2>(3,3);
        test_downsampled_filtering_helper<3>(3,3);

        test_downsampled_filtering_helper<1>(1,1);
        test_downsampled_filtering_helper<2>(1,1);
        test_downsampled_filtering_helper<3>(1,1);

    }

// ----------------------------------------------------------------------------------------


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
            test_integral_image<long, unsigned char>();
            test_integral_image<double, int>();
            test_integral_image<long, unsigned char>();
            test_integral_image<double, float>();

            test_zero_border_pixels();

            test_filtering<unsigned char>(false,1);
            test_filtering<unsigned char>(true,1);
            test_filtering<unsigned char>(false,3);
            test_filtering<unsigned char>(true,3);
            test_filtering<int>(false,1);
            test_filtering<int>(true,1);
            test_filtering<int>(false,3);
            test_filtering<int>(true,3);

            test_label_connected_blobs();
            test_label_connected_blobs2();
            test_downsampled_filtering();
        }
    } a;

}



