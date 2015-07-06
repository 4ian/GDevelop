// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm_threaded.h>
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.one_vs_all_trainer");


    class test_one_vs_all_trainer : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        test_one_vs_all_trainer (
        ) :
            tester (
                "test_one_vs_all_trainer",       // the command line argument name for this test
                "Run tests on the one_vs_all_trainer stuff.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }



        template <typename sample_type, typename label_type>
        void generate_data (
            std::vector<sample_type>& samples,
            std::vector<label_type>& labels
        )
        {
            const long num = 50;

            sample_type m;

            dlib::rand rnd;


            // make some samples near the origin
            double radius = 0.5;
            for (long i = 0; i < num+10; ++i)
            {
                double sign = 1;
                if (rnd.get_random_double() < 0.5)
                    sign = -1;
                m(0) = 2*radius*rnd.get_random_double()-radius;
                m(1) = sign*sqrt(radius*radius - m(0)*m(0));

                // add this sample to our set of samples we will run k-means 
                samples.push_back(m);
                labels.push_back(1);
            }

            // make some samples in a circle around the origin but far away
            radius = 10.0;
            for (long i = 0; i < num+20; ++i)
            {
                double sign = 1;
                if (rnd.get_random_double() < 0.5)
                    sign = -1;
                m(0) = 2*radius*rnd.get_random_double()-radius;
                m(1) = sign*sqrt(radius*radius - m(0)*m(0));

                // add this sample to our set of samples we will run k-means 
                samples.push_back(m);
                labels.push_back(2);
            }

            // make some samples in a circle around the point (25,25) 
            radius = 4.0;
            for (long i = 0; i < num+30; ++i)
            {
                double sign = 1;
                if (rnd.get_random_double() < 0.5)
                    sign = -1;
                m(0) = 2*radius*rnd.get_random_double()-radius;
                m(1) = sign*sqrt(radius*radius - m(0)*m(0));

                // translate this point away from the origin
                m(0) += 25;
                m(1) += 25;

                // add this sample to our set of samples we will run k-means 
                samples.push_back(m);
                labels.push_back(3);
            }
        }

        template <typename label_type, typename scalar_type>
        void run_test (
        )
        {
            print_spinner();
            typedef matrix<scalar_type,2,1> sample_type;

            std::vector<sample_type> samples, norm_samples;
            std::vector<label_type> labels;

            // First, get our labeled set of training data
            generate_data(samples, labels);

            typedef one_vs_all_trainer<any_trainer<sample_type,scalar_type>,label_type > ova_trainer;


            ova_trainer trainer;

            typedef polynomial_kernel<sample_type> poly_kernel;
            typedef radial_basis_kernel<sample_type> rbf_kernel;

            // make the binary trainers and set some parameters
            krr_trainer<rbf_kernel> rbf_trainer;
            svm_nu_trainer<poly_kernel> poly_trainer;
            poly_trainer.set_kernel(poly_kernel(0.1, 1, 2));
            rbf_trainer.set_kernel(rbf_kernel(0.1));


            trainer.set_trainer(rbf_trainer);
            trainer.set_trainer(poly_trainer, 1);

            randomize_samples(samples, labels);
            matrix<double> res = cross_validate_multiclass_trainer(trainer, samples, labels, 2);

            print_spinner();

            matrix<scalar_type> ans(3,3);
            ans = 60,  0,  0, 
                  0, 70,  0, 
                  0,  0, 80;

            DLIB_TEST_MSG(ans == res, "res: \n" << res);

            // test using a normalized_function with a one_vs_all_decision_function 
            {
                poly_trainer.set_kernel(poly_kernel(1.1, 1, 2));
                trainer.set_trainer(poly_trainer, 1);
                vector_normalizer<sample_type> normalizer;
                normalizer.train(samples);
                for (unsigned long i = 0; i < samples.size(); ++i)
                    norm_samples.push_back(normalizer(samples[i]));
                normalized_function<one_vs_all_decision_function<ova_trainer> > ndf;
                ndf.function = trainer.train(norm_samples, labels);
                ndf.normalizer = normalizer;
                DLIB_TEST(ndf(samples[0])  == labels[0]);
                DLIB_TEST(ndf(samples[40])  == labels[40]);
                DLIB_TEST(ndf(samples[90])  == labels[90]);
                DLIB_TEST(ndf(samples[120])  == labels[120]);
                poly_trainer.set_kernel(poly_kernel(0.1, 1, 2));
                trainer.set_trainer(poly_trainer, 1);
                print_spinner();
            }

            one_vs_all_decision_function<ova_trainer> df = trainer.train(samples, labels);

            DLIB_TEST(df.number_of_classes() == 3);

            DLIB_TEST(df(samples[0])  == labels[0])
            DLIB_TEST(df(samples[90])  == labels[90])


            one_vs_all_decision_function<ova_trainer, 
                decision_function<poly_kernel>,  // This is the output of the poly_trainer
                decision_function<rbf_kernel>    // This is the output of the rbf_trainer
            > df2, df3;


            df2 = df;
            ofstream fout("df.dat", ios::binary);
            serialize(df2, fout);
            fout.close();

            // load the function back in from disk and store it in df3.  
            ifstream fin("df.dat", ios::binary);
            deserialize(df3, fin);


            DLIB_TEST(df3(samples[0])  == labels[0])
            DLIB_TEST(df3(samples[90])  == labels[90])
            res = test_multiclass_decision_function(df3, samples, labels);

            DLIB_TEST(res == ans);


        }

        template <typename label_type, typename scalar_type>
        void run_probabilistic_test (
        )
        {
            print_spinner();
            typedef matrix<scalar_type,2,1> sample_type;

            std::vector<sample_type> samples;
            std::vector<label_type> labels;

            // First, get our labeled set of training data
            generate_data(samples, labels);

            typedef one_vs_all_trainer<any_trainer<sample_type,scalar_type>,label_type > ova_trainer;


            ova_trainer trainer;

            typedef polynomial_kernel<sample_type> poly_kernel;
            typedef radial_basis_kernel<sample_type> rbf_kernel;

            // make the binary trainers and set some parameters
            krr_trainer<rbf_kernel> rbf_trainer;
            svm_nu_trainer<poly_kernel> poly_trainer;
            poly_trainer.set_kernel(poly_kernel(0.1, 1, 2));
            rbf_trainer.set_kernel(rbf_kernel(0.1));


            trainer.set_trainer(probabilistic(rbf_trainer, 3));
            trainer.set_trainer(probabilistic(poly_trainer, 3), 1);

            randomize_samples(samples, labels);
            matrix<double> res = cross_validate_multiclass_trainer(trainer, samples, labels, 2);

            print_spinner();

            matrix<scalar_type> ans(3,3);
            ans = 60,  0,  0, 
                  0, 70,  0, 
                  0,  0, 80;

            DLIB_TEST_MSG(ans == res, "res: \n" << res);

            one_vs_all_decision_function<ova_trainer> df = trainer.train(samples, labels);

            DLIB_TEST(df.number_of_classes() == 3);

            DLIB_TEST(df(samples[0])  == labels[0])
            DLIB_TEST(df(samples[90])  == labels[90])


            one_vs_all_decision_function<ova_trainer, 
                probabilistic_function<decision_function<poly_kernel> >,  // This is the output of the poly_trainer
                probabilistic_function<decision_function<rbf_kernel> >    // This is the output of the rbf_trainer
            > df2, df3;


            df2 = df;
            ofstream fout("df.dat", ios::binary);
            serialize(df2, fout);
            fout.close();

            // load the function back in from disk and store it in df3.  
            ifstream fin("df.dat", ios::binary);
            deserialize(df3, fin);


            DLIB_TEST(df3(samples[0])  == labels[0])
            DLIB_TEST(df3(samples[90])  == labels[90])
            res = test_multiclass_decision_function(df3, samples, labels);

            DLIB_TEST(res == ans);


        }

        void perform_test (
        )
        {
            dlog << LINFO << "run_test<double,double>()";
            run_test<double,double>();

            dlog << LINFO << "run_test<int,double>()";
            run_test<int,double>();

            dlog << LINFO << "run_test<double,float>()";
            run_test<double,float>();

            dlog << LINFO << "run_test<int,float>()";
            run_test<int,float>();

            dlog << LINFO << "run_probabilistic_test<double,double>()";
            run_probabilistic_test<double,double>();

            dlog << LINFO << "run_probabilistic_test<int,double>()";
            run_probabilistic_test<int,double>();

            dlog << LINFO << "run_probabilistic_test<double,float>()";
            run_probabilistic_test<double,float>();

            dlog << LINFO << "run_probabilistic_test<int,float>()";
            run_probabilistic_test<int,float>();
        }
    };

    test_one_vs_all_trainer a;

}


