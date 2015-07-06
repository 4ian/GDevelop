// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/geometry.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/string.h>
#include <dlib/matrix.h>
#include <dlib/rand.h>
#include <dlib/array2d.h>
#include <dlib/image_transforms.h>

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

        DLIB_TEST(p1.x() == 0);
        DLIB_TEST(p1.y() == 0);
        DLIB_TEST(p2.x() == 2);
        DLIB_TEST(p2.y() == 3);

        DLIB_TEST((-p2).x() == -2);
        DLIB_TEST((-p2).y() == -3);


        p2 += p2;
        DLIB_TEST(p2.x() == 4);
        DLIB_TEST(p2.y() == 6);

        dlib::vector<double> v1 = point(1,0);
        dlib::vector<double> v2(0,0,1);

        p1 = v2.cross(v1);
        DLIB_TEST(p1 == point(0,1));
        DLIB_TEST(p1 != point(1,1));
        DLIB_TEST(p1 != point(1,0));

        p1 = point(2,3);
        rectangle rect1 = p1;
        DLIB_TEST(rect1.width() == 1);
        DLIB_TEST(rect1.height() == 1);
        p2 = point(1,1);

        rect1 += p2;
        DLIB_TEST(rect1.left() == 1);
        DLIB_TEST(rect1.top() == 1);
        DLIB_TEST(rect1.right() == 2);
        DLIB_TEST(rect1.bottom() == 3);

        DLIB_TEST(rect1.width() == 2);
        DLIB_TEST(rect1.height() == 3);

        // test the iostream << and >> operators (via string_cast and cast_to_string)
        DLIB_TEST(string_cast<point>(" (1, 2 )") == point(1,2));
        DLIB_TEST(string_cast<point>(" ( -1, 2 )") == point(-1,2));
        DLIB_TEST(string_cast<rectangle>(" [(1, 2 )(3,4)]") == rectangle(1,2,3,4));
        DLIB_TEST(string_cast<dlib::vector<double> >(" (1, 2 , 3.5)") == dlib::vector<double>(1,2,3.5));

        DLIB_TEST(string_cast<rectangle>(cast_to_string(rect1)) == rect1);
        DLIB_TEST(string_cast<point>(cast_to_string(p1)) == p1);
        DLIB_TEST(string_cast<dlib::vector<double> >(cast_to_string(v1)) == v1);

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
        DLIB_TEST(rect2 == rect1);
        DLIB_TEST(p2 == p1);
        DLIB_TEST(v2 == v1);
        deserialize(rect2,sin);
        deserialize(p2,sin);
        deserialize(v2,sin);
        DLIB_TEST(rect2 == rect1);
        DLIB_TEST(p2 == p1);
        DLIB_TEST(v2 == v1);
        DLIB_TEST(sin.good());
        DLIB_TEST(sin.get() == EOF);


        v1.x() = 1;
        v1.y() = 2;
        v1.z() = 3;

        matrix<double> mv = v1;
        DLIB_TEST(mv.nr() == 3);
        DLIB_TEST(mv.nc() == 1);
        DLIB_TEST(mv(0) == 1);
        DLIB_TEST(mv(1) == 2);
        DLIB_TEST(mv(2) == 3);

        set_all_elements(mv,0);
        DLIB_TEST(mv(0) == 0);
        DLIB_TEST(mv(1) == 0);
        DLIB_TEST(mv(2) == 0);

        mv(0) = 5;
        mv(1) = 6;
        mv(2) = 7;

        v1 = mv;
        DLIB_TEST(v1.x() == 5);
        DLIB_TEST(v1.y() == 6);
        DLIB_TEST(v1.z() == 7);


        {
            dlib::vector<double,2> vd2;
            dlib::vector<double,3> vd3;
            dlib::vector<long,2> vl2;
            dlib::vector<long,3> vl3;

            vd2.x() = 2.3;
            vd2.y() = 4.7;

            vd3.z() = 9;

            vd3 = vd2;



            vl2 = vd3;
            vl3 = vd3;


            DLIB_TEST(vd2.z() == 0);
            DLIB_TEST(vd3.z() == 0);
            DLIB_TEST(vl2.z() == 0);
            DLIB_TEST(vl3.z() == 0);

            DLIB_TEST(vl2.x() == 2);
            DLIB_TEST(vl3.x() == 2);
            DLIB_TEST(vl2.y() == 5);
            DLIB_TEST(vl3.y() == 5);


            DLIB_TEST(abs(vd2.cross(vd3).dot(vd2)) < 1e-7); 
            DLIB_TEST(abs(vd3.cross(vd2).dot(vd2)) < 1e-7); 
            DLIB_TEST(abs(vd2.cross(vd3).dot(vd3)) < 1e-7); 
            DLIB_TEST(abs(vd3.cross(vd2).dot(vd3)) < 1e-7); 

            DLIB_TEST(abs(vl2.cross(vl3).dot(vl2)) == 0); 
            DLIB_TEST(abs(vl3.cross(vl2).dot(vl2)) == 0); 
            DLIB_TEST(abs(vl2.cross(vl3).dot(vl3)) == 0); 
            DLIB_TEST(abs(vl3.cross(vl2).dot(vl3)) == 0); 


            DLIB_TEST((vd2-vd3).length() < 1e-7);

            DLIB_TEST(vl2 == vl3);


            vl2.x() = 0;
            vl2.y() = 0;
            vl3 = vl2;

            vl2.x() = 4;
            vl3.y() = 3;

            DLIB_TEST(vl2.cross(vl3).length() == 12);
            DLIB_TEST(vl3.cross(vl2).length() == 12);


            matrix<double> m(3,3);
            m = 1,2,3,
                4,5,6,
                7,8,9;

            vd3.x() = 2;
            vd3.y() = 3;
            vd3.z() = 4;

            vd3 = m*vd3;

            DLIB_TEST_MSG(vd3.x() == 1*2 + 2*3 + 3*4,vd3.x() << " == " << (1*2 + 2*3 + 3*4));
            DLIB_TEST(vd3.y() == 4*2 + 5*3 + 6*4);
            DLIB_TEST(vd3.z() == 7*2 + 8*3 + 9*4);

            (vd3*2).dot(vd3);
            (vd2*2).dot(vd3);
            (vd3*2).dot(vd2);
            (vd2*2).dot(vd2);
            (2*vd3*2).dot(vd3);
            (2*vd2*2).dot(vd3);
            (2*vd3*2).dot(vd2);
            (2*vd2*2).dot(vd2);

            (vd2 + vd3).dot(vd2);
            (vd2 - vd3).dot(vd2);
            (vd2/2).dot(vd2);
            (vd3/2).dot(vd2);
        }

        {
            dlib::vector<double,2> vd2;
            dlib::vector<long,3> vl3;

            vl3.x() = 1;
            vl3.y() = 2;
            vl3.z() = 3;

            vd2.x() = 6.5;
            vd2.y() = 7.5;

            DLIB_TEST((vl3 + vd2).x() == 1+6.5);
            DLIB_TEST((vl3 + vd2).y() == 2+7.5);
            DLIB_TEST((vl3 + vd2).z() == 3+0);

            DLIB_TEST((vl3 - vd2).x() == 1-6.5);
            DLIB_TEST((vl3 - vd2).y() == 2-7.5);
            DLIB_TEST((vl3 - vd2).z() == 3-0);

        }

        {
            dlib::vector<double> v(3,4,5);
            DLIB_TEST((-v).x() == -3.0);
            DLIB_TEST((-v).y() == -4.0);
            DLIB_TEST((-v).z() == -5.0);
        }

        {
            rectangle rect;

            point tl(2,3);
            point tr(8,3);
            point bl(2,9);
            point br(8,9);

            rect += tl;
            rect += tr;
            rect += bl;
            rect += br;

            DLIB_TEST(rect.tl_corner() == tl);
            DLIB_TEST(rect.tr_corner() == tr);
            DLIB_TEST(rect.bl_corner() == bl);
            DLIB_TEST(rect.br_corner() == br);

        }

        {
            point p1, center;

            center = point(3,4);
            p1 = point(10,4);

            DLIB_TEST(rotate_point(center, p1, pi/2) == point(3,7+4));

            center = point(3,3);
            p1 = point(10,3);

            DLIB_TEST(rotate_point(center, p1, pi/4) == point(8,8));
            DLIB_TEST(rotate_point(center, p1, -pi/4) == point(8,-2));

            DLIB_TEST(rotate_point(center, p1, pi/4 + 10*pi) == point(8,8));
            DLIB_TEST(rotate_point(center, p1, -pi/4 + 10*pi) == point(8,-2));
            DLIB_TEST(rotate_point(center, p1, pi/4 - 10*pi) == point(8,8));
            DLIB_TEST(rotate_point(center, p1, -pi/4 - 10*pi) == point(8,-2));

            point_rotator rot(pi/2);
            DLIB_TEST(rot(point(1,0)) == point(0,1));
            DLIB_TEST(rot(point(0,1)) == point(-1,0));
            DLIB_TEST(point(rot.get_m()*(dlib::vector<double,2>(1,0))) == point(0,1));
            DLIB_TEST(point(rot.get_m()*(dlib::vector<double,2>(0,1))) == point(-1,0));
        }

        {
            rectangle rect;

            rect = grow_rect(rect,1);
            DLIB_TEST(rect.width() == 2);
            DLIB_TEST(rect.height() == 2);
            DLIB_TEST(rect.left() == -1);
            DLIB_TEST(rect.top() == -1);
            DLIB_TEST(rect.right() == 0);
            DLIB_TEST(rect.bottom() == 0);
        }
        {
            rectangle rect;

            rect = grow_rect(rect,2);
            DLIB_TEST(rect.width() == 4);
            DLIB_TEST(rect.height() == 4);
            DLIB_TEST(rect.left() == -2);
            DLIB_TEST(rect.top() == -2);
            DLIB_TEST(rect.right() == 1);
            DLIB_TEST(rect.bottom() == 1);

            rect = shrink_rect(rect,1);
            DLIB_TEST(rect.width() == 2);
            DLIB_TEST(rect.height() == 2);
            DLIB_TEST(rect.left() == -1);
            DLIB_TEST(rect.top() == -1);
            DLIB_TEST(rect.right() == 0);
            DLIB_TEST(rect.bottom() == 0);
        }
        {
            std::vector< dlib::vector<double> > a;

            dlib::vector<double> v;
            dlib::rand rnd;

            for (int i = 0; i < 10; ++i)
            {
                v.x() = rnd.get_random_double();
                v.y() = rnd.get_random_double();
                v.z() = rnd.get_random_double();
                a.push_back(v);

            }

            // This test is just to make sure the covariance function can compile when used
            // on a dlib::vector.  The actual test doesn't matter.
            DLIB_TEST(sum(covariance(mat(a))) < 10); 

        }


        DLIB_TEST(rectangle() + point(5,4) + point(10,10) == rectangle(5,4,10,10));

        // make sure the center of a centered rectangle is always right
        for (long x = -10; x <= 10; ++x)
        {
            for (long y = -10; y <= 10; ++y)
            {
                for (long w = 0; w < 10; ++w)
                {
                    for (long h = 0; h < 10; ++h)
                    {
                        DLIB_TEST(center(centered_rect(x,y,w,h)) == point(x,y));
                    }
                }
            }
        }

    }

