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

        }
    };

    sparse_vector_tester a;

}



