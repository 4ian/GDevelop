// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OPTIMIZATIoN_OCA_Hh_
#define DLIB_OPTIMIZATIoN_OCA_Hh_

#include "optimization_oca_abstract.h"

#include "../matrix.h"
#include "optimization_solve_qp_using_smo.h"
#include <vector>
#include "../sequence.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    template <typename matrix_type>
    class oca_problem
    {
    public:
        typedef typename matrix_type::type scalar_type;

        virtual ~oca_problem() {}

        virtual bool risk_has_lower_bound (
            scalar_type& 
        ) const { return false; }

        virtual bool optimization_status (
            scalar_type ,
            scalar_type ,
            scalar_type ,
            scalar_type ,
            unsigned long,
            unsigned long
        ) const = 0;

        virtual scalar_type get_c (
        ) const = 0;

        virtual long get_num_dimensions (
        ) const = 0;

        virtual void get_risk (
            matrix_type& current_solution,
            scalar_type& risk_value,
            matrix_type& risk_subgradient
        ) const = 0;

    };

// ----------------------------------------------------------------------------------------

    class oca
    {
    public:

        oca () 
        {
            sub_eps = 1e-2;
            sub_max_iter = 50000;

            inactive_thresh = 20;
        }

        void set_subproblem_epsilon (
            double eps_
        ) { sub_eps = eps_; }

        double get_subproblem_epsilon (
        ) const { return sub_eps; }

        void set_subproblem_max_iterations (
            unsigned long sub_max_iter_
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(sub_max_iter_ > 0,
                "\t void oca::set_subproblem_max_iterations"
                << "\n\t max iterations must be greater than 0"
                << "\n\t sub_max_iter_: " << sub_max_iter_
                << "\n\t this: " << this
                );

            sub_max_iter = sub_max_iter_; 
        }

        unsigned long get_subproblem_max_iterations (
        ) const { return sub_max_iter; }

        void set_inactive_plane_threshold (
            unsigned long inactive_thresh_
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(inactive_thresh_ > 0,
                "\t void oca::set_inactive_plane_threshold"
                << "\n\t inactive threshold must be greater than 0"
                << "\n\t inactive_thresh_: " << inactive_thresh_
                << "\n\t this: " << this
                );

            inactive_thresh = inactive_thresh_; 
        }

        unsigned long get_inactive_plane_threshold (
        ) const { return inactive_thresh; }

        template <
            typename matrix_type
            >
        typename matrix_type::type operator() (
            const oca_problem<matrix_type>& problem,
            matrix_type& w,
            unsigned long num_nonnegative = 0,
            unsigned long force_weight_to_1 = std::numeric_limits<unsigned long>::max()
        ) const
        {
            matrix_type empty_prior;
            return oca_impl(problem, w, empty_prior, false, num_nonnegative, force_weight_to_1);
        }

        template <
            typename matrix_type
            >
        typename matrix_type::type operator() (
            const oca_problem<matrix_type>& problem,
            matrix_type& w,
            const matrix_type& prior
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(prior) && prior.size() == problem.get_num_dimensions(),
                "\t scalar_type oca::operator()"
                << "\n\t The prior vector does not have the correct dimensions."
                << "\n\t is_col_vector(prior):         " << is_col_vector(prior) 
                << "\n\t prior.size():                 " << prior.size() 
                << "\n\t problem.get_num_dimensions(): " << problem.get_num_dimensions() 
                << "\n\t this:                         " << this
                );
            // disable the force weight to 1 option for this mode.  We also disable the
            // non-negative constraints.
            unsigned long force_weight_to_1 = std::numeric_limits<unsigned long>::max();
            return oca_impl(problem, w, prior, true, 0, force_weight_to_1);
        }

    private:

        template <
            typename matrix_type
            >
        typename matrix_type::type oca_impl (
            const oca_problem<matrix_type>& problem,
            matrix_type& w,
            const matrix_type prior,
            bool have_prior,
            unsigned long num_nonnegative,
            unsigned long force_weight_to_1
        ) const
        {
            const unsigned long num_dims = problem.get_num_dimensions();

            // make sure requires clause is not broken
            DLIB_ASSERT(problem.get_c() > 0 &&
                        problem.get_num_dimensions() > 0,
                "\t scalar_type oca::operator()"
                << "\n\t The oca_problem is invalid"
                << "\n\t problem.get_c():              " << problem.get_c() 
                << "\n\t problem.get_num_dimensions(): " << num_dims 
                << "\n\t this: " << this
                );


            if (num_nonnegative > num_dims)
                num_nonnegative = num_dims;

            typedef typename matrix_type::type scalar_type;
            typedef typename matrix_type::layout_type layout_type;
            typedef typename matrix_type::mem_manager_type mem_manager_type;
            typedef matrix_type vect_type;

            const scalar_type C = problem.get_c();

            typename sequence<vect_type>::kernel_2a planes;
            std::vector<scalar_type> bs, miss_count;

            vect_type new_plane, alpha;

            w.set_size(num_dims, 1);
            w = 0;

            // The current objective value.  Note also that w always contains 
            // the current solution.
            scalar_type cur_obj = std::numeric_limits<scalar_type>::max();

            // This will hold the cutting plane objective value.  This value is
            // a lower bound on the true optimal objective value.
            scalar_type cp_obj = 0;

            matrix<scalar_type,0,0,mem_manager_type, layout_type> K, Ktmp;

            scalar_type R_lower_bound;
            if (problem.risk_has_lower_bound(R_lower_bound))
            {
                // The flat lower bounding plane is always good to have if we know
                // what it is.
                bs.push_back(R_lower_bound);
                new_plane = zeros_matrix(w);
                planes.add(0, new_plane);
                alpha = uniform_matrix<scalar_type>(1,1, C);
                miss_count.push_back(0);

                K.set_size(1,1);
                K(0,0) = 0;
            }

            const double prior_norm = have_prior ?  0.5*dot(prior,prior) : 0;

            unsigned long counter = 0;
            while (true)
            {

                // add the next cutting plane
                scalar_type cur_risk;
                if (force_weight_to_1 < (unsigned long)w.size())
                    w(force_weight_to_1) = 1;

                problem.get_risk(w, cur_risk, new_plane);

                if (force_weight_to_1 < (unsigned long)w.size())
                {
                    // We basically arrange for the w(force_weight_to_1) element and all
                    // subsequent elements of w to not be involved in the optimization at
                    // all.  An easy way to do this is to just make sure the elements of w
                    // corresponding elements in the subgradient are always set to zero
                    // while we run the cutting plane algorithm.  The only time
                    // w(force_weight_to_1) is 1 is when we pass it to the oca_problem.
                    set_rowm(w, range(force_weight_to_1, w.size()-1)) = 0;
                    set_rowm(new_plane, range(force_weight_to_1, new_plane.size()-1)) = 0;
                }

                if (have_prior)
                    bs.push_back(cur_risk - dot(w,new_plane) + dot(prior,new_plane));
                else
                    bs.push_back(cur_risk - dot(w,new_plane));
                planes.add(planes.size(), new_plane);
                miss_count.push_back(0);

                // If alpha is empty then initialize it (we must always have sum(alpha) == C).  
                // But otherwise, just append a zero.
                if (alpha.size() == 0)
                    alpha = uniform_matrix<scalar_type>(1,1, C);
                else
                    alpha = join_cols(alpha,zeros_matrix<scalar_type>(1,1));

                const scalar_type wnorm = 0.5*trans(w)*w;
                const double prior_part = have_prior? dot(w,prior) : 0;
                cur_obj = wnorm + C*cur_risk + prior_norm-prior_part;

                // report current status
                const scalar_type risk_gap = cur_risk - (cp_obj-wnorm+prior_part-prior_norm)/C;
                if (counter > 0 && problem.optimization_status(cur_obj, cur_obj - cp_obj, 
                                                               cur_risk, risk_gap, planes.size(), counter))
                {
                    break;
                }

                // compute kernel matrix for all the planes
                K.swap(Ktmp);
                K.set_size(planes.size(), planes.size());
                // copy over the old K matrix
                set_subm(K, 0,0, Ktmp.nr(), Ktmp.nc()) = Ktmp;

                // now add the new row and column to K
                for (unsigned long c = 0; c < planes.size(); ++c)
                {
                    K(c, Ktmp.nc()) = dot(planes[c], planes[planes.size()-1]);
                    K(Ktmp.nc(), c) = K(c,Ktmp.nc());
                }


                // solve the cutting plane subproblem for the next w.   We solve it to an
                // accuracy that is related to how big the error gap is
                scalar_type eps = std::min<scalar_type>(sub_eps, 0.1*(cur_obj-cp_obj)) ;
                // just a sanity check
                if (eps < 1e-16)
                    eps = 1e-16;
                // Note that we warm start this optimization by using the alpha from the last
                // iteration as the starting point.
                if (num_nonnegative != 0)
                {
                    // copy planes into a matrix so we can call solve_qp4_using_smo()
                    matrix<scalar_type,0,0,mem_manager_type, layout_type> planes_mat(num_nonnegative,planes.size());
                    for (unsigned long i = 0; i < planes.size(); ++i)
                        set_colm(planes_mat,i) = colm(planes[i],0,num_nonnegative);

                    solve_qp4_using_smo(planes_mat, K, mat(bs), alpha, eps, sub_max_iter); 
                }
                else
                {
                    solve_qp_using_smo(K, mat(bs), alpha, eps, sub_max_iter); 
                }

                // construct the w that minimized the subproblem.
                w = -alpha(0)*planes[0];
                for (unsigned long i = 1; i < planes.size(); ++i)
                    w -= alpha(i)*planes[i];
                // threshold the first num_nonnegative w elements if necessary.
                if (num_nonnegative != 0)
                    set_rowm(w,range(0,num_nonnegative-1)) = lowerbound(rowm(w,range(0,num_nonnegative-1)),0);

                for (long i = 0; i < alpha.size(); ++i)
                {
                    if (alpha(i) != 0)
                        miss_count[i] = 0;
                    else
                        miss_count[i] += 1;
                }

                // Compute the lower bound on the true objective given to us by the cutting 
                // plane subproblem.
                cp_obj = -0.5*trans(w)*w + trans(alpha)*mat(bs);
                if (have_prior)
                    w += prior;

                // If it has been a while since a cutting plane was an active constraint then
                // we should throw it away.
                while (max(mat(miss_count)) >= inactive_thresh)
                {
                    const long idx = index_of_max(mat(miss_count));
                    bs.erase(bs.begin()+idx);
                    miss_count.erase(miss_count.begin()+idx);
                    K = removerc(K, idx, idx);
                    alpha = remove_row(alpha,idx);
                    planes.remove(idx, new_plane);
                }

                ++counter;
            }

            if (force_weight_to_1 < (unsigned long)w.size())
                w(force_weight_to_1) = 1;

            return cur_obj;
        }

        double sub_eps;

        unsigned long sub_max_iter;

        unsigned long inactive_thresh;
    };
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_OPTIMIZATIoN_OCA_Hh_

