// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OPTIMIZATIOn_H_
#define DLIB_OPTIMIZATIOn_H_

#include <cmath>
#include <limits>
#include "../matrix.h"
#include "../algs.h"
#include "optimization_abstract.h"

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
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        central_differences(const funct& f_, double eps_ = 1e-7) : f(f_), eps(eps_){}

        template <typename T>
        typename T::matrix_type operator()(const T& x) const
        {
            // T must be some sort of dlib matrix 
            COMPILE_TIME_ASSERT(is_matrix<T>::value);

            typename T::matrix_type der(x.size());
            typename T::matrix_type e(x.size());
            set_all_elements(e,0);
            for (long i = 0; i < x.size(); ++i)
            {
                e(i) = 1;
                der(i) = (f(x+e*eps)-f(x-e*eps))/(2*eps);
                e(i) = 0;
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
        // by taking its address using the & operator.
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

    template <typename funct, typename T>
    class line_search_funct 
    {
    public:
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        line_search_funct(const funct& f_, const T& start_, const T& direction_) : f(f_),start(start_), direction(direction_)
        {}

        double operator()(const double& x) const
        {
            return get_value(f(start + x*direction));
        }

    private:

        double get_value (const double& r) const
        {
            return r;
        }

        template <typename U>
        double get_value (const U& r) const
        {
            // U should be a matrix type
            COMPILE_TIME_ASSERT(is_matrix<U>::value);

            return trans(r)*direction;
        }

        const funct& f;
        const T& start;
        const T& direction;
    };

    template <typename funct, typename T>
    const line_search_funct<funct,T> make_line_search_function(const funct& f, const T& start, const T& direction) 
    { 
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            start.nc() == 1 && direction.nc() == 1,
            "\tline_search_funct make_line_search_function(f,start,direction)"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tstart.nc():     " << start.nc()
            << "\n\tdirection.nc(): " << direction.nc()
        );
        return line_search_funct<funct,T>(f,start,direction); 
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    Functions that perform unconstrained optimization 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    inline double poly_min_extrap (
        double f0,
        double d0,
        double f1,
        double d1
    )
    {
        const double n = 3*(f1 - f0) - 2*d0 - d1;
        const double e = d0 + d1 - 2*(f1 - f0);


        // find the minimum of the derivative of the polynomial

        double temp = std::max(n*n - 3*e*d0,0.0);

        if (temp < 0)
            return 0.5;

        temp = std::sqrt(temp);

        if (std::abs(e) <= std::numeric_limits<double>::epsilon())
            return 0.5;

        // figure out the two possible min values
        double x1 = (temp - n)/(3*e);
        double x2 = -(temp + n)/(3*e);

        // compute the value of the interpolating polynomial at these two points
        double y1 = f0 + d0*x1 + n*x1*x1 + e*x1*x1*x1;
        double y2 = f0 + d0*x2 + n*x2*x2 + e*x2*x2*x2;

        // pick the best point
        double x;
        if (y1 < y2)
            x = x1;
        else
            x = x2;

        // now make sure the minimum is within the allowed range of (0,1) 
        return put_in_range(0,1,x);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename funct_der
        >
    double line_search (
        const funct& f, 
        const funct_der& der, 
        double rho, 
        double sigma, 
        double minf,
        double& f0_out
    )
    {
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);
        COMPILE_TIME_ASSERT(is_function<funct_der>::value == false);

        DLIB_ASSERT (
            1 > sigma && sigma > rho && rho > 0,
            "\tdouble line_search()"
            << "\n\tYou have given invalid arguments to this function"
            << "\n\tsigma: " << sigma
            << "\n\trho:   " << rho 
        );

        // The bracketing phase of this function is implemented according to block 2.6.2 from
        // the book Practical Methods of Optimization by R. Fletcher.   The sectioning 
        // phase is an implementation of 2.6.4 from the same book.

        // tau1 > 1. Controls the alpha jump size during the search
        const double tau1 = 9;

        // it must be the case that 0 < tau2 < tau3 <= 1/2 for the algorithm to function
        // correctly but the specific values of tau2 and tau3 aren't super important.
        const double tau2 = 1.0/10.0;
        const double tau3 = 1.0/2.0;

        const double f0 = f(0);
        const double d0 = der(0);

        if (std::abs(d0) < std::numeric_limits<double>::epsilon())
            return 0;
        //DLIB_CASSERT(d0 < 0,d0);

        const double mu = (minf-f0)/(rho*d0);


        f0_out = f0;


        double f1 = f(mu);
        double d1 = der(mu);
        // pick the initial alpha by guessing at the minimum alpha 
        double alpha = mu*poly_min_extrap(f0, d0, f1, d1);
        alpha = put_in_range(0.1*mu, 0.9*mu, alpha);

        DLIB_CASSERT(alpha < std::numeric_limits<double>::infinity(), 
                     "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1
                     );

        using namespace std;
        //cout << "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1 << endl;

        double last_alpha = 0;
        double last_val = f0;
        double last_val_der = d0;

        // the bracketing stage will find a find a range of points [a,b]
        // that contains a reasonable solution to the line search
        double a, b;

        // the value of f(a)
        double a_val, b_val, a_val_der, b_val_der;

        const double thresh = std::abs(sigma*d0);

        // do the bracketing stage to find the bracket range [a,b]
        while (true)
        {
            //cout << "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1 << endl;
            DLIB_CASSERT(alpha < std::numeric_limits<double>::infinity(), alpha);
            const double val = f(alpha);
            const double val_der = der(alpha);

            // we are done with the line search since we found a value smaller
            // than the minimum f value
            if (val <= minf)
                return alpha;

            if (val > f0 + alpha*d0 || val >= last_val)
            {
                a_val = last_val;
                a_val_der = last_val_der;
                b_val = val;
                b_val_der = val_der;

                a = last_alpha;
                b = alpha;
                break;
            }

            if (std::abs(val_der) <= thresh)
                return alpha;

            // if we are stuck not making progress then quit with the current alpha
            if (last_alpha == alpha)
                return alpha;

            if (val_der >= 0)
            {
                a_val = val;
                a_val_der = val_der;
                b_val = last_val;
                b_val_der = last_val_der;

                a = alpha;
                b = last_alpha;
                break;
            }

            if (mu <= 2*alpha - last_alpha)
            {
                last_alpha = alpha;
                alpha = mu;
            }
            else
            {
                const double temp = alpha;

                double first = 2*alpha - last_alpha;
                double last;
                if (mu > 0)
                    last = std::min(mu, alpha + tau1*(alpha - last_alpha));
                else
                    last = std::max(mu, alpha + tau1*(alpha - last_alpha));


                // pick a point between first and last by doing some kind of interpolation
                if (last_alpha < alpha)
                    alpha = last_alpha + (alpha-last_alpha)*poly_min_extrap(last_val, last_val_der, val, val_der);
                else
                    alpha = alpha + (last_alpha-alpha)*poly_min_extrap(val, val_der, last_val, last_val_der);

                alpha = put_in_range(first,last,alpha);


                last_alpha = temp;
            }

            last_val = val;
            last_val_der = val_der;

        }


        DLIB_CASSERT(alpha < std::numeric_limits<double>::infinity(), 
                     "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1
                     );

        // Now do the sectioning phase from 2.6.4
        while (true)
        {
            //cout << "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1 << endl;
            DLIB_CASSERT(alpha < std::numeric_limits<double>::infinity(), 
                        "alpha: " << alpha << " mu: " << mu << " f0: " << f0 << " d0: " << d0 << " f1: " << f1 << " d1: " << d1
                     );
            double first = a + tau2*(b-a);
            double last = b - tau3*(b-a);

            // use interpolation to pick alpha between first and last
            alpha = a + (b-a)*poly_min_extrap(a_val, a_val_der, b_val, b_val_der);
            alpha = put_in_range(first,last,alpha);

            const double val = f(alpha);
            const double val_der = der(alpha);


            // stop if the interval gets so small that it isn't shrinking any more due to rounding error 
            if (a == first || b == last)
            {
                return b;
            }


            if (val > f0 + rho*alpha*d0 || val >= a_val)
            {
                b = alpha;
                b_val = val;
                b_val_der = val_der;
            }
            else
            {
                if (std::abs(val_der) <= thresh)
                    return alpha;

                if ( (b-a)*val_der >= 0)
                {
                    b = a;
                    b_val = a_val;
                    b_val_der = a_val_der;
                }

                a = alpha;
                a_val = val;
                a_val_der = val_der;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename funct_der, 
        typename T
        >
    void find_min_quasi_newton (
        const funct& f, 
        const funct_der& der, 
        T& x, 
        double min_f,
        double min_delta = 1e-7 
    )
    {
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);
        COMPILE_TIME_ASSERT(is_function<funct_der>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            min_delta >= 0 && x.nc() == 1,
            "\tdouble find_min_quasi_newton()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tmin_delta: " << min_delta
            << "\n\tx.nc():    " << x.nc()
        );

        T g, g2, s, Hg, gH;
        double alpha = 10;

        matrix<double,T::NR,T::NR> H(x.nr(),x.nr());
        T delta, gamma;

        H = identity_matrix<double>(H.nr());

        g = der(x);

        double f_value = min_f - 1;
        double old_f_value = 0;

        // loop until the derivative is almost zero
        while(std::abs(old_f_value - f_value) > min_delta)
        {
            old_f_value = f_value;

            s = -H*g;

            alpha = line_search(make_line_search_function(f,x,s),make_line_search_function(der,x,s),0.01, 0.9,min_f, f_value);

            x += alpha*s;


            g2 = der(x);

            // update H with the BFGS formula from (3.2.12) on page 55 of Fletcher 
            delta = alpha*s;
            gamma = g2-g;

            Hg = H*gamma;
            gH = trans(trans(gamma)*H);
            double gHg = trans(gamma)*H*gamma;
            double dg = trans(delta)*gamma;
            if (gHg < std::numeric_limits<double>::infinity() && dg < std::numeric_limits<double>::infinity() &&
                dg != 0)
            {
                H += (1 + gHg/dg)*delta*trans(delta)/(dg) - (delta*trans(gH) + Hg*trans(delta))/(dg);
            }
            else
            {
                H = identity_matrix<double>(H.nr());
            }

            g.swap(g2);
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename funct,
        typename funct_der,
        typename T
        >
    void find_min_conjugate_gradient (
        const funct& f,
        const funct_der& der,
        T& x,
        double min_f,
        double min_delta = 1e-7
    )
    {
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);
        COMPILE_TIME_ASSERT(is_function<funct_der>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            min_delta >= 0 && x.nc() == 1,
            "\tdouble find_min_conjugate_gradient()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tmin_delta: " << min_delta
            << "\n\tx.nc():    " << x.nc()
        );

        T g, g2, s;
        double alpha = 0;

        g = der(x);
        s = -g;

        double f_value = min_f - 1;
        double old_f_value = 0;

        // loop until the derivative is almost zero
        while(std::abs(old_f_value - f_value) > min_delta)
        {
            old_f_value = f_value;

            alpha = line_search(make_line_search_function(f,x,s),make_line_search_function(der,x,s),0.001, 0.010,min_f, f_value);
            x += alpha*s;


            g2 = der(x);

            const double temp = trans(g)*g;
            // just stop if this value hits zero
            if (std::abs(temp) < std::numeric_limits<double>::epsilon())
                break;

            // Use the Polak-Ribiere (4.1.12) conjugate gradient described by Fletcher on page 83
            double b = trans(g2-g)*g2/(temp);
            s = -g2 + b*s;

            g.swap(g2);
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename T
        >
    void find_min_quasi_newton2 (
        const funct& f, 
        T& x, 
        double min_f,
        double min_delta = 1e-7,
        double derivative_eps = 1e-7
    )
    {
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            min_delta >= 0 && x.nc() == 1,
            "\tdouble find_min_quasi_newton()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tmin_delta:      " << min_delta
            << "\n\tx.nc():         " << x.nc()
            << "\n\tderivative_eps: " << derivative_eps 
        );

        T g, g2, s, Hg, gH;
        double alpha = 10;

        matrix<double,T::NR,T::NR> H(x.nr(),x.nr());
        T delta, gamma;

        H = identity_matrix<double>(H.nr());

        g = derivative(f,derivative_eps)(x);

        double f_value = min_f - 1;
        double old_f_value = 0;

        // loop until the derivative is almost zero
        while(std::abs(old_f_value - f_value) > min_delta)
        {
            old_f_value = f_value;

            s = -H*g;

            alpha = line_search(
                            make_line_search_function(f,x,s),
                            derivative(make_line_search_function(f,x,s),derivative_eps),
                            0.01, 0.9,min_f, f_value);

            x += alpha*s;


            g2 = derivative(f,derivative_eps)(x);

            // update H with the BFGS formula from (3.2.12) on page 55 of Fletcher 
            delta = alpha*s;
            gamma = g2-g;

            Hg = H*gamma;
            gH = trans(trans(gamma)*H);
            double gHg = trans(gamma)*H*gamma;
            double dg = trans(delta)*gamma;
            if (gHg < std::numeric_limits<double>::infinity() && dg < std::numeric_limits<double>::infinity() &&
                dg != 0)
            {
                H += (1 + gHg/dg)*delta*trans(delta)/(dg) - (delta*trans(gH) + Hg*trans(delta))/(dg);
            }
            else
            {
                H = identity_matrix<double>(H.nr());
            }

            g.swap(g2);
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename funct,
        typename T
        >
    void find_min_conjugate_gradient2 (
        const funct& f,
        T& x,
        double min_f,
        double min_delta = 1e-7,
        double derivative_eps = 1e-7
    )
    {
        // You get an error on this line when you pass in a global function to this function.
        // You have to either use a function object or pass a pointer to your global function
        // by taking its address using the & operator.
        COMPILE_TIME_ASSERT(is_function<funct>::value == false);

        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        DLIB_ASSERT (
            min_delta >= 0 && x.nc() == 1 && derivative_eps > 0,
            "\tdouble find_min_conjugate_gradient()"
            << "\n\tYou have to supply column vectors to this function"
            << "\n\tmin_delta:      " << min_delta
            << "\n\tx.nc():         " << x.nc()
            << "\n\tderivative_eps: " << derivative_eps 
        );

        T g, g2, s;
        double alpha = 0;

        g = derivative(f,derivative_eps)(x);
        s = -g;

        double f_value = min_f - 1;
        double old_f_value = 0;

        // loop until the derivative is almost zero
        while(std::abs(old_f_value - f_value) > min_delta)
        {
            old_f_value = f_value;

            alpha = line_search(
                        make_line_search_function(f,x,s),
                        derivative(make_line_search_function(f,x,s),derivative_eps),
                        0.001, 0.010,min_f, f_value);

            x += alpha*s;

            g2 = derivative(f,derivative_eps)(x);

            // Use the Polak-Ribiere (4.1.12) conjugate gradient described by Fletcher on page 83
            const double temp = trans(g)*g;
            // just stop if this value hits zero
            if (std::abs(temp) < std::numeric_limits<double>::epsilon())
                break;

            double b = trans(g2-g)*g2/(temp);
            s = -g2 + b*s;

            g.swap(g2);
        }

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_H_

