// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm.h>
#include <dlib/data_io.h>
#include "create_iris_datafile.h"
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.svm_multiclass_trainer");


    class test_svm_multiclass_trainer : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        test_svm_multiclass_trainer (
        ) :
            tester (
                "test_svm_multiclass_trainer",       // the command line argument name for this test
                "Run tests on the svm_multiclass_linear_trainer stuff.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }


        template <typename sample_type>
        void run_test()
        {
            print_spinner();

            typedef typename sample_type::value_type::second_type scalar_type;

            std::vector<sample_type> samples;
            std::vector<scalar_type> labels;

            load_libsvm_formatted_data("iris.scale",samples, labels);

            DLIB_TEST(samples.size() == 150);
            DLIB_TEST(labels.size() == 150);

            typedef sparse_linear_kernel<sample_type> kernel_type;
            svm_multiclass_linear_trainer<kernel_type> trainer;
            trainer.set_c(100);

            randomize_samples(samples, labels);
            matrix<double> cv = cross_validate_multiclass_trainer(trainer, samples, labels, 4);

            dlog << LINFO << "confusion matrix: \n" << cv;
            const scalar_type cv_accuracy = sum(diag(cv))/sum(cv);
            dlog << LINFO << "cv accuracy: " << cv_accuracy;
            DLIB_TEST(cv_accuracy > 0.97);




            {
                print_spinner();
                typedef matrix<scalar_type,0,1> dsample_type;
                std::vector<dsample_type> dsamples = sparse_to_dense(samples);
                DLIB_TEST(dsamples.size() == 150);

                typedef linear_kernel<dsample_type> kernel_type;
                svm_multiclass_linear_trainer<kernel_type> trainer;
                trainer.set_c(100);

                cv = cross_validate_multiclass_trainer(trainer, dsamples, labels, 4);

                dlog << LINFO << "dense confusion matrix: \n" << cv;
                const scalar_type cv_accuracy = sum(diag(cv))/sum(cv);
                dlog << LINFO << "dense cv accuracy: " << cv_accuracy;
                DLIB_TEST(cv_accuracy > 0.97);
            }

        }




        void perform_test (
        )
        {
            print_spinner();
            create_iris_datafile();

            run_test<std::map<unsigned int, double> >();
            run_test<std::map<unsigned int, float> >();
            run_test<std::vector<std::pair<unsigned int, float> > >();
            run_test<std::vector<std::pair<unsigned long, double> > >();
        }
    };

    test_svm_multiclass_trainer a;

}


