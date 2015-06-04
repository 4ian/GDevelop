// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MPC_Hh_
#define DLIB_MPC_Hh_

#include "mpc_abstract.h"
#include "../matrix.h"
#include "../algs.h"


namespace dlib
{
    template <
        long S_,
        long I_,
        unsigned long horizon_
        >
    class mpc
    {

    public:

        const static long S = S_;
        const static long I = I_;
        const static unsigned long horizon = horizon_;

        mpc(
        ) 
        {
            A = 0;
            B = 0;
            C = 0;
            Q = 0;
            R = 0;
            lower = 0;
            upper = 0;

            max_iterations = 0;
            eps = 0.01;
            for (unsigned long i = 0; i < horizon; ++i)
            {
                target[i].set_size(A.nr());
                target[i] = 0;

                controls[i].set_size(B.nc());
                controls[i] = 0;
            }
            lambda = 0;
        }

        mpc (
            const matrix<double,S,S>& A_,
            const matrix<double,S,I>& B_,
            const matrix<double,S,1>& C_,
            const matrix<double,S,1>& Q_,
            const matrix<double,I,1>& R_,
            const matrix<double,I,1>& lower_,
            const matrix<double,I,1>& upper_
        ) : A(A_), B(B_), C(C_), Q(Q_), R(R_), lower(lower_), upper(upper_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(A.nr() > 0 && B.nc() > 0,
                "\t mpc::mpc()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t A.nr(): " <<  A.nr()
                << "\n\t B.nc(): " <<  B.nc()
                );

            DLIB_ASSERT(A.nr() == A.nc() && 
                        A.nr() == B.nr() && 
                        A.nr() == C.nr() && 
                        A.nr() == Q.nr(),
                "\t mpc::mpc()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t A.nr(): " <<  A.nr()
                << "\n\t A.nc(): " <<  A.nc()
                << "\n\t B.nr(): " <<  B.nr()
                << "\n\t C.nr(): " <<  C.nr()
                << "\n\t Q.nr(): " <<  Q.nr()
                );
            DLIB_ASSERT(
                        B.nc() == R.nr() && 
                        B.nc() == lower.nr() && 
                        B.nc() == upper.nr() ,
                "\t mpc::mpc()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t B.nr(): " <<  B.nr()
                << "\n\t B.nc(): " <<  B.nc()
                << "\n\t lower.nr(): " <<  lower.nr()
                << "\n\t upper.nr(): " <<  upper.nr()
                );
            DLIB_ASSERT(min(Q) >= 0 &&
                        min(R) >  0 &&
                        min(upper-lower) >= 0,
                "\t mpc::mpc()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t min(Q): " << min(Q) 
                << "\n\t min(R): " << min(R) 
                << "\n\t min(upper-lower): " << min(upper-lower) 
                );


            max_iterations = 10000;
            eps = 0.01;
            for (unsigned long i = 0; i < horizon; ++i)
            {
                target[i].set_size(A.nr());
                target[i] = 0;

                controls[i].set_size(B.nc());
                controls[i] = 0;
            }

            // Bound the maximum eigenvalue of the hessian by computing the trace of the
            // hessian matrix. 
            lambda = sum(R)*horizon;
            matrix<double,S,S> temp = diagm(Q);
            for (unsigned long c = 0; c < horizon; ++c)
            {
                lambda += trace(trans(B)*temp*B);
                Q_diag[horizon-c-1] = diag(trans(B)*temp*B);
                temp = trans(A)*temp*A + diagm(Q);
            }

        }

        const matrix<double,S,S>& get_A (
        ) const { return A; }
        const matrix<double,S,I>& get_B (
        ) const { return B; }
        const matrix<double,S,1>& get_C (
        ) const { return C; }
        const matrix<double,S,1>& get_Q (
        ) const { return Q; }
        const matrix<double,I,1>& get_R (
        ) const { return R; }
        const matrix<double,I,1>& get_lower_constraints (
        ) const { return lower; }
        const matrix<double,I,1>& get_upper_constraints (
        ) const { return upper; }

        void set_target (
            const matrix<double,S,1>& val,
            const unsigned long time
        )
        {
            DLIB_ASSERT(time < horizon,
                "\t void mpc::set_target(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t time: " << time 
                << "\n\t horizon: " << horizon 
                );

            target[time] = val;
        }

        void set_target (
            const matrix<double,S,1>& val
        )
        {
            for (unsigned long i = 0; i < horizon; ++i)
                target[i] = val;
        }

        void set_last_target (
            const matrix<double,S,1>& val
        )
        {
            set_target(val, horizon-1);
        }

        const matrix<double,S,1>& get_target (
            const unsigned long time
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(time < horizon,
                "\t matrix mpc::get_target(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t time: " << time 
                << "\n\t horizon: " << horizon 
                );

            return target[time];
        }

