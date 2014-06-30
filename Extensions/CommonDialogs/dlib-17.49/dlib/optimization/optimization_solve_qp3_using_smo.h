// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOLVE_QP3_USING_SMo_H__
#define DLIB_SOLVE_QP3_USING_SMo_H__

#include "optimization_solve_qp3_using_smo_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"


namespace dlib 
{

// ----------------------------------------------------------------------------------------

    class invalid_qp3_error : public dlib::error 
    { 

    public: 
        invalid_qp3_error(
            const std::string& msg, 
            double B_,
            double Cp_,
            double Cn_
        ) : 
            dlib::error(msg), 
            B(B_),
            Cp(Cp_),
            Cn(Cn_)
        {};

        const double B;
        const double Cp;
        const double Cn;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class solve_qp3_using_smo
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
            typename EXP3,
            long NR
            >
        unsigned long operator() ( 
            const matrix_exp<EXP1>& Q,
            const matrix_exp<EXP2>& p,
            const matrix_exp<EXP3>& y,
            const scalar_type B,
            const scalar_type Cp,
            const scalar_type Cn,
            matrix<scalar_type,NR,1,mem_manager_type, layout_type>& alpha,
            scalar_type eps
        ) 
        {
            DLIB_ASSERT(Q.nr() == Q.nc() && y.size() == Q.nr() && p.size() == y.size() && 
                        y.size() > 0 && is_col_vector(y) && is_col_vector(p) &&
                        sum((y == +1) + (y == -1)) == y.size() &&
                        Cp > 0 && Cn > 0 &&
                        eps > 0,
                "\t void solve_qp3_using_smo::operator()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t Q.nr():                     " << Q.nr() 
                << "\n\t Q.nc():                     " << Q.nc() 
                << "\n\t is_col_vector(p):           " << is_col_vector(p) 
                << "\n\t p.size():                   " << p.size() 
                << "\n\t is_col_vector(y):           " << is_col_vector(y) 
                << "\n\t y.size():                   " << y.size() 
                << "\n\t sum((y == +1) + (y == -1)): " << sum((y == +1) + (y == -1)) 
                << "\n\t Cp:                         " << Cp
                << "\n\t Cn:                         " << Cn
                << "\n\t eps:                        " << eps 
                );



            set_initial_alpha(y, B, Cp, Cn, alpha);


            const scalar_type tau = 1e-12;

            typedef typename colm_exp<EXP1>::type col_type;

            // initialize df.  Compute df = Q*alpha + p
            df = p;
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
            while (find_working_group(y,alpha,Q,df,Cp,Cn,tau,eps,i,j))
            {
                ++count;
                const scalar_type old_alpha_i = alpha(i);
                const scalar_type old_alpha_j = alpha(j);

                optimize_working_pair(alpha,Q,y,df,tau,i,j, Cp, Cn );

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
            const scalar_type B,
            const scalar_type Cp,
            const scalar_type Cn,
            scalar_vector_type2& alpha
        ) const
        {
            alpha.set_size(y.size());

            set_all_elements(alpha,0);

            // It's easy in the B == 0 case
            if (B == 0)
                return;

            const scalar_type C = (B > 0)?  Cp : Cn;

            scalar_type temp = std::abs(B)/C;
            long num = (long)std::floor(temp);
            long num_total = (long)std::ceil(temp);

            const scalar_type B_sign = (B > 0)? 1 : -1;

            long count = 0;
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == B_sign)
                {
                    if (count < num)
                    {
                        ++count;
                        alpha(i) = C;
                    }
                    else 
                    {
                        if (count < num_total)
                        {
                            ++count;
                            alpha(i) = C*(temp - std::floor(temp));
                        }
                        break;
                    }
                }
            }

