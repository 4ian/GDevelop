// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATION_OCA_ABsTRACT_Hh_
#ifdef DLIB_OPTIMIZATION_OCA_ABsTRACT_Hh_

// ----------------------------------------------------------------------------------------

namespace dlib
{
    template <typename matrix_type>
    class oca_problem
    {
        /*!
            REQUIREMENTS ON matrix_type
                - matrix_type == a dlib::matrix capable of storing column vectors

            WHAT THIS OBJECT REPRESENTS
                This object is the interface used to define the optimization 
                problems solved by the oca optimizer defined later in this file.

                OCA solves optimization problems with the following form:
                    Minimize: f(w) == 0.5*length_squared(w) + C*R(w)

                    Where R(w) is a user-supplied convex function and C > 0.  Optionally,
                    there can also be non-negativity constraints on some or all of the 
                    elements of w.

                Or it can alternatively solve:
                    Minimize: f(w) == 0.5*length_squared(w-prior) + C*R(w)

                    Where prior is a user supplied vector and R(w) has the same
                    interpretation as above.
                       

                Note that the stopping condition must be provided by the user
                in the form of the optimization_status() function.
        !*/

    public:

        typedef typename matrix_type::type scalar_type;

        virtual ~oca_problem() {}

        virtual bool risk_has_lower_bound (
            scalar_type& lower_bound
        ) const { return false; }
        /*!
            ensures
                - if (R(w) >= a constant for all values of w) then
                    - returns true
                    - #lower_bound == the constant that lower bounds R(w)
                - else
                    - returns false
        !*/

        virtual bool optimization_status (
            scalar_type current_objective_value,
            scalar_type current_error_gap,
            scalar_type current_risk_value,
            scalar_type current_risk_gap,
            unsigned long num_cutting_planes,
            unsigned long num_iterations
        ) const = 0;
        /*!
            requires
                - This function is called by the OCA optimizer each iteration.  
                - current_objective_value == the current value of the objective function f(w)
                - current_error_gap == The bound on how much lower the objective function
                  can drop before we reach the optimal point.  At the optimal solution the
                  error gap is equal to 0.
                - current_risk_value == the current value of the R(w) term of the objective function.
                - current_risk_gap == the bound on how much lower the risk term can go.  At the optimal
                  solution the risk gap is zero.
                - num_cutting_planes == the number of cutting planes the algorithm is currently using.
                - num_iterations == A count of the total number of iterations that have executed
                  since we started running the optimization.
            ensures
                - If it is appropriate to terminate the optimization then this function returns true
                  and false otherwise.
        !*/

        virtual scalar_type get_c (
        ) const = 0;
        /*!
            ensures
                - returns the C parameter
        !*/

        virtual long get_num_dimensions (
        ) const = 0;
        /*!
            ensures
                - returns the number of free variables in this optimization problem
        !*/

        virtual void get_risk (
            matrix_type& current_solution,
            scalar_type& risk_value,
            matrix_type& risk_subgradient
        ) const = 0;
        /*!
            requires
                - is_col_vector(current_solution) == true
                - current_solution.size() == get_num_dimensions()
            ensures
                - #current_solution will be set to one of the following:
                    - current_solution (i.e. it won't be modified at all)
                    - The result of a line search passing through current_solution.  
                - #risk_value == R(#current_solution) 
                - #risk_subgradient == an element of the subgradient of R() at the 
                  point #current_solution
                - Note that #risk_value and #risk_subgradient are NOT multiplied by get_c()
        !*/

    };

// ----------------------------------------------------------------------------------------

    class oca
    {
        /*!
            INITIAL VALUE
                - get_subproblem_epsilon() == 1e-2
                - get_subproblem_max_iterations() == 50000
                - get_inactive_plane_threshold() == 20

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for solving the optimization problem defined above
                by the oca_problem abstract class.  

                For reference, OCA solves optimization problems with the following form:
                    Minimize: f(w) == 0.5*length_squared(w) + C*R(w)

                    Where R(w) is a user-supplied convex function and C > 0.  Optionally,
                    this object can also add non-negativity constraints to some or all
                    of the elements of w.

                Or it can alternatively solve:
                    Minimize: f(w) == 0.5*length_squared(w-prior) + C*R(w)

                    Where prior is a user supplied vector and R(w) has the same
                    interpretation as above.
                       

                For a detailed discussion you should consult the following papers
                from the Journal of Machine Learning Research:
                    Optimized Cutting Plane Algorithm for Large-Scale Risk Minimization
                        Vojtech Franc, Soren Sonnenburg; 10(Oct):2157--2192, 2009. 

                    Bundle Methods for Regularized Risk Minimization
                        Choon Hui Teo, S.V.N. Vishwanthan, Alex J. Smola, Quoc V. Le; 11(Jan):311-365, 2010. 
        !*/
    public:

