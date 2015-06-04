// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <string>
#include <sstream>

#include <dlib/control.h>
#include "tester.h"

namespace  
{
    using namespace test;
    using namespace std;
    using namespace dlib;
  
    logger dlog("test.mpc");

    template <
        typename EXP1,
        typename EXP2,
        typename T, long NR, long NC, typename MM, typename L
        >
    unsigned long solve_qp_box_using_smo ( 
        const matrix_exp<EXP1>& _Q,
        const matrix_exp<EXP2>& _b,
        matrix<T,NR,NC,MM,L>& alpha,
        matrix<T,NR,NC,MM,L>& lower,
        matrix<T,NR,NC,MM,L>& upper,
        T eps,
        unsigned long max_iter
    )
    /*!
        ensures
            - solves: 0.5*trans(x)*Q*x + trans(b)*x where x is box constrained.
    !*/
    {
        const_temp_matrix<EXP1> Q(_Q);
        const_temp_matrix<EXP2> b(_b);
        //cout << "IN QP SOLVER" << endl;
        //cout << "max eig: " << max(real_eigenvalues(Q)) << endl;
        //cout << "min eig: " << min(real_eigenvalues(Q)) << endl;
        //cout << "Q: \n" << Q << endl;
        //cout << "b: \n" << b << endl;

        // make sure requires clause is not broken
        DLIB_ASSERT(Q.nr() == Q.nc() &&
                     alpha.size() == lower.size() &&
                     alpha.size() == upper.size() &&
                     is_col_vector(b) &&
                     is_col_vector(alpha) &&
                     is_col_vector(lower) &&
                     is_col_vector(upper) &&
                     b.size() == alpha.size() &&
                     b.size() == Q.nr() &&
                     alpha.size() > 0 &&
                     0 <= min(alpha-lower) &&
                     0 <= max(upper-alpha) &&
                     eps > 0 &&
                     max_iter > 0,
                     "\t unsigned long solve_qp_box_using_smo()"
                     << "\n\t Invalid arguments were given to this function"
                     << "\n\t Q.nr():               " << Q.nr()
                     << "\n\t Q.nc():               " << Q.nc()
                     << "\n\t is_col_vector(b):     " << is_col_vector(b)
                     << "\n\t is_col_vector(alpha): " << is_col_vector(alpha)
                     << "\n\t is_col_vector(lower): " << is_col_vector(lower)
                     << "\n\t is_col_vector(upper): " << is_col_vector(upper)
                     << "\n\t b.size():             " << b.size() 
                     << "\n\t alpha.size():         " << alpha.size() 
                     << "\n\t lower.size():         " << lower.size() 
                     << "\n\t upper.size():         " << upper.size() 
                     << "\n\t Q.nr():               " << Q.nr() 
                     << "\n\t min(alpha-lower):     " << min(alpha-lower) 
                     << "\n\t max(upper-alpha):     " << max(upper-alpha) 
                     << "\n\t eps:                  " << eps 
                     << "\n\t max_iter:             " << max_iter 
        );


        // Compute f'(alpha) (i.e. the gradient of f(alpha)) for the current alpha.  
        matrix<T,NR,NC,MM,L> df = Q*alpha + b;
        matrix<T,NR,NC,MM,L> QQ = reciprocal_max(diag(Q));


        unsigned long iter = 0;
        for (; iter < max_iter; ++iter)
        {
            T max_df = 0;
            long best_r =0;
            for (long r = 0; r < Q.nr(); ++r)
            {
                if (alpha(r) <= lower(r) && df(r) > 0)
                    ;//alpha(r) = lower(r);
                else if (alpha(r) >= upper(r) && df(r) < 0)
                    ;//alpha(r) = upper(r);
                else if (std::abs(df(r)) > max_df)
                {
                    best_r = r;
                    max_df = std::abs(df(r));
                }
            }

            //for (long r = 0; r < Q.nr(); ++r)
            long r = best_r;
            {

                const T old_alpha = alpha(r);
                alpha(r) = -(df(r)-Q(r,r)*alpha(r))*QQ(r);
                if (alpha(r) < lower(r))
                    alpha(r) = lower(r);
                else if (alpha(r) > upper(r))
                    alpha(r) = upper(r);

                const T delta = old_alpha-alpha(r);

                // Now update the gradient. We will perform the equivalent of: df = Q*alpha + b;
                for(long k = 0; k < df.nr(); ++k)
                    df(k) -= Q(r,k)*delta;
            }

            if (max_df < eps)
                break;
        }
        //cout << "df: \n" << trans(df) << endl;
        //cout << "objective value: " << 0.5*trans(alpha)*Q*alpha + trans(b)*alpha << endl;

        return iter+1;
    }

// ----------------------------------------------------------------------------------------

    namespace impl_mpc
    {
        template <long N>
        void pack(
            matrix<double,0,1>& out,
            const std::vector<matrix<double,N,1> >& item
        )
        {
            DLIB_CASSERT(item.size() != 0,"");
            out.set_size(item.size()*item[0].size());
            long j = 0;
            for (unsigned long i = 0; i < item.size(); ++i)
                for (long r = 0; r < item[i].size(); ++r)
                    out(j++) = item[i](r);
        }

