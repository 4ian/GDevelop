// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OPTIMIZATIOn_H_
#define DLIB_OPTIMIZATIOn_H_

#include <cmath>
#include <limits>
#include "optimization_abstract.h"
#include "optimization_search_strategies.h"
#include "optimization_stop_strategies.h"
#include "optimization_line_search.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    Functions that transform other functions  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename funct>
    class central_differences
    {
    public:
        central_differences(const funct& f_, double eps_ = 1e-7) : f(f_), eps(eps_){}

        template <typename T>
        typename T::matrix_type operator()(const T& x) const
        {
            // T must be some sort of dlib matrix 
            COMPILE_TIME_ASSERT(is_matrix<T>::value);

            typename T::matrix_type der(x.size());
            typename T::matrix_type e(x);
            for (long i = 0; i < x.size(); ++i)
            {
                const double old_val = e(i);

                e(i) += eps;
                const double delta_plus = f(e);
                e(i) = old_val - eps;
                const double delta_minus = f(e);

                der(i) = (delta_plus - delta_minus)/(2*eps);

                // and finally restore the old value of this element
                e(i) = old_val;
            }

            return der;
        }

        template <typename T, typename U>
        typename U::matrix_type operator()(const T& item, const U& x) const
        {
            // U must be some sort of dlib matrix 
            COMPILE_TIME_ASSERT(is_matrix<U>::value);

            typename U::matrix_type der(x.size());
            typename U::matrix_type e(x);
            for (long i = 0; i < x.size(); ++i)
            {
                const double old_val = e(i);

                e(i) += eps;
                const double delta_plus = f(item,e);
                e(i) = old_val - eps;
                const double delta_minus = f(item,e);

                der(i) = (delta_plus - delta_minus)/(2*eps);

                // and finally restore the old value of this element
                e(i) = old_val;
            }

            return der;
        }
        

        double operator()(const double& x) const
        {
            return (f(x+eps)-f(x-eps))/(2*eps);
        }

    private:
        const funct& f;
        const double eps;
    };

    template <typename funct>
    const central_differences<funct> derivative(const funct& f) { return central_differences<funct>(f); }
    template <typename funct>
    const central_differences<funct> derivative(const funct& f, double eps) 
    { 
        DLIB_ASSERT (
            eps > 0,
            "\tcentral_differences derivative(f,eps)"
            << "\n\tYou must give an epsilon > 0"
            << "\n\teps:     " << eps 
        );
        return central_differences<funct>(f,eps); 
    }

// ----------------------------------------------------------------------------------------

    template <typename funct, typename EXP1, typename EXP2>
    struct clamped_function_object
    {
        clamped_function_object(
            const funct& f_,
            const matrix_exp<EXP1>& x_lower_,
            const matrix_exp<EXP2>& x_upper_ 
        ) : f(f_), x_lower(x_lower_), x_upper(x_upper_)
        {
        }

        template <typename T>
        double operator() (
            const T& x
        ) const
        {
            return f(clamp(x,x_lower,x_upper));
        }
        
        const funct& f;
        const matrix_exp<EXP1>& x_lower;
        const matrix_exp<EXP2>& x_upper; 
    };

    template <typename funct, typename EXP1, typename EXP2>
    clamped_function_object<funct,EXP1,EXP2> clamp_function(
        const funct& f,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper 
    ) { return clamped_function_object<funct,EXP1,EXP2>(f,x_lower,x_upper); }

