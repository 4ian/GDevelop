// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include "tester.h"
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>


namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.sequence_labeler");

// ----------------------------------------------------------------------------------------

    const unsigned long num_label_states = 3; // the "hidden" states
    const unsigned long num_sample_states = 3;

// ----------------------------------------------------------------------------------------

    struct funny_sequence
    {
        std::vector<unsigned long> item;
        unsigned long size() const { return item.size(); }
    };
    funny_sequence make_funny_sequence(const std::vector<unsigned long>& item)
    {
        funny_sequence temp;
        temp.item = item;
        return temp;
    }

// ----------------------------------------------------------------------------------------

    class feature_extractor
    {
    public:
        typedef funny_sequence sequence_type; 

        unsigned long num_features() const
        {
            return num_label_states*num_label_states + num_label_states*num_sample_states;
        }

        unsigned long order() const 
        { 
            return 1; 
        }

        unsigned long num_labels() const 
        { 
            return num_label_states; 
        }

        template <typename feature_setter, typename EXP>
        void get_features (
            feature_setter& set_feature,
            const sequence_type& x,
            const matrix_exp<EXP>& y,
            unsigned long position
        ) const
        {
            if (y.size() > 1)
                set_feature(y(1)*num_label_states + y(0));

            set_feature(num_label_states*num_label_states +
                        y(0)*num_sample_states + x.item[position]);
        }
    };

    class feature_extractor_partial
    {
    public:
        typedef funny_sequence sequence_type; 

        unsigned long num_features() const
        {
            return num_label_states*num_label_states + num_label_states*num_sample_states;
        }

        unsigned long order() const 
        { 
            return 1; 
        }

        unsigned long num_labels() const 
        { 
            return num_label_states; 
        }

        template <typename feature_setter, typename EXP>
        void get_features (
            feature_setter& set_feature,
            const sequence_type& x,
            const matrix_exp<EXP>& y,
            unsigned long position
        ) const
        {
            if (y.size() > 1)
            {
                set_feature(y(1)*num_label_states + y(0), 0.5);
                set_feature(y(1)*num_label_states + y(0), 0.5);
            }

            set_feature(num_label_states*num_label_states +
                        y(0)*num_sample_states + x.item[position],0.4);
            set_feature(num_label_states*num_label_states +
                        y(0)*num_sample_states + x.item[position],0.6);
        }
    };

    bool called_rejct_labeling = false;
    class feature_extractor2
    {
    public:
        typedef funny_sequence sequence_type; 

        unsigned long num_features() const
        {
            return num_label_states*num_label_states + num_label_states*num_sample_states;
        }

        unsigned long order() const 
        { 
            return 1; 
        }

        unsigned long num_labels() const 
        { 
            return num_label_states; 
        }

        template <typename EXP>
        bool reject_labeling (
            const sequence_type& ,
            const matrix_exp<EXP>& ,
            unsigned long 
        ) const
        {
            called_rejct_labeling = true;
            return false;
        }

        template <typename feature_setter, typename EXP>
        void get_features (
            feature_setter& set_feature,
            const sequence_type& x,
            const matrix_exp<EXP>& y,
            unsigned long position
        ) const
        {
            if (y.size() > 1)
                set_feature(y(1)*num_label_states + y(0));

            set_feature(num_label_states*num_label_states +
                        y(0)*num_sample_states + x.item[position]);
        }
    };

    void serialize(const feature_extractor&, std::ostream&) {}
    void deserialize(feature_extractor&, std::istream&) {}
    void serialize(const feature_extractor2&, std::ostream&) {}
    void deserialize(feature_extractor2&, std::istream&) {}

// ----------------------------------------------------------------------------------------

    void sample_hmm (
        dlib::rand& rnd,
        const matrix<double>& transition_probabilities,
        const matrix<double>& emission_probabilities,
        unsigned long previous_label,
        unsigned long& next_label,
        unsigned long& next_sample
    )
    /*!
        requires
            - previous_label < transition_probabilities.nr()
            - transition_probabilities.nr() == transition_probabilities.nc()
            - transition_probabilities.nr() == emission_probabilities.nr()
            - The rows of transition_probabilities and emission_probabilities must sum to 1.
              (i.e. sum_cols(transition_probabilities) and sum_cols(emission_probabilities)
              must evaluate to vectors of all 1s.)
        ensures
            - This function randomly samples the HMM defined by transition_probabilities
              and emission_probabilities assuming that the previous hidden state
              was previous_label. 
            - The HMM is defined by:
                - P(next_label |previous_label) == transition_probabilities(previous_label, next_label)
                - P(next_sample|next_label)     == emission_probabilities  (next_label,     next_sample)
            - #next_label == the sampled value of the hidden state
            - #next_sample == the sampled value of the observed state
    !*/
    {
        // sample next_label
        double p = rnd.get_random_double();
        for (long c = 0; p >= 0 && c < transition_probabilities.nc(); ++c)
        {
            next_label = c;
            p -= transition_probabilities(previous_label, c);
        }

        // now sample next_sample
        p = rnd.get_random_double();
        for (long c = 0; p >= 0 && c < emission_probabilities.nc(); ++c)
        {
            next_sample = c;
            p -= emission_probabilities(next_label, c);
        }
    }

