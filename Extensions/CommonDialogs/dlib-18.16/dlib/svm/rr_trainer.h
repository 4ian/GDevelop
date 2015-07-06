// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RR_TRAInER_Hh_
#define DLIB_RR_TRAInER_Hh_

#include "../algs.h"
#include "function.h"
#include "kernel.h"
#include "empirical_kernel_map.h"
#include "linearly_independent_subset_finder.h"
#include "../statistics.h"
#include "rr_trainer_abstract.h"
#include <vector>
#include <iostream>

namespace dlib
{
    template <
        typename K 
        >
    class rr_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        // You are getting a compiler error on this line because you supplied a non-linear or 
        // sparse kernel to the rr_trainer object.  You have to use dlib::linear_kernel with this trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value));

        rr_trainer (
        ) :
            verbose(false),
            use_regression_loss(true),
            lambda(0)
        {
            // default lambda search list
            lams = matrix_cast<scalar_type>(logspace(-9, 2, 50)); 
        }

        void be_verbose (
        )
        {
            verbose = true;
        }

        void be_quiet (
        )
        {
            verbose = false;
        }

        void use_regression_loss_for_loo_cv (
        )
        {
            use_regression_loss = true;
        }

        void use_classification_loss_for_loo_cv (
        )
        {
            use_regression_loss = false;
        }

        bool will_use_regression_loss_for_loo_cv (
        ) const
        {
            return use_regression_loss;
        }

        const kernel_type get_kernel (
        ) const
        {
            return kernel_type();
        }

        void set_lambda (
            scalar_type lambda_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(lambda_ >= 0,
                "\t void rr_trainer::set_lambda()"
                << "\n\t lambda must be greater than or equal to 0"
                << "\n\t lambda: " << lambda 
                << "\n\t this:   " << this
                );

            lambda = lambda_;
        }

        const scalar_type get_lambda (
        ) const
        {
            return lambda;
        }

        template <typename EXP>
        void set_search_lambdas (
            const matrix_exp<EXP>& lambdas
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_vector(lambdas) && lambdas.size() > 0 && min(lambdas) > 0,
                "\t void rr_trainer::set_search_lambdas()"
                << "\n\t lambdas must be a non-empty vector of values"
                << "\n\t is_vector(lambdas): " << is_vector(lambdas) 
                << "\n\t lambdas.size():     " << lambdas.size()
                << "\n\t min(lambdas):       " << min(lambdas) 
                << "\n\t this:   " << this
                );


            lams = matrix_cast<scalar_type>(lambdas);
        }

        const matrix<scalar_type,0,0,mem_manager_type>& get_search_lambdas (
        ) const
        {
            return lams;
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
            std::vector<scalar_type> temp; 
            scalar_type temp2;
            return do_train(mat(x), mat(y), false, temp, temp2);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values
        ) const
        {
            scalar_type temp;
            return do_train(mat(x), mat(y), true, loo_values, temp);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values,
            scalar_type& lambda_used 
        ) const
        {
            return do_train(mat(x), mat(y), true, loo_values, lambda_used);
        }


    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            const bool output_loo_values,
            std::vector<scalar_type>& loo_values,
            scalar_type& the_lambda
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,y),
                "\t decision_function rr_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t is_vector(x): " << is_vector(x)
                << "\n\t is_vector(y): " << is_vector(y)
                << "\n\t x.size():     " << x.size() 
                << "\n\t y.size():     " << y.size() 
                );

#ifdef ENABLE_ASSERTS
            if (get_lambda() == 0 && will_use_regression_loss_for_loo_cv() == false)
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(is_binary_classification_problem(x,y),
                    "\t decision_function rr_trainer::train(x,y)"
                    << "\n\t invalid inputs were given to this function"
                    );
            }
