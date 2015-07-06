// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_Hh_
#define DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_Hh_

#include "../array.h"
#include "../graph_cuts/min_cut.h"
#include "svm.h"
#include "cross_validate_graph_labeling_trainer_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename graph_labeler,
        typename graph_type
        >
    matrix<double,1,2> test_graph_labeling_function (
        const graph_labeler& labeler,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const std::vector<std::vector<double> >& losses
    )
    {
#ifdef ENABLE_ASSERTS
        std::string reason_for_failure;
        DLIB_ASSERT(is_graph_labeling_problem(samples, labels, reason_for_failure) ,
            "\t matrix test_graph_labeling_function()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t reason_for_failure: " << reason_for_failure 
            );
        DLIB_ASSERT((losses.size() == 0 || sizes_match(labels, losses) == true) &&
                    all_values_are_nonnegative(losses) == true,
                "\t matrix test_graph_labeling_function()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t labels.size():  " << labels.size() 
                << "\n\t losses.size():  " << losses.size() 
                << "\n\t sizes_match(labels,losses): " << sizes_match(labels,losses) 
                << "\n\t all_values_are_nonnegative(losses): " << all_values_are_nonnegative(losses) 
                 );
#endif

        std::vector<bool> temp;
        double num_pos_correct = 0;
        double num_pos = 0;
        double num_neg_correct = 0;
        double num_neg = 0;

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            labeler(samples[i], temp);

            for (unsigned long j = 0; j < labels[i].size(); ++j)
            {
                // What is the loss for this example?  It's just 1 unless we have a 
                // per example loss vector.
                const double loss = (losses.size() == 0) ? 1.0 : losses[i][j];

                if (labels[i][j])
                {
                    num_pos += loss;
                    if (temp[j])
                        num_pos_correct += loss;
                }
                else
                {
                    num_neg += loss;
                    if (!temp[j])
                        num_neg_correct += loss;
                }
            }
        }

        matrix<double, 1, 2> res;
        if (num_pos != 0)
            res(0) = num_pos_correct/num_pos; 
        else
            res(0) = 1;
        if (num_neg != 0)
            res(1) = num_neg_correct/num_neg; 
        else
            res(1) = 1;
        return res;
    }

    template <
        typename graph_labeler,
        typename graph_type
        >
    matrix<double,1,2> test_graph_labeling_function (
        const graph_labeler& labeler,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels
    )
    {
        std::vector<std::vector<double> > losses;
        return test_graph_labeling_function(labeler, samples, labels, losses);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename graph_type
        >
    matrix<double,1,2> cross_validate_graph_labeling_trainer (
        const trainer_type& trainer,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const std::vector<std::vector<double> >& losses,
        const long folds
    )
    {
#ifdef ENABLE_ASSERTS
        std::string reason_for_failure;
        DLIB_ASSERT(is_graph_labeling_problem(samples, labels, reason_for_failure),
            "\t matrix cross_validate_graph_labeling_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t reason_for_failure: " << reason_for_failure 
            );
        DLIB_ASSERT( 1 < folds && folds <= static_cast<long>(samples.size()),
            "\t matrix cross_validate_graph_labeling_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t folds:  " << folds 
            );
        DLIB_ASSERT((losses.size() == 0 || sizes_match(labels, losses) == true) &&
                    all_values_are_nonnegative(losses) == true,
                "\t matrix cross_validate_graph_labeling_trainer()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t labels.size():  " << labels.size() 
                << "\n\t losses.size():  " << losses.size() 
                << "\n\t sizes_match(labels,losses): " << sizes_match(labels,losses) 
                << "\n\t all_values_are_nonnegative(losses): " << all_values_are_nonnegative(losses) 
                 );
#endif

        typedef std::vector<bool> label_type;

        const long num_in_test  = samples.size()/folds;
        const long num_in_train = samples.size() - num_in_test;


        dlib::array<graph_type> samples_test, samples_train;
        std::vector<label_type> labels_test, labels_train;
        std::vector<std::vector<double> > losses_test, losses_train;


        long next_test_idx = 0;

        std::vector<bool> temp;
        double num_pos_correct = 0;
        double num_pos = 0;
        double num_neg_correct = 0;
        double num_neg = 0;

        graph_type gtemp;

        for (long i = 0; i < folds; ++i)
        {
            samples_test.clear();
            labels_test.clear();
            losses_test.clear();
            samples_train.clear();
            labels_train.clear();
            losses_train.clear();

            // load up the test samples
            for (long cnt = 0; cnt < num_in_test; ++cnt)
            {
                copy_graph(samples[next_test_idx], gtemp);
                samples_test.push_back(gtemp);
                labels_test.push_back(labels[next_test_idx]);
                if (losses.size() != 0)
                    losses_test.push_back(losses[next_test_idx]);
                next_test_idx = (next_test_idx + 1)%samples.size();
            }

            // load up the training samples
            long next = next_test_idx;
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                copy_graph(samples[next], gtemp);
                samples_train.push_back(gtemp);
                labels_train.push_back(labels[next]);
                if (losses.size() != 0)
                    losses_train.push_back(losses[next]);
                next = (next + 1)%samples.size();
            }


            const typename trainer_type::trained_function_type& labeler = trainer.train(samples_train,labels_train,losses_train);

            // check how good labeler is on the test data
            for (unsigned long i = 0; i < samples_test.size(); ++i)
            {
                labeler(samples_test[i], temp);
                for (unsigned long j = 0; j < labels_test[i].size(); ++j)
                {
                    // What is the loss for this example?  It's just 1 unless we have a 
                    // per example loss vector.
                    const double loss = (losses_test.size() == 0) ? 1.0 : losses_test[i][j];

                    if (labels_test[i][j])
                    {
                        num_pos += loss;
                        if (temp[j])
                            num_pos_correct += loss;
                    }
                    else
                    {
                        num_neg += loss;
                        if (!temp[j])
                            num_neg_correct += loss;
                    }
                }
            }

        } // for (long i = 0; i < folds; ++i)


        matrix<double, 1, 2> res;
        if (num_pos != 0)
            res(0) = num_pos_correct/num_pos; 
        else
            res(0) = 1;
        if (num_neg != 0)
            res(1) = num_neg_correct/num_neg; 
        else
            res(1) = 1;
        return res;
    }

    template <
        typename trainer_type,
        typename graph_type
        >
    matrix<double,1,2> cross_validate_graph_labeling_trainer (
        const trainer_type& trainer,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const long folds
    )
    {
        std::vector<std::vector<double> > losses;
        return cross_validate_graph_labeling_trainer(trainer, samples, labels, losses, folds);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_Hh_


