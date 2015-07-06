// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_ASSiGNEMNT_TRAINER_ABSTRACT_Hh_
#ifdef DLIB_CROSS_VALIDATE_ASSiGNEMNT_TRAINER_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"
#include "svm.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename assignment_function
        >
    double test_assignment_function (
        const assignment_function& assigner,
        const std::vector<typename assignment_function::sample_type>& samples,
        const std::vector<typename assignment_function::label_type>& labels
    );
    /*!
        requires
            - is_assignment_problem(samples, labels)
            - if (assigner.forces_assignment()) then
                - is_forced_assignment_problem(samples, labels) 
            - assignment_function == an instantiation of the dlib::assignment_function
              template or an object with a compatible interface.
        ensures
            - Tests assigner against the given samples and labels and returns the fraction 
              of assignments predicted correctly.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    double cross_validate_assignment_trainer (
        const trainer_type& trainer,
        const std::vector<typename trainer_type::sample_type>& samples,
        const std::vector<typename trainer_type::label_type>& labels,
        const long folds
    );
    /*!
        requires
            - is_assignment_problem(samples, labels)
            - if (trainer.forces_assignment()) then
                - is_forced_assignment_problem(samples, labels) 
            - 1 < folds <= samples.size()
            - trainer_type == dlib::structural_assignment_trainer or an object
              with a compatible interface.
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given assignment learning problem for the given number of folds.  Each fold 
              is tested using the output of the trainer and the fraction of assignments
              predicted correctly is returned.
            - The number of folds used is given by the folds argument.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_ASSiGNEMNT_TRAINER_ABSTRACT_Hh_


