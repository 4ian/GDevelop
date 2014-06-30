// Copyright (C) 2006  Davis E. King (davis@dlib.net)
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

    logger dlog("test.matrix");

    void matrix_test (
    )
    /*!
        ensures
            - runs tests on the matrix stuff compliance with the specs
    !*/
    {        
        typedef memory_manager_stateless<char>::kernel_2_2a MM;
        print_spinner();


        {
            matrix<complex<double>,2,2,MM> m;
            set_all_elements(m,complex<double>(1,2));
            DLIB_TEST((conj(m) == uniform_matrix<complex<double>,2,2>(conj(m(0,0)))));
            DLIB_TEST((real(m) == uniform_matrix<double,2,2>(1)));
            DLIB_TEST((imag(m) == uniform_matrix<double,2,2>(2)));
            DLIB_TEST_MSG((sum(abs(norm(m) - uniform_matrix<double,2,2>(5))) < 1e-10 ),norm(m));

        }

        {
            matrix<double,5,5,MM,column_major_layout> m(5,5);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,5>())));
            DLIB_TEST((equal(round_zeros(m*mi,0.000001) , identity_matrix<double,5>())));
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix(m))));
            DLIB_TEST((equal(round_zeros(m*mi,0.000001) , identity_matrix(m))));
        }
        {
            matrix<double,5,0,MM> m(5,5);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,5>())));
        }

        {
            matrix<double,0,5,MM> m(5,5);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,5>())));
        }


        {
            matrix<double> m(5,5);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,5>())));
        }

        {
            matrix<double,5,2,MM,column_major_layout> m;

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,2>())));
        }

        {
            matrix<double> m(5,2);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = pinv(m ); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,2>())));
        }

        {
            matrix<double,5,2,MM,column_major_layout> m;

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = trans(pinv(trans(m) )); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,2>())));
        }

        {
            matrix<double> m(5,2);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c; 
                }
            }

            m = cos(exp(m));


            matrix<double> mi = trans(pinv(trans(m) )); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*m,0.000001) , identity_matrix<double,2>())));
        }

        {
            matrix<long> a1(5,1);
            matrix<long,0,0,MM,column_major_layout> a2(1,5);
            matrix<long,5,1> b1(5,1);
            matrix<long,1,5> b2(1,5);
            matrix<long,0,1> c1(5,1);
            matrix<long,1,0> c2(1,5);
            matrix<long,0,1,MM,column_major_layout> d1(5,1);
            matrix<long,1,0,MM> d2(1,5);

            for (long i = 0; i < 5; ++i)
            {
                a1(i) = i;
                a2(i) = i;
                b1(i) = i;
                b2(i) = i;
                c1(i) = i;
                c2(i) = i;
                d1(i) = i;
                d2(i) = i;
            }

            DLIB_TEST(a1 == trans(a2));
            DLIB_TEST(a1 == trans(b2));
            DLIB_TEST(a1 == trans(c2));
            DLIB_TEST(a1 == trans(d2));

            DLIB_TEST(a1 == b1);
            DLIB_TEST(a1 == c1);
            DLIB_TEST(a1 == d1);

            DLIB_TEST(trans(a1) == c2);
            DLIB_TEST(trans(b1) == c2);
            DLIB_TEST(trans(c1) == c2);
            DLIB_TEST(trans(d1) == c2);

            DLIB_TEST(sum(a1) == 10);
            DLIB_TEST(sum(a2) == 10);
            DLIB_TEST(sum(b1) == 10);
            DLIB_TEST(sum(b2) == 10);
            DLIB_TEST(sum(c1) == 10);
            DLIB_TEST(sum(c2) == 10);
            DLIB_TEST(sum(d1) == 10);
            DLIB_TEST(sum(d2) == 10);

            const matrix<long> orig1 = a1;
            const matrix<long> orig2 = a2;

            ostringstream sout;
            serialize(a1,sout);
            serialize(a2,sout);
            serialize(b1,sout);
            serialize(b2,sout);
            serialize(c1,sout);
            serialize(c2,sout);
            serialize(d1,sout);
            serialize(d2,sout);

            DLIB_TEST(a1 == orig1);
            DLIB_TEST(a2 == orig2);
            DLIB_TEST(b1 == orig1);
            DLIB_TEST(b2 == orig2);
            DLIB_TEST(c1 == orig1);
            DLIB_TEST(c2 == orig2);
            DLIB_TEST(d1 == orig1);
            DLIB_TEST(d2 == orig2);

            set_all_elements(a1,99);
            set_all_elements(a2,99);
            set_all_elements(b1,99);
            set_all_elements(b2,99);
            set_all_elements(c1,99);
            set_all_elements(c2,99);
            set_all_elements(d1,99);
            set_all_elements(d2,99);

            DLIB_TEST(a1 != orig1);
            DLIB_TEST(a2 != orig2);
            DLIB_TEST(b1 != orig1);
            DLIB_TEST(b2 != orig2);
            DLIB_TEST(c1 != orig1);
            DLIB_TEST(c2 != orig2);
            DLIB_TEST(d1 != orig1);
            DLIB_TEST(d2 != orig2);

            istringstream sin(sout.str());

            deserialize(a1,sin);
            deserialize(a2,sin);
            deserialize(b1,sin);
            deserialize(b2,sin);
            deserialize(c1,sin);
            deserialize(c2,sin);
            deserialize(d1,sin);
            deserialize(d2,sin);

            DLIB_TEST(a1 == orig1);
            DLIB_TEST(a2 == orig2);
            DLIB_TEST(b1 == orig1);
            DLIB_TEST(b2 == orig2);
            DLIB_TEST(c1 == orig1);
            DLIB_TEST(c2 == orig2);
            DLIB_TEST(d1 == orig1);
            DLIB_TEST(d2 == orig2);


        }

        {
            matrix<double,1,0> a(5);
            matrix<double,0,1> b(5);
            matrix<double,1,5> c(5);
            matrix<double,5,1> d(5);
            DLIB_TEST(a.nr() == 1);
            DLIB_TEST(a.nc() == 5);
            DLIB_TEST(c.nr() == 1);
            DLIB_TEST(c.nc() == 5);

            DLIB_TEST(b.nc() == 1);
            DLIB_TEST(b.nr() == 5);
            DLIB_TEST(d.nc() == 1);
            DLIB_TEST(d.nr() == 5);
        }

        {
            matrix<double,1,0> a;
            matrix<double,0,1> b;
            matrix<double,1,5> c;
            matrix<double,5,1> d;

            a.set_size(5);
            b.set_size(5);
            c.set_size(5);
            d.set_size(5);

            DLIB_TEST(a.nr() == 1);
            DLIB_TEST(a.nc() == 5);
            DLIB_TEST(c.nr() == 1);
            DLIB_TEST(c.nc() == 5);

            DLIB_TEST(b.nc() == 1);
            DLIB_TEST(b.nr() == 5);
            DLIB_TEST(d.nc() == 1);
            DLIB_TEST(d.nr() == 5);
        }

        {
            matrix<double> a(1,5);
            matrix<double> b(5,1);

            set_all_elements(a,1);
            set_all_elements(b,1);


            a = a*b;

            DLIB_TEST(a(0) == 5);
        }

        {
            matrix<double,0,0,MM,column_major_layout> a(6,7);

            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = r*a.nc() + c;
                }
            }



            DLIB_TEST(rowm(a,1).nr() == 1);
            DLIB_TEST(rowm(a,1).nc() == a.nc());
            DLIB_TEST(colm(a,1).nr() == a.nr());
            DLIB_TEST(colm(a,1).nc() == 1);

            for (long c = 0; c < a.nc(); ++c)
            {
                DLIB_TEST( rowm(a,1)(c) == 1*a.nc() + c);
            }

            for (long r = 0; r < a.nr(); ++r)
            {
                DLIB_TEST( colm(a,1)(r) == r*a.nc() + 1);
            }

            rectangle rect(2, 1, 3+2-1, 2+1-1);
            DLIB_TEST(get_rect(a).contains(get_rect(a)));
            DLIB_TEST(get_rect(a).contains(rect));
            for (long r = 0; r < 2; ++r)
            {
                for (long c = 0; c < 3; ++c)
                {
                    DLIB_TEST(subm(a,1,2,2,3)(r,c) == (r+1)*a.nc() + c+2);
                    DLIB_TEST(subm(a,1,2,2,3) == subm(a,rect));
                }
            }

            DLIB_TEST(subm(a,rectangle()).nr() == 0);
            DLIB_TEST(subm(a,rectangle()).nc() == 0);

        }

        {
            array2d<double> a;
            a.set_size(6,7);


            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a[r][c] = r*a.nc() + c;
                }
            }



            DLIB_TEST(rowm(array_to_matrix(a),1).nr() == 1);
            DLIB_TEST(rowm(array_to_matrix(a),1).nc() == a.nc());
            DLIB_TEST(colm(array_to_matrix(a),1).nr() == a.nr());
            DLIB_TEST(colm(array_to_matrix(a),1).nc() == 1);

            for (long c = 0; c < a.nc(); ++c)
            {
                DLIB_TEST( rowm(array_to_matrix(a),1)(c) == 1*a.nc() + c);
            }

            for (long r = 0; r < a.nr(); ++r)
            {
                DLIB_TEST( colm(array_to_matrix(a),1)(r) == r*a.nc() + 1);
            }

            for (long r = 0; r < 2; ++r)
            {
                for (long c = 0; c < 3; ++c)
                {
                    DLIB_TEST(subm(array_to_matrix(a),1,2,2,3)(r,c) == (r+1)*a.nc() + c+2);
                }
            }


        }

        {
            array2d<double> m;
            m.set_size(5,5);

            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m[r][c] = r*c; 
                }
            }


            matrix<double> mi = pinv(cos(exp(array_to_matrix(m))) ); 
            DLIB_TEST(mi.nr() == m.nc());
            DLIB_TEST(mi.nc() == m.nr());
            DLIB_TEST((equal(round_zeros(mi*cos(exp(array_to_matrix(m))),0.000001) , identity_matrix<double,5>())));
            DLIB_TEST((equal(round_zeros(cos(exp(array_to_matrix(m)))*mi,0.000001) , identity_matrix<double,5>())));
        }

        {
            matrix<long,5,5,MM,column_major_layout> m1, res;
            matrix<long,2,2> m2;

            set_all_elements(m1,0);


            long res_vals[] = {
                9, 9, 9, 9, 9,
                0, 1, 1, 0, 0,
                0, 1, 1, 0, 2,
                0, 0, 2, 2, 2,
                0, 0, 2, 2, 0
            };

            res = res_vals;

            set_all_elements(m2, 1);
            set_subm(m1, range(1,2), range(1,2)) = subm(m2,0,0,2,2);
            set_all_elements(m2, 2);
            set_subm(m1, 3,2,2,2) = m2;

            set_colm(m1,4) = trans(rowm(m1,4));
            set_rowm(m1,0) = 9;

            DLIB_TEST_MSG(m1 == res, "m1: \n" << m1 << "\nres: \n" << res);

            set_subm(m1,0,0,5,5) = m1*m1;
            DLIB_TEST_MSG(m1 == res*res, "m1: \n" << m1 << "\nres*res: \n" << res*res);

            m1 = res;
            set_subm(m1,1,1,2,2) = subm(m1,0,0,2,2);

            long res_vals2[] = {
                9, 9, 9, 9, 9,
                0, 9, 9, 0, 0,
                0, 0, 1, 0, 2,
                0, 0, 2, 2, 2,
                0, 0, 2, 2, 0
            };

            res = res_vals2;
            DLIB_TEST_MSG(m1 == res, "m1: \n" << m1 << "\nres: \n" << res);


        }

        {
            matrix<long,5,5> m1, res;
            matrix<long,2,2> m2;

            set_all_elements(m1,0);


            long res_vals[] = {
                9, 9, 9, 9, 9,
                0, 1, 1, 0, 0,
                0, 1, 1, 0, 2,
                0, 0, 2, 2, 2,
                0, 0, 2, 2, 0
            };

            res = res_vals;

            set_all_elements(m2, 1);
            set_subm(m1, rectangle(1,1,2,2)) = subm(m2,0,0,2,2);
            set_all_elements(m2, 2);
            set_subm(m1, 3,2,2,2) = m2;

            set_colm(m1,4) = trans(rowm(m1,4));
            set_rowm(m1,0) = 9;

            DLIB_TEST_MSG(m1 == res, "m1: \n" << m1 << "\nres: \n" << res);

            set_subm(m1,0,0,5,5) = m1*m1;
            DLIB_TEST_MSG(m1 == res*res, "m1: \n" << m1 << "\nres*res: \n" << res*res);

            m1 = res;
            set_subm(m1,1,1,2,2) = subm(m1,0,0,2,2);

            long res_vals2[] = {
                9, 9, 9, 9, 9,
                0, 9, 9, 0, 0,
                0, 0, 1, 0, 2,
                0, 0, 2, 2, 2,
                0, 0, 2, 2, 0
            };

            res = res_vals2;
            DLIB_TEST_MSG(m1 == res, "m1: \n" << m1 << "\nres: \n" << res);


        }

        {
            matrix<long,5,5> m1, res;
            matrix<long,2,2> m2;

            set_all_elements(m1,0);


            long res_vals[] = {
                9, 0, 3, 3, 0,
                9, 2, 2, 2, 0,
                9, 2, 2, 2, 0,
                4, 4, 4, 4, 4,
                9, 0, 3, 3, 0
            };
            long res_vals_c3[] = {
                9, 0, 3, 0,
                9, 2, 2, 0,
                9, 2, 2, 0,
                4, 4, 4, 4,
                9, 0, 3, 0
            };
            long res_vals_r2[] = {
                9, 0, 3, 3, 0,
                9, 2, 2, 2, 0,
                4, 4, 4, 4, 4,
                9, 0, 3, 3, 0
            };

            matrix<long> temp;

            res = res_vals;

            temp = matrix<long,4,5>(res_vals_r2);
            DLIB_TEST(remove_row<2>(res) == temp);
            DLIB_TEST(remove_row<2>(res)(3,3) == 3);
            DLIB_TEST(remove_row<2>(res).nr() == 4);
            DLIB_TEST(remove_row<2>(res).nc() == 5);
            DLIB_TEST(remove_row(res,2) == temp);
            DLIB_TEST(remove_row(res,2)(3,3) == 3);
            DLIB_TEST(remove_row(res,2).nr() == 4);
            DLIB_TEST(remove_row(res,2).nc() == 5);

            temp = matrix<long,5,5>(res_vals);
            temp = remove_row(res,2);
            DLIB_TEST((temp == matrix<long,4,5>(res_vals_r2)));
            temp = matrix<long,5,5>(res_vals);
            temp = remove_col(res,3);
            DLIB_TEST((temp == matrix<long,5,4>(res_vals_c3)));

            matrix<long,3,1> vect;
            set_all_elements(vect,1);
            temp = identity_matrix<long>(3);
            temp = temp*vect;
            DLIB_TEST(temp == vect);

            temp = matrix<long,5,4>(res_vals_c3);
            DLIB_TEST(remove_col(res,3) == temp);
            DLIB_TEST(remove_col(res,3)(2,3) == 0);
            DLIB_TEST(remove_col(res,3).nr() == 5);
            DLIB_TEST(remove_col(res,3).nc() == 4);

            set_all_elements(m2, 1);
            set_subm(m1, rectangle(1,1,3,2)) = 2;
            set_all_elements(m2, 2);
            set_subm(m1, 3,2,2,2) = 3;

            set_colm(m1,0) = 9;
            set_rowm(m1,0) = rowm(m1,4);
            set_rowm(m1,3) = 4;

            DLIB_TEST_MSG(m1 == res, "m1: \n" << m1 << "\nres: \n" << res);

        }


        {

            const double stuff[] = { 
                1, 2, 3,
                6, 3, 3, 
                7, 3, 9};

            matrix<double,3,3> m(stuff);

            // make m be symmetric
            m = m*trans(m);

            matrix<double> L = chol(m);
            DLIB_TEST(equal(L*trans(L), m));

            DLIB_TEST_MSG(equal(inv(m), inv_upper_triangular(trans(L))*inv_lower_triangular((L))), "") 
            DLIB_TEST(equal(round_zeros(inv_upper_triangular(trans(L))*trans(L),1e-10), identity_matrix<double>(3), 1e-10)); 
            DLIB_TEST(equal(round_zeros(inv_lower_triangular((L))*(L),1e-10) ,identity_matrix<double>(3),1e-10)); 

        }

        {

            const double stuff[] = { 
                1, 2, 3, 6, 3, 4,
                6, 3, 3, 1, 2, 3,
                7, 3, 9, 54.3, 5, 3,
                -6, 3, -3, 1, 2, 3,
                1, 2, 3, 5, -3, 3,
                7, 3, -9, 54.3, 5, 3
                };

            matrix<double,6,6> m(stuff);

            // make m be symmetric
            m = m*trans(m);

            matrix<double> L = chol(m);
            DLIB_TEST_MSG(equal(L*trans(L), m, 1e-10), L*trans(L)-m);

            DLIB_TEST_MSG(equal(inv(m), inv_upper_triangular(trans(L))*inv_lower_triangular((L))), "") 
            DLIB_TEST_MSG(equal(inv(m), trans(inv_lower_triangular(L))*inv_lower_triangular((L))), "") 
            DLIB_TEST_MSG(equal(inv(m), trans(inv_lower_triangular(L))*trans(inv_upper_triangular(trans(L)))), "") 
            DLIB_TEST_MSG(equal(round_zeros(inv_upper_triangular(trans(L))*trans(L),1e-10) , identity_matrix<double>(6), 1e-10),
                         round_zeros(inv_upper_triangular(trans(L))*trans(L),1e-10)); 
            DLIB_TEST_MSG(equal(round_zeros(inv_lower_triangular((L))*(L),1e-10) ,identity_matrix<double>(6), 1e-10),
                         round_zeros(inv_lower_triangular((L))*(L),1e-10)); 

        }

        {
            matrix<int> m(3,4), m2;
            m = 1,2,3,4,
                4,5,6,6,
                6,1,8,0;
            m2 = m;
            DLIB_TEST(round(m) == m2);
            DLIB_TEST(round_zeros(m) == m2);

            m2 = 0,2,3,4,
                 4,5,6,6,
                 6,0,8,0;

            DLIB_TEST(round_zeros(m,2) == m2);
        }


        {

            matrix<double,6,6> m(identity_matrix<double>(6)*4.5);

            matrix<double> L = chol(m);
            DLIB_TEST_MSG(equal(L*trans(L), m, 1e-10), L*trans(L)-m);

            DLIB_TEST_MSG(equal(inv(m), inv_upper_triangular(trans(L))*inv_lower_triangular((L))), "") 
            DLIB_TEST_MSG(equal(round_zeros(inv_upper_triangular(trans(L))*trans(L),1e-10) , identity_matrix<double>(6), 1e-10),
                         round_zeros(inv_upper_triangular(trans(L))*trans(L),1e-10)); 
            DLIB_TEST_MSG(equal(round_zeros(inv_lower_triangular((L))*(L),1e-10) ,identity_matrix<double>(6), 1e-10),
                         round_zeros(inv_lower_triangular((L))*(L),1e-10)); 

        }

        {

            matrix<double,6,6> m(identity_matrix<double>(6)*4.5);
            m(1,4) = 2;

            DLIB_TEST_MSG(dlib::equal(inv_upper_triangular(m), inv(m),1e-10), inv_upper_triangular(m)-inv(m));
            DLIB_TEST_MSG(dlib::equal(inv_lower_triangular(trans(m)), inv(trans(m)),1e-10), inv_lower_triangular(trans(m))-inv(trans(m)));

        }

        {
            matrix<double> a;
            matrix<float> b;
            matrix<int> i;
            a.set_size(1000,10);
            b.set_size(1000,10);
            i.set_size(1000,10);
            dlib::rand rnd;
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = rnd.get_random_double();
                    b(r,c) = rnd.get_random_float();
                    i(r,c) = r+c*r;
                }
            }

            // make sure the multiply optimizations aren't messing things up
            DLIB_TEST(trans(i)*i == tmp(trans(i)*i));
            DLIB_TEST_MSG(equal(trans(a)*a , tmp(trans(a)*a), 1e-11),max(abs(trans(a)*a - tmp(trans(a)*a))));
            DLIB_TEST_MSG(equal(trans(b)*b , tmp(trans(b)*b), 1e-3f),max(abs(trans(b)*b - tmp(trans(b)*b))));
        }

        {
            matrix<int,4> i(4,1);
            i(0) = 1;
            i(1) = 2;
            i(2) = 3;
            i(3) = 4;
            matrix<int,4,4> m;
            set_all_elements(m,0);
            m(0,0) = 1;
            m(1,1) = 2;
            m(2,2) = 3;
            m(3,3) = 4;

            DLIB_TEST(diagm(i) == m);
        }

        {
            matrix<int,1,4> i;
            i(0) = 1;
            i(1) = 2;
            i(2) = 3;
            i(3) = 4;
            matrix<int,4,4> m;
            set_all_elements(m,0);
            m(0,0) = 1;
            m(1,1) = 2;
            m(2,2) = 3;
            m(3,3) = 4;

            DLIB_TEST(diagm(i) == m);
        }

        {
            matrix<int> i(4,1);
            i(0) = 1;
            i(1) = 2;
            i(2) = 3;
            i(3) = 4;
            matrix<int> m(4,4);
            set_all_elements(m,0);
            m(0,0) = 1;
            m(1,1) = 2;
            m(2,2) = 3;
            m(3,3) = 4;

            DLIB_TEST(diagm(i) == m);
        }

        {
            matrix<int> i(1,4);
            i(0) = 1;
            i(1) = 2;
            i(2) = 3;
            i(3) = 4;
            matrix<int> m(4,4);
            set_all_elements(m,0);
            m(0,0) = 1;
            m(1,1) = 2;
            m(2,2) = 3;
            m(3,3) = 4;

            DLIB_TEST(diagm(i) == m);
        }

        {
            DLIB_TEST(range(0,5).nc() == 6);
            DLIB_TEST(range(1,5).nc() == 5);
            DLIB_TEST(range(0,5).nr() == 1);
            DLIB_TEST(range(1,5).nr() == 1);
            DLIB_TEST(trans(range(0,5)).nr() == 6);
            DLIB_TEST(trans(range(1,5)).nr() == 5);
            DLIB_TEST(trans(range(0,5)).nc() == 1);
            DLIB_TEST(trans(range(1,5)).nc() == 1);

            DLIB_TEST(range(0,2,5).nc() == 3);
            DLIB_TEST(range(1,2,5).nc() == 3);
            DLIB_TEST(range(0,2,5).nr() == 1);
            DLIB_TEST(range(1,2,5).nr() == 1);
            DLIB_TEST(trans(range(0,2,5)).nr() == 3);
            DLIB_TEST(trans(range(1,2,5)).nr() == 3);
            DLIB_TEST(trans(range(0,2,5)).nc() == 1);
            DLIB_TEST(trans(range(1,2,5)).nc() == 1);

            DLIB_TEST(range(0,3,6).nc() == 3);
            DLIB_TEST(range(1,3,5).nc() == 2);
            DLIB_TEST(range(0,3,5).nr() == 1);
            DLIB_TEST(range(1,3,5).nr() == 1);
            DLIB_TEST(trans(range(0,3,6)).nr() == 3);
            DLIB_TEST(trans(range(1,3,5)).nr() == 2);
            DLIB_TEST(trans(range(0,3,5)).nc() == 1);
            DLIB_TEST(trans(range(1,3,5)).nc() == 1);

            DLIB_TEST(range(1,9,5).nc() == 1);
            DLIB_TEST(range(1,9,5).nr() == 1);

            DLIB_TEST(range(0,0).nc() == 1);
            DLIB_TEST(range(0,0).nr() == 1);

            DLIB_TEST(range(1,1)(0) == 1);

            DLIB_TEST(range(0,5)(0) == 0 && range(0,5)(1) == 1 && range(0,5)(5) == 5);
            DLIB_TEST(range(1,2,5)(0) == 1 && range(1,2,5)(1) == 3 && range(1,2,5)(2) == 5);
            DLIB_TEST((range<0,5>()(0) == 0 && range<0,5>()(1) == 1 && range<0,5>()(5) == 5));
            DLIB_TEST((range<1,2,5>()(0) == 1 && range<1,2,5>()(1) == 3 && range<1,2,5>()(2) == 5));


            DLIB_TEST((range<0,5>().nc() == 6));
            DLIB_TEST((range<1,5>().nc() == 5));
            DLIB_TEST((range<0,5>().nr() == 1));
            DLIB_TEST((range<1,5>().nr() == 1));
            DLIB_TEST((trans(range<0,5>()).nr() == 6));
            DLIB_TEST((trans(range<1,5>()).nr() == 5));
            DLIB_TEST((trans(range<0,5>()).nc() == 1));
            DLIB_TEST((trans(range<1,5>()).nc() == 1));

            DLIB_TEST((range<0,2,5>().nc() == 3));
            DLIB_TEST((range<1,2,5>().nc() == 3));
            DLIB_TEST((range<0,2,5>().nr() == 1));
            DLIB_TEST((range<1,2,5>().nr() == 1));
            DLIB_TEST((trans(range<0,2,5>()).nr() == 3));
            DLIB_TEST((trans(range<1,2,5>()).nr() == 3));
            DLIB_TEST((trans(range<0,2,5>()).nc() == 1));
            DLIB_TEST((trans(range<1,2,5>()).nc() == 1));

            DLIB_TEST((range<0,3,6>().nc() == 3));
            DLIB_TEST((range<1,3,5>().nc() == 2));
            DLIB_TEST((range<0,3,5>().nr() == 1));
            DLIB_TEST((range<1,3,5>().nr() == 1));
            DLIB_TEST((trans(range<0,3,6>()).nr() == 3));
            DLIB_TEST((trans(range<1,3,5>()).nr() == 2));
            DLIB_TEST((trans(range<0,3,5>()).nc() == 1));
            DLIB_TEST((trans(range<1,3,5>()).nc() == 1));
        }

        {
            DLIB_TEST(range(5,0).nc() == 6);
            DLIB_TEST(range(5,1).nc() == 5);
            DLIB_TEST(range(5,0).nr() == 1);
            DLIB_TEST(range(5,1).nr() == 1);
            DLIB_TEST(trans(range(5,0)).nr() == 6);
            DLIB_TEST(trans(range(5,1)).nr() == 5);
            DLIB_TEST(trans(range(5,0)).nc() == 1);
            DLIB_TEST(trans(range(5,1)).nc() == 1);

            DLIB_TEST(range(5,2,0).nc() == 3);
            DLIB_TEST(range(5,2,1).nc() == 3);
            DLIB_TEST(range(5,2,0).nr() == 1);
            DLIB_TEST(range(5,2,1).nr() == 1);
            DLIB_TEST(trans(range(5,2,0)).nr() == 3);
            DLIB_TEST(trans(range(5,2,1)).nr() == 3);
            DLIB_TEST(trans(range(5,2,0)).nc() == 1);
            DLIB_TEST(trans(range(5,2,1)).nc() == 1);

            DLIB_TEST(range(6,3,0).nc() == 3);
            DLIB_TEST(range(5,3,1).nc() == 2);
            DLIB_TEST(range(5,3,0).nr() == 1);
            DLIB_TEST(range(5,3,1).nr() == 1);
            DLIB_TEST(trans(range(6,3,0)).nr() == 3);
            DLIB_TEST(trans(range(5,3,1)).nr() == 2);
            DLIB_TEST(trans(range(5,3,0)).nc() == 1);
            DLIB_TEST(trans(range(5,3,1)).nc() == 1);

            DLIB_TEST(range(5,9,1).nc() == 1);
            DLIB_TEST(range(5,9,1).nr() == 1);

            DLIB_TEST(range(0,0).nc() == 1);
            DLIB_TEST(range(0,0).nr() == 1);

            DLIB_TEST(range(1,1)(0) == 1);

            DLIB_TEST(range(5,0)(0) == 5 && range(5,0)(1) == 4 && range(5,0)(5) == 0);
            DLIB_TEST(range(5,2,1)(0) == 5 && range(5,2,1)(1) == 3 && range(5,2,1)(2) == 1);
            DLIB_TEST((range<5,0>()(0) == 5 && range<5,0>()(1) == 4 && range<5,0>()(5) == 0));
            DLIB_TEST((range<5,2,1>()(0) == 5 && range<5,2,1>()(1) == 3 && range<5,2,1>()(2) == 1));


            DLIB_TEST((range<5,0>().nc() == 6));
            DLIB_TEST((range<5,1>().nc() == 5));
            DLIB_TEST((range<5,0>().nr() == 1));
            DLIB_TEST((range<5,1>().nr() == 1));
            DLIB_TEST((trans(range<5,0>()).nr() == 6));
            DLIB_TEST((trans(range<5,1>()).nr() == 5));
            DLIB_TEST((trans(range<5,0>()).nc() == 1));
            DLIB_TEST((trans(range<5,1>()).nc() == 1));

            DLIB_TEST((range<5,2,0>().nc() == 3));
            DLIB_TEST((range<5,2,1>().nc() == 3));
            DLIB_TEST((range<5,2,0>().nr() == 1));
            DLIB_TEST((range<5,2,1>().nr() == 1));
            DLIB_TEST((trans(range<5,2,0>()).nr() == 3));
            DLIB_TEST((trans(range<5,2,1>()).nr() == 3));
            DLIB_TEST((trans(range<5,2,0>()).nc() == 1));
            DLIB_TEST((trans(range<5,2,1>()).nc() == 1));

            DLIB_TEST((range<6,3,0>().nc() == 3));
            DLIB_TEST((range<5,3,1>().nc() == 2));
            DLIB_TEST((range<5,3,0>().nr() == 1));
            DLIB_TEST((range<5,3,1>().nr() == 1));
            DLIB_TEST((trans(range<6,3,0>()).nr() == 3));
            DLIB_TEST((trans(range<5,3,1>()).nr() == 2));
            DLIB_TEST((trans(range<5,3,0>()).nc() == 1));
            DLIB_TEST((trans(range<5,3,1>()).nc() == 1));
        }

        {
            matrix<double> m(4,3);
            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c;
                }
            }

            DLIB_TEST(subm(m,range(0,3),range(0,0)) == colm(m,0));
            DLIB_TEST(subm(m,range(0,3),range(1,1)) == colm(m,1));
            DLIB_TEST(subm(m,range(0,3),range(2,2)) == colm(m,2));

            DLIB_TEST(subm(m,range(0,0),range(0,2)) == rowm(m,0));
            DLIB_TEST(subm(m,range(1,1),range(0,2)) == rowm(m,1));
            DLIB_TEST(subm(m,range(2,2),range(0,2)) == rowm(m,2));
            DLIB_TEST(subm(m,range(3,3),range(0,2)) == rowm(m,3));

            DLIB_TEST(subm(m,0,0,2,2) == subm(m,range(0,1),range(0,1)));
            DLIB_TEST(subm(m,1,1,2,2) == subm(m,range(1,2),range(1,2)));

            matrix<double,2,2> m2 = subm(m,range(0,2,2),range(0,2,2));

            DLIB_TEST(m2(0,0) == m(0,0));
            DLIB_TEST(m2(0,1) == m(0,2));
            DLIB_TEST(m2(1,0) == m(2,0));
            DLIB_TEST(m2(1,1) == m(2,2));


        }
        {
            matrix<double,4,3> m(4,3);
            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = r*c;
                }
            }

            DLIB_TEST(subm(m,range<0,3>(),range<0,0>()) == colm(m,0));
            DLIB_TEST(subm(m,range<0,3>(),range<1,1>()) == colm(m,1));
            DLIB_TEST(subm(m,range<0,3>(),range<2,2>()) == colm(m,2));

            DLIB_TEST(subm(m,range<0,0>(),range<0,2>()) == rowm(m,0));
            DLIB_TEST(subm(m,range<1,1>(),range<0,2>()) == rowm(m,1));
            DLIB_TEST(subm(m,range<2,2>(),range<0,2>()) == rowm(m,2));
            DLIB_TEST(subm(m,range<3,3>(),range<0,2>()) == rowm(m,3));

            DLIB_TEST(subm(m,0,0,2,2) == subm(m,range<0,1>(),range<0,1>()));
            DLIB_TEST(subm(m,1,1,2,2) == subm(m,range<1,2>(),range<1,2>()));

            matrix<double,2,2> m2 = subm(m,range<0,2,2>(),range<0,2,2>());

            DLIB_TEST(m2(0,0) == m(0,0));
            DLIB_TEST(m2(0,1) == m(0,2));
            DLIB_TEST(m2(1,0) == m(2,0));
            DLIB_TEST(m2(1,1) == m(2,2));


        }

        {
            matrix<double,4,5> m;
            set_subm(m, range(0,3), range(0,4)) = 4;
            DLIB_TEST(min(m) == max(m) && min(m) == 4);

            set_subm(m,range(1,1),range(0,4)) = 7;
            DLIB_TEST((rowm(m,0) == uniform_matrix<double>(1,5, 4)));
            DLIB_TEST((rowm(m,1) == uniform_matrix<double>(1,5, 7)));
            DLIB_TEST((rowm(m,2) == uniform_matrix<double>(1,5, 4)));
            DLIB_TEST((rowm(m,3) == uniform_matrix<double>(1,5, 4)));


            set_subm(m, range(0,2,3), range(0,2,4)) = trans(subm(m,0,0,3,2));


            DLIB_TEST(m(0,2) == 7);
            DLIB_TEST(m(2,2) == 7);

            DLIB_TEST(sum(m) == 7*5+ 7+7 +  4*(4*5 - 7));

        }

        {
            matrix<double> mat(4,5);
            DLIB_TEST((uniform_matrix<double>(4,5,1) == ones_matrix<double>(4,5)));
            DLIB_TEST((uniform_matrix<double>(4,5,1) == ones_matrix(mat)));
            DLIB_TEST((uniform_matrix<double>(4,5,0) == zeros_matrix<double>(4,5)));
            DLIB_TEST((uniform_matrix<double>(4,5,0) == zeros_matrix(mat)));
            DLIB_TEST((uniform_matrix<float>(4,5,1) == ones_matrix<float>(4,5)));
            DLIB_TEST((uniform_matrix<float>(4,5,0) == zeros_matrix<float>(4,5)));
            DLIB_TEST((uniform_matrix<complex<double> >(4,5,1) == ones_matrix<complex<double> >(4,5)));
            DLIB_TEST((uniform_matrix<complex<double> >(4,5,0) == zeros_matrix<complex<double> >(4,5)));
            DLIB_TEST((uniform_matrix<complex<float> >(4,5,1) == ones_matrix<complex<float> >(4,5)));
            DLIB_TEST((uniform_matrix<complex<float> >(4,5,0) == zeros_matrix<complex<float> >(4,5)));
            DLIB_TEST((complex_matrix(ones_matrix<double>(3,3), zeros_matrix<double>(3,3)) == complex_matrix(ones_matrix<double>(3,3))));
            DLIB_TEST((pointwise_multiply(complex_matrix(ones_matrix<double>(3,3)), ones_matrix<double>(3,3)*2) ==
                       complex_matrix(2*ones_matrix<double>(3,3))));
        }

        {
            DLIB_TEST(( uniform_matrix<double>(303,303, 3)*identity_matrix<double>(303) == uniform_matrix<double,303,303>(3) ) );
            DLIB_TEST(( uniform_matrix<double,303,303>(3)*identity_matrix<double,303>() == uniform_matrix<double,303,303>(3) ));
        }

        {
            matrix<double> m(2,3);
            m = 1,2,3,
                5,6,7;

            DLIB_TEST_MSG(m(0,0) == 1 && m(0,1) == 2 && m(0,2) == 3 &&
                         m(1,0) == 5 && m(1,1) == 6 && m(1,2) == 7,"");

            m = 4;
            DLIB_TEST((m == uniform_matrix<double,2,3>(4)));

            matrix<double,2,3> m2;
            m2 = 1,2,3,
                 5,6,7;
            DLIB_TEST_MSG(m2(0,0) == 1 && m2(0,1) == 2 && m2(0,2) == 3 &&
                         m2(1,0) == 5 && m2(1,1) == 6 && m2(1,2) == 7,"");

            matrix<double,2,1> m3;
            m3 = 1,
                 5;
            DLIB_TEST(m3(0) == 1 && m3(1) == 5 );

            matrix<double,1,2> m4;
            m4 = 1, 5;
            DLIB_TEST(m3(0) == 1 && m3(1) == 5 );
        }

        {
            matrix<double> m(4,1);
            m = 3, 1, 5, 2;
            DLIB_TEST(index_of_min(m) == 1);
            DLIB_TEST(index_of_max(m) == 2);
            DLIB_TEST(index_of_min(trans(m)) == 1);
            DLIB_TEST(index_of_max(trans(m)) == 2);
        }

        {
            matrix<double> m1(1,5), m2;

            m1 = 3.0000,  3.7500,  4.5000,  5.2500,  6.0000; 
            m2 = linspace(3, 6, 5);

            DLIB_TEST(equal(m1, m2));
            
            m1 = pow(10, m1);
            m2 = logspace(3, 6, 5);

            DLIB_TEST(equal(m1, m2));
        }

        {
            matrix<long> m = cartesian_product(range(1,3), range(0,1));

            matrix<long,2,1> c0, c1, c2, c3, c4, c5;
            c0 = 1, 0;
            c1 = 1, 1;
            c2 = 2, 0;
            c3 = 2, 1;
            c4 = 3, 0;
            c5 = 3, 1;

            DLIB_TEST_MSG(colm(m,0) == c0, colm(m,0) << "\n\n" << c0);
            DLIB_TEST(colm(m,1) == c1);
            DLIB_TEST(colm(m,2) == c2);
            DLIB_TEST(colm(m,3) == c3);
            DLIB_TEST(colm(m,4) == c4);
            DLIB_TEST(colm(m,5) == c5);
        }


        {
            matrix<double> m(2,2), mr(2,2), mr_max(2,2);

            m = 1, 2,
                0, 4;

            mr = 1, 1.0/2.0,
                0,  1.0/4.0;

            mr_max = 1, 1.0/2.0,
                     std::numeric_limits<double>::max(),  1.0/4.0;

            DLIB_TEST(equal(reciprocal(m), mr));
            DLIB_TEST(equal(reciprocal_max(m), mr_max));

        }

        {
            matrix<double> m1, m2;
            m1.set_size(3,1);
            m2.set_size(1,3);

            m1 = 1,2,3;
            m2 = 4,5,6;
            DLIB_TEST(dot(m1, m2)               == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(m1, trans(m2))        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), m2)        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), trans(m2)) == 1*4 + 2*5 + 3*6);
        }

        {
            matrix<double,3,1> m1, m2;
            m1.set_size(3,1);
            m2.set_size(3,1);

            m1 = 1,2,3;
            m2 = 4,5,6;
            DLIB_TEST(dot(m1, m2)               == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(m1, trans(m2))        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), m2)        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), trans(m2)) == 1*4 + 2*5 + 3*6);
        }
        {
            matrix<double,1,3> m1, m2;
            m1.set_size(1,3);
            m2.set_size(1,3);

            m1 = 1,2,3;
            m2 = 4,5,6;
            DLIB_TEST(dot(m1, m2)               == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(m1, trans(m2))        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), m2)        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), trans(m2)) == 1*4 + 2*5 + 3*6);
        }
        {
            matrix<double,1,3> m1;
            matrix<double> m2;
            m1.set_size(1,3);
            m2.set_size(3,1);

            m1 = 1,2,3;
            m2 = 4,5,6;
            DLIB_TEST(dot(m1, m2)               == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(m1, trans(m2))        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), m2)        == 1*4 + 2*5 + 3*6);
            DLIB_TEST(dot(trans(m1), trans(m2)) == 1*4 + 2*5 + 3*6);
        }

        {
            matrix<double> m1(3,3), m2(3,3);

            m1 = 1;
            m2 = 1;
            m1 = m1*subm(m2,0,0,3,3);
        }
        {
            matrix<double,3,1> m1;
            matrix<double> m2(3,3);

            m1 = 1;
            m2 = 1;
            m1 = subm(m2,0,0,3,3)*m1;
        }

        {
            matrix<int> m(2,1);

            m = 3,3;
            m /= m(0);

            DLIB_TEST(m(0) == 1);
            DLIB_TEST(m(1) == 1);
        }
        {
            matrix<int> m(2,1);

            m = 3,3;
            m *= m(0);

            DLIB_TEST(m(0) == 9);
            DLIB_TEST(m(1) == 9);
        }
        {
            matrix<int> m(2,1);

            m = 3,3;
            m -= m(0);

            DLIB_TEST(m(0) == 0);
            DLIB_TEST(m(1) == 0);
        }
        {
            matrix<int> m(2,1);

            m = 3,3;
            m += m(0);

            DLIB_TEST(m(0) == 6);
            DLIB_TEST(m(1) == 6);
        }
    }






    class matrix_tester : public tester
    {
    public:
        matrix_tester (
        ) :
            tester ("test_matrix",
                    "Runs tests on the matrix component.")
        {}

        void perform_test (
        )
        {
            matrix_test();
        }
    } a;

}


