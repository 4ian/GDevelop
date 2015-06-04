// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVR_LINEAR_TrAINER_ABSTRACT_Hh_
#ifdef DLIB_SVR_LINEAR_TrAINER_ABSTRACT_Hh_

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
    class svr_linear_trainer
    {
        /*!
            REQUIREMENTS ON K 
                Is either linear_kernel or sparse_linear_kernel.  

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for performing epsilon-insensitive support
                vector regression.  It uses the oca optimizer so it is very efficient at
                solving this problem when linear kernels are used, making it suitable for
                use with large datasets. 
                
                For an introduction to support vector regression see the following paper:
                    A Tutorial on Support Vector Regression by Alex J. Smola and Bernhard Scholkopf.
                Note that this object solves the version of support vector regression
                defined by equation (3) in the paper, except that we incorporate the bias
                term into the w vector by appending a 1 to the end of each sample.
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svr_linear_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used to train a
                  ranking support vector machine.
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - #get_c() == 1
                - #get_epsilon() == 0.01
                - #get_epsilon_insensitivity() = 0.1
                - This object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #forces_last_weight_to_1() == false
        !*/

        explicit svr_linear_trainer (
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
                - #get_epsilon() == 0.01
                - #get_epsilon_insensitivity() = 0.1
                - This object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #forces_last_weight_to_1() == false
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
        ) const; 
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer to
                  train.  You can think of this epsilon value as saying "solve the
                  optimization problem until the average regression error is within epsilon
                  of its optimal value".  See get_epsilon_insensitivity() below for a
                  definition of "regression error".
        !*/

        void set_epsilon_insensitivity (
            scalar_type eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon_insensitivity() == eps
        !*/

        const scalar_type get_epsilon_insensitivity (
        ) const;
        /*!
            ensures
                - This object tries to find a function which minimizes the regression error
                  on a training set.  This error is measured in the following way:
                    - if (abs(predicted_value - true_labeled_value) < eps) then
                        - The error is 0.  That is, any function which gets within eps of
                          the correct output is good enough.
                    - else
                        - The error grows linearly once it gets bigger than eps.
                 
                  So epsilon-insensitive regression means we do regression but stop trying
                  to fit a data point once it is "close enough".  This function returns
                  that eps value which controls what we mean by "close enough".
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
                - Forcing the last weight to 1 also disables the bias and therefore the b
                  field of the learned decision_function will be 0 when forces_last_weight_to_1() == true.
        !*/

        void force_last_weight_to_1 (
            bool should_last_weight_be_1
        );
        /*!
            ensures
                - #forces_last_weight_to_1() == should_last_weight_be_1
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
                - The output of training is a weight vector and a bias value.  These two
                  things define the resulting decision function.  That is, the decision
                  function simply takes the dot product between the learned weight vector
                  and a test sample, then subtracts the bias value.  Therefore, if
                  learns_nonnegative_weights() == true then the resulting learned weight
                  vector will always have non-negative entries.  The bias value may still
                  be negative though.
        !*/
       
        void set_learns_nonnegative_weights (
            bool value
        );
        /*!
            ensures
                - #learns_nonnegative_weights() == value
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
            const std::vector<sample_type>& samples,
            const std::vector<scalar_type>& targets
        ) const;
        /*!
            requires
                - is_learning_problem(samples,targets) == true
            ensures
                - performs support vector regression given the training samples and targets.  
                - returns a decision_function F with the following properties:
                    - F(new_sample) == predicted target value for new_sample
                    - F.alpha.size() == 1
                    - F.basis_vectors.size() == 1
                    - F.alpha(0) == 1
        !*/

    }; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVR_LINEAR_TrAINER_ABSTRACT_Hh_