        unsigned long get_max_iterations (
        ) const { return max_iterations; }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            max_iterations = max_iter;
        }

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void mpc::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
                );
            eps = eps_;
        }

        double get_epsilon (
        ) const
        { 
            return eps;
        }

        matrix<double,I,1> operator() (
            const matrix<double,S,1>& current_state
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(min(R) > 0 && A.nr() == current_state.size(),
                "\t matrix mpc::operator(current_state)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t min(R): " << min(R) 
                << "\n\t A.nr(): " << A.nr() 
                << "\n\t current_state.size(): " << current_state.size() 
                );

            // Shift the inputs over by one time step so we can use them to warm start the
            // optimizer.
            for (unsigned long i = 1; i < horizon; ++i)
                controls[i-1] = controls[i];

            solve_linear_mpc(current_state);

            for (unsigned long i = 1; i < horizon; ++i)
                target[i-1] = target[i];

            return controls[0];
        }

    private:


        // These temporary variables here just to avoid reallocating them on each call to
        // operator().
        matrix<double,S,1> M[horizon];
        matrix<double,I,1> MM[horizon];
        matrix<double,I,1> df[horizon]; 
        matrix<double,I,1> v[horizon]; 
        matrix<double,I,1> v_old[horizon]; 

        void solve_linear_mpc (
            const matrix<double,S,1>& initial_state
        )
        {
            // make it so MM == trans(K)*Q*(M-target)
            M[0] = A*initial_state + C;
            for (unsigned long i = 1; i < horizon; ++i)
                M[i] = A*M[i-1] + C;
            for (unsigned long i = 0; i < horizon; ++i)
                M[i] = diagm(Q)*(M[i]-target[i]);
            for (long i = (long)horizon-2; i >= 0; --i)
                M[i] += trans(A)*M[i+1];
            for (unsigned long i = 0; i < horizon; ++i)
                MM[i] = trans(B)*M[i];



            unsigned long iter = 0;
            for (; iter < max_iterations; ++iter)
            {
                // compute current gradient and put it into df.
                // df == H*controls + MM;
                M[0] = B*controls[0];
                for (unsigned long i = 1; i < horizon; ++i)
                    M[i] = A*M[i-1] + B*controls[i];
                for (unsigned long i = 0; i < horizon; ++i)
                    M[i] = diagm(Q)*M[i];
                for (long i = (long)horizon-2; i >= 0; --i)
                    M[i] += trans(A)*M[i+1];
                for (unsigned long i = 0; i < horizon; ++i)
                    df[i] = MM[i] + trans(B)*M[i] + diagm(R)*controls[i];



                // Check the stopping condition, which is the magnitude of the largest element
                // of the gradient.
                double max_df = 0;
                unsigned long max_t = 0;
                long max_v = 0;
                for (unsigned long i = 0; i < horizon; ++i)
                {
                    for (long j = 0; j < controls[i].size(); ++j)
                    {
                        // if this variable isn't an active constraint then we care about it's
                        // derivative.
                        if (!((controls[i](j) <= lower(j) && df[i](j) > 0) || 
                              (controls[i](j) >= upper(j) && df[i](j) < 0)))
                        {
                            if (std::abs(df[i](j)) > max_df)
                            {
                                max_df = std::abs(df[i](j));
                                max_t = i;
                                max_v = j;
                            }
                        }
                    }
                }
                if (max_df < eps)
                    break;



                // We will start out by doing a little bit of coordinate descent because it
                // allows us to optimize individual variables exactly.  Since we are warm
                // starting each iteration with a really good solution this helps speed
                // things up a lot.
                const unsigned long smo_iters = 50;
                if (iter < smo_iters)
                {
                    if (Q_diag[max_t](max_v) == 0) continue;

                    // Take the optimal step but just for one variable.
                    controls[max_t](max_v) = -(df[max_t](max_v)-Q_diag[max_t](max_v)*controls[max_t](max_v))/Q_diag[max_t](max_v);
                    controls[max_t](max_v) = put_in_range(lower(max_v), upper(max_v), controls[max_t](max_v));

                    // If this is the last SMO iteration then don't forget to initialize v
                    // for the gradient steps.
                    if (iter+1 == smo_iters)
                    {
                        for (unsigned long i = 0; i < horizon; ++i)
                            v[i] = controls[i];
                    }
                }
                else
                {
                    // Take a projected gradient step.
                    for (unsigned long i = 0; i < horizon; ++i)
                    {
                        v_old[i] = v[i];
                        v[i] = clamp(controls[i] - 1.0/lambda * df[i], lower, upper);
                        controls[i] = clamp(v[i] + (std::sqrt(lambda)-1)/(std::sqrt(lambda)+1)*(v[i]-v_old[i]), lower, upper);
                    }
                }
            }
        }

        unsigned long max_iterations;
        double eps;

        matrix<double,S,S> A;
        matrix<double,S,I> B;
        matrix<double,S,1> C;
        matrix<double,S,1> Q;
        matrix<double,I,1> R;
        matrix<double,I,1> lower;
        matrix<double,I,1> upper;
        matrix<double,S,1> target[horizon]; 

        double lambda; // abound on the largest eigenvalue of the hessian matrix.
        matrix<double,I,1> Q_diag[horizon]; 
        matrix<double,I,1> controls[horizon]; 

    };

}

#endif // DLIB_MPC_Hh_