// ----------------------------------------------------------------------------------------

    void test_border_enumerator()
    {



        border_enumerator be;
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 0);
        DLIB_TEST(be.current_element_valid() == false);
        DLIB_TEST(be.move_next() == false);
        DLIB_TEST(be.at_start() == false);
        DLIB_TEST(be.current_element_valid() == false);
        DLIB_TEST(be.move_next() == false);
        DLIB_TEST(be.at_start() == false);
        DLIB_TEST(be.current_element_valid() == false);
        DLIB_TEST(be.size() == 0);

        be = border_enumerator(rectangle(4,4,4,4),1);
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 1);
        be = border_enumerator(rectangle(4,4,4,4),3);
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 1);
        be = border_enumerator(rectangle(4,4,4,4),0);
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 0);
        be = border_enumerator(rectangle(4,4,5,5),0);
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 0);
        be = border_enumerator(rectangle(4,4,5,5),1);
        DLIB_TEST(be.at_start() == true);
        DLIB_TEST(be.size() == 4);
        be = border_enumerator(rectangle(4,4,5,5),2);
        DLIB_TEST(be.size() == 4);
        be = border_enumerator(rectangle(4,4,6,6),1);
        DLIB_TEST(be.size() == 8);
        be = border_enumerator(rectangle(4,4,6,6),2);
        DLIB_TEST(be.size() == 9);
        be = border_enumerator(rectangle(4,4,6,6),3);
        DLIB_TEST(be.size() == 9);
        DLIB_TEST(be.at_start() == true);

        array2d<unsigned char> img, img2;
        for (int size = 1; size < 10; ++size)
        {
            for (int bs = 0; bs < 4; ++bs)
            {
                img.set_size(size,size);
                img2.set_size(size,size);

                assign_all_pixels(img, 1);
                assign_all_pixels(img2, 1);

                zero_border_pixels(img2, bs,bs);

                be = border_enumerator(get_rect(img),bs);
                DLIB_TEST(be.at_start() == true);
                DLIB_TEST(be.current_element_valid() == false);
                while (be.move_next())
                {
                    DLIB_TEST(be.at_start() == false);
                    DLIB_TEST(be.current_element_valid() == true);
                    DLIB_TEST_MSG(get_rect(img).contains(be.element()) == true,
                                 get_rect(img) << "   " << be.element()
                    );
                    const point p = be.element();
                    img[p.y()][p.x()] = 0;
                }
                DLIB_TEST(be.at_start() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.at_start() == false);

                DLIB_TEST(mat(img) == mat(img2));

            }
        }

        for (int size = 1; size < 10; ++size)
        {
            for (int bs = 0; bs < 4; ++bs)
            {
                img.set_size(size,size+5);
                img2.set_size(size,size+5);

                assign_all_pixels(img, 1);
                assign_all_pixels(img2, 1);

                zero_border_pixels(img2, bs,bs);

                const point shift(4,5);

                be = border_enumerator(translate_rect(get_rect(img),shift),bs);
                DLIB_TEST(be.at_start() == true);
                DLIB_TEST(be.current_element_valid() == false);
                while (be.move_next())
                {
                    DLIB_TEST(be.current_element_valid() == true);
                    DLIB_TEST(be.at_start() == false);
                    DLIB_TEST_MSG(get_rect(img).contains(be.element()-shift) == true,
                                 get_rect(img) << "   " << be.element()
                    );
                    const point p = be.element()-shift;
                    img[p.y()][p.x()] = 0;
                }
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.at_start() == false);

                DLIB_TEST(mat(img) == mat(img2));

            }
        }

        for (int size = 1; size < 10; ++size)
        {
            for (int bs = 0; bs < 4; ++bs)
            {
                img.set_size(size+2,size);
                img2.set_size(size+2,size);

                assign_all_pixels(img, 1);
                assign_all_pixels(img2, 1);

                zero_border_pixels(img2, bs,bs);

                const point shift(-4,5);

                be = border_enumerator(translate_rect(get_rect(img),shift),bs);
                DLIB_TEST(be.current_element_valid() == false);
                while (be.move_next())
                {
                    DLIB_TEST(be.current_element_valid() == true);
                    DLIB_TEST_MSG(get_rect(img).contains(be.element()-shift) == true,
                                 get_rect(img) << "   " << be.element()
                    );
                    const point p = be.element()-shift;
                    img[p.y()][p.x()] = 0;
                }
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);
                DLIB_TEST(be.move_next() == false);
                DLIB_TEST(be.current_element_valid() == false);

                DLIB_TEST(mat(img) == mat(img2));

            }
        }

        {
            matrix<bool,4,5> hits, truth;
            const rectangle rect = rectangle(1,1,4,3); 

            border_enumerator be(rect, rectangle(2,2, 3, 3));
            DLIB_TEST(be.size() == 8);
            hits = false;
            while (be.move_next())
            {
                DLIB_TEST(rect.contains(be.element()));
                hits(be.element().y(), be.element().x()) = true;
            }
            DLIB_TEST(be.current_element_valid() == false);
            DLIB_TEST(be.size() == 8);
            truth = false;
            truth(1,1) = truth(1,2) = truth(1,3) = truth(1,4) = truth(2,1) =
                truth(3,1) = truth(2,4) = truth(3,4) = true;
            DLIB_TEST_MSG(truth == hits, truth << endl << hits);


            

            be = border_enumerator(rect, rectangle(0,0, 9, 9));
            DLIB_TEST(be.size() == 0);
            hits = false;
            while (be.move_next())
            {
                DLIB_TEST(rect.contains(be.element()));
                hits(be.element().y(), be.element().x()) = true;
            }
            DLIB_TEST(be.current_element_valid() == false);
            DLIB_TEST(be.size() == 0);
            truth = false;
            DLIB_TEST(truth == hits);



            be = border_enumerator(rect, rectangle(0,0, 3, 9));
            DLIB_TEST(be.size() == 3);
            hits = false;
            while (be.move_next())
            {
                DLIB_TEST(rect.contains(be.element()));
                hits(be.element().y(), be.element().x()) = true;
            }
            DLIB_TEST(be.current_element_valid() == false);
            DLIB_TEST(be.size() == 3);
            truth = false;
            truth(1,4) = truth(2,4) = truth(3,4) = true;
            DLIB_TEST(truth == hits);




            be = border_enumerator(rect, rectangle(2,1, 4, 3));
            DLIB_TEST(be.size() == 3);
            hits = false;
            while (be.move_next())
            {
                DLIB_TEST(rect.contains(be.element()));
                hits(be.element().y(), be.element().x()) = true;
            }
            DLIB_TEST(be.current_element_valid() == false);
            DLIB_TEST(be.size() == 3);
            truth = false;
            truth(1,1) = truth(2,1) = truth(3,1) = true;
            DLIB_TEST(truth == hits);



            be = border_enumerator(rect, rectangle(1,1, 5, 2));
            DLIB_TEST(be.size() == 4);
            hits = false;
            while (be.move_next())
            {
                DLIB_TEST(rect.contains(be.element()));
                hits(be.element().y(), be.element().x()) = true;
            }
            DLIB_TEST(be.current_element_valid() == false);
            DLIB_TEST(be.size() == 4);
            truth = false;
            truth(3,1) = truth(3,2) = truth(3,3) = truth(3,4) = true;
            DLIB_TEST(truth == hits);



        }

    }

