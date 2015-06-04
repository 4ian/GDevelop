// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/image_transforms.h>
//#include <dlib/gui_widgets.h>
#include <dlib/rand.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.pyramid_down");

// ----------------------------------------------------------------------------------------

void test_pyramid_down_grayscale()
{
    array2d<unsigned char> img, down;
    pyramid_down<2> pyr;

    img.set_size(300,264);

    assign_all_pixels(img, 10);

    pyr(img, down);

    DLIB_TEST(std::abs(down.nr()*2 - img.nr()) < 5);
    DLIB_TEST(std::abs(down.nc()*2 - img.nc()) < 5);

    rectangle rect1 = get_rect(img);
    rectangle rect2 = pyr.rect_up(get_rect(down));
    double overlap = rect1.intersect(rect2).area() / (double)(rect1 + rect2).area();
    DLIB_TEST(overlap > 0.95);

    rect1 = get_rect(down);
    rect2 = pyr.rect_down(get_rect(img));
    overlap = rect1.intersect(rect2).area() / (double)(rect1 + rect2).area();
    DLIB_TEST(overlap > 0.95);

    DLIB_TEST(min(mat(down)) == 10);
    DLIB_TEST(max(mat(down)) == 10);
}

void test_pyramid_down_rgb()
{
    array2d<rgb_pixel> img;
    array2d<bgr_pixel> down;
    pyramid_down<2> pyr;

    img.set_size(231, 351);

    assign_all_pixels(img, rgb_pixel(1,2,3));

    pyr(img, down);

    DLIB_TEST(std::abs(down.nr()*2 - img.nr()) < 5);
    DLIB_TEST(std::abs(down.nc()*2 - img.nc()) < 5);

    rectangle rect1 = get_rect(img);
    rectangle rect2 = pyr.rect_up(get_rect(down));
    double overlap = rect1.intersect(rect2).area() / (double)(rect1 + rect2).area();
    DLIB_TEST(overlap > 0.95);

    rect1 = get_rect(down);
    rect2 = pyr.rect_down(get_rect(img));
    overlap = rect1.intersect(rect2).area() / (double)(rect1 + rect2).area();
    DLIB_TEST(overlap > 0.95);

    bool pixels_match = true;
    for (long r = 0; r < down.nr(); ++r)
    {
        for (long c = 0; c < down.nc(); ++c)
        {
            if (down[r][c].red != 1 ||
                down[r][c].green != 2 ||
                down[r][c].blue != 3 )
            {
                pixels_match = false;
            }
        }
    }
    DLIB_TEST(pixels_match);
}

//  ----------------------------------------------------------------------------

template <typename image_type>
rgb_pixel mean_pixel (
    const image_type& img,
    const rectangle& rect
)
{
    long red = 0;
    long green = 0;
    long blue = 0;
    for (long r = rect.top(); r <= rect.bottom(); ++r)
    {
        for (long c = rect.left(); c <= rect.right(); ++c)
        {
            red += img[r][c].red;
            green += img[r][c].green;
            blue += img[r][c].blue;
        }
    }

    const long n = rect.area();
    return rgb_pixel(red/n, green/n, blue/n);
}

//  ----------------------------------------------------------------------------

