// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SEQUENCE_LABELING_TRAiNER_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_SEQUENCE_LABELING_TRAiNER_ABSTRACT_Hh_

#include "../algs.h"
#include "../optimization.h"
#include "structural_svm_sequence_labeling_problem_abstract.h"
#include "sequence_labeler_abstract.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_sequence_labeling_trainer
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor defined in dlib/svm/sequence_labeler_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning to do sequence labeling based
                on a set of training data.  The training procedure produces a
                sequence_labeler object which can be used to predict the labels of
                new data sequences.

                Note that this is just a convenience wrapper around the 
                structural_svm_sequence_labeling_problem to make it look 
                similar to all the other trainers in dlib.  
        !*/

    public:
        typedef typename feature_extractor::sequence_type sample_sequence_type;
        typedef std::vector<unsigned long> labeled_sequence_type;
        typedef sequence_labeler<feature_extractor> trained_function_type;

        structural_sequence_labeling_trainer (
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - #get_num_threads() == 2
                - #get_max_cache_size() == 5
                - #get_feature_extractor() == a default initialized feature_extractor
        !*/

        explicit structural_sequence_labeling_trainer (
            const feature_extractor& fe
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - #get_num_threads() == 2
                - #get_max_cache_size() == 5
                - #get_feature_extractor() == fe 
        !*/

        const feature_extractor& get_feature_extractor (
        ) const;
        /*!
            ensures
                - returns the feature extractor used by this object
        !*/

        unsigned long num_labels (
        ) const; 
        /*!
            ensures
                - returns get_feature_extractor().num_labels()
                  (i.e. returns the number of possible output labels for each 
                  element of a sequence)
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
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        const double get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer 
                  to train.  You can think of this epsilon value as saying "solve the 
                  optimization problem until the average number of labeling mistakes per 
                  training sample is within epsilon of its optimal value".
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
                - During training, this object basically runs the sequence_labeler on 
                  each training sample, over and over.  To speed this up, it is possible to 
                  cache the results of these labeler invocations.  This function returns the 
                  number of cache elements per training sample kept in the cache.  Note 
                  that a value of 0 means caching is not used at all.  
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a 
                  user can observe the progress of the algorithm.
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
                - returns the SVM regularization parameter.  It is the parameter 
                  that determines the trade-off between trying to fit the training 
                  data (i.e. minimize the loss) or allowing more errors but hopefully 
                  improving the generalization of the resulting sequence labeler.  Larger 
                  values encourage exact fitting while smaller values of C may encourage 
                  better generalization. 
        !*/

        double get_loss (
            unsigned long label
        ) const;
        /*!
            requires
                - label < num_labels()
            ensures
                - returns the loss incurred when a sequence element with the given
                  label is misclassified.  This value controls how much we care about
                  correctly classifying this type of label.  Larger loss values indicate
                  that we care more strongly than smaller values.
        !*/

        void set_loss (
            unsigned long label,
            double value
        );
        /*!
            requires
                - label < num_labels()
                - value >= 0
            ensures
                - #get_loss(label) == value
        !*/

        const sequence_labeler<feature_extractor> train(
            const std::vector<sample_sequence_type>& x,
            const std::vector<labeled_sequence_type>& y
        ) const;
        /*!
            requires
                - is_sequence_labeling_problem(x, y) == true
                - contains_invalid_labeling(get_feature_extractor(), x, y) == false
                - for all valid i and j: y[i][j] < num_labels()
            ensures
                - Uses the structural_svm_sequence_labeling_problem to train a 
                  sequence_labeler on the given x/y training pairs.  The idea is 
                  to learn to predict a y given an input x.
                - returns a function F with the following properties:
                    - F(new_x) == A sequence of predicted labels for the elements of new_x.  
                    - F(new_x).size() == new_x.size()
                    - for all valid i:
                        - F(new_x)[i] == the predicted label of new_x[i]
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SEQUENCE_LABELING_TRAiNER_ABSTRACT_Hh_




