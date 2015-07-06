// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_Hh_
#define DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_Hh_

#include "cross_validate_object_detection_trainer_abstract.h"
#include <vector>
#include "../matrix.h"
#include "svm.h"
#include "../geometry.h"
#include "../image_processing/full_object_detection.h"
#include "../image_processing/box_overlap_testing.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline unsigned long number_of_truth_hits (
            const std::vector<full_object_detection>& truth_boxes,
            const std::vector<rectangle>& ignore,
            const std::vector<std::pair<double,rectangle> >& boxes,
            const test_box_overlap& overlap_tester,
            std::vector<std::pair<double,bool> >& all_dets,
            unsigned long& missing_detections 
        )
        /*!
            ensures
                - returns the number of elements in truth_boxes which are overlapped by an 
                  element of boxes.  In this context, two boxes, A and B, overlap if and only if
                  overlap_tester(A,B) == true.
                - No element of boxes is allowed to account for more than one element of truth_boxes.  
                - The returned number is in the range [0,truth_boxes.size()]
                - Adds the score for each box from boxes into all_dets and labels each with
                  a bool indicating if it hit a truth box.  Note that we skip boxes that
                  don't hit any truth boxes and match an ignore box.
                - Adds the number of truth boxes which didn't have any hits into
                  missing_detections.
        !*/
        {
            if (boxes.size() == 0)
            {
                missing_detections += truth_boxes.size();
                return 0;
            }

            unsigned long count = 0;
            std::vector<bool> used(boxes.size(),false);
            for (unsigned long i = 0; i < truth_boxes.size(); ++i)
            {
                bool found_match = false;
                // Find the first box that hits truth_boxes[i]
                for (unsigned long j = 0; j < boxes.size(); ++j)
                {
                    if (used[j])
                        continue;

                    if (overlap_tester(truth_boxes[i].get_rect(), boxes[j].second))
                    {
                        used[j] = true;
                        ++count;
                        found_match = true;
                        break;
                    }
                }

                if (!found_match)
                    ++missing_detections;
            }

            for (unsigned long i = 0; i < boxes.size(); ++i)
            {
                // only out put boxes if they match a truth box or are not ignored.
                if (used[i] || !overlaps_any_box(overlap_tester, ignore, boxes[i].second))
                {
                    all_dets.push_back(std::make_pair(boxes[i].first, used[i]));
                }
            }

            return count;
        }

    // ------------------------------------------------------------------------------------

    }