// ----------------------------------------------------------------------------------------

    void make_dataset (
        const matrix<double>& transition_probabilities,
        const matrix<double>& emission_probabilities,
        std::vector<funny_sequence>& samples,
        std::vector<std::vector<unsigned long> >& labels,
        unsigned long dataset_size
    )
    /*!
        requires
            - transition_probabilities.nr() == transition_probabilities.nc()
            - transition_probabilities.nr() == emission_probabilities.nr()
            - The rows of transition_probabilities and emission_probabilities must sum to 1.
              (i.e. sum_cols(transition_probabilities) and sum_cols(emission_probabilities)
              must evaluate to vectors of all 1s.)
        ensures
            - This function randomly samples a bunch of sequences from the HMM defined by 
              transition_probabilities and emission_probabilities. 
            - The HMM is defined by:
                - The probability of transitioning from hidden state H1 to H2 
                  is given by transition_probabilities(H1,H2).
                - The probability of a hidden state H producing an observed state
                  O is given by emission_probabilities(H,O).
            - #samples.size() == labels.size() == dataset_size
            - for all valid i:
                - #labels[i] is a randomly sampled sequence of hidden states from the
                  given HMM.  #samples[i] is its corresponding randomly sampled sequence
                  of observed states.
    !*/
    {
        samples.clear();
        labels.clear();

        dlib::rand rnd;

        // now randomly sample some labeled sequences from our Hidden Markov Model
        for (unsigned long iter = 0; iter < dataset_size; ++iter)
        {
            const unsigned long sequence_size = rnd.get_random_32bit_number()%20+3;
            std::vector<unsigned long> sample(sequence_size);
            std::vector<unsigned long> label(sequence_size);

            unsigned long previous_label = rnd.get_random_32bit_number()%num_label_states;
            for (unsigned long i = 0; i < sample.size(); ++i)
            {
                unsigned long next_label=0, next_sample=0;
                sample_hmm(rnd, transition_probabilities, emission_probabilities, 
                           previous_label, next_label, next_sample);

                label[i] = next_label;
                sample[i] = next_sample;

                previous_label = next_label;
            }

            samples.push_back(make_funny_sequence(sample));
            labels.push_back(label);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename fe_type>
    void do_test()
    {
        called_rejct_labeling = false;

        matrix<double> transition_probabilities(num_label_states, num_label_states);
        transition_probabilities = 0.05, 0.90, 0.05,
        0.05, 0.05, 0.90,
        0.90, 0.05, 0.05;

        matrix<double> emission_probabilities(num_label_states,num_sample_states);
        emission_probabilities = 0.5, 0.5, 0.0,
        0.0, 0.5, 0.5,
        0.5, 0.0, 0.5;

        print_spinner();


        std::vector<funny_sequence> samples;
        std::vector<std::vector<unsigned long> > labels;
        make_dataset(transition_probabilities,emission_probabilities, 
                     samples, labels, 1000);

        dlog << LINFO << "samples.size(): "<< samples.size();

        // print out some of the randomly sampled sequences
        for (int i = 0; i < 10; ++i)
        {
            dlog << LINFO << "hidden states:   " << trans(vector_to_matrix(labels[i]));
            dlog << LINFO << "observed states: " << trans(vector_to_matrix(samples[i].item));
            dlog << LINFO << "******************************";
        }

        print_spinner();
        structural_sequence_labeling_trainer<fe_type> trainer;
        trainer.set_c(4);
        DLIB_TEST(trainer.get_c() == 4);
        trainer.set_num_threads(4);
        DLIB_TEST(trainer.get_num_threads() == 4);



        // Learn to do sequence labeling from the dataset
        sequence_labeler<fe_type> labeler = trainer.train(samples, labels);

        std::vector<unsigned long> predicted_labels = labeler(samples[0]);
        dlog << LINFO << "true hidden states:      "<< trans(vector_to_matrix(labels[0]));
        dlog << LINFO << "predicted hidden states: "<< trans(vector_to_matrix(predicted_labels));

        DLIB_TEST(vector_to_matrix(labels[0]) == vector_to_matrix(predicted_labels));


        print_spinner();


        // We can also do cross-validation 
        matrix<double> confusion_matrix;
        confusion_matrix = cross_validate_sequence_labeler(trainer, samples, labels, 4);
        dlog << LINFO << "cross-validation: ";
        dlog << LINFO << confusion_matrix;
        double accuracy = sum(diag(confusion_matrix))/sum(confusion_matrix);
        dlog << LINFO << "label accuracy: "<< accuracy;
        DLIB_TEST(std::abs(accuracy - 0.882) < 0.01);

        print_spinner();


        matrix<double,0,1> true_hmm_model_weights = log(join_cols(reshape_to_column_vector(transition_probabilities),
                                                                  reshape_to_column_vector(emission_probabilities)));

        sequence_labeler<fe_type> labeler_true(true_hmm_model_weights); 

        confusion_matrix = test_sequence_labeler(labeler_true, samples, labels);
        dlog << LINFO << "True HMM model: ";
        dlog << LINFO << confusion_matrix;
        accuracy = sum(diag(confusion_matrix))/sum(confusion_matrix);
        dlog << LINFO << "label accuracy: "<< accuracy;
        DLIB_TEST(std::abs(accuracy - 0.882) < 0.01);



        print_spinner();




        // Finally, the labeler can be serialized to disk just like most dlib objects.
        ostringstream sout;
        serialize(labeler, sout);

        sequence_labeler<fe_type> labeler2;
        // recall from disk
        istringstream sin(sout.str());
        deserialize(labeler2, sin);
        confusion_matrix = test_sequence_labeler(labeler2, samples, labels);
        dlog << LINFO << "deserialized labeler: ";
        dlog << LINFO << confusion_matrix;
        accuracy = sum(diag(confusion_matrix))/sum(confusion_matrix);
        dlog << LINFO << "label accuracy: "<< accuracy;
        DLIB_TEST(std::abs(accuracy - 0.882) < 0.01);
    }

// ----------------------------------------------------------------------------------------

    void test2()
    {
        /*
            The point of this test is to make sure calling set_feature() multiple
            times works the way it is supposed to.
        */

        print_spinner();
        std::vector<funny_sequence> samples;
        std::vector<std::vector<unsigned long> > labels;

        matrix<double> transition_probabilities(num_label_states, num_label_states);
        transition_probabilities = 0.05, 0.90, 0.05,
        0.05, 0.05, 0.90,
        0.90, 0.05, 0.05;

        matrix<double> emission_probabilities(num_label_states,num_sample_states);
        emission_probabilities = 0.5, 0.5, 0.0,
        0.0, 0.5, 0.5,
        0.5, 0.0, 0.5;


        make_dataset(transition_probabilities,emission_probabilities, 
                     samples, labels, 1000);

        dlog << LINFO << "samples.size(): "<< samples.size();

        structural_sequence_labeling_trainer<feature_extractor> trainer;
        structural_sequence_labeling_trainer<feature_extractor_partial> trainer_part;
        trainer.set_c(4);
        trainer_part.set_c(4);
        trainer.set_num_threads(4);
        trainer_part.set_num_threads(4);



        // Learn to do sequence labeling from the dataset
        sequence_labeler<feature_extractor> labeler = trainer.train(samples, labels);
        sequence_labeler<feature_extractor_partial> labeler_part = trainer_part.train(samples, labels);

        // Both feature extractors should be equivalent.
        DLIB_TEST(length(labeler.get_weights() - labeler_part.get_weights()) < 1e-10);

    }

// ----------------------------------------------------------------------------------------

    class sequence_labeler_tester : public tester
    {
    public:
        sequence_labeler_tester (
        ) :
            tester ("test_sequence_labeler",
                    "Runs tests on the sequence labeling code.")
        {}

        void perform_test (
        )
        {
            do_test<feature_extractor>();
            DLIB_TEST(called_rejct_labeling == false);
            do_test<feature_extractor2>();
            DLIB_TEST(called_rejct_labeling == true);

            test2();
        }
    } a;

}


