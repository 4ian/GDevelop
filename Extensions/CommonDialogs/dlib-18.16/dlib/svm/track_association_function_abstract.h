// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_TRACK_ASSOCiATION_FUNCTION_ABSTRACT_Hh_
#ifdef DLIB_TRACK_ASSOCiATION_FUNCTION_ABSTRACT_Hh_

#include <vector>
#include "assignment_function_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class example_detection
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a detection must implement if it is to be
                used with the track_association_function defined at the bottom of this
                file.  In this case, the interface is very simple.  A detection object is
                only required to define the track_type typedef and it must also be possible
                to store detection objects in a std::vector.
        !*/

    public:
        // Each detection object should be designed to work with a specific track object.
        // This typedef lets us determine which track type is meant for use with this
        // detection object.
        typedef class example_track track_type;

    };

// ----------------------------------------------------------------------------------------

    class example_track
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a track must implement if it is to be
                used with the track_association_function defined at the bottom of this
                file.   
        !*/

    public:
        // This type should be a dlib::matrix capable of storing column vectors or an
        // unsorted sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.
        typedef matrix_or_sparse_vector_type feature_vector_type;

        example_track(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void get_similarity_features (
            const example_detection& det,
            feature_vector_type& feats
        ) const;
        /*!
            requires
                - update_track() has been called on this track at least once.
            ensures
                - #feats == A feature vector that contains information describing how
                  likely it is that det is a detection from the object corresponding to
                  this track.  That is, the feature vector should contain information that
                  lets someone decide if det should be associated to this track.
                - #feats.size() must be a constant.  That is, every time we call
                  get_similarity_features() it must output a feature vector of the same
                  dimensionality.
        !*/

        void update_track (
            const example_detection& det
        );
        /*!
            ensures
                - Updates this track with the given detection assuming that det is the most
                  current observation of the object under track. 
        !*/

        void propagate_track (
        );
        /*!
            ensures
                - propagates this track forward in time one time step.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename detection_type
        > 
    class feature_extractor_track_association
    {
        /*!
            REQUIREMENTS ON detection_type
                It must be an object that implements an interface compatible with the
                example_detection discussed above.  This also means that detection_type::track_type 
                must be an object that implements an interface compatible with example_track 
                defined above.

            WHAT THIS OBJECT REPRESENTS 
                This object is an adapter that converts from the detection/track style
                interface defined above to the feature extraction interface required by the
                association rule learning tools in dlib.  Specifically, it converts the
                detection/track interface into a form usable by the assignment_function and
                its trainer object structural_assignment_trainer.
        !*/

    public:
        typedef typename detection_type::track_type track_type;
        typedef typename track_type::feature_vector_type feature_vector_type;
        typedef detection_type lhs_element;
        typedef track_type rhs_element;

        unsigned long num_features(
        ) const; 
        /*!
            ensures
                - returns the dimensionality of the feature vectors produced by get_features().
        !*/

        void get_features (
            const detection_type& det,
            const track_type& track,
            feature_vector_type& feats
        ) const;
        /*!
            ensures
                - performs: track.get_similarity_features(det, feats);
        !*/
    };

    template <
        typename detection_type
        > 
    void serialize (
        const feature_extractor_track_association<detection_type>& item, 
        std::ostream& out
    );
    /*!
        Provides serialization support.
    !*/

    template <
        typename detection_type
        > 
    void deserialize (
        feature_extractor_track_association<detection_type>& item,
        std::istream& in
    );
    /*!
        Provides deserialization support.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename detection_type_
        >
    class track_association_function
    {
        /*!
            REQUIREMENTS ON detection_type
                It must be an object that implements an interface compatible with the
                example_detection discussed above.  This also means that detection_type::track_type 
                must be an object that implements an interface compatible with example_track 
                defined above.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool that helps you implement an object tracker.  So for
                example, if you wanted to track people moving around in a video then this
                object can help.  In particular, imagine you have a tool for detecting the
                positions of each person in an image.  Then you can run this person
                detector on the video and at each time step, i.e. at each frame, you get a
                set of person detections.  However, that by itself doesn't tell you how
                many people there are in the video and where they are moving to and from.
                To get that information you need to figure out which detections match each
                other from frame to frame.  This is where the track_association_function
                comes in.  It performs the detection to track association.  It will also do
                some of the track management tasks like creating a new track when a
                detection doesn't match any of the existing tracks.

                Internally, this object is implemented using the assignment_function object.  
                In fact, it's really just a thin wrapper around assignment_function and
                exists just to provide a more convenient interface to users doing detection
                to track association.   
        !*/
    public:

        typedef detection_type_ detection_type;
        typedef typename detection_type::track_type track_type;
        typedef assignment_function<feature_extractor_track_association<detection_type> > association_function_type;

        track_association_function(
        );
        /*!
            ensures
                - #get_assignment_function() will be default initialized.
        !*/

        track_association_function (
            const association_function_type& assoc
        ); 
        /*!
            ensures
                - #get_assignment_function() == assoc
        !*/

        const association_function_type& get_assignment_function (
        ) const;
        /*!
            ensures
                - returns the assignment_function used by this object to assign detections
                  to tracks.
        !*/

        void operator() (
            std::vector<track_type>& tracks,
            const std::vector<detection_type>& dets
        ) const;
        /*!
            ensures
                - This function uses get_assignment_function() to assign each detection
                  in dets to its appropriate track in tracks.  Then each track which
                  associates to a detection is updated by calling update_track() with the
                  associated detection.  
                - Detections that don't associate with any of the elements of tracks will
                  spawn new tracks.  For each unassociated detection, this is done by
                  creating a new track_type object, calling update_track() on it with the
                  new detection, and then adding the new track into tracks.
                - Tracks that don't have a detection associate to them are propagated
                  forward in time by calling propagate_track() on them.  That is, we call
                  propagate_track() only on tracks that do not get associated with a
                  detection.
        !*/
    };

    template <
        typename detection_type
        > 
    void serialize (
        const track_association_function<detection_type>& item,
        std::ostream& out
    );
    /*!
        Provides serialization support.
    !*/

    template <
        typename detection_type
        > 
    void deserialize (
        track_association_function<detection_type>& item, 
        std::istream& in
    );
    /*!
        Provides deserialization support.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TRACK_ASSOCiATION_FUNCTION_ABSTRACT_Hh_


