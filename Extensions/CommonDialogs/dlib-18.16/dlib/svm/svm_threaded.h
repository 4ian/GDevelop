// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_THREADED_
#define DLIB_SVm_THREADED_

#include "svm_threaded_abstract.h"
#include "svm.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"
#include "../serialize.h"
#include "function.h"
#include "kernel.h"
#include "../threads.h"
#include <vector>
#include "../smart_pointers.h"
#include "../pipe.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace cvtti_helpers
    {
        template <typename trainer_type, typename in_sample_vector_type>
        struct job
        {
            typedef typename trainer_type::scalar_type scalar_type;
            typedef typename trainer_type::sample_type sample_type;
            typedef typename trainer_type::mem_manager_type mem_manager_type;
            typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
            typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

            job() : x(0) {}

            trainer_type trainer;
            matrix<long,0,1> x_test, x_train;
            scalar_vector_type y_test, y_train;
            const in_sample_vector_type* x;
        };

        struct task  
        {
            template <
                typename trainer_type,
                typename matrix_type,
                typename in_sample_vector_type
                >
            void operator()(
                job<trainer_type,in_sample_vector_type>& j,
                matrix_type& result
            )
            {
                try
                {
                    result = test_binary_decision_function(j.trainer.train(rowm(*j.x,j.x_train), j.y_train), rowm(*j.x,j.x_test), j.y_test);

                    // Do this just to make j release it's memory since people might run threaded cross validation
                    // on very large datasets.  Every bit of freed memory helps out.
                    j = job<trainer_type,in_sample_vector_type>();
                }
                catch (invalid_nu_error&)
                {
                    // If this is a svm_nu_trainer then we might get this exception if the nu is
                    // invalid.  In this case just return a cross validation score of 0.
                    result = 0;
                }
                catch (std::bad_alloc&)
                {
                    std::cerr << "\nstd::bad_alloc thrown while running cross_validate_trainer_threaded().  Not enough memory.\n" << std::endl;
                    throw;
                }
            }
        };
    }

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename trainer_type::scalar_type, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer_threaded_impl (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds,
        const long num_threads
    )
    {
        using namespace dlib::cvtti_helpers;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(x,y) == true &&
                    1 < folds && folds <= std::min(sum(y>0),sum(y<0)) &&
                    num_threads > 0,
            "\tmatrix cross_validate_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t std::min(sum(y>0),sum(y<0)): " << std::min(sum(y>0),sum(y<0))
            << "\n\t folds:  " << folds 
            << "\n\t num_threads:  " << num_threads 
            << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
            );


        task mytask;
        thread_pool tp(num_threads);


        // count the number of positive and negative examples
        long num_pos = 0;
        long num_neg = 0;
        for (long r = 0; r < y.nr(); ++r)
        {
            if (y(r) == +1.0)
                ++num_pos;
            else
                ++num_neg;
        }

        // figure out how many positive and negative examples we will have in each fold
        const long num_pos_test_samples = num_pos/folds; 
        const long num_pos_train_samples = num_pos - num_pos_test_samples; 
        const long num_neg_test_samples = num_neg/folds; 
        const long num_neg_train_samples = num_neg - num_neg_test_samples; 


        long pos_idx = 0;
        long neg_idx = 0;



        std::vector<future<job<trainer_type,in_sample_vector_type> > > jobs(folds);
        std::vector<future<matrix<scalar_type, 1, 2, mem_manager_type> > > results(folds);


        for (long i = 0; i < folds; ++i)
        {
            job<trainer_type,in_sample_vector_type>& j = jobs[i].get();

            j.x = &x;
            j.x_test.set_size (num_pos_test_samples  + num_neg_test_samples);
            j.y_test.set_size (num_pos_test_samples  + num_neg_test_samples);
            j.x_train.set_size(num_pos_train_samples + num_neg_train_samples);
            j.y_train.set_size(num_pos_train_samples + num_neg_train_samples);
            j.trainer = trainer;

            long cur = 0;

            // load up our positive test samples
            while (cur < num_pos_test_samples)
            {
                if (y(pos_idx) == +1.0)
                {
                    j.x_test(cur) = pos_idx;
                    j.y_test(cur) = +1.0;
                    ++cur;
                }
                pos_idx = (pos_idx+1)%x.nr();
            }

            // load up our negative test samples
            while (cur < j.x_test.nr())
            {
                if (y(neg_idx) == -1.0)
                {
                    j.x_test(cur) = neg_idx;
                    j.y_test(cur) = -1.0;
                    ++cur;
                }
                neg_idx = (neg_idx+1)%x.nr();
            }

            // load the training data from the data following whatever we loaded
            // as the testing data
            long train_pos_idx = pos_idx;
            long train_neg_idx = neg_idx;
            cur = 0;

            // load up our positive train samples
            while (cur < num_pos_train_samples)
            {
                if (y(train_pos_idx) == +1.0)
                {
                    j.x_train(cur) = train_pos_idx;
                    j.y_train(cur) = +1.0;
                    ++cur;
                }
                train_pos_idx = (train_pos_idx+1)%x.nr();
            }

            // load up our negative train samples
            while (cur < j.x_train.nr())
            {
                if (y(train_neg_idx) == -1.0)
                {
                    j.x_train(cur) = train_neg_idx;
                    j.y_train(cur) = -1.0;
                    ++cur;
                }
                train_neg_idx = (train_neg_idx+1)%x.nr();
            }

            // finally spawn a task to process this job
            tp.add_task(mytask, jobs[i], results[i]);

        } // for (long i = 0; i < folds; ++i)

        matrix<scalar_type, 1, 2, mem_manager_type> res;
        set_all_elements(res,0);

        // now compute the total results
        for (long i = 0; i < folds; ++i)
        {
            res += results[i].get();
        }

        return res/(scalar_type)folds;
    }

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
    )
    {
        return cross_validate_trainer_threaded_impl(trainer,
                                           mat(x),
                                           mat(y),
                                           folds,
                                           num_threads);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_THREADED_


