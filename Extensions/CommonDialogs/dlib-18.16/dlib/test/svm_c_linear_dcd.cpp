// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/svm.h>
#include <dlib/rand.h>
#include <dlib/statistics.h>

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.svm_c_linear_dcd");

// ----------------------------------------------------------------------------------------

    void test_sparse()
    {
        typedef std::map<unsigned long,double> sample_type;


        typedef sparse_linear_kernel<sample_type> kernel_type;



        svm_c_linear_trainer<kernel_type> linear_trainer_cpa;
        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 0.2;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer_cpa.set_epsilon(1e-10);


        std::vector<sample_type> samples;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        decision_function<kernel_type> df, df2, df3;

        dlib::rand rnd;
        // Now lets go into a loop and randomly generate 10000 samples.
        double label = +1;
        for (int i = 0; i < 100; ++i)
        {
            // flip this flag
            label *= -1;

            sample.clear();

            // now make a random sparse sample with at most 10 non-zero elements
            for (int j = 0; j < 5; ++j)
            {
                int idx = rnd.get_random_32bit_number()%10;
                double value = rnd.get_random_double();

                sample[idx] = label*value;
            }

            // Also save the samples we are generating so we can let the svm_c_linear_trainer
            // learn from them below.  
            samples.push_back(sample);
            labels.push_back(label);

            if (samples.size() > 1)
            {
                linear_trainer_cpa.set_c_class1(C);
                linear_trainer_cpa.set_c_class2(1.5*C);
                linear_trainer.set_c_class1(C/samples.size());
                linear_trainer.set_c_class2(1.5*C/samples.size());

                df = linear_trainer.train(samples, labels, state);
                df2 = linear_trainer_cpa.train(samples, labels);
                df3 = linear_trainer.train(samples, labels);

                DLIB_TEST_MSG( dlib::distance(df.basis_vectors(0), df2.basis_vectors(0)) < 1e-8, dlib::distance(df.basis_vectors(0), df2.basis_vectors(0)));
                DLIB_TEST( std::abs(df.b - df2.b) < 1e-8);
                DLIB_TEST( dlib::distance(df.basis_vectors(0), df3.basis_vectors(0)) < 1e-8);
                DLIB_TEST( std::abs(df.b - df3.b) < 1e-8);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_normal_no_bias()
    {
        typedef matrix<double,10,1> sample_type;


        typedef linear_kernel<sample_type> kernel_type;



        svm_c_linear_trainer<kernel_type> linear_trainer_cpa;
        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 1.0;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer_cpa.set_epsilon(1e-10);

        linear_trainer.include_bias(false);


        std::vector<sample_type> samples, samples_explict_bias;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        decision_function<kernel_type> df, df2, df3;

        dlib::rand rnd;
        // Now lets go into a loop and randomly generate 10000 samples.
        double label = +1;
        for (int i = 0; i < 100; ++i)
        {
            // flip this flag
            label *= -1;

            sample = 0;

            // now make a random sparse sample with at most 10 non-zero elements
            for (int j = 0; j < 5; ++j)
            {
                int idx = rnd.get_random_32bit_number()%9;
                double value = rnd.get_random_double();

                sample(idx) = label*value;
            }

            // Also save the samples we are generating so we can let the svm_c_linear_trainer
            // learn from them below.  
            samples.push_back(sample);
            labels.push_back(label);

            sample(9) = -1;
            samples_explict_bias.push_back(sample);

            if (samples.size() > 1)
            {
                linear_trainer_cpa.set_c_class1(C);
                linear_trainer_cpa.set_c_class2(1.5*C);
                linear_trainer.set_c_class1(C/samples.size());
                linear_trainer.set_c_class2(1.5*C/samples.size());

                df = linear_trainer.train(samples_explict_bias, labels, state);
                df2 = linear_trainer_cpa.train(samples, labels);
                df3 = linear_trainer.train(samples_explict_bias, labels);

                DLIB_TEST( std::abs(df2.basis_vectors(0)(9)) < 1e-7);
                DLIB_TEST_MSG( max(abs(colm(df.basis_vectors(0),0,9) - colm(df2.basis_vectors(0),0,9))) < 1e-6, max(abs(colm(df.basis_vectors(0),0,9) - colm(df2.basis_vectors(0),0,9))));
                DLIB_TEST( std::abs(df.basis_vectors(0)(9) - df2.b) < 1e-6);
                DLIB_TEST( max(abs(df.basis_vectors(0) - df3.basis_vectors(0))) < 1e-6);
                DLIB_TEST( std::abs(df.b - df3.b) < 1e-7);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_normal()
    {
        typedef matrix<double,10,1> sample_type;


        typedef linear_kernel<sample_type> kernel_type;



        svm_c_linear_trainer<kernel_type> linear_trainer_cpa;
        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 1;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer_cpa.set_epsilon(1e-10);

        std::vector<sample_type> samples;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        decision_function<kernel_type> df, df2, df3;

        dlib::rand rnd;
        // Now lets go into a loop and randomly generate 10000 samples.
        double label = +1;
        for (int i = 0; i < 100; ++i)
        {
            // flip this flag
            label *= -1;

            sample = 0;

            // now make a random sparse sample with at most 10 non-zero elements
            for (int j = 0; j < 5; ++j)
            {
                int idx = rnd.get_random_32bit_number()%10;
                double value = rnd.get_random_double();

                sample(idx) = label*value;
            }

            // Also save the samples we are generating so we can let the svm_c_linear_trainer
            // learn from them below.  
            samples.push_back(sample);
            labels.push_back(label);

            if (samples.size() > 1)
            {
                linear_trainer_cpa.set_c_class1(C);
                linear_trainer_cpa.set_c_class2(1.5*C);
                linear_trainer.set_c_class1(C/samples.size());
                linear_trainer.set_c_class2(1.5*C/samples.size());

                df = linear_trainer.train(samples, labels, state);
                df2 = linear_trainer_cpa.train(samples, labels);
                df3 = linear_trainer.train(samples, labels);

                DLIB_TEST_MSG( max(abs(df.basis_vectors(0) - df2.basis_vectors(0))) < 1e-7, max(abs(df.basis_vectors(0) - df2.basis_vectors(0))));
                DLIB_TEST( std::abs(df.b - df2.b) < 1e-7);
                DLIB_TEST( max(abs(df.basis_vectors(0) - df3.basis_vectors(0))) < 1e-7);
                DLIB_TEST( std::abs(df.b - df3.b) < 1e-7);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_normal_force_last_weight(bool have_bias, bool force_weight)
    {
        typedef matrix<double,10,1> sample_type;
        dlog << LINFO << "have_bias: "<< have_bias << "   force_weight: "<< force_weight;


        typedef linear_kernel<sample_type> kernel_type;


        svm_c_linear_trainer<kernel_type> linear_trainer_cpa;

        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 1;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer_cpa.set_epsilon(1e-11);

        linear_trainer_cpa.force_last_weight_to_1(force_weight);

        linear_trainer.force_last_weight_to_1(force_weight);
        linear_trainer.include_bias(have_bias);

        std::vector<sample_type> samples;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        decision_function<kernel_type> df, df2;

        running_stats<double> rs;

        dlib::rand rnd;
        // Now lets go into a loop and randomly generate 10000 samples.
        double label = +1;
        for (int i = 0; i < 40; ++i)
        {
            // flip this flag
            label *= -1;

            sample = 0;

            // now make a random sparse sample with at most 10 non-zero elements
            for (int j = 0; j < 5; ++j)
            {
                int idx = rnd.get_random_32bit_number()%9;
                double value = rnd.get_random_double();

                sample(idx) = label*value + label;
            }

            sample(9) = 4;

            // Also save the samples we are generating so we can let the svm_c_linear_trainer
            // learn from them below.  
            samples.push_back(sample);
            labels.push_back(label);

            linear_trainer.set_c(C);
            linear_trainer_cpa.set_c(C*samples.size());

            df = linear_trainer.train(samples, labels, state);

            if (force_weight)
            {
                DLIB_TEST(std::abs(df.basis_vectors(0)(9) - 1) < 1e-8);
                DLIB_TEST(std::abs(df.b) < 1e-8);

                if (samples.size() > 1)
                {
                    df2 = linear_trainer_cpa.train(samples, labels);
                    DLIB_TEST_MSG( max(abs(df.basis_vectors(0) - df2.basis_vectors(0))) < 1e-7, max(abs(df.basis_vectors(0) - df2.basis_vectors(0))));
                    DLIB_TEST( std::abs(df.b - df2.b) < 1e-7);
                }
            }

            if (!have_bias)
                DLIB_TEST(std::abs(df.b) < 1e-8);


            for (unsigned long k = 0; k < samples.size(); ++k)
            {
                //cout << "pred: "<< labels[k]*df(samples[k]) << endl;
                rs.add(labels[k]*df(samples[k]));
            }
        }
        DLIB_TEST_MSG(std::abs(rs.min()-1) < 1e-7, std::abs(rs.min()-1));
    }

// ----------------------------------------------------------------------------------------

    void test_normal_1_sample(double label)
    {
        typedef matrix<double,10,1> sample_type;


        typedef linear_kernel<sample_type> kernel_type;



        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 10;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer.set_c(C);


        linear_trainer.force_last_weight_to_1(true);
        linear_trainer.include_bias(false);

        std::vector<sample_type> samples;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        sample = 0;
        sample(0) = -1;
        sample(1) = -1;
        sample(9) = 4;

        samples.push_back(sample);
        labels.push_back(label);

        for (int i = 0; i < 4; ++i)
        {
            decision_function<kernel_type> df;
            df = linear_trainer.train(samples, labels);

            if (label > 0)
            {
                DLIB_TEST(std::abs(df(samples[0])-4) < 1e-8);
            }
            else
            {
                DLIB_TEST(std::abs(df(samples[0])+1) < 1e-8);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_sparse_1_sample(double label)
    {
        typedef std::vector<std::pair<unsigned long,double> > sample_type;


        typedef sparse_linear_kernel<sample_type> kernel_type;



        svm_c_linear_dcd_trainer<kernel_type> linear_trainer;

        svm_c_linear_dcd_trainer<kernel_type>::optimizer_state state;

        const double C = 10;
        linear_trainer.set_epsilon(1e-10);
        linear_trainer.set_c(C);


        linear_trainer.force_last_weight_to_1(true);
        linear_trainer.include_bias(false);

        std::vector<sample_type> samples;
        std::vector<double> labels;

        // make an instance of a sample vector so we can use it below
        sample_type sample;

        sample.push_back(make_pair(0,-1));
        sample.push_back(make_pair(1,1));
        sample.push_back(make_pair(9,4));

        for (int i = 0; i < 4; ++i)
        {
            samples.push_back(sample);
            labels.push_back(label);

            decision_function<kernel_type> df;
            df = linear_trainer.train(samples, labels);


            if (label > 0)
            {
                DLIB_TEST(std::abs(df(samples[0])-4) < 1e-8);
            }
            else
            {
                DLIB_TEST(std::abs(df(samples[0])+1) < 1e-8);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    class tester_svm_c_linear_dcd : public tester
    {
    public:
        tester_svm_c_linear_dcd (
        ) :
            tester ("test_svm_c_linear_dcd",
                "Runs tests on the svm_c_linear_dcd_trainer.")
        {}

        void perform_test (
        )
        {
            test_normal();
            print_spinner();
            test_normal_no_bias();
            print_spinner();
            test_sparse();
            print_spinner();
            test_normal_force_last_weight(false,false);
            print_spinner();
            test_normal_force_last_weight(false,true);
            print_spinner();
            test_normal_force_last_weight(true,false);
            print_spinner();
            test_normal_force_last_weight(true,true);
            print_spinner();
            test_normal_1_sample(+1);
            print_spinner();
            test_normal_1_sample(-1);
            print_spinner();
            test_sparse_1_sample(+1);
            print_spinner();
            test_sparse_1_sample(-1);
            print_spinner();
        }
    } a;

}




