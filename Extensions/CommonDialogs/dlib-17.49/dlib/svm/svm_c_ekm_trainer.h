// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVM_C_EKm_TRAINER_H__
#define DLIB_SVM_C_EKm_TRAINER_H__

#include "../algs.h"
#include "function.h"
#include "kernel.h"
#include "empirical_kernel_map.h"
#include "svm_c_linear_trainer.h"
#include "svm_c_ekm_trainer_abstract.h"
#include "../statistics.h"
#include "../rand.h"
#include <vector>

namespace dlib
{
    template <
        typename K 
        >
    class svm_c_ekm_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_c_ekm_trainer (
        )
        {
            verbose = false;
            ekm_stale = true;

            initial_basis_size = 10;
            basis_size_increment = 50;
            max_basis_size = 300;
        }

        explicit svm_c_ekm_trainer (
            const scalar_type& C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t svm_c_ekm_trainer::svm_c_ekm_trainer()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );


            ocas.set_c(C);
            verbose = false;
            ekm_stale = true;

            initial_basis_size = 10;
            basis_size_increment = 50;
            max_basis_size = 300;
        }

        void set_epsilon (
            scalar_type eps
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps > 0,
                "\t void svm_c_ekm_trainer::set_epsilon()"
                << "\n\t eps must be greater than 0"
                << "\n\t eps: " << eps 
                << "\n\t this: " << this
                );

            ocas.set_epsilon(eps);
        }

        const scalar_type get_epsilon (
        ) const
        {
            return ocas.get_epsilon();
        }

        void set_max_iterations (
            unsigned long max_iter
        )
        {
            ocas.set_max_iterations(max_iter);
        }

        unsigned long get_max_iterations (
        )
        {
            return ocas.get_max_iterations();
        }

        void be_verbose (
        ) 
        { 
            verbose = true;
            ocas.be_quiet(); 
        }

        void be_very_verbose (
        )
        {
            verbose = true;
            ocas.be_verbose(); 
        }

        void be_quiet (
        )
        { 
            verbose = false;
            ocas.be_quiet(); 
        }

        void set_oca (
            const oca& item
        )
        {
            ocas.set_oca(item);
        }

        const oca get_oca (
        ) const
        {
            return ocas.get_oca();
        }

        const kernel_type get_kernel (
        ) const
        {
            return kern;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kern = k;
            ekm_stale = true;
        }

        template <typename T>
        void set_basis (
            const T& basis_samples
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(basis_samples.size() > 0 && is_vector(vector_to_matrix(basis_samples)),
                "\tvoid svm_c_ekm_trainer::set_basis(basis_samples)"
                << "\n\t You have to give a non-empty set of basis_samples and it must be a vector"
                << "\n\t basis_samples.size():                       " << basis_samples.size() 
                << "\n\t is_vector(vector_to_matrix(basis_samples)): " << is_vector(vector_to_matrix(basis_samples)) 
                << "\n\t this: " << this
                );

            basis = vector_to_matrix(basis_samples);
            ekm_stale = true;
        }

        bool basis_loaded(
        ) const
        {
            return (basis.size() != 0);
        }

        void clear_basis (
        )
        {
            basis.set_size(0);
            ekm.clear();
            ekm_stale = true;
        }

        unsigned long get_max_basis_size (
        ) const
        {
            return max_basis_size;
        }

        void set_max_basis_size (
            unsigned long max_basis_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(max_basis_size_ > 0,
                "\t void svm_c_ekm_trainer::set_max_basis_size()"
                << "\n\t max_basis_size_ must be greater than 0"
                << "\n\t max_basis_size_: " << max_basis_size_ 
                << "\n\t this:            " << this
                );

            max_basis_size = max_basis_size_;
            if (initial_basis_size > max_basis_size)
                initial_basis_size = max_basis_size;
        }

        unsigned long get_initial_basis_size (
        ) const
        {
            return initial_basis_size;
        }

        void set_initial_basis_size (
            unsigned long initial_basis_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(initial_basis_size_ > 0,
                "\t void svm_c_ekm_trainer::set_initial_basis_size()"
                << "\n\t initial_basis_size_ must be greater than 0"
                << "\n\t initial_basis_size_: " << initial_basis_size_ 
                << "\n\t this:                " << this
                );

            initial_basis_size = initial_basis_size_;

            if (initial_basis_size > max_basis_size)
                max_basis_size = initial_basis_size;
        }

        unsigned long get_basis_size_increment (
        ) const
        {
            return basis_size_increment;
        }

        void set_basis_size_increment (
            unsigned long basis_size_increment_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(basis_size_increment_ > 0,
                "\t void svm_c_ekm_trainer::set_basis_size_increment()"
                << "\n\t basis_size_increment_ must be greater than 0"
                << "\n\t basis_size_increment_: " << basis_size_increment_ 
                << "\n\t this:                  " << this
                );

            basis_size_increment = basis_size_increment_;
        }

        void set_c (
            scalar_type C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_ekm_trainer::set_c()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            ocas.set_c(C);
        }

        const scalar_type get_c_class1 (
        ) const
        {
            return ocas.get_c_class1();
        }

        const scalar_type get_c_class2 (
        ) const
        {
            return ocas.get_c_class2();
        }

        void set_c_class1 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_ekm_trainer::set_c_class1()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            ocas.set_c_class1(C);
        }

        void set_c_class2 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_ekm_trainer::set_c_class2()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            ocas.set_c_class2(C);
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
            scalar_type obj;
            if (basis_loaded())
                return do_train_user_basis(vector_to_matrix(x),vector_to_matrix(y),obj);
            else
                return do_train_auto_basis(vector_to_matrix(x),vector_to_matrix(y),obj);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const
        {
            if (basis_loaded())
                return do_train_user_basis(vector_to_matrix(x),vector_to_matrix(y),svm_objective);
            else
                return do_train_auto_basis(vector_to_matrix(x),vector_to_matrix(y),svm_objective);
        }


    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train_user_basis (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const
        /*!
            requires
                - basis_loaded() == true
            ensures
                - trains an SVM with the user supplied basis
        !*/
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(x,y) == true,
                "\t decision_function svm_c_ekm_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_binary_classification_problem(x,y): " << is_binary_classification_problem(x,y)
                );

            if (ekm_stale)
            {
                ekm.load(kern, basis);
                ekm_stale = false;
            }

            // project all the samples with the ekm
            running_stats<scalar_type> rs;
            std::vector<matrix<scalar_type,0,1, mem_manager_type> > proj_samples;
            proj_samples.reserve(x.size());
            for (long i = 0; i < x.size(); ++i)
            {
                if (verbose)
                {
                    scalar_type err;
                    proj_samples.push_back(ekm.project(x(i), err));
                    rs.add(err);
                }
                else
                {
                    proj_samples.push_back(ekm.project(x(i)));
                }
            }

            if (verbose)
            {
                std::cout << "\nMean EKM projection error:                  " << rs.mean() << std::endl;
                std::cout << "Standard deviation of EKM projection error: " << rs.stddev() << std::endl;
            }
            
            // now do the training
            decision_function<linear_kernel<matrix<scalar_type,0,1, mem_manager_type> > > df;
            df = ocas.train(proj_samples, y, svm_objective);

            if (verbose)
            {
                std::cout << "Final svm objective: " << svm_objective << std::endl;
            }

            decision_function<kernel_type> final_df;
            final_df = ekm.convert_to_decision_function(df.basis_vectors(0));
            final_df.b = df.b;
            return final_df;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train_auto_basis (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(x,y) == true,
                "\t decision_function svm_c_ekm_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_binary_classification_problem(x,y): " << is_binary_classification_problem(x,y)
                );


            std::vector<matrix<scalar_type,0,1, mem_manager_type> > proj_samples(x.size());
            decision_function<linear_kernel<matrix<scalar_type,0,1, mem_manager_type> > > df;

            // we will use a linearly_independent_subset_finder to store our basis set. 
            linearly_independent_subset_finder<kernel_type> lisf(get_kernel(), max_basis_size);

            dlib::rand rnd;

            // first pick the initial basis set randomly
            for (unsigned long i = 0; i < 10*initial_basis_size && lisf.size() < initial_basis_size; ++i)
            {
                lisf.add(x(rnd.get_random_32bit_number()%x.size()));
            }

            ekm.load(lisf);

            // first project all samples into the span of the current basis 
            for (long i = 0; i < x.size(); ++i)
            {
                proj_samples[i] = ekm.project(x(i));
            }


            svm_c_linear_trainer<linear_kernel<matrix<scalar_type,0,1,mem_manager_type> > > trainer(ocas);

            const scalar_type min_epsilon = trainer.get_epsilon();
            // while we are determining what the basis set will be we are going to use a very
            // lose stopping condition.  We will tighten it back up before producing the
            // final decision_function.
            trainer.set_epsilon(0.2);

            scalar_type prev_svm_objective = std::numeric_limits<scalar_type>::max();

            empirical_kernel_map<kernel_type> prev_ekm;

            // This loop is where we try to generate a basis for SVM training.  We will
            // do this by repeatedly training the SVM and adding a few points which violate the
            // margin to the basis in each iteration.
            while (true)
            {
                // if the basis is already as big as it's going to get then just do the most
                // accurate training right now.  
                if (lisf.size() == max_basis_size)
                    trainer.set_epsilon(min_epsilon);

                while (true)
                {
                    // now do the training.  
                    df = trainer.train(proj_samples, y, svm_objective);

                    if (svm_objective < prev_svm_objective)
                        break;

                    // If the training didn't reduce the objective more than last time then
                    // try lowering the epsilon and doing it again.
                    if (trainer.get_epsilon() > min_epsilon)
                    {
                        trainer.set_epsilon(std::max(trainer.get_epsilon()*0.5, min_epsilon));
                        if (verbose)
                            std::cout << " *** Reducing epsilon to " << trainer.get_epsilon() << std::endl;
                    }
                    else
                        break;
                }

                if (verbose)
                {
                    std::cout << "svm objective: " << svm_objective << std::endl;
                    std::cout << "basis size: " << lisf.size() << std::endl;
                }

                // if we failed to make progress on this iteration then we are done
                if (svm_objective >= prev_svm_objective)
                    break;

                prev_svm_objective = svm_objective;

                // now add more elements to the basis
                unsigned long count = 0;
                for (unsigned long j = 0; 
                     (j < 100*basis_size_increment) && (count < basis_size_increment) && (lisf.size() < max_basis_size); 
                     ++j)
                {
                    // pick a random sample
                    const unsigned long idx = rnd.get_random_32bit_number()%x.size();
                    // If it is a margin violator then it is useful to add it into the basis set.
                    if (df(proj_samples[idx])*y(idx) < 1)
                    {
                        // Add the sample into the basis set if it is linearly independent of all the
                        // vectors already in the basis set.  
                        if (lisf.add(x(idx)))
                        {
                            ++count;
                        }
                    }
                }
                // if we couldn't add any more basis vectors then stop
                if (count == 0)
                {
                    if (verbose)
                        std::cout << "Stopping, couldn't add more basis vectors." << std::endl;
                    break;
                }


                // Project all the samples into the span of our newly enlarged basis.  We will do this
                // using the special transformation in the EKM that lets us project from a smaller
                // basis set to a larger without needing to reevaluate kernel functions we have already
                // computed.
                ekm.swap(prev_ekm);
                ekm.load(lisf);
                projection_function<kernel_type> proj_part;
                matrix<double> prev_to_new;
                prev_ekm.get_transformation_to(ekm, prev_to_new, proj_part);

                
                matrix<scalar_type,0,1, mem_manager_type> temp;
                for (long i = 0; i < x.size(); ++i)
                {
                    // assign to temporary to avoid memory allocation that would result if we
                    // assigned this expression straight into proj_samples[i]
                    temp = prev_to_new*proj_samples[i] + proj_part(x(i));
                    proj_samples[i] = temp;

                }
            }
            
            // Reproject all the data samples using the final basis.  We could just use what we 
            // already have but the recursive thing done above to compute the proj_samples 
            // might have accumulated a little numerical error.  So lets just be safe.
            running_stats<scalar_type> rs, rs_margin;
            for (long i = 0; i < x.size(); ++i)
            {
                if (verbose)
                {
                    scalar_type err;
                    proj_samples[i] = ekm.project(x(i),err);
                    rs.add(err);
                    // if this point is within the margin 
                    if (df(proj_samples[i])*y(i) < 1)
                        rs_margin.add(err);
                }
                else
                {
                    proj_samples[i] = ekm.project(x(i));
                }
            }

            // do the final training
            trainer.set_epsilon(min_epsilon);
            df = trainer.train(proj_samples, y, svm_objective);


            if (verbose)
            {
                std::cout << "\nMean EKM projection error:                  " << rs.mean() << std::endl;
                std::cout << "Standard deviation of EKM projection error: " << rs.stddev() << std::endl;
                std::cout << "Mean EKM projection error for margin violators:                  " << rs_margin.mean() << std::endl;
                std::cout << "Standard deviation of EKM projection error for margin violators: " << ((rs_margin.current_n()>1)?rs_margin.stddev():0) << std::endl;

                std::cout << "Final svm objective: " << svm_objective << std::endl;
            }


            decision_function<kernel_type> final_df;
            final_df = ekm.convert_to_decision_function(df.basis_vectors(0));
            final_df.b = df.b;

            // we don't need the ekm anymore so clear it out
            ekm.clear();

            return final_df;
        }




        /*!
            CONVENTION
                - if (ekm_stale) then
                    - kern or basis have changed since the last time
                      they were loaded into the ekm
        !*/

        svm_c_linear_trainer<linear_kernel<matrix<scalar_type,0,1,mem_manager_type> > > ocas;
        bool verbose;

        kernel_type kern;
        unsigned long max_basis_size;
        unsigned long basis_size_increment;
        unsigned long initial_basis_size;


        matrix<sample_type,0,1,mem_manager_type> basis;
        mutable empirical_kernel_map<kernel_type> ekm;
        mutable bool ekm_stale; 

    }; 

}

#endif // DLIB_SVM_C_EKm_TRAINER_H__



