// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include "tester.h"
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>


typedef dlib::matrix<double,3,1> lhs_element;
typedef dlib::matrix<double,3,1> rhs_element;

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.assignment_learning");

// ----------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------------------

    struct feature_extractor_dense
    {
        typedef matrix<double,3,1> feature_vector_type;

        typedef ::lhs_element lhs_element;
        typedef ::rhs_element rhs_element;

        unsigned long num_features() const
        {
            return 3;
        }

        void get_features (
            const lhs_element& left,
            const rhs_element& right,
            feature_vector_type& feats
        ) const
        {
            feats = squared(left - right);
        }

    };

    void serialize   (const feature_extractor_dense& , std::ostream& ) {}
    void deserialize (feature_extractor_dense&       , std::istream& ) {}

// ----------------------------------------------------------------------------------------

    struct feature_extractor_sparse
    {
        typedef std::vector<std::pair<unsigned long,double> > feature_vector_type;

        typedef ::lhs_element lhs_element;
        typedef ::rhs_element rhs_element;

        unsigned long num_features() const
        {
            return 3;
        }

        void get_features (
            const lhs_element& left,
            const rhs_element& right,
            feature_vector_type& feats
        ) const
        {
            feats.clear();
            feats.push_back(make_pair(0,squared(left-right)(0)));
            feats.push_back(make_pair(1,squared(left-right)(1)));
            feats.push_back(make_pair(2,squared(left-right)(2)));
        }

    };

    void serialize   (const feature_extractor_sparse& , std::ostream& ) {}
    void deserialize (feature_extractor_sparse&       , std::istream& ) {}

// ----------------------------------------------------------------------------------------

    typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;
    typedef std::vector<long> label_type;

// ----------------------------------------------------------------------------------------

    void make_data (
        std::vector<sample_type>& samples,
        std::vector<label_type>& labels
    )
    {
        lhs_element a, b, c, d;
        a = 1,0,0;
        b = 0,1,0;
        c = 0,0,1;
        d = 0,1,1;

        std::vector<lhs_element> lhs;
        std::vector<rhs_element> rhs;
        label_type label;

        lhs.push_back(a);
        lhs.push_back(b);
        lhs.push_back(c);

        rhs.push_back(b);
        rhs.push_back(a);
        rhs.push_back(c);

        label.push_back(1);
        label.push_back(0);
        label.push_back(2);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);




        lhs.clear();
        rhs.clear();
        label.clear();

        lhs.push_back(a);
        lhs.push_back(b);
        lhs.push_back(c);

        rhs.push_back(c);
        rhs.push_back(b);
        rhs.push_back(a);
        rhs.push_back(d);

        label.push_back(2);
        label.push_back(1);
        label.push_back(0);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);


        lhs.clear();
        rhs.clear();
        label.clear();

        lhs.push_back(a);
        lhs.push_back(b);
        lhs.push_back(c);

        rhs.push_back(c);
        rhs.push_back(a);
        rhs.push_back(d);

        label.push_back(1);
        label.push_back(-1);
        label.push_back(0);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);



        lhs.clear();
        rhs.clear();
        label.clear();

        lhs.push_back(d);
        lhs.push_back(b);
        lhs.push_back(c);

        label.push_back(-1);
        label.push_back(-1);
        label.push_back(-1);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);



        lhs.clear();
        rhs.clear();
        label.clear();

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);

    }

