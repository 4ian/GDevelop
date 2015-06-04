// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_Hh_
#define DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_Hh_


#include "structural_svm_assignment_problem_abstract.h"
#include "../matrix.h"
#include <vector>
#include <iterator>
#include "structural_svm_problem_threaded.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    template <long n, typename T>
    struct column_matrix_static_resize
    {
        typedef T type;
    };

    template <long n, typename T, long NR, long NC, typename MM, typename L>
    struct column_matrix_static_resize<n, matrix<T,NR,NC,MM,L> >
    {
        typedef matrix<T,NR+n,NC,MM,L> type;
    };

    template <long n, typename T, long NC, typename MM, typename L>
    struct column_matrix_static_resize<n, matrix<T,0,NC,MM,L> >
    {
        typedef matrix<T,0,NC,MM,L> type;
    };

    template <typename T>
    struct add_one_to_static_feat_size
    {
        typedef typename column_matrix_static_resize<1,typename T::feature_vector_type>::type type;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_svm_assignment_problem : noncopyable,
        public structural_svm_problem_threaded<matrix<double,0,1>, typename add_one_to_static_feat_size<feature_extractor>::type >
    {
    public:
        typedef matrix<double,0,1> matrix_type;
        typedef typename add_one_to_static_feat_size<feature_extractor>::type feature_vector_type;

        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;


        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;

        typedef std::vector<long> label_type;

        structural_svm_assignment_problem(
            const std::vector<sample_type>& samples_,
            const std::vector<label_type>& labels_,
            const feature_extractor& fe_,
            bool force_assignment_,
            unsigned long num_threads,
            const double loss_per_false_association_,
            const double loss_per_missed_association_
        ) :
            structural_svm_problem_threaded<matrix_type,feature_vector_type>(num_threads),
            samples(samples_),
            labels(labels_),
            fe(fe_),
            force_assignment(force_assignment_),
            loss_per_false_association(loss_per_false_association_),
            loss_per_missed_association(loss_per_missed_association_)
        {
            // make sure requires clause is not broken
#ifdef ENABLE_ASSERTS
            DLIB_ASSERT(loss_per_false_association > 0 && loss_per_missed_association > 0,
                "\t structural_svm_assignment_problem::structural_svm_assignment_problem()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t loss_per_false_association:  " << loss_per_false_association
                << "\n\t loss_per_missed_association: " << loss_per_missed_association
                << "\n\t this: " << this
            );
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
            return fe.num_features()+1; // +1 for the bias term
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
            psi.set_size(get_num_dimensions());
            psi = 0;
            for (unsigned long i = 0; i < sample.first.size(); ++i)
            {
                if (label[i] != -1)
                {
                    fe.get_features(sample.first[i], sample.second[label[i]], feats);
                    set_rowm(psi,range(0,feats.size()-1)) += feats;
                    psi(get_num_dimensions()-1) += 1;
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
            feature_vector_type feats;
            int num_assignments = 0;
            for (unsigned long i = 0; i < sample.first.size(); ++i)
            {
                if (label[i] != -1)
                {
                    fe.get_features(sample.first[i], sample.second[label[i]], feats);
                    append_to_sparse_vect(psi, feats);
                    ++num_assignments;
                }
            }
            psi.push_back(std::make_pair(get_num_dimensions()-1,num_assignments));
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
                            const double bias = current_solution(current_solution.size()-1);
                            cost(r,c) = dot(colm(current_solution,0,current_solution.size()-1), feats) + bias;

                            // add in the loss since this corresponds to an incorrect prediction.
                            if (c != labels[idx][r])
                            {
                                cost(r,c) += loss_per_false_association;
                            }
                        }
                        else
                        {
                            if (labels[idx][r] == -1)
                                cost(r,c) = 0;
                            else
                                cost(r,c) = loss_per_missed_association; 
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
                {
                    if (assignment[i] == -1)
                        loss += loss_per_missed_association;
                    else
                        loss += loss_per_false_association;
                }
            }

            get_joint_feature_vector(samples[idx], assignment, psi);
        }

        const std::vector<sample_type>& samples;
        const std::vector<label_type>& labels;
        const feature_extractor& fe;
        bool force_assignment;
        const double loss_per_false_association;
        const double loss_per_missed_association;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_Hh_

