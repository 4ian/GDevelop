// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_ABSTRACT_
#ifdef DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_ABSTRACT_

#include <cmath>
#include <limits>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"


namespace dlib
{
    /*
        A good discussion of the search strategies in this file can be found in the 
        following book:  Numerical Optimization by Nocedal and Wright.
    */

// ----------------------------------------------------------------------------------------

    class cg_search_strategy
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for determining which direction
                a line search should be carried out along.  This particular object
                is an implementation of the Polak-Ribiere conjugate gradient method
                for determining this direction.

                This method uses an amount of memory that is linear in the number
                of variables to be optimized.  So it is capable of handling problems
                with a very large number of variables.  However, it is generally
                not as good as the L-BFGS algorithm (which is defined below in
                the lbfgs_search_strategy class).
        !*/

    public:
        cg_search_strategy(
        );
        /*!
            ensures
                - This object is properly initialized and ready to generate
                  search directions.
        !*/

        double get_wolfe_rho (
        ) const;
        /*!
            ensures
                - returns the value of the Wolfe rho parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        double get_wolfe_sigma (
        ) const; 
        /*!
            ensures
                - returns the value of the Wolfe sigma parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        unsigned long get_max_line_search_iterations (
        ) const; 
        /*!
            ensures
                - returns the value of the max iterations parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
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
                - Assuming that a line search is going to be conducted starting from the point x,
                  this function returns the direction in which the search should proceed.
        !*/

    };

// ----------------------------------------------------------------------------------------

    class bfgs_search_strategy
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for determining which direction
                a line search should be carried out along.  This particular object
                is an implementation of the BFGS quasi-newton method for determining 
                this direction.

                This method uses an amount of memory that is quadratic in the number
                of variables to be optimized.  It is generally very effective but 
                if your problem has a very large number of variables then it isn't 
                appropriate.  Instead You should try the lbfgs_search_strategy.
        !*/

    public:
        bfgs_search_strategy(
        );
        /*!
            ensures
                - This object is properly initialized and ready to generate
                  search directions.
        !*/

        double get_wolfe_rho (
        ) const;
        /*!
            ensures
                - returns the value of the Wolfe rho parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        double get_wolfe_sigma (
        ) const; 
        /*!
            ensures
                - returns the value of the Wolfe sigma parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        unsigned long get_max_line_search_iterations (
        ) const; 
        /*!
            ensures
                - returns the value of the max iterations parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
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
                - Assuming that a line search is going to be conducted starting from the point x,
                  this function returns the direction in which the search should proceed.
        !*/
    };

// ----------------------------------------------------------------------------------------

    class lbfgs_search_strategy
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for determining which direction
                a line search should be carried out along.  This particular object
                is an implementation of the L-BFGS quasi-newton method for determining 
                this direction.

                This method uses an amount of memory that is linear in the number
                of variables to be optimized.  This makes it an excellent method 
                to use when an optimization problem has a large number of variables.
        !*/
    public:
        explicit lbfgs_search_strategy(
            unsigned long max_size
        ); 
        /*!
            requires
                - max_size > 0
            ensures
                - This object is properly initialized and ready to generate
                  search directions.
                - L-BFGS works by remembering a certain number of position and gradient 
                  pairs.  It uses this remembered information to compute search directions.
                  The max_size argument determines how many of these pairs will be remembered.
                  Typically, using between 3 and 30 pairs performs well for many problems.
        !*/

        double get_wolfe_rho (
        ) const;
        /*!
            ensures
                - returns the value of the Wolfe rho parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        double get_wolfe_sigma (
        ) const; 
        /*!
            ensures
                - returns the value of the Wolfe sigma parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        unsigned long get_max_line_search_iterations (
        ) const; 
        /*!
            ensures
                - returns the value of the max iterations parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        template <typename T>
        const matrix<double,0,1>& get_next_direction (
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
                - Assuming that a line search is going to be conducted starting from the point x,
                  this function returns the direction in which the search should proceed.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename hessian_funct
        >
    class newton_search_strategy_obj
    {
        /*!
            REQUIREMENTS ON hessian_funct
                Objects of hessian_funct type must be function objects which
                take a single argument and return a dlib::matrix of doubles.  The
                single argument must be a dlib::matrix capable of representing
                column vectors of doubles.  hessian_funct must also be copy 
                constructable.  

            WHAT THIS OBJECT REPRESENTS
                This object represents a strategy for determining which direction
                a line search should be carried out along.  This particular object
                is an implementation of the newton method for determining this 
                direction.  That is, it uses the following formula to determine
                the direction:
                    search_direction = -inv(hessian(x))*derivative
        !*/
    public:
        explicit newton_search_strategy_obj(
            const hessian_funct& hess
        ); 
        /*!
            ensures
                - This object is properly initialized and ready to generate
                  search directions.
                - hess will be used by this object to generate the needed hessian
                  matrices every time get_next_direction() is called.
        !*/

        double get_wolfe_rho (
        ) const;
        /*!
            ensures
                - returns the value of the Wolfe rho parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        double get_wolfe_sigma (
        ) const; 
        /*!
            ensures
                - returns the value of the Wolfe sigma parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        unsigned long get_max_line_search_iterations (
        ) const; 
        /*!
            ensures
                - returns the value of the max iterations parameter that should be used when 
                  this search strategy is used with the line_search() function.
        !*/

        template <typename T>
        const matrix<double,0,1> get_next_direction (
            const T& x,
            const double funct_value,
            const T& funct_derivative
        );
        /*!
            requires
                - for some objective function f():
                    - x == the search point for the current iteration
                    - funct_value == f(x)
                    - funct_derivative == derivative(f)(x)
            ensures
                - Assuming that a line search is going to be conducted starting from the 
                  point x, this function returns the direction in which the search should 
                  proceed.
                - In particular, the search direction will be given by:
                    - search_direction = -inv(hessian(x))*funct_derivative
        !*/

    };

    template <typename hessian_funct>
    newton_search_strategy_obj<hessian_funct> newton_search_strategy (
        const hessian_funct& hessian
    ) { return newton_search_strategy_obj<hessian_funct>(hessian); }
    /*!
        ensures
            - constructs and returns a newton_search_strategy_obj.  
              This function is just a helper to make the syntax for creating
              these objects a little simpler.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_SEARCH_STRATEGIES_ABSTRACT_

