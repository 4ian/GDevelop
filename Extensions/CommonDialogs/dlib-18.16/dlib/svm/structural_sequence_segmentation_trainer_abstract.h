// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_ABSTRACT_Hh_

#include "sequence_segmenter_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_sequence_segmentation_trainer
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor defined in dlib/svm/sequence_segmenter_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning to do sequence segmentation based on a
                set of training data.  The training procedure produces a sequence_segmenter
                object which can be used to identify the sub-segments of new data
                sequences.

                This object internally uses the structural_sequence_labeling_trainer to
                solve the learning problem.  
        !*/

    public:

        typedef typename feature_extractor::sequence_type sample_sequence_type;
        typedef std::vector<std::pair<unsigned long, unsigned long> > segmented_sequence_type;

        typedef sequence_segmenter<feature_extractor> trained_function_type;

        structural_sequence_segmentation_trainer (
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - #get_num_threads() == 2
                - #get_max_cache_size() == 40
                - #get_feature_extractor() == a default initialized feature_extractor
                - #get_loss_per_missed_segment() == 1
                - #get_loss_per_false_alarm() == 1
        !*/

        explicit structural_sequence_segmentation_trainer (
            const feature_extractor& fe
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - #get_num_threads() == 2
                - #get_max_cache_size() == 40
                - #get_feature_extractor() == fe 
                - #get_loss_per_missed_segment() == 1
                - #get_loss_per_false_alarm() == 1
        !*/

        const feature_extractor& get_feature_extractor (
        ) const;
        /*!
            ensures
                - returns the feature extractor used by this object
        !*/

        void set_num_threads (
            unsigned long num
        );
        /*!
            ensures
                - #get_num_threads() == num
        !*/

        unsigned long get_num_threads (
        ) const;
        /*!
            ensures
                - returns the number of threads used during training.  You should 
                  usually set this equal to the number of processing cores on your
                  machine.
        !*/

        void set_epsilon (
            double eps_
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        double get_epsilon (
        ) const; 
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer 
                  to train.  You can think of this epsilon value as saying "solve the 
                  optimization problem until the average number of segmentation mistakes
                  per training sample is within epsilon of its optimal value".
        !*/

        void set_max_iterations (
            unsigned long max_iter
        );
        /*!
            ensures
                - #get_max_iterations() == max_iter
        !*/

        unsigned long get_max_iterations (
        ); 
        /*!
            ensures
                - returns the maximum number of iterations the SVM optimizer is allowed to
                  run before it is required to stop and return a result.
        !*/

        void set_max_cache_size (
            unsigned long max_size
        );
        /*!
            ensures
                - #get_max_cache_size() == max_size
        !*/

        unsigned long get_max_cache_size (
        ) const;
        /*!
            ensures
                - During training, this object basically runs the sequence_segmenter on
                  each training sample, over and over.  To speed this up, it is possible to
                  cache the results of these segmenter invocations.  This function returns
                  the number of cache elements per training sample kept in the cache.  Note
                  that a value of 0 means caching is not used at all.  
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a user can
                  observe the progress of the algorithm.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        void set_oca (
            const oca& item
        );
        /*!
            ensures
                - #get_oca() == item 
        !*/

        const oca get_oca (
        ) const;
        /*!
            ensures
                - returns a copy of the optimizer used to solve the structural SVM problem.  
        !*/

        void set_c (
            double C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c() = C
        !*/

        double get_c (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter that
                  determines the trade-off between trying to fit the training data (i.e.
                  minimize the loss) or allowing more errors but hopefully improving the
                  generalization of the resulting sequence labeler.  Larger values
                  encourage exact fitting while smaller values of C may encourage better
                  generalization. 
        !*/

        void set_loss_per_missed_segment (
            double loss
        );
        /*!
            requires
                - loss >= 0
            ensures
                - #get_loss_per_missed_segment() == loss
        !*/

        double get_loss_per_missed_segment (
        ) const;
        /*!
            ensures
                - returns the amount of loss incurred for failing to detect a segment.  The
                  larger the loss the more important it is to detect all the segments.
        !*/


        void set_loss_per_false_alarm (
            double loss
        );
        /*!
            requires
                - loss >= 0
            ensures
                - #get_loss_per_false_alarm() == loss
        !*/

        double get_loss_per_false_alarm (
        ) const;
        /*!
            ensures
                - returns the amount of loss incurred for outputting a false detection. The
                  larger the loss the more important it is to avoid outputting false
                  detections.
        !*/

        const sequence_segmenter<feature_extractor> train(
            const std::vector<sample_sequence_type>& x,
            const std::vector<segmented_sequence_type>& y
        ) const;
        /*!
            requires
                - is_sequence_segmentation_problem(x, y) == true
            ensures
                - Uses the given training data to learn to do sequence segmentation.  That
                  is, this function will try to find a sequence_segmenter capable of
                  predicting y[i] when given x[i] as input.  Moreover, it should also be
                  capable of predicting the segmentation of new input sequences.  Or in
                  other words, the learned sequence_segmenter should also generalize to new
                  data outside the training dataset.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SEQUENCE_sEGMENTATION_TRAINER_ABSTRACT_Hh_

