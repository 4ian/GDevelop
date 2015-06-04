// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_ABSTRACT_Hh_

#include "../algs.h"
#include "structural_svm_assignment_problem.h"
#include "assignment_function_abstract.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_assignment_trainer
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor defined in dlib/svm/assignment_function_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning to solve an assignment problem based
                on a training dataset of example assignments.  The training procedure produces an 
                assignment_function object which can be used to predict the assignments of
                new data.

                Note that this is just a convenience wrapper around the 
                structural_svm_assignment_problem to make it look 
                similar to all the other trainers in dlib.  
        !*/

    public:
        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;
        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;
        typedef std::vector<long> label_type;
        typedef assignment_function<feature_extractor> trained_function_type;

        structural_assignment_trainer (
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.01
                - #get_num_threads() == 2
                - #get_max_cache_size() == 5
                - #get_feature_extractor() == a default initialized feature_extractor
                - #forces_assignment() == false
                - #get_loss_per_false_association() == 1
                - #get_loss_per_missed_association() == 1
                - #forces_last_weight_to_1() == false
        !*/

        explicit structural_assignment_trainer (
            const feature_extractor& fe
        );
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.01
                - #get_num_threads() == 2
                - #get_max_cache_size() == 40
                - #get_feature_extractor() == fe 
                - #forces_assignment() == false
                - #get_loss_per_false_association() == 1
                - #get_loss_per_missed_association() == 1
                - #forces_last_weight_to_1() == false
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
            double eps
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
                  optimization problem until the average number of assignment mistakes per 
                  training sample is within epsilon of its optimal value".
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
                - During training, this object basically runs the assignment_function on 
                  each training sample, over and over.  To speed this up, it is possible to 
                  cache the results of these invocations.  This function returns the number 
                  of cache elements per training sample kept in the cache.  Note that a value 
                  of 0 means caching is not used at all.  
        !*/

        void set_loss_per_false_association (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_false_association() == loss
        !*/

        double get_loss_per_false_association (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for associating two objects
                  together that shouldn't be associated.  If you care more about avoiding
                  accidental associations than ensuring all possible associations are
                  identified then then you can increase this value.
        !*/

        void set_loss_per_missed_association (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_missed_association() == loss
        !*/

        double get_loss_per_missed_association (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for failing to associate two
                  objects that are supposed to be associated.  If you care more about
                  getting all the associations than avoiding accidentally associating
                  objects that shouldn't be associated then you can increase this value.
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
                  improving the generalization of the resulting assignment_function.  
                  Larger values encourage exact fitting while smaller values of C may 
                  encourage better generalization. 
        !*/

        void set_forces_assignment (
            bool new_value
        );
        /*!
            ensures
                - #forces_assignment() == new_value
        !*/

        bool forces_assignment(
        ) const; 
        /*!
            ensures
                - returns the value of the forces_assignment() parameter for the
                  assignment_functions generated by this object.  
        !*/

        bool forces_last_weight_to_1 (
        ) const;
        /*!
            ensures
                - returns true if this trainer has the constraint that the last weight in
                  the learned parameter vector must be 1.  This is the weight corresponding
                  to the feature in the training vectors with the highest dimension.  
                - Forcing the last weight to 1 also disables the bias and therefore the
                  get_bias() field of the learned assignment_function will be 0 when
                  forces_last_weight_to_1() == true.
        !*/

        void force_last_weight_to_1 (
            bool should_last_weight_be_1
        );
        /*!
            ensures
                - #forces_last_weight_to_1() == should_last_weight_be_1
        !*/

        const assignment_function<feature_extractor> train (  
            const std::vector<sample_type>& samples,
            const std::vector<label_type>& labels
        ) const;
        /*!
            requires
                - is_assignment_problem(samples,labels) == true
                - if (forces_assignment()) then
                    - is_forced_assignment_problem(samples,labels) == true
            ensures
                - Uses the structural_svm_assignment_problem to train an 
                  assignment_function on the given samples/labels training pairs.  
                  The idea is to learn to predict a label given an input sample.
                - returns a function F with the following properties:
                    - F(new_sample) == A set of assignments indicating how the elements of 
                      new_sample.first match up with the elements of new_sample.second.
                    - F.forces_assignment() == forces_assignment()
                    - F.get_feature_extractor() == get_feature_extractor()
                    - if (forces_last_weight_to_1()) then
                        - F.get_bias() == 0
                        - F.get_weights()(F.get_weights().size()-1) == 1
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_ABSTRACT_Hh_


