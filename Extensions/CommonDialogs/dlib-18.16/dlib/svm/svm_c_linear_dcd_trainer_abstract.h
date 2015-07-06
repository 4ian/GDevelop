// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_C_LINEAR_DCD_TRAINER_ABSTRACT_Hh_ 
#ifdef DLIB_SVm_C_LINEAR_DCD_TRAINER_ABSTRACT_Hh_

#include "function_abstract.h"
#include "kernel_abstract.h"

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_c_linear_dcd_trainer
    {
        /*!
            REQUIREMENTS ON K 
                Is either linear_kernel or sparse_linear_kernel.  

            WHAT THIS OBJECT REPRESENTS
                This object represents a tool for training the C formulation of a support
                vector machine.  It is optimized for the case where linear kernels are
                used.  


                In particular, it is implemented using the algorithm described in the
                following paper:
                    A Dual Coordinate Descent Method for Large-scale Linear SVM
                    by Cho-Jui Hsieh, Kai-Wei Chang, and Chih-Jen Lin

                It solves the optimization problem of:
                min_w: 0.5||w||^2 + C*sum_i (hinge loss for sample i)   
                where w is the learned SVM parameter vector.

                Note that this object is very similar to the svm_c_linear_trainer, however,
                it interprets the C parameter slightly differently.  In particular, C for
                the DCD trainer is not automatically divided by the number of samples like
                it is with the svm_c_linear_trainer.  For example, a C value of 10 when
                given to the svm_c_linear_trainer is equivalent to a C value of 10/N for
                the svm_c_linear_dcd_trainer, where N is the number of training samples.
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;
        typedef typename decision_function<K>::sample_vector_type sample_vector_type;
        typedef typename decision_function<K>::scalar_vector_type scalar_vector_type;


        svm_c_linear_dcd_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used to train a
                  support vector machine.
                - #get_c_class1() == 1
                - #get_c_class2() == 1
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - This object will not be verbose unless be_verbose() is called
                - #forces_last_weight_to_1() == false
                - #includes_bias() == true
                - #shrinking_enabled() == true
        !*/

        explicit svm_c_linear_dcd_trainer (
            const scalar_type& C
        );
        /*!
            requires
                - C > 0
            ensures
                - This object is properly initialized and ready to be used to train a
                  support vector machine.
                - #get_c_class1() == C
                - #get_c_class2() == C
                - #get_epsilon() == 0.1
                - #get_max_iterations() == 10000
                - This object will not be verbose unless be_verbose() is called
                - #forces_last_weight_to_1() == false
                - #includes_bias() == true
                - #shrinking_enabled() == true
        !*/

        bool includes_bias (
        ) const;
        /*!
            ensures
                - returns true if this trainer will produce decision_functions with
                  non-zero bias values.  
        !*/

        void include_bias (
            bool should_have_bias
        );
        /*!
            ensures
                - #includes_bias() == should_have_bias
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
                  This is true regardless of the setting of #include_bias().
        !*/

        void force_last_weight_to_1 (
            bool should_last_weight_be_1
        );
        /*!
            ensures
                - #forces_last_weight_to_1() == should_last_weight_be_1
        !*/

        bool shrinking_enabled (
        ) const; 
        /*!
            ensures
                - returns true if the shrinking heuristic is enabled.  Typically this makes
                  the algorithm run a lot faster so it should be enabled.
        !*/

        void enable_shrinking (
            bool enabled
        ); 
        /*!
            ensures
                - #shrinking_enabled() == enabled
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
            scalar_type eps_
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
                  train.    
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object.  Since the
                  linear kernels don't have any parameters this function just returns
                  kernel_type()
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
                - returns the SVM regularization parameter for the +1 class.  It is the
                  parameter that determines the trade off between trying to fit the +1
                  training data exactly or allowing more errors but hopefully improving the
                  generalization of the resulting classifier.  Larger values encourage
                  exact fitting while smaller values of C may encourage better
                  generalization. 
        !*/

        const scalar_type get_c_class2 (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter for the -1 class.  It is the
                  parameter that determines the trade off between trying to fit the -1
                  training data exactly or allowing more errors but hopefully improving the
                  generalization of the resulting classifier.  Larger values encourage
                  exact fitting while smaller values of C may encourage better
                  generalization. 
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
            ensures
                - Trains a C support vector classifier given the training samples in x and 
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

        // optimizer_state is used to record the internal state of the SVM optimizer.  It
        // can be used with the following train() routine to warm-start the optimizer.
        // Note, that optimizer_state objects are serializable but are otherwise completely
        // opaque to the user.
        class optimizer_state;

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            optimizer_state& state 
        ) const;
        /*!
            requires
                - is_learning_problem(x,y) == true
                  (Note that it is ok for x.size() == 1)
                - All elements of y must be equal to +1 or -1
                - state must be either a default initialized optimizer_state object or all the
                  following conditions must be satisfied:
                    - Let LAST denote the previous trainer used with the state object, then
                      we must have: 
                        - LAST.includes_bias() == includes_bias()
                        - LAST.forces_last_weight_to_1() == forces_last_weight_to_1()
                    - Let X denote the previous training samples used with state, then the
                      following must be satisfied:
                        - x.size() >= X.size()
                        - for all valid i:
                            - x(i) == X(i)
                              (i.e. the samples x and X have in common must be identical.
                              That is, the only allowed difference between x and X is that
                              x might have new training samples appended onto its end)
                        - if (x contains dense vectors) then
                            - max_index_plus_one(x) == max_index_plus_one(X)
                        - else
                            - max_index_plus_one(x) >= max_index_plus_one(X)
                - x == a matrix or something convertible to a matrix via mat().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via mat().
                  Also, y should contain scalar_type objects.
            ensures
                - Trains a C support vector classifier given the training samples in x and 
                  labels in y.  
                - The point of the state object is to allow you to warm start the SVM
                  optimizer from the solution to a previous call to train().  Doing this
                  might make the training run faster.  This is useful when you are trying
                  different C values or have grown the training set and want to retrain.
                - #state == the internal state of the optimizer at the solution to the SVM
                  problem.  Therefore, passing #state to a new call to train() will start
                  the optimizer from the current solution.
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

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_C_LINEAR_DCD_TRAINER_ABSTRACT_Hh_

