// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ASSIGNMENT_FuNCTION_H__
#define DLIB_ASSIGNMENT_FuNCTION_H__

#include "assignment_function_abstract.h"
#include "../matrix.h"
#include <vector>
#include "../optimization/max_cost_assignment.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor 
        >
    class assignment_function
    {
    public:

        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;


        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;

        typedef std::vector<long> label_type;
        typedef label_type result_type;

        assignment_function()
        {
            weights.set_size(fe.num_features());
            weights = 0;
            force_assignment = false;
        }

        explicit assignment_function(
            const matrix<double,0,1>& weights_
        ) : 
            weights(weights_),
            force_assignment(false)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(fe.num_features() == static_cast<unsigned long>(weights_.size()),
                "\t assignment_function::assignment_function(weights_)"
                << "\n\t These sizes should match"
                << "\n\t fe.num_features(): " << fe.num_features() 
                << "\n\t weights_.size():   " << weights_.size() 
                << "\n\t this: " << this
                );

        }

        assignment_function(
            const matrix<double,0,1>& weights_,
            const feature_extractor& fe_
        ) :
            fe(fe_),
            weights(weights_),
            force_assignment(false)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(fe_.num_features() == static_cast<unsigned long>(weights_.size()),
                "\t assignment_function::assignment_function(weights_,fe_)"
                << "\n\t These sizes should match"
                << "\n\t fe_.num_features(): " << fe_.num_features() 
                << "\n\t weights_.size():    " << weights_.size() 
                << "\n\t this: " << this
                );
        }

        assignment_function(
            const matrix<double,0,1>& weights_,
            const feature_extractor& fe_,
            bool force_assignment_
        ) :
            fe(fe_),
            weights(weights_),
            force_assignment(force_assignment_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(fe_.num_features() == static_cast<unsigned long>(weights_.size()),
                "\t assignment_function::assignment_function(weights_,fe_,force_assignment_)"
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

        bool forces_assignment (
        ) const { return force_assignment; }

        void predict_assignments (
            const std::vector<lhs_element>& lhs,
            const std::vector<rhs_element>& rhs,
            result_type& assignment
        ) const
        {
            assignment.clear();

            matrix<double> cost;
            unsigned long size;
            if (force_assignment)
            {
                size = std::max(lhs.size(), rhs.size());
            }
            else
            {
                size = rhs.size() + lhs.size();
            }
            cost.set_size(size, size);

            typedef typename feature_extractor::feature_vector_type feature_vector_type;
            feature_vector_type feats;

            // now fill out the cost assignment matrix
            for (long r = 0; r < cost.nr(); ++r)
            {
                for (long c = 0; c < cost.nc(); ++c)
                {
                    if (r < (long)lhs.size() && c < (long)rhs.size())
                    {
                        fe.get_features(lhs[r], rhs[c], feats);
                        cost(r,c) = dot(weights, feats);
                    }
                    else
                    {
                        cost(r,c) = 0;
                    }
                }
            }


            if (cost.size() != 0)
            {
                // max_cost_assignment() only works with integer matrices, so convert from
                // double to integer.
                const double scale = (std::numeric_limits<dlib::int64>::max()/1000)/max(abs(cost));
                matrix<dlib::int64> int_cost = matrix_cast<dlib::int64>(round(cost*scale));
                assignment = max_cost_assignment(int_cost);
                assignment.resize(lhs.size());
            }

            // adjust assignment so that non-assignments have a value of -1
            for (unsigned long i = 0; i < assignment.size(); ++i)
            {
                if (assignment[i] >= (long)rhs.size())
                    assignment[i] = -1;
            }
        }

        void predict_assignments (
            const sample_type& item,
            result_type& assignment
        ) const
        {
            predict_assignments(item.first, item.second, assignment);
        }

        result_type operator()(
            const std::vector<lhs_element>& lhs,
            const std::vector<rhs_element>& rhs 
        ) const
        {
            result_type temp;
            predict_assignments(lhs,rhs,temp);
            return temp;
        }

        result_type operator() (
            const sample_type& item
        ) const
        {
            return (*this)(item.first, item.second);
        }

    private:


        feature_extractor fe;
        matrix<double,0,1> weights;
        bool force_assignment;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void serialize (
        const assignment_function<feature_extractor>& item,
        std::ostream& out
    )
    {
        serialize(item.get_feature_extractor(), out);
        serialize(item.get_weights(), out);
        serialize(item.forces_assignment(), out);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void deserialize (
        assignment_function<feature_extractor>& item,
        std::istream& in 
    )
    {
        feature_extractor fe;
        matrix<double,0,1> weights;
        bool force_assignment;

        deserialize(fe, in);
        deserialize(weights, in);
        deserialize(force_assignment, in);

        item = assignment_function<feature_extractor>(weights, fe, force_assignment);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGNMENT_FuNCTION_H__

