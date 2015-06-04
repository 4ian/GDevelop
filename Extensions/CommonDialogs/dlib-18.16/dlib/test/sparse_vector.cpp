// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/sparse_vector.h>
#include "tester.h"
#include <dlib/rand.h>
#include <dlib/string.h>
#include <vector>
#include <sstream>
#include <ctime>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.sparse_vector");

    void test_sparse_matrix_vector_multiplies()
    {
        dlib::rand rnd;

        const long size = 30;

        for (int iter = 0; iter < 10; ++iter)
        {
            print_spinner();

            std::vector<sample_pair> edges;
            std::vector<ordered_sample_pair> oedges;
            matrix<double> M(size,size);
            M = 0;
            for (long i = 0; i < M.size()/3; ++i)
            {
                const long r = rnd.get_random_32bit_number()%M.nr();
                const long c = rnd.get_random_32bit_number()%M.nc();
                const double d = rnd.get_random_gaussian()*10;
                M(r,c) += d;
                oedges.push_back(ordered_sample_pair(r,c,d));
            }

            matrix<double> SM(size,size);
            SM = 0;
            for (long i = 0; i < SM.size()/3; ++i)
            {
                const long r = rnd.get_random_32bit_number()%SM.nr();
                const long c = rnd.get_random_32bit_number()%SM.nc();
                const double d = rnd.get_random_gaussian()*10;
                SM(r,c) += d;
                if (r != c)
                    SM(c,r) += d;
                edges.push_back(sample_pair(r,c,d));
            }

            const matrix<double> v = randm(size,1);

            matrix<double> result;

            sparse_matrix_vector_multiply(oedges, v, result);
            DLIB_TEST_MSG(length(M*v - result) < 1e-12, length(M*v - result));

            sparse_matrix_vector_multiply(edges, v, result);
            DLIB_TEST_MSG(length(SM*v - result) < 1e-12, length(SM*v - result));

        }
    }

// ----------------------------------------------------------------------------------------

    void test_sparse_matrix_vector_multiply1()
    {
        print_spinner();
        std::map<unsigned long,double> sv;
        sv[2] = 8;
        sv[6] = 2.3;

        matrix<double,10,1> v;
        v = 0;
        v(2) = 8;
        v(6) = 2.3;


        matrix<double,0,1> r1, r2;

        r1 = gaussian_randm(4,10)*v;
        r2 = sparse_matrix_vector_multiply(gaussian_randm(4,std::numeric_limits<long>::max()),sv);

        DLIB_TEST(max(abs(r1-r2)) < 1e-15);
    }

// ----------------------------------------------------------------------------------------

    void test_sparse_matrix_vector_multiply2()
    {
        std::vector<std::pair<unsigned long,double> > sv;
        sv.push_back(make_pair(6, 1.42));
        sv.push_back(make_pair(3, 5));

        matrix<double,9,1> v;
        v = 0;
        v(3) = 5;
        v(6) = 1.42;


        matrix<double,0,1> r1, r2;

        r1 = gaussian_randm(3,9)*v;
        r2 = sparse_matrix_vector_multiply(gaussian_randm(3,std::numeric_limits<long>::max()),sv);

        DLIB_TEST(max(abs(r1-r2)) < 1e-15);
    }

// ----------------------------------------------------------------------------------------

    void test_make_sparse_vector_inplace()
    {
        std::vector<std::pair<unsigned long,double> > vect;
        vect.push_back(make_pair(4,1));
        vect.push_back(make_pair(0,1));
        vect.push_back(make_pair(4,1));
        vect.push_back(make_pair(3,1));
        vect.push_back(make_pair(8,1));
        vect.push_back(make_pair(8,1));
        vect.push_back(make_pair(8,1));
        vect.push_back(make_pair(8,1));

        make_sparse_vector_inplace(vect);

        DLIB_TEST(vect.size() == 4);
        DLIB_TEST(vect[0].first == 0);
        DLIB_TEST(vect[1].first == 3);
        DLIB_TEST(vect[2].first == 4);
        DLIB_TEST(vect[3].first == 8);

        DLIB_TEST(vect[0].second == 1);
        DLIB_TEST(vect[1].second == 1);
        DLIB_TEST(vect[2].second == 2);
        DLIB_TEST(vect[3].second == 4);
    }

