// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm.h>
#include <dlib/rand.h>
#include <dlib/string.h>
#include <vector>
#include <sstream>
#include <ctime>
#include <dlib/data_io.h>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.sldf");


    class sldf_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        sldf_tester (
        ) :
            tester (
                "test_sldf",       // the command line argument name for this test
                "Run tests on the simplify_linear_decision_function routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        dlib::rand rnd;


        void perform_test (
        )
        {
            print_spinner();
            typedef std::map<unsigned long,double> sample_type;

            typedef matrix<double,0,1> dense_sample_type;

            typedef sparse_linear_kernel<sample_type> kernel_type;
            typedef linear_kernel<dense_sample_type> dense_kernel_type;


            svm_nu_trainer<kernel_type> linear_trainer;
            linear_trainer.set_nu(0.2);
            svm_nu_trainer<dense_kernel_type> dense_linear_trainer;
            dense_linear_trainer.set_nu(0.2);

            std::vector<sample_type> samples;
            std::vector<double> labels;

            // make an instance of a sample vector so we can use it below
            sample_type sample;

            // Now lets go into a loop and randomly generate 300 samples.
            double label = +1;
            for (int i = 0; i < 300; ++i)
            {
                // flip this flag
                label *= -1;

                sample.clear();

                // now make a random sparse sample with at most 10 non-zero elements
                for (int j = 0; j < 10; ++j)
                {
                    int idx = rnd.get_random_32bit_number()%100;
                    double value = rnd.get_random_double();

                    sample[idx] = label*value;
                }

                // Also save the samples we are generating so we can let the svm_c_linear_trainer
                // learn from them below.  
                samples.push_back(sample);
                labels.push_back(label);
            }


            {
                print_spinner();
                dlog << LINFO << " test with sparse samples ";
                decision_function<kernel_type> df = linear_trainer.train(samples, labels);

                dlog << LINFO << "df.basis_vectors.size(): "<< df.basis_vectors.size();
                DLIB_TEST(df.basis_vectors.size() > 4);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(df, samples, labels);

                // save the outputs of the decision function before we mess with it
                std::vector<double> prev_vals;
                for (unsigned long i = 0; i < samples.size(); ++i)
                    prev_vals.push_back(df(samples[i]));

                df = simplify_linear_decision_function(df);

                dlog << LINFO << "df.basis_vectors.size(): "<< df.basis_vectors.size();
                DLIB_TEST(df.basis_vectors.size() == 1);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(df, samples, labels);

                // now check that the simplified decision function still produces the same results
                std::vector<double> cur_vals;
                for (unsigned long i = 0; i < samples.size(); ++i)
                    cur_vals.push_back(df(samples[i]));

                const double err = max(abs(mat(cur_vals) - mat(prev_vals)));
                dlog << LINFO << "simplify error: "<< err;
                DLIB_TEST(err < 1e-13);

            }


            // same as above but call simplify_linear_decision_function() two times
            {
                print_spinner();
                dlog << LINFO << " test with sparse samples ";
                decision_function<kernel_type> df = linear_trainer.train(samples, labels);

                dlog << LINFO << "df.basis_vectors.size(): "<< df.basis_vectors.size();
                DLIB_TEST(df.basis_vectors.size() > 4);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(df, samples, labels);

                // save the outputs of the decision function before we mess with it
                std::vector<double> prev_vals;
                for (unsigned long i = 0; i < samples.size(); ++i)
                    prev_vals.push_back(df(samples[i]));

                df = simplify_linear_decision_function(df);
                df = simplify_linear_decision_function(df);

                dlog << LINFO << "df.basis_vectors.size(): "<< df.basis_vectors.size();
                DLIB_TEST(df.basis_vectors.size() == 1);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(df, samples, labels);

                // now check that the simplified decision function still produces the same results
                std::vector<double> cur_vals;
                for (unsigned long i = 0; i < samples.size(); ++i)
                    cur_vals.push_back(df(samples[i]));

                const double err = max(abs(mat(cur_vals) - mat(prev_vals)));
                dlog << LINFO << "simplify error: "<< err;
                DLIB_TEST(err < 1e-13);

            }


            {
                print_spinner();
                dlog << LINFO << " test with dense samples ";
                std::vector<dense_sample_type> dense_samples(sparse_to_dense(samples));

                // In addition to the rule we learned with the pegasos trainer lets also use our linear_trainer
                // to learn a decision rule.
                decision_function<dense_kernel_type> dense_df = dense_linear_trainer.train(dense_samples, labels);

                dlog << LINFO << "dense_df.basis_vectors.size(): "<< dense_df.basis_vectors.size();
                DLIB_TEST(dense_df.basis_vectors.size() > 4);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(dense_df, dense_samples, labels);

                // save the outputs of the decision function before we mess with it
                std::vector<double> prev_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    prev_vals.push_back(dense_df(dense_samples[i]));

                dense_df = simplify_linear_decision_function(dense_df);

                dlog << LINFO << "dense_df.basis_vectors.size(): "<< dense_df.basis_vectors.size();
                DLIB_TEST(dense_df.basis_vectors.size() == 1);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(dense_df, dense_samples, labels);


                // now check that the simplified decision function still produces the same results
                std::vector<double> cur_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    cur_vals.push_back(dense_df(dense_samples[i]));

                const double err = max(abs(mat(cur_vals) - mat(prev_vals)));
                dlog << LINFO << "simplify error: "<< err;
                DLIB_TEST(err < 1e-13);
            }

            // same as above but call simplify_linear_decision_function() two times
            {
                print_spinner();
                dlog << LINFO << " test with dense samples ";
                std::vector<dense_sample_type> dense_samples(sparse_to_dense(samples));

                // In addition to the rule we learned with the pegasos trainer lets also use our linear_trainer
                // to learn a decision rule.
                decision_function<dense_kernel_type> dense_df = dense_linear_trainer.train(dense_samples, labels);

                dlog << LINFO << "dense_df.basis_vectors.size(): "<< dense_df.basis_vectors.size();
                DLIB_TEST(dense_df.basis_vectors.size() > 4);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(dense_df, dense_samples, labels);

                // save the outputs of the decision function before we mess with it
                std::vector<double> prev_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    prev_vals.push_back(dense_df(dense_samples[i]));

                dense_df = simplify_linear_decision_function(dense_df);
                dense_df = simplify_linear_decision_function(dense_df);

                dlog << LINFO << "dense_df.basis_vectors.size(): "<< dense_df.basis_vectors.size();
                DLIB_TEST(dense_df.basis_vectors.size() == 1);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(dense_df, dense_samples, labels);


                // now check that the simplified decision function still produces the same results
                std::vector<double> cur_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    cur_vals.push_back(dense_df(dense_samples[i]));

                const double err = max(abs(mat(cur_vals) - mat(prev_vals)));
                dlog << LINFO << "simplify error: "<< err;
                DLIB_TEST(err < 1e-13);
            }

            {
                print_spinner();

                dlog << LINFO << " test with sparse samples and a vector normalizer";
                std::vector<dense_sample_type> dense_samples(sparse_to_dense(samples));
                std::vector<dense_sample_type> norm_samples;

                // make a normalizer and normalize everything
                vector_normalizer<dense_sample_type> normalizer;
                normalizer.train(dense_samples);
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    norm_samples.push_back(normalizer(dense_samples[i]));

                normalized_function<decision_function<dense_kernel_type> > dense_df;

                dense_df.normalizer = normalizer;
                dense_df.function = dense_linear_trainer.train(norm_samples, labels);

                dlog << LINFO << "dense_df.function.basis_vectors.size(): "<< dense_df.function.basis_vectors.size();
                DLIB_TEST(dense_df.function.basis_vectors.size() > 4);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(dense_df, dense_samples, labels);

                // save the outputs of the decision function before we mess with it
                std::vector<double> prev_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    prev_vals.push_back(dense_df(dense_samples[i]));


                decision_function<dense_kernel_type> simple_df = simplify_linear_decision_function(dense_df);

                dlog << LINFO << "simple_df.basis_vectors.size(): "<< simple_df.basis_vectors.size();
                DLIB_TEST(simple_df.basis_vectors.size() == 1);

                dlog << LINFO << "test scores: "<< test_binary_decision_function(simple_df, dense_samples, labels);


                // now check that the simplified decision function still produces the same results
                std::vector<double> cur_vals;
                for (unsigned long i = 0; i < dense_samples.size(); ++i)
                    cur_vals.push_back(simple_df(dense_samples[i]));

                const double err = max(abs(mat(cur_vals) - mat(prev_vals)));
                dlog << LINFO << "simplify error: "<< err;
                DLIB_TEST(err < 1e-13);

            }

        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    sldf_tester a;

}