            if (count != num_total)
            {
                std::ostringstream sout;
                sout << "Invalid QP3 constraint parameters of B: " << B << ", Cp: " << Cp << ", Cn: "<< Cn;
                throw invalid_qp3_error(sout.str(),B,Cp,Cn);
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
            const scalar_type Cp,
            const scalar_type Cn,
            const scalar_type tau,
            const scalar_type eps,
            long& i_out,
            long& j_out
        ) const
        {
            using namespace std;

            long ip = 0;
            long jp = 0;


            typedef typename colm_exp<EXP>::type col_type;
            typedef typename diag_exp<EXP>::type diag_type;

            scalar_type ip_val = -numeric_limits<scalar_type>::infinity();
            scalar_type jp_val = numeric_limits<scalar_type>::infinity();

            // loop over the alphas and find the maximum ip and in indices.
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == 1)
                {
                    if (alpha(i) < Cp)
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
                        if (df(i) > ip_val)
                        {
                            ip_val = df(i);
                            ip = i;
                        }
                    }
                }
            }

            scalar_type Mp = -numeric_limits<scalar_type>::infinity();

            // Pick out the column and diagonal of Q we need below.  Doing
            // it this way is faster if Q is actually a symmetric_matrix_cache
            // object.
            col_type Q_ip = colm(Q,ip);
            diag_type Q_diag = diag(Q);



            // now we need to find the minimum jp indices
            for (long j = 0; j < alpha.nr(); ++j)
            {
                if (y(j) == 1)
                {
                    if (alpha(j) > 0.0)
                    {
                        scalar_type b = ip_val + df(j);
                        if (df(j) > Mp)
                            Mp = df(j);

                        if (b > 0)
                        {
                            scalar_type a = Q_ip(ip) + Q_diag(j) - 2*y(ip)*Q_ip(j); 
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
                    if (alpha(j) < Cn)
                    {
                        scalar_type b = ip_val - df(j);
                        if (-df(j) > Mp)
                            Mp = -df(j);

                        if (b > 0)
                        {
                            scalar_type a = Q_ip(ip) + Q_diag(j) + 2*y(ip)*Q_ip(j); 
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
            }

            // if we are at the optimal point then return false so the caller knows
            // to stop optimizing
            if (Mp + ip_val < eps)
                return false;


            i_out = ip;
            j_out = jp;

            return true;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename EXP,
            typename EXP2,
            typename T, typename U
            >
        inline void optimize_working_pair (
            T& alpha,
            const matrix_exp<EXP>& Q,
            const matrix_exp<EXP2>& y,
            const U& df,
            const scalar_type& tau,
            const long i,
            const long j,
            const scalar_type& Cp,
            const scalar_type& Cn
        ) const
        {
            const scalar_type Ci = (y(i) > 0 )? Cp : Cn;
            const scalar_type Cj = (y(j) > 0 )? Cp : Cn;

            if (y(i) != y(j))
            {
                scalar_type quad_coef = Q(i,i)+Q(j,j)+2*Q(j,i);
                if (quad_coef <= 0)
                    quad_coef = tau;
                scalar_type delta = (-df(i)-df(j))/quad_coef;
                scalar_type diff = alpha(i) - alpha(j);
                alpha(i) += delta;
                alpha(j) += delta;

                if (diff > 0)
                {
                    if (alpha(j) < 0)
                    {
                        alpha(j) = 0;
                        alpha(i) = diff;
                    }
                }
                else
                {
                    if (alpha(i) < 0)
                    {
                        alpha(i) = 0;
                        alpha(j) = -diff;
                    }
                }

                if (diff > Ci - Cj)
                {
                    if (alpha(i) > Ci)
                    {
                        alpha(i) = Ci;
                        alpha(j) = Ci - diff;
                    }
                }
                else
                {
                    if (alpha(j) > Cj)
                    {
                        alpha(j) = Cj;
                        alpha(i) = Cj + diff;
                    }
                }
            }
            else
            {
                scalar_type quad_coef = Q(i,i)+Q(j,j)-2*Q(j,i);
                if (quad_coef <= 0)
                    quad_coef = tau;
                scalar_type delta = (df(i)-df(j))/quad_coef;
                scalar_type sum = alpha(i) + alpha(j);
                alpha(i) -= delta;
                alpha(j) += delta;

                if(sum > Ci)
                {
                    if(alpha(i) > Ci)
                    {
                        alpha(i) = Ci;
                        alpha(j) = sum - Ci;
                    }
                }
                else
                {
                    if(alpha(j) < 0)
                    {
                        alpha(j) = 0;
                        alpha(i) = sum;
                    }
                }

                if(sum > Cj)
                {
                    if(alpha(j) > Cj)
                    {
                        alpha(j) = Cj;
                        alpha(i) = sum - Cj;
                    }
                }
                else
                {
                    if(alpha(i) < 0)
                    {
                        alpha(i) = 0;
                        alpha(j) = sum;
                    }
                }

            }
        }

    // ------------------------------------------------------------------------------------

        column_matrix df; // gradient of f(alpha)
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SOLVE_QP3_USING_SMo_H__


