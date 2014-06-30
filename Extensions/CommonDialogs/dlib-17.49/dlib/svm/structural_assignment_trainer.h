// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_H__
#define DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_H__

#include "structural_assignment_trainer_abstract.h"
#include "../algs.h"
#include "../optimization.h"
#include "structural_svm_assignment_problem.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_assignment_trainer
    {
    public:
        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;
        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;
        typedef std::vector<long> label_type;
        typedef assignment_function<feature_extractor> trained_function_type;

        structural_assignment_trainer (
        )  
        {
            set_defaults();
        }

        explicit structural_assignment_trainer (
            const feature_extractor& fe_
        ) : fe(fe_)
        {
            set_defaults();
        }

        const feature_extractor& get_feature_extractor (
        ) const { return fe; }

        void set_num_threads (
            unsigned long num
        )
        {
            num_threads = num;
        }

        unsigned long get_num_threads (
        ) const
        {
            return num_threads;
        }

        bool learns_nonnegative_weights (
        ) const { return learn_nonnegative_weights; }
       
        void set_learns_nonnegative_weights (
            bool value
        )
        {
            learn_nonnegative_weights = value;
        }

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_assignment_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        double get_epsilon (
        ) const { return eps; }

        void set_max_cache_size (
            unsigned long max_size
        )
        {
            max_cache_size = max_size;
        }

        unsigned long get_max_cache_size (
        ) const
        {
            return max_cache_size; 
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

        void set_oca (
            const oca& item
        )
        {
            solver = item;
        }

        const oca get_oca (
        ) const
        {
            return solver;
        }

        void set_c (
            double C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void structural_assignment_trainer::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        double get_c (
        ) const
        {
            return C;
        }

        bool forces_assignment(
        ) const { return force_assignment; } 

        void set_forces_assignment (
            bool new_value
        )
        {
            force_assignment = new_value;
        }

        const assignment_function<feature_extractor> train (  
            const std::vector<sample_type>& samples,
            const std::vector<label_type>& labels
        ) const
        {
            // make sure requires clause is not broken
#ifdef ENABLE_ASSERTS
            if (force_assignment)
            {
                DLIB_ASSERT(is_forced_assignment_problem(samples, labels), 
                            "\t assignment_function structural_assignment_trainer::train()"
                            << "\n\t invalid inputs were given to this function"
                            << "\n\t is_forced_assignment_problem(samples,labels): " << is_forced_assignment_problem(samples,labels)
                            << "\n\t is_assignment_problem(samples,labels):        " << is_assignment_problem(samples,labels)
                            << "\n\t is_learning_problem(samples,labels):          " << is_learning_problem(samples,labels)
                );
            }
            else
            {
                DLIB_ASSERT(is_assignment_problem(samples, labels),
                            "\t assignment_function structural_assignment_trainer::train()"
                            << "\n\t invalid inputs were given to this function"
                            << "\n\t is_assignment_problem(samples,labels): " << is_assignment_problem(samples,labels)
                            << "\n\t is_learning_problem(samples,labels):   " << is_learning_problem(samples,labels)
                );
            }
#endif



            structural_svm_assignment_problem<feature_extractor> prob(samples,labels, fe, force_assignment, num_threads);

            if (verbose)
                prob.be_verbose();

            prob.set_c(C);
            prob.set_epsilon(eps);
            prob.set_max_cache_size(max_cache_size);

            matrix<double,0,1> weights; 

            unsigned long num_nonnegative = 0;
            if (learn_nonnegative_weights)
            {
                num_nonnegative = fe.num_features();
            }

            solver(prob, weights, num_nonnegative);

            return assignment_function<feature_extractor>(weights,fe,force_assignment);

        }


    private:

        bool learn_nonnegative_weights;
        bool force_assignment;
        double C;
        oca solver;
        double eps;
        bool verbose;
        unsigned long num_threads;
        unsigned long max_cache_size;

        void set_defaults ()
        {
            force_assignment = false;
            C = 100;
            verbose = false;
            eps = 0.1;
            num_threads = 2;
            max_cache_size = 40;
            learn_nonnegative_weights = false;
        }

        feature_extractor fe;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_ASSiGNMENT_TRAINER_H__




