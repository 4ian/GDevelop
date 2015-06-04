// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm.h>
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.kernel_matrix");


    class kernel_matrix_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        kernel_matrix_tester (
        ) :
            tester (
                "test_kernel_matrix",       // the command line argument name for this test
                "Run tests on the kernel_matrix functions.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }


        void perform_test (
        )
        {
            print_spinner();

            typedef matrix<double,0,1> sample_type;
            typedef radial_basis_kernel<sample_type> kernel_type;
            kernel_type kern(0.1);

            std::vector<sample_type> vect1;
            std::vector<sample_type> vect2;

            const sample_type samp = randm(4,1);
            sample_type samp2, samp3;

            vect1.push_back(randm(4,1));
            vect1.push_back(randm(4,1));
            vect1.push_back(randm(4,1));
            vect1.push_back(randm(4,1));

            vect2.push_back(randm(4,1));
            vect2.push_back(randm(4,1));
            vect2.push_back(randm(4,1));
            vect2.push_back(randm(4,1));
            vect2.push_back(randm(4,1));

            matrix<double> K;

            K.set_size(vect1.size(), vect2.size());
            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kern(vect1[r], vect2[c]);
                }
            }
            DLIB_TEST(equal(K, kernel_matrix(kern, vect1, vect2)));
            DLIB_TEST(equal(K, kernel_matrix(kern, mat(vect1), mat(vect2))));


            K.set_size(vect2.size(), vect1.size());
            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kern(vect2[r], vect1[c]);
                }
            }
            DLIB_TEST(equal(K, kernel_matrix(kern, vect2, vect1)));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, vect2, vect1))));
            DLIB_TEST(equal(K, kernel_matrix(kern, mat(vect2), mat(vect1))));


            K.set_size(vect1.size(), vect1.size());
            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kern(vect1[r], vect1[c]);
                }
            }
            DLIB_TEST(equal(K, kernel_matrix(kern, vect1, vect1)));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, vect1, vect1))));
            DLIB_TEST(equal(K, kernel_matrix(kern, vect1)));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, vect1))));
            DLIB_TEST(equal(K, kernel_matrix(kern, mat(vect1), mat(vect1))));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, mat(vect1), mat(vect1)))));
            DLIB_TEST(equal(K, kernel_matrix(kern, mat(vect1))));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, mat(vect1)))));


            K.set_size(vect1.size(),1);
            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kern(vect1[r], samp);
                }
            }
            DLIB_TEST(equal(K, kernel_matrix(kern, vect1, samp)));
            DLIB_TEST(equal(K, kernel_matrix(kern, mat(vect1), samp)));


            K.set_size(1, vect1.size());
            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kern(samp, vect1[c]);
                }
            }
            DLIB_TEST(equal(K, kernel_matrix(kern, samp, vect1)));
            DLIB_TEST(equal(K, kernel_matrix(kern, samp, mat(vect1))));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, samp, vect1))));
            DLIB_TEST(equal(K, tmp(kernel_matrix(kern, samp, mat(vect1)))));



            samp2 = samp;
            samp3 = samp;

            // test the alias detection
            samp2 = kernel_matrix(kern, vect1, samp2);
            DLIB_TEST(equal(samp2, kernel_matrix(kern, vect1, samp)));

            samp3 = trans(kernel_matrix(kern, samp3, vect2));
            DLIB_TEST(equal(samp3, trans(kernel_matrix(kern, samp, vect2))));


            samp2 += kernel_matrix(kern, vect1, samp);
            DLIB_TEST(equal(samp2, 2*kernel_matrix(kern, vect1, samp)));

            samp3 += trans(kernel_matrix(kern, samp, vect2));
            DLIB_TEST(equal(samp3, 2*trans(kernel_matrix(kern, samp, vect2))));
        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    kernel_matrix_tester a;

}