// ----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    Functions that perform unconstrained optimization 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_min (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x, 
        double min_f
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x),
            "\tdouble find_min()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():    " << x.nc()
        );


        T g, s;

        double f_value = f(x);
        g = der(x);

        if (!is_finite(f_value))
            throw error("The objective function generated non-finite outputs");
        if (!is_finite(g))
            throw error("The objective function generated non-finite outputs");

        while(stop_strategy.should_continue_search(x, f_value, g) && f_value > min_f)
        {
            s = search_strategy.get_next_direction(x, f_value, g);

            double alpha = line_search(
                        make_line_search_function(f,x,s, f_value),
                        f_value,
                        make_line_search_function(der,x,s, g),
                        dot(g,s), // compute initial gradient for the line search
                        search_strategy.get_wolfe_rho(), search_strategy.get_wolfe_sigma(), min_f,
                        search_strategy.get_max_line_search_iterations());

            // Take the search step indicated by the above line search
            x += alpha*s;

            if (!is_finite(f_value))
                throw error("The objective function generated non-finite outputs");
            if (!is_finite(g))
                throw error("The objective function generated non-finite outputs");
        }

        return f_value;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_max (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x, 
        double max_f
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x),
            "\tdouble find_max()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():    " << x.nc()
        );

        T g, s;

        // This function is basically just a copy of find_min() but with - put in the right places
        // to flip things around so that it ends up looking for the max rather than the min.

        double f_value = -f(x);
        g = -der(x);

        if (!is_finite(f_value))
            throw error("The objective function generated non-finite outputs");
        if (!is_finite(g))
            throw error("The objective function generated non-finite outputs");

        while(stop_strategy.should_continue_search(x, f_value, g) && f_value > -max_f)
        {
            s = search_strategy.get_next_direction(x, f_value, g);

            double alpha = line_search(
                        negate_function(make_line_search_function(f,x,s, f_value)),
                        f_value,
                        negate_function(make_line_search_function(der,x,s, g)),
                        dot(g,s), // compute initial gradient for the line search
                        search_strategy.get_wolfe_rho(), search_strategy.get_wolfe_sigma(), -max_f,
                        search_strategy.get_max_line_search_iterations()
                        );

            // Take the search step indicated by the above line search
            x += alpha*s;

            // Don't forget to negate these outputs from the line search since they are 
            // from the unnegated versions of f() and der()
            g *= -1;
            f_value *= -1;

            if (!is_finite(f_value))
                throw error("The objective function generated non-finite outputs");
            if (!is_finite(g))
                throw error("The objective function generated non-finite outputs");
        }

        return -f_value;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct,
        typename T
        >
    double find_min_using_approximate_derivatives (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f,
        T& x,
        double min_f,
        double derivative_eps = 1e-7
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x) && derivative_eps > 0,
            "\tdouble find_min_using_approximate_derivatives()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():         " << x.nc()
            << "\n\tderivative_eps: " << derivative_eps 
        );

        T g, s;

        double f_value = f(x);
        g = derivative(f,derivative_eps)(x);

        if (!is_finite(f_value))
            throw error("The objective function generated non-finite outputs");
        if (!is_finite(g))
            throw error("The objective function generated non-finite outputs");

        while(stop_strategy.should_continue_search(x, f_value, g) && f_value > min_f)
        {
            s = search_strategy.get_next_direction(x, f_value, g);

            double alpha = line_search(
                        make_line_search_function(f,x,s,f_value),
                        f_value,
                        derivative(make_line_search_function(f,x,s),derivative_eps),
                        dot(g,s),  // Sometimes the following line is a better way of determining the initial gradient. 
                        //derivative(make_line_search_function(f,x,s),derivative_eps)(0),
                        search_strategy.get_wolfe_rho(), search_strategy.get_wolfe_sigma(), min_f,
                        search_strategy.get_max_line_search_iterations()
                        );

            // Take the search step indicated by the above line search
            x += alpha*s;

            g = derivative(f,derivative_eps)(x);

            if (!is_finite(f_value))
                throw error("The objective function generated non-finite outputs");
            if (!is_finite(g))
                throw error("The objective function generated non-finite outputs");
        }

        return f_value;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct,
        typename T
        >
    double find_max_using_approximate_derivatives (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f,
        T& x,
        double max_f,
        double derivative_eps = 1e-7
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x) && derivative_eps > 0,
            "\tdouble find_max_using_approximate_derivatives()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():         " << x.nc()
            << "\n\tderivative_eps: " << derivative_eps 
        );

        // Just negate the necessary things and call the find_min version of this function.
        return -find_min_using_approximate_derivatives(
            search_strategy, 
            stop_strategy, 
            negate_function(f),
            x,
            -max_f,
            derivative_eps
        );
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                      Functions for box constrained optimization
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V>
    T zero_bounded_variables (
        const double eps,
        T vect,
        const T& x,
        const T& gradient,
        const U& x_lower,
        const V& x_upper
    )
    {
        for (long i = 0; i < gradient.size(); ++i)
        {
            const double tol = eps*std::abs(x(i));
            // if x(i) is an active bound constraint
            if (x_lower(i)+tol >= x(i) && gradient(i) > 0)
                vect(i) = 0;
            else if (x_upper(i)-tol <= x(i) && gradient(i) < 0)
                vect(i) = 0;
        }
        return vect;
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V>
    T gap_step_assign_bounded_variables (
        const double eps,
        T vect,
        const T& x,
        const T& gradient,
        const U& x_lower,
        const V& x_upper
    )
    {
        for (long i = 0; i < gradient.size(); ++i)
        {
            const double tol = eps*std::abs(x(i));
            // if x(i) is an active bound constraint then we should set it's search
            // direction such that a single step along the direction either does nothing or
            // closes the gap of size tol before hitting the bound exactly.
            if (x_lower(i)+tol >= x(i) && gradient(i) > 0)
                vect(i) = x_lower(i)-x(i);
            else if (x_upper(i)-tol <= x(i) && gradient(i) < 0)
                vect(i) = x_upper(i)-x(i);
        }
        return vect;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T,
        typename EXP1,
        typename EXP2
        >
    double find_min_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper
    )
    {
        /*
            The implementation of this function is more or less based on the discussion in
            the paper Projected Newton-type Methods in Machine Learning by Mark Schmidt, et al.
        */

        // make sure the requires clause is not violated
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x) && is_col_vector(x_lower) && is_col_vector(x_upper) &&
            x.size() == x_lower.size() && x.size() == x_upper.size(),
            "\tdouble find_min_box_constrained()"
            << "\n\t The inputs to this function must be equal length column vectors."
            << "\n\t is_col_vector(x):       " << is_col_vector(x)
            << "\n\t is_col_vector(x_upper): " << is_col_vector(x_upper)
            << "\n\t is_col_vector(x_upper): " << is_col_vector(x_upper)
            << "\n\t x.size():               " << x.size()
            << "\n\t x_lower.size():         " << x_lower.size()
            << "\n\t x_upper.size():         " << x_upper.size()
        );
        DLIB_ASSERT (
            min(x_upper-x_lower) > 0,
            "\tdouble find_min_box_constrained()"
            << "\n\t You have to supply proper box constraints to this function."
            << "\n\r min(x_upper-x_lower): " << min(x_upper-x_lower)
        );


        T g, s;
        double f_value = f(x);
        g = der(x);

        if (!is_finite(f_value))
            throw error("The objective function generated non-finite outputs");
        if (!is_finite(g))
            throw error("The objective function generated non-finite outputs");

        // gap_eps determines how close we have to get to a bound constraint before we
        // start basically dropping it from the optimization and consider it to be an
        // active constraint.
        const double gap_eps = 1e-8;

        double last_alpha = 1;
        while(stop_strategy.should_continue_search(x, f_value, g))
        {
            s = search_strategy.get_next_direction(x, f_value, zero_bounded_variables(gap_eps, g, x, g, x_lower, x_upper));
            s = gap_step_assign_bounded_variables(gap_eps, s, x, g, x_lower, x_upper);

            double alpha = backtracking_line_search(
                        make_line_search_function(clamp_function(f,x_lower,x_upper), x, s, f_value),
                        f_value,
                        dot(g,s), // compute gradient for the line search
                        last_alpha, 
                        search_strategy.get_wolfe_rho(), 
                        search_strategy.get_max_line_search_iterations());

            // Do a trust region style thing for alpha.  The idea is that if we take a
            // small step then we are likely to take another small step.  So we reuse the
            // alpha from the last iteration unless the line search didn't shrink alpha at
            // all, in that case, we start with a bigger alpha next time.
            if (alpha == last_alpha)
                last_alpha = std::min(last_alpha*10,1.0);
            else
                last_alpha = alpha;

            // Take the search step indicated by the above line search
            x = clamp(x + alpha*s, x_lower, x_upper);
            g = der(x);

            if (!is_finite(f_value))
                throw error("The objective function generated non-finite outputs");
            if (!is_finite(g))
                throw error("The objective function generated non-finite outputs");
        }

        return f_value;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_min_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        double x_lower,
        double x_upper
    )
    {
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        typedef typename T::type scalar_type;
        return find_min_box_constrained(search_strategy,
                                        stop_strategy,
                                        f,
                                        der,
                                        x,
                                        uniform_matrix<scalar_type>(x.size(),1,x_lower),
                                        uniform_matrix<scalar_type>(x.size(),1,x_upper) );
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T,
        typename EXP1,
        typename EXP2
        >
    double find_max_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper
    )
    {
        // make sure the requires clause is not violated
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        DLIB_CASSERT (
            is_col_vector(x) && is_col_vector(x_lower) && is_col_vector(x_upper) &&
            x.size() == x_lower.size() && x.size() == x_upper.size(),
            "\tdouble find_max_box_constrained()"
            << "\n\t The inputs to this function must be equal length column vectors."
            << "\n\t is_col_vector(x):       " << is_col_vector(x)
            << "\n\t is_col_vector(x_upper): " << is_col_vector(x_upper)
            << "\n\t is_col_vector(x_upper): " << is_col_vector(x_upper)
            << "\n\t x.size():               " << x.size()
            << "\n\t x_lower.size():         " << x_lower.size()
            << "\n\t x_upper.size():         " << x_upper.size()
        );
        DLIB_ASSERT (
            min(x_upper-x_lower) > 0,
            "\tdouble find_max_box_constrained()"
            << "\n\t You have to supply proper box constraints to this function."
            << "\n\r min(x_upper-x_lower): " << min(x_upper-x_lower)
        );

        // This function is basically just a copy of find_min_box_constrained() but with - put 
        // in the right places to flip things around so that it ends up looking for the max
        // rather than the min.

        T g, s;
        double f_value = -f(x);
        g = -der(x);

        if (!is_finite(f_value))
            throw error("The objective function generated non-finite outputs");
        if (!is_finite(g))
            throw error("The objective function generated non-finite outputs");

        // gap_eps determines how close we have to get to a bound constraint before we
        // start basically dropping it from the optimization and consider it to be an
        // active constraint.
        const double gap_eps = 1e-8;

        double last_alpha = 1;
        while(stop_strategy.should_continue_search(x, f_value, g))
        {
            s = search_strategy.get_next_direction(x, f_value, zero_bounded_variables(gap_eps, g, x, g, x_lower, x_upper));
            s = gap_step_assign_bounded_variables(gap_eps, s, x, g, x_lower, x_upper);

            double alpha = backtracking_line_search(
                        negate_function(make_line_search_function(clamp_function(f,x_lower,x_upper), x, s, f_value)),
                        f_value,
                        dot(g,s), // compute gradient for the line search
                        last_alpha, 
                        search_strategy.get_wolfe_rho(), 
                        search_strategy.get_max_line_search_iterations());

            // Do a trust region style thing for alpha.  The idea is that if we take a
            // small step then we are likely to take another small step.  So we reuse the
            // alpha from the last iteration unless the line search didn't shrink alpha at
            // all, in that case, we start with a bigger alpha next time.
            if (alpha == last_alpha)
                last_alpha = std::min(last_alpha*10,1.0);
            else
                last_alpha = alpha;

            // Take the search step indicated by the above line search
            x = clamp(x + alpha*s, x_lower, x_upper);
            g = -der(x);

            // Don't forget to negate the output from the line search since it is  from the
            // unnegated version of f() 
            f_value *= -1;

            if (!is_finite(f_value))
                throw error("The objective function generated non-finite outputs");
            if (!is_finite(g))
                throw error("The objective function generated non-finite outputs");
        }

        return -f_value;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_max_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        double x_lower,
        double x_upper
    )
    {
        // The starting point (i.e. x) must be a column vector.  
        COMPILE_TIME_ASSERT(T::NC <= 1);

        typedef typename T::type scalar_type;
        return find_max_box_constrained(search_strategy,
                                        stop_strategy,
                                        f,
                                        der,
                                        x,
                                        uniform_matrix<scalar_type>(x.size(),1,x_lower),
                                        uniform_matrix<scalar_type>(x.size(),1,x_upper) );
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_H_

