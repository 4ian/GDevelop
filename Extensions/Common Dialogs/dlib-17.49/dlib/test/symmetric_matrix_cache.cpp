// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/matrix.h>
#include <dlib/rand.h>
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.symmetric_matrix_cache");


    class test_symmetric_matrix_cache : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        test_symmetric_matrix_cache (
        ) :
            tester (
                "test_symmetric_matrix_cache",       // the command line argument name for this test
                "Run tests on the symmetric_matrix_cache function.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        dlib::rand rnd;

    // -----------------------------------

        template <typename EXP1, typename EXP2>
        void test_colm_exp (
            const matrix_exp<EXP1>& m1,
            const matrix_exp<EXP2>& m2
        )
        {
            for (long i = 0; i < m1.nc(); ++i)
            {

                typename colm_exp<EXP1>::type c1 = colm(m1,i);
                typename colm_exp<EXP2>::type c2 = colm(m2,i);

                DLIB_TEST(equal(c1 , c2));
                DLIB_TEST(equal(colm(m1,i) , c2));
                DLIB_TEST(equal(c1 , colm(m2,i)));
                DLIB_TEST(equal(colm(m1,i) , colm(m2,i)));
            }


            // Get a bunch of columns at once to test out the reference
            // counting and automatic cache expansion built into the symmetric_matrix_cache.  
            // This test verifies that, for example, getting column 3 doesn't stomp on
            // any of the previous columns.
            typename colm_exp<EXP1>::type c1_0 = colm(m1,0);
            typename colm_exp<EXP1>::type c1_1 = colm(m1,1);
            typename colm_exp<EXP1>::type c1_2 = colm(m1,2);
            typename colm_exp<EXP1>::type c1_3 = colm(m1,3);
            typename colm_exp<EXP1>::type c1_4 = colm(m1,4);
            typename colm_exp<EXP1>::type c1_5 = colm(m1,5);

            typename colm_exp<EXP2>::type c2_0 = colm(m2,0);
            typename colm_exp<EXP2>::type c2_1 = colm(m2,1);
            typename colm_exp<EXP2>::type c2_2 = colm(m2,2);
            typename colm_exp<EXP2>::type c2_3 = colm(m2,3);
            typename colm_exp<EXP2>::type c2_4 = colm(m2,4);
            typename colm_exp<EXP2>::type c2_5 = colm(m2,5);

            DLIB_TEST(equal(c1_0, c2_0));
            DLIB_TEST(equal(c1_1, c2_1));
            DLIB_TEST(equal(c1_2, c2_2));
            DLIB_TEST(equal(c1_3, c2_3));
            DLIB_TEST(equal(c1_4, c2_4));
            DLIB_TEST(equal(c1_5, c2_5));
        }

    // -----------------------------------

        template <typename EXP1, typename EXP2>
        void test_rowm_exp (
            const matrix_exp<EXP1>& m1,
            const matrix_exp<EXP2>& m2
        )
        {
            for (long i = 0; i < m1.nc(); ++i)
            {

                typename rowm_exp<EXP1>::type r1 = rowm(m1,i);
                typename rowm_exp<EXP2>::type r2 = rowm(m2,i);

                DLIB_TEST(equal(r1 , r2));
                DLIB_TEST(equal(rowm(m1,i) , r2));
                DLIB_TEST(equal(r1 , rowm(m2,i)));
                DLIB_TEST(equal(rowm(m1,i) , rowm(m2,i)));
            }


            // Get a bunch of rows at once to test out the reference
            // counting and automatic cache expansion built into the symmetric_matrix_cache.  
            // This test verifies that, for example, getting row 3 doesn't stomp on
            // any of the previous rows.
            typename rowm_exp<EXP1>::type r1_0 = rowm(m1,0);
            typename rowm_exp<EXP1>::type r1_1 = rowm(m1,1);
            typename rowm_exp<EXP1>::type r1_2 = rowm(m1,2);
            typename rowm_exp<EXP1>::type r1_3 = rowm(m1,3);
            typename rowm_exp<EXP1>::type r1_4 = rowm(m1,4);
            typename rowm_exp<EXP1>::type r1_5 = rowm(m1,5);

            typename rowm_exp<EXP2>::type r2_0 = rowm(m2,0);
            typename rowm_exp<EXP2>::type r2_1 = rowm(m2,1);
            typename rowm_exp<EXP2>::type r2_2 = rowm(m2,2);
            typename rowm_exp<EXP2>::type r2_3 = rowm(m2,3);
            typename rowm_exp<EXP2>::type r2_4 = rowm(m2,4);
            typename rowm_exp<EXP2>::type r2_5 = rowm(m2,5);

            DLIB_TEST(equal(r1_0, r2_0));
            DLIB_TEST(equal(r1_1, r2_1));
            DLIB_TEST(equal(r1_2, r2_2));
            DLIB_TEST(equal(r1_3, r2_3));
            DLIB_TEST(equal(r1_4, r2_4));
            DLIB_TEST(equal(r1_5, r2_5));
        }

    // -----------------------------------

        template <typename EXP1, typename EXP2>
        void test_diag_exp (
            const matrix_exp<EXP1>& m1,
            const matrix_exp<EXP2>& m2
        )
        {

            typename diag_exp<EXP1>::type c1 = diag(m1);
            typename diag_exp<EXP2>::type c2 = diag(m2);

            DLIB_TEST(equal(c1 , c2));
            DLIB_TEST(equal(diag(m1) , c2));
            DLIB_TEST(equal(c1 , diag(m2)));
            DLIB_TEST(equal(diag(m1) , diag(m2)));
        }

    // -----------------------------------

        void test_stuff (
            long csize 
        )
        {
            print_spinner();
            dlog << LINFO << "csize: "<< csize;
            matrix<double> m = randm(10,10,rnd);

            m = make_symmetric(m);

            DLIB_TEST(equal(symmetric_matrix_cache<float>(m, csize), matrix_cast<float>(m)));
            DLIB_TEST(equal(symmetric_matrix_cache<double>(m, csize), matrix_cast<double>(m)));

            dlog << LINFO << "test colm/rowm";


            for (long i = 0; i < m.nr(); ++i)
            {
                DLIB_TEST(equal(colm(symmetric_matrix_cache<float>(m, csize),i), colm(matrix_cast<float>(m),i)));
                DLIB_TEST(equal(rowm(symmetric_matrix_cache<float>(m, csize),i), rowm(matrix_cast<float>(m),i)));
                // things are supposed to be symmetric
                DLIB_TEST(equal(colm(symmetric_matrix_cache<float>(m, csize),i), trans(rowm(matrix_cast<float>(m),i))));
                DLIB_TEST(equal(rowm(symmetric_matrix_cache<float>(m, csize),i), trans(colm(matrix_cast<float>(m),i))));
            }

            dlog << LINFO << "test diag";
            DLIB_TEST(equal(diag(symmetric_matrix_cache<float>(m,csize)), diag(matrix_cast<float>(m))));

            test_colm_exp(symmetric_matrix_cache<float>(m,csize), matrix_cast<float>(m));
            test_rowm_exp(symmetric_matrix_cache<float>(m,csize), matrix_cast<float>(m));
            test_diag_exp(symmetric_matrix_cache<float>(m,csize), matrix_cast<float>(m));

            test_colm_exp(tmp(symmetric_matrix_cache<float>(m,csize)), tmp(matrix_cast<float>(m)));
            test_rowm_exp(symmetric_matrix_cache<float>(m,csize), tmp(matrix_cast<float>(m)));
            test_diag_exp(tmp(symmetric_matrix_cache<float>(m,csize)), tmp(matrix_cast<float>(m)));
        }


        void perform_test (
        )
        {

            for (int itr = 0; itr < 5; ++itr)
            {
                test_stuff(0);
                test_stuff(1);
                test_stuff(2);
            }

        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    test_symmetric_matrix_cache a;

}


