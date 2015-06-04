// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_REDUCEd_TRAINERS_
#define DLIB_REDUCEd_TRAINERS_

#include "reduced_abstract.h"
#include "../matrix.h"
#include "../algs.h"
#include "function.h"
#include "kernel.h"
#include "kcentroid.h"
#include "linearly_independent_subset_finder.h"
#include "../optimization.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class reduced_decision_function_trainer
    {
    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        reduced_decision_function_trainer (
        ) :num_bv(0) {}

        reduced_decision_function_trainer (
            const trainer_type& trainer_,
            const unsigned long num_sb_ 
        ) :
            trainer(trainer_),
            num_bv(num_sb_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_bv > 0,
                        "\t reduced_decision_function_trainer()"
                        << "\n\t you have given invalid arguments to this function"
                        << "\n\t num_bv: " << num_bv 
            );
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
            // make sure requires clause is not broken
            DLIB_ASSERT(num_bv > 0,
                        "\t reduced_decision_function_trainer::train(x,y)"
                        << "\n\t You have tried to use an uninitialized version of this object"
                        << "\n\t num_bv: " << num_bv );
            return do_train(mat(x), mat(y));
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            // get the decision function object we are going to try and approximate
            const decision_function<kernel_type>& dec_funct = trainer.train(x,y);
            
            // now find a linearly independent subset of the training points of num_bv points.
            linearly_independent_subset_finder<kernel_type> lisf(dec_funct.kernel_function, num_bv);
            fill_lisf(lisf, x);

            // The next few statements just find the best weights with which to approximate 
            // the dec_funct object with the smaller set of vectors in the lisf dictionary.  This
            // is really just a simple application of some linear algebra.  For the details 
            // see page 554 of Learning with kernels by Scholkopf and Smola where they talk 
            // about "Optimal Expansion Coefficients."

            const kernel_type kern(dec_funct.kernel_function);

            matrix<scalar_type,0,1,mem_manager_type> alpha;

            alpha = lisf.get_inv_kernel_marix()*(kernel_matrix(kern,lisf,dec_funct.basis_vectors)*dec_funct.alpha);

            decision_function<kernel_type> new_df(alpha, 
                                                  0,
                                                  kern, 
                                                  lisf.get_dictionary());

            // now we have to figure out what the new bias should be.  It might be a little
            // different since we just messed with all the weights and vectors.
            double bias = 0;
            for (long i = 0; i < x.nr(); ++i)
            {
                bias += new_df(x(i)) - dec_funct(x(i));
            }
            
            new_df.b = bias/x.nr();

            return new_df;
        }

    // ------------------------------------------------------------------------------------

        trainer_type trainer;
        unsigned long num_bv; 


    }; // end of class reduced_decision_function_trainer

    template <typename trainer_type>
    const reduced_decision_function_trainer<trainer_type> reduced (
        const trainer_type& trainer,
        const unsigned long num_bv
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(num_bv > 0,
                    "\tconst reduced_decision_function_trainer reduced()"
                    << "\n\t you have given invalid arguments to this function"
                    << "\n\t num_bv: " << num_bv 
        );

        return reduced_decision_function_trainer<trainer_type>(trainer, num_bv);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace red_impl
    {

    // ------------------------------------------------------------------------------------

        template <typename kernel_type>
        class objective
        {
            /*
                This object represents the objective function we will try to
                minimize in approximate_distance_function().  

                The objective is the distance, in kernel induced feature space, between
                the original distance function and the approximated version.

            */
            typedef typename kernel_type::scalar_type scalar_type;
            typedef typename kernel_type::sample_type sample_type;
            typedef typename kernel_type::mem_manager_type mem_manager_type;
        public:
            objective(
                const distance_function<kernel_type>& dist_funct_,
                matrix<scalar_type,0,1,mem_manager_type>& b_,
                matrix<sample_type,0,1,mem_manager_type>& out_vectors_
            ) :
                dist_funct(dist_funct_),
                b(b_),
                out_vectors(out_vectors_)
            {
            }

            const matrix<scalar_type, 0, 1, mem_manager_type> state_to_vector (
            ) const
            /*!
                ensures
                    - returns a vector that contains all the information necessary to
                      reproduce the current state of the approximated distance function
            !*/
            {
                matrix<scalar_type, 0, 1, mem_manager_type> z(b.nr() + out_vectors.size()*out_vectors(0).nr());
                long i = 0;
                for (long j = 0; j < b.nr(); ++j)
                {
                    z(i) = b(j);
                    ++i;
                }

                for (long j = 0; j < out_vectors.size(); ++j)
                {
                    for (long k = 0; k < out_vectors(j).size(); ++k)
                    {
                        z(i) = out_vectors(j)(k);
                        ++i;
                    }
                }
                return z;
            }


            void vector_to_state (
                const matrix<scalar_type, 0, 1, mem_manager_type>& z
            ) const
            /*!
                requires
                    - z came from the state_to_vector() function or has a compatible format
                ensures
                    - loads the vector z into the state variables of the approximate
                      distance function (i.e. b and out_vectors)
            !*/
            {
                long i = 0;
                for (long j = 0; j < b.nr(); ++j)
                {
                    b(j) = z(i);
                    ++i;
                }

                for (long j = 0; j < out_vectors.size(); ++j)
                {
                    for (long k = 0; k < out_vectors(j).size(); ++k)
                    {
                        out_vectors(j)(k) = z(i);
                        ++i;
                    }
                }
            }

            double operator() (
                const matrix<scalar_type, 0, 1, mem_manager_type>& z
            ) const
            /*!
                ensures
                    - loads the current approximate distance function with z
                    - returns the distance between the original distance function
                      and the approximate one.
            !*/
            {
                vector_to_state(z);
                const kernel_type k(dist_funct.get_kernel());

                double temp = 0;
                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    for (long j = 0; j < dist_funct.get_basis_vectors().nr(); ++j)
                    {
                        temp -= b(i)*dist_funct.get_alpha()(j)*k(out_vectors(i), dist_funct.get_basis_vectors()(j));
                    }
                }

                temp *= 2;

                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    for (long j = 0; j < out_vectors.size(); ++j)
                    {
                        temp += b(i)*b(j)*k(out_vectors(i), out_vectors(j));
                    }
                }

                return temp + dist_funct.get_squared_norm();
            }

        private:

            const distance_function<kernel_type>& dist_funct;
            matrix<scalar_type,0,1,mem_manager_type>& b;
            matrix<sample_type,0,1,mem_manager_type>& out_vectors;

        };

    // ------------------------------------------------------------------------------------

        template <typename kernel_type>
        class objective_derivative
        {
            /*!
                This object represents the derivative of the objective object
            !*/
            typedef typename kernel_type::scalar_type scalar_type;
            typedef typename kernel_type::sample_type sample_type;
            typedef typename kernel_type::mem_manager_type mem_manager_type;
        public:


            objective_derivative(
                const distance_function<kernel_type>& dist_funct_,
                matrix<scalar_type,0,1,mem_manager_type>& b_,
                matrix<sample_type,0,1,mem_manager_type>& out_vectors_
            ) :
                dist_funct(dist_funct_),
                b(b_),
                out_vectors(out_vectors_)
            {
            }

            void vector_to_state (
                const matrix<scalar_type, 0, 1, mem_manager_type>& z
            ) const
            /*!
                requires
                    - z came from the state_to_vector() function or has a compatible format
                ensures
                    - loads the vector z into the state variables of the approximate
                      distance function (i.e. b and out_vectors)
            !*/
            {
                long i = 0;
                for (long j = 0; j < b.nr(); ++j)
                {
                    b(j) = z(i);
                    ++i;
                }

                for (long j = 0; j < out_vectors.size(); ++j)
                {
                    for (long k = 0; k < out_vectors(j).size(); ++k)
                    {
                        out_vectors(j)(k) = z(i);
                        ++i;
                    }
                }
            }

            const matrix<scalar_type,0,1,mem_manager_type>& operator() (
                const matrix<scalar_type, 0, 1, mem_manager_type>& z
            ) const
            /*!
                ensures
                    - loads the current approximate distance function with z
                    - returns the derivative of the distance between the original 
                      distance function and the approximate one.
            !*/
            {
                vector_to_state(z);
                res.set_size(z.nr());
                set_all_elements(res,0);
                const kernel_type k(dist_funct.get_kernel());
                const kernel_derivative<kernel_type> K_der(k);

                // first compute the gradient for the beta weights
                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    for (long j = 0; j < out_vectors.size(); ++j)
                    {
                        res(i) += b(j)*k(out_vectors(i), out_vectors(j)); 
                    }
                }
                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    for (long j = 0; j < dist_funct.get_basis_vectors().size(); ++j)
                    {
                        res(i) -= dist_funct.get_alpha()(j)*k(out_vectors(i), dist_funct.get_basis_vectors()(j)); 
                    }
                }


                // now compute the gradient of the actual vectors that go into the kernel functions
                long pos = out_vectors.size();
                const long num = out_vectors(0).nr();
                temp.set_size(num,1);
                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    set_all_elements(temp,0);
                    for (long j = 0; j < out_vectors.size(); ++j)
                    {
                        temp += b(j)*K_der(out_vectors(j), out_vectors(i));
                    }
                    for (long j = 0; j < dist_funct.get_basis_vectors().nr(); ++j)
                    {
                        temp -= dist_funct.get_alpha()(j)*K_der(dist_funct.get_basis_vectors()(j), out_vectors(i) );
                    }

                    // store the gradient for out_vectors(i) into result in the proper spot
                    set_subm(res,pos,0,num,1) = b(i)*temp;
                    pos += num;
                }


                res *= 2;
                return res;
            }

        private:

            mutable matrix<scalar_type, 0, 1, mem_manager_type> res;
            mutable sample_type temp;

            const distance_function<kernel_type>& dist_funct;
            matrix<scalar_type,0,1,mem_manager_type>& b;
            matrix<sample_type,0,1,mem_manager_type>& out_vectors;

        };

    // ------------------------------------------------------------------------------------

    }

    template <
        typename K,
        typename stop_strategy_type,
        typename T
        >
    distance_function<K> approximate_distance_function (
        stop_strategy_type stop_strategy,
        const distance_function<K>& target,
        const T& starting_basis
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(target.get_basis_vectors().size() > 0 &&
                    starting_basis.size() > 0,
                    "\t  distance_function approximate_distance_function()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t target.get_basis_vectors().size(): " << target.get_basis_vectors().size() 
                    << "\n\t starting_basis.size():             " << starting_basis.size() 
        );

        using namespace red_impl;
        // The next few statements just find the best weights with which to approximate 
        // the target object with the set of basis vectors in starting_basis.  This
        // is really just a simple application of some linear algebra.  For the details 
        // see page 554 of Learning with kernels by Scholkopf and Smola where they talk 
        // about "Optimal Expansion Coefficients."

        const K kern(target.get_kernel());
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        matrix<scalar_type,0,1,mem_manager_type> beta;

        // Now we compute the fist approximate distance function.  
        beta = pinv(kernel_matrix(kern,starting_basis)) *
            (kernel_matrix(kern,starting_basis,target.get_basis_vectors())*target.get_alpha());
        matrix<sample_type,0,1,mem_manager_type> out_vectors(mat(starting_basis));


        // Now setup to do a global optimization of all the parameters in the approximate 
        // distance function.  
        const objective<K> obj(target, beta, out_vectors);
        const objective_derivative<K> obj_der(target, beta, out_vectors);
        matrix<scalar_type,0,1,mem_manager_type> opt_starting_point(obj.state_to_vector());


        // perform a full optimization of all the parameters (i.e. both beta and the basis vectors together)
        find_min(lbfgs_search_strategy(20),
                 stop_strategy,
                 obj, obj_der, opt_starting_point, 0); 

        // now make sure that the final optimized value is loaded into the beta and
        // out_vectors matrices
        obj.vector_to_state(opt_starting_point);

        // Do a final reoptimization of beta just to make sure it is optimal given the new
        // set of basis vectors.
        beta = pinv(kernel_matrix(kern,out_vectors))*(kernel_matrix(kern,out_vectors,target.get_basis_vectors())*target.get_alpha());

        // It is possible that some of the beta weights will be very close to zero.  Lets remove
        // the basis vectors with these essentially zero weights.
        const scalar_type eps = max(abs(beta))*std::numeric_limits<scalar_type>::epsilon();
        for (long i = 0; i < beta.size(); ++i)
        {
            // if beta(i) is zero (but leave at least one beta no matter what)
            if (std::abs(beta(i)) < eps && beta.size() > 1)
            {
                beta = remove_row(beta, i);
                out_vectors = remove_row(out_vectors, i);
                --i;
            }
        }

        return distance_function<K>(beta, kern, out_vectors);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class reduced_decision_function_trainer2
    {
    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        reduced_decision_function_trainer2 () : num_bv(0) {}
        reduced_decision_function_trainer2 (
            const trainer_type& trainer_,
            const long num_sb_,
            const double eps_ = 1e-3
        ) :
            trainer(trainer_),
            num_bv(num_sb_),
            eps(eps_)
        {
            COMPILE_TIME_ASSERT(is_matrix<sample_type>::value);

            // make sure requires clause is not broken
            DLIB_ASSERT(num_bv > 0 && eps > 0,
                        "\t reduced_decision_function_trainer2()"
                        << "\n\t you have given invalid arguments to this function"
                        << "\n\t num_bv: " << num_bv 
                        << "\n\t eps:    " << eps 
            );
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
            // make sure requires clause is not broken
            DLIB_ASSERT(num_bv > 0,
                        "\t reduced_decision_function_trainer2::train(x,y)"
                        << "\n\t You have tried to use an uninitialized version of this object"
                        << "\n\t num_bv: " << num_bv );
            return do_train(mat(x), mat(y));
        }

    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            // get the decision function object we are going to try and approximate
            const decision_function<kernel_type>& dec_funct = trainer.train(x,y);
            const kernel_type kern(dec_funct.kernel_function);
            
            // now find a linearly independent subset of the training points of num_bv points.
            linearly_independent_subset_finder<kernel_type> lisf(kern, num_bv);
            fill_lisf(lisf,x);

            distance_function<kernel_type> approx, target;
            target = dec_funct;
            approx = approximate_distance_function(objective_delta_stop_strategy(eps), target, lisf);

            decision_function<kernel_type> new_df(approx.get_alpha(), 
                                                  0,
                                                  kern, 
                                                  approx.get_basis_vectors());

            // now we have to figure out what the new bias should be.  It might be a little
            // different since we just messed with all the weights and vectors.
            double bias = 0;
            for (long i = 0; i < x.nr(); ++i)
            {
                bias += new_df(x(i)) - dec_funct(x(i));
            }
            
            new_df.b = bias/x.nr();

            return new_df;

        }

    // ------------------------------------------------------------------------------------

        trainer_type trainer;
        long num_bv;
        double eps;


    }; // end of class reduced_decision_function_trainer2

    template <typename trainer_type>
    const reduced_decision_function_trainer2<trainer_type> reduced2 (
        const trainer_type& trainer,
        const long num_bv,
        double eps = 1e-3
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<typename trainer_type::sample_type>::value);

        // make sure requires clause is not broken
        DLIB_ASSERT(num_bv > 0 && eps > 0,
                    "\tconst reduced_decision_function_trainer2 reduced2()"
                    << "\n\t you have given invalid arguments to this function"
                    << "\n\t num_bv: " << num_bv 
                    << "\n\t eps:    " << eps 
        );

        return reduced_decision_function_trainer2<trainer_type>(trainer, num_bv, eps);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REDUCEd_TRAINERS_

