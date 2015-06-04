// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TRACK_ASSOCiATION_FUNCTION_Hh_
#define DLIB_TRACK_ASSOCiATION_FUNCTION_Hh_


#include "track_association_function_abstract.h"
#include <vector>
#include <iostream>
#include "../algs.h"
#include "../serialize.h"
#include "assignment_function.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename detection_type
        > 
    class feature_extractor_track_association
    {
    public:
        typedef typename detection_type::track_type track_type;
        typedef typename track_type::feature_vector_type feature_vector_type;

        typedef detection_type lhs_element;
        typedef track_type rhs_element;

        feature_extractor_track_association() : num_dims(0), num_nonnegative(0) {}

        explicit feature_extractor_track_association (
            unsigned long num_dims_,
            unsigned long num_nonnegative_
        ) : num_dims(num_dims_), num_nonnegative(num_nonnegative_) {}

        unsigned long num_features(
        ) const { return num_dims; }

        unsigned long num_nonnegative_weights (
        ) const { return num_nonnegative; }

        void get_features (
            const detection_type& det,
            const track_type& track,
            feature_vector_type& feats
        ) const
        {
            track.get_similarity_features(det, feats);
        }

        friend void serialize (const feature_extractor_track_association& item, std::ostream& out) 
        { 
            serialize(item.num_dims, out);
            serialize(item.num_nonnegative, out);
        }

        friend void deserialize (feature_extractor_track_association& item, std::istream& in) 
        {
            deserialize(item.num_dims, in);
            deserialize(item.num_nonnegative, in);
        }

    private:
        unsigned long num_dims;
        unsigned long num_nonnegative;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename detection_type_
        >
    class track_association_function
    {
    public:

        typedef detection_type_ detection_type;
        typedef typename detection_type::track_type track_type;
        typedef assignment_function<feature_extractor_track_association<detection_type> > association_function_type;

        track_association_function() {}

        track_association_function (
            const association_function_type& assoc_
        ) : assoc(assoc_)
        {
        }

        const association_function_type& get_assignment_function (
        ) const
        {
            return assoc;
        }

        void operator() (
            std::vector<track_type>& tracks,
            const std::vector<detection_type>& dets
        ) const
        {
            std::vector<long> assignments = assoc(dets, tracks);
            std::vector<bool> updated_track(tracks.size(), false);
            // now update all the tracks with the detections that associated to them.
            for (unsigned long i = 0; i < assignments.size(); ++i)
            {
                if (assignments[i] != -1)
                {
                    tracks[assignments[i]].update_track(dets[i]);
                    updated_track[assignments[i]] = true;
                }
                else
                {
                    track_type new_track;
                    new_track.update_track(dets[i]);
                    tracks.push_back(new_track);
                }
            }

            // Now propagate all the tracks that didn't get any detections.
            for (unsigned long i = 0; i < updated_track.size(); ++i)
            {
                if (!updated_track[i])
                    tracks[i].propagate_track();
            }
        }

        friend void serialize (const track_association_function& item, std::ostream& out)
        {
            int version = 1;
            serialize(version, out);
            serialize(item.assoc, out);
        }
        friend void deserialize (track_association_function& item, std::istream& in)
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw serialization_error("Unexpected version found while deserializing dlib::track_association_function.");

            deserialize(item.assoc, in);
        }

    private:

        assignment_function<feature_extractor_track_association<detection_type> > assoc;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TRACK_ASSOCiATION_FUNCTION_Hh_

