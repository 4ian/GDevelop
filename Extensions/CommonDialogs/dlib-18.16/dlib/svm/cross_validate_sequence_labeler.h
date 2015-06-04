// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_Hh_
#define DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_Hh_

#include "cross_validate_sequence_labeler_abstract.h"
#include <vector>
#include "../matrix.h"
#include "svm.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_labeler_type,
        typename sequence_type 
        >
    const matrix<double> test_sequence_labeler (
        const sequence_labeler_type& labeler,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_sequence_labeling_problem(samples, labels) == true,
                    "\tmatrix test_sequence_labeler()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_sequence_labeling_problem(samples, labels): " 
                    << is_sequence_labeling_problem(samples, labels));

        matrix<double> res(labeler.num_labels(), labeler.num_labels());
        res = 0;

        std::vector<unsigned long> pred;
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            labeler.label_sequence(samples[i], pred);

            for (unsigned long j = 0; j < pred.size(); ++j)
            {
                const unsigned long truth = labels[i][j];
                if (truth >= static_cast<unsigned long>(res.nr()))
                {
                    // ignore labels the labeler doesn't know about.
                    continue;
                }

                res(truth, pred[j]) += 1;
            }
        }

        return res;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sequence_type
        >
    const matrix<double> cross_validate_sequence_labeler (
        const trainer_type& trainer,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels,
        const long folds
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_sequence_labeling_problem(samples,labels) == true &&
                    1 < folds && folds <= static_cast<long>(samples.size()),
            "\tmatrix cross_validate_sequence_labeler()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t folds:  " << folds 
            << "\n\t is_sequence_labeling_problem(samples,labels): " << is_sequence_labeling_problem(samples,labels)
            );

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < labels.size(); ++i)
        {
            for (unsigned long j = 0; j < labels[i].size(); ++j)
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(labels[i][j] < trainer.num_labels(),
                            "\t matrix cross_validate_sequence_labeler()"
                            << "\n\t The labels are invalid."
                            << "\n\t labels[i][j]: " << labels[i][j] 
                            << "\n\t trainer.num_labels(): " << trainer.num_labels()
                            << "\n\t i: " << i 
                            << "\n\t j: " << j 
                );
            }
        }
#endif




        const long num_in_test = samples.size()/folds;
        const long num_in_train = samples.size() - num_in_test;

        std::vector<sequence_type> x_test, x_train;
        std::vector<std::vector<unsigned long> > y_test, y_train;


        long next_test_idx = 0;

        matrix<double> res;


        for (long i = 0; i < folds; ++i)
        {
            x_test.clear();
            y_test.clear();
            x_train.clear();
            y_train.clear();

            // load up the test samples
            for (long cnt = 0; cnt < num_in_test; ++cnt)
            {
                x_test.push_back(samples[next_test_idx]);
                y_test.push_back(labels[next_test_idx]);
                next_test_idx = (next_test_idx + 1)%samples.size();
            }

            // load up the training samples
            long next = next_test_idx;
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                x_train.push_back(samples[next]);
                y_train.push_back(labels[next]);
                next = (next + 1)%samples.size();
            }


            res += test_sequence_labeler(trainer.train(x_train,y_train), x_test, y_test);

        } // for (long i = 0; i < folds; ++i)

        return res;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_Hh_


