// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_TRACK_ASSOCIATION_TRAnER_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_TRACK_ASSOCIATION_TRAnER_ABSTRACT_Hh_

#include "track_association_function_abstract.h"
#include "structural_assignment_trainer_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class structural_track_association_trainer
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning to solve a track association problem.  That 
                is, it takes in a set of training data and outputs a track_association_function 
                you can use to do detection to track association.  The training data takes the
                form of a set or sets of "track histories".  Each track history is a
                std::vector where each element contains all the detections from a single time
                step.  Moreover, each detection has a label that uniquely identifies which
                object (e.g. person or whatever) the detection really corresponds to.  That is,
                the labels indicate the correct detection to track associations.  The goal of
                this object is then to produce a track_association_function that can perform a
                correct detection to track association at each time step.
        !*/

    public:

        structural_track_association_trainer (
        );  
        /*!
            ensures
                - #get_c() == 100
                - this object isn't verbose
                - #get_epsilon() == 0.001
                - #get_num_threads() == 2
                - #get_max_cache_size() == 5
                - #learns_nonnegative_weights() == false
                - #get_loss_per_track_break() == 1
                - #get_loss_per_false_association() == 1
        !*/

        void set_num_threads (
            unsigned long num
        );
        /*!
            ensures
                - #get_num_threads() == num
        !*/

        unsigned long get_num_threads (
        ) const;
        /*!
            ensures
                - returns the number of threads used during training.  You should 
                  usually set this equal to the number of processing cores on your
                  machine.
        !*/

        void set_epsilon (
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        double get_epsilon (
        ) const; 
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer to
                  train.  You can think of this epsilon value as saying "solve the
                  optimization problem until the average number of association mistakes per
                  time step is within epsilon of its optimal value".
        !*/

        void set_max_cache_size (
            unsigned long max_size
        );
        /*!
            ensures
                - #get_max_cache_size() == max_size
        !*/

        unsigned long get_max_cache_size (
        ) const;
        /*!
            ensures
                - During training, this object basically runs the track_association_function on 
                  each training sample, over and over.  To speed this up, it is possible to 
                  cache the results of these invocations.  This function returns the number 
                  of cache elements per training sample kept in the cache.  Note that a value 
                  of 0 means caching is not used at all.  
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a user can
                  observe the progress of the algorithm.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        void set_loss_per_false_association (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_false_association() == loss
        !*/

        double get_loss_per_false_association (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for assigning a detection to the
                  wrong track.  If you care more about avoiding false associations than
                  avoiding track breaks then you can increase this value.
        !*/

        void set_loss_per_track_break (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_track_break() == loss
        !*/

        double get_loss_per_track_break (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for incorrectly assigning a
                  detection to a new track instead of assigning it to its existing track.
                  If you care more about avoiding track breaks than avoiding things like
                  track swaps then you can increase this value.
        !*/

        void set_oca (
            const oca& item
        );
        /*!
            ensures
                - #get_oca() == item 
        !*/

        const oca get_oca (
        ) const;
        /*!
            ensures
                - Internally this object treats track association learning as a structural
                  SVM problem.  This routine returns a copy of the optimizer used to solve
                  the structural SVM problem.  
        !*/

        void set_c (
            double C
        );
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter that
                  determines the trade-off between trying to fit the training data (i.e.
                  minimize the loss) or allowing more errors but hopefully improving the
                  generalization of the resulting track_association_function.  Larger
                  values encourage exact fitting while smaller values of C may encourage
                  better generalization. 
        !*/

        double get_c (
        ) const;
        /*!
            requires
                - C > 0
            ensures
                - #get_c() = C
        !*/

        bool learns_nonnegative_weights (
        ) const; 
        /*!
            ensures
                - Ultimately, the output of training is a parameter vector that defines the
                  behavior of the track_association_function.  If
                  learns_nonnegative_weights() == true then the resulting learned parameter
                  vector will always have non-negative entries.
        !*/
       
        void set_learns_nonnegative_weights (
            bool value
        );
        /*!
            ensures
                - #learns_nonnegative_weights() == value
        !*/

        template <
            typename detection_type,
            typename label_type
            >
        const track_association_function<detection_type> train (  
            const std::vector<std::vector<labeled_detection<detection_type,label_type> > >& sample
        ) const;
        /*!
            requires
                - is_track_association_problem(sample) == true
            ensures
                - This function attempts to learn to do track association from the given
                  training data.  Note that we interpret sample as a single track history such
                  that sample[0] are all detections from the first time step, then sample[1]
                  are detections from the second time step, and so on.  
                - returns a function F such that:
                    - Executing F(tracks, detections) will try to correctly associate the
                      contents of detections to the contents of tracks and perform track
                      updating and creation.
                    - if (learns_nonnegative_weights() == true) then
                        - min(F.get_assignment_function().get_weights()) >= 0
        !*/

        template <
            typename detection_type,
            typename label_type
            >
        const track_association_function<detection_type> train (  
            const std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > >& sample
        ) const;
        /*!
            requires
                - is_track_association_problem(samples) == true
            ensures
                - This function attempts to learn to do track association from the given
                  training data.  In this case, we take a set of track histories as
                  training data instead of just one track history as with the above train()
                  method.
                - returns a function F such that:
                    - Executing F(tracks, detections) will try to correctly associate the
                      contents of detections to the contents of tracks and perform track
                      updating and creation.
                    - if (learns_nonnegative_weights() == true) then
                        - min(F.get_assignment_function().get_weights()) >= 0
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_TRACK_ASSOCIATION_TRAnER_ABSTRACT_Hh_


