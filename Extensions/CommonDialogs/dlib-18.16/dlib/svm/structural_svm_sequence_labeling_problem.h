// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_Hh_
#define DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_Hh_


#include "structural_svm_sequence_labeling_problem_abstract.h"
#include "../matrix.h"
#include "sequence_labeler.h"
#include <vector>
#include "structural_svm_problem_threaded.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    namespace fe_helpers
    {

    // ----------------------------------------------------------------------------------------

        struct get_feats_functor 
        {
            get_feats_functor(std::vector<std::pair<unsigned long, double> >& feats_) : feats(feats_) {}

            inline void operator() (
                unsigned long feat_index,
                double feat_value
            )
            {
                feats.push_back(std::make_pair(feat_index, feat_value));
            }

            inline void operator() (
                unsigned long feat_index
            )
            {
                feats.push_back(std::make_pair(feat_index, 1));
            }

            std::vector<std::pair<unsigned long, double> >& feats;
        };

    // ----------------------------------------------------------------------------------------

        template <typename feature_extractor, typename sequence_type, typename EXP2> 
        void get_feature_vector(
            std::vector<std::pair<unsigned long, double> >& feats,
            const feature_extractor& fe,
            const sequence_type& sequence,
            const matrix_exp<EXP2>& candidate_labeling,
            unsigned long position
        )
        {
            get_feats_functor funct(feats);
            fe.get_features(funct, sequence,candidate_labeling, position);
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class structural_svm_sequence_labeling_problem : noncopyable,
        public structural_svm_problem_threaded<matrix<double,0,1>, std::vector<std::pair<unsigned long,double> > >
    {
    public:
        typedef matrix<double,0,1> matrix_type;
        typedef std::vector<std::pair<unsigned long, double> > feature_vector_type;

        typedef typename feature_extractor::sequence_type sequence_type;

        structural_svm_sequence_labeling_problem(
            const std::vector<sequence_type>& samples_,
            const std::vector<std::vector<unsigned long> >& labels_,
            const feature_extractor& fe_,
            unsigned long num_threads = 2
        ) :
            structural_svm_problem_threaded<matrix_type,feature_vector_type>(num_threads),
            samples(samples_),
            labels(labels_),
            fe(fe_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_sequence_labeling_problem(samples,labels) == true &&
                        contains_invalid_labeling(fe, samples, labels) == false,
                        "\t structural_svm_sequence_labeling_problem::structural_svm_sequence_labeling_problem()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t samples.size(): " << samples.size() 
                        << "\n\t is_sequence_labeling_problem(samples,labels): " << is_sequence_labeling_problem(samples,labels)
                        << "\n\t contains_invalid_labeling(fe,samples,labels): " << contains_invalid_labeling(fe,samples,labels)
                        << "\n\t this: " << this
                        );

#ifdef ENABLE_ASSERTS
            for (unsigned long i = 0; i < labels.size(); ++i)
            {
                for (unsigned long j = 0; j < labels[i].size(); ++j)
                {
                    // make sure requires clause is not broken
                    DLIB_ASSERT(labels[i][j] < fe.num_labels(),
                                "\t structural_svm_sequence_labeling_problem::structural_svm_sequence_labeling_problem()"
                                << "\n\t The given labels in labels are invalid."
                                << "\n\t labels[i][j]: " << labels[i][j] 
                                << "\n\t fe.num_labels(): " << fe.num_labels()
                                << "\n\t i: " << i 
                                << "\n\t j: " << j 
                                << "\n\t this: " << this
                                );
                }
            }
#endif

            loss_values.assign(num_labels(), 1);

        }

        unsigned long num_labels (
        ) const { return fe.num_labels(); }

        double get_loss (
            unsigned long label
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(label < num_labels(),
                        "\t void structural_svm_sequence_labeling_problem::get_loss()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t label:        " << label 
                        << "\n\t num_labels(): " << num_labels() 
                        << "\n\t this:         " << this
                        );

            return loss_values[label]; 
        }

        void set_loss (
            unsigned long label,
            double value
        )  
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(label < num_labels() && value >= 0,
                        "\t void structural_svm_sequence_labeling_problem::set_loss()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t label:        " << label 
                        << "\n\t num_labels(): " << num_labels() 
                        << "\n\t value:        " << value 
                        << "\n\t this:         " << this
                        );

            loss_values[label] = value;
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

        void get_joint_feature_vector (
            const sequence_type& sample, 
            const std::vector<unsigned long>& label,
            feature_vector_type& psi
        ) const 
        {
            psi.clear();

            const int order = fe.order();

            matrix<unsigned long,0,1> candidate_labeling; 
            for (unsigned long i = 0; i < sample.size(); ++i)
            {
                candidate_labeling = rowm(mat(label), range(i, std::max((int)i-order,0)));

                fe_helpers::get_feature_vector(psi,fe,sample,candidate_labeling, i);
            }
        }

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi 
        ) const 
        {
            get_joint_feature_vector(samples[idx], labels[idx], psi);
        }

        class map_prob
        {
        public:
            unsigned long order() const { return fe.order(); }
            unsigned long num_states() const { return fe.num_labels(); }

            map_prob(
                const sequence_type& sequence_,
                const std::vector<unsigned long>& label_,
                const feature_extractor& fe_,
                const matrix<double,0,1>& weights_,
                const std::vector<double>& loss_values_
            ) :
                sequence(sequence_),
                label(label_),
                fe(fe_),
                weights(weights_),
                loss_values(loss_values_)
            {
            }

            unsigned long number_of_nodes(
            ) const
            {
                return sequence.size();
            }

            template <
                typename EXP 
                >
            double factor_value (
                unsigned long node_id,
                const matrix_exp<EXP>& node_states
            ) const
            {
                if (dlib::impl::call_reject_labeling_if_exists(fe, sequence,  node_states, node_id))
                    return -std::numeric_limits<double>::infinity();

                double loss = 0;
                if (node_states(0) != label[node_id])
                    loss = loss_values[label[node_id]];

                return fe_helpers::dot(weights, fe, sequence, node_states, node_id) + loss;
            }

            const sequence_type& sequence;
            const std::vector<unsigned long>& label;
            const feature_extractor& fe;
            const matrix<double,0,1>& weights;
            const std::vector<double>& loss_values;
        };

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const
        {
            std::vector<unsigned long> y;
            find_max_factor_graph_viterbi(map_prob(samples[idx],labels[idx],fe,current_solution,loss_values), y);

            loss = 0;
            for (unsigned long i = 0; i < y.size(); ++i)
            {
                if (y[i] != labels[idx][i])
                    loss += loss_values[labels[idx][i]];
            }

            get_joint_feature_vector(samples[idx], y, psi);
        }

        const std::vector<sequence_type>& samples;
        const std::vector<std::vector<unsigned long> >& labels;
        const feature_extractor& fe;
        std::vector<double> loss_values;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_Hh_

