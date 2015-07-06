// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_LAbELER_H_h_
#define DLIB_SEQUENCE_LAbELER_H_h_

#include "sequence_labeler_abstract.h"
#include "../matrix.h"
#include <vector>
#include "../optimization/find_max_factor_graph_viterbi.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace fe_helpers
    {
        template <typename EXP>
        struct dot_functor
        {
            dot_functor(const matrix_exp<EXP>& lambda_) : lambda(lambda_), value(0) {}

            inline void operator() (
                unsigned long feat_index
            )
            {
                value += lambda(feat_index);
            }

            inline void operator() (
                unsigned long feat_index,
                double feat_value
            )
            {
                value += feat_value*lambda(feat_index);
            }

            const matrix_exp<EXP>& lambda;
            double value;
        };

        template <typename feature_extractor, typename EXP, typename sequence_type, typename EXP2> 
        double dot(
            const matrix_exp<EXP>& lambda,
            const feature_extractor& fe,
            const sequence_type& sequence,
            const matrix_exp<EXP2>& candidate_labeling,
            unsigned long position
        )
        {
            dot_functor<EXP> dot(lambda);
            fe.get_features(dot, sequence, candidate_labeling, position);
            return dot.value;
        }

    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(
            has_reject_labeling, 
            bool, 
            template reject_labeling<matrix<unsigned long> >,
            (const typename T::sequence_type&, const matrix_exp<matrix<unsigned long> >&, unsigned long)const
        );

        template <typename feature_extractor, typename EXP, typename sequence_type>
        typename enable_if<has_reject_labeling<feature_extractor>,bool>::type call_reject_labeling_if_exists (
            const feature_extractor& fe,
            const sequence_type& x,
            const matrix_exp<EXP>& y,
            unsigned long position
        )
        {
            return fe.reject_labeling(x, y, position);
        }

        template <typename feature_extractor, typename EXP, typename sequence_type>
        typename disable_if<has_reject_labeling<feature_extractor>,bool>::type call_reject_labeling_if_exists (
            const feature_extractor& ,
            const sequence_type& ,
            const matrix_exp<EXP>& ,
            unsigned long 
        )
        {
            return false;
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor 
        >
    typename enable_if<dlib::impl::has_reject_labeling<feature_extractor>,bool>::type contains_invalid_labeling (
        const feature_extractor& fe,
        const typename feature_extractor::sequence_type& x,
        const std::vector<unsigned long>& y
    )
    {
        if (x.size() != y.size())
            return true;

        matrix<unsigned long,0,1> node_states;

        for (unsigned long i = 0; i < x.size(); ++i)
        {
            node_states.set_size(std::min(fe.order(),i) + 1);
            for (unsigned long j = 0; j < (unsigned long)node_states.size(); ++j)
                node_states(j) = y[i-j];

            if (fe.reject_labeling(x, node_states, i))
                return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor 
        >
    typename disable_if<dlib::impl::has_reject_labeling<feature_extractor>,bool>::type contains_invalid_labeling (
        const feature_extractor& ,
        const typename feature_extractor::sequence_type& x,
        const std::vector<unsigned long>& y 
    )
    {
        if (x.size() != y.size())
            return true;

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor 
        >
    bool contains_invalid_labeling (
        const feature_extractor& fe,
        const std::vector<typename feature_extractor::sequence_type>& x,
        const std::vector<std::vector<unsigned long> >& y
    )
    {
        if (x.size() != y.size())
            return true;

        for (unsigned long i = 0; i < x.size(); ++i)
        {
            if (contains_invalid_labeling(fe,x[i],y[i]))
                return true;
        }
        return false;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class sequence_labeler
    {
    public:
        typedef typename feature_extractor::sequence_type sample_sequence_type;
        typedef std::vector<unsigned long> labeled_sequence_type;

    private:
        class map_prob
        {
        public:
            unsigned long order() const { return fe.order(); }
            unsigned long num_states() const { return fe.num_labels(); }

            map_prob(
                const sample_sequence_type& x_,
                const feature_extractor& fe_,
                const matrix<double,0,1>& weights_
            ) :
                sequence(x_),
                fe(fe_),
                weights(weights_)
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

                return fe_helpers::dot(weights, fe, sequence, node_states, node_id);
            }

            const sample_sequence_type& sequence;
            const feature_extractor& fe;
            const matrix<double,0,1>& weights;
        };
    public:

        sequence_labeler()
        {
            weights.set_size(fe.num_features());
            weights = 0;
        }

        explicit sequence_labeler(
            const matrix<double,0,1>& weights_
        ) : 
            weights(weights_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(fe.num_features() == static_cast<unsigned long>(weights_.size()),
                "\t sequence_labeler::sequence_labeler(weights_)"
                << "\n\t These sizes should match"
                << "\n\t fe.num_features(): " << fe.num_features() 
                << "\n\t weights_.size():   " << weights_.size() 
                << "\n\t this: " << this
                );
        }

        sequence_labeler(
            const matrix<double,0,1>& weights_,
            const feature_extractor& fe_
        ) :
            fe(fe_),
            weights(weights_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(fe_.num_features() == static_cast<unsigned long>(weights_.size()),
                "\t sequence_labeler::sequence_labeler(weights_,fe_)"
                << "\n\t These sizes should match"
                << "\n\t fe_.num_features(): " << fe_.num_features() 
                << "\n\t weights_.size():    " << weights_.size() 
                << "\n\t this: " << this
                );
        }

        const feature_extractor& get_feature_extractor (
        ) const { return fe; }

        const matrix<double,0,1>& get_weights (
        ) const { return weights; }

        unsigned long num_labels (
        ) const { return fe.num_labels(); }

        labeled_sequence_type operator() (
            const sample_sequence_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_labels() > 0,
                "\t labeled_sequence_type sequence_labeler::operator()(x)"
                << "\n\t You can't have no labels."
                << "\n\t this: " << this
                );

            labeled_sequence_type y;
            find_max_factor_graph_viterbi(map_prob(x,fe,weights), y);
            return y;
        }

        void label_sequence (
            const sample_sequence_type& x,
            labeled_sequence_type& y
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_labels() > 0,
                "\t void sequence_labeler::label_sequence(x,y)"
                << "\n\t You can't have no labels."
                << "\n\t this: " << this
                );

            find_max_factor_graph_viterbi(map_prob(x,fe,weights), y);
        }

    private:

        feature_extractor fe;
        matrix<double,0,1> weights;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void serialize (
        const sequence_labeler<feature_extractor>& item,
        std::ostream& out
    )
    {
        serialize(item.get_feature_extractor(), out);
        serialize(item.get_weights(), out);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void deserialize (
        sequence_labeler<feature_extractor>& item,
        std::istream& in 
    )
    {
        feature_extractor fe;
        matrix<double,0,1> weights;

        deserialize(fe, in);
        deserialize(weights, in);

        item = sequence_labeler<feature_extractor>(weights, fe);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_LAbELER_H_h_