        oca (
        ); 
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <
            typename matrix_type
            >
        typename matrix_type::type operator() (
            const oca_problem<matrix_type>& problem,
            matrix_type& w,
            unsigned long num_nonnegative = 0,
            unsigned long force_weight_to_1 = std::numeric_limits<unsigned long>::max()
        ) const;
        /*!
            requires
                - problem.get_c() > 0
                - problem.get_num_dimensions() > 0
            ensures
                - solves the given oca problem and stores the solution in #w.  In particular,
                  this function solves:
                    Minimize: f(w) == 0.5*length_squared(w) + C*R(w)
                - The optimization algorithm runs until problem.optimization_status() 
                  indicates it is time to stop.
                - returns the objective value at the solution #w
                - if (num_nonnegative != 0) then
                    - Adds the constraint that #w(i) >= 0 for all i < num_nonnegative.
                      That is, the first num_nonnegative elements of #w will always be
                      non-negative.  This includes the copies of w passed to get_risk()
                      in the form of the current_solution vector as well as the final
                      output of this function.
                - if (force_weight_to_1 < problem.get_num_dimensions()) then
                    - The optimizer enforces the following constraints:
                        - #w(force_weight_to_1) == 1
                        - for all i > force_weight_to_1:
                            - #w(i) == 0 
                        - That is, the element in the weight vector at the index indicated
                          by force_weight_to_1 will have a value of 1 upon completion of
                          this function, while all subsequent elements of w will have
                          values of 0.
        !*/

        template <
            typename matrix_type
            >
        typename matrix_type::type operator() (
            const oca_problem<matrix_type>& problem,
            matrix_type& w,
            const matrix_type& prior
        ) const;
        /*!
            requires
                - problem.get_c() > 0
                - problem.get_num_dimensions() > 0
                - is_col_vector(prior) == true
                - prior.size() == problem.get_num_dimensions()
            ensures
                - solves the given oca problem and stores the solution in #w.
                - In this mode, we solve a version of the problem with a different
                  regularizer.  In particular, this function solves:
                    Minimize: f(w) == 0.5*length_squared(w-prior) + C*R(w)
                - The optimization algorithm runs until problem.optimization_status() 
                  indicates it is time to stop.
                - returns the objective value at the solution #w
        !*/

        void set_subproblem_epsilon (
            double eps
        ); 
        /*!
            requires
                - eps > 0
            ensures
                - #get_subproblem_epsilon() == eps 
        !*/

        double get_subproblem_epsilon (
        ) const; 
        /*!
            ensures
                - returns the accuracy used in solving the quadratic programming
                  subproblem that is part of the overall OCA algorithm.
        !*/

        void set_subproblem_max_iterations (
            unsigned long sub_max_iter
        ); 
        /*!
            requires
                - sub_max_iter > 0
            ensures
                - #get_subproblem_max_iterations() == sub_max_iter
        !*/

        unsigned long get_subproblem_max_iterations (
        ) const; 
        /*!
            ensures
                - returns the maximum number of iterations this object will perform
                  while attempting to solve each quadratic programming subproblem.
        !*/

        void set_inactive_plane_threshold (
            unsigned long inactive_thresh
        ); 
        /*!
            requires
                - inactive_thresh > 0
            ensures
                - #get_inactive_plane_threshold() == inactive_thresh
        !*/

        unsigned long get_inactive_plane_threshold (
        ) const; 
        /*!
            ensures
                - As OCA runs it builds up a set of cutting planes.  Typically
                  cutting planes become inactive after a certain point and can then
                  be removed.  This function returns the number of iterations of
                  inactivity required before a cutting plane is removed.
        !*/

    };
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_OPTIMIZATION_OCA_ABsTRACT_Hh_


