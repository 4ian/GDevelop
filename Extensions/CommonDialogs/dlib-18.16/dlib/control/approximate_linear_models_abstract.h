// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_APPROXIMATE_LINEAR_MODELS_ABSTRACT_Hh_
#ifdef DLIB_APPROXIMATE_LINEAR_MODELS_ABSTRACT_Hh_

#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct example_feature_extractor 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a feature extractor must implement if it
                is to be used with the process_sample and policy objects defined at the
                bottom of this file.  Moreover, it is meant to represent the core part
                of a model use in a reinforcement learning algorithm.
                
                In particular, this object models a Q(state,action) function where
                    Q(state,action) == dot(w, PSI(state,action))
                    where PSI(state,action) is a feature vector and w is a parameter
                    vector.

                Therefore, a feature extractor defines how the PSI(x,y) feature vector is
                calculated.  It also defines the types used to represent the state and
                action objects. 


            THREAD SAFETY
                Instances of this object are required to be threadsafe, that is, it should
                be safe for multiple threads to make concurrent calls to the member
                functions of this object.
        !*/

        // The state and actions can be any types so long as you provide typedefs for them.
        typedef T state_type;
        typedef U action_type; 
        // We can also say that the last element in the weight vector w must be 1.  This
        // can be useful for including a prior into your model.
        const static bool force_last_weight_to_1 = false;

        example_feature_extractor(
        );
        /*!
            ensures
                - this object is properly initialized.
        !*/

        unsigned long num_features(
        ) const;
        /*!
            ensures
                - returns the dimensionality of the PSI() feature vector.  
        !*/

        action_type find_best_action (
            const state_type& state,
            const matrix<double,0,1>& w
        ) const;
        /*!
            ensures
                - returns the action A that maximizes Q(state,A) = dot(w,PSI(state,A)).
                  That is, this function finds the best action to take in the given state
                  when our model is parameterized by the given weight vector w.
        !*/

        void get_features (
            const state_type& state,
            const action_type& action,
            matrix<double,0,1>& feats
        ) const;
        /*!
            ensures
                - #feats.size() == num_features()
                - #feats == PSI(state,action)
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    struct process_sample
    {
        /*!
            REQUIREMENTS ON feature_extractor
                feature_extractor should implement the example_feature_extractor interface
                defined at the top of this file.

            WHAT THIS OBJECT REPRESENTS
                This object holds a training sample for a reinforcement learning algorithm.
                In particular, it should be a sample from some process where the process
                was in state this->state, then took this->action action which resulted in
                receiving this->reward and ending up in the state this->next_state.
        !*/

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
    void serialize (const process_sample<feature_extractor>& item, std::ostream& out);
    template < typename feature_extractor >
    void deserialize (process_sample<feature_extractor>& item, std::istream& in);
    /*!
        provides serialization support.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class policy
    {
        /*!
            REQUIREMENTS ON feature_extractor
                feature_extractor should implement the example_feature_extractor interface
                defined at the top of this file.

            WHAT THIS OBJECT REPRESENTS
                This is a policy based on the supplied feature_extractor model.  In
                particular, it maps from feature_extractor::state_type to the best action
                to take in that state.
        !*/

    public:

        typedef feature_extractor feature_extractor_type;
        typedef typename feature_extractor::state_type state_type;
        typedef typename feature_extractor::action_type action_type;


        policy (
        );
        /*!
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_weights().size() == #get_feature_extractor().num_features()
                - #get_weights() == 0
        !*/

        policy (
            const matrix<double,0,1>& weights,
            const feature_extractor& fe
        ); 
        /*!
            requires
                - fe.num_features() == weights.size()
            ensures
                - #get_feature_extractor() == fe
                - #get_weights() == weights
        !*/

        action_type operator() (
            const state_type& state
        ) const;
        /*!
            ensures
                - returns get_feature_extractor().find_best_action(state,w);
        !*/

        const feature_extractor& get_feature_extractor (
        ) const; 
        /*!
            ensures
                - returns the feature extractor used by this object
        !*/

        const matrix<double,0,1>& get_weights (
        ) const; 
        /*!
            ensures
                - returns the parameter vector (w) associated with this object.  The length
                  of the vector is get_feature_extractor().num_features().  
        !*/

    };

    template < typename feature_extractor >
    void serialize(const policy<feature_extractor>& item, std::ostream& out);
    template < typename feature_extractor >
    void deserialize(policy<feature_extractor>& item, std::istream& in);
    /*!
        provides serialization support.
    !*/

// ----------------------------------------------------------------------------------------


#endif // DLIB_APPROXIMATE_LINEAR_MODELS_ABSTRACT_Hh_
 
