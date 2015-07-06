// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVM_RANK_TrAINER_ABSTRACT_Hh_
#ifdef DLIB_SVM_RANK_TrAINER_ABSTRACT_Hh_

#include "ranking_tools_abstract.h"
#include "sparse_vector_abstract.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_rank_trainer
    {
        /*!
            REQUIREMENTS ON K 
                Is either linear_kernel or sparse_linear_kernel.  

            WHAT THIS OBJECT REPRESENTS
                This object represents a tool for training a ranking support vector machine
                using linear kernels.  In particular, this object is a tool for training
                the Ranking SVM described in the paper: 
                    Optimizing Search Engines using Clickthrough Data by Thorsten Joachims

                Note that we normalize the C parameter by multiplying it by 1/(number of ranking pairs).
                Therefore, to make an exact comparison between this object and Equation 12
                in the paper you must multiply C by the appropriate normalizing quantity. 
    
                Finally, note that the implementation of this object is done using the oca
                optimizer and count_ranking_inversions() method.  This means that it runs
                in O(n*log(n)) time, making it suitable for use with large datasets.
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_rank_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used to train a
                  ranking support vector machine.
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - #get_c() == 1
                - #get_epsilon() == 0.001
                - this object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #forces_last_weight_to_1() == false
                - #has_prior() == false
        !*/

        explicit svm_rank_trainer (
            const scalar_type& C
        );
        /*!
            requires
                - C > 0
            ensures
                - This object is properly initialized and ready to be used to train a
                  ranking support vector machine.
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - #get_c() == C
                - #get_epsilon() == 0.001
                - this object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #forces_last_weight_to_1() == false
                - #has_prior() == false
        !*/

        void set_epsilon (
            scalar_type eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps 
        !*/

        const scalar_type get_epsilon (
        );
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer to
                  train.  You can think of this epsilon value as saying "solve the
                  optimization problem until the average ranking accuracy is within epsilon
                  of its optimal value".  Here we mean "ranking accuracy" in the same sense
                  used by test_ranking_function() and cross_validate_ranking_trainer().
        !*/

        unsigned long get_max_iterations (
        ) const; 
        /*!
            ensures
                - returns the maximum number of iterations the SVM optimizer is allowed to
                  run before it is required to stop and return a result.
        !*/

        void set_max_iterations (
            unsigned long max_iter
        );
        /*!
            ensures
                - #get_max_iterations() == max_iter
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

        bool forces_last_weight_to_1 (
        ) const;
        /*!
            ensures
                - returns true if this trainer has the constraint that the last weight in
                  the learned parameter vector must be 1.  This is the weight corresponding
                  to the feature in the training vectors with the highest dimension.
        !*/

        void force_last_weight_to_1 (
            bool should_last_weight_be_1
        );
        /*!
            ensures
                - #forces_last_weight_to_1() == should_last_weight_be_1
                - if (should_last_weight_be_1 == true) then
                    - #has_prior() == false
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
                - returns a copy of the optimizer used to solve the SVM problem.  
        !*/

        const kernel_type get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object.  Since the
                  linear kernels don't have any parameters this function just returns
                  kernel_type()
        !*/

        bool learns_nonnegative_weights (
        ) const; 
        /*!
            ensures
                - The output of training is a weight vector that defines the behavior of
                  the resulting decision function.  That is, the decision function simply
                  takes the dot product between the learned weight vector and a test sample
                  and returns the result.  Therefore, if learns_nonnegative_weights() == true 
                  then the resulting learned weight vector will always have non-negative
                  entries.  
        !*/
       
        void set_learns_nonnegative_weights (
            bool value
        );
        /*!
            ensures
                - #learns_nonnegative_weights() == value
                - if (value == true) then
                    - #has_prior() == false
        !*/

        void set_prior (
            const trained_function_type& prior
        );
        /*!
            requires
                - prior == a function produced by a call to this class's train() function.  
                  Therefore, it must be the case that:
                    - prior.basis_vectors.size() == 1
                    - prior.alpha(0) == 1
            ensures
                - Subsequent calls to train() will try to learn a function similar to the
                  given prior.
                - #has_prior() == true
                - #learns_nonnegative_weights() == false
                - #forces_last_weight_to_1() == false
        !*/

        bool has_prior (
        ) const
        /*!
            ensures
                - returns true if a prior has been set and false otherwise.  Having a prior
                  set means that you have called set_prior() and supplied a previously
                  trained function as a reference.  In this case, any call to train() will
                  try to learn a function that matches the behavior of the prior as close
                  as possible but also fits the supplied training data.  In more technical
                  detail, having a prior means we replace the ||w||^2 regularizer with one
                  of the form ||w-prior||^2 where w is the set of parameters for a learned
                  function.
        !*/

        void set_c (
            scalar_type C 
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c() == C 
        !*/

        const scalar_type get_c (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter that
                  determines the trade off between trying to fit the training data exactly
                  or allowing more errors but hopefully improving the generalization of the
                  resulting classifier.  Larger values encourage exact fitting while
                  smaller values of C may encourage better generalization. 
        !*/

        const decision_function<kernel_type> train (
            const std::vector<ranking_pair<sample_type> >& samples
        ) const;
        /*!
            requires
                - is_ranking_problem(samples) == true
                - if (has_prior()) then
                    - The vectors in samples must have the same dimensionality as the
                      vectors used to train the prior given to set_prior().  
            ensures
                - trains a ranking support vector classifier given the training samples.  
                - returns a decision function F with the following properties:
                    - F.alpha.size() == 1
                    - F.basis_vectors.size() == 1
                    - F.alpha(0) == 1
                    - Given two vectors, A and B, then A is predicted to come before B 
                      in the learned ranking if and only if F(A) > F(B).
                    - Based on the contents of samples, F will attempt to give relevant
                      vectors higher scores than non-relevant vectors.
        !*/

        const decision_function<kernel_type> train (
            const ranking_pair<sample_type>& sample
        ) const;
        /*!
            requires
                - is_ranking_problem(std::vector<ranking_pair<sample_type> >(1, sample)) == true
                - if (has_prior()) then
                    - The vectors in samples must have the same dimensionality as the
                      vectors used to train the prior given to set_prior().  
            ensures
                - This is just a convenience routine for calling the above train()
                  function.  That is, it just copies sample into a std::vector object and
                  invokes the above train() method.  This means that calling this function
                  is equivalent to invoking: 
                    return train(std::vector<ranking_pair<sample_type> >(1, sample));
        !*/

    }; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVM_RANK_TrAINER_ABSTRACT_Hh_

