// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_C_TRAINER_H__ 
#define DLIB_SVm_C_TRAINER_H__

//#include "local/make_label_kernel_matrix.h"

#include "svm_c_trainer_abstract.h"
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
    class svm_c_trainer
    {
    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_c_trainer (
        ) :
            Cpos(1),
            Cneg(1),
            cache_size(200),
            eps(0.001)
        {
        }

        svm_c_trainer (
            const kernel_type& kernel_, 
            const scalar_type& C_
        ) :
            kernel_function(kernel_),
            Cpos(C_),
            Cneg(C_),
            cache_size(200),
            eps(0.001)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < C_,
                "\tsvm_c_trainer::svm_c_trainer(kernel,C)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t C_: " << C_
                );
        }

        void set_cache_size (
            long cache_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(cache_size_ > 0,
                "\tvoid svm_c_trainer::set_cache_size(cache_size_)"
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
                "\tvoid svm_c_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
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

        void set_c (
            scalar_type C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_trainer::set_c()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cpos = C;
            Cneg = C;
        }

        const scalar_type get_c_class1 (
        ) const
        {
            return Cpos;
        }

        const scalar_type get_c_class2 (
        ) const
        {
            return Cneg;
        }

        void set_c_class1 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_trainer::set_c_class1()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cpos = C;
        }

        void set_c_class2 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_trainer::set_c_class2()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cneg = C;
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
            return do_train(vector_to_matrix(x), vector_to_matrix(y));
        }

        void swap (
            svm_c_trainer& item
        )
        {
            exchange(kernel_function, item.kernel_function);
            exchange(Cpos,            item.Cpos);
            exchange(Cneg,            item.Cneg);
            exchange(cache_size,      item.cache_size);
            exchange(eps,             item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            typedef typename K::scalar_type scalar_type;
            typedef typename decision_function<K>::sample_vector_type sample_vector_type;
            typedef typename decision_function<K>::scalar_vector_type scalar_vector_type;

            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(x,y) == true,
                "\tdecision_function svm_c_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_binary_classification_problem(x,y): " << is_binary_classification_problem(x,y)
                );


            scalar_vector_type alpha;

            solve_qp3_using_smo<scalar_vector_type> solver;

            solver(symmetric_matrix_cache<float>((diagm(y)*kernel_matrix(kernel_function,x)*diagm(y)), cache_size), 
            //solver(symmetric_matrix_cache<float>(make_label_kernel_matrix(kernel_matrix(kernel_function,x),y), cache_size), 
                   uniform_matrix<scalar_type>(y.size(),1,-1),
                   y, 
                   0,
                   Cpos,
                   Cneg,
                   alpha,
                   eps);

            scalar_type b;
            calculate_b(y,alpha,solver.get_gradient(),Cpos,Cneg,b);
            alpha = pointwise_multiply(alpha,y);

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
            return decision_function<K> (sv_alpha, b, kernel_function, support_vectors);
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_vector_type,
            typename scalar_vector_type2
            >
        void calculate_b(
            const scalar_vector_type2& y,
            const scalar_vector_type& alpha,
            const scalar_vector_type& df,
            const scalar_type& Cpos,
            const scalar_type& Cneg,
            scalar_type& b
        ) const
        {
            using namespace std;
            long num_free = 0;
            scalar_type sum_free = 0;

            scalar_type upper_bound = -numeric_limits<scalar_type>::infinity();
            scalar_type lower_bound = numeric_limits<scalar_type>::infinity();

            for(long i = 0; i < alpha.nr(); ++i)
            {
                if(y(i) == 1)
                {
                    if(alpha(i) == Cpos)
                    {
                        if (df(i) > upper_bound)
                            upper_bound = df(i);
                    }
                    else if(alpha(i) == 0)
                    {
                        if (df(i) < lower_bound)
                            lower_bound = df(i);
                    }
                    else
                    {
                        ++num_free;
                        sum_free += df(i);
                    }
                }
                else
                {
                    if(alpha(i) == Cneg)
                    {
                        if (-df(i) < lower_bound)
                            lower_bound = -df(i);
                    }
                    else if(alpha(i) == 0)
                    {
                        if (-df(i) > upper_bound)
                            upper_bound = -df(i);
                    }
                    else
                    {
                        ++num_free;
                        sum_free -= df(i);
                    }
                }
            }

            if(num_free > 0)
                b = sum_free/num_free;
            else
                b = (upper_bound+lower_bound)/2;
        }

    // ------------------------------------------------------------------------------------


        kernel_type kernel_function;
        scalar_type Cpos;
        scalar_type Cneg;
        long cache_size;
        scalar_type eps;
    }; // end of class svm_c_trainer

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        svm_c_trainer<K>& a,
        svm_c_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_C_TRAINER_H__

