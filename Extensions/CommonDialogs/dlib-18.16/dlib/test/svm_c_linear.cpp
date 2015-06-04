// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"
#include "checkerboard.h"
#include <dlib/statistics.h>

#include "tester.h"
#include <dlib/svm.h>


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.svm_c_linear");

    typedef matrix<double, 0, 1> sample_type;
    typedef std::vector<std::pair<unsigned int, double> > sparse_sample_type;

// ----------------------------------------------------------------------------------------

    void run_prior_test()
    {
        typedef matrix<double,3,1> sample_type;
        typedef linear_kernel<sample_type> kernel_type;

        svm_c_linear_trainer<kernel_type> trainer;

        std::vector<sample_type> samples;
        std::vector<double> labels;

        sample_type samp;
        samp = 0, 0, 1; samples.push_back(samp); labels.push_back(+1);
        samp = 0, 1, 0; samples.push_back(samp); labels.push_back(-1);

        trainer.set_c(10);
        decision_function<kernel_type> df = trainer.train(samples, labels);

        trainer.set_prior(df);

        samples.clear();
        labels.clear();
        samp = 1, 0, 0; samples.push_back(samp); labels.push_back(+1);
        samp = 0, 1, 0; samples.push_back(samp); labels.push_back(-1);

        df = trainer.train(samples, labels);

        samp = 0, 0, 1; samples.push_back(samp); labels.push_back(+1);
        matrix<double,1,2> rs = test_binary_decision_function(df, samples, labels);
        dlog << LINFO << rs;
        DLIB_TEST(rs(0) == 1);
        DLIB_TEST(rs(1) == 1);

        dlog << LINFO << trans(df.basis_vectors(0));
        DLIB_TEST(df.basis_vectors(0)(0) > 0);
        DLIB_TEST(df.basis_vectors(0)(1) < 0);
        DLIB_TEST(df.basis_vectors(0)(2) > 0);
    }

    void run_prior_sparse_test()
    {
        typedef std::map<unsigned long,double> sample_type;
        typedef sparse_linear_kernel<sample_type> kernel_type;

        svm_c_linear_trainer<kernel_type> trainer;

        std::vector<sample_type> samples;
        std::vector<double> labels;

        sample_type samp;
        samp[0] = 1; samples.push_back(samp); labels.push_back(+1); samp.clear();
        samp[1] = 1; samples.push_back(samp); labels.push_back(-1); samp.clear();

        trainer.set_c(10);
        decision_function<kernel_type> df = trainer.train(samples, labels);

        trainer.set_prior(df);

        samples.clear();
        labels.clear();
        samp[2] = 1; samples.push_back(samp); labels.push_back(+1); samp.clear();
        samp[1] = 1; samples.push_back(samp); labels.push_back(-1); samp.clear();

        df = trainer.train(samples, labels);

        matrix<double,1,2> rs = test_binary_decision_function(df, samples, labels);
        dlog << LINFO << rs;
        DLIB_TEST(rs(0) == 1);
        DLIB_TEST(rs(1) == 1);

        matrix<double,0,1> w = sparse_to_dense(df.basis_vectors(0));
        dlog << LINFO << trans(w);
        DLIB_TEST(w(0) > 0.1);
        DLIB_TEST(w(1) < -0.1);
        DLIB_TEST(w(2) > 0.1);
    }

    void get_simple_points (
        std::vector<sample_type>& samples,
        std::vector<double>& labels
    )
    {
        samples.clear();
        labels.clear();
        sample_type samp(2);

        samp = 0,0;
        samples.push_back(samp);
        labels.push_back(-1);

        samp = 0,1;
        samples.push_back(samp);
        labels.push_back(-1);

        samp = 3,0;
        samples.push_back(samp);
        labels.push_back(+1);

        samp = 3,1;
        samples.push_back(samp);
        labels.push_back(+1);
    }

