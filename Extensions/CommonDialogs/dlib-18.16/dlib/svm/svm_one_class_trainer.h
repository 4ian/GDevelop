// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_ONE_CLASS_TRAINER_Hh_ 
#define DLIB_SVm_ONE_CLASS_TRAINER_Hh_

#include "svm_one_class_trainer_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"

#include "function.h"
#include "kernel.h"
#include "../optimization/optimization_solve_qp3_using_smo.h"

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_one_class_trainer
    {
    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_one_class_trainer (
        ) :
            nu(0.1),
            cache_size(200),
            eps(0.001)
        {
        }

        svm_one_class_trainer (
            const kernel_type& kernel_, 
            const scalar_type& nu_
        ) :
            kernel_function(kernel_),
            nu(nu_),
            cache_size(200),
            eps(0.001)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < nu && nu <= 1,
                "\tsvm_one_class_trainer::svm_one_class_trainer(kernel,nu)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t nu: " << nu 
                );
        }

        void set_cache_size (
            long cache_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(cache_size_ > 0,
                "\tvoid svm_one_class_trainer::set_cache_size(cache_size_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t cache_size: " << cache_size_ 
                );
            cache_size = cache_size_;
        }

        long get_cache_size (
        ) const
        {
            return cache_size;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid svm_one_class_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps: " << eps_ 
                );
            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const
        { 
            return eps;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kernel_function = k;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel_function;
        }

        void set_nu (
            scalar_type nu_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < nu_ && nu_ <= 1,
                "\tvoid svm_one_class_trainer::set_nu(nu_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t nu: " << nu_ 
                );
            nu = nu_;
        }

        const scalar_type get_nu (
        ) const
        {
            return nu;
        }

        template <
            typename in_sample_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x
        ) const
        {
            return do_train(mat(x));
        }

        void swap (
            svm_one_class_trainer& item
        )
        {
            exchange(kernel_function, item.kernel_function);
            exchange(nu,              item.nu);
            exchange(cache_size,      item.cache_size);
            exchange(eps,             item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x
        ) const
        {
            typedef typename K::scalar_type scalar_type;
            typedef typename decision_function<K>::sample_vector_type sample_vector_type;
            typedef typename decision_function<K>::scalar_vector_type scalar_vector_type;

            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) && x.size() > 0,
                "\tdecision_function svm_one_class_trainer::train(x)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t x.nc(): " << x.nc() 
                );


            scalar_vector_type alpha;

            solve_qp3_using_smo<scalar_vector_type> solver;

            solver(symmetric_matrix_cache<float>(kernel_matrix(kernel_function,x), cache_size), 
                   zeros_matrix<scalar_type>(x.size(),1),
                   ones_matrix<scalar_type>(x.size(),1), 
                   nu*x.size(),
                   1,
                   1,
                   alpha,
                   eps);

            scalar_type rho;
            calculate_rho(alpha,solver.get_gradient(),rho);


            // count the number of support vectors
            const long sv_count = (long)sum(alpha != 0);

            scalar_vector_type sv_alpha;
            sample_vector_type support_vectors;

            // size these column vectors so that they have an entry for each support vector
            sv_alpha.set_size(sv_count);
            support_vectors.set_size(sv_count);

            // load the support vectors and their alpha values into these new column matrices
            long idx = 0;
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (alpha(i) != 0)
                {
                    sv_alpha(idx) = alpha(i);
                    support_vectors(idx) = x(i);
                    ++idx;
                }
            }

            // now return the decision function
            return decision_function<K> (sv_alpha, rho, kernel_function, support_vectors);
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_vector_type
            >
        void calculate_rho(
            const scalar_vector_type& alpha,
            const scalar_vector_type& df,
            scalar_type& rho
        ) const
        {
            using namespace std;
            long num_p_free = 0;
            scalar_type sum_p_free = 0;


            scalar_type upper_bound_p;
            scalar_type lower_bound_p;

            find_min_and_max(df, upper_bound_p, lower_bound_p);

            for(long i = 0; i < alpha.nr(); ++i)
            {
                if(alpha(i) == 1)
                {
                    if (df(i) > upper_bound_p)
                        upper_bound_p = df(i);
                }
                else if(alpha(i) == 0)
                {
                    if (df(i) < lower_bound_p)
                        lower_bound_p = df(i);
                }
                else
                {
                    ++num_p_free;
                    sum_p_free += df(i);
                }
            }

            scalar_type r1;
            if(num_p_free > 0)
                r1 = sum_p_free/num_p_free;
            else
                r1 = (upper_bound_p+lower_bound_p)/2;

            rho = r1;
        } 

        kernel_type kernel_function;
        scalar_type nu;
        long cache_size;
        scalar_type eps;
    }; // end of class svm_one_class_trainer

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        svm_one_class_trainer<K>& a,
        svm_one_class_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_ONE_CLASS_TRAINER_Hh_

