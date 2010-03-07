// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/pixel.h>
#include <dlib/matrix.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.pixel");


    void pixel_test (
    )
    /*!
        ensures
            - runs tests on pixel objects and functions for compliance with the specs 
    !*/
    {        

        print_spinner();

        unsigned char p_gray;
        unsigned short p_gray16;
        rgb_pixel p_rgb;
        hsi_pixel p_hsi, p_hsi2;
        rgb_alpha_pixel p_rgba;


        assign_pixel(p_gray,0);
        assign_pixel(p_rgb,0);
        assign_pixel(p_hsi,0);
        assign_pixel(p_rgba,0);
        assign_pixel(p_gray16,0);

        DLIB_CASSERT(p_gray == 0,"");
        DLIB_CASSERT(p_gray16 == 0,"");

        DLIB_CASSERT(p_rgb.red == 0,"");
        DLIB_CASSERT(p_rgb.green == 0,"");
        DLIB_CASSERT(p_rgb.blue == 0,"");

        DLIB_CASSERT(p_rgba.red == 0,"");
        DLIB_CASSERT(p_rgba.green == 0,"");
        DLIB_CASSERT(p_rgba.blue == 0,"");
        DLIB_CASSERT(p_rgba.alpha == 255,"");

        DLIB_CASSERT(p_hsi.h == 0,"");
        DLIB_CASSERT(p_hsi.s == 0,"");
        DLIB_CASSERT(p_hsi.i == 0,"");

        assign_pixel(p_gray,10);
        assign_pixel(p_gray16,10);
        assign_pixel(p_rgb,10);
        assign_pixel(p_hsi,10);
        assign_pixel(p_rgba,10);

        DLIB_CASSERT(p_gray == 10,"");
        DLIB_CASSERT(p_gray16 == 10,"");

        DLIB_CASSERT(p_rgb.red == 10,"");
        DLIB_CASSERT(p_rgb.green == 10,"");
        DLIB_CASSERT(p_rgb.blue == 10,"");

        DLIB_CASSERT(p_rgba.red == 10,"");
        DLIB_CASSERT(p_rgba.green == 10,"");
        DLIB_CASSERT(p_rgba.blue == 10,"");
        DLIB_CASSERT(p_rgba.alpha == 255,"");

        DLIB_CASSERT(p_hsi.h == 0,"");
        DLIB_CASSERT(p_hsi.s == 0,"");
        DLIB_CASSERT(p_hsi.i == 10,"");

        assign_pixel(p_gray16,12345);
        DLIB_CASSERT(p_gray16 == 12345,"");

        p_rgb.red = 255;
        p_rgb.green = 100;
        p_rgb.blue = 50;

        p_rgba.alpha = 4;
        assign_pixel(p_gray,p_rgb);
        assign_pixel(p_rgb,p_rgb);
        assign_pixel(p_rgba,p_rgb);
        assign_pixel(p_hsi,p_rgb);

        DLIB_CASSERT(p_gray == (255+100+50)/3,"");

        DLIB_CASSERT(p_rgb.red == 255,"");
        DLIB_CASSERT(p_rgb.green == 100,"");
        DLIB_CASSERT(p_rgb.blue == 50,"");

        DLIB_CASSERT(p_rgba.red == 255,"");
        DLIB_CASSERT(p_rgba.green == 100,"");
        DLIB_CASSERT(p_rgba.blue == 50,"");
        DLIB_CASSERT(p_rgba.alpha == 255,"");

        DLIB_CASSERT(p_hsi.i > 0,"");
        DLIB_CASSERT(p_hsi.s > 0,"");
        DLIB_CASSERT(p_hsi.h > 0,"");

        assign_pixel(p_rgb,0);
        DLIB_CASSERT(p_rgb.red == 0,"");
        DLIB_CASSERT(p_rgb.green == 0,"");
        DLIB_CASSERT(p_rgb.blue == 0,"");
        assign_pixel(p_rgb, p_hsi);

        DLIB_CASSERT(p_rgb.red > 251 ,(int)p_rgb.green);
        DLIB_CASSERT(p_rgb.green > 96 && p_rgb.green < 104,(int)p_rgb.green);
        DLIB_CASSERT(p_rgb.blue > 47 && p_rgb.blue < 53,(int)p_rgb.green);

        assign_pixel(p_hsi2, p_hsi);
        DLIB_CASSERT(p_hsi.h == p_hsi2.h,"");
        DLIB_CASSERT(p_hsi.s == p_hsi2.s,"");
        DLIB_CASSERT(p_hsi.i == p_hsi2.i,"");
        assign_pixel(p_hsi,0);
        DLIB_CASSERT(p_hsi.h == 0,"");
        DLIB_CASSERT(p_hsi.s == 0,"");
        DLIB_CASSERT(p_hsi.i == 0,"");
        assign_pixel(p_hsi, p_rgba);

        DLIB_CASSERT(p_hsi.h == p_hsi2.h,"");
        DLIB_CASSERT(p_hsi.s == p_hsi2.s,"");
        DLIB_CASSERT(p_hsi.i == p_hsi2.i,"");

        assign_pixel(p_rgba, 100);
        assign_pixel(p_gray, 10);
        assign_pixel(p_rgb, 10);
        assign_pixel(p_hsi, 10);

        p_rgba.alpha = 0;
        assign_pixel(p_gray, p_rgba);
        DLIB_CASSERT(p_gray == 10,"");
        assign_pixel(p_rgb, p_rgba);
        DLIB_CASSERT(p_rgb.red == 10,"");
        DLIB_CASSERT(p_rgb.green == 10,"");
        DLIB_CASSERT(p_rgb.blue == 10,"");

        assign_pixel(p_hsi, p_rgba);
        assign_pixel(p_hsi2, p_rgb);
        DLIB_CASSERT(p_hsi.h == 0,"");
        DLIB_CASSERT(p_hsi.s == 0,"");
        DLIB_CASSERT(p_hsi.i < p_hsi2.i+2 && p_hsi.i > p_hsi2.i -2,(int)p_hsi.i << "   " << (int)p_hsi2.i);

        assign_pixel(p_rgba, 100);
        assign_pixel(p_gray, 10);
        assign_pixel(p_rgb, 10);
        p_rgba.alpha = 128;
        assign_pixel(p_gray, p_rgba);
        assign_pixel(p_rgb, p_rgba);
        DLIB_CASSERT(p_gray == (100 + 10)/2,"");
        DLIB_CASSERT(p_rgb.red == (100 + 10)/2,"");
        DLIB_CASSERT(p_rgb.green == (100 + 10)/2,"");
        DLIB_CASSERT(p_rgb.blue == (100 + 10)/2,"");

        assign_pixel(p_rgba, 100);
        assign_pixel(p_gray, 10);
        assign_pixel(p_rgb, 10);
        DLIB_CASSERT(p_rgba.alpha == 255,"");
        assign_pixel(p_gray, p_rgba);
        assign_pixel(p_rgb, p_rgba);
        DLIB_CASSERT(p_gray == 100,"");
        DLIB_CASSERT(p_rgb.red == 100,"");
        DLIB_CASSERT(p_rgb.green == 100,"");
        DLIB_CASSERT(p_rgb.blue == 100,"");


        p_rgb.red = 1;
        p_rgb.green = 2;
        p_rgb.blue = 3;

        p_rgba.red = 4;
        p_rgba.green = 5;
        p_rgba.blue = 6;
        p_rgba.alpha = 7;

        p_gray = 8;

        p_hsi.h = 9;
        p_hsi.s = 10;
        p_hsi.i = 11;

        ostringstream sout;
        serialize(p_rgb,sout);
        serialize(p_rgba,sout);
        serialize(p_gray,sout);
        serialize(p_hsi,sout);

        assign_pixel(p_rgb,0);
        assign_pixel(p_rgba,0);
        assign_pixel(p_gray,0);
        assign_pixel(p_hsi,0);

        istringstream sin(sout.str());

        deserialize(p_rgb,sin);
        deserialize(p_rgba,sin);
        deserialize(p_gray,sin);
        deserialize(p_hsi,sin);

        DLIB_CASSERT(p_rgb.red == 1,"");
        DLIB_CASSERT(p_rgb.green == 2,"");
        DLIB_CASSERT(p_rgb.blue == 3,"");

        DLIB_CASSERT(p_rgba.red == 4,"");
        DLIB_CASSERT(p_rgba.green == 5,"");
        DLIB_CASSERT(p_rgba.blue == 6,"");
        DLIB_CASSERT(p_rgba.alpha == 7,"");

        DLIB_CASSERT(p_gray == 8,"");

        DLIB_CASSERT(p_hsi.h == 9,"");
        DLIB_CASSERT(p_hsi.s == 10,"");
        DLIB_CASSERT(p_hsi.i == 11,"");

        {
            matrix<double,1,1> m_gray;
            matrix<double,3,1> m_rgb, m_hsi;

            m_gray = pixel_to_vector<double>(p_gray);
            m_hsi = pixel_to_vector<double>(p_hsi);
            m_rgb = pixel_to_vector<double>(p_rgb);

            DLIB_CASSERT(m_gray(0) == p_gray,"");
            DLIB_CASSERT(m_rgb(0) == p_rgb.red,"");
            DLIB_CASSERT(m_rgb(1) == p_rgb.green,"");
            DLIB_CASSERT(m_rgb(2) == p_rgb.blue,"");
            DLIB_CASSERT(m_hsi(0) == p_hsi.h,"");
            DLIB_CASSERT(m_hsi(1) == p_hsi.s,"");
            DLIB_CASSERT(m_hsi(2) == p_hsi.i,"");

            DLIB_CASSERT(p_rgb.red == 1,"");
            DLIB_CASSERT(p_rgb.green == 2,"");
            DLIB_CASSERT(p_rgb.blue == 3,"");

            DLIB_CASSERT(p_rgba.red == 4,"");
            DLIB_CASSERT(p_rgba.green == 5,"");
            DLIB_CASSERT(p_rgba.blue == 6,"");
            DLIB_CASSERT(p_rgba.alpha == 7,"");

            DLIB_CASSERT(p_gray == 8,"");

            DLIB_CASSERT(p_hsi.h == 9,"");
            DLIB_CASSERT(p_hsi.s == 10,"");
            DLIB_CASSERT(p_hsi.i == 11,"");

            assign_pixel(p_gray,0);
            assign_pixel(p_hsi,0);
            assign_pixel(p_rgb,0);

            vector_to_pixel(p_gray, m_gray);
            vector_to_pixel(p_hsi, m_hsi);
            vector_to_pixel(p_rgb, m_rgb);

            DLIB_CASSERT(p_rgb.red == 1,"");
            DLIB_CASSERT(p_rgb.green == 2,"");
            DLIB_CASSERT(p_rgb.blue == 3,"");

            DLIB_CASSERT(p_rgba.red == 4,"");
            DLIB_CASSERT(p_rgba.green == 5,"");
            DLIB_CASSERT(p_rgba.blue == 6,"");
            DLIB_CASSERT(p_rgba.alpha == 7,"");

            DLIB_CASSERT(p_gray == 8,"");

            DLIB_CASSERT(p_hsi.h == 9,"");
            DLIB_CASSERT(p_hsi.s == 10,"");
            DLIB_CASSERT(p_hsi.i == 11,"");
        }

    }




    class pixel_tester : public tester
    {
    public:
        pixel_tester (
        ) :
            tester ("test_pixel",
                    "Runs tests on the pixel objects and functions.")
        {}

        void perform_test (
        )
        {
            pixel_test();
        }
    } a;

}



