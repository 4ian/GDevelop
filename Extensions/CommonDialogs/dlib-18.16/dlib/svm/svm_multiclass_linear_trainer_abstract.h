// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_Hh_ 
#ifdef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_Hh_

#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "sparse_kernel_abstract.h"
#include "../optimization/optimization_oca_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class svm_multiclass_linear_trainer
    {
        /*!
            REQUIREMENTS ON K 
                Is either linear_kernel or sparse_linear_kernel.  

            REQUIREMENTS ON label_type_
                label_type_ must be default constructable, copyable, and comparable using
                operator < and ==.  It must also be possible to write it to an std::ostream
                using operator<<.

            INITIAL VALUE
                - get_num_threads() == 4 
                - learns_nonnegative_weights() == false
                - get_epsilon() == 0.001
                - get_max_iterations() == 10000
                - get_c() == 1
                - this object will not be verbose unless be_verbose() is called
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 
                - has_prior() == false

            WHAT THIS OBJECT REPRESENTS
                This object represents a tool for training a multiclass support 
                vector machine.  It is optimized for the case where linear kernels 
                are used.  
        !*/

    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;

        svm_multiclass_linear_trainer (
        );
        /*!
            ensures
                - this object is properly initialized
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
                  Smaller values may result in a more accurate solution but take longer 
                  to execute.
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

        const kernel_type get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object.  Since
                  the linear kernels don't have any parameters this function just
                  returns kernel_type()
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
                  determines the trade off between trying to fit the training data 
                  exactly or allowing more errors but hopefully improving the 
                  generalization of the resulting classifier.  Larger values encourage 
                  exact fitting while smaller values of C may encourage better 
                  generalization. 
        !*/

        bool learns_nonnegative_weights (
        ) const;
        /*!
            ensures
                - The output of training is a set of weights and bias values that together
                  define the behavior of a multiclass_linear_decision_function object.  If
                  learns_nonnegative_weights() == true then the resulting weights and bias
                  values will always have non-negative values.  That is, if this function
                  returns true then all the numbers in the multiclass_linear_decision_function 
                  objects output by train() will be non-negative.
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
            ensures
                - Subsequent calls to train() will try to learn a function similar to the
                  given prior.
                - #has_prior() == true
                - #learns_nonnegative_weights() == false
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

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const;
        /*!
            requires
                - is_learning_problem(all_samples, all_labels)
                - All the vectors in all_samples must have the same dimensionality.
                - if (has_prior()) then
                    - The vectors in all_samples must have the same dimensionality as the
                      vectors used to train the prior given to set_prior().  
            ensures
                - trains a multiclass SVM to solve the given multiclass classification problem.  
                - returns a multiclass_linear_decision_function F with the following properties:
                    - if (new_x is a sample predicted to have a label of L) then
                        - F(new_x) == L
                    - F.get_labels() == select_all_distinct_labels(all_labels)
                    - F.number_of_classes() == select_all_distinct_labels(all_labels).size()
        !*/

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const;
        /*!
            requires
                - is_learning_problem(all_samples, all_labels)
                - All the vectors in all_samples must have the same dimensionality.
                - if (has_prior()) then
                    - The vectors in all_samples must have the same dimensionality as the
                      vectors used to train the prior given to set_prior().  
            ensures
                - trains a multiclass SVM to solve the given multiclass classification problem.  
                - returns a multiclass_linear_decision_function F with the following properties:
                    - if (new_x is a sample predicted to have a label of L) then
                        - F(new_x) == L
                    - F.get_labels() == select_all_distinct_labels(all_labels)
                    - F.number_of_classes() == select_all_distinct_labels(all_labels).size()
                - #svm_objective == the final value of the SVM objective function
        !*/

    };

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_Hh_


