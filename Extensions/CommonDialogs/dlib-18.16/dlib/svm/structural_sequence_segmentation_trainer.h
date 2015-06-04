// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_Hh_
#define DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_Hh_

#include "structural_sequence_segmentation_trainer_abstract.h"
#include "structural_sequence_labeling_trainer.h"
#include "sequence_segmenter.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_sequence_segmentation_trainer
    {
    public:
        typedef typename feature_extractor::sequence_type sample_sequence_type;
        typedef std::vector<std::pair<unsigned long, unsigned long> > segmented_sequence_type;

        typedef sequence_segmenter<feature_extractor> trained_function_type;

        explicit structural_sequence_segmentation_trainer (
            const feature_extractor& fe_
        ) : trainer(impl_ss::feature_extractor<feature_extractor>(fe_))
        {
            loss_per_missed_segment = 1;
            loss_per_false_alarm = 1;
        }

        structural_sequence_segmentation_trainer (
        )
        {
            loss_per_missed_segment = 1;
            loss_per_false_alarm = 1;
        }

        const feature_extractor& get_feature_extractor (
        ) const { return trainer.get_feature_extractor().fe; }

        void set_num_threads (
            unsigned long num
        )
        {
            trainer.set_num_threads(num);
        }

        unsigned long get_num_threads (
        ) const
        {
            return trainer.get_num_threads();
        }

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_sequence_segmentation_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            trainer.set_epsilon(eps_);
        }

        double get_epsilon (
        ) const { return trainer.get_epsilon(); }

        unsigned long get_max_iterations (
        ) const { return trainer.get_max_iterations(); }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            trainer.set_max_iterations(max_iter);
        }

        void set_max_cache_size (
            unsigned long max_size
        )
        {
            trainer.set_max_cache_size(max_size);
        }

        unsigned long get_max_cache_size (
        ) const
        {
            return trainer.get_max_cache_size();
        }

        void be_verbose (
        )
        {
            trainer.be_verbose();
        }

        void be_quiet (
        )
        {
            trainer.be_quiet();
        }

        void set_oca (
            const oca& item
        )
        {
            trainer.set_oca(item);
        }

        const oca get_oca (
        ) const
        {
            return trainer.get_oca();
        }

        void set_c (
            double C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void structural_sequence_segmentation_trainer::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            trainer.set_c(C_);
        }

        double get_c (
        ) const
        {
            return trainer.get_c();
        }

        void set_loss_per_missed_segment (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0,
                        "\t void structural_sequence_segmentation_trainer::set_loss_per_missed_segment(loss)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t loss: " << loss
                        << "\n\t this: " << this
            );

            loss_per_missed_segment = loss;

            if (feature_extractor::use_BIO_model)
            {
                trainer.set_loss(impl_ss::BEGIN,  loss_per_missed_segment);
                trainer.set_loss(impl_ss::INSIDE, loss_per_missed_segment);
            }
            else
            {
                trainer.set_loss(impl_ss::BEGIN,  loss_per_missed_segment);
                trainer.set_loss(impl_ss::INSIDE, loss_per_missed_segment);
                trainer.set_loss(impl_ss::LAST,   loss_per_missed_segment);
                trainer.set_loss(impl_ss::UNIT,   loss_per_missed_segment);
            }
        }

        double get_loss_per_missed_segment (
        ) const
        {
            return loss_per_missed_segment;
        }

        void set_loss_per_false_alarm (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0,
                        "\t void structural_sequence_segmentation_trainer::set_loss_per_false_alarm(loss)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t loss: " << loss
                        << "\n\t this: " << this
            );

            loss_per_false_alarm = loss;

            trainer.set_loss(impl_ss::OUTSIDE,  loss_per_false_alarm);
        }

        double get_loss_per_false_alarm (
        ) const
        {
            return loss_per_false_alarm;
        }

        const sequence_segmenter<feature_extractor> train(
            const std::vector<sample_sequence_type>& x,
            const std::vector<segmented_sequence_type>& y
        ) const
        {

            // make sure requires clause is not broken
            DLIB_ASSERT(is_sequence_segmentation_problem(x,y) == true,
                        "\t sequence_segmenter structural_sequence_segmentation_trainer::train(x,y)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t x.size(): " << x.size() 
                        << "\n\t is_sequence_segmentation_problem(x,y): " << is_sequence_segmentation_problem(x,y)
                        << "\n\t this: " << this
            );

            std::vector<std::vector<unsigned long> > labels(y.size());
            if (feature_extractor::use_BIO_model)
            {
                // convert y into tagged BIO labels
                for (unsigned long i = 0; i < labels.size(); ++i)
                {
                    labels[i].resize(x[i].size(), impl_ss::OUTSIDE);
                    for (unsigned long j = 0; j < y[i].size(); ++j)
                    {
                        const unsigned long begin = y[i][j].first;
                        const unsigned long end = y[i][j].second;
                        if (begin != end)
                        {
                            labels[i][begin] = impl_ss::BEGIN;
                            for (unsigned long k = begin+1; k < end; ++k)
                                labels[i][k] = impl_ss::INSIDE;
                        }
                    }
                }
            }
            else
            {
                // convert y into tagged BILOU labels
                for (unsigned long i = 0; i < labels.size(); ++i)
                {
                    labels[i].resize(x[i].size(), impl_ss::OUTSIDE);
                    for (unsigned long j = 0; j < y[i].size(); ++j)
                    {
                        const unsigned long begin = y[i][j].first;
                        const unsigned long end = y[i][j].second;
                        if (begin != end)
                        {
                            if (begin+1==end)
                            {
                                labels[i][begin] = impl_ss::UNIT;
                            }
                            else
                            {
                                labels[i][begin] = impl_ss::BEGIN;
                                for (unsigned long k = begin+1; k+1 < end; ++k)
                                    labels[i][k] = impl_ss::INSIDE;
                                labels[i][end-1] = impl_ss::LAST;
                            }
                        }
                    }
                }
            }

            sequence_labeler<impl_ss::feature_extractor<feature_extractor> > temp;
            temp = trainer.train(x, labels);
            return sequence_segmenter<feature_extractor>(temp.get_weights(), trainer.get_feature_extractor().fe);
        }

    private:

        structural_sequence_labeling_trainer<impl_ss::feature_extractor<feature_extractor> > trainer;
        double loss_per_missed_segment;
        double loss_per_false_alarm;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_Hh_

