// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_MULTICLASS_LINEAR_TRAINER_H__ 
#define DLIB_SVm_MULTICLASS_LINEAR_TRAINER_H__

#include "svm_multiclass_linear_trainer_abstract.h"
#include "structural_svm_problem.h"
#include <vector>
#include "../optimization/optimization_oca.h"
#include "../matrix.h"
#include "sparse_vector.h"
#include "function.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type,
        typename sample_type,
        typename label_type
        >
    class multiclass_svm_problem : public structural_svm_problem<matrix_type,
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
            const std::vector<label_type>& labels_
        ) :
            samples(samples_),
            labels(labels_),
            distinct_labels(select_all_distinct_labels(labels_)),
            dims(max_index_plus_one(samples_)+1) // +1 for the bias
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
            const long label_idx = index_of_max(vector_to_matrix(distinct_labels) == labels[idx]);

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
                scalar_type temp = dot(rowm(current_solution, range(i*dims, (i+1)*dims-2)), samples[idx]) - current_solution((i+1)*dims-1);

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
        const std::vector<label_type> distinct_labels;
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
            C(1),
            eps(0.001),
            verbose(false)
        {
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

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            multiclass_svm_problem<w_type, sample_type, label_type> problem(all_samples, all_labels);
            if (verbose)
                problem.be_verbose();

            problem.set_max_cache_size(0);
            problem.set_c(C);
            problem.set_epsilon(eps);

            svm_objective = solver(problem, weights);

            trained_function_type df;

            const long dims = max_index_plus_one(all_samples);
            df.labels  = select_all_distinct_labels(all_labels);
            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:
        scalar_type C;
        scalar_type eps;
        bool verbose;
        oca solver;
    };

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_SVm_MULTICLASS_LINEAR_TRAINER_H__

