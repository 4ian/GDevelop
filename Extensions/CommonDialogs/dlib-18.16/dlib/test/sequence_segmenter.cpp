// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include "tester.h"
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>


namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.sequence_segmenter");

// ----------------------------------------------------------------------------------------

    dlib::rand rnd;

    template <bool use_BIO_model_, bool use_high_order_features_, bool allow_negative_weights_>
    class unigram_extractor
    {
    public:

        const static bool use_BIO_model = use_BIO_model_;
        const static bool use_high_order_features = use_high_order_features_;
        const static bool allow_negative_weights = allow_negative_weights_;

        typedef std::vector<unsigned long> sequence_type; 

        std::map<unsigned long, matrix<double,0,1> > feats;

        unigram_extractor()
        {
            matrix<double,0,1> v1, v2, v3;
            v1 = randm(num_features(), 1, rnd);
            v2 = randm(num_features(), 1, rnd);
            v3 = randm(num_features(), 1, rnd);
            v1(0) = 1;
            v2(1) = 1;
            v3(2) = 1;
            v1(3) = -1;
            v2(4) = -1;
            v3(5) = -1;
            for (unsigned long i = 0; i < num_features(); ++i)
            {
                if ( i < 3)
                    feats[i] = v1;
                else if (i < 6)
                    feats[i] = v2;
                else
                    feats[i] = v3;
            }
        }

        unsigned long num_features() const { return 10; }
        unsigned long window_size() const { return 3; }

        template <typename feature_setter>
        void get_features (
            feature_setter& set_feature,
            const sequence_type& x,
            unsigned long position
        ) const
        {
            const matrix<double,0,1>& m = feats.find(x[position])->second;
            for (unsigned long i = 0; i < num_features(); ++i)
            {
                set_feature(i, m(i));
            }
        }

    };

    template <bool use_BIO_model_, bool use_high_order_features_, bool neg>
    void serialize(const unigram_extractor<use_BIO_model_,use_high_order_features_,neg>& item , std::ostream& out )
    {
        serialize(item.feats, out);
    }

    template <bool use_BIO_model_, bool use_high_order_features_, bool neg>
    void deserialize(unigram_extractor<use_BIO_model_,use_high_order_features_,neg>& item, std::istream& in)
    {
        deserialize(item.feats, in);
    }

