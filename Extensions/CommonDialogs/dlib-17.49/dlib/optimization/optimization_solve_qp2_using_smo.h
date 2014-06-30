// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOLVE_QP2_USING_SMo_H__
#define DLIB_SOLVE_QP2_USING_SMo_H__

#include "optimization_solve_qp2_using_smo_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"


namespace dlib 
{

// ----------------------------------------------------------------------------------------

    class invalid_nu_error : public dlib::error 
    { 
    public: 
        invalid_nu_error(const std::string& msg, double nu_) : dlib::error(msg), nu(nu_) {};
        const double nu;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::type maximum_nu_impl (
        const T& y
    )
    {
        typedef typename T::type scalar_type;
        // make sure requires clause is not broken
        DLIB_ASSERT(y.size() > 1 && is_col_vector(y),
            "\ttypedef T::type maximum_nu(y)"
            << "\n\ty should be a column vector with more than one entry"
            << "\n\ty.nr(): " << y.nr() 
            << "\n\ty.nc(): " << y.nc() 
            );

        long pos_count = 0;
        long neg_count = 0;
        for (long r = 0; r < y.nr(); ++r)
        {
            if (y(r) == 1.0)
            {
                ++pos_count;
            }
            else if (y(r) == -1.0)
            {
                ++neg_count;
            }
            else
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(y(r) == -1.0 || y(r) == 1.0,
                       "\ttypedef T::type maximum_nu(y)"
                       << "\n\ty should contain only 1 and 0 entries"
                       << "\n\tr:    " << r 
                       << "\n\ty(r): " << y(r) 
                );
            }
        }
        return static_cast<scalar_type>(2.0*(scalar_type)std::min(pos_count,neg_count)/(scalar_type)y.nr());
    }

    template <
        typename T
        >
    typename T::type maximum_nu (
        const T& y
    )
    {
        return maximum_nu_impl(vector_to_matrix(y));
    }

    template <
        typename T
        >
    typename T::value_type maximum_nu (
        const T& y
    )
    {
        return maximum_nu_impl(vector_to_matrix(y));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class solve_qp2_using_smo
    {
    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;


        template <
            typename EXP1,
            typename EXP2,
            long NR
            >
        unsigned long operator() ( 
            const matrix_exp<EXP1>& Q,
            const matrix_exp<EXP2>& y,
            const scalar_type nu,
            matrix<scalar_type,NR,1,mem_manager_type, layout_type>& alpha,
            scalar_type eps
        ) 
        {
            DLIB_ASSERT(Q.nr() == Q.nc() && y.size() == Q.nr() && y.size() > 1 && is_col_vector(y) &&
                        sum((y == +1) + (y == -1)) == y.size() &&
                        0 < nu && nu <= 1 &&
                        eps > 0,
                "\t void solve_qp2_using_smo::operator()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t Q.nr():                     " << Q.nr() 
                << "\n\t Q.nc():                     " << Q.nc() 
                << "\n\t is_col_vector(y):           " << is_col_vector(y) 
                << "\n\t y.size():                   " << y.size() 
                << "\n\t sum((y == +1) + (y == -1)): " << sum((y == +1) + (y == -1)) 
                << "\n\t nu:                         " << nu 
                << "\n\t eps:                        " << eps 
                );

            alpha.set_size(Q.nr(),1);
            df.set_size(Q.nr());

            // now initialize alpha
            set_initial_alpha(y, nu, alpha);

            const scalar_type tau = 1e-12;

            typedef typename colm_exp<EXP1>::type col_type;

            set_all_elements(df, 0);
            // initialize df.  Compute df = Q*alpha
            for (long r = 0; r < df.nr(); ++r)
            {
                if (alpha(r) != 0)
                {
                    df += alpha(r)*matrix_cast<scalar_type>(colm(Q,r));
                }
            }

            unsigned long count = 0;

            // now perform the actual optimization of alpha
            long i=0, j=0;
            while (find_working_group(y,alpha,Q,df,tau,eps,i,j))
            {
                ++count;
                const scalar_type old_alpha_i = alpha(i);
                const scalar_type old_alpha_j = alpha(j);

                optimize_working_pair(alpha,Q,df,tau,i,j);

                // update the df vector now that we have modified alpha(i) and alpha(j)
                scalar_type delta_alpha_i = alpha(i) - old_alpha_i;
                scalar_type delta_alpha_j = alpha(j) - old_alpha_j;

                col_type Q_i = colm(Q,i);
                col_type Q_j = colm(Q,j);
                for(long k = 0; k < df.nr(); ++k)
                    df(k) += Q_i(k)*delta_alpha_i + Q_j(k)*delta_alpha_j;
            }

            return count;
        }

        const column_matrix& get_gradient (
        ) const { return df; }

    private:

    // -------------------------------------------------------------------------------------

        template <
            typename scalar_type,
            typename scalar_vector_type,
            typename scalar_vector_type2
            >
        inline void set_initial_alpha (
            const scalar_vector_type& y,
            const scalar_type nu,
            scalar_vector_type2& alpha
        ) const
        {
            set_all_elements(alpha,0);
            const scalar_type l = y.nr();
            scalar_type temp = nu*l/2;
            long num = (long)std::floor(temp);
            long num_total = (long)std::ceil(temp);

            bool has_slack = false;
            int count = 0;
            for (int i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == 1)
                {
                    if (count < num)
                    {
                        ++count;
                        alpha(i) = 1;
                    }
                    else 
                    {
                        has_slack = true;
                        if (num_total > num)
                        {
                            ++count;
                            alpha(i) = temp - std::floor(temp);
                        }
                        break;
                    }
                }
            }

            if (count != num_total || has_slack == false)
            {
                std::ostringstream sout;
                sout << "Invalid nu of " << nu << ".  It is required that: 0 < nu < " << 2*(scalar_type)count/y.nr();
                throw invalid_nu_error(sout.str(),nu);
            }

            has_slack = false;
            count = 0;
            for (int i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == -1)
                {
                    if (count < num)
                    {
                        ++count;
                        alpha(i) = 1;
                    }
                    else 
                    {
                        has_slack = true;
                        if (num_total > num)
                        {
                            ++count;
                            alpha(i) = temp - std::floor(temp);
                        }
                        break;
                    }
                }
            }

            if (count != num_total || has_slack == false)
            {
                std::ostringstream sout;
                sout << "Invalid nu of " << nu << ".  It is required that: 0 < nu < " << 2*(scalar_type)count/y.nr();
                throw invalid_nu_error(sout.str(),nu);
            }
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_vector_type,
            typename scalar_type,
            typename EXP,
            typename U, typename V
            >
        inline bool find_working_group (
            const V& y,
            const U& alpha,
            const matrix_exp<EXP>& Q,
            const scalar_vector_type& df,
            const scalar_type tau,
            const scalar_type eps,
            long& i_out,
            long& j_out
        ) const
        {
            using namespace std;
            long ip = 0;
            long jp = 0;
            long in = 0;
            long jn = 0;


            typedef typename colm_exp<EXP>::type col_type;
            typedef typename diag_exp<EXP>::type diag_type;

            scalar_type ip_val = -numeric_limits<scalar_type>::infinity();
            scalar_type jp_val = numeric_limits<scalar_type>::infinity();
            scalar_type in_val = -numeric_limits<scalar_type>::infinity();
            scalar_type jn_val = numeric_limits<scalar_type>::infinity();

            // loop over the alphas and find the maximum ip and in indices.
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == 1)
                {
                    if (alpha(i) < 1.0)
                    {
                        if (-df(i) > ip_val)
                        {
                            ip_val = -df(i);
                            ip = i;
                        }
                    }
                }
                else
                {
                    if (alpha(i) > 0.0)
                    {
                        if (df(i) > in_val)
                        {
                            in_val = df(i);
                            in = i;
                        }
                    }
                }
            }

