// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_Hh_ 
#define DLIB_SVm_MULTICLASS_LINEAR_TRAINER_Hh_

#include "svm_multiclass_linear_trainer_abstract.h"
#include "structural_svm_problem_threaded.h"
#include <vector>
#include "../optimization/optimization_oca.h"
#include "../matrix.h"
#include "sparse_vector.h"
#include "function.h"
#include <algorithm>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type,
        typename sample_type,
        typename label_type
        >
    class multiclass_svm_problem : public structural_svm_problem_threaded<matrix_type,
                                                                 std::vector<std::pair<unsigned long,typename matrix_type::type> > > 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the optimization problem for the multiclass SVM trainer
                object at the bottom of this file.  

                The joint feature vectors used by this object, the PSI(x,y) vectors, are
                defined as follows:
                    PSI(x,0) = [x,0,0,0,0, ...,0]
                    PSI(x,1) = [0,x,0,0,0, ...,0]
                    PSI(x,2) = [0,0,x,0,0, ...,0]
                That is, if there are N labels then the joint feature vector has a
                dimension that is N times the dimension of a single x sample.  Also,
                note that we append a -1 value onto each x to account for the bias term.
        !*/

    public:
        typedef typename matrix_type::type scalar_type;
        typedef std::vector<std::pair<unsigned long,scalar_type> > feature_vector_type;

        multiclass_svm_problem (
            const std::vector<sample_type>& samples_,
            const std::vector<label_type>& labels_,
            const std::vector<label_type>& distinct_labels_,
            const unsigned long dims_,
            const unsigned long num_threads
        ) :
            structural_svm_problem_threaded<matrix_type, std::vector<std::pair<unsigned long,typename matrix_type::type> > >(num_threads),
            samples(samples_),
            labels(labels_),
            distinct_labels(distinct_labels_),
            dims(dims_+1) // +1 for the bias
        {}

        virtual long get_num_dimensions (
        ) const
        {
            return dims*distinct_labels.size();
        }

        virtual long get_num_samples (
        ) const 
        {
            return static_cast<long>(samples.size());
        }

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi
        ) const 
        {
            assign(psi, samples[idx]);
            // Add a constant -1 to account for the bias term.
            psi.push_back(std::make_pair(dims-1,static_cast<scalar_type>(-1)));

            // Find which distinct label goes with this psi.
            long label_idx = 0;
            for (unsigned long i = 0; i < distinct_labels.size(); ++i)
            {
                if (distinct_labels[i] == labels[idx])
                {
                    label_idx = i;
                    break;
                }
            }

            offset_feature_vector(psi, dims*label_idx);
        }

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const 
        {
            scalar_type best_val = -std::numeric_limits<scalar_type>::infinity();
            unsigned long best_idx = 0;

            // Figure out which label is the best.  That is, what label maximizes
            // LOSS(idx,y) + F(x,y).  Note that y in this case is given by distinct_labels[i].
            for (unsigned long i = 0; i < distinct_labels.size(); ++i)
            {
                // Compute the F(x,y) part:
                // perform: temp == dot(relevant part of current solution, samples[idx]) - current_bias
                scalar_type temp = dot(mat(&current_solution(i*dims),dims-1), samples[idx]) - current_solution((i+1)*dims-1);

                // Add the LOSS(idx,y) part:
                if (labels[idx] != distinct_labels[i])
                    temp += 1;

                // Now temp == LOSS(idx,y) + F(x,y).  Check if it is the biggest we have seen.
                if (temp > best_val)
                {
                    best_val = temp;
                    best_idx = i;
                }
            }

            assign(psi, samples[idx]);
            // add a constant -1 to account for the bias term
            psi.push_back(std::make_pair(dims-1,static_cast<scalar_type>(-1)));

            offset_feature_vector(psi, dims*best_idx);

            if (distinct_labels[best_idx] == labels[idx])
                loss = 0;
            else
                loss = 1;
        }

    private:

        void offset_feature_vector (
            feature_vector_type& sample,
            const unsigned long val
        ) const
        {
            if (val != 0)
            {
                for (typename feature_vector_type::iterator i = sample.begin(); i != sample.end(); ++i)
                {
                    i->first += val;
                }
            }
        }


        const std::vector<sample_type>& samples;
        const std::vector<label_type>& labels;
        const std::vector<label_type>& distinct_labels;
        const long dims;
    };


// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class svm_multiclass_linear_trainer
    {
    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;


        // You are getting a compiler error on this line because you supplied a non-linear kernel
        // to the svm_c_linear_trainer object.  You have to use one of the linear kernels with this
        // trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));

        svm_multiclass_linear_trainer (
        ) :
            num_threads(4),
            C(1),
            eps(0.001),
            max_iterations(10000),
            verbose(false),
            learn_nonnegative_weights(false)
        {
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
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void svm_multiclass_linear_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const { return eps; }

        unsigned long get_max_iterations (
        ) const { return max_iterations; }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            max_iterations = max_iter;
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

        const kernel_type get_kernel (
        ) const
        {
            return kernel_type();
        }

        bool learns_nonnegative_weights (
        ) const { return learn_nonnegative_weights; }
       
        void set_learns_nonnegative_weights (
            bool value
        )
        {
            learn_nonnegative_weights = value;
            if (learn_nonnegative_weights)
                prior = trained_function_type(); 
        }

        void set_c (
            scalar_type C_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void svm_multiclass_linear_trainer::set_c()"
                << "\n\t C must be greater than 0"
                << "\n\t C_:   " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        const scalar_type get_c (
        ) const
        {
            return C;
        }

        void set_prior (
            const trained_function_type& prior_
        )
        {
            prior = prior_;
            learn_nonnegative_weights = false;
        }

        bool has_prior (
        ) const
        {
            return prior.labels.size() != 0;
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            scalar_type svm_objective = 0;
            return train(all_samples, all_labels, svm_objective);
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type svm_multiclass_linear_trainer::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            trained_function_type df;
            df.labels = select_all_distinct_labels(all_labels);
            if (has_prior())
            {
                df.labels.insert(df.labels.end(), prior.labels.begin(), prior.labels.end());
                df.labels = select_all_distinct_labels(df.labels);
            }
            const long input_sample_dimensionality = max_index_plus_one(all_samples);
            // If the samples are sparse then the right thing to do is to take the max
            // dimensionality between the prior and the new samples.  But if the samples
            // are dense vectors then they definitely all have to have exactly the same
            // dimensionality.
            const long dims = std::max(df.weights.nc(),input_sample_dimensionality);
            if (is_matrix<sample_type>::value && has_prior())
            {
                DLIB_ASSERT(input_sample_dimensionality == prior.weights.nc(), 
                    "\t trained_function_type svm_multiclass_linear_trainer::train(all_samples,all_labels)"
                    << "\n\t The training samples given to this function are not the same kind of training "
                    << "\n\t samples used to create the prior."
                    << "\n\t input_sample_dimensionality: " << input_sample_dimensionality 
                    << "\n\t prior.weights.nc():          " << prior.weights.nc() 
                );
            }

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            multiclass_svm_problem<w_type, sample_type, label_type> problem(all_samples, all_labels, df.labels, dims, num_threads);
            if (verbose)
                problem.be_verbose();

            problem.set_max_cache_size(0);
            problem.set_c(C);
            problem.set_epsilon(eps);
            problem.set_max_iterations(max_iterations);

            unsigned long num_nonnegative = 0;
            if (learn_nonnegative_weights)
            {
                num_nonnegative = problem.get_num_dimensions();
            }

            if (!has_prior())
            {
                svm_objective = solver(problem, weights, num_nonnegative);
            }
            else
            {
                matrix<scalar_type> temp(df.labels.size(),dims);
                w_type b(df.labels.size());
                temp = 0;
                b = 0;

                const long pad_size = dims-prior.weights.nc();
                // Copy the prior into the temp and b matrices.  We have to do this row
                // by row copy because the new training data might have new labels we
                // haven't seen before and therefore the sizes of these matrices could be
                // different.
                for (unsigned long i = 0; i < prior.labels.size(); ++i)
                {
                    const long r = std::find(df.labels.begin(), df.labels.end(), prior.labels[i])-df.labels.begin();
                    set_rowm(temp,r) = join_rows(rowm(prior.weights,i), zeros_matrix<scalar_type>(1,pad_size));
                    b(r) = prior.b(i);
                }

                const w_type prior_vect = reshape_to_column_vector(join_rows(temp,b));
                svm_objective = solver(problem, weights, prior_vect);
            }


            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:

        unsigned long num_threads;
        scalar_type C;
        scalar_type eps;
        unsigned long max_iterations;
        bool verbose;
        oca solver;
        bool learn_nonnegative_weights;

        trained_function_type prior;
    };

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_SVm_MULTICLASS_LINEAR_TRAINER_Hh_