// ----------------------------------------------------------------------------------------

    class sparse_vector_tester : public tester
    {
    public:
        sparse_vector_tester (
        ) :
            tester (
                "test_sparse_vector",       // the command line argument name for this test
                "Run tests on the sparse_vector routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }


        void perform_test (
        )
        {
            test_make_sparse_vector_inplace();

            std::map<unsigned int, double> v;
            v[4] = 8;
            v[2] = -4;
            v[9] = 10;

            DLIB_TEST(max(v) == 10);
            DLIB_TEST(min(v) == -4);

            v.clear();
            v[4] = 8;
            v[9] = 10;
            DLIB_TEST(max(v) == 10);
            DLIB_TEST(min(v) == 0);


            v.clear();
            v[4] = -9;
            v[9] = -4;
            DLIB_TEST(max(v) == 0);
            DLIB_TEST(min(v) == -9);


            {
                matrix<double> a(2,2), b(2,2);
                a = randm(2,2);
                b = randm(2,2);

                DLIB_TEST(equal(a-b, subtract(a,b)));
                DLIB_TEST(equal(a+b, add(a,b)));
                DLIB_TEST(equal(a-(b+b), subtract(a,b+b)));
                DLIB_TEST(equal(a+b+b, add(a,b+b)));
            }

            {
                std::map<unsigned long,double> a, b, c;
                a[1] = 2;
                a[3] = 5;

                b[0] = 3;
                b[1] = 1;

                c = add(a,b);
                DLIB_TEST(c.size() == 3);
                DLIB_TEST(c[0] == 3);
                DLIB_TEST(c[1] == 3);
                DLIB_TEST(c[3] == 5);

                c = subtract(a,b);
                DLIB_TEST(c.size() == 3);
                DLIB_TEST(c[0] == -3);
                DLIB_TEST(c[1] == 1);
                DLIB_TEST(c[3] == 5);

                c = add(b,a);
                DLIB_TEST(c.size() == 3);
                DLIB_TEST(c[0] == 3);
                DLIB_TEST(c[1] == 3);
                DLIB_TEST(c[3] == 5);

                c = subtract(b,a);
                DLIB_TEST(c.size() == 3);
                DLIB_TEST(c[0] == 3);
                DLIB_TEST(c[1] == -1);
                DLIB_TEST(c[3] == -5);

                std::vector<std::pair<unsigned long,double> > aa, bb, cc;

                aa.assign(a.begin(), a.end());
                bb.assign(b.begin(), b.end());

                cc = add(aa,bb); 
                DLIB_TEST(cc.size() == 3);
                DLIB_TEST(cc[0].first == 0);
                DLIB_TEST(cc[1].first == 1);
                DLIB_TEST(cc[2].first == 3);
                DLIB_TEST(cc[0].second == 3);
                DLIB_TEST(cc[1].second == 3);
                DLIB_TEST(cc[2].second == 5);

                cc = subtract(aa,bb); 
                DLIB_TEST(cc.size() == 3);
                DLIB_TEST(cc[0].first == 0);
                DLIB_TEST(cc[1].first == 1);
                DLIB_TEST(cc[2].first == 3);
                DLIB_TEST(cc[0].second == -3);
                DLIB_TEST(cc[1].second == 1);
                DLIB_TEST(cc[2].second == 5);

                cc = add(bb,aa); 
                DLIB_TEST(cc.size() == 3);
                DLIB_TEST(cc[0].first == 0);
                DLIB_TEST(cc[1].first == 1);
                DLIB_TEST(cc[2].first == 3);
                DLIB_TEST(cc[0].second == 3);
                DLIB_TEST(cc[1].second == 3);
                DLIB_TEST(cc[2].second == 5);

                cc = subtract(bb,aa); 
                DLIB_TEST(cc.size() == 3);
                DLIB_TEST(cc[0].first == 0);
                DLIB_TEST(cc[1].first == 1);
                DLIB_TEST(cc[2].first == 3);
                DLIB_TEST(cc[0].second == 3);
                DLIB_TEST(cc[1].second == -1);
                DLIB_TEST(cc[2].second == -5);

            }

            test_sparse_matrix_vector_multiplies();
            test_sparse_matrix_vector_multiply1();
            test_sparse_matrix_vector_multiply2();

            {
                matrix<double,0,1> a, b;
                a = gaussian_randm(6,1, 0);
                b = gaussian_randm(6,1, 1);

                std::vector<std::pair<unsigned long,double> > aa, bb;

                assign(aa, a);
                assign(bb, b);

                // dot() does something special when the sparse vectors have entries for
                // each dimension, which is what happens when they are copied from dense
                // vectors.  So the point of the tests in this block is to make sure dot()
                // works right in this case.
                DLIB_TEST(std::abs(dot(a,b) - dot(aa,bb)) < 1e-14);
                a(3) = 0;
                assign(aa, a);
                DLIB_TEST(std::abs(dot(a,b) - dot(aa,bb)) < 1e-14);
            }
        }
    };

    sparse_vector_tester a;

}



