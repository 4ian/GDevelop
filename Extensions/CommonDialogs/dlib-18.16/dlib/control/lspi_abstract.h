// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LSPI_ABSTRACT_Hh_
#ifdef DLIB_LSPI_ABSTRACT_Hh_

#include "approximate_linear_models_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class lspi
    {
        /*!
            REQUIREMENTS ON feature_extractor
                feature_extractor should implement the example_feature_extractor interface
                defined at the top of dlib/control/approximate_linear_models_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object is an implementation of the reinforcement learning algorithm
                described in the following paper:
                    Lagoudakis, Michail G., and Ronald Parr. "Least-squares policy
                    iteration." The Journal of Machine Learning Research 4 (2003):
                    1107-1149.
                
                This means that it takes a bunch of training data in the form of
                process_samples and outputs a policy that hopefully performs well when run
                on the process that generated those samples.
        !*/

    public:
        typedef feature_extractor feature_extractor_type;
        typedef typename feature_extractor::state_type state_type;
        typedef typename feature_extractor::action_type action_type;

        explicit lspi(
            const feature_extractor& fe_
        ); 
        /*!
            ensures
                - #get_feature_extractor() == fe_
                - #get_lambda() == 0.01
                - #get_discount == 0.8
                - #get_epsilon() == 0.01
                - is not verbose
                - #get_max_iterations() == 100
        !*/

        lspi(
        );
        /*!
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_lambda() == 0.01
                - #get_discount == 0.8
                - #get_epsilon() == 0.01
                - is not verbose
                - #get_max_iterations() == 100
        !*/

        double get_discount (
        ) const;
        /*!
            ensures
                - returns the discount applied to the sum of rewards in the Bellman
                  equation.
        !*/

        void set_discount (
            double value
        );
        /*!
            requires
                - 0 < value <= 1
            ensures
                - #get_discount() == value
        !*/

        const feature_extractor& get_feature_extractor (
        ) const;
        /*!
            ensures
                - returns the feature extractor used by this object
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
                  Smaller values may result in a more accurate solution but take longer to
                  train.  
        !*/

        void set_lambda (
            double lambda_ 
        ); 
        /*!
            requires
                - lambda >= 0
            ensures
                - #get_lambda() == lambda 
        !*/

        double get_lambda (
        ) const;
        /*!
            ensures
                - returns the regularization parameter.  It is the parameter that 
                  determines the trade off between trying to fit the training data 
                  exactly or allowing more errors but hopefully improving the 
                  generalization ability of the resulting function.  Smaller values 
                  encourage exact fitting while larger values of lambda may encourage 
                  better generalization. 
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

        template <
            typename vector_type
            >
        policy<feature_extractor> train (
            const vector_type& samples
        ) const;
        /*!
            requires
                - samples.size() > 0
                - samples is something with an interface that looks like 
                  std::vector<process_sample<feature_extractor>>.  That is, it should
                  be some kind of array of process_sample objects.
            ensures
                - Trains a policy based on the given data and returns the results.  The
                  idea is to find a policy that will obtain the largest possible reward
                  when run on the process that generated the samples.  In particular, 
                  if the returned policy is P then:
                    - P(S) == the best action to take when in state S.
                    - if (feature_extractor::force_last_weight_to_1) then
                        - The last element of P.get_weights() is 1. 
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LSPI_ABSTRACT_Hh_