            scalar_type Mp = numeric_limits<scalar_type>::infinity();
            scalar_type Mn = numeric_limits<scalar_type>::infinity();

            // Pick out the columns and diagonal of Q we need below.  Doing
            // it this way is faster if Q is actually a symmetric_matrix_cache
            // object.
            col_type Q_ip = colm(Q,ip);
            col_type Q_in = colm(Q,in);
            diag_type Q_diag = diag(Q);



            // now we need to find the minimum jp and jn indices
            for (long j = 0; j < alpha.nr(); ++j)
            {
                if (y(j) == 1)
                {
                    if (alpha(j) > 0.0)
                    {
                        scalar_type b = ip_val + df(j);
                        if (-df(j) < Mp)
                            Mp = -df(j);

                        if (b > 0)
                        {
                            scalar_type a = Q_ip(ip) + Q_diag(j) - 2*Q_ip(j); 
                            if (a <= 0)
                                a = tau;
                            scalar_type temp = -b*b/a;
                            if (temp < jp_val)
                            {
                                jp_val = temp;
                                jp = j;
                            }
                        }
                    }
                }
                else
                {
                    if (alpha(j) < 1.0)
                    {
                        scalar_type b = in_val - df(j);
                        if (df(j) < Mn)
                            Mn = df(j);

                        if (b > 0)
                        {
                            scalar_type a = Q_in(in) + Q_diag(j) - 2*Q_in(j); 
                            if (a <= 0)
                                a = tau;
                            scalar_type temp = -b*b/a;
                            if (temp < jn_val)
                            {
                                jn_val = temp;
                                jn = j;
                            }
                        }
                    }
                }
            }

            // if we are at the optimal point then return false so the caller knows
            // to stop optimizing
            if (std::max(ip_val - Mp, in_val - Mn) < eps)
                return false;

            if (jp_val < jn_val)
            {
                i_out = ip;
                j_out = jp;
            }
            else
            {
                i_out = in;
                j_out = jn;
            }

            return true;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename EXP,
            typename T, typename U
            >
        inline void optimize_working_pair (
            T& alpha,
            const matrix_exp<EXP>& Q,
            const U& df,
            const scalar_type tau,
            const long i,
            const long j
        ) const
        {
            scalar_type quad_coef = Q(i,i)+Q(j,j)-2*Q(j,i);
            if (quad_coef <= 0)
                quad_coef = tau;
            scalar_type delta = (df(i)-df(j))/quad_coef;
            scalar_type sum = alpha(i) + alpha(j);
            alpha(i) -= delta;
            alpha(j) += delta;

            if(sum > 1)
            {
                if(alpha(i) > 1)
                {
                    alpha(i) = 1;
                    alpha(j) = sum - 1;
                }
                else if(alpha(j) > 1)
                {
                    alpha(j) = 1;
                    alpha(i) = sum - 1;
                }
            }
            else
            {
                if(alpha(j) < 0)
                {
                    alpha(j) = 0;
                    alpha(i) = sum;
                }
                else if(alpha(i) < 0)
                {
                    alpha(i) = 0;
                    alpha(j) = sum;
                }
            }
        }

    // ------------------------------------------------------------------------------------

        column_matrix df; // gradient of f(alpha)
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SOLVE_QP2_USING_SMo_H__


