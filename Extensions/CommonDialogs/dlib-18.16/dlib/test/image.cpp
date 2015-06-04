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
        assign_image(img2, mat(img1));

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
                    img[r][c] = static_cast<unsigned char>(r*14 + c*111);
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
                        DLIB_TEST(img[r][c] == static_cast<unsigned char>(r*14 + c*111));
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
                        DLIB_TEST(img[r][c] == static_cast<unsigned char>(r*14 + c*111));
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

            DLIB_TEST(zeros_matrix<unsigned char>(6,6) == subm(mat(img), rectangle(2,2,7,7)));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(mat(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(mat(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(mat(img), 8));
            DLIB_TEST(uniform_matrix<unsigned char>(1,10, 4) == rowm(mat(img), 9));

            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(mat(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(mat(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(mat(img), 8));
            DLIB_TEST(uniform_matrix<unsigned char>(10,1, 4) == colm(mat(img), 9));


            assign_border_pixels(img, 7, 7, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(10,10, 5) == mat(img));
            assign_border_pixels(img, 37, 47, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(10,10, 5) == mat(img));
        }

        {
            array2d<unsigned char> img;
            img.set_size(11,11);
            assign_all_pixels(img, 0);

            assign_border_pixels(img, 2,2, 4);

            DLIB_TEST(zeros_matrix<unsigned char>(7,7) == subm(mat(img), rectangle(2,2,8,8)));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(mat(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(mat(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(mat(img), 9));
            DLIB_TEST(uniform_matrix<unsigned char>(1,11, 4) == rowm(mat(img), 10));

            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(mat(img), 0));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(mat(img), 1));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(mat(img), 9));
            DLIB_TEST(uniform_matrix<unsigned char>(11,1, 4) == colm(mat(img), 10));

            assign_border_pixels(img, 7, 7, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(11,11, 5) == mat(img));
            assign_border_pixels(img, 70, 57, 5);
            DLIB_TEST(uniform_matrix<unsigned char>(11,11, 5) == mat(img));
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
                DLIB_TEST(int_img.get_sum_of_area(rect) == sum(subm(matrix_cast<T>(mat(img)), rect)));
                rect = rectangle(p1,p1);
                DLIB_TEST(int_img.get_sum_of_area(rect) == sum(subm(matrix_cast<T>(mat(img)), rect)));
            }

        }


    }

    void test_filtering2(int nr, int nc, dlib::rand& rnd)
    {
        print_spinner();
        dlog << LINFO << "test_filtering2(): " << nr << "  " << nc;
        array2d<float> img(302,301);
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = rnd.get_random_gaussian();
            }
        }
        matrix<float> filt = matrix_cast<float>(randm(nr,nc,rnd));

        matrix<float> out = xcorr_same(mat(img),filt);
        matrix<float> out2 = subm(conv(mat(img),flip(filt)), filt.nr()/2, filt.nc()/2, img.nr(), img.nc());
        // make sure xcorr_same does exactly what the docs say it should.
        DLIB_TEST(max(abs(out-out2)) < 1e-7);

        // Now compare the filtering functions to xcorr_same to make sure everything does
        // filtering in the same way.
        array2d<float> imout(img.nr(), img.nc());
        assign_all_pixels(imout, 10);
        rectangle rect = spatially_filter_image(img, imout, filt);
        border_enumerator be(get_rect(imout),rect);
        while (be.move_next())
        {
            DLIB_TEST(imout[be.element().y()][be.element().x()] == 0)
        }
        DLIB_TEST_MSG(max(abs(subm(mat(imout),rect) - subm(out,rect))) < 1e-5, max(abs(subm(mat(imout),rect) - subm(out,rect))));


        assign_all_pixels(imout, 10);
        out = 10;
        rect = spatially_filter_image(img, imout, filt,2,true,true);
        be = border_enumerator(get_rect(imout),rect);
        while (be.move_next())
        {
            DLIB_TEST(imout[be.element().y()][be.element().x()] == 10)
        }
        out += abs(xcorr_same(mat(img),filt)/2);
        DLIB_TEST(max(abs(subm(mat(imout),rect) - subm(out,rect))) < 1e-7);


        assign_all_pixels(imout, -10);
        out = -10;
        rect = spatially_filter_image(img, imout, filt,2,false,true);
        be = border_enumerator(get_rect(imout),rect);
        while (be.move_next())
        {
            DLIB_TEST(imout[be.element().y()][be.element().x()] == -10)
        }
        out += xcorr_same(mat(img),filt)/2;
        DLIB_TEST_MSG(max(abs(subm(mat(imout),rect) - subm(out,rect))) < 1e-5, max(abs(subm(mat(imout),rect) - subm(out,rect))));




        matrix<float> row_filt = matrix_cast<float>(randm(nc,1,rnd));
        matrix<float> col_filt = matrix_cast<float>(randm(nr,1,rnd));
        assign_all_pixels(imout, 10);
        rect = spatially_filter_image_separable(img, imout, row_filt, col_filt);
        out = xcorr_same(tmp(xcorr_same(mat(img),trans(row_filt))), col_filt);
        DLIB_TEST_MSG(max(abs(subm(mat(imout),rect) - subm(out,rect))) < 1e-5, max(abs(subm(mat(imout),rect) - subm(out,rect))));

        be = border_enumerator(get_rect(imout),rect);
        while (be.move_next())
        {
            DLIB_TEST(imout[be.element().y()][be.element().x()] == 0);
        }


        assign_all_pixels(imout, 10);
        out = 10;
        rect = spatially_filter_image_separable(img, imout, row_filt, col_filt,2,true,true);
        out += abs(xcorr_same(tmp(xcorr_same(mat(img),trans(row_filt))), col_filt)/2);
        DLIB_TEST_MSG(max(abs(subm(mat(imout),rect) - subm(out,rect))) < 1e-7, 
            max(abs(subm(mat(imout),rect) - subm(out,rect))));

        be = border_enumerator(get_rect(imout),rect);
        while (be.move_next())
        {
            DLIB_TEST(imout[be.element().y()][be.element().x()] == 10);
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

        DLIB_TEST(mat(img2) == mat(img3));


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
            DLIB_TEST(mat(img2) == mat(img3));

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
            DLIB_TEST(img2[0][0] == 3);
            DLIB_TEST(img2[0][1] == 3);
            DLIB_TEST(img2[0][2] == 3);
            DLIB_TEST(img2[0][3] == 3);

            DLIB_TEST(img2[1][0] == 3);
            DLIB_TEST_MSG(img2[1][1] == 9+3, img2[1][1] );
            DLIB_TEST(img2[1][2] == 9+3);
            DLIB_TEST(img2[1][3] == 3);

            DLIB_TEST(img2[2][0] == 3);
            DLIB_TEST(img2[2][1] == 3);
            DLIB_TEST(img2[2][2] == 3);
            DLIB_TEST(img2[2][3] == 3);
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

            DLIB_TEST(img2[0][0] == 8);
            DLIB_TEST(img2[0][1] == 8);
            DLIB_TEST(img2[0][2] == 8);
            DLIB_TEST(img2[0][3] == 8);

            DLIB_TEST(img2[1][0] == 8);
            DLIB_TEST(std::abs(img2[1][1] -  -4.5 - 8) < 1e-14);
            DLIB_TEST(std::abs(img2[1][2] -  -4.5 - 8) < 1e-14);
            DLIB_TEST(img2[1][3] == 8);

            DLIB_TEST(img2[2][0] == 8);
            DLIB_TEST(img2[2][1] == 8);
            DLIB_TEST(img2[2][2] == 8);
            DLIB_TEST(img2[2][3] == 8);

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

        rectangle rect = get_rect(img);
        rect.left()+=2;
        rect.top()+=1;
        rect.right()-=2;
        rect.bottom()-=1;
        assign_all_pixels(img, 1);
        zero_border_pixels(img, rect);

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

        rect.right()+=1;
        assign_all_pixels(img, 1);
        zero_border_pixels(img, rect);
        DLIB_TEST(img[0][0] == 0);
        DLIB_TEST(img[1][0] == 0);
        DLIB_TEST(img[2][0] == 0);
        DLIB_TEST(img[3][0] == 0);
        DLIB_TEST(img[0][1] == 0);
        DLIB_TEST(img[1][1] == 0);
        DLIB_TEST(img[2][1] == 0);
        DLIB_TEST(img[3][1] == 0);

        DLIB_TEST(img[0][3] == 0);
        DLIB_TEST(img[1][3] == 1);
        DLIB_TEST(img[2][3] == 1);
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
                    DLIB_TEST(mat(out1) == mat(out2));

                    test_spatially_filter_image_separable_down_simple(downsample, img, out1, row_filter, col_filter,3, true, true );
                    spatially_filter_image_separable_down(downsample, img, out2, row_filter, col_filter, 3, true, true);

                    DLIB_TEST(get_rect(out1) == get_rect(out2));
                    DLIB_TEST(mat(out1) == mat(out2));

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

    template <typename T>
    void test_segment_image()
    {
        print_spinner();
        array2d<T> img(100,100);
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                if (c < 50 || r < 50)
                    assign_pixel(img[r][c], 0);
                else
                    assign_pixel(img[r][c], 255);
            }
        }

        array2d<unsigned long> out;
        segment_image(img, out);

        DLIB_TEST(get_rect(img) == get_rect(out));
        const unsigned long v1 = out[0][0];
        const unsigned long v2 = out[90][90];

        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                if (c < 50 || r < 50)
                {
                    DLIB_TEST(out[r][c] == v1);
                }
                else
                {
                    DLIB_TEST(out[r][c] == v2);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void test_dng_floats(double scale)
    {
        dlog << LINFO << "in test_dng_floats";
        print_spinner();
        array2d<T> img(100,101);

        dlib::rand rnd;
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                T val = rnd.get_random_double()*scale;
                img[r][c] = val;

                // Lets the float_details object while we are here doing this stuff.
                float_details temp = val;
                T val2 = temp;
                // for the same type we should exactly reproduce the value (unless
                // it's long double and then maybe it's slightly different).
                if (is_same_type<T,long double>::value)
                {
                    DLIB_TEST(std::abs(val2-val) < scale*std::numeric_limits<T>::epsilon());
                }
                else
                {
                    DLIB_TEST(val2 == val);
                }

                float valf = temp;
                double vald = temp;
                long double vall = temp;

                DLIB_TEST(std::abs(valf-val) < scale*std::numeric_limits<float>::epsilon());
                DLIB_TEST(std::abs(vald-val) < scale*std::numeric_limits<double>::epsilon());
                DLIB_TEST(std::abs(vall-val) < scale*std::numeric_limits<long double>::epsilon());
            }
        }

        ostringstream sout;
        save_dng(img, sout);
        istringstream sin;

        array2d<float> img1;
        array2d<double> img2;
        array2d<long double> img3;

        sin.clear(); sin.str(sout.str());
        load_dng(img1, sin);

        sin.clear(); sin.str(sout.str());
        load_dng(img2, sin);

        sin.clear(); sin.str(sout.str());
        load_dng(img3, sin);

        DLIB_TEST(img.nr() == img1.nr());
        DLIB_TEST(img.nr() == img2.nr());
        DLIB_TEST(img.nr() == img3.nr());
        DLIB_TEST(img.nc() == img1.nc());
        DLIB_TEST(img.nc() == img2.nc());
        DLIB_TEST(img.nc() == img3.nc());

        DLIB_TEST(max(abs(mat(img) - matrix_cast<T>(mat(img1)))) < scale*std::numeric_limits<float>::epsilon());
        DLIB_TEST(max(abs(mat(img) - matrix_cast<T>(mat(img2)))) < scale*std::numeric_limits<double>::epsilon());
        DLIB_TEST(max(abs(mat(img) - matrix_cast<T>(mat(img3)))) < scale*std::numeric_limits<long double>::epsilon());
    }

    void test_dng_float_int()
    {
        dlog << LINFO << "in test_dng_float_int";
        print_spinner();

        array2d<uint16> img;
        assign_image(img, gaussian_randm(101,100)*10000);

        ostringstream sout;
        save_dng(img, sout);
        istringstream sin(sout.str());
        array2d<double> img2;
        load_dng(img2, sin);
        sout.clear(); sout.str("");

        save_dng(img2, sout);
        sin.clear(); sin.str(sout.str());
        array2d<uint16> img3;
        load_dng(img3, sin);

        // this whole thing should have been totally lossless.
        DLIB_TEST(mat(img) == mat(img3));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void test_filtering_center (
        dlib::rand& rnd
    )
    {
        array2d<T> img(rnd.get_random_32bit_number()%100+1,
            rnd.get_random_32bit_number()%100+1);
        matrix<T> filt(rnd.get_random_32bit_number()%10+1,
            rnd.get_random_32bit_number()%10+1);

        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = rnd.get_random_32bit_number()%100;
            }
        }
        for (long r = 0; r < filt.nr(); ++r)
        {
            for (long c = 0; c < filt.nc(); ++c)
            {
                filt(r,c) = rnd.get_random_32bit_number()%100;
            }
        }

        array2d<T> out;
        const rectangle area = spatially_filter_image(img, out, filt);

        for (long r = 0; r < out.nr(); ++r)
        {
            for (long c = 0; c < out.nc(); ++c)
            {
                const rectangle rect = centered_rect(point(c,r), filt.nc(), filt.nr());
                if (get_rect(out).contains(rect))
                {
                    T val = sum(pointwise_multiply(filt, subm(mat(img),rect)));
                    DLIB_TEST_MSG(val == out[r][c],"err: " << val-out[r][c]);
                    DLIB_TEST(area.contains(point(c,r)));
                }
                else
                {
                    DLIB_TEST(!area.contains(point(c,r)));
                }
            }
        }
    }

    template <typename T>
    void test_separable_filtering_center (
        dlib::rand& rnd
    )
    {
        array2d<T> img(rnd.get_random_32bit_number()%100+1,
            rnd.get_random_32bit_number()%100+1);
        matrix<T,1,0> row_filt(rnd.get_random_32bit_number()%10+1);
        matrix<T,0,1> col_filt(rnd.get_random_32bit_number()%10+1);

        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = rnd.get_random_32bit_number()%10;
            }
        }
        for (long r = 0; r < row_filt.size(); ++r)
        {
            row_filt(r) = rnd.get_random_32bit_number()%10;
        }
        for (long r = 0; r < col_filt.size(); ++r)
        {
            col_filt(r) = rnd.get_random_32bit_number()%10;
        }

        array2d<T> out;
        const rectangle area = spatially_filter_image_separable(img, out, row_filt, col_filt);

        for (long r = 0; r < out.nr(); ++r)
        {
            for (long c = 0; c < out.nc(); ++c)
            {
                const rectangle rect = centered_rect(point(c,r), row_filt.size(), col_filt.size());
                if (get_rect(out).contains(rect))
                {
                    T val = sum(pointwise_multiply(col_filt*row_filt, subm(mat(img),rect)));
                    DLIB_TEST_MSG(val == out[r][c],"err: " << val-out[r][c]);

                    DLIB_TEST(area.contains(point(c,r)));
                }
                else
                {
                    DLIB_TEST(!area.contains(point(c,r)));
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void run_hough_test()
    {
        array2d<unsigned char> img(300,300);


        for (int k = -2; k <= 2; ++k)
        {
            print_spinner();
            running_stats<double> rs;
            array2d<int> himg;
            hough_transform ht(200+k);
            double angle1 = 0;
            double angle2 = 0;
            const int len = 90;
            // Draw a bunch of random lines, hough transform them, then make sure the hough
            // transform detects them accurately.
            for (int i = 0; i < 500; ++i)
            {
                point cent = center(get_rect(img));
                point arc = cent + point(len,0);
                arc = rotate_point(cent, arc, angle1);

                point l = arc + point(500,0);
                point r = arc - point(500,0);
                l = rotate_point(arc, l, angle2);
                r = rotate_point(arc, r, angle2);

                angle1 += pi/13;
                angle2 += pi/40;

                assign_all_pixels(img, 0);
                draw_line(img, l, r, 255);
                rectangle box = translate_rect(get_rect(ht),point(50,50));
                ht(img, box, himg);

                point p = max_point(mat(himg));
                DLIB_TEST(himg[p.y()][p.x()] > 255*3);

                l -= point(50,50);
                r -= point(50,50);
                std::pair<point,point> line = ht.get_line(p);
                // make sure the best scoring hough point matches the line we drew.
                double dist1 = distance_to_line(make_pair(l,r), line.first);
                double dist2 = distance_to_line(make_pair(l,r), line.second);
                //cout << "DIST1: " << dist1 << endl;
                //cout << "DIST2: " << dist2 << endl;
                rs.add(dist1);
                rs.add(dist2);
                DLIB_TEST(dist1 < 2.5);
                DLIB_TEST(dist2 < 2.5);
            }
            //cout << "rs.mean(): " << rs.mean() << endl;
            DLIB_TEST(rs.mean() < 0.7);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_extract_image_chips()
    {
        dlib::rand rnd;

        // Make sure that cropping a white box out of a larger white image always produces an
        // exact white box.  This should catch any bad border effects from a messed up internal
        // cropping.
        for (int iter = 0; iter < 1000; ++iter)
        {
            print_spinner();
            const long nr = rnd.get_random_32bit_number()%100 + 1;
            const long nc = rnd.get_random_32bit_number()%100 + 1;
            const long size = rnd.get_random_32bit_number()%10000 + 4;
            const double angle = rnd.get_random_double() * pi;

            matrix<int> img(501,501), chip;
            img = 255;
            chip_details details(centered_rect(center(get_rect(img)),nr,nc), size, angle);
            extract_image_chip(img, details, chip);
            DLIB_TEST_MSG(max(abs(chip-255))==0,"nr: " << nr << "  nc: "<< nc << "  size: " << size << "  angle: " << angle 
                << " error: " << max(abs(chip-255)) );
        }


        {
            // Make sure that the interpolation in extract_image_chip() keeps stuff in the
            // right places.

            matrix<unsigned char> img(10,10), chip;
            img = 0;
            img(1,1) = 255;
            img(8,8) = 255;

            extract_image_chip(img, chip_details(get_rect(img), 9*9), chip);

            DLIB_TEST(chip(1,1) == 195);
            DLIB_TEST(chip(7,7) == 195);
            chip(1,1) -= 195;
            chip(7,7) -= 195;
            DLIB_TEST(sum(matrix_cast<int>(chip)) == 0);
        }



        // Test the rotation ability of extract_image_chip().  Do this by drawing a line and
        // then rotating it so it's horizontal.  Check that it worked correctly by hough
        // transforming it.
        hough_transform ht(151);
        matrix<unsigned char> img(300,300);
        for (int iter = 0; iter < 1000; ++iter)
        {
            print_spinner();
            img = 0;
            const int len = 9000;
            point cent = center(get_rect(img));
            point l = cent + point(len,0);
            point r = cent - point(len,0);
            const double angle = rnd.get_random_double()*pi*3;
            l = rotate_point(cent, l, angle);
            r = rotate_point(cent, r, angle);
            draw_line(img, l, r, 255);


            const long wsize = rnd.get_random_32bit_number()%350 + 150;

            matrix<unsigned char> temp;
            chip_details details(centered_rect(center(get_rect(img)), wsize,wsize),  chip_dims(ht.size(),ht.size()), angle);
            extract_image_chip(img, details, temp);


            matrix<long> tform;
            ht(temp, get_rect(temp), tform);
            std::pair<point,point> line = ht.get_line(max_point(tform));

            DLIB_TEST_MSG(line.first.y() == line.second.y()," wsize: " << wsize);
            DLIB_TEST(length(line.first-line.second) > 100);
            DLIB_TEST(length((line.first+line.second)/2.0 - center(get_rect(temp))) <= 1);
        }

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
            run_hough_test();
            test_extract_image_chips();
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

            test_segment_image<unsigned char>();
            test_segment_image<unsigned short>();
            test_segment_image<double>();
            test_segment_image<int>();
            test_segment_image<rgb_pixel>();
            test_segment_image<rgb_alpha_pixel>();

            test_dng_floats<float>(1);
            test_dng_floats<double>(1);
            test_dng_floats<long double>(1);
            test_dng_floats<float>(1e30);
            test_dng_floats<double>(1e30);
            test_dng_floats<long double>(1e30);

            test_dng_float_int();

            dlib::rand rnd;
            for (int i = 0; i < 10; ++i)
            {
                // the spatial filtering stuff is the same as xcorr_same when the filter
                // sizes are odd.
                test_filtering2(3,3,rnd);
                test_filtering2(5,5,rnd);
                test_filtering2(7,7,rnd);
            }

            for (int i = 0; i < 100; ++i)
                test_filtering_center<float>(rnd);
            for (int i = 0; i < 100; ++i)
                test_filtering_center<int>(rnd);
            for (int i = 0; i < 100; ++i)
                test_separable_filtering_center<int>(rnd);
            for (int i = 0; i < 100; ++i)
                test_separable_filtering_center<float>(rnd);

            {
                print_spinner();
                matrix<unsigned char> img(40,80);
                assign_all_pixels(img, 255);
                skeleton(img);

                DLIB_TEST(sum(matrix_cast<int>(mat(img)))/255 == 40);
                draw_line(img, point(20,19), point(59,19), 00);
                DLIB_TEST(sum(matrix_cast<int>(mat(img))) == 0);
            }
        }
    } a;

}



