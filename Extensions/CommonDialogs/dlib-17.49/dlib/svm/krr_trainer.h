// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KRR_TRAInER_H__
#define DLIB_KRR_TRAInER_H__

#include "../algs.h"
#include "function.h"
#include "kernel.h"
#include "empirical_kernel_map.h"
#include "linearly_independent_subset_finder.h"
#include "../statistics.h"
#include "rr_trainer.h"
#include "krr_trainer_abstract.h"
#include <vector>
#include <iostream>

namespace dlib
{
    template <
        typename K 
        >
    class krr_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        krr_trainer (
        ) :
            verbose(false),
            max_basis_size(400),
            ekm_stale(true)
        {
        }

        void be_verbose (
        )
        {
            verbose = true;
            trainer.be_verbose();
        }

        void be_quiet (
        )
        {
            verbose = false;
            trainer.be_quiet();
        }

        void use_regression_loss_for_loo_cv (
        )
        {
            trainer.use_regression_loss_for_loo_cv();
        }

        void use_classification_loss_for_loo_cv (
        )
        {
            trainer.use_classification_loss_for_loo_cv();
        }

        bool will_use_regression_loss_for_loo_cv (
        ) const
        {
            return trainer.will_use_regression_loss_for_loo_cv();
        }

        const kernel_type get_kernel (
        ) const
        {
            return kern;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kern = k;
        }

        template <typename T>
        void set_basis (
            const T& basis_samples
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(basis_samples.size() > 0 && is_vector(vector_to_matrix(basis_samples)),
                "\tvoid krr_trainer::set_basis(basis_samples)"
                << "\n\t You have to give a non-empty set of basis_samples and it must be a vector"
                << "\n\t basis_samples.size():                       " << basis_samples.size() 
                << "\n\t is_vector(vector_to_matrix(basis_samples)): " << is_vector(vector_to_matrix(basis_samples)) 
                << "\n\t this: " << this
                );

            basis = vector_to_matrix(basis_samples);
            ekm_stale = true;
        }

        bool basis_loaded (
        ) const
        {
            return (basis.size() != 0);
        }

        void clear_basis (
        )
        {
            basis.set_size(0);
            ekm.clear();
            ekm_stale = true;
        }

        unsigned long get_max_basis_size (
        ) const
        {
            return max_basis_size;
        }

        void set_max_basis_size (
            unsigned long max_basis_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(max_basis_size_ > 0,
                "\t void krr_trainer::set_max_basis_size()"
                << "\n\t max_basis_size_ must be greater than 0"
                << "\n\t max_basis_size_: " << max_basis_size_ 
                << "\n\t this:            " << this
                );

            max_basis_size = max_basis_size_;
        }

        void set_lambda (
            scalar_type lambda_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(lambda_ >= 0,
                "\t void krr_trainer::set_lambda()"
                << "\n\t lambda must be greater than or equal to 0"
                << "\n\t lambda_: " << lambda_
                << "\n\t this:   " << this
                );

            trainer.set_lambda(lambda_);
        }

        const scalar_type get_lambda (
        ) const
        {
            return trainer.get_lambda();
        }

        template <typename EXP>
        void set_search_lambdas (
            const matrix_exp<EXP>& lambdas
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_vector(lambdas) && lambdas.size() > 0 && min(lambdas) > 0,
                "\t void krr_trainer::set_search_lambdas()"
                << "\n\t lambdas must be a non-empty vector of values"
                << "\n\t is_vector(lambdas): " << is_vector(lambdas) 
                << "\n\t lambdas.size():     " << lambdas.size()
                << "\n\t min(lambdas):       " << min(lambdas) 
                << "\n\t this:   " << this
                );

