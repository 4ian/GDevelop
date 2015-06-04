// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_H_
#define DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_H_

#include <cmath>
#include <limits>
#include "../matrix.h"
#include "../algs.h"
#include "optimization_search_strategies_abstract.h"
#include "../sequence.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class cg_search_strategy
    {
    public:
        cg_search_strategy() : been_used(false) {}

        double get_wolfe_rho (
        ) const { return 0.001; }

        double get_wolfe_sigma (
        ) const { return 0.01; }

        unsigned long get_max_line_search_iterations (
        ) const { return 100; }

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
            const T& ,
            const double ,
            const T& funct_derivative
        )
        {
            if (been_used == false)
            {
                been_used = true;
                prev_direction = -funct_derivative;
            }
            else
            {
                // Use the Polak-Ribiere (4.1.12) conjugate gradient described by Fletcher on page 83
                const double temp = trans(prev_derivative)*prev_derivative;
                // If this value hits zero then just use the direction of steepest descent.
                if (std::abs(temp) < std::numeric_limits<double>::epsilon())
                {
                    prev_derivative = funct_derivative;
                    prev_direction = -funct_derivative;
                    return prev_direction;
                }

                double b = trans(funct_derivative-prev_derivative)*funct_derivative/(temp);
                prev_direction = -funct_derivative + b*prev_direction;

            }

            prev_derivative = funct_derivative;
            return prev_direction;
        }

    private:
        bool been_used;
        matrix<double,0,1> prev_derivative;
        matrix<double,0,1> prev_direction;
    };

// ----------------------------------------------------------------------------------------

    class bfgs_search_strategy
    {
    public:
        bfgs_search_strategy() : been_used(false), been_used_twice(false) {}

        double get_wolfe_rho (
        ) const { return 0.01; }

        double get_wolfe_sigma (
        ) const { return 0.9; }

        unsigned long get_max_line_search_iterations (
        ) const { return 100; }

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
            const T& x,
            const double ,
            const T& funct_derivative
        )
        {
            if (been_used == false)
            {
                been_used = true;
                H = identity_matrix<double>(x.size());
            }
            else
            {
                // update H with the BFGS formula from (3.2.12) on page 55 of Fletcher 
                delta = (x-prev_x); 
                gamma = funct_derivative-prev_derivative;

                double dg = dot(delta,gamma);

                // Try to set the initial value of the H matrix to something reasonable if we are still
                // in the early stages of figuring out what it is.  This formula below is what is suggested
                // in the book Numerical Optimization by Nocedal and Wright in the chapter on Quasi-Newton methods.
                if (been_used_twice == false)
                {
                    double gg = trans(gamma)*gamma;
                    if (std::abs(gg) > std::numeric_limits<double>::epsilon())
                    {
                        const double temp = put_in_range(0.01, 100, dg/gg);
                        H = diagm(uniform_matrix<double>(x.size(),1, temp));
                        been_used_twice = true;
                    }
                }

                Hg = H*gamma;
                gH = trans(trans(gamma)*H);
                double gHg = trans(gamma)*H*gamma;
                if (gHg < std::numeric_limits<double>::infinity() && dg < std::numeric_limits<double>::infinity() &&
                    dg != 0)
                {
                    H += (1 + gHg/dg)*delta*trans(delta)/(dg) - (delta*trans(gH) + Hg*trans(delta))/(dg);
                }
                else
                {
                    H = identity_matrix<double>(H.nr());
                    been_used_twice = false;
                }
            }

            prev_x = x;
            prev_direction = -H*funct_derivative;
            prev_derivative = funct_derivative;
            return prev_direction;
        }

    private:
        bool been_used;
        bool been_used_twice;
        matrix<double,0,1> prev_x;
        matrix<double,0,1> prev_derivative;
        matrix<double,0,1> prev_direction;
        matrix<double> H;
        matrix<double,0,1> delta, gamma, Hg, gH;
    };

