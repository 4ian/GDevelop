// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <ctime>
#include <vector>
#include <dlib/statistics.h>

#include "tester.h"
#include <dlib/svm.h>


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.svr_linear_trainer");

    typedef matrix<double, 0, 1> sample_type;
    typedef std::vector<std::pair<unsigned int, double> > sparse_sample_type;

// ----------------------------------------------------------------------------------------

    double sinc(double x)
    {
        if (x == 0)
            return 1;
        return sin(x)/x;
    }

    template <typename scalar_type>
    void test1()
    {
        typedef matrix<scalar_type,0,1> sample_type;

        typedef radial_basis_kernel<sample_type> kernel_type;

        print_spinner();

        std::vector<sample_type> samples;
        std::vector<scalar_type> targets;

        // The first thing we do is pick a few training points from the sinc() function.
        sample_type m(1);
        for (scalar_type x = -10; x <= 4; x += 1)
        {
            m(0) = x;

            samples.push_back(m);
            targets.push_back(sinc(x)+1.1);
        }

        randomize_samples(samples, targets);

        empirical_kernel_map<kernel_type> ekm;
        ekm.load(kernel_type(0.1), samples);

        for (unsigned long i = 0; i < samples.size(); ++i)
            samples[i] = ekm.project(samples[i]);

        svr_linear_trainer<linear_kernel<sample_type> > linear_trainer;
        linear_trainer.set_epsilon(0.0001);
        linear_trainer.set_c(30);
        linear_trainer.set_epsilon_insensitivity(0.001);

        matrix<double> res = cross_validate_regression_trainer(linear_trainer, samples, targets, 5);
        dlog << LINFO << "MSE and R-Squared: "<< res;
        DLIB_TEST(res(0) < 1e-4);
        DLIB_TEST(res(1) > 0.99);

        dlib::rand rnd;

        samples.clear();
        targets.clear();
        std::vector<scalar_type> noisefree_targets;
        for (scalar_type x = 0; x <= 5; x += 0.1)
        {
            m(0) = x;
            samples.push_back(matrix_cast<scalar_type>(linpiece(m, linspace(0,5,20))));
            targets.push_back(x*x + rnd.get_random_gaussian());
            noisefree_targets.push_back(x*x);
        }
        linear_trainer.set_learns_nonnegative_weights(true);
        linear_trainer.set_epsilon_insensitivity(1.0);
        decision_function<linear_kernel<sample_type> > df2 = linear_trainer.train(samples, targets);

        print_spinner();
        res = test_regression_function(df2, samples, noisefree_targets);
        dlog << LINFO << "MSE and R-Squared: "<< res;
        DLIB_TEST(res(0) < 0.15);
        DLIB_TEST(res(1) > 0.98);
        DLIB_TEST(df2.basis_vectors.size()==1);
        DLIB_TEST(max(df2.basis_vectors(0)) >= 0);

        linear_trainer.force_last_weight_to_1(true);
        df2 = linear_trainer.train(samples, targets);
        DLIB_TEST(std::abs(df2.basis_vectors(0)(samples[0].size()-1) - 1.0) < 1e-14);

        res = test_regression_function(df2, samples, noisefree_targets);
        dlog << LINFO << "MSE and R-Squared: "<< res;
        DLIB_TEST(res(0) < 0.20);
        DLIB_TEST(res(1) > 0.98);


        // convert into sparse vectors and try it out
        typedef std::vector<std::pair<unsigned long, scalar_type> > sparse_samp;
        std::vector<sparse_samp> ssamples;
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            sparse_samp s;
            for (long j = 0; j < samples[i].size(); ++j)
                s.push_back(make_pair(j,samples[i](j)));
            ssamples.push_back(s);
        }

        svr_linear_trainer<sparse_linear_kernel<sparse_samp> > strainer;
        strainer.set_learns_nonnegative_weights(true);
        strainer.set_epsilon_insensitivity(1.0);
        strainer.set_c(30);
        decision_function<sparse_linear_kernel<sparse_samp> > df;
        df = strainer.train(ssamples, targets);
        res = test_regression_function(df, ssamples, noisefree_targets);
        dlog << LINFO << "MSE and R-Squared: "<< res;
        DLIB_TEST(res(0) < 0.15);
        DLIB_TEST(res(1) > 0.98);
        DLIB_TEST(df2.basis_vectors.size()==1);
        DLIB_TEST(max(sparse_to_dense(df2.basis_vectors(0))) >= 0);
    }


// ----------------------------------------------------------------------------------------

    class tester_svr_linear_trainer : public tester
    {
    public:
        tester_svr_linear_trainer (
        ) :
            tester ("test_svr_linear_trainer",
                    "Runs tests on the svr_linear_trainer.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "TEST double";
            test1<double>();
            dlog << LINFO << "TEST float";
            test1<float>();
        }
    } a;

}



