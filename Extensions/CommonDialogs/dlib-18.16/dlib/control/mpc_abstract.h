// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MPC_ABSTRACT_Hh_
#ifdef DLIB_MPC_ABSTRACT_Hh_

#include "../matrix.h"

namespace dlib
{
    template <
        long S_,
        long I_,
        unsigned long horizon_
        >
    class mpc
    {
        /*!
            REQUIREMENTS ON horizon_
                horizon_ > 0

            REQUIREMENTS ON S_
                S_ >= 0

            REQUIREMENTS ON I_
                I_ >= 0
            
            WHAT THIS OBJECT REPRESENTS
                This object implements a linear model predictive controller.  To explain
                what that means, suppose you have some process you want to control and the
                process dynamics are described by the linear equation:
                    x_{i+1} = A*x_i + B*u_i + C
                That is, the next state the system goes into is a linear function of its
                current state (x_i) and the current control (u_i) plus some constant bias
                or disturbance.  
                
                A model predictive controller can find the control (u) you should apply to
                drive the state (x) to some reference value, or alternatively to make the
                state track some reference time-varying sequence.  It does this by
                simulating the process for horizon_ time steps and selecting the control
                that leads to the best performance over the next horizon_ steps.
                
                To be precise, each time you ask this object for a control, it solves the
                following quadratic program:
        
                    min    sum_i trans(x_i-target_i)*Q*(x_i-target_i) + trans(u_i)*R*u_i 
                  x_i,u_i

                    such that: x_0     == current_state 
                               x_{i+1} == A*x_i + B*u_i + C
                               lower <= u_i <= upper
                               0 <= i < horizon_

                and reports u_0 as the control you should take given that you are currently
                in current_state.  Q and R are user supplied matrices that define how we
                penalize variations away from the target state as well as how much we want
                to avoid generating large control signals.  
                
                Finally, the algorithm we use to solve this quadratic program is based
                largely on the method described in:
                  A Fast Gradient method for embedded linear predictive control (2011)
                  by Markus Kogel and Rolf Findeisen
        !*/

    public:

        const static long S = S_;
        const static long I = I_;
        const static unsigned long horizon = horizon_;

        mpc(
        );
        /*!
            ensures
                - #get_max_iterations() == 0
                - The A,B,C,Q,R,lower, and upper parameter matrices are filled with zeros.
                  Therefore, to use this object you must initialize it via the constructor
                  that supplies these parameters.
        !*/

        mpc (
            const matrix<double,S,S>& A,
            const matrix<double,S,I>& B,
            const matrix<double,S,1>& C,
            const matrix<double,S,1>& Q,
            const matrix<double,I,1>& R,
            const matrix<double,I,1>& lower,
            const matrix<double,I,1>& upper
        ); 
        /*!
            requires
                - A.nr() > 0
                - B.nc() > 0
                - A.nr() == A.nc() == B.nr() == C.nr() == Q.nr()
                - B.nc() == R.nr() == lower.nr() == upper.nr()
                - min(Q) >= 0
                - min(R) > 0
                - min(upper-lower) >= 0
            ensures
                - #get_A() == A
                - #get_B() == B
                - #get_C() == C
                - #get_Q() == Q
                - #get_R() == R
                - #get_lower_constraints() == lower
                - #get_upper_constraints() == upper 
                - for all valid i:
                    - get_target(i) == a vector of all zeros
                    - get_target(i).size() == A.nr()
                - #get_max_iterations() == 10000 
                - #get_epsilon() == 0.01
        !*/

        const matrix<double,S,S>& get_A (
        ) const; 
        /*!
            ensures
                - returns the A matrix from the quadratic program defined above. 
        !*/

        const matrix<double,S,I>& get_B (
        ) const; 
        /*!
            ensures
                - returns the B matrix from the quadratic program defined above. 
        !*/

        const matrix<double,S,1>& get_C (
        ) const;
        /*!
            ensures
                - returns the C matrix from the quadratic program defined above. 
        !*/

        const matrix<double,S,1>& get_Q (
        ) const;
        /*!
            ensures
                - returns the diagonal of the Q matrix from the quadratic program defined
                  above. 
        !*/

        const matrix<double,I,1>& get_R (
        ) const;
        /*!
            ensures
                - returns the diagonal of the R matrix from the quadratic program defined
                  above. 
        !*/

        const matrix<double,I,1>& get_lower_constraints (
        ) const;
        /*!
            ensures
                - returns the lower matrix from the quadratic program defined above.  All
                  controls generated by this object will have values no less than this
                  lower bound.  That is, any control u will satisfy min(u-lower) >= 0.
        !*/

        const matrix<double,I,1>& get_upper_constraints (
        ) const;
        /*!
            ensures
                - returns the upper matrix from the quadratic program defined above.  All
                  controls generated by this object will have values no larger than this
                  upper bound.  That is, any control u will satisfy min(upper-u) >= 0.
        !*/

        const matrix<double,S,1>& get_target (
            const unsigned long time
        ) const;
        /*!
            requires
                - time < horizon
            ensures
                - This object will try to find the control sequence that results in the
                  process obtaining get_target(time) state at the indicated time.  Note
                  that the next time instant after "right now" is time 0. 
        !*/

        void set_target (
            const matrix<double,S,1>& val,
            const unsigned long time
        );
        /*!
            requires
                - time < horizon
            ensures
                - #get_target(time) == val
        !*/

        void set_target (
            const matrix<double,S,1>& val
        );
        /*!
            ensures
                - for all valid t:
                    - #get_target(t) == val
        !*/

        void set_last_target (
            const matrix<double,S,1>& val
        );
        /*!
            ensures
                - performs: set_target(val, horizon-1)
        !*/

        unsigned long get_max_iterations (
        ) const; 
        /*!
            ensures
                - When operator() is called it solves an optimization problem to
                  get_epsilon() precision to determine the next control action.  In
                  particular, we run the optimizer until the magnitude of each element of
                  the gradient vector is less than get_epsilon() or until
                  get_max_iterations() solver iterations have been executed.
        !*/

        void set_max_iterations (
            unsigned long max_iter
        );
        /*!
            ensures
                - #get_max_iterations() == max_iter
        !*/

        void set_epsilon (
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        double get_epsilon (
        ) const;
        /*!
            ensures
                - When operator() is called it solves an optimization problem to
                  get_epsilon() precision to determine the next control action.  In
                  particular, we run the optimizer until the magnitude of each element of
                  the gradient vector is less than get_epsilon() or until
                  get_max_iterations() solver iterations have been executed.  This means
                  that smaller epsilon values will give more accurate outputs but may take
                  longer to compute.
        !*/

        matrix<double,I,1> operator() (
            const matrix<double,S,1>& current_state
        );
        /*!
            requires
                - min(R) > 0
                - A.nr() == current_state.size()
            ensures
                - Solves the model predictive control problem defined by the arguments to
                  this objects constructor, assuming that the starting state is given by
                  current_state.  Then we return the control that should be taken in the
                  current state that best optimizes the quadratic objective function
                  defined above.
                - We also shift over the target states so that you only need to update the
                  last one (if you are using non-zero target states) via a call to
                  set_last_target()).  In particular, for all valid t, it will be the case
                  that:
                    - #get_target(t) == get_target(t+1)
                    - #get_target(horizon-1) == get_target(horizon-1)
        !*/

    };

}

#endif // DLIB_MPC_ABSTRACT_Hh_