// ----------------------------------------------------------------------------------------

    void get_simple_points_sparse (
        std::vector<sparse_sample_type>& samples,
        std::vector<double>& labels
    )
    {
        samples.clear();
        labels.clear();
        sparse_sample_type samp;

        samp.push_back(make_pair(0, 0.0));
        samp.push_back(make_pair(1, 0.0));
        samples.push_back(samp);
        labels.push_back(-1);

        samp.clear();
        samp.push_back(make_pair(0, 0.0));
        samp.push_back(make_pair(1, 1.0));
        samples.push_back(samp);
        labels.push_back(-1);

        samp.clear();
        samp.push_back(make_pair(0, 3.0));
        samp.push_back(make_pair(1, 0.0));
        samples.push_back(samp);
        labels.push_back(+1);

        samp.clear();
        samp.push_back(make_pair(0, 3.0));
        samp.push_back(make_pair(1, 1.0));
        samples.push_back(samp);
        labels.push_back(+1);
    }

// ----------------------------------------------------------------------------------------

    void test_sparse (
    )
    {
        print_spinner();
        dlog << LINFO << "test with sparse vectors";
        std::vector<sparse_sample_type> samples;
        std::vector<double> labels;

        sample_type samp;

        get_simple_points_sparse(samples,labels);

        svm_c_linear_trainer<sparse_linear_kernel<sparse_sample_type> > trainer;
        trainer.set_c(1e4);
        //trainer.be_verbose();
        trainer.set_epsilon(1e-11);


        double obj;
        decision_function<sparse_linear_kernel<sparse_sample_type> > df = trainer.train(samples, labels, obj);
        dlog << LDEBUG << "obj: "<< obj;
        DLIB_TEST_MSG(abs(obj - 0.72222222222) < 1e-7, obj);

        DLIB_TEST(abs(df(samples[0]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[1]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[2]) - (1)) < 1e-6);
        DLIB_TEST(abs(df(samples[3]) - (1)) < 1e-6);


        // While we are at it, make sure the krr_trainer works with sparse samples
        krr_trainer<sparse_linear_kernel<sparse_sample_type> > krr;

        df = krr.train(samples, labels);
        DLIB_TEST(abs(df(samples[0]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[1]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[2]) - (1)) < 1e-6);
        DLIB_TEST(abs(df(samples[3]) - (1)) < 1e-6);


        // Now test some of the sparse helper functions
        DLIB_TEST(max_index_plus_one(samples) == 2);
        DLIB_TEST(max_index_plus_one(samples[0]) == 2);

        matrix<double,3,1> m;
        m = 1;
        add_to(m, samples[3]);
        DLIB_TEST(m(0) == 1 + samples[3][0].second);
        DLIB_TEST(m(1) == 1 + samples[3][1].second);
        DLIB_TEST(m(2) == 1);

        m = 1;
        subtract_from(m, samples[3]);
        DLIB_TEST(m(0) == 1 - samples[3][0].second);
        DLIB_TEST(m(1) == 1 - samples[3][1].second);
        DLIB_TEST(m(2) == 1);

        m = 1;
        add_to(m, samples[3], 2);
        DLIB_TEST(m(0) == 1 + 2*samples[3][0].second);
        DLIB_TEST(m(1) == 1 + 2*samples[3][1].second);
        DLIB_TEST(m(2) == 1);

        m = 1;
        subtract_from(m, samples[3], 2);
        DLIB_TEST(m(0) == 1 - 2*samples[3][0].second);
        DLIB_TEST(m(1) == 1 - 2*samples[3][1].second);
        DLIB_TEST(m(2) == 1);

    }

// ----------------------------------------------------------------------------------------

    void test_dense (
    )
    {
        print_spinner();
        dlog << LINFO << "test with dense vectors";
        std::vector<sample_type> samples;
        std::vector<double> labels;

        sample_type samp;

        get_simple_points(samples,labels);

        svm_c_linear_trainer<linear_kernel<sample_type> > trainer;
        trainer.set_c(1e4);
        //trainer.be_verbose();
        trainer.set_epsilon(1e-11);


        double obj;
        decision_function<linear_kernel<sample_type> > df = trainer.train(samples, labels, obj);
        dlog << LDEBUG << "obj: "<< obj;
        DLIB_TEST_MSG(abs(obj - 0.72222222222) < 1e-7, abs(obj - 0.72222222222));
        // There shouldn't be any margin violations since this dataset is so trivial.  So that means the objective
        // should be exactly the squared norm of the decision plane (times 0.5).
        DLIB_TEST_MSG(abs(length_squared(df.basis_vectors(0))*0.5 + df.b*df.b*0.5 - 0.72222222222) < 1e-7, 
                      length_squared(df.basis_vectors(0))*0.5 + df.b*df.b*0.5);

        DLIB_TEST(abs(df(samples[0]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[1]) - (-1)) < 1e-6);
        DLIB_TEST(abs(df(samples[2]) - (1)) < 1e-6);
        DLIB_TEST(abs(df(samples[3]) - (1)) < 1e-6);
    }