// ----------------------------------------------------------------------------------------

    void make_data_force (
        std::vector<sample_type>& samples,
        std::vector<label_type>& labels
    )
    {
        lhs_element a, b, c, d;
        a = 1,0,0;
        b = 0,1,0;
        c = 0,0,1;
        d = 0,1,1;

        std::vector<lhs_element> lhs;
        std::vector<rhs_element> rhs;
        label_type label;

        lhs.push_back(a);
        lhs.push_back(b);
        lhs.push_back(c);

        rhs.push_back(b);
        rhs.push_back(a);
        rhs.push_back(c);

        label.push_back(1);
        label.push_back(0);
        label.push_back(2);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);




        lhs.clear();
        rhs.clear();
        label.clear();

        lhs.push_back(a);
        lhs.push_back(b);
        lhs.push_back(c);

        rhs.push_back(c);
        rhs.push_back(b);
        rhs.push_back(a);
        rhs.push_back(d);

        label.push_back(2);
        label.push_back(1);
        label.push_back(0);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);


        lhs.clear();
        rhs.clear();
        label.clear();

        lhs.push_back(a);
        lhs.push_back(c);

        rhs.push_back(c);
        rhs.push_back(a);

        label.push_back(1);
        label.push_back(0);

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);





        lhs.clear();
        rhs.clear();
        label.clear();

        samples.push_back(make_pair(lhs,rhs));
        labels.push_back(label);

    }

// ----------------------------------------------------------------------------------------

    template <typename fe_type, typename F>
    void test1(F make_data, bool force_assignment)
    {
        print_spinner();

        std::vector<sample_type> samples;
        std::vector<label_type> labels;

        make_data(samples, labels);
        make_data(samples, labels);
        make_data(samples, labels);

        randomize_samples(samples, labels);

        structural_assignment_trainer<fe_type> trainer;

        DLIB_TEST(trainer.forces_assignment() == false);
        DLIB_TEST(trainer.get_c() == 100);
        DLIB_TEST(trainer.get_num_threads() == 2);
        DLIB_TEST(trainer.get_max_cache_size() == 5);


        trainer.set_forces_assignment(force_assignment);
        trainer.set_num_threads(3);
        trainer.set_c(50);

        DLIB_TEST(trainer.get_c() == 50);
        DLIB_TEST(trainer.get_num_threads() == 3);
        DLIB_TEST(trainer.forces_assignment() == force_assignment);

        assignment_function<fe_type> ass = trainer.train(samples, labels);

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            std::vector<long> out = ass(samples[i]);
            dlog << LINFO << "true labels: " << trans(mat(labels[i]));
            dlog << LINFO << "pred labels: " << trans(mat(out));
            DLIB_TEST(trans(mat(labels[i])) == trans(mat(out)));
        }

        double accuracy;

        dlog << LINFO << "samples.size(): "<< samples.size();
        accuracy = test_assignment_function(ass, samples, labels);
        dlog << LINFO << "accuracy: "<< accuracy;
        DLIB_TEST(accuracy == 1);

        accuracy = cross_validate_assignment_trainer(trainer, samples, labels, 3);
        dlog << LINFO << "cv accuracy: "<< accuracy;
        DLIB_TEST(accuracy == 1);

        ostringstream sout;
        serialize(ass, sout);
        istringstream sin(sout.str());
        assignment_function<fe_type> ass2;
        deserialize(ass2, sin);

        DLIB_TEST(ass2.forces_assignment() == ass.forces_assignment());
        DLIB_TEST(length(ass2.get_weights() - ass.get_weights()) < 1e-10);

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            std::vector<long> out = ass2(samples[i]);
            dlog << LINFO << "true labels: " << trans(mat(labels[i]));
            dlog << LINFO << "pred labels: " << trans(mat(out));
            DLIB_TEST(trans(mat(labels[i])) == trans(mat(out)));
        }
    }

// ----------------------------------------------------------------------------------------

    class test_assignment_learning : public tester
    {
    public:
        test_assignment_learning (
        ) :
            tester ("test_assignment_learning",
                    "Runs tests on the assignment learning code.")
        {}

        void perform_test (
        )
        {
            test1<feature_extractor_dense>(make_data, false);
            test1<feature_extractor_sparse>(make_data, false);

            test1<feature_extractor_dense>(make_data_force, false);
            test1<feature_extractor_sparse>(make_data_force, false);
            test1<feature_extractor_dense>(make_data_force, true);
            test1<feature_extractor_sparse>(make_data_force, true);
        }
    } a;

// ----------------------------------------------------------------------------------------

}


