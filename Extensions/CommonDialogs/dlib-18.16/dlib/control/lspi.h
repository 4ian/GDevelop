// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LSPI_Hh_
#define DLIB_LSPI_Hh_

#include "lspi_abstract.h"
#include "approximate_linear_models.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class lspi
    {
    public:
        typedef feature_extractor feature_extractor_type;
        typedef typename feature_extractor::state_type state_type;
        typedef typename feature_extractor::action_type action_type;

        explicit lspi(
            const feature_extractor& fe_
        ) : fe(fe_)
        {
            init();
        }

        lspi(
        )
        {
            init();
        }

        double get_discount (
        ) const { return discount; }

        void set_discount (
            double value
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < value && value <= 1,
                "\t void lspi::set_discount(value)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t value: " << value 
                );
            discount = value;
        }

        const feature_extractor& get_feature_extractor (
        ) const { return fe; }

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

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void lspi::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
                );
            eps = eps_;
        }

        double get_epsilon (
        ) const
        { 
            return eps;
        }

        void set_lambda (
            double lambda_ 
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(lambda_ >= 0,
                "\t void lspi::set_lambda(lambda_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t lambda_: " << lambda_ 
                );
            lambda = lambda_;
        }

        double get_lambda (
        ) const 
        { 
            return lambda; 
        }

        void set_max_iterations (
            unsigned long max_iter
        ) { max_iterations = max_iter; }

        unsigned long get_max_iterations (
        ) { return max_iterations; }

        template <typename vector_type>
        policy<feature_extractor> train (
            const vector_type& samples
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(samples.size() > 0,
                "\t policy lspi::train(samples)"
                << "\n\t invalid inputs were given to this function"
                );

            matrix<double,0,1> w(fe.num_features());
            w = 0;
            matrix<double,0,1> prev_w, b, f1, f2;

            matrix<double> A;

            double change; 
            unsigned long iter = 0;
            do
            {
                A = identity_matrix<double>(fe.num_features())*lambda;
                b = 0;
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    fe.get_features(samples[i].state, samples[i].action, f1);
                    fe.get_features(samples[i].next_state, 
                                    fe.find_best_action(samples[i].next_state,w), 
                                    f2);
                    A += f1*trans(f1 - discount*f2);
                    b += f1*samples[i].reward;
                }

                prev_w = w;
                if (feature_extractor::force_last_weight_to_1)
                    w = join_cols(pinv(colm(A,range(0,A.nc()-2)))*(b-colm(A,A.nc()-1)),mat(1.0));
                else
                    w = pinv(A)*b;

                change = length(w-prev_w);
                ++iter;

                if (verbose)
                    std::cout << "iteration: " << iter << "\tchange: " << change << std::endl;

            } while(change > eps && iter < max_iterations);

            return policy<feature_extractor>(w,fe);
        }


    private:

        void init()
        {
            lambda = 0.01;
            discount = 0.8;
            eps = 0.01;
            verbose = false;
            max_iterations = 100;
        }

        double lambda;
        double discount;
        double eps;
        bool verbose;
        unsigned long max_iterations;
        feature_extractor fe;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LSPI_Hh_

