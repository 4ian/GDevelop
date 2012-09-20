// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/geometry.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/string.h>
#include <dlib/matrix.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.geometry");

    void geometry_test (
    )
    /*!
        ensures
            - runs tests on the geometry stuff compliance with the specs
    !*/
    {        
        print_spinner();

        point p1;
        point p2(2,3);

        DLIB_CASSERT(p1.x() == 0,"");
        DLIB_CASSERT(p1.y() == 0,"");
        DLIB_CASSERT(p2.x() == 2,"");
        DLIB_CASSERT(p2.y() == 3,"");

        p2 += p2;
        DLIB_CASSERT(p2.x() == 4,"");
        DLIB_CASSERT(p2.y() == 6,"");

        dlib::vector<double> v1 = point(1,0);
        dlib::vector<double> v2(0,0,1);

        p1 = v2.cross(v1);
        DLIB_CASSERT(p1 == point(0,1),"");
        DLIB_CASSERT(p1 != point(1,1),"");
        DLIB_CASSERT(p1 != point(1,0),"");

        p1 = point(2,3);
        rectangle rect1 = p1;
        DLIB_CASSERT(rect1.width() == 1,"");
        DLIB_CASSERT(rect1.height() == 1,"");
        p2 = point(1,1);

        rect1 += p2;
        DLIB_CASSERT(rect1.left() == 1,"");
        DLIB_CASSERT(rect1.top() == 1,"");
        DLIB_CASSERT(rect1.right() == 2,"");
        DLIB_CASSERT(rect1.bottom() == 3,"");

        DLIB_CASSERT(rect1.width() == 2,"");
        DLIB_CASSERT(rect1.height() == 3,"");

        // test the iostream << and >> operators (via string_cast and cast_to_string)
        DLIB_CASSERT(string_cast<point>(" (1, 2 )") == point(1,2),"");
        DLIB_CASSERT(string_cast<point>(" ( -1, 2 )") == point(-1,2),"");
        DLIB_CASSERT(string_cast<rectangle>(" [(1, 2 )(3,4)]") == rectangle(1,2,3,4),"");
        DLIB_CASSERT(string_cast<dlib::vector<double> >(" (1, 2 , 3.5)") == dlib::vector<double>(1,2,3.5),"");

        DLIB_CASSERT(string_cast<rectangle>(cast_to_string(rect1)) == rect1,"");
        DLIB_CASSERT(string_cast<point>(cast_to_string(p1)) == p1,"");
        DLIB_CASSERT(string_cast<dlib::vector<double> >(cast_to_string(v1)) == v1,"");

        rectangle rect2;

        // test the serialization code
        ostringstream sout;
        serialize(rect1,sout);
        serialize(p1,sout);
        serialize(v1,sout);
        serialize(rect1,sout);
        serialize(p1,sout);
        serialize(v1,sout);

        istringstream sin(sout.str());

        deserialize(rect2,sin);
        deserialize(p2,sin);
        deserialize(v2,sin);
        DLIB_CASSERT(rect2 == rect1,"");
        DLIB_CASSERT(p2 == p1,"");
        DLIB_CASSERT(v2 == v1,"");
        deserialize(rect2,sin);
        deserialize(p2,sin);
        deserialize(v2,sin);
        DLIB_CASSERT(rect2 == rect1,"");
        DLIB_CASSERT(p2 == p1,"");
        DLIB_CASSERT(v2 == v1,"");
        DLIB_CASSERT(sin,"");
        DLIB_CASSERT(sin.get() == EOF,"");


        v1.x() = 1;
        v1.y() = 2;
        v1.z() = 3;

        matrix<double> mv = v1;
        DLIB_CASSERT(mv.nr() == 3,"");
        DLIB_CASSERT(mv.nc() == 1,"");
        DLIB_CASSERT(mv(0) == 1,"");
        DLIB_CASSERT(mv(1) == 2,"");
        DLIB_CASSERT(mv(2) == 3,"");

        set_all_elements(mv,0);
        DLIB_CASSERT(mv(0) == 0,"");
        DLIB_CASSERT(mv(1) == 0,"");
        DLIB_CASSERT(mv(2) == 0,"");

        mv(0) = 5;
        mv(1) = 6;
        mv(2) = 7;

        v1 = mv;
        DLIB_CASSERT(v1.x() == 5,"");
        DLIB_CASSERT(v1.y() == 6,"");
        DLIB_CASSERT(v1.z() == 7,"");

    }






    class geometry_tester : public tester
    {
    public:
        geometry_tester (
        ) :
            tester ("test_geometry",
                    "Runs tests on the geometry stuff.")
        {}

        void perform_test (
        )
        {
            geometry_test();
        }
    } a;

}