#endif

            typedef matrix<scalar_type,0,1,mem_manager_type> column_matrix_type;
            typedef matrix<scalar_type,0,0,mem_manager_type> general_matrix_type;

            const long dims = x(0).size();

            /*
                Notes on the solution of ridge regression 

                Let A = an x.size() by dims matrix which contains all the data samples.

                Let I = an identity matrix

                Let C = trans(A)*A
                Let L = trans(A)*y

                Then the optimal w is given by:
                    w = inv(C + lambda*I) * L 


                There is a trick to compute leave one out cross validation results for many different
                lambda values quickly.  The following paper has a detailed discussion of various
                approaches:

                    Notes on Regularized Least Squares by Ryan M. Rifkin and Ross A. Lippert.

                    In the implementation of the rr_trainer I'm only using two simple equations
                    from the above paper.


                    First note that inv(C + lambda*I) can be computed for many different lambda
                    values in an efficient way by using an eigen decomposition of C.  So we use
                    the fact that:
                        inv(C + lambda*I) == V*inv(D + lambda*I)*trans(V)
                        where V*D*trans(V) == C 

                    Also, via some simple linear algebra the above paper works out that the leave one out 
                    value for a sample x(i) is equal to the following:
                        Let G = inv(C + lambda*I)
                        let val = trans(x(i))*G*x(i);

                        leave one out value for sample x(i):
                        LOOV = (trans(w)*x(i) - y(i)*val) / (1 - val)

                        leave one out error for sample x(i):
                        LOOE = loss(y(i), LOOV)


                Finally, note that we will pretend there was a 1 appended to the end of each
                vector in x.  We won't actually do that though because we don't want to
                have to make a copy of all the samples.  So throughout the following code 
                I have explicitly dealt with this.
            */

            general_matrix_type C, tempm, G;
            column_matrix_type  L, tempv, w;

            // compute C and L
            for (long i = 0; i < x.size(); ++i)
            {
                C += x(i)*trans(x(i));
                L += y(i)*x(i);
                tempv += x(i);
            }

            // Account for the extra 1 that we pretend is appended to x
            // Make C = [C      tempv
            //           tempv' x.size()]
            C = join_cols(join_rows(C, tempv), 
                          join_rows(trans(tempv), uniform_matrix<scalar_type>(1,1, x.size())));
            L = join_cols(L, uniform_matrix<scalar_type>(1,1, sum(y)));

            eigenvalue_decomposition<general_matrix_type> eig(make_symmetric(C));
            const general_matrix_type V = eig.get_pseudo_v();
            const column_matrix_type  D = eig.get_real_eigenvalues();

            // We can save some work by pre-multiplying the x vectors by trans(V)
            // and saving the result so we don't have to recompute it over and over later.
            matrix<column_matrix_type,0,1,mem_manager_type > Vx;
            if (lambda == 0 || output_loo_values)
            {
                // Save the transpose of V into a temporary because the subsequent matrix
                // vector multiplies will be faster (because of better cache locality).
                const general_matrix_type transV( colm(trans(V),range(0,dims-1))  );
                // Remember the pretend 1 at the end of x(*).  We want to multiply trans(V)*x(*)
                // so to do this we pull the last column off trans(V) and store it separately.
                const column_matrix_type lastV = colm(trans(V), dims);
                Vx.set_size(x.size());
                for (long i = 0; i < x.size(); ++i)
                {
                    Vx(i) = transV*x(i);
                    Vx(i) = squared(Vx(i) + lastV);
                }
            }

            the_lambda = lambda;

            // If we need to automatically select a lambda then do so using the LOOE trick described
            // above.
            bool did_loov = false;
            scalar_type best_looe = std::numeric_limits<scalar_type>::max();
            if (lambda == 0)
            {
                did_loov = true;

                // Compute leave one out errors for a bunch of different lambdas and pick the best one.
                for (long idx = 0; idx < lams.size(); ++idx)
                {
                    // first compute G
                    tempv = 1.0/(D + lams(idx));
                    tempm = scale_columns(V,tempv);
                    G = tempm*trans(V);

                    // compute the solution w for the current lambda
                    w = G*L;

                    // make w have the same length as the x vectors.
                    const scalar_type b = w(dims);
                    w = colm(w,0,dims);

                    scalar_type looe = 0;
                    for (long i = 0; i < x.size(); ++i)
                    {
                        // perform equivalent of: val = trans(x(i))*G*x(i);
                        const scalar_type val = dot(tempv, Vx(i));
                        const scalar_type temp = (1 - val);
                        scalar_type loov;
                        if (temp != 0)
                            loov = (trans(w)*x(i) + b - y(i)*val) / temp;
                        else
                            loov = 0;

                        looe += loss(loov, y(i));
                    }

                    // Keep track of the lambda which gave the lowest looe.  If two lambdas
                    // have the same looe then pick the biggest lambda.
                    if (looe < best_looe || (looe == best_looe && lams(idx) > the_lambda))
                    {
                        best_looe = looe;
                        the_lambda = lams(idx);
                    }
                }

                best_looe /= x.size();
            }



            // Now perform the main training.  That is, find w.
            // first, compute G = inv(C + the_lambda*I)
            tempv = 1.0/(D + the_lambda);
            tempm = scale_columns(V,tempv);
            G = tempm*trans(V);
            w = G*L;
           
            // make w have the same length as the x vectors.
            const scalar_type b = w(dims);
            w = colm(w,0,dims);


            // If we haven't done this already and we are supposed to then compute the LOO error rate for 
            // the current lambda and store the result in best_looe.
            if (output_loo_values)
            {
                loo_values.resize(x.size());
                did_loov = true;
                best_looe = 0;
                for (long i = 0; i < x.size(); ++i)
                {
                    // perform equivalent of: val = trans(x(i))*G*x(i);
                    const scalar_type val = dot(tempv, Vx(i));
                    const scalar_type temp = (1 - val);
                    scalar_type loov;
                    if (temp != 0)
                        loov = (trans(w)*x(i) + b - y(i)*val) / temp;
                    else
                        loov = 0;

                    best_looe += loss(loov, y(i));
                    loo_values[i] = loov;
                }

                best_looe /= x.size();

            }
            else
            {
                loo_values.clear();
            }

            if (verbose && did_loov)
            {
                using namespace std;
                cout << "Using lambda:             " << the_lambda << endl;
                if (use_regression_loss)
                    cout << "LOO Mean Squared Error:   " << best_looe << endl;
                else
                    cout << "LOO Classification Error: " << best_looe << endl;
            }

            // convert w into a proper decision function
            decision_function<kernel_type> df;
            df.alpha.set_size(1);
            df.alpha = 1;
            df.basis_vectors.set_size(1);
            df.basis_vectors(0) = w;
            df.b = -b; // don't forget about the bias we stuck onto all the vectors

            return df;
        }

        inline scalar_type loss (
            const scalar_type& a,
            const scalar_type& b
        ) const
        {
            if (use_regression_loss)
            {
                return (a-b)*(a-b);
            }
            else
            {
                // if a and b have the same sign then no loss
                if (a*b >= 0)
                    return 0;
                else
                    return 1;
            }
        }


        /*!
            CONVENTION
                - get_lambda() == lambda
                - get_kernel() == kernel_type() 
                - will_use_regression_loss_for_loo_cv() == use_regression_loss
                - get_search_lambdas() == lams
        !*/

        bool verbose;
        bool use_regression_loss;

        scalar_type lambda;

        matrix<scalar_type,0,0,mem_manager_type> lams; 
    }; 

}

#endif // DLIB_RR_TRAInER_Hh_


