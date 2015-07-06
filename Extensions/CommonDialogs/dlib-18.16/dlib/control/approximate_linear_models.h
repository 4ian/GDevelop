// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_APPROXIMATE_LINEAR_MODELS_Hh_
#define DLIB_APPROXIMATE_LINEAR_MODELS_Hh_

#include "approximate_linear_models_abstract.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    struct process_sample
    {
        typedef feature_extractor feature_extractor_type;
        typedef typename feature_extractor::state_type state_type;
        typedef typename feature_extractor::action_type action_type;

        process_sample(){}

        process_sample(
            const state_type& s,
            const action_type& a,
            const state_type& n,
            const double& r
        ) : state(s), action(a), next_state(n), reward(r) {}

        state_type  state;
        action_type action;
        state_type  next_state;
        double reward;
    };

    template < typename feature_extractor >
    void serialize (const process_sample<feature_extractor>& item, std::ostream& out)
    {
        serialize(item.state, out);
        serialize(item.action, out);
        serialize(item.next_state, out);
        serialize(item.reward, out);
    }

    template < typename feature_extractor >
    void deserialize (process_sample<feature_extractor>& item, std::istream& in)
    {
        deserialize(item.state, in);
        deserialize(item.action, in);
        deserialize(item.next_state, in);
        deserialize(item.reward, in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class policy
    {
    public:

        typedef feature_extractor feature_extractor_type;
        typedef typename feature_extractor::state_type state_type;
        typedef typename feature_extractor::action_type action_type;


        policy (
        )
        {
            w.set_size(fe.num_features());
            w = 0;
        }

        policy (
            const matrix<double,0,1>& weights_,
            const feature_extractor& fe_
        ) : w(weights_), fe(fe_) {}

        action_type operator() (
            const state_type& state
        ) const
        {
            return fe.find_best_action(state,w);
        }

        const feature_extractor& get_feature_extractor (
        ) const { return fe; }

        const matrix<double,0,1>& get_weights (
        ) const { return w; }


    private:
        matrix<double,0,1> w;
        feature_extractor fe;
    };

    template < typename feature_extractor >
    inline void serialize(const policy<feature_extractor>& item, std::ostream& out)
    {
        int version = 1;
        serialize(version, out);
        serialize(item.get_feature_extractor(), out);
        serialize(item.get_weights(), out);
    }
    template < typename feature_extractor >
    inline void deserialize(policy<feature_extractor>& item, std::istream& in)
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unexpected version found while deserializing dlib::policy object.");
        feature_extractor fe;
        matrix<double,0,1> w;
        deserialize(fe, in);
        deserialize(w, in);
        item = policy<feature_extractor>(w,fe);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_APPROXIMATE_LINEAR_MODELS_Hh_

