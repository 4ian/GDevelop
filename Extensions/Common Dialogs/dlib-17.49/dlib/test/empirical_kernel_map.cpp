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
    dlib::logger dlog("test.empirical_kernel_map");


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
                "test_empirical_kernel_map",       // the command line argument name for this test
                "Run tests on the empirical_kernel_map object.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
            // always use the same time so that tests are repeatable
            thetime = 0;//time(0);
        }

        time_t thetime;
        dlib::rand rnd;

        void test_projection_error()
        {
            for (int runs = 0; runs < 10; ++runs)
            {
                print_spinner();
                typedef matrix<double,0,1> sample_type;
                typedef radial_basis_kernel<sample_type> kernel_type;
                const kernel_type kern(0.2);

                empirical_kernel_map<kernel_type> ekm;

                // generate samples
                const int num = rnd.get_random_8bit_number()%50 + 1;
                std::vector<sample_type> samples;
                for (int i = 0; i < num; ++i)
                {
                    samples.push_back(randm(5,1,rnd));
                }


                ekm.load(kern, samples);
                DLIB_TEST(ekm.basis_size() == samples.size());

                double err;

                // the samples in the basis should have zero projection error
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    ekm.project(samples[i], err);
                    DLIB_TEST_MSG(abs(err) < 1e-13, abs(err));

                }
                
                // Do some sanity tests on the conversion to distance functions while we are at it.
                for (int i = 0; i < 30; ++i)
                {
                    // pick two random samples
                    const sample_type samp1 = samples[rnd.get_random_32bit_number()%samples.size()];
                    const sample_type samp2 = samples[rnd.get_random_32bit_number()%samples.size()];

                    const matrix<double,0,1> proj1 = ekm.project(samp1);
                    const matrix<double,0,1> proj2 = ekm.project(samp2);

                    distance_function<kernel_type> df1 = ekm.convert_to_distance_function(proj1);
                    distance_function<kernel_type> df2 = ekm.convert_to_distance_function(proj2);

                    DLIB_TEST(df1.get_kernel() == kern);
                    DLIB_TEST(df2.get_kernel() == kern);

                    // make sure the norms are correct
                    DLIB_TEST(std::abs(df1.get_squared_norm()  - 
                                       trans(df1.get_alpha())*kernel_matrix(df1.get_kernel(),df1.get_basis_vectors())*df1.get_alpha()) < 1e-10);
                    DLIB_TEST(std::abs(df2.get_squared_norm()  - 
                                       trans(df2.get_alpha())*kernel_matrix(df2.get_kernel(),df2.get_basis_vectors())*df2.get_alpha()) < 1e-10);


                    const double true_dist = std::sqrt(kern(samp1,samp1) + kern(samp2,samp2) - 2*kern(samp1,samp2));
                    DLIB_TEST_MSG(abs(df1(df2) - true_dist) < 1e-7, abs(df1(df2) - true_dist));
                    DLIB_TEST_MSG(abs(length(proj1-proj2) - true_dist) < 1e-7, abs(length(proj1-proj2) - true_dist));
                    

                    // test distance function operators
                    const decision_function<kernel_type> dec1 = ekm.convert_to_decision_function(proj1);
                    const decision_function<kernel_type> dec2 = ekm.convert_to_decision_function(proj2);
                    DLIB_TEST(dec1.kernel_function == kern);
                    DLIB_TEST(dec2.kernel_function == kern);

                    distance_function<kernel_type> temp;
                    temp = dec1;
                    DLIB_TEST(std::abs(temp.get_squared_norm() - df1.get_squared_norm()) < 1e-10);
                    temp = dec2;
                    DLIB_TEST(std::abs(temp.get_squared_norm() - df2.get_squared_norm()) < 1e-10);
                    temp = distance_function<kernel_type>(dec1.alpha, dec1.kernel_function, dec1.basis_vectors);
                    DLIB_TEST(std::abs(temp.get_squared_norm() - df1.get_squared_norm()) < 1e-10);

                    df1 = dec1;

                    temp = df1 + df2;
                    decision_function<kernel_type> dec3(temp.get_alpha(), 0, temp.get_kernel(), temp.get_basis_vectors()); 
                    DLIB_TEST(std::abs(temp.get_squared_norm()  - 
                                       trans(temp.get_alpha())*kernel_matrix(temp.get_kernel(),temp.get_basis_vectors())*temp.get_alpha()) < 1e-10);
                    for (unsigned long j = 0; j < samples.size(); ++j)
                    {
                        DLIB_TEST(std::abs(dec3(samples[j]) - (dec1(samples[j]) + dec2(samples[j]))) < 1e-10);
                    }


                    temp = df1 - df2;
                    dec3 = decision_function<kernel_type>(temp.get_alpha(), 0, temp.get_kernel(), temp.get_basis_vectors()); 
                    DLIB_TEST(std::abs(temp.get_squared_norm()  - 
                                       trans(temp.get_alpha())*kernel_matrix(temp.get_kernel(),temp.get_basis_vectors())*temp.get_alpha()) < 1e-10);
                    for (unsigned long j = 0; j < samples.size(); ++j)
                    {
                        DLIB_TEST(std::abs(dec3(samples[j]) - (dec1(samples[j]) - dec2(samples[j]))) < 1e-10);
                    }

                    temp = 3*(df1 - df2)*2;
                    dec3 = decision_function<kernel_type>(temp.get_alpha(), 0, temp.get_kernel(), temp.get_basis_vectors()); 
                    DLIB_TEST(std::abs(temp.get_squared_norm()  - 
                                       trans(temp.get_alpha())*kernel_matrix(temp.get_kernel(),temp.get_basis_vectors())*temp.get_alpha()) < 1e-10);
                    for (unsigned long j = 0; j < samples.size(); ++j)
                    {
                        DLIB_TEST(std::abs(dec3(samples[j]) - 6*(dec1(samples[j]) - dec2(samples[j]))) < 1e-10);
                    }

                    distance_function<kernel_type> df_empty(kern);

                    temp = df_empty + (df1 + df2)/2 + df_empty - df_empty + (df_empty + df_empty) - (df_empty - df_empty);
                    dec3 = decision_function<kernel_type>(temp.get_alpha(), 0, temp.get_kernel(), temp.get_basis_vectors()); 
                    DLIB_TEST(std::abs(temp.get_squared_norm()  - 
                                       trans(temp.get_alpha())*kernel_matrix(temp.get_kernel(),temp.get_basis_vectors())*temp.get_alpha()) < 1e-10);
                    for (unsigned long j = 0; j < samples.size(); ++j)
                    {
                        DLIB_TEST(std::abs(dec3(samples[j]) - 0.5*(dec1(samples[j]) + dec2(samples[j]))) < 1e-10);
                    }
                }
                // Do some sanity tests on the conversion to distance functions while we are at it.  This
                // time multiply one of the projections by 30 and see that it still all works out right.
                for (int i = 0; i < 30; ++i)
                {
                    // pick two random samples
                    const sample_type samp1 = samples[rnd.get_random_32bit_number()%samples.size()];
                    const sample_type samp2 = samples[rnd.get_random_32bit_number()%samples.size()];

                    matrix<double,0,1> proj1 = ekm.project(samp1);
                    matrix<double,0,1> proj2 = 30*ekm.project(samp2);

                    distance_function<kernel_type> df1 = ekm.convert_to_distance_function(proj1);
                    distance_function<kernel_type> df2 = ekm.convert_to_distance_function(proj2);

                    DLIB_TEST_MSG(abs(length(proj1-proj2) - df1(df2)) < 1e-7, abs(length(proj1-proj2) - df1(df2)));
                }


                // now generate points with projection error
                for (double i = 1; i < 10; ++i)
                {
                    sample_type test_point = i*randm(5,1,rnd);
                    ekm.project(test_point, err);
                    // turn into normal distance rather than squared distance
                    err = sqrt(err);
                    dlog << LTRACE << "projection error: " << err;

                    distance_function<kernel_type> df = ekm.convert_to_distance_function(ekm.project(test_point));

                    // the projection error should be the distance between the test_point and the point it gets
                    // projected onto
                    DLIB_TEST_MSG(abs(df(test_point) - err) < 1e-10, abs(df(test_point) - err));
                    // while we are at it make sure the squared norm in the distance function is right
                    double df_error = abs(df.get_squared_norm() - trans(df.get_alpha())*kernel_matrix(kern, samples)*df.get_alpha());
                    DLIB_TEST_MSG( df_error < 1e-10, df_error);
                }



            }
        }

        template <typename kernel_type>
        void test_with_kernel(const kernel_type& kern)
        {
            typedef typename kernel_type::sample_type sample_type;

            empirical_kernel_map<kernel_type> ekm, ekm2, ekm3;

            for (int j = 0; j < 10; ++j)
            {
                sample_type samp;
                std::vector<sample_type> samples;
                std::vector<sample_type> proj_samples;
                print_spinner();
                const int num = rnd.get_random_8bit_number()%200 + 1;
                // make some random samples
                for (int i = 0; i < num; ++i)
                {
                    samples.push_back(randm(4,1,rnd));
                }
                // add on a little bit to make sure there is at least one non-zero sample.  If all the 
                // samples are zero then empirical_kernel_map_error will be thrown and we don't want that.
                samples.front()(0) += 0.001;

                ekm2.load(kern, samples);
                DLIB_TEST(ekm2.basis_size() == samples.size());
                for (unsigned long i = 0; i < samples.size(); ++i)
                    DLIB_TEST(dlib::equal(ekm2[i] , samples[i]));

                // test serialization
                ostringstream sout;
                serialize(ekm2, sout);
                ekm2.clear();
                istringstream sin(sout.str());
                deserialize(ekm3, sin);
                // also test swap
                ekm3.swap(ekm);
                DLIB_TEST(ekm.get_kernel() == kern);
                DLIB_TEST(ekm.out_vector_size() != 0);
                DLIB_TEST(ekm2.out_vector_size() == 0);
                DLIB_TEST(ekm3.out_vector_size() == 0);



                // project all the samples into kernel space
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    proj_samples.push_back(ekm.project(samples[i]));
                }

                DLIB_TEST(max(abs(kernel_matrix(kern, samples) - kernel_matrix(linear_kernel<sample_type>(), proj_samples))) < 1e-12);
                DLIB_TEST(ekm.out_vector_size() == proj_samples[0].size());

                for (int i = 0; i < 30; ++i)
                {
                    const unsigned long idx1 = rnd.get_random_32bit_number()%samples.size();
                    const unsigned long idx2 = rnd.get_random_32bit_number()%samples.size();
                    decision_function<kernel_type> dec_funct = ekm.convert_to_decision_function(proj_samples[idx1]);
                    distance_function<kernel_type> dist_funct = ekm.convert_to_distance_function(proj_samples[idx1]);

                    // make sure the distances match 
                    const double dist_error = abs(length(proj_samples[idx1] - proj_samples[idx2]) - dist_funct(samples[idx2]));
                    DLIB_TEST_MSG( dist_error < 1e-6, dist_error);
                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],proj_samples[idx2]) - dec_funct(samples[idx2])) < 1e-10);

                    // also try the dec_funct with samples that weren't in the original set
                    samp = 100*randm(4,1,rnd);
                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],ekm.project(samp)) - dec_funct(samp)) < 1e-10);
                    samp = randm(4,1,rnd);
                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],ekm.project(samp)) - dec_funct(samp)) < 1e-10);
                }



                proj_samples.clear();


                // now do the projection but use the projection_function returned by get_projection_function()
                projection_function<kernel_type> proj2 = ekm.get_projection_function();
                projection_function<kernel_type> proj;
                sout.clear();
                sout.str("");
                sin.clear();
                sin.str("");
                // test serialization
                serialize(proj2, sout);
                sin.str(sout.str());
                deserialize(proj, sin);

                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    proj_samples.push_back(proj(samples[i]));
                }

                DLIB_TEST(max(abs(kernel_matrix(kern, samples) - kernel_matrix(linear_kernel<sample_type>(), proj_samples))) < 1e-12);
                DLIB_TEST(ekm.out_vector_size() == proj_samples[0].size());
                DLIB_TEST(proj.out_vector_size() == proj_samples[0].size());

                ekm.clear();
                DLIB_TEST(ekm.out_vector_size() == 0);
                DLIB_TEST(ekm2.out_vector_size() == 0);
                DLIB_TEST(ekm3.out_vector_size() == 0);


                for (int i = 0; i < 30; ++i)
                {
                    const unsigned long idx1 = rnd.get_random_32bit_number()%samples.size();
                    const unsigned long idx2 = rnd.get_random_32bit_number()%samples.size();
                    decision_function<kernel_type> dec_funct = convert_to_decision_function(proj,proj_samples[idx1]);

                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],proj_samples[idx2]) - dec_funct(samples[idx2])) < 1e-10);

                    // also try the dec_funct with samples that weren't in the original set
                    samp = 100*randm(4,1,rnd);
                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],proj(samp)) - dec_funct(samp)) < 1e-10);
                    samp = randm(4,1,rnd);
                    // make sure the dot products match 
                    DLIB_TEST(abs(dot(proj_samples[idx1],proj(samp)) - dec_funct(samp)) < 1e-10);
                }





            }

            for (int j = 1; j <= 20; ++j)
            {
                dlog << LTRACE << "j: " << j;
                sample_type samp, samp2;
                std::vector<sample_type> samples1;
                std::vector<sample_type> samples2;
                print_spinner();
                // make some random samples.  At the end samples1 will be a subset of samples2
                for (int i = 0; i < 5*j; ++i)
                {
                    samples1.push_back(randm(10,1,rnd));
                    samples2.push_back(samples1.back());
                }
                for (int i = 0; i < 5*j; ++i)
                {
                    samples2.push_back(randm(10,1,rnd));
                }
                // add on a little bit to make sure there is at least one non-zero sample.  If all the 
                // samples are zero then empirical_kernel_map_error will be thrown and we don't want that.
                samples1.front()(0) += 0.001;
                samples2.front()(0) += 0.001;

                ekm.load(kern, samples1);
                for (unsigned long i = 0; i < samples1.size(); ++i)
                    DLIB_TEST(dlib::equal(ekm[i] , samples1[i]));
                DLIB_TEST(ekm.basis_size() == samples1.size());
                ekm2.load(kern, samples2);
                DLIB_TEST(ekm2.basis_size() == samples2.size());
                 
                dlog << LTRACE << "ekm.out_vector_size(): " << ekm.out_vector_size();
                dlog << LTRACE << "ekm2.out_vector_size(): " << ekm2.out_vector_size();
                const double eps = 1e-6;

                matrix<double> transform;
                // Make sure transformations back to yourself work right.  Note that we can't just
                // check that transform is the identity matrix since it might be an identity transform
                // for only a subspace of vectors (this happens if the ekm maps points into a subspace of
                // all possible ekm.out_vector_size() vectors).
                transform = ekm.get_transformation_to(ekm);
                DLIB_TEST(transform.nr() == ekm.out_vector_size());
                DLIB_TEST(transform.nc() == ekm.out_vector_size());
                for (unsigned long i = 0; i < samples1.size(); ++i)
                {
                    samp = ekm.project(samples1[i]);
                    DLIB_TEST_MSG(length(samp - transform*samp) < eps, length(samp - transform*samp));
                    samp = ekm.project((samples1[0] + samples1[i])/2);
                    DLIB_TEST_MSG(length(samp - transform*samp) < eps, length(samp - transform*samp));
                }

                transform = ekm2.get_transformation_to(ekm2);
                DLIB_TEST(transform.nr() == ekm2.out_vector_size());
                DLIB_TEST(transform.nc() == ekm2.out_vector_size());
                for (unsigned long i = 0; i < samples2.size(); ++i)
                {
                    samp = ekm2.project(samples2[i]);
                    DLIB_TEST_MSG(length(samp - transform*samp) < eps, length(samp - transform*samp));
                    samp = ekm2.project((samples2[0] + samples2[i])/2);
                    DLIB_TEST_MSG(length(samp - transform*samp) < eps, length(samp - transform*samp));
                    //dlog << LTRACE << "mapping error: " << length(samp - transform*samp);
                }


                // now test the transform from ekm to ekm2
                transform = ekm.get_transformation_to(ekm2);
                DLIB_TEST(transform.nr() == ekm2.out_vector_size());
                DLIB_TEST(transform.nc() == ekm.out_vector_size());
                for (unsigned long i = 0; i < samples1.size(); ++i)
                {
                    samp = ekm.project(samples1[i]);
                    distance_function<kernel_type> df1 = ekm.convert_to_distance_function(samp);
                    distance_function<kernel_type> df2 = ekm2.convert_to_distance_function(transform*samp);
                    DLIB_TEST_MSG(df1(df2) < eps, df1(df2));
                    //dlog << LTRACE << "mapping error: " << df1(df2);


                    samp = ekm.project((samples1[0] + samples1[i])/2);
                    df1 = ekm.convert_to_distance_function(samp);
                    df2 = ekm2.convert_to_distance_function(transform*samp);
                    DLIB_TEST_MSG(df1(df2) < eps, df1(df2));
                }


            }
        }

        void perform_test (
        )
        {
            ++thetime;
            typedef matrix<double,0,1> sample_type;
            dlog << LINFO << "time seed: " << thetime;
            rnd.set_seed(cast_to_string(thetime));

            print_spinner();
            test_projection_error();
            print_spinner();
            dlog << LINFO << "test with linear kernel";
            test_with_kernel(linear_kernel<sample_type>());
            print_spinner();
            dlog << LINFO << "test with rbf kernel";
            test_with_kernel(radial_basis_kernel<sample_type>(0.2));
            print_spinner();
        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    empirical_kernel_map_tester a;

}


