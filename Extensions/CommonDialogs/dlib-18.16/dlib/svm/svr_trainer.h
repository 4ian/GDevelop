// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_EPSILON_REGRESSION_TRAINER_Hh_ 
#define DLIB_SVm_EPSILON_REGRESSION_TRAINER_Hh_


#include "svr_trainer_abstract.h"
#include <cmath>
#include <limits>
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
    class svr_trainer
    {
    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svr_trainer (
        ) :
            C(1),
            eps_insensitivity(0.1),
            cache_size(200),
            eps(0.001)
        {
        }

        void set_cache_size (
            long cache_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(cache_size_ > 0,
                "\tvoid svr_trainer::set_cache_size(cache_size_)"
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
                "\tvoid svr_trainer::set_epsilon(eps_)"
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

        void set_epsilon_insensitivity (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid svr_trainer::set_epsilon_insensitivity(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
                );
            eps_insensitivity = eps_;
        }

        const scalar_type get_epsilon_insensitivity (
        ) const
        { 
            return eps_insensitivity;
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
            scalar_type C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void svr_trainer::set_c()"
                << "\n\t C must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        const scalar_type get_c (
        ) const
        {
            return C;
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
            return do_train(mat(x), mat(y));
        }

        void swap (
            svr_trainer& item
        )
        {
            exchange(kernel_function, item.kernel_function);
            exchange(C,            item.C);
            exchange(eps_insensitivity, item.eps_insensitivity);
            exchange(cache_size,      item.cache_size);
            exchange(eps,             item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <typename M>
        struct op_quad 
        {
            explicit op_quad( 
                const M& m_
            ) : m(m_) {}

            const M& m;

            typedef typename M::type type;
            typedef type const_ret_type;
            const static long cost = M::cost + 2;

            inline const_ret_type apply ( long r, long c) const
            { 
                if (r < m.nr())
                {
                    if (c < m.nc())
                    {
                        return m(r,c);
                    }
                    else
                    {
                        return -m(r,c-m.nc());
                    }
                }
                else
                {
                    if (c < m.nc())
                    {
                        return -m(r-m.nr(),c);
                    }
                    else
                    {
                        return m(r-m.nr(),c-m.nc());
                    }
                }
            }

            const static long NR = 2*M::NR;
            const static long NC = 2*M::NC;
            typedef typename M::mem_manager_type mem_manager_type;
            typedef typename M::layout_type layout_type;

            long nr () const { return 2*m.nr(); }
            long nc () const { return 2*m.nc(); }

            template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
            { return m.aliases(item); }
            template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
            { return m.aliases(item); }
        };

        template <
            typename EXP
            >
        const matrix_op<op_quad<EXP> >  make_quad (
            const matrix_exp<EXP>& m
        ) const
        /*!
            ensures
                - returns the following matrix:
                     m -m
                    -m  m
                - I.e. returns a matrix that is twice the size of m and just
                  contains copies of m and -m
        !*/
        {
            typedef op_quad<EXP> op;
            return matrix_op<op>(op(m.ref()));
        }

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
            DLIB_ASSERT(is_learning_problem(x,y) == true,
                "\tdecision_function svr_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                );


            scalar_vector_type alpha;

            solve_qp3_using_smo<scalar_vector_type> solver;

            solver(symmetric_matrix_cache<float>(make_quad(kernel_matrix(kernel_function,x)), cache_size), 
                   uniform_matrix<scalar_type>(2*x.size(),1, eps_insensitivity) + join_cols(y,-y),
                   join_cols(uniform_matrix<scalar_type>(x.size(),1,1), uniform_matrix<scalar_type>(x.size(),1,-1)), 
                   0,
                   C,
                   C,
                   alpha,
                   eps);

            scalar_type b;
            calculate_b(alpha,solver.get_gradient(),C,b);

            alpha = -rowm(alpha,range(0,x.size()-1)) + rowm(alpha,range(x.size(), alpha.size()-1));
            
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
            return decision_function<K> (sv_alpha, -b, kernel_function, support_vectors);
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_vector_type
            >
        void calculate_b(
            const scalar_vector_type& alpha,
            const scalar_vector_type& df,
            const scalar_type& C,
            scalar_type& b
        ) const
        {
            using namespace std;
            long num_free = 0;
            scalar_type sum_free = 0;

            scalar_type upper_bound = -numeric_limits<scalar_type>::infinity();
            scalar_type lower_bound = numeric_limits<scalar_type>::infinity();

            find_min_and_max(df, upper_bound, lower_bound);

            for(long i = 0; i < alpha.nr(); ++i)
            {
                if(i < alpha.nr()/2)
                {
                    if(alpha(i) == C)
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
                    if(alpha(i) == C)
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
        scalar_type C;
        scalar_type eps_insensitivity;
        long cache_size;
        scalar_type eps;
    }; // end of class svr_trainer

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        svr_trainer<K>& a,
        svr_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_EPSILON_REGRESSION_TRAINER_Hh_