// ----------------------------------------------------------------------------------------

    class lbfgs_search_strategy
    {
    public:
        explicit lbfgs_search_strategy(unsigned long max_size_) : max_size(max_size_), been_used(false) 
        {
            DLIB_ASSERT (
                max_size > 0,
                "\t lbfgs_search_strategy(max_size)"
                << "\n\t max_size can't be zero"
            );
        }

        lbfgs_search_strategy(const lbfgs_search_strategy& item) 
        {
            max_size = item.max_size;
            been_used = item.been_used;
            prev_x = item.prev_x;
            prev_derivative = item.prev_derivative;
            prev_direction = item.prev_direction;
            alpha = item.alpha;
            dh_temp = item.dh_temp;
        }

        double get_wolfe_rho (
        ) const { return 0.01; }

        double get_wolfe_sigma (
        ) const { return 0.9; }

        unsigned long get_max_line_search_iterations (
        ) const { return 100; }

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
            const T& x,
            const double ,
            const T& funct_derivative
        )
        {
            prev_direction = -funct_derivative;

            if (been_used == false)
            {
                been_used = true;
            }
            else
            {
                // add an element into the stored data sequence
                dh_temp.s = x - prev_x;
                dh_temp.y = funct_derivative - prev_derivative;
                double temp = dot(dh_temp.s, dh_temp.y);
                // only accept this bit of data if temp isn't zero
                if (std::abs(temp) > std::numeric_limits<double>::epsilon())
                {
                    dh_temp.rho = 1/temp;
                    data.add(data.size(), dh_temp);
                }
                else
                {
                    data.clear();
                }

                if (data.size() > 0)
                {
                    // This block of code is from algorithm 7.4 in the Nocedal book.

                    alpha.resize(data.size());
                    for (unsigned long i = data.size()-1; i < data.size(); --i)
                    {
                        alpha[i] = data[i].rho*dot(data[i].s, prev_direction);
                        prev_direction -= alpha[i]*data[i].y;
                    }

                    // Take a guess at what the first H matrix should be.  This formula below is what is suggested
                    // in the book Numerical Optimization by Nocedal and Wright in the chapter on Large Scale 
                    // Unconstrained Optimization (in the L-BFGS section).
                    double H_0 = 1.0/data[data.size()-1].rho/dot(data[data.size()-1].y, data[data.size()-1].y);
                    H_0 = put_in_range(0.001, 1000.0, H_0);
                    prev_direction *= H_0;

                    for (unsigned long i = 0; i < data.size(); ++i)
                    {
                        double beta = data[i].rho*dot(data[i].y, prev_direction);
                        prev_direction += data[i].s * (alpha[i] - beta);
                    }
                }

            }

            if (data.size() > max_size)
            {
                // remove the oldest element in the data sequence
                data.remove(0, dh_temp);
            }

            prev_x = x;
            prev_derivative = funct_derivative;
            return prev_direction;
        }

    private:

        struct data_helper
        {
            matrix<double,0,1> s;
            matrix<double,0,1> y;
            double rho;

            friend void swap(data_helper& a, data_helper& b)
            {
                a.s.swap(b.s);
                a.y.swap(b.y);
                std::swap(a.rho, b.rho);
            }
        };
        sequence<data_helper>::kernel_2a data;

        unsigned long max_size;
        bool been_used;
        matrix<double,0,1> prev_x;
        matrix<double,0,1> prev_derivative;
        matrix<double,0,1> prev_direction;
        std::vector<double> alpha;

        data_helper dh_temp;
    };

// ----------------------------------------------------------------------------------------

    template <typename hessian_funct>
    class newton_search_strategy_obj
    {
    public:
        explicit newton_search_strategy_obj(
            const hessian_funct& hess
        ) : hessian(hess) {}

        double get_wolfe_rho (
        ) const { return 0.01; }

        double get_wolfe_sigma (
        ) const { return 0.9; }

        unsigned long get_max_line_search_iterations (
        ) const { return 100; }

        template <typename T>
        const matrix<double,0,1> get_next_direction (
            const T& x,
            const double ,
            const T& funct_derivative
        )
        {
            return -inv(hessian(x))*funct_derivative;
        }

    private:
        hessian_funct hessian;
    };

    template <typename hessian_funct>
    newton_search_strategy_obj<hessian_funct> newton_search_strategy (
        hessian_funct hessian
    ) { return newton_search_strategy_obj<hessian_funct>(hessian); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_H_

