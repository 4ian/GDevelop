// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_Hh_
#define DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_Hh_

#include "cross_validate_track_association_trainer_abstract.h"
#include "structural_track_association_trainer.h"

namespace dlib
{
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename track_association_function,
            typename detection_type,
            typename label_type
            >
        void test_track_association_function (
            const track_association_function& assoc,
            const std::vector<std::vector<labeled_detection<detection_type,label_type> > >& samples,
            unsigned long& total_dets,
            unsigned long& correctly_associated_dets
        )
        {
            const typename track_association_function::association_function_type& f = assoc.get_assignment_function();

            typedef typename detection_type::track_type track_type;
            using namespace impl;

            dlib::rand rnd;
            std::vector<track_type> tracks;
            std::map<label_type,long> track_idx; // tracks[track_idx[id]] == track with ID id.

            for (unsigned long j = 0; j < samples.size(); ++j)
            {
                std::vector<labeled_detection<detection_type,label_type> > dets = samples[j];
                // Shuffle the order of the detections so we can be sure that there isn't
                // anything funny going on like the detections always coming in the same
                // order relative to their labels and the association function just gets
                // lucky by picking the same assignment ordering every time.  So this way
                // we know the assignment function really is doing something rather than
                // just being lucky.
                randomize_samples(dets, rnd);

                total_dets += dets.size();
                std::vector<long> assignments = f(get_unlabeled_dets(dets), tracks);
                std::vector<bool> updated_track(tracks.size(), false);
                // now update all the tracks with the detections that associated to them.
                for (unsigned long k = 0; k < assignments.size(); ++k)
                {
                    // If the detection is associated to tracks[assignments[k]]
                    if (assignments[k] != -1)
                    {
                        tracks[assignments[k]].update_track(dets[k].det);
                        updated_track[assignments[k]] = true;

                        // if this detection was supposed to go to this track
                        if (track_idx.count(dets[k].label) && track_idx[dets[k].label]==assignments[k])
                            ++correctly_associated_dets;

                        track_idx[dets[k].label] = assignments[k];
                    }
                    else
                    {
                        track_type new_track;
                        new_track.update_track(dets[k].det);
                        tracks.push_back(new_track);

                        // if this detection was supposed to go to a new track
                        if (track_idx.count(dets[k].label) == 0)
                            ++correctly_associated_dets;

                        track_idx[dets[k].label] = tracks.size()-1;
                    }
                }

                // Now propagate all the tracks that didn't get any detections.
                for (unsigned long k = 0; k < updated_track.size(); ++k)
                {
                    if (!updated_track[k])
                        tracks[k].propagate_track();
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename track_association_function,
        typename detection_type,
        typename label_type
        >
    double test_track_association_function (
        const track_association_function& assoc,
        const std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > >& samples
    )
    {
        unsigned long total_dets = 0;
        unsigned long correctly_associated_dets = 0;

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            impl::test_track_association_function(assoc, samples[i], total_dets, correctly_associated_dets);
        }

        return (double)correctly_associated_dets/(double)total_dets;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename detection_type,
        typename label_type
        >
    double cross_validate_track_association_trainer (
        const trainer_type& trainer,
        const std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > >& samples,
        const long folds
    )
    {
        const long num_in_test  = samples.size()/folds;
        const long num_in_train = samples.size() - num_in_test;

        std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > > samples_train;

        long next_test_idx = 0;
        unsigned long total_dets = 0;
        unsigned long correctly_associated_dets = 0;

        for (long i = 0; i < folds; ++i)
        {
            samples_train.clear();

            // load up the training samples
            long next = (next_test_idx + num_in_test)%samples.size();
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                samples_train.push_back(samples[next]);
                next = (next + 1)%samples.size();
            }

            const track_association_function<detection_type>& df = trainer.train(samples_train);
            for (long cnt = 0; cnt < num_in_test; ++cnt)
            {
                impl::test_track_association_function(df, samples[next_test_idx], total_dets, correctly_associated_dets);
                next_test_idx = (next_test_idx + 1)%samples.size();
            }
        }

        return (double)correctly_associated_dets/(double)total_dets;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_Hh_