// ----------------------------------------------------------------------------------------

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( is_learning_problem(images,truth_dets) == true && 
                        ignore.size() == images.size(),
                    "\t matrix test_object_detection_function()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(images,truth_dets): " << is_learning_problem(images,truth_dets)
                    << "\n\t ignore.size(): " << ignore.size() 
                    << "\n\t images.size(): " << images.size() 
                    );



        double correct_hits = 0;
        double total_true_targets = 0;

        std::vector<std::pair<double,bool> > all_dets;
        unsigned long missing_detections = 0;


        for (unsigned long i = 0; i < images.size(); ++i)
        {
            std::vector<std::pair<double,rectangle> > hits; 
            detector(images[i], hits, adjust_threshold);

            correct_hits += impl::number_of_truth_hits(truth_dets[i], ignore[i], hits, overlap_tester, all_dets, missing_detections);
            total_true_targets += truth_dets[i].size();
        }

        std::sort(all_dets.rbegin(), all_dets.rend());

        double precision, recall;

        double total_hits = all_dets.size();

        if (total_hits == 0)
            precision = 1;
        else
            precision = correct_hits / total_hits;

        if (total_true_targets == 0)
            recall = 1;
        else
            recall = correct_hits / total_true_targets;

        matrix<double, 1, 3> res;
        res = precision, recall, average_precision(all_dets, missing_detections);
        return res;
    }

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        // convert into a list of regular rectangles.
        std::vector<std::vector<full_object_detection> > rects(truth_dets.size());
        for (unsigned long i = 0; i < truth_dets.size(); ++i)
        {
            for (unsigned long j = 0; j < truth_dets[i].size(); ++j)
            {
                rects[i].push_back(full_object_detection(truth_dets[i][j]));
            }
        }

        return test_object_detection_function(detector, images, rects, ignore, overlap_tester, adjust_threshold);
    }

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        std::vector<std::vector<rectangle> > ignore(images.size());
        return test_object_detection_function(detector,images,truth_dets,ignore, overlap_tester, adjust_threshold);
    }

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        std::vector<std::vector<rectangle> > ignore(images.size());
        return test_object_detection_function(detector,images,truth_dets,ignore, overlap_tester, adjust_threshold);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename array_type
            >
        struct array_subset_helper
        {
            typedef typename array_type::mem_manager_type mem_manager_type;

            array_subset_helper (
                const array_type& array_,
                const std::vector<unsigned long>& idx_set_
            ) :
                array(array_),
                idx_set(idx_set_)
            {
            }

            unsigned long size() const { return idx_set.size(); }

            typedef typename array_type::type type;
            const type& operator[] (
                unsigned long idx
            ) const { return array[idx_set[idx]]; }

        private:
            const array_type& array;
            const std::vector<unsigned long>& idx_set;
        };

        template <
            typename T 
            >
        const matrix_op<op_array_to_mat<array_subset_helper<T> > > mat (
            const array_subset_helper<T>& m 
        )
        {
            typedef op_array_to_mat<array_subset_helper<T> > op;
            return matrix_op<op>(op(m));
        }

    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( is_learning_problem(images,truth_dets) == true &&
                     ignore.size() == images.size() &&
                     1 < folds && folds <= static_cast<long>(images.size()),
                    "\t matrix cross_validate_object_detection_trainer()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(images,truth_dets): " << is_learning_problem(images,truth_dets)
                    << "\n\t folds: "<< folds
                    << "\n\t ignore.size(): " << ignore.size() 
                    << "\n\t images.size(): " << images.size() 
                    );

        double correct_hits = 0;
        double total_true_targets = 0;

        const long test_size = images.size()/folds;

        std::vector<std::pair<double,bool> > all_dets;
        unsigned long missing_detections = 0;
        unsigned long test_idx = 0;
        for (long iter = 0; iter < folds; ++iter)
        {
            std::vector<unsigned long> train_idx_set;
            std::vector<unsigned long> test_idx_set;

            for (long i = 0; i < test_size; ++i)
                test_idx_set.push_back(test_idx++);

            unsigned long train_idx = test_idx%images.size();
            std::vector<std::vector<full_object_detection> > training_rects;
            std::vector<std::vector<rectangle> > training_ignores;
            for (unsigned long i = 0; i < images.size()-test_size; ++i)
            {
                training_rects.push_back(truth_dets[train_idx]);
                training_ignores.push_back(ignore[train_idx]);
                train_idx_set.push_back(train_idx);
                train_idx = (train_idx+1)%images.size();
            }


            impl::array_subset_helper<image_array_type> array_subset(images, train_idx_set);
            typename trainer_type::trained_function_type detector = trainer.train(array_subset, training_rects, training_ignores, overlap_tester);
            for (unsigned long i = 0; i < test_idx_set.size(); ++i)
            {
                std::vector<std::pair<double,rectangle> > hits; 
                detector(images[test_idx_set[i]], hits, adjust_threshold);

                correct_hits += impl::number_of_truth_hits(truth_dets[test_idx_set[i]], ignore[i], hits, overlap_tester, all_dets, missing_detections);
                total_true_targets += truth_dets[test_idx_set[i]].size();
            }

        }

        std::sort(all_dets.rbegin(), all_dets.rend());


        double precision, recall;

        double total_hits = all_dets.size();

        if (total_hits == 0)
            precision = 1;
        else
            precision = correct_hits / total_hits;

        if (total_true_targets == 0)
            recall = 1;
        else
            recall = correct_hits / total_true_targets;

        matrix<double, 1, 3> res;
        res = precision, recall, average_precision(all_dets, missing_detections);
        return res;
    }

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        // convert into a list of regular rectangles.
        std::vector<std::vector<full_object_detection> > dets(truth_dets.size());
        for (unsigned long i = 0; i < truth_dets.size(); ++i)
        {
            for (unsigned long j = 0; j < truth_dets[i].size(); ++j)
            {
                dets[i].push_back(full_object_detection(truth_dets[i][j]));
            }
        }

        return cross_validate_object_detection_trainer(trainer, images, dets, ignore, folds, overlap_tester, adjust_threshold);
    }

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        const std::vector<std::vector<rectangle> > ignore(images.size());
        return cross_validate_object_detection_trainer(trainer,images,truth_dets,ignore,folds,overlap_tester,adjust_threshold);
    }

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    )
    {
        const std::vector<std::vector<rectangle> > ignore(images.size());
        return cross_validate_object_detection_trainer(trainer,images,truth_dets,ignore,folds,overlap_tester,adjust_threshold);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_Hh_