// ----------------------------------------------------------------------------------------

    void test_find_affine_transform()
    {
        //typedef dlib::vector<double,2> vect;
        typedef point vect;
        std::vector<vect> from, to;

        from.push_back(vect(0,0));
        to.push_back(vect(0,1));

        from.push_back(vect(0,1));
        to.push_back(vect(1,1));

        from.push_back(vect(1,1));
        to.push_back(vect(1,0));

        from.push_back(vect(1,0));
        to.push_back(vect(0,0));

        point_transform_affine t = find_affine_transform(from,to);
        point_transform_affine tinv = inv(t);

        for (unsigned long i = 0; i < from.size(); ++i)
        {
            dlog << LINFO << "affine transformation error: "<< length(t(from[i])-to[i]);
            DLIB_TEST(length(t(from[i])-to[i]) < 1e-14);
            DLIB_TEST(length(tinv(t(from[i]))-from[i]) < 1e-14);
            DLIB_TEST(length(t(tinv(from[i]))-from[i]) < 1e-14);

            point_transform_affine temp = t*inv(t);
            DLIB_TEST(length(temp.get_b()) < 1e-14);
            DLIB_TEST(max(abs(temp.get_m() - identity_matrix<double>(2))) < 1e-14);
        }

        ostringstream sout;
        serialize(t, sout);
        istringstream sin(sout.str());
        point_transform_affine t2;
        DLIB_TEST(length(t2(point(2,3)) - point(2,3)) < 1e-14);
        deserialize(t2, sin);
        DLIB_TEST(max(abs(t2.get_m()-t.get_m())) < 1e-14);
        DLIB_TEST(max(abs(t2.get_b()-t.get_b())) < 1e-14);
    }

