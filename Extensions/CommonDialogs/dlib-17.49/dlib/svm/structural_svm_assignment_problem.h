// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_H__
#define DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_H__


#include "structural_svm_assignment_problem_abstract.h"
#include "../matrix.h"
#include <vector>
#include <iterator>
#include "structural_svm_problem_threaded.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    template <
        typename feature_extractor
        >
    class structural_svm_assignment_problem : noncopyable,
        public structural_svm_problem_threaded<matrix<double,0,1>, typename feature_extractor::feature_vector_type >
    {
    public:
        typedef matrix<double,0,1> matrix_type;
        typedef typename feature_extractor::feature_vector_type feature_vector_type;

        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;


        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;

        typedef std::vector<long> label_type;

        structural_svm_assignment_problem(
            const std::vector<sample_type>& samples_,
            const std::vector<label_type>& labels_,
            const feature_extractor& fe_,
            bool force_assignment_,
            unsigned long num_threads = 2
        ) :
            structural_svm_problem_threaded<matrix_type,feature_vector_type>(num_threads),
            samples(samples_),
            labels(labels_),
            fe(fe_),
            force_assignment(force_assignment_)
        {
            // make sure requires clause is not broken
#ifdef ENABLE_ASSERTS
            if (force_assignment)
            {
                DLIB_ASSERT(is_forced_assignment_problem(samples, labels),
                            "\t structural_svm_assignment_problem::structural_svm_assignment_problem()"
                            << "\n\t invalid inputs were given to this function"
                            << "\n\t is_forced_assignment_problem(samples,labels): " << is_forced_assignment_problem(samples,labels)
                            << "\n\t is_assignment_problem(samples,labels):        " << is_assignment_problem(samples,labels)
                            << "\n\t is_learning_problem(samples,labels):          " << is_learning_problem(samples,labels)
                            << "\n\t this: " << this
                            );
            }
            else
            {
                DLIB_ASSERT(is_assignment_problem(samples, labels),
                            "\t structural_svm_assignment_problem::structural_svm_assignment_problem()"
                            << "\n\t invalid inputs were given to this function"
                            << "\n\t is_assignment_problem(samples,labels): " << is_assignment_problem(samples,labels)
                            << "\n\t is_learning_problem(samples,labels):   " << is_learning_problem(samples,labels)
                            << "\n\t this: " << this
                            );
            }
#endif

        }

    private:
        virtual long get_num_dimensions (
        ) const 
        {
            return fe.num_features();
        }

        virtual long get_num_samples (
        ) const 
        {
            return samples.size();
        }

        template <typename psi_type>
        typename enable_if<is_matrix<psi_type> >::type get_joint_feature_vector (
            const sample_type& sample, 
            const label_type& label,
            psi_type& psi
        ) const 
        {
            typename feature_extractor::feature_vector_type feats;
            psi.set_size(fe.num_features());
            psi = 0;
            for (unsigned long i = 0; i < sample.first.size(); ++i)
            {
                if (label[i] != -1)
                {
                    fe.get_features(sample.first[i], sample.second[label[i]], feats);
                    psi += feats;
                }
            }
        }

        template <typename T>
        void append_to_sparse_vect (
            T& psi,
            const T& vect
        ) const
        {
            std::copy(vect.begin(), vect.end(), std::back_inserter(psi));
        }

        template <typename psi_type>
        typename disable_if<is_matrix<psi_type> >::type get_joint_feature_vector (
            const sample_type& sample, 
            const label_type& label,
            psi_type& psi
        ) const 
        {
            psi.clear();
            typename feature_extractor::feature_vector_type feats;
            for (unsigned long i = 0; i < sample.first.size(); ++i)
            {
                if (label[i] != -1)
                {
                    fe.get_features(sample.first[i], sample.second[label[i]], feats);
                    append_to_sparse_vect(psi, feats);
                }
            }
        }

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi 
        ) const 
        {
            get_joint_feature_vector(samples[idx], labels[idx], psi);
        }

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            double& loss,
            feature_vector_type& psi
        ) const
        {
            matrix<double> cost;
            unsigned long size;
            if (force_assignment)
            {
                unsigned long lhs_size = samples[idx].first.size();
                unsigned long rhs_size = samples[idx].second.size();
                size = std::max(lhs_size, rhs_size);
            }
            else
            {
                unsigned long rhs_size = samples[idx].second.size() + samples[idx].first.size();
                size = rhs_size;
            }
            cost.set_size(size, size);

            typename feature_extractor::feature_vector_type feats;

            // now fill out the cost assignment matrix
            for (long r = 0; r < cost.nr(); ++r)
            {
                for (long c = 0; c < cost.nc(); ++c)
                {
                    if (r < (long)samples[idx].first.size())
                    {
                        if (c < (long)samples[idx].second.size())
                        {
                            fe.get_features(samples[idx].first[r], samples[idx].second[c], feats);
                            cost(r,c) = dot(current_solution, feats);

                            // add in the loss since this corresponds to an incorrect prediction.
                            if (c != labels[idx][r])
                            {
                                cost(r,c) += 1;
                            }
                        }
                        else
                        {
                            if (labels[idx][r] == -1)
                                cost(r,c) = 0;
                            else
                                cost(r,c) = 1; // 1 for the loss
                        }

                    }
                    else
                    {
                        cost(r,c) = 0;
                    }
                }
            }

            std::vector<long> assignment;

            if (cost.size() != 0)
            {
                // max_cost_assignment() only works with integer matrices, so convert from
                // double to integer.
                const double scale = (std::numeric_limits<dlib::int64>::max()/1000)/max(abs(cost));
                matrix<dlib::int64> int_cost = matrix_cast<dlib::int64>(round(cost*scale));
                assignment = max_cost_assignment(int_cost);
                assignment.resize(samples[idx].first.size());
            }

            loss = 0;
            // adjust assignment so that non-assignments have a value of -1. Also compute loss.
            for (unsigned long i = 0; i < assignment.size(); ++i)
            {
                if (assignment[i] >= (long)samples[idx].second.size())
                    assignment[i] = -1;

                if (assignment[i] != labels[idx][i])
                    loss += 1;
            }

            get_joint_feature_vector(samples[idx], assignment, psi);
        }

        const std::vector<sample_type>& samples;
        const std::vector<label_type>& labels;
        const feature_extractor& fe;
        bool force_assignment;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_H__

