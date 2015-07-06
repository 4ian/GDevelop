// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_Hh_
#define DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_Hh_

#include "structural_graph_labeling_trainer_abstract.h"
#include "../algs.h"
#include "../optimization.h"
#include "structural_svm_graph_labeling_problem.h"
#include "../graph_cuts/graph_labeler.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    class structural_graph_labeling_trainer
    {
    public:
        typedef std::vector<bool> label_type;
        typedef graph_labeler<vector_type> trained_function_type;

        structural_graph_labeling_trainer (
        )  
        {
            C = 10;
            verbose = false;
            eps = 0.1;
            num_threads = 2;
            max_cache_size = 5;
            loss_pos = 1.0;
            loss_neg = 1.0;
        }

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

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_graph_labeling_trainer::set_epsilon()"
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
                "\t void structural_graph_labeling_trainer::set_c()"
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


        void set_loss_on_positive_class (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0,
                    "\t structural_graph_labeling_trainer::set_loss_on_positive_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t loss: " << loss 
                    << "\n\t this: " << this );

            loss_pos = loss;
        }

        void set_loss_on_negative_class (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0,
                    "\t structural_graph_labeling_trainer::set_loss_on_negative_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t loss: " << loss 
                    << "\n\t this: " << this );

            loss_neg = loss;
        }

        double get_loss_on_negative_class (
        ) const { return loss_neg; }

        double get_loss_on_positive_class (
        ) const { return loss_pos; }


        template <
            typename graph_type
            >
        const graph_labeler<vector_type> train (  
            const dlib::array<graph_type>& samples,
            const std::vector<label_type>& labels,
            const std::vector<std::vector<double> >& losses
        ) const
        {
#ifdef ENABLE_ASSERTS
            std::string reason_for_failure;
            DLIB_ASSERT(is_graph_labeling_problem(samples, labels, reason_for_failure) == true ,
                    "\t void structural_graph_labeling_trainer::train()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t reason_for_failure: " << reason_for_failure 
                    << "\n\t samples.size(): " << samples.size() 
                    << "\n\t labels.size():  " << labels.size() 
                    << "\n\t this: " << this );
            DLIB_ASSERT((losses.size() == 0 || sizes_match(labels, losses) == true) &&
                        all_values_are_nonnegative(losses) == true,
                    "\t void structural_graph_labeling_trainer::train()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t labels.size():  " << labels.size() 
                    << "\n\t losses.size():  " << losses.size() 
                    << "\n\t sizes_match(labels,losses): " << sizes_match(labels,losses) 
                    << "\n\t all_values_are_nonnegative(losses): " << all_values_are_nonnegative(losses) 
                    << "\n\t this: " << this );
#endif


            structural_svm_graph_labeling_problem<graph_type> prob(samples, labels, losses, num_threads);

            if (verbose)
                prob.be_verbose();

            prob.set_c(C);
            prob.set_epsilon(eps);
            prob.set_max_cache_size(max_cache_size);
            if (prob.get_losses().size() == 0)
            {
                prob.set_loss_on_positive_class(loss_pos);
                prob.set_loss_on_negative_class(loss_neg);
            }

            matrix<double,0,1> w;
            solver(prob, w, prob.get_num_edge_weights());

            vector_type edge_weights;
            vector_type node_weights;
            populate_weights(w, edge_weights, node_weights, prob.get_num_edge_weights());
            return graph_labeler<vector_type>(edge_weights, node_weights);
        }

        template <
            typename graph_type
            >
        const graph_labeler<vector_type> train (  
            const dlib::array<graph_type>& samples,
            const std::vector<label_type>& labels
        ) const
        {
            std::vector<std::vector<double> > losses;
            return train(samples, labels, losses);
        }

    private:

        template <typename T>
        typename enable_if<is_matrix<T> >::type populate_weights (
            const matrix<double,0,1>& w,
            T& edge_weights,
            T& node_weights,
            long split_idx
        ) const
        {
            edge_weights = rowm(w,range(0, split_idx-1));
            node_weights = rowm(w,range(split_idx,w.size()-1));
        }

        template <typename T>
        typename disable_if<is_matrix<T> >::type populate_weights (
            const matrix<double,0,1>& w,
            T& edge_weights,
            T& node_weights,
            long split_idx
        ) const
        {
            edge_weights.clear();
            node_weights.clear();
            for (long i = 0; i < split_idx; ++i)
            {
                if (w(i) != 0)
                    edge_weights.insert(edge_weights.end(), std::make_pair(i,w(i)));
            }
            for (long i = split_idx; i < w.size(); ++i)
            {
                if (w(i) != 0)
                    node_weights.insert(node_weights.end(), std::make_pair(i-split_idx,w(i)));
            }
        }


        double C;
        oca solver;
        double eps;
        bool verbose;
        unsigned long num_threads;
        unsigned long max_cache_size;
        double loss_pos;
        double loss_neg;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_Hh_

