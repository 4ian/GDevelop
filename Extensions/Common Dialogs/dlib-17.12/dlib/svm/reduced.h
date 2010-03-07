// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
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
        ) :num_sv(0) {}

        reduced_decision_function_trainer (
            const trainer_type& trainer_,
            const unsigned long num_sv_ 
        ) :
            trainer(trainer_),
            num_sv(num_sv_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_sv > 0,
                        "\t reduced_decision_function_trainer()"
                        << "\n\t you have given invalid arguments to this function"
                        << "\n\t num_sv: " << num_sv 
            );
        }

        const kernel_type& get_kernel (
        ) const
        {
            return trainer.get_kernel();
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
            DLIB_ASSERT(num_sv > 0,
                        "\t reduced_decision_function_trainer::train(x,y)"
                        << "\n\t You have tried to use an uninitialized version of this object"
                        << "\n\t num_sv: " << num_sv );
            return do_train(vector_to_matrix(x), vector_to_matrix(y));
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
            const decision_function<kernel_type> dec_funct = trainer.train(x,y);
            
            // now find a linearly independent subset of the training points of num_sv points.
            linearly_independent_subset_finder<kernel_type> lisf(trainer.get_kernel(), num_sv);
            for (long i = 0; i < x.nr(); ++i)
            {
                lisf.add(x(i));
            }

            // make num be the number of points in the lisf object.  Just do this so we don't have
            // to write out lisf.dictionary_size() all over the place.
            const long num = lisf.dictionary_size();

            // The next few blocks of code just find the best weights with which to approximate 
            // the dec_funct object with the smaller set of vectors in the lisf dictionary.  This
            // is really just a simple application of some linear algebra.  For the details 
            // see page 554 of Learning with kernels by Scholkopf and Smola where they talk 
            // about "Optimal Expansion Coefficients."
            matrix<scalar_type, 0, 0, mem_manager_type> K_inv(num, num); 
            matrix<scalar_type, 0, 0, mem_manager_type> K(num, dec_funct.alpha.size()); 

            const kernel_type kernel(trainer.get_kernel());

            for (long r = 0; r < K_inv.nr(); ++r)
            {
                for (long c = 0; c < K_inv.nc(); ++c)
                {
                    K_inv(r,c) = kernel(lisf[r], lisf[c]);
                }
            }
            K_inv = pinv(K_inv);


            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kernel(lisf[r], dec_funct.support_vectors(c));
                }
            }


            // Now we compute the approximate decision function.  Note that the weights come out
            // of the expression K_inv*K*dec_funct.alpha.
            decision_function<kernel_type> new_df(K_inv*K*dec_funct.alpha, 
                                                  0,
                                                  kernel, 
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
        unsigned long num_sv; 


    }; // end of class reduced_decision_function_trainer

    template <typename trainer_type>
    const reduced_decision_function_trainer<trainer_type> reduced (
        const trainer_type& trainer,
        const unsigned long num_sv
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(num_sv > 0,
                    "\tconst reduced_decision_function_trainer reduced()"
                    << "\n\t you have given invalid arguments to this function"
                    << "\n\t num_sv: " << num_sv 
        );

        return reduced_decision_function_trainer<trainer_type>(trainer, num_sv);
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

        reduced_decision_function_trainer2 () : num_sv(0) {}
        reduced_decision_function_trainer2 (
            const trainer_type& trainer_,
            const long num_sv_,
            const double eps_ = 1e-3
        ) :
            trainer(trainer_),
            num_sv(num_sv_),
            eps(eps_)
        {
            COMPILE_TIME_ASSERT(is_matrix<sample_type>::value);

            // make sure requires clause is not broken
            DLIB_ASSERT(num_sv > 0 && eps > 0,
                        "\t reduced_decision_function_trainer2()"
                        << "\n\t you have given invalid arguments to this function"
                        << "\n\t num_sv: " << num_sv 
                        << "\n\t eps:    " << eps 
            );
        }

        const kernel_type& get_kernel (
        ) const
        {
            return trainer.get_kernel();
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
            DLIB_ASSERT(num_sv > 0,
                        "\t reduced_decision_function_trainer2::train(x,y)"
                        << "\n\t You have tried to use an uninitialized version of this object"
                        << "\n\t num_sv: " << num_sv );
            return do_train(vector_to_matrix(x), vector_to_matrix(y));
        }

    private:

    // ------------------------------------------------------------------------------------

        class objective
        {
            /*
                This object represents the objective function we will try to
                minimize in the final stage of this reduced set method.  

                The objective is the distance, in kernel induced feature space, between
                the original decision function and the approximated version.

            */
        public:
            objective(
                const decision_function<kernel_type>& dec_funct_,
                matrix<scalar_type,0,1,mem_manager_type>& b_,
                matrix<sample_type,0,1,mem_manager_type>& out_vectors_
            ) :
                dec_funct(dec_funct_),
                b(b_),
                out_vectors(out_vectors_)
            {
                const kernel_type k(dec_funct.kernel_function);
                // here we compute a term in the objective function that is a constant.  So
                // do it in the constructor so we don't have to recompute it every time
                // the objective is evaluated.
                bias = 0;
                for (long i = 0; i < dec_funct.alpha.size(); ++i)
                {
                    for (long j = 0; j < dec_funct.alpha.size(); ++j)
                    {
                        bias += dec_funct.alpha(i)*dec_funct.alpha(j)*
                            k(dec_funct.support_vectors(i), dec_funct.support_vectors(j));
                    }
                }
            }

            const matrix<scalar_type, 0, 1, mem_manager_type> state_to_vector (
            ) const
            /*!
                ensures
                    - returns a vector that contains all the information necessary to
                      reproduce the current state of the approximated decision function
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
                      decision function (i.e. b and out_vectors)
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
                    - loads the current approximate decision function with z
                    - returns the distance between the original decision function
                      and the approximate one.
            !*/
            {
                vector_to_state(z);
                const kernel_type k(dec_funct.kernel_function);

                double temp = 0;
                for (long i = 0; i < out_vectors.size(); ++i)
                {
                    for (long j = 0; j < dec_funct.support_vectors.nr(); ++j)
                    {
                        temp -= b(i)*dec_funct.alpha(j)*k(out_vectors(i), dec_funct.support_vectors(j));
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

                return temp + bias;
            }

        private:

            scalar_type bias;

            const decision_function<kernel_type>& dec_funct;
            mutable matrix<scalar_type,0,1,mem_manager_type>& b;
            mutable matrix<sample_type,0,1,mem_manager_type>& out_vectors;

        };

    // ------------------------------------------------------------------------------------

        class objective_derivative
        {
            /*!
                This object represents the derivative of the objective object
            !*/
        public:


            objective_derivative(
                const decision_function<kernel_type>& dec_funct_,
                matrix<scalar_type,0,1,mem_manager_type>& b_,
                matrix<sample_type,0,1,mem_manager_type>& out_vectors_
            ) :
                dec_funct(dec_funct_),
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
                      decision function (i.e. b and out_vectors)
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
                    - loads the current approximate decision function with z
                    - returns the derivative of the distance between the original 
                      decision function and the approximate one.
            !*/
            {
                vector_to_state(z);
                res.set_size(z.nr());
                set_all_elements(res,0);
                const kernel_type k(dec_funct.kernel_function);
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
                    for (long j = 0; j < dec_funct.support_vectors.size(); ++j)
                    {
                        res(i) -= dec_funct.alpha(j)*k(out_vectors(i), dec_funct.support_vectors(j)); 
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
                    for (long j = 0; j < dec_funct.support_vectors.nr(); ++j)
                    {
                        temp -= dec_funct.alpha(j)*K_der(dec_funct.support_vectors(j), out_vectors(i) );
                    }

                    // store the gradient for out_vectors[i] into result in the proper spot
                    set_subm(res,pos,0,num,1) = b(i)*temp;
                    pos += num;
                }


                res *= 2;
                return res;
            }

        private:

            mutable matrix<scalar_type, 0, 1, mem_manager_type> res;
            mutable sample_type temp;

            const decision_function<kernel_type>& dec_funct;
            mutable matrix<scalar_type,0,1,mem_manager_type>& b;
            mutable matrix<sample_type,0,1,mem_manager_type>& out_vectors;

        };

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
            const decision_function<kernel_type> dec_funct = trainer.train(x,y);
            
            // now find a linearly independent subset of the training points of num_sv points.
            linearly_independent_subset_finder<kernel_type> lisf(trainer.get_kernel(), num_sv);
            for (long i = 0; i < x.nr(); ++i)
            {
                lisf.add(x(i));
            }

            // make num be the number of points in the lisf object.  Just do this so we don't have
            // to write out lisf.dictionary_size() all over the place.
            const long num = lisf.dictionary_size();

            // The next few blocks of code just find the best weights with which to approximate 
            // the dec_funct object with the smaller set of vectors in the lisf dictionary.  This
            // is really just a simple application of some linear algebra.  For the details 
            // see page 554 of Learning with kernels by Scholkopf and Smola where they talk 
            // about "Optimal Expansion Coefficients."
            matrix<scalar_type, 0, 0, mem_manager_type> K_inv(num, num); 
            matrix<scalar_type, 0, 0, mem_manager_type> K(num, dec_funct.alpha.size()); 

            const kernel_type kernel(trainer.get_kernel());

            for (long r = 0; r < K_inv.nr(); ++r)
            {
                for (long c = 0; c < K_inv.nc(); ++c)
                {
                    K_inv(r,c) = kernel(lisf[r], lisf[c]);
                }
            }
            K_inv = pinv(K_inv);


            for (long r = 0; r < K.nr(); ++r)
            {
                for (long c = 0; c < K.nc(); ++c)
                {
                    K(r,c) = kernel(lisf[r], dec_funct.support_vectors(c));
                }
            }

            // Now we compute the fist approximate decision function.  
            matrix<scalar_type,0,1,mem_manager_type> beta(K_inv*K*dec_funct.alpha);
            matrix<sample_type,0,1,mem_manager_type> out_vectors(lisf.get_dictionary());


            // Now setup to do a global optimization of all the parameters in the approximate 
            // decision function.  
            const objective obj(dec_funct, beta, out_vectors);
            const objective_derivative obj_der(dec_funct, beta, out_vectors);
            matrix<scalar_type,0,1,mem_manager_type> opt_starting_point(obj.state_to_vector());


            // perform the actual optimization
            find_min_conjugate_gradient(obj, obj_der, opt_starting_point, 0, eps); 

            // now make sure that the final optimized value is loaded into the beta and
            // out_vectors matrices
            obj.vector_to_state(opt_starting_point);

            decision_function<kernel_type> new_df(beta, 
                                                  0,
                                                  kernel, 
                                                  out_vectors);

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
        long num_sv;
        double eps;


    }; // end of class reduced_decision_function_trainer2

    template <typename trainer_type>
    const reduced_decision_function_trainer2<trainer_type> reduced2 (
        const trainer_type& trainer,
        const long num_sv,
        double eps = 1e-3
    )
    {
        COMPILE_TIME_ASSERT(is_matrix<typename trainer_type::sample_type>::value);

        // make sure requires clause is not broken
        DLIB_ASSERT(num_sv > 0 && eps > 0,
                    "\tconst reduced_decision_function_trainer2 reduced2()"
                    << "\n\t you have given invalid arguments to this function"
                    << "\n\t num_sv: " << num_sv 
                    << "\n\t eps:    " << eps 
        );

        return reduced_decision_function_trainer2<trainer_type>(trainer, num_sv, eps);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REDUCEd_TRAINERS_