// ----------------------------------------------------------------------------------------

    double projective_transform_pass_rate(const double error_rate)
    {
        print_spinner();
        dlog << LINFO << "projective_transform_pass_rate, error_rate: "<< error_rate;
        dlib::rand rnd;
        running_stats<double> pass_rate;
        for (int rounds = 0; rounds < 1000; ++rounds)
        {
            running_stats<double> rs, rs_true;
            matrix<double> H = 2*(randm(3,3,rnd)-0.5);

            H(0,2) = rnd.get_random_gaussian()*10;
            H(1,2) = rnd.get_random_gaussian()*10;


            H(2,0) = rnd.get_random_double()*2.1;
            H(2,1) = rnd.get_random_double()*2.1;
            H(2,2) = 1 + rnd.get_random_gaussian()*3.1; 

            point_transform_projective tran(H);
            point_transform_projective traninv = inv(tran);

            const int num = rnd.get_random_32bit_number()%8 + 4;

            std::vector<dlib::vector<double,2> > from_points, to_points;
            for (int i = 0; i < num; ++i)
            {
                dlib::vector<double,2> p = randm(2,1,rnd)*1000;
                from_points.push_back(p);
                to_points.push_back(tran(p) + (randm(2,1,rnd)-0.5)*error_rate);
                DLIB_TEST(length(traninv(tran(p))-p) <= 1e-5);
                DLIB_TEST(length(tran(traninv(p))-p) <= 1e-5);

                point_transform_projective temp = tran*traninv;
                DLIB_TEST_MSG(max(abs(temp.get_m() - identity_matrix<double>(3))) < 1e-10, temp.get_m());
                temp = traninv*tran;
                DLIB_TEST_MSG(max(abs(temp.get_m() - identity_matrix<double>(3))) < 1e-10, temp.get_m());
            }


            point_transform_projective tran2 = find_projective_transform(from_points, to_points);

            for (unsigned long i = 0; i < from_points.size(); ++i)
            {
                const double err = length_squared(tran2(from_points[i]) - to_points[i]);
                rs.add(err);
                const double err_true = length_squared(tran(from_points[i]) - to_points[i]);
                rs_true.add(err_true);
            }

            if ( rs.mean() < 0.01)
            {
                pass_rate.add(1);
            }
            else
            {
                dlog << LINFO << " errors: mean/max: " << rs.mean() << "  " << rs.max();
                pass_rate.add(0);
            }

            ostringstream sout;
            serialize(tran, sout);
            istringstream sin(sout.str());
            point_transform_projective tran3;
            DLIB_TEST(length(tran3(point(2,3)) - point(2,3)) < 1e-14);
            deserialize(tran3, sin);
            DLIB_TEST(max(abs(tran3.get_m()-tran.get_m())) < 1e-14);
        }

        dlog << LINFO << " pass_rate.mean(): "<< pass_rate.mean();
        return pass_rate.mean();
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void test_find_similarity_transform()
    {
        print_spinner();
        std::vector<dlib::vector<T,2> > from_points, to_points;

        from_points.push_back(dlib::vector<T,2>(0,0));
        from_points.push_back(dlib::vector<T,2>(0,1));
        from_points.push_back(dlib::vector<T,2>(1,0));

        to_points.push_back(dlib::vector<T,2>(8,0));
        to_points.push_back(dlib::vector<T,2>(6,0));
        to_points.push_back(dlib::vector<T,2>(8,2));

        point_transform_affine tform = find_similarity_transform(from_points, to_points);

        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            DLIB_TEST(length(tform(from_points[i]) - to_points[i]) < 1e-14);
        }
    }

    template <typename T>
    void test_find_similarity_transform2()
    {
        print_spinner();
        std::vector<dlib::vector<T,2> > from_points, to_points;

        from_points.push_back(dlib::vector<T,2>(0,0));
        from_points.push_back(dlib::vector<T,2>(0,1));

        to_points.push_back(dlib::vector<T,2>(8,0));
        to_points.push_back(dlib::vector<T,2>(6,0));

        point_transform_affine tform = find_similarity_transform(from_points, to_points);

        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            DLIB_TEST(length(tform(from_points[i]) - to_points[i]) < 1e-14);
        }
    }