            trainer.set_search_lambdas(lambdas);
        }

        const matrix<scalar_type,0,0,mem_manager_type>& get_search_lambdas (
        ) const
        {
            return trainer.get_search_lambdas();
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            std::vector<scalar_type> temp;
            scalar_type temp2;
            return do_train(vector_to_matrix(x), vector_to_matrix(y), false, temp, temp2);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values
        ) const
        {
            scalar_type temp;
            return do_train(vector_to_matrix(x), vector_to_matrix(y), true, loo_values, temp);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values,
            scalar_type& lambda_used 
        ) const
        {
            return do_train(vector_to_matrix(x), vector_to_matrix(y), true, loo_values, lambda_used);
        }


    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            const bool output_loo_values,
            std::vector<scalar_type>& loo_values,
            scalar_type& the_lambda
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,y),
                "\t decision_function krr_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t is_vector(x): " << is_vector(x)
                << "\n\t is_vector(y): " << is_vector(y)
                << "\n\t x.size():     " << x.size() 
                << "\n\t y.size():     " << y.size() 
                );

#ifdef ENABLE_ASSERTS
            if (get_lambda() == 0 && will_use_regression_loss_for_loo_cv() == false)
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(is_binary_classification_problem(x,y),
                    "\t decision_function krr_trainer::train(x,y)"
                    << "\n\t invalid inputs were given to this function"
                    );
            }
#endif

            // The first thing we do is make sure we have an appropriate ekm ready for use below.
            if (basis_loaded())
            {
                if (ekm_stale)
                {
                    ekm.load(kern, basis);
                    ekm_stale = false;
                }
            }
            else
            {
                linearly_independent_subset_finder<kernel_type> lisf(kern, max_basis_size);
                fill_lisf(lisf, x);
                ekm.load(lisf);
            }

            if (verbose)
            {
                std::cout << "\nNumber of basis vectors used: " << ekm.out_vector_size() << std::endl;
            }

            typedef matrix<scalar_type,0,1,mem_manager_type> column_matrix_type;
            typedef matrix<scalar_type,0,0,mem_manager_type> general_matrix_type;

            running_stats<scalar_type> rs;

            // Now we project all the x samples into kernel space using our EKM 
            matrix<column_matrix_type,0,1,mem_manager_type > proj_x;
            proj_x.set_size(x.size());
            for (long i = 0; i < proj_x.size(); ++i)
            {
                scalar_type err;
                // Note that we also append a 1 to the end of the vectors because this is
                // a convenient way of dealing with the bias term later on.
                if (verbose == false)
                {
                    proj_x(i) = ekm.project(x(i));
                }
                else
                {
                    proj_x(i) = ekm.project(x(i),err);
                    rs.add(err);
                }
            }

            if (verbose)
            {
                std::cout << "Mean EKM projection error:                  " << rs.mean() << std::endl;
                std::cout << "Standard deviation of EKM projection error: " << rs.stddev() << std::endl;
            }


            decision_function<linear_kernel<matrix<scalar_type,0,0,mem_manager_type> > > lin_df;

            if (output_loo_values)
                lin_df = trainer.train(proj_x,y, loo_values, the_lambda);
            else
                lin_df = trainer.train(proj_x,y);

            // convert the linear decision function into a kernelized one.
            decision_function<kernel_type> df;
            df = ekm.convert_to_decision_function(lin_df.basis_vectors(0));
            df.b = lin_df.b; 

            // If we used an automatically derived basis then there isn't any point in
            // keeping the ekm around.  So free its memory.
            if (basis_loaded() == false)
            {
                ekm.clear();
            }

            return df;
        }


        /*!
            CONVENTION
                - if (ekm_stale) then
                    - kern or basis have changed since the last time
                      they were loaded into the ekm

                - get_lambda() == trainer.get_lambda()
                - get_kernel() == kern
                - get_max_basis_size() == max_basis_size
                - will_use_regression_loss_for_loo_cv() == trainer.will_use_regression_loss_for_loo_cv() 
                - get_search_lambdas() == trainer.get_search_lambdas() 

                - basis_loaded() == (basis.size() != 0)
        !*/

        rr_trainer<linear_kernel<matrix<scalar_type,0,0,mem_manager_type> > > trainer;

        bool verbose;


        kernel_type kern;
        unsigned long max_basis_size;

        matrix<sample_type,0,1,mem_manager_type> basis;
        mutable empirical_kernel_map<kernel_type> ekm;
        mutable bool ekm_stale; 

    }; 

}

#endif // DLIB_KRR_TRAInER_H__