template <typename pyramid_down_type>
void test_pyramid_down_rgb2()
{
    array2d<rgb_pixel> img, img3;
    array2d<unsigned char> img2, img4;


    img.set_size(300,400);
    assign_all_pixels(img, 0);
    rectangle rect1 = centered_rect( 10,10, 14, 14);
    rectangle rect2 = centered_rect( 100,100, 34, 42);
    rectangle rect3 = centered_rect( 310,215, 65, 21);

    fill_rect(img, rect1, rgb_pixel(255,0,0));
    fill_rect(img, rect2, rgb_pixel(0,255,0));
    fill_rect(img, rect3, rgb_pixel(0,0,255));



    pyramid_down_type pyr;

    pyr(img, img2);
    pyr(img, img3);


    DLIB_TEST(((rect1.tl_corner() - pyr.rect_down(pyr.rect_up(rect1,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect1.br_corner() - pyr.rect_down(pyr.rect_up(rect1,2),2).br_corner()).length()) < 1);
    DLIB_TEST(((rect2.tl_corner() - pyr.rect_down(pyr.rect_up(rect2,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect2.br_corner() - pyr.rect_down(pyr.rect_up(rect2,2),2).br_corner()).length()) < 1);
    DLIB_TEST(((rect3.tl_corner() - pyr.rect_down(pyr.rect_up(rect3,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect3.br_corner() - pyr.rect_down(pyr.rect_up(rect3,2),2).br_corner()).length()) < 1);

    rect1 = shrink_rect(pyr.rect_down(rect1),1);
    rect2 = shrink_rect(pyr.rect_down(rect2),1);
    rect3 = shrink_rect(pyr.rect_down(rect3),1);

    DLIB_TEST(rect1.area() > 10);
    DLIB_TEST(rect2.area() > 10);
    DLIB_TEST(rect3.area() > 10);

    /*
    image_window my_window(img);
    image_window win2(img2);
    image_window win3(img3);
    win2.add_overlay(image_window::overlay_rect(rect1, rgb_pixel(255,0,0)));
    win2.add_overlay(image_window::overlay_rect(rect2, rgb_pixel(255,0,0)));
    win2.add_overlay(image_window::overlay_rect(rect3, rgb_pixel(255,0,0)));
    win3.add_overlay(image_window::overlay_rect(rect1, rgb_pixel(255,0,0)));
    win3.add_overlay(image_window::overlay_rect(rect2, rgb_pixel(255,0,0)));
    win3.add_overlay(image_window::overlay_rect(rect3, rgb_pixel(255,0,0)));
    */


    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect1)) - 255/3) < 3);
    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect2)) - 255/3) < 3);
    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect3)) - 255/3) < 3);
    assign_image(img4, img);
    DLIB_TEST(std::abs((int)mean(mat(img4)) - mean(mat(img2))) < 2);


    rgb_pixel mean1 = mean_pixel(img3, rect1);
    rgb_pixel mean2 = mean_pixel(img3, rect2);
    rgb_pixel mean3 = mean_pixel(img3, rect3);
    rgb_pixel mean_all_true = mean_pixel(img, get_rect(img));
    rgb_pixel mean_all = mean_pixel(img3, get_rect(img3));
    DLIB_TEST(mean1.red > 250);
    DLIB_TEST(mean1.green < 3);
    DLIB_TEST(mean1.blue < 3);

    DLIB_TEST(mean2.red < 3);
    DLIB_TEST(mean2.green > 250);
    DLIB_TEST(mean2.blue < 3);

    DLIB_TEST(mean3.red < 3);
    DLIB_TEST(mean3.green < 3);
    DLIB_TEST(mean3.blue > 250);

    DLIB_TEST(std::abs((int)mean_all_true.red - mean_all.red) < 1);
    DLIB_TEST(std::abs((int)mean_all_true.green - mean_all.green) < 1);
    DLIB_TEST(std::abs((int)mean_all_true.blue - mean_all.blue) < 1);

    //my_window.wait_until_closed();
}


// ----------------------------------------------------------------------------------------

template <typename pyramid_down_type>
void test_pyramid_down_grayscale2()
{
    array2d<unsigned char> img;
    array2d<unsigned char> img2, img4;


    img.set_size(300,400);
    assign_all_pixels(img, 0);
    rectangle rect1 = centered_rect( 10,10, 14, 14);
    rectangle rect2 = centered_rect( 100,100, 34, 42);
    rectangle rect3 = centered_rect( 310,215, 65, 21);

    fill_rect(img, rect1, 255);
    fill_rect(img, rect2, 170);
    fill_rect(img, rect3, 100);



    pyramid_down_type pyr;

    pyr(img, img2);


    DLIB_TEST(((rect1.tl_corner() - pyr.rect_down(pyr.rect_up(rect1,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect1.br_corner() - pyr.rect_down(pyr.rect_up(rect1,2),2).br_corner()).length()) < 1);
    DLIB_TEST(((rect2.tl_corner() - pyr.rect_down(pyr.rect_up(rect2,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect2.br_corner() - pyr.rect_down(pyr.rect_up(rect2,2),2).br_corner()).length()) < 1);
    DLIB_TEST(((rect3.tl_corner() - pyr.rect_down(pyr.rect_up(rect3,2),2).tl_corner()).length()) < 1);
    DLIB_TEST(((rect3.br_corner() - pyr.rect_down(pyr.rect_up(rect3,2),2).br_corner()).length()) < 1);

    rect1 = shrink_rect(pyr.rect_down(rect1),1);
    rect2 = shrink_rect(pyr.rect_down(rect2),1);
    rect3 = shrink_rect(pyr.rect_down(rect3),1);

    DLIB_TEST(rect1.area() > 10);
    DLIB_TEST(rect2.area() > 10);
    DLIB_TEST(rect3.area() > 10);

    /*
    image_window my_window(img);
    image_window win2(img2);
    win2.add_overlay(image_window::overlay_rect(rect1, rgb_pixel(255,0,0)));
    win2.add_overlay(image_window::overlay_rect(rect2, rgb_pixel(255,0,0)));
    win2.add_overlay(image_window::overlay_rect(rect3, rgb_pixel(255,0,0)));
    */


    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect1)) - 255) <= 3);
    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect2)) - 170) < 3);
    DLIB_TEST(std::abs((int)mean(subm(matrix_cast<long>(mat(img2)),rect3)) - 100) < 3);
    assign_image(img4, img);
    DLIB_TEST(std::abs((int)mean(mat(img4)) - mean(mat(img2))) < 2);


    //my_window.wait_until_closed();



    // make sure the coordinate mapping is invertible when it should be
    for (int l = 0; l < 4; ++l)
    {
        for (long x = -10; x <= 10; ++x)
        {
            for (long y = -10; y <= 10; ++y)
            {
                DLIB_TEST_MSG(point(pyr.point_down(pyr.point_up(point(x,y),l),l)) == point(x,y), 
                    point(x,y) << "  " << pyr.point_up(point(x,y),l) << "   " << pyr.point_down(pyr.point_up(point(x,y),l),l));
                DLIB_TEST_MSG(point(pyr.point_down(point(pyr.point_up(point(x,y),l)),l)) == point(x,y), 
                    point(x,y) << "  " << pyr.point_up(point(x,y),l) << "   " << pyr.point_down(point(pyr.point_up(point(x,y),l)),l));
            }
        }
    }
}