        template <long N>
        void pack(
            matrix<double,0,1>& out,
            const matrix<double,N,1>& item,
            const long num
        )
        {
            out.set_size(item.size()*num);
            long j = 0;
            for (long r = 0; r < num; ++r)
                for (long i = 0; i < item.size(); ++i)
                    out(j++) = item(i);
        }

        template <long N>
        void unpack(
            std::vector<matrix<double,N,1> >& out,
            const matrix<double,0,1>& item 
        )
        {
            DLIB_CASSERT(out.size() != 0,"");
            DLIB_CASSERT((long)out.size()*out[0].size() == item.size(),"");
            long j = 0;
            for (unsigned long i = 0; i < out.size(); ++i)
                for (long r = 0; r < out[i].size(); ++r)
                    out[i](r) = item(j++);
        }
    }

    template <long S, long I>
    unsigned long solve_linear_mpc (
        const matrix<double,S,S>& A,
        const matrix<double,S,I>& B,
        const matrix<double,S,1>& C,
        const matrix<double,S,1>& Q,
        const matrix<double,I,1>& R,
        const matrix<double,I,1>& _lower,
        const matrix<double,I,1>& _upper,
        const std::vector<matrix<double,S,1> >& target, 
        const matrix<double,S,1>& initial_state,
        std::vector<matrix<double,I,1> >& controls // input and output
    )
    {
        using namespace impl_mpc;
        DLIB_CASSERT(target.size() == controls.size(),"");

        matrix<double> K(B.nr()*controls.size(), B.nc()*controls.size());
        matrix<double,0,1> M(B.nr()*controls.size());

        // compute powers of A: Apow[i] == A^i
        std::vector<matrix<double,S,S> > Apow(controls.size());
        Apow[0] = identity_matrix(A);
        for (unsigned long i = 1; i < Apow.size(); ++i)
            Apow[i] = A*Apow[i-1];

        // fill in K
        K = 0;
        for (unsigned long r = 0; r < controls.size(); ++r)
            for (unsigned long c = 0; c <= r; ++c)
                set_subm(K,r*B.nr(),c*B.nc(), B.nr(), B.nc()) = Apow[r-c]*B;

        // fill in M
        set_subm(M,0*A.nr(),0,A.nr(),1) = A*initial_state + C;
        for (unsigned long i = 1; i < controls.size(); ++i)
            set_subm(M,i*A.nr(),0,A.nr(),1) = A*subm(M,(i-1)*A.nr(),0,A.nr(),1) + C;

        //cout << "M: \n" << M << endl;
        //cout << "K: \n" << K << endl;

        matrix<double,0,1> t, v, lower, upper;
        pack(t, target);
        pack(v, controls);
        pack(lower, _lower, controls.size());
        pack(upper, _upper, controls.size());


        matrix<double> QQ(K.nr(),K.nr()), RR(K.nc(),K.nc());
        QQ = 0;
        RR = 0;
        for (unsigned long c = 0; c < controls.size(); ++c)
        {
            set_subm(QQ,c*Q.nr(),c*Q.nr(),Q.nr(),Q.nr()) = diagm(Q);
            set_subm(RR,c*R.nr(),c*R.nr(),R.nr(),R.nr()) = diagm(R);
        }

        matrix<double> m1 = trans(K)*QQ*K+RR;
        matrix<double> m2 = trans(K)*QQ*(M-t);


        // run the solver...
        unsigned long iter;
        iter = solve_qp_box_using_smo(
            m1,
            m2,
            v,
            lower,
            upper,
            0.00000001,
            100000);

        //cout << "iterations: " << iter << endl;

        unpack(controls, v);
        return iter;
    }



    class test_mpc : public tester
    {
    public:
        test_mpc (
        ) :
            tester ("test_mpc",
                    "Runs tests on the mpc object.")
        {}

        void perform_test (
        )
        {
            // a basic position + velocity model
            matrix<double,2,2> A;
            A = 1, 1,
            0, 1;
            matrix<double,2,1> B, C;
            B = 0,
            1;

            C = 0.02,0.1; // no constant bias

            matrix<double,2,1> Q;
            Q = 2, 0; // only care about getting the position right
            matrix<double,1,1> R, lower, upper;
            R = 1;

            lower = -0.2;
            upper =  0.2;

            std::vector<matrix<double,1,1> > controls(30);
            std::vector<matrix<double,2,1> > target(30);
            for (unsigned long i = 0; i < controls.size(); ++i)
            {
                controls[i] = 0;
                target[i] = 0;
            }

            mpc<2,1,30> solver(A,B,C,Q,R,lower,upper);
            solver.set_epsilon(0.00000001);
            solver.set_max_iterations(10000);
            matrix<double,2,1> initial_state;
            initial_state = 0;
            initial_state(0) = 5;
            for (int i = 0; i < 30; ++i)
            {
                print_spinner();
                matrix<double,1,1> control = solver(initial_state);

                for (unsigned long i = 1; i < controls.size(); ++i)
                    controls[i-1] = controls[i];

                // Compute the correct control via SMO and make sure it matches.
                solve_linear_mpc(A,B,C,Q,R,lower,upper, target, initial_state, controls);
                dlog << LINFO << "ERROR: " << length(control-controls[0]);
                DLIB_TEST(length(control-controls[0]) < 1e-7);

                initial_state = A*initial_state + B*control + C;
                //cout << control(0) << "\t" << trans(initial_state);
            }
        }
    } a;

}




