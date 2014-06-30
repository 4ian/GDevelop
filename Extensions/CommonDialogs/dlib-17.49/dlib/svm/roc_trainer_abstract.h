// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ROC_TRAINEr_ABSTRACT_
#ifdef DLIB_ROC_TRAINEr_ABSTRACT_

#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class roc_trainer_type
    {
        /*!
            REQUIREMENTS ON trainer_type
                - trainer_type == some kind of batch trainer object (e.g. svm_nu_trainer)

            WHAT THIS OBJECT REPRESENTS
                This object is a simple trainer post processor that allows you to 
                easily adjust the bias term in a trained decision_function object.
                That is, this object lets you pick a point on the ROC curve and 
                it will adjust the bias term appropriately.  

                So for example, suppose you wanted to set the bias term so that
                the accuracy of your decision function on +1 labeled samples was 99%.
                To do this you would use an instance of this object declared as follows:
                    roc_trainer_type<trainer_type>(your_trainer, 0.99, +1);
        !*/

    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        roc_trainer_type (
        );
        /*!
            ensures
                - This object is in an uninitialized state.  You must
                  construct a real one with the other constructor and assign it
                  to this instance before you use this object.
        !*/

        roc_trainer_type (
            const trainer_type& trainer_,
            const scalar_type& desired_accuracy_,
            const scalar_type& class_selection_
        );
        /*!
            requires
                - 0 <= desired_accuracy_ <= 1
                - class_selection_ == +1 or -1
            ensures
                - when training is performed using this object it will automatically
                  adjust the bias term in the returned decision function so that it
                  achieves the desired accuracy on the selected class type.
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const trained_function_type train (
            const in_sample_vector_type& samples,
            const in_scalar_vector_type& labels
        ) const 
        /*!
            requires
                - is_binary_classification_problem(samples, labels) == true
                - x == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, y should contain scalar_type objects.
            ensures
                - performs training using the trainer object given to this object's 
                  constructor, then modifies the bias term in the returned decision function
                  as discussed above, and finally returns the decision function.
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const roc_trainer_type<trainer_type> roc_c1_trainer (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type& desired_accuracy
    ) { return roc_trainer_type<trainer_type>(trainer, desired_accuracy, +1); }
    /*!
        requires
            - 0 <= desired_accuracy <= 1
            - trainer_type == some kind of batch trainer object that creates decision_function
              objects (e.g. svm_nu_trainer)
        ensures
            - returns a roc_trainer_type object that has been instantiated with the given 
              arguments.  The returned roc trainer will select the decision function
              bias that gives the desired accuracy with respect to the +1 class.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const roc_trainer_type<trainer_type> roc_c2_trainer (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type& desired_accuracy
    ) { return roc_trainer_type<trainer_type>(trainer, desired_accuracy, -1); }
    /*!
        requires
            - 0 <= desired_accuracy <= 1
            - trainer_type == some kind of batch trainer object that creates decision_function
              objects (e.g. svm_nu_trainer)
        ensures
            - returns a roc_trainer_type object that has been instantiated with the given 
              arguments.  The returned roc trainer will select the decision function
              bias that gives the desired accuracy with respect to the -1 class.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ROC_TRAINEr_ABSTRACT_



