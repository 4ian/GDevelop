// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RVm_
#define DLIB_RVm_

#include "rvm_abstract.h"
#include <cmath>
#include <limits>
#include "../matrix.h"
#include "../algs.h"
#include "function.h"
#include "kernel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace rvm_helpers
    {

    // ------------------------------------------------------------------------------------

        template <typename scalar_vector_type, typename mem_manager_type>
        long find_next_best_alpha_to_update (
            const scalar_vector_type& S,
            const scalar_vector_type& Q,
            const scalar_vector_type& alpha,
            const matrix<long,0,1,mem_manager_type>& active_bases,
            const bool search_all_alphas,
            typename scalar_vector_type::type eps
        ) 
        /*!
            ensures
                - if (we can find another alpha to update) then
                    - returns the index of said alpha 
                - else
                    - returns -1
        !*/
        {
            typedef typename scalar_vector_type::type scalar_type;
            // now use S and Q to find next alpha to update.  What
            // we want to do here is select the alpha to update that gives us
            // the greatest improvement in marginal likelihood.
            long selected_idx = -1;
            scalar_type greatest_improvement = -1;
            for (long i = 0; i < S.nr(); ++i)
            {
                scalar_type value = -1;

                // if i is currently in the active set
                if (active_bases(i) >= 0)
                {
                    const long idx = active_bases(i);
                    const scalar_type s = alpha(idx)*S(i)/(alpha(idx) - S(i));
                    const scalar_type q = alpha(idx)*Q(i)/(alpha(idx) - S(i));

                    if (q*q-s > 0)
                    {
                        // only update an existing alpha if this is a narrow search
                        if (search_all_alphas == false)
                        {
                            // choosing this sample would mean doing an update of an 
                            // existing alpha value.
                            scalar_type new_alpha = s*s/(q*q-s);
                            scalar_type cur_alpha = alpha(idx);
                            new_alpha = 1/new_alpha;
                            cur_alpha = 1/cur_alpha;

                            // from equation 32 in the Tipping paper 
                            value = Q(i)*Q(i)/(S(i) +  1/(new_alpha - cur_alpha) ) - 
                                std::log(1 + S(i)*(new_alpha - cur_alpha));
                        }

                    }
                    // we only pick an alpha to remove if this is a wide search and it wasn't one of the recently added ones 
                    else if (search_all_alphas && idx+2 < alpha.size() )  
                    {
                        // choosing this sample would mean the alpha value is infinite 
                        // so we would remove the selected sample from our model.

                        // from equation 37 in the Tipping paper 
                        value = Q(i)*Q(i)/(S(i) - alpha(idx)) - 
                            std::log(1-S(i)/alpha(idx));

                    }
                }
                else if (search_all_alphas)
                {
                    const scalar_type s = S(i);
                    const scalar_type q = Q(i);

                    if (q*q-s > 0)
                    {
                        // choosing this sample would mean we would add the selected 
                        // sample to our model.

                        // from equation 27 in the Tipping paper 
                        value = (Q(i)*Q(i)-S(i))/S(i) + std::log(S(i)/(Q(i)*Q(i)));
                    }
                }

                if (value > greatest_improvement)
                {
                    greatest_improvement = value;
                    selected_idx = i;
                }
            }

            // If the greatest_improvement in marginal likelihood we would get is less
            // than our epsilon then report that there isn't anything else to do.  But
            // if it is big enough then return the selected_idx.
            if (greatest_improvement > eps)
                return selected_idx;
            else
                return -1;
        }

    } // end namespace rvm_helpers

    // ------------------------------------------------------------------------------------


    template <
        typename kern_type 
        >
    class rvm_trainer 
    {
        /*!
            This is an implementation of the binary classifier version of the
            relevance vector machine algorithm described in the paper:
                Tipping, M. E. and A. C. Faul (2003). Fast marginal likelihood maximisation 
                for sparse Bayesian models. In C. M. Bishop and B. J. Frey (Eds.), Proceedings 
                of the Ninth International Workshop on Artificial Intelligence and Statistics, 
                Key West, FL, Jan 3-6.

            This code mostly does what is described in the above paper with the exception 
            that here we use a different stopping condition as well as a modified alpha
            selection rule.  See the code for the exact details.
        !*/

    public:
        typedef kern_type kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rvm_trainer (
        ) : eps(0.001), max_iterations(2000)
        {
        }

        void set_max_iterations (
            unsigned long max_iterations_
        )
        {
            max_iterations = max_iterations_;
        }

        unsigned long get_max_iterations (
        ) const
        { 
            return max_iterations;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid rvm_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps: " << eps_ 
                );
            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const
        { 
            return eps;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kernel = k;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            return do_train(mat(x), mat(y));
        }

        void swap (
            rvm_trainer& item
        )
        {
            exchange(kernel, item.kernel);
            exchange(eps, item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {

            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(x,y) == true,
                "\tdecision_function rvm_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
                );

            // make a target vector where +1 examples have value 1 and -1 examples
            // have a value of 0.
            scalar_vector_type t(y.size());
            for (long i = 0; i < y.size(); ++i)
            {
                if (y(i) == 1)
                    t(i) = 1;
                else
                    t(i) = 0;
            }

            /*! This is the convention for the active_bases variable in the function:
                - if (active_bases(i) >= 0) then
                    - alpha(active_bases(i)) == the alpha value associated with sample x(i)
                    - weights(active_bases(i)) == the weight value associated with sample x(i)
                    - colm(phi, active_bases(i)) == the column of phi associated with sample x(i)
                    - colm(phi, active_bases(i)) == kernel column i (from get_kernel_colum()) 
                - else
                    - the i'th sample isn't in the model and notionally has an alpha of infinity and
                      a weight of 0.
            !*/
            matrix<long,0,1,mem_manager_type> active_bases(x.nr());
            scalar_matrix_type phi(x.nr(),1);
            scalar_vector_type alpha(1), prev_alpha;
            scalar_vector_type weights(1), prev_weights;

            scalar_vector_type tempv, K_col; 

            // set the initial values of these guys
            set_all_elements(active_bases, -1);
            long first_basis = pick_initial_vector(x,t);
            get_kernel_colum(first_basis, x, K_col);
            active_bases(first_basis) = 0;
            set_colm(phi,0) = K_col;
            alpha(0) = compute_initial_alpha(phi, t);
            weights(0) = 1;


            // now declare a bunch of other variables we will be using below
            scalar_vector_type mu, t_hat, Q, S; 
            scalar_matrix_type sigma;
            
            matrix<scalar_type,1,0,mem_manager_type> tempv2, tempv3;
            scalar_matrix_type tempm;

            scalar_vector_type t_estimate;
            scalar_vector_type beta;


            Q.set_size(x.nr());
            S.set_size(x.nr());

            bool recompute_beta = true;

            bool search_all_alphas = false;
            unsigned long ticker = 0;
            const unsigned long rounds_of_narrow_search = 100;
            unsigned long iterations = 0;

            while (iterations != max_iterations)
            {
                iterations++;
                if (recompute_beta)
                {
                    // calculate the current t_estimate. (this is the predicted t value for each sample according to the
                    // current state of the classifier)
                    t_estimate = phi*weights;

                    // calculate the current beta
                    beta = sigmoid(t_estimate);
                    beta = pointwise_multiply(beta,(uniform_matrix<scalar_type>(beta.nr(),beta.nc(),1)-beta));
                    recompute_beta = false;
                }

                // Compute optimal weights and sigma for current alpha using IRLS.  This is the same
                // technique documented in the paper by equations 12-14. 
                scalar_type weight_delta = std::numeric_limits<scalar_type>::max();
                int count = 0;
                while (weight_delta > 0.0001)
                {
                    // This is a sanity check to make sure we never get stuck in this
                    // loop to do some degenerate numerical condition 
                    ++count;
                    if (count > 100)
                    {
                        // jump us to where search_all_alphas will be set to true 
                        ticker = rounds_of_narrow_search;
                        break;
                    }

                    // compute the updated sigma matrix
                    sigma = scale_columns(trans(phi),beta)*phi;
                    for (long r = 0; r < alpha.nr(); ++r)
                        sigma(r,r) += alpha(r);
                    sigma = inv(sigma);


                    // compute the updated weights vector (t_hat = phi*mu_mp + inv(B)*(t-y))
                    t_hat = t_estimate + trans(scale_columns(trans(t-sigmoid(t_estimate)),reciprocal(beta))); 

                    // mu = sigma*trans(phi)*b*t_hat
                    mu = sigma*tmp(trans(phi)* trans(scale_columns(trans(t_hat), beta)));  

                    // now compute how much the weights vector changed during this iteration
                    // through this loop.
                    weight_delta = max(abs(mu-weights));

                    // put mu into the weights vector
                    mu.swap(weights);

                    // calculate the current t_estimate
                    t_estimate = phi*weights;

                    // calculate the current beta
                    beta = sigmoid(t_estimate);
                    beta = pointwise_multiply(beta, uniform_matrix<scalar_type>(beta.nr(),beta.nc(),1)-beta);

                }

                // check if we should do a full search for the best alpha to optimize
                if (ticker >= rounds_of_narrow_search)
                {
                    // if the current alpha and weights are equal to what they were
                    // at the last time we were about to start a wide search then
                    // we are done.
                    if (equal(prev_alpha, alpha, eps) && equal(prev_weights, weights, eps))
                        break;


                    prev_alpha = alpha;
                    prev_weights = weights;
                    search_all_alphas = true;
                    ticker = 0;
                }
                else
                {
                    search_all_alphas = false;
                }
                ++ticker;

                // compute S and Q using equations 24 and 25 (tempv = phi*sigma*trans(phi)*B*t_hat)
                tempv = phi*tmp(sigma*tmp(trans(phi)*trans(scale_columns(trans(t_hat),beta)))); 
                for (long i = 0; i < S.size(); ++i)
                {
                    // if we are currently limiting the search for the next alpha to update
                    // to the set in the active set then skip a non-active vector.
                    if (search_all_alphas == false && active_bases(i) == -1)
                        continue;

                    // get the column for this sample out of the kernel matrix.  If it is 
                    // something in the active set then just get it right out of phi, otherwise 
                    // we have to calculate it.
                    if (active_bases(i) != -1)
                        K_col = colm(phi,active_bases(i));
                    else
                        get_kernel_colum(i, x, K_col);

                    // tempv2 = trans(phi_m)*B
                    tempv2 = scale_columns(trans(K_col), beta);  
                    tempv3 = tempv2*phi;
                    S(i) = tempv2*K_col - tempv3*sigma*trans(tempv3);
                    Q(i) = tempv2*t_hat - tempv2*tempv; 
                }

                const long selected_idx = rvm_helpers::find_next_best_alpha_to_update(S,Q,alpha,active_bases, search_all_alphas, eps);


                // if find_next_best_alpha_to_update didn't find any good alpha to update
                if (selected_idx == -1)
                {
                    if (search_all_alphas == false)
                    {
                        // jump us to where search_all_alphas will be set to true and try again
                        ticker = rounds_of_narrow_search;
                        continue;
                    }
                    else
                    {
                        // we are really done so quit the main loop
                        break;
                    }
                }


                // next we update the selected alpha.

                // if the selected alpha is in the active set
                if (active_bases(selected_idx) >= 0)
                {
                    const long idx = active_bases(selected_idx);
                    const scalar_type s = alpha(idx)*S(selected_idx)/(alpha(idx) - S(selected_idx));
                    const scalar_type q = alpha(idx)*Q(selected_idx)/(alpha(idx) - S(selected_idx));

                    if (q*q-s > 0)
                    {
                        // reestimate the value of alpha
                        alpha(idx) = s*s/(q*q-s);

                    }
                    else 
                    {
                        // the new alpha value is infinite so remove the selected alpha from our model
                        active_bases(selected_idx) = -1; 
                        phi = remove_col(phi, idx);
                        weights = remove_row(weights, idx);
                        alpha = remove_row(alpha, idx);

                        // fix the index values in active_bases
                        for (long i = 0; i < active_bases.size(); ++i)
                        {
                            if (active_bases(i) > idx)
                            {
                                active_bases(i) -= 1;
                            }
                        }

                        // we changed the number of weights so we need to remember to 
                        // recompute the beta vector next time around the main loop.
                        recompute_beta = true;
                    }
                }
                else
                {
                    const scalar_type s = S(selected_idx);
                    const scalar_type q = Q(selected_idx);

                    if (q*q-s > 0)
                    {
                        // add the selected alpha to our model
                        
                        active_bases(selected_idx) = phi.nc();
                        
                        // update alpha
                        tempv.set_size(alpha.size()+1);
                        set_subm(tempv, get_rect(alpha)) = alpha;
                        tempv(phi.nc()) = s*s/(q*q-s);
                        tempv.swap(alpha);

                        // update weights 
                        tempv.set_size(weights.size()+1);
                        set_subm(tempv, get_rect(weights)) = weights;
                        tempv(phi.nc()) = 0;
                        tempv.swap(weights);

                        // update phi by adding the new sample's kernel matrix column in as one of phi's columns
                        tempm.set_size(phi.nr(), phi.nc()+1);
                        set_subm(tempm, get_rect(phi)) = phi;
                        get_kernel_colum(selected_idx, x, K_col);
                        set_colm(tempm, phi.nc()) = K_col;
                        tempm.swap(phi);


                        // we changed the number of weights so we need to remember to 
                        // recompute the beta vector next time around the main loop.
                        recompute_beta = true;
                    }
                }

            } // end while(true).  So we have converged on the final answer.


            // now put everything into a decision_function object and return it
            std_vector_c<sample_type> dictionary;
            std_vector_c<scalar_type> final_weights;
            for (long i = 0; i < active_bases.size(); ++i)
            {
                if (active_bases(i) >= 0)
                {
                    dictionary.push_back(x(i));
                    final_weights.push_back(weights(active_bases(i)));
                }
            }

            return decision_function<kernel_type> ( mat(final_weights),
                                                    -sum(mat(final_weights))*tau, 
                                                    kernel,
                                                    mat(dictionary));

        }

    // ------------------------------------------------------------------------------------

        template <typename M1, typename M2>
        long pick_initial_vector (
            const M1& x,
            const M2& t
        ) const
        {
            scalar_vector_type K_col;
            double max_projection = -std::numeric_limits<scalar_type>::infinity();
            long max_idx = 0;
            // find the row in the kernel matrix that has the biggest normalized projection onto the t vector
            for (long r = 0; r < x.nr(); ++r)
            {
                get_kernel_colum(r,x,K_col);
                double temp = trans(K_col)*t;
                temp = temp*temp/length_squared(K_col);

                if (temp > max_projection)
                {
                    max_projection = temp;
                    max_idx = r;
                }
            }

            return max_idx;
        }

    // ------------------------------------------------------------------------------------

        template <typename T>
        void get_kernel_colum (
            long idx,
            const T& x,
            scalar_vector_type& col
        ) const
        {
            col.set_size(x.nr());
            for (long i = 0; i < col.size(); ++i)
            {
                col(i) = kernel(x(idx), x(i)) + tau;
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename M1, typename M2>
        scalar_type compute_initial_alpha (
            const M1& phi,
            const M2& t
        ) const
        {
            const double temp = length_squared(phi);
            const double temp2 = trans(phi)*t;

            return temp/( temp2*temp2/temp + variance(t)*0.1);
        }

    // ------------------------------------------------------------------------------------

    // private member variables
        kernel_type kernel;
        scalar_type eps;
        unsigned long max_iterations;

        const static scalar_type tau;

    }; // end of class rvm_trainer 

    template <typename kernel_type>
    const typename kernel_type::scalar_type rvm_trainer<kernel_type>::tau = static_cast<typename kernel_type::scalar_type>(0.001);

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        rvm_trainer<K>& a,
        rvm_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename kern_type 
        >
    class rvm_regression_trainer 
    {
        /*!
            This is an implementation of the regression version of the
            relevance vector machine algorithm described in the paper:
                Tipping, M. E. and A. C. Faul (2003). Fast marginal likelihood maximisation 
                for sparse Bayesian models. In C. M. Bishop and B. J. Frey (Eds.), Proceedings 
                of the Ninth International Workshop on Artificial Intelligence and Statistics, 
                Key West, FL, Jan 3-6.

            This code mostly does what is described in the above paper with the exception 
            that here we use a different stopping condition as well as a modified alpha
            selection rule.  See the code for the exact details.
        !*/

    public:
        typedef kern_type kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rvm_regression_trainer (
        ) : eps(0.001)
        {
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid rvm_regression_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps: " << eps_ 
                );
            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const
        { 
            return eps;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kernel = k;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& t
        ) const
        {
            return do_train(mat(x), mat(t));
        }

        void swap (
            rvm_regression_trainer& item
        )
        {
            exchange(kernel, item.kernel);
            exchange(eps, item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& t
        ) const
        {

            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,t) && x.size() > 0,
                "\tdecision_function rvm_regression_trainer::train(x,t)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t t.nr(): " << t.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t t.nc(): " << t.nc() 
                );


            /*! This is the convention for the active_bases variable in the function:
                - if (active_bases(i) >= 0) then
                    - alpha(active_bases(i)) == the alpha value associated with sample x(i)
                    - weights(active_bases(i)) == the weight value associated with sample x(i)
                    - colm(phi, active_bases(i)) == the column of phi associated with sample x(i)
                    - colm(phi, active_bases(i)) == kernel column i (from get_kernel_colum()) 
                - else
                    - the i'th sample isn't in the model and notionally has an alpha of infinity and
                      a weight of 0.
            !*/
            matrix<long,0,1,mem_manager_type> active_bases(x.nr());
            scalar_matrix_type phi(x.nr(),1);
            scalar_vector_type alpha(1), prev_alpha;
            scalar_vector_type weights(1), prev_weights;

            scalar_vector_type tempv, K_col; 
            scalar_type var = variance(t)*0.1;

            // set the initial values of these guys
            set_all_elements(active_bases, -1);
            long first_basis = pick_initial_vector(x,t);
            get_kernel_colum(first_basis, x, K_col);
            active_bases(first_basis) = 0;
            set_colm(phi,0) = K_col;
            alpha(0) = compute_initial_alpha(phi, t, var);
            weights(0) = 1;


            // now declare a bunch of other variables we will be using below
            scalar_vector_type Q, S; 
            scalar_matrix_type sigma;
            
            matrix<scalar_type,1,0,mem_manager_type> tempv2, tempv3;
            scalar_matrix_type tempm;


            Q.set_size(x.nr());
            S.set_size(x.nr());


            bool search_all_alphas = false;
            unsigned long ticker = 0;
            const unsigned long rounds_of_narrow_search = 100;

            while (true)
            {
                // Compute optimal weights and sigma for current alpha using equation 6. 
                sigma = trans(phi)*phi/var;
                for (long r = 0; r < alpha.nr(); ++r)
                    sigma(r,r) += alpha(r);
                sigma = inv(sigma);
                weights = sigma*trans(phi)*t/var;  



                // check if we should do a full search for the best alpha to optimize
                if (ticker == rounds_of_narrow_search)
                {
                    // if the current alpha and weights are equal to what they were
                    // at the last time we were about to start a wide search then
                    // we are done.
                    if (equal(prev_alpha, alpha, eps) && equal(prev_weights, weights, eps))
                        break;

                    prev_alpha = alpha;
                    prev_weights = weights;
                    search_all_alphas = true;
                    ticker = 0;
                }
                else
                {
                    search_all_alphas = false;
                }
                ++ticker;

                // compute S and Q using equations 24 and 25 (tempv = phi*sigma*trans(phi)*B*t)
                tempv = phi*tmp(sigma*tmp(trans(phi)*t/var)); 
                for (long i = 0; i < S.size(); ++i)
                {
                    // if we are currently limiting the search for the next alpha to update
                    // to the set in the active set then skip a non-active vector.
                    if (search_all_alphas == false && active_bases(i) == -1)
                        continue;

                    // get the column for this sample out of the kernel matrix.  If it is 
                    // something in the active set then just get it right out of phi, otherwise 
                    // we have to calculate it.
                    if (active_bases(i) != -1)
                        K_col = colm(phi,active_bases(i));
                    else
                        get_kernel_colum(i, x, K_col);

                    // tempv2 = trans(phi_m)*B
                    tempv2 = trans(K_col)/var;  
                    tempv3 = tempv2*phi;
                    S(i) = tempv2*K_col - tempv3*sigma*trans(tempv3);
                    Q(i) = tempv2*t - tempv2*tempv; 
                }

                const long selected_idx = rvm_helpers::find_next_best_alpha_to_update(S,Q,alpha,active_bases, search_all_alphas, eps);

                // if find_next_best_alpha_to_update didn't find any good alpha to update
                if (selected_idx == -1)
                {
                    if (search_all_alphas == false)
                    {
                        // jump us to where search_all_alphas will be set to true and try again
                        ticker = rounds_of_narrow_search;
                        continue;
                    }
                    else
                    {
                        // we are really done so quit the main loop
                        break;
                    }
                }

                // recompute the variance
                var = length_squared(t - phi*weights)/(x.nr() - weights.size() + trans(alpha)*diag(sigma));

                // next we update the selected alpha.

                // if the selected alpha is in the active set
                if (active_bases(selected_idx) >= 0)
                {
                    const long idx = active_bases(selected_idx);
                    const scalar_type s = alpha(idx)*S(selected_idx)/(alpha(idx) - S(selected_idx));
                    const scalar_type q = alpha(idx)*Q(selected_idx)/(alpha(idx) - S(selected_idx));

                    if (q*q-s > 0)
                    {
                        // reestimate the value of alpha
                        alpha(idx) = s*s/(q*q-s);

                    }
                    else 
                    {
                        // the new alpha value is infinite so remove the selected alpha from our model
                        active_bases(selected_idx) = -1; 
                        phi = remove_col(phi, idx);
                        weights = remove_row(weights, idx);
                        alpha = remove_row(alpha, idx);

                        // fix the index values in active_bases
                        for (long i = 0; i < active_bases.size(); ++i)
                        {
                            if (active_bases(i) > idx)
                            {
                                active_bases(i) -= 1;
                            }
                        }
                    }
                }
                else
                {
                    const scalar_type s = S(selected_idx);
                    const scalar_type q = Q(selected_idx);

                    if (q*q-s > 0)
                    {
                        // add the selected alpha to our model
                        
                        active_bases(selected_idx) = phi.nc();
                        
                        // update alpha
                        tempv.set_size(alpha.size()+1);
                        set_subm(tempv, get_rect(alpha)) = alpha;
                        tempv(phi.nc()) = s*s/(q*q-s);
                        tempv.swap(alpha);

                        // update weights 
                        tempv.set_size(weights.size()+1);
                        set_subm(tempv, get_rect(weights)) = weights;
                        tempv(phi.nc()) = 0;
                        tempv.swap(weights);

                        // update phi by adding the new sample's kernel matrix column in as one of phi's columns
                        tempm.set_size(phi.nr(), phi.nc()+1);
                        set_subm(tempm, get_rect(phi)) = phi;
                        get_kernel_colum(selected_idx, x, K_col);
                        set_colm(tempm, phi.nc()) = K_col;
                        tempm.swap(phi);

                    }
                }



            } // end while(true).  So we have converged on the final answer.

       
            // now put everything into a decision_function object and return it
            std_vector_c<sample_type> dictionary;
            std_vector_c<scalar_type> final_weights;
            for (long i = 0; i < active_bases.size(); ++i)
            {
                if (active_bases(i) >= 0)
                {
                    dictionary.push_back(x(i));
                    final_weights.push_back(weights(active_bases(i)));
                }
            }

            return decision_function<kernel_type> ( mat(final_weights),
                                                    -sum(mat(final_weights))*tau, 
                                                    kernel,
                                                    mat(dictionary));

        }

    // ------------------------------------------------------------------------------------

        template <typename T>
        void get_kernel_colum (
            long idx,
            const T& x,
            scalar_vector_type& col
        ) const
        {
            col.set_size(x.nr());
            for (long i = 0; i < col.size(); ++i)
            {
                col(i) = kernel(x(idx), x(i)) + tau;
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename M1, typename M2>
        scalar_type compute_initial_alpha (
            const M1& phi,
            const M2& t,
            const scalar_type& var
        ) const
        {
            const double temp = length_squared(phi);
            const double temp2 = trans(phi)*t;

            return temp/( temp2*temp2/temp + var);
        }

    // ------------------------------------------------------------------------------------

        template <typename M1, typename M2>
        long pick_initial_vector (
            const M1& x,
            const M2& t
        ) const
        {
            scalar_vector_type K_col;
            double max_projection = -std::numeric_limits<scalar_type>::infinity();
            long max_idx = 0;
            // find the row in the kernel matrix that has the biggest normalized projection onto the t vector
            for (long r = 0; r < x.nr(); ++r)
            {
                get_kernel_colum(r,x,K_col);
                double temp = trans(K_col)*t;
                temp = temp*temp/length_squared(K_col);

                if (temp > max_projection)
                {
                    max_projection = temp;
                    max_idx = r;
                }
            }

            return max_idx;
        }

    // ------------------------------------------------------------------------------------

    // private member variables
        kernel_type kernel;
        scalar_type eps;

        const static scalar_type tau;

    }; // end of class rvm_regression_trainer 

    template <typename kernel_type>
    const typename kernel_type::scalar_type rvm_regression_trainer<kernel_type>::tau = static_cast<typename kernel_type::scalar_type>(0.001);

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        rvm_regression_trainer<K>& a,
        rvm_regression_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RVm_


