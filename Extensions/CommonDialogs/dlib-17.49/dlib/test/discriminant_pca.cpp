// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm.h>
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
    dlib::logger dlog("test.discriminant_pca");

    using dlib::equal;

    class discriminant_pca_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        discriminant_pca_tester (
        ) :
            tester (
                "test_discriminant_pca",       // the command line argument name for this test
                "Run tests on the discriminant_pca object.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
            thetime = time(0);
        }

        time_t thetime;
        dlib::rand rnd;

        template <typename dpca_type>
        void test1()
        {

            dpca_type dpca, dpca2, dpca3;

            DLIB_TEST(dpca.in_vector_size() == 0);
            DLIB_TEST(dpca.between_class_weight() == 1);
            DLIB_TEST(dpca.within_class_weight() == 1);

            // generate a bunch of 4 dimensional vectors and compute the normal PCA transformation matrix
            // and just make sure it is a unitary matrix as it should be.
            for (int i = 0; i < 5000; ++i)
            {
                dpca.add_to_total_variance(randm(4,1,rnd));
                DLIB_TEST(dpca.in_vector_size() == 4);
            }


            matrix<double> mat = dpca.dpca_matrix(1);

            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));

            mat = dpca.dpca_matrix(0.9);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(mat.nr())));

            matrix<double> eig;
            dpca.dpca_matrix(mat, eig, 1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            // check that all eigen values are grater than 0
            DLIB_TEST(min(eig > 0) == 1);
            DLIB_TEST(eig.size() == mat.nr());
            DLIB_TEST(is_col_vector(eig));
            // check that the eigenvalues are sorted
            double last = eig(0);
            for (long i = 1; i < eig.size(); ++i)
            {
                DLIB_TEST(last >= eig(i));
            }

            {
                matrix<double> mat = dpca.dpca_matrix_of_size(4);
                DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            }
            {
                matrix<double> mat = dpca.dpca_matrix_of_size(3);
                DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(3)));
            }


            dpca.set_within_class_weight(5);
            dpca.set_between_class_weight(6);

            DLIB_TEST(dpca.in_vector_size() == 4);
            DLIB_TEST(dpca.within_class_weight() == 5);
            DLIB_TEST(dpca.between_class_weight() == 6);


            ostringstream sout;
            serialize(dpca, sout);
            istringstream sin(sout.str());
            deserialize(dpca2, sin);

            // now make sure the serialization worked
            DLIB_TEST(dpca.in_vector_size() == 4);
            DLIB_TEST(dpca.within_class_weight() == 5);
            DLIB_TEST(dpca.between_class_weight() == 6);
            DLIB_TEST(dpca2.in_vector_size() == 4);
            DLIB_TEST(dpca2.within_class_weight() == 5);
            DLIB_TEST(dpca2.between_class_weight() == 6);
            DLIB_TEST(equal(dpca.dpca_matrix(), dpca2.dpca_matrix(), 1e-10));
            DLIB_TEST(equal(mat, dpca2.dpca_matrix(1), 1e-10));
            DLIB_TEST(equal(dpca.dpca_matrix(1), mat, 1e-10));

            // now test swap
            dpca2.swap(dpca3);
            DLIB_TEST(dpca2.in_vector_size() == 0);
            DLIB_TEST(dpca2.between_class_weight() == 1);
            DLIB_TEST(dpca2.within_class_weight() == 1);

            DLIB_TEST(dpca3.in_vector_size() == 4);
            DLIB_TEST(dpca3.within_class_weight() == 5);
            DLIB_TEST(dpca3.between_class_weight() == 6);
            DLIB_TEST(equal(mat, dpca3.dpca_matrix(1), 1e-10));
            DLIB_TEST((dpca3 + dpca3).in_vector_size() == 4);
            DLIB_TEST((dpca3 + dpca3).within_class_weight() == 5);
            DLIB_TEST((dpca3 + dpca3).between_class_weight() == 6);

            dpca.clear();

            DLIB_TEST(dpca.in_vector_size() == 0);
            DLIB_TEST(dpca.between_class_weight() == 1);
            DLIB_TEST(dpca.within_class_weight() == 1);
        }

        template <typename dpca_type>
        void test2()
        {
            dpca_type dpca, dpca2, dpca3;

            typename dpca_type::column_matrix samp1(4), samp2(4);

            for (int i = 0; i < 5000; ++i)
            {
                dpca.add_to_total_variance(randm(4,1,rnd));
                DLIB_TEST(dpca.in_vector_size() == 4);

                // do this to subtract out the variance along the 3rd axis 
                samp1 = 0,0,0,0;
                samp2 = 0,0,1,0;
                dpca.add_to_within_class_variance(samp1, samp2);
            }

            matrix<double> mat;

            dpca.set_within_class_weight(0);
            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 4);
            dpca.set_within_class_weight(1000);
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 3);

            // the 3rd column of the transformation matrix should be all zero since
            // we killed all the variation long the 3rd axis
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),2))) < 1e-5);

            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(3)));


        }

        template <typename dpca_type>
        void test3()
        {
            dpca_type dpca, dpca2, dpca3;

            typename dpca_type::column_matrix samp1(4), samp2(4);

            for (int i = 0; i < 5000; ++i)
            {
                dpca.add_to_total_variance(randm(4,1,rnd));
                DLIB_TEST(dpca.in_vector_size() == 4);

                // do this to subtract out the variance along the 3rd axis 
                samp1 = 0,0,0,0;
                samp2 = 0,0,1,0;
                dpca.add_to_within_class_variance(samp1, samp2);

                // do this to subtract out the variance along the 1st axis 
                samp1 = 0,0,0,0;
                samp2 = 1,0,0,0;
                dpca.add_to_within_class_variance(samp1, samp2);
            }

            matrix<double> mat;

            dpca.set_within_class_weight(0);
            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 4);
            dpca.set_within_class_weight(10000);
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 2);

            // the 1st and 3rd columns of the transformation matrix should be all zero since
            // we killed all the variation long the 1st and 3rd axes
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),2))) < 1e-5);
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),0))) < 1e-5);

            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(2)));


        }

        template <typename dpca_type>
        void test4()
        {
            dpca_type dpca, dpca2, dpca3;

            dpca_type add_dpca1, add_dpca2, add_dpca3, add_dpca4, sum_dpca;

            typename dpca_type::column_matrix samp1(4), samp2(4), samp;

            for (int i = 0; i < 5000; ++i)
            {
                samp = randm(4,1,rnd);
                dpca.add_to_total_variance(samp);
                add_dpca4.add_to_total_variance(samp);
                DLIB_TEST(dpca.in_vector_size() == 4);

                // do this to subtract out the variance along the 3rd axis 
                samp1 = 0,0,0,0;
                samp2 = 0,0,1,0;
                dpca.add_to_within_class_variance(samp1, samp2);
                add_dpca1.add_to_within_class_variance(samp1, samp2);

                // do this to subtract out the variance along the 1st axis 
                samp1 = 0,0,0,0;
                samp2 = 1,0,0,0;
                dpca.add_to_within_class_variance(samp1, samp2);
                add_dpca2.add_to_within_class_variance(samp1, samp2);

                // do this to add the variance along the 3rd axis back in
                samp1 = 0,0,0,0;
                samp2 = 0,0,1,0;
                dpca.add_to_between_class_variance(samp1, samp2);
                add_dpca3.add_to_between_class_variance(samp1, samp2);
            }

            matrix<double> mat, mat2;

            sum_dpca = dpca_type() + dpca_type() + add_dpca1 + dpca_type() + add_dpca2 + add_dpca3 + add_dpca4;
            dpca.set_within_class_weight(0);
            dpca.set_between_class_weight(0);
            sum_dpca.set_within_class_weight(0);
            sum_dpca.set_between_class_weight(0);
            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat, sum_dpca.dpca_matrix(1), 1e-10));
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 4);
            dpca.set_within_class_weight(10000);
            sum_dpca.set_within_class_weight(10000);
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 2);

            // the 1st and 3rd columns of the transformation matrix should be all zero since
            // we killed all the variation long the 1st and 3rd axes
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),2))) < 1e-4);
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),0))) < 1e-4);

            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(2)));
            DLIB_TEST_MSG(equal(mat, mat2=sum_dpca.dpca_matrix(1), 1e-9), max(abs(mat - mat2)));


            // now add the variance back in using the between class weight
            dpca.set_within_class_weight(0);
            dpca.set_between_class_weight(1);
            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(4)));
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 4);
            dpca.set_within_class_weight (10000);
            dpca.set_between_class_weight(100000);
            sum_dpca.set_within_class_weight (10000);
            sum_dpca.set_between_class_weight(100000);
            DLIB_TEST(dpca.dpca_matrix(1).nr() == 3);

            // the first column should be all zeros
            DLIB_TEST(sum(abs(colm(dpca.dpca_matrix(1),0))) < 1e-5);

            mat = dpca.dpca_matrix(1);
            DLIB_TEST(equal(mat*trans(mat), identity_matrix<double>(3)));
            DLIB_TEST(equal(mat, sum_dpca.dpca_matrix(1)));


        }

        template <typename dpca_type>
        void test5()
        {
            dpca_type dpca, dpca2;
            typename dpca_type::column_matrix samp1(4), samp2(4);

            samp1 = 0,0,0,0;
            samp2 = 0,0,1,0;

            for (int i = 0; i < 5000; ++i)
            {
                dpca.add_to_between_class_variance(samp1, samp2);
                dpca2.add_to_total_variance(samp1);
                dpca2.add_to_total_variance(samp2);
            }

            matrix<double> mat, eig;
            dpca.dpca_matrix(mat, eig, 1);

            // make sure the eigenvalues come out the way they should for this simple data set
            DLIB_TEST(eig.size() == 1);
            DLIB_TEST_MSG(abs(eig(0) - 1) < 1e-10, abs(eig(0) - 1));

            dpca2.dpca_matrix(mat, eig, 1);

            // make sure the eigenvalues come out the way they should for this simple data set
            DLIB_TEST(eig.size() == 1);
            DLIB_TEST(abs(eig(0) - 0.25) < 1e-10);

        }

        void perform_test (
        )
        {
            ++thetime;
            typedef matrix<double,0,1> sample_type;
            typedef discriminant_pca<sample_type> dpca_type;

            dlog << LINFO << "time seed: " << thetime;
            rnd.set_seed(cast_to_string(thetime));

            test5<dpca_type>();

            for (int i = 0; i < 10; ++i)
            {
                print_spinner();
                test1<dpca_type>();
                print_spinner();
                test2<dpca_type>();
                print_spinner();
                test3<dpca_type>();
                print_spinner();
                test4<dpca_type>();
            }
        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    discriminant_pca_tester a;

}


