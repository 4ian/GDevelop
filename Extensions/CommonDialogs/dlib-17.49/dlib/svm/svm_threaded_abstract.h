// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_THREADED_ABSTRACT_
#ifdef DLIB_SVm_THREADED_ABSTRACT_

#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../svm.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename trainer_type::scalar_type, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer_threaded (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds,
        const long num_threads
    );
    /*!
        requires
            - is_binary_classification_problem(x,y) == true
            - 1 < folds <= x.nr()
            - trainer_type == some kind of trainer object (e.g. svm_nu_trainer)
            - num_threads > 0
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given binary classification problem for the given number of folds.
              Each fold is tested using the output of the trainer and the average 
              classification accuracy from all folds is returned.  
            - uses num_threads threads of execution in doing the cross validation.  
            - The accuracy is returned in a row vector, let us call it R.  Both 
              quantities in R are numbers between 0 and 1 which represent the fraction 
              of examples correctly classified.  R(0) is the fraction of +1 examples 
              correctly classified and R(1) is the fraction of -1 examples correctly 
              classified.
            - The number of folds used is given by the folds argument.
        throws
            - any exceptions thrown by trainer.train()
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_THREADED_ABSTRACT_



