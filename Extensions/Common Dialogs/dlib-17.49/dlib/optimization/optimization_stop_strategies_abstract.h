// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_STOP_STRATEGIES_ABSTRACT_
#ifdef DLIB_OPTIMIZATIOn_STOP_STRATEGIES_ABSTRACT_

#include <cmath>
#include <limits>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class objective_delta_stop_strategy
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for deciding if an optimization
                algorithm should terminate.   This particular object looks at the 
                change in the objective function from one iteration to the next and 
                bases its decision on how large this change is.  If the change
                is below a user given threshold then the search stops.
        !*/

    public:
        explicit objective_delta_stop_strategy (
            double min_delta = 1e-7
        ); 
        /*!
            requires
                - min_delta >= 0
            ensures
                - This stop strategy object will only consider a search to be complete
                  if a change in an objective function from one iteration to the next
                  is less than min_delta.
        !*/

        objective_delta_stop_strategy (
            double min_delta,
            unsigned long max_iter
        );
        /*!
            requires
                - min_delta >= 0
                - max_iter > 0
            ensures
                - This stop strategy object will only consider a search to be complete
                  if a change in an objective function from one iteration to the next
                  is less than min_delta or more than max_iter iterations has been
                  executed.
        !*/

        objective_delta_stop_strategy& be_verbose( 
        );
        /*!
            ensures
                - causes this object to print status messages to standard out 
                  every time should_continue_search() is called.
                - returns *this
        !*/

        template <typename T>
        bool should_continue_search (
            const T& x,
            const double funct_value,
            const T& funct_derivative
        );
        /*!
            requires
                - this function is only called once per search iteration
                - for some objective function f():
                    - x == the search point for the current iteration
                    - funct_value == f(x)
                    - funct_derivative == derivative(f)(x)
            ensures
                - returns true if the point x doest not satisfy the stopping condition and
                  false otherwise.
        !*/

    };

// ----------------------------------------------------------------------------------------

    class gradient_norm_stop_strategy
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for deciding if an optimization
                algorithm should terminate.   This particular object looks at the 
                norm (i.e. the length) of the current gradient vector and stops 
                if it is smaller than a user given threshold.  
        !*/

    public:
        explicit gradient_norm_stop_strategy (
            double min_norm = 1e-7
        ); 
        /*!
            requires
                - min_norm >= 0
            ensures
                - This stop strategy object will only consider a search to be complete
                  if the current gradient norm is less than min_norm
        !*/

        gradient_norm_stop_strategy (
            double min_norm,
            unsigned long max_iter
        );
        /*!
            requires
                - min_norm >= 0
                - max_iter > 0
            ensures
                - This stop strategy object will only consider a search to be complete
                  if the current gradient norm is less than min_norm or more than 
                  max_iter iterations has been executed.
        !*/

        gradient_norm_stop_strategy& be_verbose( 
        );
        /*!
            ensures
                - causes this object to print status messages to standard out 
                  every time should_continue_search() is called.
                - returns *this
        !*/

        template <typename T>
        bool should_continue_search (
            const T& x,
            const double funct_value,
            const T& funct_derivative
        );
        /*!
            requires
                - this function is only called once per search iteration
                - for some objective function f():
                    - x == the search point for the current iteration
                    - funct_value == f(x)
                    - funct_derivative == derivative(f)(x)
            ensures
                - returns true if the point x doest not satisfy the stopping condition and
                  false otherwise.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_STOP_STRATEGIES_ABSTRACT_

