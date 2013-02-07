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
    dlib::logger dlog("test.ekm_and_lisf");


    class empirical_kernel_map_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        empirical_kernel_map_tester (
        ) :
            tester (
                "test_ekm_and_lisf",       // the command line argument name for this test
                "Run tests on the empirical_kernel_map and linearly_independent_subset_finder objects.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
            thetime = time(0);
        }

        time_t thetime;
        dlib::rand rnd;

        template <typename T>
        void validate (
            const T& ekm_small,
            const T& ekm_big
        )
        {
            matrix<double> tmat;
            projection_function<typename T::kernel_type> proj;

            ekm_small.get_transformation_to(ekm_big, tmat, proj);
            DLIB_TEST(tmat.nr() == ekm_big.out_vector_size());
            DLIB_TEST(tmat.nc() == ekm_small.out_vector_size());
            DLIB_TEST((unsigned long)proj.basis_vectors.size() == ekm_big.basis_size() - ekm_small.basis_size());
            for (unsigned long i = 0; i < 6; ++i)
            {
                const typename T::sample_type temp = randm(4,1,rnd);
                DLIB_TEST(length(ekm_big.project(temp) - (tmat*ekm_small.project(temp) + proj(temp))) < 1e-10);
            }
        }


        void test_transformation_stuff()
        {
            typedef matrix<double,0,1> sample_type;
            typedef radial_basis_kernel<sample_type> kernel_type;
            const kernel_type kern(1);


            for (unsigned long n = 1; n < 6; ++n)
            {
                print_spinner();
                for (unsigned long extra = 1; extra < 10; ++extra)
                {
                    std::vector<sample_type> samps_small, samps_big;
                    linearly_independent_subset_finder<kernel_type> lisf_small(kern, 1000);
                    linearly_independent_subset_finder<kernel_type> lisf_big(kern, 1000);
                    for (unsigned long i = 0; i < n; ++i)
                    {
                        samps_small.push_back(randm(4,1,rnd));
                        samps_big.push_back(samps_small.back());
                        lisf_big.add(samps_small.back());
                        lisf_small.add(samps_small.back());
                    }
                    for (unsigned long i = 0; i < extra; ++i)
                    {
                        samps_big.push_back(randm(4,1,rnd));
                        lisf_big.add(samps_big.back());
                    }


                    // test no lisf
                    {
                        empirical_kernel_map<kernel_type> ekm_small, ekm_big;
                        ekm_small.load(kern, samps_small);
                        ekm_big.load(kern, samps_big);

                        validate(ekm_small, ekm_big);
                    }

                    // test with lisf
                    {
                        empirical_kernel_map<kernel_type> ekm_small, ekm_big;
                        ekm_small.load(lisf_small);
                        ekm_big.load(lisf_big);

                        validate(ekm_small, ekm_big);
                    }

                    // test with partly lisf
                    {
                        empirical_kernel_map<kernel_type> ekm_small, ekm_big;
                        ekm_small.load(kern, samps_small);
                        ekm_big.load(lisf_big);

                        validate(ekm_small, ekm_big);
                    }

                    // test with partly lisf
                    {
                        empirical_kernel_map<kernel_type> ekm_small, ekm_big;
                        ekm_small.load(lisf_small);
                        ekm_big.load(kern, samps_big);

                        validate(ekm_small, ekm_big);
                    }

                }
            }


            // test what happens if the bigger ekm only has repeated basis vectors
            {
                empirical_kernel_map<kernel_type> ekm_big, ekm_small;
                std::vector<sample_type> samps_big, samps_small;

                sample_type temp = randm(4,1,rnd);

                samps_small.push_back(temp);
                samps_big.push_back(temp);
                samps_big.push_back(temp);

                ekm_big.load(kern, samps_big);
                ekm_small.load(kern, samps_small);

                validate(ekm_small, ekm_big);

            }
            {
                empirical_kernel_map<kernel_type> ekm_big, ekm_small;
                linearly_independent_subset_finder<kernel_type> lisf_small(kern, 1000);
                std::vector<sample_type> samps_big;

                sample_type temp = randm(4,1,rnd);

                lisf_small.add(temp);
                samps_big.push_back(temp);
                samps_big.push_back(temp);

                ekm_big.load(kern, samps_big);
                ekm_small.load(lisf_small);

                validate(ekm_small, ekm_big);

            }
            {
                empirical_kernel_map<kernel_type> ekm_big, ekm_small;
                std::vector<sample_type> samps_big, samps_small;

                sample_type temp = randm(4,1,rnd);
                sample_type temp2 = randm(4,1,rnd);

                samps_small.push_back(temp);
                samps_small.push_back(temp2);
                samps_big.push_back(temp);
                samps_big.push_back(temp2);
                samps_big.push_back(randm(4,1,rnd));

                ekm_big.load(kern, samps_big);
                ekm_small.load(kern, samps_small);

                validate(ekm_small, ekm_big);

            }
            {
                empirical_kernel_map<kernel_type> ekm_big, ekm_small;
                linearly_independent_subset_finder<kernel_type> lisf_small(kern, 1000);
                std::vector<sample_type> samps_big;

                sample_type temp = randm(4,1,rnd);
                sample_type temp2 = randm(4,1,rnd);

                lisf_small.add(temp);
                lisf_small.add(temp2);
                samps_big.push_back(temp);
                samps_big.push_back(temp2);
                samps_big.push_back(temp);

                ekm_big.load(kern, samps_big);
                ekm_small.load(lisf_small);

                validate(ekm_small, ekm_big);

            }


        }



        void perform_test (
        )
        {
            ++thetime;
            typedef matrix<double,0,1> sample_type;
            //dlog << LINFO << "time seed: " << thetime;
            //rnd.set_seed(cast_to_string(thetime));


            typedef radial_basis_kernel<sample_type> kernel_type;


            for (int n = 1; n < 10; ++n)
            {
                print_spinner();
                dlog << LINFO << "matrix size " << n;

                std::vector<sample_type> samples;
                // make some samples
                for (int i = 0; i < n; ++i)
                {
                    samples.push_back(randm(4,1,rnd));
                    // double up the samples just to mess with the lisf
                    if (n > 5)
                        samples.push_back(samples.back());
                }

                dlog << LINFO << "samples.size(): "<< samples.size();

                const kernel_type kern(1);

                linearly_independent_subset_finder<kernel_type> lisf(kern, 100, 1e-4);
                unsigned long count = 0;
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    if (lisf.add(samples[i]))
                    {
                        DLIB_TEST(equal(lisf[lisf.size()-1], samples[i]));
                        ++count;
                    }
                }
                DLIB_TEST(count == lisf.size());

                DLIB_TEST(lisf.size() == (unsigned int)n);


                dlog << LINFO << "lisf.size(): "<< lisf.size();

                // make sure the kernel matrices coming out of the lisf are correct
                DLIB_TEST(dlib::equal(lisf.get_kernel_matrix(), kernel_matrix(kern, lisf), 1e-8));
                DLIB_TEST(dlib::equal(lisf.get_inv_kernel_marix(), inv(kernel_matrix(kern, lisf.get_dictionary())), 1e-8));

                empirical_kernel_map<kernel_type> ekm;
                ekm.load(lisf);
                DLIB_TEST(ekm.basis_size() == lisf.size());

                std::vector<sample_type> proj_samples;
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    double err;
                    proj_samples.push_back(ekm.project(samples[i], err));
                    DLIB_TEST(err <= 1e-4);
                    const double error_agreement = std::abs(err - lisf.projection_error(samples[i]));
                    dlog << LTRACE << "err: " << err << "    error_agreement: "<< error_agreement;
                    DLIB_TEST(error_agreement < 1e-11);
                }

                for (int i = 0; i < 5; ++i)
                {
                    sample_type temp = randm(4,1,rnd);
                    double err;
                    ekm.project(temp, err);
                    const double error_agreement = std::abs(err - lisf.projection_error(temp));
                    dlog << LTRACE << "err: " << err << "    error_agreement: "<< error_agreement;
                    DLIB_TEST(error_agreement < 1e-11);
                }

                // make sure the EKM did the projection correctly
                DLIB_TEST(dlib::equal(kernel_matrix(kern, samples), kernel_matrix(linear_kernel<sample_type>(), proj_samples), 1e-5));
            }


            test_transformation_stuff();

        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    empirical_kernel_map_tester a;

}


