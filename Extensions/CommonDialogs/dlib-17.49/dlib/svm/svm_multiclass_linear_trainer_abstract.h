// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_H__ 
#ifdef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_H__

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
                - get_epsilon() == 0.001
                - get_c() == 1
                - this object will not be verbose unless be_verbose() is called
                - #get_oca() == oca() (i.e. an instance of oca with default parameters) 

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

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const;
        /*!
            requires
                - is_learning_problem(all_samples, all_labels)
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


#endif // DLIB_SVm_MULTICLASS_LINEAR_TRAINER_ABSTRACT_H__


