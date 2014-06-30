// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_H__
#define DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_H__

#include <vector>
#include "../matrix.h"
#include "../statistics.h"
#include "cross_validate_regression_trainer_abstract.h"

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
    )
    {
        typedef typename reg_funct_type::mem_manager_type mem_manager_type;

        // make sure requires clause is not broken
        DLIB_ASSERT( is_learning_problem(x_test,y_test) == true,
                    "\tmatrix test_regression_function()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(x_test,y_test): " 
                    << is_learning_problem(x_test,y_test));

        running_stats<double> rs;
        running_scalar_covariance<double> rc;

        for (unsigned long i = 0; i < x_test.size(); ++i)
        {
            // compute error
            const double output = reg_funct(x_test[i]);
            const double temp = output - y_test[i];

            rs.add(temp*temp);
            rc.add(output, y_test[i]);
        }

        matrix<double,1,2> result;
        result = rs.mean(), std::pow(rc.correlation(),2);
        return result;
    }

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
    )
    {
        typedef typename trainer_type::mem_manager_type mem_manager_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_learning_problem(x,y) == true &&
                    1 < folds && folds <= static_cast<long>(x.size()),
            "\tmatrix cross_validate_regression_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.size(): " << x.size() 
            << "\n\t folds:  " << folds 
            << "\n\t is_learning_problem(x,y): " << is_learning_problem(x,y)
            );



        const long num_in_test = x.size()/folds;
        const long num_in_train = x.size() - num_in_test;

        running_stats<double> rs;
        running_scalar_covariance<double> rc;

        std::vector<sample_type> x_test, x_train;
        std::vector<label_type> y_test, y_train;


        long next_test_idx = 0;


        for (long i = 0; i < folds; ++i)
        {
            x_test.clear();
            y_test.clear();
            x_train.clear();
            y_train.clear();

            // load up the test samples
            for (long cnt = 0; cnt < num_in_test; ++cnt)
            {
                x_test.push_back(x[next_test_idx]);
                y_test.push_back(y[next_test_idx]);
                next_test_idx = (next_test_idx + 1)%x.size();
            }

            // load up the training samples
            long next = next_test_idx;
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                x_train.push_back(x[next]);
                y_train.push_back(y[next]);
                next = (next + 1)%x.size();
            }


            try
            {
                const typename trainer_type::trained_function_type& df = trainer.train(x_train,y_train);

                // do the training and testing
                for (unsigned long j = 0; j < x_test.size(); ++j)
                {
                    // compute error
                    const double output = df(x_test[j]);
                    const double temp = output - y_test[j];

                    rs.add(temp*temp);
                    rc.add(output, y_test[j]);
                }
            }
            catch (invalid_nu_error&)
            {
                // just ignore cases which result in an invalid nu
            }

        } // for (long i = 0; i < folds; ++i)

        matrix<double,1,2> result;
        result = rs.mean(), std::pow(rc.correlation(),2);
        return result;
    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_CROSS_VALIDATE_REGRESSION_TRaINER_H__


