// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/svm.h>

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.active_learning");

// ----------------------------------------------------------------------------------------

    typedef matrix<double, 0, 1> sample_type;
    typedef radial_basis_kernel<sample_type> kernel_type;

// ----------------------------------------------------------------------------------------

    void make_dataset (
        std::vector<sample_type>& samples,
        std::vector<double>& labels
    )
    {
        for (int r = -10; r <= 10; ++r)
        {
            for (int c = -10; c <= 10; ++c)
            {
                sample_type samp(2);
                samp(0) = r;
                samp(1) = c;
                samples.push_back(samp);

                // if this point is less than 10 from the origin
                if (sqrt((double)r*r + c*c) <= 8)
                    labels.push_back(+1);
                else
                    labels.push_back(-1);

            }
        }


        vector_normalizer<sample_type> normalizer;
        normalizer.train(samples);
        for (unsigned long i = 0; i < samples.size(); ++i)
            samples[i] = normalizer(samples[i]); 

        randomize_samples(samples, labels);

        /*
        cout << "samples.size(): " << samples.size() << endl;
        cout << "num +1 samples: "<< sum(mat(labels) > 0) << endl;
        cout << "num -1 samples: "<< sum(mat(labels) < 0) << endl;
        */

        empirical_kernel_map<kernel_type> ekm;
        ekm.load(kernel_type(0.15), samples);
        for (unsigned long i = 0; i < samples.size(); ++i)
            samples[i] = ekm.project(samples[i]);

        //cout << "dims: "<< ekm.out_vector_size() << endl;
    }

// ----------------------------------------------------------------------------------------

    double test_rank_unlabeled_training_samples (
        const std::vector<sample_type>& samples,
        const std::vector<double>& labels,
        active_learning_mode mode,
        int iterations,
        bool pick_front
    )
    {
        matrix<double,2,1> s;
        s = sum(mat(labels) > 0), sum(mat(labels) < 0);
        s /= labels.size();


        svm_c_linear_dcd_trainer<linear_kernel<sample_type> > trainer;
        trainer.set_c(25);

        const unsigned long initial_size = 1;
        std::vector<sample_type> tsamples(samples.begin(), samples.begin()+initial_size); 
        std::vector<double> tlabels(labels.begin(), labels.begin()+initial_size); 

        decision_function<linear_kernel<sample_type> > df;

        double random_score = 0;
        double active_learning_score = 0;
        for (int i = 0; i < iterations; ++i)
        {
            print_spinner();
            random_subset_selector<sample_type> sss = randomly_subsample(samples,50,i);
            random_subset_selector<double> ssl = randomly_subsample(labels,50,i);
            std::vector<unsigned long> results;

            results = rank_unlabeled_training_samples(trainer, tsamples, tlabels, sss, mode);

            const unsigned long idx = pick_front ? results.front() : results.back();
            tsamples.push_back(sss[idx]);
            tlabels.push_back(ssl[idx]);

            df = trainer.train(tsamples, tlabels);
            //cout << "tsamples.size(): " << tsamples.size() << endl;
            const unsigned long num = tsamples.size();
            const double active = test_binary_decision_function(df, samples, labels)*s;
            //cout << "test: "<< active;
            df = trainer.train(randomly_subsample(samples,num,i), randomly_subsample(labels,num,i));
            const double random = test_binary_decision_function(df, samples, labels)*s;
            //cout << "test: "<< random << endl;

            active_learning_score += active;
            random_score += random;

            //cout << "\n\n***********\n\n" << flush;
        }

        dlog << LINFO << "pick_front: " << pick_front << "   mode: "<< mode;
        dlog << LINFO << "active_learning_score: "<< active_learning_score;
        dlog << LINFO << "random_score:          "<< random_score;
        return active_learning_score / random_score;
    }

// ----------------------------------------------------------------------------------------

    class test_active_learning : public tester
    {
    public:
        test_active_learning (
        ) :
            tester ("test_active_learning",
                "Runs tests on the active learning components.")
        {}

        void perform_test (
        )
        {
            std::vector<sample_type> samples;
            std::vector<double> labels;
            print_spinner();
            make_dataset(samples, labels);
            dlog << LINFO << "samples.size(): "<< samples.size();

            // When we pick the best/front ranked element then the active learning method
            // shouldn't do much worse than random selection (and often much better).
            DLIB_TEST(test_rank_unlabeled_training_samples(samples, labels, max_min_margin, 25, true) >= 0.97);
            DLIB_TEST(test_rank_unlabeled_training_samples(samples, labels, ratio_margin, 25, true) >= 0.96);
            // However, picking the worst ranked element should do way worse than random
            // selection.
            DLIB_TEST(test_rank_unlabeled_training_samples(samples, labels, max_min_margin, 25, false) < 0.8);
            DLIB_TEST(test_rank_unlabeled_training_samples(samples, labels, ratio_margin, 25, false) < 0.8);
        }
    } a;

}