// ----------------------------------------------------------------------------------------

    void test_rect_to_drect()
    {
        print_spinner();
        dlib::rand rnd;
        for (int i = 0; i < 5000; ++i)
        {
            rectangle rect = centered_rect(rnd.get_random_32bit_number()%100,
                rnd.get_random_32bit_number()%100,
                rnd.get_random_32bit_number()%100,
                rnd.get_random_32bit_number()%100);

            drectangle drect = rect;
            rectangle rect2 = drect;
            DLIB_TEST(rect2 == rect);
            DLIB_TEST(rect.width() == drect.width());
            DLIB_TEST(rect.height() == drect.height());
            DLIB_TEST(dcenter(rect) == dcenter(drect));
            DLIB_TEST(rect.is_empty() == drect.is_empty());
        }
    }

// ----------------------------------------------------------------------------------------

    void test_affine3d()
    {
        const dlib::vector<double> x(1,0,0);
        const dlib::vector<double> y(0,1,0);
        const dlib::vector<double> z(0,0,1);
        const dlib::vector<double> e(1,1,1);
        const dlib::vector<double> ex(-1,1,1);
        const dlib::vector<double> ey(1,-1,1);
        const dlib::vector<double> ez(1,1,-1);

        dlib::vector<double> w;

        w = rotate_around_z(pi/2)(x);
        DLIB_TEST(length(w-y) < 1e-12);
        w = rotate_around_z(pi/2)(e);
        DLIB_TEST(length(w-ex) < 1e-12);

        w = rotate_around_y(-pi/2)(x);
        DLIB_TEST(length(w-z) < 1e-12);
        w = rotate_around_y(pi/2)(e);
        DLIB_TEST(length(w-ez) < 1e-12);

        w = rotate_around_x(pi/2)(y);
        DLIB_TEST(length(w-z) < 1e-12);
        w = rotate_around_x(pi/2)(e);
        DLIB_TEST(length(w-ey) < 1e-12);

        w = translate_point(x)(y);
        DLIB_TEST(length(w-x-y) < 1e-12);

        point_transform_affine3d tform;
        tform = rotate_around_x(pi/2)*rotate_around_z(pi/2)*translate_point(x);
        DLIB_TEST(length(tform(dlib::vector<double>())-z) < 1e-12);
        DLIB_TEST(length(inv(tform)(z)) < 1e-12);

        point_transform_affine tform2; 
        tform = tform*tform2;// the default tform is the identity mapping so this shouldn't do anything different 
        DLIB_TEST(length(tform(dlib::vector<double>())-z) < 1e-12);
        DLIB_TEST(length(inv(tform)(z)) < 1e-12);
    }

// ----------------------------------------------------------------------------------------

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
            test_affine3d();
            test_rect_to_drect();
            geometry_test();
            test_border_enumerator();
            test_find_affine_transform();
            DLIB_TEST(projective_transform_pass_rate(0.1) > 0.99);
            DLIB_TEST(projective_transform_pass_rate(0.0) == 1);

            test_find_similarity_transform<double>(); 
            test_find_similarity_transform2<double>(); 
            test_find_similarity_transform<float>(); 
            test_find_similarity_transform2<float>(); 
        }
    } a;

}



