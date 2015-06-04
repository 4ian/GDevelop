// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <dlib/svm.h>
#include <dlib/rand.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <map>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;


    logger dlog("test.ranking");

// ----------------------------------------------------------------------------------------

    template <typename T>
    void brute_force_count_ranking_inversions (
        const std::vector<T>& x,
        const std::vector<T>& y,
        std::vector<unsigned long>& x_count,
        std::vector<unsigned long>& y_count
    )
    {
        x_count.assign(x.size(),0);
        y_count.assign(y.size(),0);

        for (unsigned long i = 0; i < x.size(); ++i)
        {
            for (unsigned long j = 0; j < y.size(); ++j)
            {
                if (x[i] <= y[j])
                {
                    x_count[i]++;
                    y_count[j]++;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_count_ranking_inversions()
    {
        print_spinner();
        dlog << LINFO << "in test_count_ranking_inversions()";

        dlib::rand rnd;
        std::vector<int> x, y;
        std::vector<unsigned long> x_count, y_count;
        std::vector<unsigned long> x_count2, y_count2;
        for (int iter = 0; iter < 5000; ++iter)
        {
            x.resize(rnd.get_random_32bit_number()%10);
            y.resize(rnd.get_random_32bit_number()%10);
            for (unsigned long i = 0; i < x.size(); ++i)
                x[i] = ((int)rnd.get_random_32bit_number()%10) - 5;
            for (unsigned long i = 0; i < y.size(); ++i)
                y[i] = ((int)rnd.get_random_32bit_number()%10) - 5;

            count_ranking_inversions(x, y, x_count, y_count);
            brute_force_count_ranking_inversions(x, y, x_count2, y_count2);

            DLIB_TEST(mat(x_count) == mat(x_count2));
            DLIB_TEST(mat(y_count) == mat(y_count2));
        }
    }

// ----------------------------------------------------------------------------------------

    void run_prior_test()
    {
        print_spinner();
        typedef matrix<double,3,1> sample_type;
        typedef linear_kernel<sample_type> kernel_type;

        svm_rank_trainer<kernel_type> trainer;

        ranking_pair<sample_type> data;

        sample_type samp;
        samp = 0, 0, 1; data.relevant.push_back(samp); 
        samp = 0, 1, 0; data.nonrelevant.push_back(samp); 

        trainer.set_c(10);
        decision_function<kernel_type> df = trainer.train(data);

        trainer.set_prior(df);

        data.relevant.clear();
        data.nonrelevant.clear();
        samp = 1, 0, 0; data.relevant.push_back(samp); 
        samp = 0, 1, 0; data.nonrelevant.push_back(samp); 

        df = trainer.train(data);

        dlog << LINFO << trans(df.basis_vectors(0));
        DLIB_TEST(df.basis_vectors(0)(0) > 0);
        DLIB_TEST(df.basis_vectors(0)(1) < 0);
        DLIB_TEST(df.basis_vectors(0)(2) > 0);
    }

// ----------------------------------------------------------------------------------------

    void run_prior_sparse_test()
    {
        print_spinner();
        typedef std::map<unsigned long,double> sample_type;
        typedef sparse_linear_kernel<sample_type> kernel_type;

        svm_rank_trainer<kernel_type> trainer;

        ranking_pair<sample_type> data;

        sample_type samp;
        samp[0] = 1; data.relevant.push_back(samp); samp.clear();
        samp[1] = 1; data.nonrelevant.push_back(samp); samp.clear();

        trainer.set_c(10);
        decision_function<kernel_type> df = trainer.train(data);

        trainer.set_prior(df);

        data.relevant.clear();
        data.nonrelevant.clear();
        samp[2] = 1; data.relevant.push_back(samp); samp.clear();
        samp[1] = 1; data.nonrelevant.push_back(samp); samp.clear();

        df = trainer.train(data);

        matrix<double,0,1> w = sparse_to_dense(df.basis_vectors(0));
        dlog << LINFO << trans(w);
        DLIB_TEST(w(0) > 0.1);
        DLIB_TEST(w(1) < -0.1);
        DLIB_TEST(w(2) > 0.1);
    }

// ----------------------------------------------------------------------------------------

    void dotest1()
    {
        print_spinner();
        dlog << LINFO << "in dotest1()";

        typedef matrix<double,4,1> sample_type;

        typedef linear_kernel<sample_type> kernel_type;

        svm_rank_trainer<kernel_type> trainer;


        std::vector<ranking_pair<sample_type> > samples;

        ranking_pair<sample_type> p;
        sample_type samp;

        samp = 0, 0, 0, 1; p.relevant.push_back(samp);
        samp = 1, 0, 0, 0; p.nonrelevant.push_back(samp);
        samples.push_back(p);

        samp = 0, 0, 1, 0; p.relevant.push_back(samp);
        samp = 1, 0, 0, 0; p.nonrelevant.push_back(samp);
        samp = 0, 1, 0, 0; p.nonrelevant.push_back(samp);
        samp = 0, 1, 0, 0; p.nonrelevant.push_back(samp);
        samples.push_back(p);


        trainer.set_c(10);

        decision_function<kernel_type> df = trainer.train(samples);

        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        matrix<double,1,2> res;
        res = 1,1;
        DLIB_TEST(equal(test_ranking_function(df, samples), res));

        DLIB_TEST(equal(test_ranking_function(trainer.train(samples[1]), samples), res));

        trainer.set_epsilon(1e-13);
        df = trainer.train(samples);

        dlog << LINFO << df.basis_vectors(0);
        sample_type truew;
        truew = -0.5, -0.5, 0.5, 0.5;
        DLIB_TEST(length(truew - df.basis_vectors(0)) < 1e-10);

        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        DLIB_TEST(equal(test_ranking_function(df, samples), res));

        dlog << LINFO << "cv-accuracy: "<< cross_validate_ranking_trainer(trainer, samples,2);
        DLIB_TEST(std::abs(cross_validate_ranking_trainer(trainer, samples,2)(0) - 0.7777777778) < 0.0001);

        trainer.set_learns_nonnegative_weights(true);
        df = trainer.train(samples);
        truew = 0, 0, 1.0, 1.0;
        dlog << LINFO << df.basis_vectors(0);
        DLIB_TEST(length(truew - df.basis_vectors(0)) < 1e-10);
        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        DLIB_TEST(equal(test_ranking_function(df, samples), res));


        samples.clear();
        samples.push_back(p);
        samples.push_back(p);
        samples.push_back(p);
        samples.push_back(p);
        dlog << LINFO << "cv-accuracy: "<< cross_validate_ranking_trainer(trainer, samples,4);
        DLIB_TEST(equal(cross_validate_ranking_trainer(trainer, samples,4) , res));

        df.basis_vectors(0) = 0;
        dlog << LINFO << "BAD RANKING:" << test_ranking_function(df, samples);
        DLIB_TEST(test_ranking_function(df, samples)(1) < 0.5);
    }

// ----------------------------------------------------------------------------------------

    void dotest_sparse_vectors()
    {
        print_spinner();
        dlog << LINFO << "in dotest_sparse_vectors()";

        typedef std::map<unsigned long,double> sample_type;

        typedef sparse_linear_kernel<sample_type> kernel_type;

        svm_rank_trainer<kernel_type> trainer;


        std::vector<ranking_pair<sample_type> > samples;

        ranking_pair<sample_type> p;
        sample_type samp;

        samp[3] = 1; p.relevant.push_back(samp); samp.clear();
        samp[0] = 1; p.nonrelevant.push_back(samp); samp.clear();
        samples.push_back(p);

        samp[2] = 1; p.relevant.push_back(samp); samp.clear();
        samp[0] = 1; p.nonrelevant.push_back(samp); samp.clear();
        samp[1] = 1; p.nonrelevant.push_back(samp); samp.clear();
        samp[1] = 1; p.nonrelevant.push_back(samp); samp.clear();
        samples.push_back(p);


        trainer.set_c(10);

        decision_function<kernel_type> df = trainer.train(samples);

        matrix<double,1,2> res;
        res = 1,1;

        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        DLIB_TEST(equal(test_ranking_function(df, samples), res));

        DLIB_TEST(equal(test_ranking_function(trainer.train(samples[1]), samples), res));

        trainer.set_epsilon(1e-13);
        df = trainer.train(samples);

        dlog << LINFO << sparse_to_dense(df.basis_vectors(0));
        sample_type truew;
        truew[0] = -0.5;
        truew[1] = -0.5;
        truew[2] =  0.5;
        truew[3] =  0.5;
        DLIB_TEST(length(subtract(truew , df.basis_vectors(0))) < 1e-10);

        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        DLIB_TEST(equal(test_ranking_function(df, samples), res));

        dlog << LINFO << "cv-accuracy: "<< cross_validate_ranking_trainer(trainer, samples,2);
        DLIB_TEST(std::abs(cross_validate_ranking_trainer(trainer, samples,2)(0) - 0.7777777778) < 0.0001);

        trainer.set_learns_nonnegative_weights(true);
        df = trainer.train(samples);
        truew[0] =  0.0;
        truew[1] =  0.0;
        truew[2] =  1.0;
        truew[3] =  1.0;
        dlog << LINFO << sparse_to_dense(df.basis_vectors(0));
        DLIB_TEST(length(subtract(truew , df.basis_vectors(0))) < 1e-10);
        dlog << LINFO << "accuracy: "<< test_ranking_function(df, samples);
        DLIB_TEST(equal(test_ranking_function(df, samples), res));


        samples.clear();
        samples.push_back(p);
        samples.push_back(p);
        samples.push_back(p);
        samples.push_back(p);
        dlog << LINFO << "cv-accuracy: "<< cross_validate_ranking_trainer(trainer, samples,4);
        DLIB_TEST(equal(cross_validate_ranking_trainer(trainer, samples,4) , res) );
    }

// ----------------------------------------------------------------------------------------

    template <typename K, bool use_dcd_trainer>
    class simple_rank_trainer
    {
    public:
        template <typename T>
        decision_function<K> train (
            const ranking_pair<T>& pair
        ) const
        {
            typedef matrix<double,10,1> sample_type;

            std::vector<sample_type> relevant = pair.relevant;
            std::vector<sample_type> nonrelevant = pair.nonrelevant;

            std::vector<sample_type> samples;
            std::vector<double> labels;
            for (unsigned long i = 0; i < relevant.size(); ++i)
            {
                for (unsigned long j = 0; j < nonrelevant.size(); ++j)
                {
                    samples.push_back(relevant[i] - nonrelevant[j]);
                    labels.push_back(+1);
                    samples.push_back(nonrelevant[i] - relevant[j]);
                    labels.push_back(-1);
                }
            }

            if (use_dcd_trainer)
            {
                svm_c_linear_dcd_trainer<K> trainer;
                trainer.set_c(1.0/samples.size());
                trainer.set_epsilon(1e-10);
                trainer.force_last_weight_to_1(true);
                //trainer.be_verbose();
                return trainer.train(samples, labels);
            }
            else
            {
                svm_c_linear_trainer<K> trainer;
                trainer.set_c(1.0);
                trainer.set_epsilon(1e-13);
                trainer.force_last_weight_to_1(true);
                //trainer.be_verbose();
                decision_function<K> df = trainer.train(samples, labels);
                DLIB_TEST_MSG(df.b == 0, df.b);
                return df;
            }
        }
    };

    template <bool use_dcd_trainer>
    void test_svmrank_weight_force_dense()
    {
        print_spinner();
        dlog << LINFO << "use_dcd_trainer: "<< use_dcd_trainer;

        typedef matrix<double,10,1> sample_type;
        typedef linear_kernel<sample_type> kernel_type;

        ranking_pair<sample_type> pair;

        for (int i = 0; i < 20; ++i)
        {
            pair.relevant.push_back(abs(gaussian_randm(10,1,i)));
        }

        for (int i = 0; i < 20; ++i)
        {
            pair.nonrelevant.push_back(-abs(gaussian_randm(10,1,i+10000)));
            pair.nonrelevant.back()(9) += 1;
        }


        svm_rank_trainer<kernel_type> trainer;
        trainer.force_last_weight_to_1(true);
        trainer.set_epsilon(1e-13);
        //trainer.be_verbose();
        decision_function<kernel_type> df;
        df = trainer.train(pair);

        matrix<double,1,2> res;
        res = 1,1;
        dlog << LINFO << "weights: "<< trans(df.basis_vectors(0));
        const matrix<double,1,2> acc1 = test_ranking_function(df, pair);
        dlog << LINFO << "ranking accuracy: " << acc1;
        DLIB_TEST(equal(acc1,res));

        simple_rank_trainer<kernel_type,use_dcd_trainer> strainer;
        decision_function<kernel_type> df2;
        df2 = strainer.train(pair);
        dlog << LINFO << "weights: "<< trans(df2.basis_vectors(0));
        const matrix<double,1,2> acc2 = test_ranking_function(df2, pair);
        dlog << LINFO << "ranking accuracy: " << acc2;
        DLIB_TEST(equal(acc2,res));

        dlog << LINFO << "w error: " << max(abs(df.basis_vectors(0) - df2.basis_vectors(0)));
        dlog << LINFO << "b error: " << abs(df.b - df2.b);
        DLIB_TEST(std::abs(max(abs(df.basis_vectors(0) - df2.basis_vectors(0)))) < 1e-8);
        DLIB_TEST(std::abs(abs(df.b - df2.b)) < 1e-8);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class test_ranking_tools : public tester
    {
    public:
        test_ranking_tools (
        ) :
            tester ("test_ranking",
                    "Runs tests on the ranking tools.")
        {}


        void perform_test (
        )
        {
            test_count_ranking_inversions();
            dotest1();
            dotest_sparse_vectors();
            test_svmrank_weight_force_dense<true>();
            test_svmrank_weight_force_dense<false>();
            run_prior_test();
            run_prior_sparse_test();

        }
    } a;


}




