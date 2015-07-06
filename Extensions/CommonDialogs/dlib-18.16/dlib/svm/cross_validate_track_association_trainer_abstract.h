// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_ABSTRACT_Hh_
#ifdef DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_ABSTRACT_Hh_

#include "structural_track_association_trainer_abstract.h"
#include "svm_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename track_association_function,
        typename detection_type,
        typename label_type
        >
    double test_track_association_function (
        const track_association_function& assoc,
        const std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > >& samples
    );
    /*!
        requires
            - is_track_association_problem(samples)
            - track_association_function == an instantiation of the dlib::track_association_function
              template or an object with a compatible interface.
        ensures
            - Tests assoc against the given samples and returns the fraction of detections
              which were correctly associated to their tracks.  That is, if assoc produces
              perfect tracks when used then this function returns a value of 1.  Similarly,
              if 5% of the detections were associated to the incorrect track then the
              return value is 0.05.
    !*/

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
    );
    /*!
        requires
            - is_track_association_problem(samples)
            - 1 < folds <= samples.size()
            - trainer_type == dlib::structural_track_association_trainer or an object with
              a compatible interface.
        ensures
            - Performs k-fold cross validation by using the given trainer to solve the
              given track association learning problem for the given number of folds.  Each
              fold is tested using the output of the trainer and the fraction of
              mis-associated detections is returned (i.e. this function returns the same
              measure of track association quality as test_track_association_function()).
            - The number of folds used is given by the folds argument.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_TRACK_ASSOCIATION_TrAINER_ABSTRACT_Hh_