// ----------------------------------------------------------------------------------------

    class tester_svm_c_linear : public tester
    {
    public:
        tester_svm_c_linear (
        ) :
            tester ("test_svm_c_linear",
                    "Runs tests on the svm_c_linear_trainer.")
        {}

        void perform_test (
        )
        {
            test_dense();
            test_sparse();
            run_prior_test();
            run_prior_sparse_test();

            // test mixed sparse and dense dot products
            {
                std::map<unsigned int, double> sv;
                matrix<double,0,1> dv(4);

                dv = 1,2,3,4;

                sv[0] = 1;
                sv[3] = 1;


                DLIB_TEST(dot(sv,dv) == 5);
                DLIB_TEST(dot(dv,sv) == 5);
                DLIB_TEST(dot(dv,dv) == 30);
                DLIB_TEST(dot(sv,sv) == 2);

                sv[10] = 9;
                DLIB_TEST(dot(sv,dv) == 5);
            }

            // test mixed sparse dense assignments
            {
                std::map<unsigned int, double> sv, sv2;
                std::vector<std::pair<unsigned int, double> > sv3;
                matrix<double,0,1> dv(4), dv2;

                dv = 1,2,3,4;

                sv[0] = 1;
                sv[3] = 1;


                assign(dv2, dv);

                DLIB_TEST(dv2.size() == 4);
                DLIB_TEST(dv2(0) == 1);
                DLIB_TEST(dv2(1) == 2);
                DLIB_TEST(dv2(2) == 3);
                DLIB_TEST(dv2(3) == 4);

                assign(sv2, dv);
                DLIB_TEST(sv2.size() == 4);
                DLIB_TEST(sv2[0] == 1);
                DLIB_TEST(sv2[1] == 2);
                DLIB_TEST(sv2[2] == 3);
                DLIB_TEST(sv2[3] == 4);

                assign(sv2, sv);
                DLIB_TEST(sv2.size() == 2);
                DLIB_TEST(sv2[0] == 1);
                DLIB_TEST(sv2[1] == 0);
                DLIB_TEST(sv2[2] == 0);
                DLIB_TEST(sv2[3] == 1);

                assign(sv3, sv);
                DLIB_TEST(sv3.size() == 2);
                DLIB_TEST(sv3[0].second == 1);
                DLIB_TEST(sv3[1].second == 1);
                DLIB_TEST(sv3[0].first == 0);
                DLIB_TEST(sv3[1].first == 3);

                assign(sv3, dv);
                DLIB_TEST(sv3.size() == 4);
                DLIB_TEST(sv3[0].second == 1);
                DLIB_TEST(sv3[1].second == 2);
                DLIB_TEST(sv3[2].second == 3);
                DLIB_TEST(sv3[3].second == 4);
                DLIB_TEST(sv3[0].first == 0);
                DLIB_TEST(sv3[1].first == 1);
                DLIB_TEST(sv3[2].first == 2);
                DLIB_TEST(sv3[3].first == 3);

                assign(sv3, sv);
                DLIB_TEST(sv3.size() == 2);
                DLIB_TEST(sv3[0].second == 1);
                DLIB_TEST(sv3[1].second == 1);
                DLIB_TEST(sv3[0].first == 0);
                DLIB_TEST(sv3[1].first == 3);

                sv.clear();
                assign(sv, sv3);
                DLIB_TEST(sv.size() == 2);
                DLIB_TEST(sv[0] == 1);
                DLIB_TEST(sv[1] == 0);
                DLIB_TEST(sv[2] == 0);
                DLIB_TEST(sv[3] == 1);

            }
        }
    } a;

}