// ----------------------------------------------------------------------------------------

    void make_dataset (
        std::vector<std::vector<unsigned long> >& samples,
        std::vector<std::vector<unsigned long> >& labels,
        unsigned long dataset_size
    )
    {
        samples.clear();
        labels.clear();

        samples.resize(dataset_size);
        labels.resize(dataset_size);


        unigram_extractor<true,true,true> fe;
        dlib::rand rnd;

        for (unsigned long iter = 0; iter < dataset_size; ++iter)
        {

            samples[iter].resize(10);
            labels[iter].resize(10);

            for (unsigned long i = 0; i < samples[iter].size(); ++i)
            {
                samples[iter][i] = rnd.get_random_32bit_number()%fe.num_features();
                if (samples[iter][i] < 3)
                {
                    labels[iter][i] = impl_ss::BEGIN;
                }
                else if (samples[iter][i] < 6)
                {
                    labels[iter][i] = impl_ss::INSIDE;
                }
                else
                {
                    labels[iter][i] = impl_ss::OUTSIDE;
                }

                if (i != 0)
                {
                    // do rejection sampling to avoid impossible labels
                    if (labels[iter][i] == impl_ss::INSIDE &&
                        labels[iter][i-1] == impl_ss::OUTSIDE)
                    {
                        --i;
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void make_dataset2 (
        std::vector<std::vector<unsigned long> >& samples,
        std::vector<std::vector<std::pair<unsigned long, unsigned long> > >& segments,
        unsigned long dataset_size
    )
    {
        segments.clear();
        std::vector<std::vector<unsigned long> > labels;
        make_dataset(samples, labels, dataset_size);
        segments.resize(samples.size());

        // Convert from BIO tagging to the explicit segments representation.
        for (unsigned long k = 0; k < labels.size(); ++k)
        {
            for (unsigned long i = 0; i < labels[k].size(); ++i)
            {
                if (labels[k][i] == impl_ss::BEGIN)
                {
                    const unsigned long begin = i;
                    ++i;
                    while (i < labels[k].size() && labels[k][i] == impl_ss::INSIDE)
                        ++i;

                    segments[k].push_back(std::make_pair(begin, i));
                    --i;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <bool use_BIO_model, bool use_high_order_features, bool allow_negative_weights>
    void do_test()
    {
        dlog << LINFO << "use_BIO_model: "<< use_BIO_model;
        dlog << LINFO << "use_high_order_features: "<< use_high_order_features;
        dlog << LINFO << "allow_negative_weights: "<< allow_negative_weights;

        std::vector<std::vector<unsigned long> > samples;
        std::vector<std::vector<std::pair<unsigned long,unsigned long> > > segments;
        make_dataset2( samples, segments, 100);

        print_spinner();
        typedef unigram_extractor<use_BIO_model,use_high_order_features,allow_negative_weights> fe_type;

        fe_type fe_temp;
        fe_type fe_temp2;
        structural_sequence_segmentation_trainer<fe_type> trainer(fe_temp2);
        trainer.set_c(5);
        trainer.set_num_threads(1);


        sequence_segmenter<fe_type> labeler = trainer.train(samples, segments);

        print_spinner();

        const std::vector<std::pair<unsigned long, unsigned long> > predicted_labels = labeler(samples[1]);
        const std::vector<std::pair<unsigned long, unsigned long> > true_labels = segments[1];
        /*
        for (unsigned long i = 0; i < predicted_labels.size(); ++i)
            cout << "["<<predicted_labels[i].first<<","<<predicted_labels[i].second<<") ";
        cout << endl;
        for (unsigned long i = 0; i < true_labels.size(); ++i)
            cout << "["<<true_labels[i].first<<","<<true_labels[i].second<<") ";
        cout << endl;
        */

        DLIB_TEST(predicted_labels.size() > 0);
        DLIB_TEST(predicted_labels.size() == true_labels.size());
        for (unsigned long i = 0; i < predicted_labels.size(); ++i)
        {
            DLIB_TEST(predicted_labels[i].first == true_labels[i].first);
            DLIB_TEST(predicted_labels[i].second == true_labels[i].second);
        }


        matrix<double> res;

        res = cross_validate_sequence_segmenter(trainer, samples, segments, 3);
        dlog << LINFO << "cv res:   "<< res;
        DLIB_TEST(min(res) > 0.98);
        make_dataset2( samples, segments, 100);
        res = test_sequence_segmenter(labeler, samples, segments);
        dlog << LINFO << "test res: "<< res;
        DLIB_TEST(min(res) > 0.98);

        print_spinner();

        ostringstream sout;
        serialize(labeler, sout);
        istringstream sin(sout.str());
        sequence_segmenter<fe_type> labeler2;
        deserialize(labeler2, sin);

        res = test_sequence_segmenter(labeler2, samples, segments);
        dlog << LINFO << "test res2: "<< res;
        DLIB_TEST(min(res) > 0.98);

        long N;
        if (use_BIO_model)
            N = 3*3+3;
        else
            N = 5*5+5;
        const double min_normal_weight = min(colm(labeler2.get_weights(), 0, labeler2.get_weights().size()-N));
        const double min_trans_weight = min(labeler2.get_weights());
        dlog << LINFO << "min_normal_weight: " << min_normal_weight;
        dlog << LINFO << "min_trans_weight:  " << min_trans_weight;
        if (allow_negative_weights)
        {
            DLIB_TEST(min_normal_weight < 0);
            DLIB_TEST(min_trans_weight < 0);
        }
        else
        {
            DLIB_TEST(min_normal_weight == 0);
            DLIB_TEST(min_trans_weight < 0);
        }
    }

// ----------------------------------------------------------------------------------------


    class unit_test_sequence_segmenter : public tester
    {
    public:
        unit_test_sequence_segmenter (
        ) :
            tester ("test_sequence_segmenter",
                "Runs tests on the sequence segmenting code.")
        {}

        void perform_test (
        )
        {
            do_test<true,true,false>();
            do_test<true,false,false>();
            do_test<false,true,false>();
            do_test<false,false,false>();
            do_test<true,true,true>();
            do_test<true,false,true>();
            do_test<false,true,true>();
            do_test<false,false,true>();
        }
    } a;

}



