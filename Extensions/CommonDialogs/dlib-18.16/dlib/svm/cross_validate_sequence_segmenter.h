// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_Hh_
#define DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_Hh_

#include "cross_validate_sequence_segmenter_abstract.h"
#include "sequence_segmenter.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename sequence_segmenter_type,
            typename sequence_type 
            >
        const matrix<double,1,3> raw_metrics_test_sequence_segmenter (
            const sequence_segmenter_type& segmenter,
            const std::vector<sequence_type>& samples,
            const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments 
        )
        {
            std::vector<std::pair<unsigned long,unsigned long> > truth;
            std::vector<std::pair<unsigned long,unsigned long> > pred;

            double true_hits = 0;
            double total_detections = 0;
            double total_true_segments = 0;

            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                segmenter.segment_sequence(samples[i], pred);
                truth = segments[i];
                // sort the segments so they will be in the same orders
                std::sort(truth.begin(), truth.end());
                std::sort(pred.begin(), pred.end());

                total_true_segments += truth.size();
                total_detections += pred.size();

                unsigned long j=0,k=0;
                while (j < pred.size() && k < truth.size())
                {
                    if (pred[j].first == truth[k].first && 
                        pred[j].second == truth[k].second)
                    {
                        ++true_hits;
                        ++j;
                        ++k;
                    }
                    else if (pred[j].first < truth[k].first)
                    {
                        ++j;
                    }
                    else
                    {
                        ++k;
                    }
                }
            }

            matrix<double,1,3> res;
            res = total_detections, total_true_segments, true_hits;
            return res;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_segmenter_type,
        typename sequence_type 
        >
    const matrix<double,1,3> test_sequence_segmenter (
        const sequence_segmenter_type& segmenter,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_sequence_segmentation_problem(samples, segments) == true,
                    "\tmatrix test_sequence_segmenter()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_sequence_segmentation_problem(samples, segments): " 
                    << is_sequence_segmentation_problem(samples, segments));

        const matrix<double,1,3> metrics = impl::raw_metrics_test_sequence_segmenter(segmenter, samples, segments);

        const double total_detections    = metrics(0);
        const double total_true_segments = metrics(1);
        const double true_hits           = metrics(2);
        
        const double precision = (total_detections   ==0) ? 1 : true_hits/total_detections;
        const double recall    = (total_true_segments==0) ? 1 : true_hits/total_true_segments;
        const double f1        = (precision+recall   ==0) ? 0 : 2*precision*recall/(precision+recall);

        matrix<double,1,3> res;
        res = precision, recall, f1;
        return res;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sequence_type 
        >
    const matrix<double,1,3> cross_validate_sequence_segmenter (
        const trainer_type& trainer,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments,
        const long folds
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_sequence_segmentation_problem(samples, segments) == true &&
                    1 < folds && folds <= static_cast<long>(samples.size()),
                    "\tmatrix cross_validate_sequence_segmenter()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t folds:  " << folds 
                    << "\n\t is_sequence_segmentation_problem(samples, segments): " 
                    << is_sequence_segmentation_problem(samples, segments));


        const long num_in_test = samples.size()/folds;
        const long num_in_train = samples.size() - num_in_test;

        std::vector<sequence_type> x_test, x_train;
        std::vector<std::vector<std::pair<unsigned long,unsigned long> > > y_test, y_train;

        long next_test_idx = 0;

        matrix<double,1,3> metrics;
        metrics = 0;

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
                y_test.push_back(segments[next_test_idx]);
                next_test_idx = (next_test_idx + 1)%samples.size();
            }

            // load up the training samples
            long next = next_test_idx;
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                x_train.push_back(samples[next]);
                y_train.push_back(segments[next]);
                next = (next + 1)%samples.size();
            }


            metrics += impl::raw_metrics_test_sequence_segmenter(trainer.train(x_train,y_train), x_test, y_test);
        } // for (long i = 0; i < folds; ++i)


        const double total_detections    = metrics(0);
        const double total_true_segments = metrics(1);
        const double true_hits           = metrics(2);
        
        const double precision = (total_detections   ==0) ? 1 : true_hits/total_detections;
        const double recall    = (total_true_segments==0) ? 1 : true_hits/total_true_segments;
        const double f1        = (precision+recall   ==0) ? 0 : 2*precision*recall/(precision+recall);

        matrix<double,1,3> res;
        res = precision, recall, f1;
        return res;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_Hh_


