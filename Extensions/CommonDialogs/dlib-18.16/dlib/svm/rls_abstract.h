// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RLs_ABSTRACT_Hh_
#ifdef DLIB_RLs_ABSTRACT_Hh_

#include "../matrix/matrix_abstract.h"
#include "function_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rls
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an implementation of the linear version of the recursive least 
                squares algorithm.  It accepts training points incrementally and, at 
                each step, maintains the solution to the following optimization problem:
                    find w minimizing: 0.5*dot(w,w) + C*sum_i(y_i - trans(x_i)*w)^2
                Where (x_i,y_i) are training pairs.  x_i is some vector and y_i is a target
                scalar value.

                This object can also be configured to use exponential forgetting.  This is
                where each training example is weighted by pow(forget_factor, i), where i 
                indicates the sample's age.  So older samples are weighted less in the 
                least squares solution and therefore become forgotten after some time.  
                Therefore, with forgetting, this object solves the following optimization
                problem at each step:
                    find w minimizing: 0.5*dot(w,w) + C*sum_i pow(forget_factor, i)*(y_i - trans(x_i)*w)^2
                Where i starts at 0 and i==0 corresponds to the most recent training point.
        !*/

    public:


        explicit rls(
            double forget_factor,
            double C = 1000
        );
        /*!
            requires
                - 0 < forget_factor <= 1
                - 0 < C
            ensures
                - #get_w().size() == 0
                - #get_c() == C
                - #get_forget_factor() == forget_factor
        !*/

        rls(
        );
        /*!
            ensures
                - #get_w().size() == 0
                - #get_c() == 1000
                - #get_forget_factor() == 1
        !*/

        double get_c(
        ) const;
        /*!
            ensures
                - returns the regularization parameter.  It is the parameter 
                  that determines the trade-off between trying to fit the training 
                  data or allowing more errors but hopefully improving the generalization 
                  of the resulting regression.  Larger values encourage exact fitting while 
                  smaller values of C may encourage better generalization. 
        !*/

        double get_forget_factor(
        ) const;
        /*!
            ensures
                - returns the exponential forgetting factor.  A value of 1 disables forgetting
                  and results in normal least squares regression.  On the other hand, a smaller 
                  value causes the regression to forget about old training examples and prefer 
                  instead to fit more recent examples.  The closer the forget factor is to
                  zero the faster old examples are forgotten.
        !*/


        template <typename EXP>
        void train (
            const matrix_exp<EXP>& x,
            double y
        )
        /*!
            requires
                - is_col_vector(x) == true
                - if (get_w().size() != 0) then
                    - x.size() == get_w().size()
                      (i.e. all training examples must have the same
                      dimensionality)
            ensures
                - #get_w().size() == x.size()
                - updates #get_w() such that it contains the solution to the least
                  squares problem of regressing the given x onto the given y as well
                  as all the previous training examples supplied to train().
        !*/

        const matrix<double,0,1>& get_w(
        ) const;
        /*!
            ensures
                - returns the regression weights.  These are the values learned by the
                  least squares procedure.  If train() has not been called then this
                  function returns an empty vector.
        !*/

        template <typename EXP>
        double operator() (
            const matrix_exp<EXP>& x
        ) const;
        /*!
            requires
                - is_col_vector(x) == true
                - get_w().size() == x.size()
            ensures
                - returns dot(x, get_w())
        !*/

        decision_function<linear_kernel<matrix<double,0,1> > > get_decision_function (
        ) const;
        /*!
            requires
                - get_w().size() != 0
            ensures
                - returns a decision function DF such that:
                    - DF(x) == dot(x, get_w())
        !*/

    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const rls& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        rls& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RLs_ABSTRACT_Hh_


