// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"

#include "tester.h"
#include <dlib/memory_manager_stateless.h>
#include <dlib/array2d.h>

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.matrix4");

    void matrix_test (
    )
    /*!
        ensures
            - runs tests on the matrix stuff compliance with the specs
    !*/
    {        
        print_spinner();

        {
            matrix<double,3,3> m = round(10*randm(3,3));
            matrix<double,3,1> v = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double,3,3> m = round(10*randm(3,3));
            matrix<double,1,3> v = round(10*randm(1,3));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double> m = round(10*randm(3,3));
            matrix<double,1,3> v = round(10*randm(1,3));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double> m = round(10*randm(3,3));
            matrix<double,0,3> v = round(10*randm(1,3));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }


        {
            matrix<double> m = round(10*randm(3,3));
            matrix<double,1,0> v = round(10*randm(1,3));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double> m = round(10*randm(3,3));
            matrix<double,3,0> v = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }


        {
            matrix<double> m = round(10*randm(3,3));
            matrix<double,0,1> v = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double,3,3> m = round(10*randm(3,3));
            matrix<double,3,0> v = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }


        {
            matrix<double,3,3> m = round(10*randm(3,3));
            matrix<double,0,1> v = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v) , m*tmp(diagm(v)) ));
            DLIB_TEST(equal( scale_columns(m,v) , m*tmp(diagm(v)) ));

            DLIB_TEST(equal( diagm(v)*m , tmp(diagm(v))*m )); 
            DLIB_TEST(equal( scale_rows(m,v) , tmp(diagm(v))*m )); 
        }

        {
            matrix<double,3,5> m = round(10*randm(3,5));
            matrix<double,0,1> v1 = round(10*randm(5,1));
            matrix<double,0,1> v2 = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v1) , m*tmp(diagm(v1)) ));
            DLIB_TEST(equal( scale_columns(m,v1) , m*tmp(diagm(v1)) ));

            DLIB_TEST(equal( diagm(v2)*m , tmp(diagm(v2))*m )); 
            DLIB_TEST(equal( scale_rows(m,v2) , tmp(diagm(v2))*m )); 
        }

        {
            matrix<double,3,5> m = round(10*randm(3,5));
            matrix<double,5,1> v1 = round(10*randm(5,1));
            matrix<double,3,1> v2 = round(10*randm(3,1));

            DLIB_TEST(equal( m*diagm(v1) , m*tmp(diagm(v1)) ));
            DLIB_TEST(equal( scale_columns(m,v1) , m*tmp(diagm(v1)) ));

            DLIB_TEST(equal( diagm(v2)*m , tmp(diagm(v2))*m )); 
            DLIB_TEST(equal( scale_rows(m,v2) , tmp(diagm(v2))*m )); 
        }

    }

    void test_stuff()
    {
        print_spinner();

        {
            matrix<double> m(3,3), lr(3,3), ud(3,3);

            m = 1,2,3,
                4,5,6,
                7,8,9;


            lr = 3,2,1,
                 6,5,4,
                 9,8,7;

            ud = 7,8,9,
                 4,5,6,
                 1,2,3;

            DLIB_TEST(lr == fliplr(m));
            DLIB_TEST(ud == flipud(m));
        }
        {
            matrix<double> m(3,2), lr(3,2), ud(3,2);

            m = 1,2,
                3,4,
                5,6;

            lr = 2,1,
                 4,3,
                 6,5;

            ud = 5,6,
                 3,4,
                 1,2;

            DLIB_TEST(lr == fliplr(m));
            DLIB_TEST(ud == flipud(m));
        }

        {
            matrix<int> a, b;

            a = matrix_cast<int>(round(10*randm(3,3)));
            b = a;

            b *= b;
            DLIB_TEST(b == a*a);
        }

        {
            matrix<double> m(2,3), m2(2,3);

            m = 1,2,3,
                4,5,6;


            m2 = 3,4,5,
                 6,7,8;

            DLIB_TEST(m + 2 == m2);
            DLIB_TEST(2 + m == m2);

            m += 2;
            DLIB_TEST(m == m2);
            m -= 2;

            m2 = 0,1,2,
                 3,4,5;

            DLIB_TEST(m - 1 == m2);

            m -= 1;
            DLIB_TEST(m == m2);
            m += 1;


            m2 = 5,4,3,
                 2,1,0;

            DLIB_TEST(6 - m == m2);
        }

        {
            matrix<float> m(2,3), m2(2,3);

            m = 1,2,3,
                4,5,6;


            m2 = 3,4,5,
                 6,7,8;

            DLIB_TEST(m + 2 == m2);
            DLIB_TEST(2 + m == m2);

            m += 2;
            DLIB_TEST(m == m2);
            m -= 2;

            m2 = 0,1,2,
                 3,4,5;

            DLIB_TEST(m - 1 == m2);

            m -= 1;
            DLIB_TEST(m == m2);
            m += 1;


            m2 = 5,4,3,
                 2,1,0;

            DLIB_TEST(6 - m == m2);
        }

        {
            matrix<int> m(2,3), m2(2,3);

            m = 1,2,3,
                4,5,6;


            m2 = 3,4,5,
                 6,7,8;

            DLIB_TEST(m + 2 == m2);
            DLIB_TEST(2 + m == m2);

            m += 2;
            DLIB_TEST(m == m2);
            m -= 2;

            m2 = 0,1,2,
                 3,4,5;

            DLIB_TEST(m - 1 == m2);

            m -= 1;
            DLIB_TEST(m == m2);
            m += 1;


            m2 = 5,4,3,
                 2,1,0;

            DLIB_TEST(6 - m == m2);
        }

        {
            matrix<int,2,3> m, m2;

            m = 1,2,3,
                4,5,6;


            m2 = 3,4,5,
                 6,7,8;

            DLIB_TEST(m + 2 == m2);
            DLIB_TEST(2 + m == m2);

            m += 2;
            DLIB_TEST(m == m2);
            m -= 2;

            m2 = 0,1,2,
                 3,4,5;

            DLIB_TEST(m - 1 == m2);

            m -= 1;
            DLIB_TEST(m == m2);
            m += 1;


            m2 = 5,4,3,
                 2,1,0;

            DLIB_TEST(6 - m == m2);
        }

        {
            matrix<double> m(2,3), m2(3,2);

            m = 1,2,3,
                4,5,6;

            m2 = 2,5,
                 3,6,
                 4,7;

            DLIB_TEST(trans(m+1) == m2);
            DLIB_TEST(trans(m)+1 == m2);
            DLIB_TEST(1+trans(m) == m2);
            DLIB_TEST(1+m-1 == m);

            m = trans(m+1);
            DLIB_TEST(m == m2);
            m = trans(m-1);
            DLIB_TEST(trans(m+1) == m2);
            m = trans(m)+1;
            DLIB_TEST(m == m2);
        }

        {
            matrix<double> d(3,1), di(3,1);
            matrix<double> m(3,3);
             
            m = 1,2,3,
                4,5,6,
                7,8,9;

            d = 1,2,3;

            di = 1, 1/2.0, 1/3.0;

            DLIB_TEST(inv(diagm(d)) == diagm(di));
            DLIB_TEST(pinv(diagm(d)) == diagm(di));
            DLIB_TEST(inv(diagm(d))*m == tmp(diagm(di))*m);
            DLIB_TEST(m*inv(diagm(d)) == m*tmp(diagm(di)));

            DLIB_TEST(equal(inv(diagm(d)) + m , tmp(diagm(di)) + m));
            DLIB_TEST(equal(m + inv(diagm(d)) , tmp(diagm(di)) + m));

            DLIB_TEST((m + identity_matrix<double>(3) == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>() == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + 2*identity_matrix<double>(3) == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + 2*identity_matrix<double,3>() == m + 2*tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + identity_matrix<double>(3)*2 == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>()*2 == m + 2*tmp(identity_matrix<double,3>())));

            DLIB_TEST((identity_matrix<double>(3) + m == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((identity_matrix<double,3>() + m == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((2*identity_matrix<double>(3) + m == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((2*identity_matrix<double,3>() + m == m + 2*tmp(identity_matrix<double,3>())));

        }
        {
            matrix<double,3,1> d(3,1), di(3,1);
            matrix<double,3,3> m(3,3);
             
            m = 1,2,3,
                4,5,6,
                7,8,9;

            d = 1,2,3;

            di = 1, 1/2.0, 1/3.0;

            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d))*m , tmp(diagm(di))*m));
            DLIB_TEST(equal(m*inv(diagm(d)) , m*tmp(diagm(di))));

            DLIB_TEST_MSG(equal(inv(diagm(d)) + m , tmp(diagm(di)) + m), 
                          (inv(diagm(d)) + m) - (tmp(diagm(di)) + m) );
            DLIB_TEST(equal(m + inv(diagm(d)) , tmp(diagm(di)) + m));


            DLIB_TEST((m + identity_matrix<double>(3) == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>() == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + 2*identity_matrix<double>(3) == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + 2*identity_matrix<double,3>() == m + 2*tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + identity_matrix<double>(3)*2 == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>()*2 == m + 2*tmp(identity_matrix<double,3>())));

            DLIB_TEST((identity_matrix<double>(3) + m == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((identity_matrix<double,3>() + m == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((2*identity_matrix<double>(3) + m == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((2*identity_matrix<double,3>() + m == m + 2*tmp(identity_matrix<double,3>())));
        }

        {
            matrix<double,1,3> d(1,3), di(1,3);
            matrix<double,3,3> m(3,3);
             
            m = 1,2,3,
                4,5,6,
                7,8,9;

            d = 1,2,3;

            di = 1, 1/2.0, 1/3.0;

            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d))*m , tmp(diagm(di))*m));
            DLIB_TEST(equal(m*inv(diagm(d)) , m*tmp(diagm(di))));

            DLIB_TEST(equal(inv(diagm(d)) + m , tmp(diagm(di)) + m));
            DLIB_TEST(equal(m + inv(diagm(d)) , tmp(diagm(di)) + m));


            DLIB_TEST((m + identity_matrix<double>(3) == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>() == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + 2*identity_matrix<double>(3) == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + 2*identity_matrix<double,3>() == m + 2*tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + identity_matrix<double>(3)*2 == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>()*2 == m + 2*tmp(identity_matrix<double,3>())));

            DLIB_TEST((identity_matrix<double>(3) + m == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((identity_matrix<double,3>() + m == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((2*identity_matrix<double>(3) + m == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((2*identity_matrix<double,3>() + m == m + 2*tmp(identity_matrix<double,3>())));
        }

        {
            matrix<double,1,0> d(1,3), di(1,3);
            matrix<double,0,3> m(3,3);
             
            m = 1,2,3,
                4,5,6,
                7,8,9;

            d = 1,2,3;

            di = 1, 1/2.0, 1/3.0;

            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d)) , diagm(di)));
            DLIB_TEST(equal(inv(diagm(d))*m , tmp(diagm(di))*m));
            DLIB_TEST(equal(m*inv(diagm(d)) , m*tmp(diagm(di))));

            DLIB_TEST(equal(inv(diagm(d)) + m , tmp(diagm(di)) + m));
            DLIB_TEST(equal(m + inv(diagm(d)) , tmp(diagm(di)) + m));


            DLIB_TEST((m + identity_matrix<double>(3) == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>() == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + 2*identity_matrix<double>(3) == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + 2*identity_matrix<double,3>() == m + 2*tmp(identity_matrix<double,3>())));
            DLIB_TEST((m + identity_matrix<double>(3)*2 == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((m + identity_matrix<double,3>()*2 == m + 2*tmp(identity_matrix<double,3>())));

            DLIB_TEST((identity_matrix<double>(3) + m == m + tmp(identity_matrix<double>(3))));
            DLIB_TEST((identity_matrix<double,3>() + m == m + tmp(identity_matrix<double,3>())));
            DLIB_TEST((2*identity_matrix<double>(3) + m == m + 2*tmp(identity_matrix<double>(3))));
            DLIB_TEST((2*identity_matrix<double,3>() + m == m + 2*tmp(identity_matrix<double,3>())));
        }


        {
            matrix<double,3,1> d1, d2;

            d1 = 1,2,3;

            d2 = 2,3,4;

            matrix<double,3,3> ans;
            ans = 2, 0, 0,
                  0, 6, 0,
                  0, 0, 12;

            DLIB_TEST(ans == diagm(d1)*diagm(d2));
        }


        dlib::rand rnd;
        for (int i = 0; i < 1; ++i)
        {
            matrix<double> d1 = randm(4,1,rnd);
            matrix<double,5,1> d2 = randm(5,1,rnd);

            matrix<double,4,5> m = randm(4,5,rnd);

            DLIB_TEST_MSG(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*m*diagm(d2)),
                          pointwise_multiply(d1*trans(d2), m) - diagm(d1)*m*diagm(d2)
            );
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*(m*diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , (diagm(d1)*m)*diagm(d2)));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , (inv(diagm(d1))*m)*inv(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*m*(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*(m*(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , (inv(diagm(d1))*m)*(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , ((diagm(d1))*m)*inv(diagm(d2))));
        }
        for (int i = 0; i < 1; ++i)
        {
            matrix<double,4,1> d1 = randm(4,1,rnd);
            matrix<double,5,1> d2 = randm(5,1,rnd);

            matrix<double,4,5> m = randm(4,5,rnd);

            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*m*diagm(d2)));
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*(m*diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , (diagm(d1)*m)*diagm(d2)));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , (inv(diagm(d1))*m)*inv(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*m*(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*(m*(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , (inv(diagm(d1))*m)*(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , ((diagm(d1))*m)*inv(diagm(d2))));
        }
        for (int i = 0; i < 1; ++i)
        {
            matrix<double,4,1> d1 = randm(4,1,rnd);
            matrix<double,5,1> d2 = randm(5,1,rnd);

            matrix<double,0,0> m = randm(4,5,rnd);

            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*m*diagm(d2)));
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , diagm(d1)*(m*diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(d1*trans(d2), m) , (diagm(d1)*m)*diagm(d2)));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , inv(diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans(reciprocal(d2)), m) , (inv(diagm(d1))*m)*inv(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*m*(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , inv(diagm(d1))*(m*(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply(reciprocal(d1)*trans((d2)), m) , (inv(diagm(d1))*m)*(diagm(d2))));

            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*m*inv(diagm(d2))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , (diagm(d1))*(m*inv(diagm(d2)))));
            DLIB_TEST(equal(pointwise_multiply((d1)*trans(reciprocal(d2)), m) , ((diagm(d1))*m)*inv(diagm(d2))));
        }



        {
            for (int i = 0; i < 5; ++i)
            {
                matrix<double> m = randm(3,4) + 1;

                DLIB_TEST(equal(1.0/m , reciprocal(m)));
                DLIB_TEST(equal(0.0/m , zeros_matrix<double>(3,4)));
            }
        }

        {
            matrix<int> m(2,3);
            m = 1,2,3,
                4,5,6;
            matrix<int> M(2,3);
            M = m;

            DLIB_TEST(upperbound(m,6) == M);
            DLIB_TEST(upperbound(m,60) == M);
            DLIB_TEST(lowerbound(m,-2) == M);
            DLIB_TEST(lowerbound(m,0) == M);

            M = 2,2,3,
                4,5,6;
            DLIB_TEST(lowerbound(m,2) == M);

            M = 0,0,0,
                0,0,0;
            DLIB_TEST(upperbound(m,0) == M);

            M = 1,2,3,
                3,3,3;
            DLIB_TEST(upperbound(m,3) == M);
        }
    }



    template <
        long D1,
        long D2, 
        long D3,
        long D4
        >
    void test_conv()
    {
        dlog << LINFO << D1 << " " << D2 << " " << D3 << " " << D4;
        matrix<int,D1,D1> a(1,1);
        matrix<int,D2,D2> b(2,2); 
        matrix<int,D3,D3> c(3,3); 
        matrix<int,D4,D1> d(4,1);

        a = 4;

        b = 1,2,
            3,4;

        c = 1,2,3,
            4,5,6,
            7,8,9;

        d = 1,
            2,
            3,
            4;
        
        matrix<int> temp(4,4), temp2;
        temp =     1,    4,    7,    6,
                    7,   23,   33,   24,
                    19,   53,   63,   42,
                    21,   52,   59,   36;

        DLIB_TEST(conv(b,c) == temp);
        DLIB_TEST(conv(c,b) == temp);
        DLIB_TEST(xcorr(c,flip(b)) == temp);

        temp.set_size(2,2);
        temp =   23,   33,
                53,   63;
        DLIB_TEST(conv_same(b,c) == temp);
        DLIB_TEST(xcorr_same(b,flip(c)) == temp);

        temp2.set_size(2,2);
        temp2 = 63, 53,
                33, 23;
        DLIB_TEST(flip(temp) == temp2);
        DLIB_TEST(flip(temp) == fliplr(flipud(temp)));

        DLIB_TEST(conv_valid(b,c).nr() == 0);
        DLIB_TEST(conv_valid(b,c).nc() == 0);

        DLIB_TEST(conv_valid(c,b) == temp);
        DLIB_TEST(xcorr_valid(c,flip(b)) == temp);

        temp.set_size(1,1);
        temp =  16;

        DLIB_TEST(conv(a,a) == temp);
        DLIB_TEST(conv_same(a,a) == temp);
        DLIB_TEST(conv_valid(a,a) == temp);
        DLIB_TEST(xcorr(a,a) == temp);
        DLIB_TEST(xcorr_same(a,a) == temp);
        DLIB_TEST(xcorr_valid(a,a) == temp);

        temp.set_size(0,0);
        DLIB_TEST(conv(temp,temp).nr() == 0);
        DLIB_TEST(conv(temp,temp).nc() == 0);
        DLIB_TEST(conv_same(temp,temp).nr() == 0);
        DLIB_TEST(conv_same(temp,temp).nc() == 0);
        DLIB_TEST_MSG(conv_valid(temp,temp).nr() == 0, conv_valid(temp,temp).nr());
        DLIB_TEST(conv_valid(temp,temp).nc() == 0);
        DLIB_TEST(conv(c,temp).nr() == 0);
        DLIB_TEST(conv(c,temp).nc() == 0);
        DLIB_TEST(conv_same(c,temp).nr() == 0);
        DLIB_TEST(conv_same(c,temp).nc() == 0);
        DLIB_TEST(conv_valid(c,temp).nr() == 0);
        DLIB_TEST(conv_valid(c,temp).nc() == 0);
        DLIB_TEST(conv(temp,c).nr() == 0);
        DLIB_TEST(conv(temp,c).nc() == 0);
        DLIB_TEST(conv_same(temp,c).nr() == 0);
        DLIB_TEST(conv_same(temp,c).nc() == 0);
        DLIB_TEST(conv_valid(temp,c).nr() == 0);
        DLIB_TEST(conv_valid(temp,c).nc() == 0);

        temp.set_size(5,2);
        temp =     1,    2,
                    5,    8,
                    9,   14,
                    13,   20,
                    12,   16;
        DLIB_TEST(conv(b,d) == temp);
        DLIB_TEST(xcorr(b,flip(d)) == temp);

        temp.set_size(2,2);
        temp =    9,   14,
                13,   20;
        DLIB_TEST(conv_same(b,d) == temp);
        DLIB_TEST(xcorr_same(b,flip(d)) == temp);

        DLIB_TEST(conv_valid(b,d).nr() == 0);
        DLIB_TEST(xcorr_valid(b,flip(d)).nr() == 0);
        DLIB_TEST_MSG(conv_valid(b,d).nc() == 0, conv_valid(b,d).nc());
        DLIB_TEST(xcorr_valid(b,flip(d)).nc() == 0);

        temp.set_size(5,5);
        temp =      1,     4,    10,    12,     9,
                    8,    26,    56,    54,    36,
                    30,    84,   165,   144,    90,
                    56,   134,   236,   186,   108,
                    49,   112,   190,   144,    81;

        DLIB_TEST(conv(c,c) == temp);
        DLIB_TEST(xcorr(c,flip(c)) == temp);
        matrix<int> temp3 = c;
        temp3 = conv(temp3,c);
        DLIB_TEST(temp3 == temp);

        temp3 = c;
        temp3 = conv(c,temp3);
        DLIB_TEST(temp3 == temp);


        temp.set_size(3,3);
        temp =     26,    56,    54,
                    84,   165,   144,
                    134,   236,   186;
        DLIB_TEST(conv_same(c,c) == temp);
        DLIB_TEST(xcorr_same(c,flip(c)) == temp);
        temp3 = c;
        temp3 = conv_same(c,temp3);
        DLIB_TEST(temp3 == temp);
        temp3 = c;
        temp3 = conv_same(temp3,c);
        DLIB_TEST(temp3 == temp);

        temp.set_size(1,1);
        temp = 165;
        DLIB_TEST(conv_valid(c,c) == temp);
        DLIB_TEST(xcorr_valid(c,flip(c)) == temp);
        temp3 = c;
        temp3 = conv_valid(c,temp3);
        DLIB_TEST(temp3 == temp);
        temp3 = c;
        temp3 = conv_valid(temp3,c);
        DLIB_TEST(temp3 == temp);


        for (int i = 0; i < 3; ++i)
        {
            dlib::rand rnd;
            matrix<complex<int> > a, b;
            a = complex_matrix(matrix_cast<int>(round(20*randm(2,7,rnd))), 
                               matrix_cast<int>(round(20*randm(2,7,rnd))));
            b = complex_matrix(matrix_cast<int>(round(20*randm(3,2,rnd))), 
                               matrix_cast<int>(round(20*randm(3,2,rnd))));

            DLIB_TEST(xcorr(a,b)       == conv(a, flip(conj(b))));
            DLIB_TEST(xcorr_valid(a,b) == conv_valid(a, flip(conj(b))));
            DLIB_TEST(xcorr_same(a,b)  == conv_same(a, flip(conj(b))));
        }
    }

    void test_complex()
    {
        matrix<complex<double> > a, b;

        a = complex_matrix(linspace(1,7,7), linspace(2,8,7));
        b = complex_matrix(linspace(4,10,7), linspace(2,8,7));

        DLIB_TEST(mean(a) == complex<double>(4, 5));
    }

    void test_setsubs()
    {
        {
            matrix<double> m(3,3);
            m = 0;

            set_colm(m,0) += 1;
            set_rowm(m,0) += 1;
            set_subm(m,1,1,2,2) += 5;

            matrix<double> m2(3,3);
            m2 = 2, 1, 1,
                 1, 5, 5, 
                 1, 5, 5;

            DLIB_TEST(m == m2);

            set_colm(m,0) -= 1;
            set_rowm(m,0) -= 1;
            set_subm(m,1,1,2,2) -= 5;

            m2 = 0;
            DLIB_TEST(m == m2);

            matrix<double,1,3> r;
            matrix<double,3,1> c;
            matrix<double,2,2> b;
            r = 1,2,3;

            c = 2,
                3,
                4;

            b = 2,3,
                4,5;

            set_colm(m,1) += c;
            set_rowm(m,1) += r;
            set_subm(m,1,1,2,2) += b;

            m2 = 0, 2, 0,
                 1, 7, 6,
                 0, 8, 5;

            DLIB_TEST(m2 == m);

            set_colm(m,1) -= c;
            set_rowm(m,1) -= r;
            set_subm(m,1,1,2,2) -= b;

            m2 = 0;
            DLIB_TEST(m2 == m);


            // check that the code path for destructive aliasing works right.
            m = 2*identity_matrix<double>(3);
            set_colm(m,1) += m*c;
            m2 = 2, 4, 0,
                 0, 8, 0,
                 0, 8, 2;
            DLIB_TEST(m == m2);

            m = 2*identity_matrix<double>(3);
            set_colm(m,1) -= m*c;
            m2 = 2, -4, 0,
                 0, -4, 0,
                 0, -8, 2;
            DLIB_TEST(m == m2);

            m = 2*identity_matrix<double>(3);
            set_rowm(m,1) += r*m;
            m2 = 2, 0, 0,
                 2, 6, 6,
                 0, 0, 2;
            DLIB_TEST(m == m2);

            m = 2*identity_matrix<double>(3);
            set_rowm(m,1) -= r*m;
            m2 = 2, 0, 0,
                -2, -2, -6,
                 0, 0, 2;
            DLIB_TEST(m == m2);

            m = identity_matrix<double>(3);
            const rectangle rect(0,0,1,1);
            set_subm(m,rect) += subm(m,rect)*b;
            m2 = 3, 3, 0,
                 4, 6, 0,
                 0, 0, 1;
            DLIB_TEST(m == m2);

            m = identity_matrix<double>(3);
            set_subm(m,rect) -= subm(m,rect)*b;
            m2 = -1, -3, 0,
                 -4, -4, 0,
                  0, 0, 1;
            DLIB_TEST(m == m2);

        }

        {
            matrix<double,1,1> a, b;
            a = 2;
            b = 3;
            DLIB_TEST(dot(a,b) == 6);
        }
        {
            matrix<double,1,1> a;
            matrix<double,0,1> b(1);
            a = 2;
            b = 3;
            DLIB_TEST(dot(a,b) == 6);
            DLIB_TEST(dot(b,a) == 6);
        }
        {
            matrix<double,1,1> a;
            matrix<double,1,0> b(1);
            a = 2;
            b = 3;
            DLIB_TEST(dot(a,b) == 6);
            DLIB_TEST(dot(b,a) == 6);
        }
    }

    template <typename T>
    std::vector<int> tovect1(const T& m)
    {
        std::vector<int> temp;
        for (typename T::const_iterator i = m.begin(); i != m.end(); ++i)
        {
            temp.push_back(*i);
        }
        return temp;
    }

    template <typename T>
    std::vector<int> tovect2(const T& m)
    {
        std::vector<int> temp;
        for (typename T::const_iterator i = m.begin(); i != m.end(); i++)
        {
            temp.push_back(*i);
        }
        return temp;
    }

    template <typename T>
    std::vector<int> tovect3(const T& m_)
    {
        matrix<int> m(m_);
        std::vector<int> temp;
        for (matrix<int>::iterator i = m.begin(); i != m.end(); ++i)
        {
            temp.push_back(*i);
        }
        return temp;
    }

    template <typename T>
    std::vector<int> tovect4(const T& m_)
    {
        matrix<int> m(m_);
        std::vector<int> temp;
        for (matrix<int>::iterator i = m.begin(); i != m.end(); i++)
        {
            temp.push_back(*i);
        }
        return temp;
    }

    void test_iterators()
    {
        matrix<int> m(3,2);
        m = 1,2,3,
        4,5,6;

        std::vector<int> v1 = tovect1(m);
        std::vector<int> v2 = tovect2(m);
        std::vector<int> v3 = tovect3(m);
        std::vector<int> v4 = tovect4(m);

        std::vector<int> v5 = tovect1(m+m);
        std::vector<int> v6 = tovect2(m+m);
        std::vector<int> v7 = tovect3(m+m);
        std::vector<int> v8 = tovect4(m+m);


        std::vector<int> a1, a2;
        for (int i = 1; i <= 6; ++i)
        {
            a1.push_back(i);
            a2.push_back(i*2);
        }

        DLIB_TEST(max(abs(mat(v1) - mat(a1))) == 0);
        DLIB_TEST(max(abs(mat(v2) - mat(a1))) == 0);
        DLIB_TEST(max(abs(mat(v3) - mat(a1))) == 0);
        DLIB_TEST(max(abs(mat(v4) - mat(a1))) == 0);

        DLIB_TEST(max(abs(mat(v5) - mat(a2))) == 0);
        DLIB_TEST(max(abs(mat(v6) - mat(a2))) == 0);
        DLIB_TEST(max(abs(mat(v7) - mat(a2))) == 0);
        DLIB_TEST(max(abs(mat(v8) - mat(a2))) == 0);
    }

    void test_linpiece()
    {
        matrix<double,0,1> temp = linpiece(5, linspace(-1, 9, 2));
        DLIB_CASSERT(temp.size() == 1,"");
        DLIB_CASSERT(std::abs(temp(0) - 6) < 1e-13,"");

        temp = linpiece(5, linspace(-1, 9, 6));
        DLIB_CASSERT(temp.size() == 5,"");
        DLIB_CASSERT(std::abs(temp(0) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(1) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(2) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(3) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(4) - 0) < 1e-13,"");

        temp = linpiece(4, linspace(-1, 9, 6));
        DLIB_CASSERT(temp.size() == 5,"");
        DLIB_CASSERT(std::abs(temp(0) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(1) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(2) - 1) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(3) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(4) - 0) < 1e-13,"");

        temp = linpiece(40, linspace(-1, 9, 6));
        DLIB_CASSERT(temp.size() == 5,"");
        DLIB_CASSERT(std::abs(temp(0) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(1) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(2) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(3) - 2) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(4) - 2) < 1e-13,"");

        temp = linpiece(-40, linspace(-1, 9, 6));
        DLIB_CASSERT(temp.size() == 5,"");
        DLIB_CASSERT(std::abs(temp(0) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(1) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(2) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(3) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(4) - 0) < 1e-13,"");

        temp = linpiece(0, linspace(-1, 9, 6));
        DLIB_CASSERT(temp.size() == 5,"");
        DLIB_CASSERT(std::abs(temp(0) - 1) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(1) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(2) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(3) - 0) < 1e-13,"");
        DLIB_CASSERT(std::abs(temp(4) - 0) < 1e-13,"");

    }

    class matrix_tester : public tester
    {
    public:
        matrix_tester (
        ) :
            tester ("test_matrix4",
                    "Runs tests on the scale_rows and scale_columns functions.")
        {}

        void perform_test (
        )
        {
            test_iterators();
            test_setsubs();

            test_conv<0,0,0,0>();
            test_conv<1,2,3,4>();

            test_stuff();
            for (int i = 0; i < 10; ++i)
                matrix_test();

            test_complex();
            test_linpiece();
        }
    } a;

}



