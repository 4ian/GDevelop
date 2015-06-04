// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_Hh_
#define DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_Hh_

#include "structural_svm_problem_threaded_abstract.h"
#include "../algs.h"
#include <vector>
#include "structural_svm_problem.h"
#include "../matrix.h"
#include "sparse_vector.h"
#include <iostream>
#include "../threads.h"
#include "../misc_api.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type_,
        typename feature_vector_type_ = matrix_type_
        >
    class structural_svm_problem_threaded : public structural_svm_problem<matrix_type_,feature_vector_type_> 
    {
    public:

        typedef matrix_type_ matrix_type;
        typedef typename matrix_type::type scalar_type;
        typedef feature_vector_type_ feature_vector_type;

        explicit structural_svm_problem_threaded (
            unsigned long num_threads
        ) :
            tp(num_threads),
            num_iterations_executed(0)
        {}

        unsigned long get_num_threads (
        ) const { return tp.num_threads_in_pool(); }

    private:

        struct binder
        {
            binder (
                const structural_svm_problem_threaded& self_,
                const matrix_type& w_,
                matrix_type& subgradient_,
                scalar_type& total_loss_,
                bool buffer_subgradients_locally_
            ) : self(self_), w(w_), subgradient(subgradient_), total_loss(total_loss_),
                buffer_subgradients_locally(buffer_subgradients_locally_){}

            void call_oracle (
                long begin,
                long end
            ) 
            {
                // If we are only going to call the separation oracle once then don't run
                // the slightly more complex for loop version of this code.  Or if we just
                // don't want to run the complex buffering one.  The code later on decides
                // if we should do the buffering based on how long it takes to execute.  We
                // do this because, when the subgradient is really high dimensional it can
                // take a lot of time to add them together.  So we might want to avoid
                // doing that.
                if (end-begin <= 1 || !buffer_subgradients_locally)
                {
                    scalar_type loss;
                    feature_vector_type ftemp;
                    for (long i = begin; i < end; ++i)
                    {
                        self.separation_oracle_cached(i, w, loss, ftemp);

                        auto_mutex lock(self.accum_mutex);
                        total_loss += loss;
                        add_to(subgradient, ftemp);
                    }
                }
                else
                {
                    scalar_type loss = 0;
                    matrix_type faccum(subgradient.size(),1);
                    faccum = 0;

                    feature_vector_type ftemp;

                    for (long i = begin; i < end; ++i)
                    {
                        scalar_type loss_temp;
                        self.separation_oracle_cached(i, w, loss_temp, ftemp);
                        loss += loss_temp;
                        add_to(faccum, ftemp);
                    }

                    auto_mutex lock(self.accum_mutex);
                    total_loss += loss;
                    add_to(subgradient, faccum);
                }
            }

            const structural_svm_problem_threaded& self;
            const matrix_type& w;
            matrix_type& subgradient;
            scalar_type& total_loss;
            bool buffer_subgradients_locally;
        };


        virtual void call_separation_oracle_on_all_samples (
            const matrix_type& w,
            matrix_type& subgradient,
            scalar_type& total_loss
        ) const
        {
            ++num_iterations_executed;

            const uint64 start_time = ts.get_timestamp();

            bool buffer_subgradients_locally = with_buffer_time.mean() < without_buffer_time.mean();

            // every 50 iterations we should try to flip the buffering scheme to see if
            // doing it the other way might be better.  
            if ((num_iterations_executed%50) == 0)
            {
                buffer_subgradients_locally = !buffer_subgradients_locally;
            }

            binder b(*this, w, subgradient, total_loss, buffer_subgradients_locally);
            parallel_for_blocked(tp, 0, this->get_num_samples(), b, &binder::call_oracle);

            const uint64 stop_time = ts.get_timestamp();

            if (buffer_subgradients_locally)
                with_buffer_time.add(stop_time-start_time);
            else
                without_buffer_time.add(stop_time-start_time);

        }

        mutable thread_pool tp;
        mutable mutex accum_mutex;
        mutable timestamper ts;
        mutable running_stats<double> with_buffer_time;
        mutable running_stats<double> without_buffer_time;
        mutable unsigned long num_iterations_executed;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_PRObLEM_THREADED_Hh_


