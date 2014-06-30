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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        DLIB_ASSERT (
            eps > 0,
            "\tcentral_differences derivative(f,eps)"
            << "\n\tYou must give an epsilon > 0"
            << "\n\teps:     " << eps 
        );
        return central_differences<funct>(f,eps); 
    }

// ----------------------------------------------------------------------------------------

    template <typename funct>
    class negate_function_object 
    {
    public:
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        negate_function_object(const funct& f_) : f(f_){}

        template <typename T>
        double operator()(const T& x) const
        {
            return -f(x);
        }

    private:
        const funct& f;
    };

    template <typename funct>
    const negate_function_object<funct> negate_function(const funct& f) { return negate_function_object<funct>(f); }

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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);
        COMPILE_TIME_ASSERT(is_function<funct_der>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            is_col_vector(x),
            "\tdouble find_min()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():    " << x.nc()
        );


        T g, s;

        double f_value = f(x);
        g = der(x);

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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);
        COMPILE_TIME_ASSERT(is_function<funct_der>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            is_col_vector(x) && derivative_eps > 0,
            "\tdouble find_min_using_approximate_derivatives()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tx.nc():         " << x.nc()
            << "\n\tderivative_eps: " << derivative_eps 
        );

        T g, s;

        double f_value = f(x);
        g = derivative(f,derivative_eps)(x);

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
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.  (This check is here because gcc 4.0
        // has a bug that causes it to silently corrupt return values from functions that
        // invoked through a reference)
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
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

}

#endif // DLIB_OPTIMIZATIOn_H_

