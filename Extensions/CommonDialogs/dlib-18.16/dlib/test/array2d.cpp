// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/interfaces/enumerable.h>
#include <dlib/array2d.h>
#include "tester.h"
#include <dlib/pixel.h>
#include <dlib/image_transforms.h>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.array2d");

    template <
        typename array2d
        >
    void array2d_kernel_test (
    )
    /*!
        requires
            - array2d is an implementation of array2d/array2d_kernel_abstract.h 
              is instantiated with unsigned long 
        ensures
            - runs tests on array2d for compliance with the specs
    !*/
    {        
        srand(static_cast<unsigned int>(time(0)));

        array2d test,test2;

        long nc, nr;


        DLIB_TEST(get_rect(test).is_empty());

        enumerable<unsigned long>& e = test;
        DLIB_TEST(e.at_start() == true);


        DLIB_TEST(e.size() == 0);
        DLIB_TEST(e.at_start() == true);
        DLIB_TEST(e.current_element_valid() == false);

        DLIB_TEST (e.move_next() == false);
        DLIB_TEST (e.move_next() == false);
        DLIB_TEST (e.move_next() == false);
        DLIB_TEST (e.move_next() == false);
        DLIB_TEST (e.move_next() == false);
        DLIB_TEST (e.move_next() == false);


        DLIB_TEST(e.size() == 0);
        DLIB_TEST(e.at_start() == false);
        DLIB_TEST(e.current_element_valid() == false);


        e.reset();

        DLIB_TEST(e.size() == 0);
        DLIB_TEST(e.at_start() == true);
        DLIB_TEST(e.current_element_valid() == false);


        DLIB_TEST(get_rect(test).is_empty());



        DLIB_TEST(test.at_start() == true);


        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);

        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);


        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == false);
        DLIB_TEST(test.current_element_valid() == false);


        test.reset();

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);

        test.clear();


        DLIB_TEST(test.at_start() == true);


        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);

        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);


        test.set_size(0,0);

        DLIB_TEST(get_rect(test).is_empty());

        DLIB_TEST(test.at_start() == true);


        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);

        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);
        DLIB_TEST (test.move_next() == false);

        swap(test,test2);
        DLIB_TEST (test2.at_start() == false);
        DLIB_TEST (test2.current_element_valid() == false);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);
        swap(test,test2);
        DLIB_TEST(test2.at_start() == true);
        DLIB_TEST(test2.current_element_valid() == false);


        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == false);
        DLIB_TEST(test.current_element_valid() == false);


        test.reset();

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.at_start() == true);
        DLIB_TEST(test.current_element_valid() == false);




        for (int j = 0; j < 30; ++j)
        {
            test2.clear();
            switch (j)
            {
                case 0:
                    nc = 10;
                    nr = 11;
                    break;
                case 1:
                    nc = 1;
                    nr = 1;
                    break;
                case 2:
                    nc = 100;
                    nr = 1;
                    break;
                case 3:
                    nc = 1;
                    nr = 100;
                    break;
                default:
                    nc = ::rand()%100 + 1;
                    nr = ::rand()%100 + 1;
                    break;
            }

            test.set_size(nr,nc);

            DLIB_TEST(get_rect(test).left() == 0);
            DLIB_TEST(get_rect(test).top() == 0);
            DLIB_TEST(get_rect(test).right() == nc-1);
            DLIB_TEST(get_rect(test).bottom() == nr-1);

            DLIB_TEST(test.size() == static_cast<unsigned long>(nc*nr));
            DLIB_TEST(test.nr() == nr);
            DLIB_TEST(test.nc() == nc);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);

            unsigned long i = 0;
            while (test.move_next())
            {
                DLIB_TEST(test.current_element_valid() == true);
                DLIB_TEST(test.at_start() == false);
                test.element() = i;
                DLIB_TEST(const_cast<const array2d&>(test).element() == i);
                ++i;
            }
            DLIB_TEST(i == test.size());
            DLIB_TEST(test.current_element_valid() == false);

            DLIB_TEST(test.nr() == nr);
            DLIB_TEST(test.nc() == nc);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.size() == static_cast<unsigned long>(nc*nr));

            i = 0;
            for (long row = 0; row < test.nr(); ++row)
            {
                for (long col = 0; col < test.nc(); ++col)
                {
                    DLIB_TEST_MSG(test[row][col] == i,
                                 "\n\trow: " << row <<
                                 "\n\tcol: " << col <<
                                 "\n\ti:   " << i <<
                                 "\n\ttest[row][col]: " << test[row][col]);
                    DLIB_TEST(test[row].nc() == test.nc());
                    DLIB_TEST(test.current_element_valid() == false);

                    DLIB_TEST(test.nr() == nr);
                    DLIB_TEST(test.nc() == nc);
                    DLIB_TEST(test.at_start() == false);
                    DLIB_TEST(test.size() == static_cast<unsigned long>(nc*nr));
                    ++i;
                }
            }

            test.reset();

            i = 0;
            while (test.move_next())
            {
                DLIB_TEST(test.element() == i);
                ++i;
                DLIB_TEST(test.current_element_valid() == true);
                DLIB_TEST(test.at_start() == false);
            }
            DLIB_TEST(i == test.size());

            test.reset();




            swap(test,test2);

            DLIB_TEST(test2.size() == static_cast<unsigned long>(nc*nr));
            DLIB_TEST(test2.nr() == nr);
            DLIB_TEST(test2.nc() == nc);
            DLIB_TEST(test2.at_start() == true);
            DLIB_TEST(test2.current_element_valid() == false);

            i = 0;
            while (test2.move_next())
            {
                DLIB_TEST(test2.current_element_valid() == true);
                DLIB_TEST(test2.at_start() == false);
                test2.element() = i;
                ++i;
            }
            DLIB_TEST(i == test2.size());
            DLIB_TEST(test2.current_element_valid() == false);

            DLIB_TEST(test2.nr() == nr);
            DLIB_TEST(test2.nr() == test2.nr());
            DLIB_TEST(test2.nc() == nc);
            DLIB_TEST(test2.nc() == test2.nc());
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.size() == static_cast<unsigned long>(nc*nr));

            i = 0;
            for (long row = 0; row < test2.nr(); ++row)
            {
                for (long col = 0; col < test2.nc(); ++col)
                {
                    DLIB_TEST(test2[row][col] == i);
                    DLIB_TEST(const_cast<const array2d&>(test2)[row][col] == i);
                    DLIB_TEST(test2[row].nc() == test2.nc());
                    DLIB_TEST(test2.current_element_valid() == false);

                    DLIB_TEST(test2.nr() == nr);
                    DLIB_TEST(test2.nr() == test2.nr());
                    DLIB_TEST(test2.nc() == nc);
                    DLIB_TEST(test2.nc() == test2.nc());
                    DLIB_TEST(test2.at_start() == false);
                    DLIB_TEST(test2.size() == static_cast<unsigned long>(nc*nr));
                    ++i;
                }
            }

            test2.reset();

            i = 0;
            while (test2.move_next())
            {
                DLIB_TEST(test2.element() == i);
                DLIB_TEST(const_cast<const array2d&>(test2).element() == i);
                ++i;
                DLIB_TEST(test2.current_element_valid() == true);
                DLIB_TEST(test2.at_start() == false);
            }
            DLIB_TEST(i == test2.size());


            test2.clear();
            DLIB_TEST(test2.size() == 0);
            DLIB_TEST(test2.nr() == 0);
            DLIB_TEST(test2.nc() == 0);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.at_start() == true);

            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.nc() == 0);
            DLIB_TEST(test.nr() == 0);

            test.set_size(nr,nc);
            DLIB_TEST(test.size() == static_cast<unsigned long>(nc*nr));
            DLIB_TEST(test.nc() == nc);
            DLIB_TEST(test.nr() == nr);



        }





        // test the serialization
        istringstream sin;
        ostringstream sout;
        test.clear();
        test2.clear();

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test.nc() == 0);
        DLIB_TEST(test.nr() == 0);
        DLIB_TEST(test2.size() == 0);
        DLIB_TEST(test2.nc() == 0);
        DLIB_TEST(test2.nr() == 0);

        test.set_size(10,10);

        for (long row = 0; row < test.nr(); ++row)
        {
            for (long col = 0; col < test.nc(); ++col)
            {
                test[row][col] = row*col;
            }
        }

        serialize(test,sout);
        sin.str(sout.str());
        deserialize(test2,sin);

        DLIB_TEST(test2.size() == test.size());
        DLIB_TEST(test2.nc() == test.nc());
        DLIB_TEST(test2.nr() == test.nr());
        DLIB_TEST(test2.size() == 100);
        DLIB_TEST(test2.nc() == 10);
        DLIB_TEST(test2.nr() == 10);


        for (long row = 0; row < test.nr(); ++row)
        {
            for (long col = 0; col < test.nc(); ++col)
            {
                DLIB_TEST(test[row][col] == static_cast<unsigned long>(row*col));
                DLIB_TEST(test2[row][col] == static_cast<unsigned long>(row*col));
            }
        }






        test.set_size(10,11);
        DLIB_TEST(test.nr() == 10);
        DLIB_TEST(test.nc() == 11);
        test.set_size(0,0);
        DLIB_TEST(test.nr() == 0);
        DLIB_TEST(test.nc() == 0);

    }

    void test_serialization()
    {
        // Do these tests because there are overloads of the serialize routines
        // specifically for these types of pixel (except for unsigned short,  
        // we do that because you can never have too many tests).
        {
            array2d<rgb_alpha_pixel> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1].red = 9;
            img[1][1].green = 8;
            img[1][1].blue = 7;
            img[1][1].alpha = 3;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c].red == img2[r][c].red);
                    DLIB_TEST(img[r][c].green == img2[r][c].green);
                    DLIB_TEST(img[r][c].blue == img2[r][c].blue);
                    DLIB_TEST(img[r][c].alpha == img2[r][c].alpha);
                }
            }
        }
        {
            array2d<hsi_pixel> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1].h = 9;
            img[1][1].s = 2;
            img[1][1].i = 3;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c].h == img2[r][c].h);
                    DLIB_TEST(img[r][c].s == img2[r][c].s);
                    DLIB_TEST(img[r][c].i == img2[r][c].i);
                }
            }
        }
        {
            array2d<bgr_pixel> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1].red = 1;
            img[1][1].green = 2;
            img[1][1].blue = 3;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c].red == img2[r][c].red);
                    DLIB_TEST(img[r][c].green == img2[r][c].green);
                    DLIB_TEST(img[r][c].blue == img2[r][c].blue);
                }
            }
        }
        {
            array2d<rgb_pixel> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1].red = 1;
            img[1][1].green = 2;
            img[1][1].blue = 3;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c].red == img2[r][c].red);
                    DLIB_TEST(img[r][c].green == img2[r][c].green);
                    DLIB_TEST(img[r][c].blue == img2[r][c].blue);
                }
            }
        }
        {
            array2d<unsigned short> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1] = 9;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c] == img2[r][c]);
                }
            }
        }
        {
            array2d<unsigned char> img, img2;
            img.set_size(3,2);
            assign_all_pixels(img, 5);
            img[1][1] = 9;
            ostringstream sout;
            serialize(img, sout);
            istringstream sin(sout.str());
            deserialize(img2, sin);

            DLIB_TEST(img2.nr() == 3);
            DLIB_TEST(img2.nc() == 2);

            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    DLIB_TEST(img[r][c] == img2[r][c]);
                }
            }

            DLIB_TEST((char*)&img[0][0] + img.width_step() == (char*)&img[1][0]);
        }

        COMPILE_TIME_ASSERT(is_array2d<array2d<unsigned char> >::value == true);
        COMPILE_TIME_ASSERT(is_array2d<array2d<float> >::value == true);
        COMPILE_TIME_ASSERT(is_array2d<float>::value == false);
    }


    class array2d_tester : public tester
    {
    public:
        array2d_tester (
        ) :
            tester ("test_array2d",
                    "Runs tests on the array2d component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            array2d_kernel_test<array2d<unsigned long> >();
            print_spinner();
            test_serialization();
            print_spinner();
        }
    } a;

}


