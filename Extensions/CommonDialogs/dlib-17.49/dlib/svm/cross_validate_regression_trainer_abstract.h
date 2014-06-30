// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_ABSTRACT_H__
#ifdef DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_ABSTRACT_H__

#include <vector>
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename reg_funct_type,
        typename sample_type,
        typename label_type
        >
    matrix<double,1,2>
    test_regression_function (
        const reg_funct_type& reg_funct,
        const std::vector<sample_type>& x_test,
        const std::vector<label_type>& y_test
    );
    /*!
        requires
            - is_learning_problem(x_test, y_test)
            - reg_funct_type == some kind of regression function object 
              (e.g. a decision_function created by the svr_trainer )
        ensures
            - Tests reg_funct against the given samples in x_test and target values in 
              y_test and returns a matrix M summarizing the results.  Specifically:
                - M(0) == the mean squared error.  
                  The MSE is given by: sum over i: pow(reg_funct(x_test[i]) - y_test[i], 2.0)
                - M(1) == the R-squared value (i.e. the squared correlation between
                  reg_funct(x_test[i]) and y_test[i]).  This is a number between 0
                  and 1.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sample_type,
        typename label_type 
        >
    matrix<double,1,2>
    cross_validate_regression_trainer (
        const trainer_type& trainer,
        const std::vector<sample_type>& x,
        const std::vector<label_type>& y,
        const long folds
    );
    /*!
        requires
            - is_learning_problem(x,y)
            - 1 < folds <= x.size()
            - trainer_type == some kind of regression trainer object (e.g. svr_trainer)
        ensures
            - Performs k-fold cross validation by using the given trainer to solve a 
              regression problem for the given number of folds.  Each fold is tested using 
              the output of the trainer.  A matrix M summarizing the results is returned.  
              Specifically:
                - M(0) == the mean squared error.  
                  The MSE is given by: sum over i: pow(reg_funct(x[i]) - y[i], 2.0)
                - M(1) == the R-squared value (i.e. the squared correlation between
                  a predicted y value and its true value).  This is a number between 
                  0 and 1.
    !*/

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_ABSTRACT_H__