// ----------------------------------------------------------------------------------------

template <typename pyramid_down_type>
void test_pyramid_down_small_sizes()
{
    // just make sure it doesn't get messed up with small images.  This test
    // is only really useful if asserts are enabled.
    pyramid_down_type pyr;

    for (int size = 0; size < 20; ++size)
    {
        array2d<unsigned char> img1(size,size);
        array2d<rgb_pixel> img2(size,size);

        array2d<unsigned char> out1;
        array2d<rgb_pixel> out2;

        assign_all_pixels(img1, 0);
        assign_all_pixels(img2, 0);

        pyr(img1, out1);
        pyr(img2, out2);
    }
}

// ----------------------------------------------------------------------------------------


    class test_pyramid_down : public tester
    {
    public:
        test_pyramid_down (
        ) :
            tester ("test_pyramid_down",
                    "Runs tests on the pyramid_down() function.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            test_pyramid_down_grayscale();
            print_spinner();
            test_pyramid_down_rgb();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_down<2> >();";
            test_pyramid_down_small_sizes<pyramid_down<2> >();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_down<3> >();";
            test_pyramid_down_small_sizes<pyramid_down<3> >();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_down<4> >();";
            test_pyramid_down_small_sizes<pyramid_down<4> >();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_down<5> >();";
            test_pyramid_down_small_sizes<pyramid_down<5> >();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_disable>();";
            test_pyramid_down_small_sizes<pyramid_disable>();
            dlog << LINFO << "call test_pyramid_down_small_sizes<pyramid_down<9> >();";
            test_pyramid_down_small_sizes<pyramid_down<9> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_rgb2<pyramid_down<2> >();";
            test_pyramid_down_rgb2<pyramid_down<2> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_rgb2<pyramid_down<3> >();";
            test_pyramid_down_rgb2<pyramid_down<3> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_rgb2<pyramid_down<4> >();";
            test_pyramid_down_rgb2<pyramid_down<4> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_rgb2<pyramid_down<5> >();";
            test_pyramid_down_rgb2<pyramid_down<5> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_rgb2<pyramid_down<8> >();";
            test_pyramid_down_rgb2<pyramid_down<8> >();


            print_spinner();
            dlog << LINFO << "call test_pyramid_down_grayscale2<pyramid_down<2> >();";
            test_pyramid_down_grayscale2<pyramid_down<2> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_grayscale2<pyramid_down<3> >();";
            test_pyramid_down_grayscale2<pyramid_down<3> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_grayscale2<pyramid_down<4> >();";
            test_pyramid_down_grayscale2<pyramid_down<4> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_grayscale2<pyramid_down<5> >();";
            test_pyramid_down_grayscale2<pyramid_down<5> >();

            print_spinner();
            dlog << LINFO << "call test_pyramid_down_grayscale2<pyramid_down<6> >();";
            test_pyramid_down_grayscale2<pyramid_down<6> >();
        }
    } a;

}




