// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RLS_FiLTER_ABSTRACT_H__
#ifdef DLIB_RLS_FiLTER_ABSTRACT_H__

#include "../svm/rls_abstract.h"
#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rls_filter
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for doing time series prediction using linear 
                recursive least squares.  In particular, this object takes a sequence 
                of points from the user and, at each step, attempts to predict the 
                value of the next point.  

                To accomplish this, this object maintains a fixed size buffer of recent 
                points.  Each prediction is a linear combination of the points in this 
                history buffer.  It uses the recursive least squares algorithm to 
                determine how to best combine the contents of the history buffer to
                predict each point.  Therefore, each time update() is called with
                a point, recursive least squares updates the linear combination weights,
                and then it inserts the point into the history buffer.  After that, the 
                next prediction is based on these updated weights and the current history 
                buffer.
        !*/

    public:

        rls_filter(
        );
        /*!
            ensures
                - #get_window_size() == 5
                - #get_forget_factor() == 0.8
                - #get_c() == 100
                - #get_predicted_next_state().size() == 0
        !*/

        explicit rls_filter (
            unsigned long size,
            double forget_factor = 0.8,
            double C = 100
        );
        /*!
            requires
                - 0 < forget_factor <= 1
                - 0 < C
                - size >= 2
            ensures
                - #get_window_size() == size
                - #get_forget_factor() == forget_factor
                - #get_c() == C
                - #get_predicted_next_state().size() == 0
        !*/

        double get_c(
        ) const;
        /*!
            ensures
                - returns the regularization parameter.  It is the parameter that determines 
                  the trade-off between trying to fit the data points given to update() or 
                  allowing more errors but hopefully improving the generalization of the 
                  predictions.  Larger values encourage exact fitting while smaller values 
                  of C may encourage better generalization. 
        !*/

        double get_forget_factor(
        ) const;
        /*!
            ensures
                - This object uses exponential forgetting in its implementation of recursive 
                  least squares.  Therefore, this function returns the "forget factor". 
                - if (get_forget_factor() == 1) then
                    - In this case, exponential forgetting is disabled.
                    - The recursive least squares algorithm will implicitly take all previous
                      calls to update(z) into account when estimating the optimal weights for
                      linearly combining the history buffer into a prediction of the next point.
                - else
                    - Old calls to update(z) are eventually forgotten.  That is, the smaller
                      the forget factor, the less recursive least squares will care about 
                      attempting to find linear combination weights which would have make 
                      good predictions on old points.  It will care more about fitting recent 
                      points.  This is appropriate if the statistical properties of the time 
                      series we are modeling are not constant.
        !*/

        unsigned long get_window_size (
        ) const;
        /*!
            ensures
                - returns the size of the history buffer.  This is the number of points which
                  are linearly combine to make the predictions returned by get_predicted_next_state().
        !*/

        void update (
        );
        /*!
            ensures
                - Propagates the prediction forward in time.
                - In particular, the value in get_predicted_next_state() is inserted
                  into the history buffer and then the next prediction is estimated 
                  based on this updated history buffer.
                - #get_predicted_next_state() == the prediction for the next point
                  in the time series.
        !*/

        template <typename EXP>
        void update (
            const matrix_exp<EXP>& z
        );
        /*!
            requires
                - is_col_vector(z) == true
                - z.size() != 0
                - if (get_predicted_next_state().size() != 0) then
                    - z.size() == get_predicted_next_state().size()
                      (i.e. z must be the same size as all the previous z values given
                      to this function)
            ensures
                - Updates the state of this filter based on the current measurement in z. 
                - In particular, the filter weights are updated and z is inserted into
                  the history buffer.  Then the next prediction is estimated based on 
                  these updated weights and history buffer.
                - #get_predicted_next_state() == the prediction for the next point
                  in the time series.
                - #get_predicted_next_state().size() == z.size()
        !*/

        const matrix<double,0,1>& get_predicted_next_state(
        );
        /*!
            ensures
                - returns the estimate of the next point we will observe in the
                  time series data.
        !*/

    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const rls_filter& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        rls_filter& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_RLS_FiLTER_ABSTRACT_H__


