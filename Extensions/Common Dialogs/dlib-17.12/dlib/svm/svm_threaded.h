// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
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

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace cvtti_helpers
    {
        template <typename trainer_type>
        struct job
        {
            typedef typename trainer_type::scalar_type scalar_type;
            typedef typename trainer_type::sample_type sample_type;
            typedef typename trainer_type::mem_manager_type mem_manager_type;
            typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
            typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

            trainer_type trainer;
            sample_vector_type x_test, x_train;
            scalar_vector_type y_test, y_train;
        };

        template <typename trainer_type>
        void swap(
            job<trainer_type>& a,
            job<trainer_type>& b
        )
        {
            exchange(a.trainer, b.trainer);
            exchange(a.x_test, b.x_test);
            exchange(a.y_test, b.y_test);
            exchange(a.x_train, b.x_train);
            exchange(a.y_train, b.y_train);
        }

        template <typename trainer_type>
        class a_thread : multithreaded_object 
        {
        public:
            typedef typename trainer_type::scalar_type scalar_type;
            typedef typename trainer_type::sample_type sample_type;
            typedef typename trainer_type::mem_manager_type mem_manager_type;
            typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
            typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

            explicit a_thread( long num_threads) : job_pipe(1), res_pipe(3) 
            {
                for (long i = 0; i < num_threads; ++i)
                {
                    register_thread(*this, &a_thread::thread);
                }
                start();
            }

            ~a_thread()
            {
                // disable the job_pipe so that the threads will unblock and terminate
                job_pipe.disable();
                wait();
            }

            typename pipe<job<trainer_type> > ::kernel_1a job_pipe;
            typename pipe<matrix<scalar_type, 1, 2, mem_manager_type> >::kernel_1a res_pipe;

        private:

            void thread()
            {
                job<trainer_type> j;
                matrix<scalar_type, 1, 2, mem_manager_type> temp_res;
                while (job_pipe.dequeue(j))
                {
                    temp_res = test_binary_decision_function(j.trainer.train(j.x_train, j.y_train), j.x_test, j.y_test);

                    res_pipe.enqueue(temp_res);
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
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(x,y) == true &&
                    1 < folds && folds <= x.nr() &&
                    num_threads > 0,
            "\tmatrix cross_validate_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.nr(): " << x.nr() 
            << "\n\t folds:  " << folds 
            << "\n\t num_threads:  " << num_threads 
            << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
            );


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


        typename trainer_type::trained_function_type d;

        long pos_idx = 0;
        long neg_idx = 0;



        job<trainer_type> j;
        a_thread<trainer_type> threads(num_threads);

        for (long i = 0; i < folds; ++i)
        {
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
                    j.x_test(cur) = x(pos_idx);
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
                    j.x_test(cur) = x(neg_idx);
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
                    j.x_train(cur) = x(train_pos_idx);
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
                    j.x_train(cur) = x(train_neg_idx);
                    j.y_train(cur) = -1.0;
                    ++cur;
                }
                train_neg_idx = (train_neg_idx+1)%x.nr();
            }

            // add this job to the job pipe so that the threads
            // will process it
            threads.job_pipe.enqueue(j);

        } // for (long i = 0; i < folds; ++i)

        matrix<scalar_type, 1, 2, mem_manager_type> res;
        matrix<scalar_type, 1, 2, mem_manager_type> temp_res;
        set_all_elements(res,0);

        // now wait for the threads to finish
        for (long i = 0; i < folds; ++i)
        {
            threads.res_pipe.dequeue(temp_res);
            res += temp_res;
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
                                           vector_to_matrix(x),
                                           vector_to_matrix(y),
                                           folds,
                                           num_threads);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_THREADED_


