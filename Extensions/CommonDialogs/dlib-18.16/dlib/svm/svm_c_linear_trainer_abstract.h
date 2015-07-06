// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVM_C_LiNEAR_TRAINER_ABSTRACT_Hh_
#ifdef DLIB_SVM_C_LiNEAR_TRAINER_ABSTRACT_Hh_

#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "sparse_kernel_abstract.h"

namespace dlib
{
    template <
        typename K 
        >
    class svm_c_linear_trainer
    {
        /*!
            REQUIREMENTS ON K 
                Is either linear_kernel or sparse_linear_kernel.  

            WHAT THIS OBJECT REPRESENTS
                This object represents a tool for training the C formulation of 
                a support vector machine.  It is optimized for the case where
                linear kernels are used.  


                In particular, it is implemented using the OCAS algorithm
                described in the following paper:
                    Optimized Cutting Plane Algorithm for Large-Scale Risk Minimization
                        Vojtech Franc, Soren Sonnenburg; Journal of Machine Learning 
                        Research, 10(Oct):2157--2192, 2009. 
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_c_linear_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used
                  to train a support vector machine.
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - #get_c_class1() == 1
                - #get_c_class2() == 1
                - #get_epsilon() == 0.001
                - this object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #force_last_weight_to_1() == false
                - #has_prior() == false
        !*/

        explicit svm_c_linear_trainer (
            const scalar_type& C 
        );
        /*!
            requires
                - C > 0
            ensures
                - This object is properly initialized and ready to be used
                  to train a support vector machine.
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - #get_c_class1() == C
                - #get_c_class2() == C
                - #get_epsilon() == 0.001
                - this object will not be verbose unless be_verbose() is called
                - #get_max_iterations() == 10000
                - #learns_nonnegative_weights() == false
                - #force_last_weight_to_1() == false
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
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer to
                  train.  You can think of this epsilon value as saying "solve the
                  optimization problem until the probability of misclassification is within
                  epsilon of its optimal value".  
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
                - returns a copy of the optimizer used to solve the SVM problem.  
        !*/

        const kernel_type get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object.  Since
                  the linear kernels don't have any parameters this function just
                  returns kernel_type()
        !*/

        bool learns_nonnegative_weights (
        ) const;
        /*!
            ensures
                - The output of training is a weight vector and a bias value.  These
                  two things define the resulting decision function.  That is, the
                  decision function simply takes the dot product between the learned
                  weight vector and a test sample, then subtracts the bias value.  
                  Therefore, if learns_nonnegative_weights() == true then the resulting
                  learned weight vector will always have non-negative entries.  The
                  bias value may still be negative though.
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
                - if (should_last_weight_be_1 == true) then
                    - #has_prior() == false
        !*/

        void set_c (
            scalar_type C 
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c_class1() == C 
                - #get_c_class2() == C 
        !*/

        const scalar_type get_c_class1 (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter for the +1 class.  
                  It is the parameter that determines the trade off between
                  trying to fit the +1 training data exactly or allowing more errors 
                  but hopefully improving the generalization of the resulting 
                  classifier.  Larger values encourage exact fitting while 
                  smaller values of C may encourage better generalization. 
        !*/

        const scalar_type get_c_class2 (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter for the -1 class.  
                  It is the parameter that determines the trade off between
                  trying to fit the -1 training data exactly or allowing more errors 
                  but hopefully improving the generalization of the resulting 
                  classifier.  Larger values encourage exact fitting while 
                  smaller values of C may encourage better generalization. 
        !*/

        void set_c_class1 (
            scalar_type C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c_class1() == C
        !*/

        void set_c_class2 (
            scalar_type C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c_class2() == C
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const;
        /*!
            requires
                - is_learning_problem(x,y) == true
                  (Note that it is ok for x.size() == 1)
                - All elements of y must be equal to +1 or -1
                - x == a matrix or something convertible to a matrix via mat().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via mat().
                  Also, y should contain scalar_type objects.
                - if (has_prior()) then
                    - The vectors in x must have the same dimensionality as the vectors
                      used to train the prior given to set_prior().  
            ensures
                - trains a C support vector classifier given the training samples in x and 
                  labels in y.  
                - returns a decision function F with the following properties:
                    - F.alpha.size() == 1
                    - F.basis_vectors.size() == 1
                    - F.alpha(0) == 1
                    - if (new_x is a sample predicted have +1 label) then
                        - F(new_x) >= 0
                    - else
                        - F(new_x) < 0
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const;
        /*!
            requires
                - is_learning_problem(x,y) == true
                  (Note that it is ok for x.size() == 1)
                - All elements of y must be equal to +1 or -1
                - x == a matrix or something convertible to a matrix via mat().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via mat().
                  Also, y should contain scalar_type objects.
                - if (has_prior()) then
                    - The vectors in x must have the same dimensionality as the vectors
                      used to train the prior given to set_prior().  
            ensures
                - trains a C support vector classifier given the training samples in x and 
                  labels in y.  
                - #svm_objective == the final value of the SVM objective function
                - returns a decision function F with the following properties:
                    - F.alpha.size() == 1
                    - F.basis_vectors.size() == 1
                    - F.alpha(0) == 1
                    - if (new_x is a sample predicted have +1 label) then
                        - F(new_x) >= 0
                    - else
                        - F(new_x) < 0
        !*/

    }; 

}

#endif // DLIB_SVM_C_LiNEAR_TRAINER_ABSTRACT_Hh_

