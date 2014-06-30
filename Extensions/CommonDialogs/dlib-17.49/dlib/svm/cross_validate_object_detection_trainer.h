// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_H__
#define DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_H__

#include "cross_validate_object_detection_trainer_abstract.h"
#include <vector>
#include "../matrix.h"
#include "svm.h"
#include "../geometry.h"
#include "../image_processing/full_object_detection.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline unsigned long number_of_truth_hits (
            const std::vector<full_object_detection>& truth_boxes,
            const std::vector<rectangle>& boxes,
            const double overlap_eps
        )
        /*!
            requires
                - 0 < overlap_eps <= 1
            ensures
                - returns the number of elements in truth_boxes which are overlapped by an 
                  element of boxes.  In this context, two boxes, A and B, overlap if and only if
                  the following quantity is greater than overlap_eps:
                    A.intersect(B).area()/(A+B).area()
                - No element of boxes is allowed to account for more than one element of truth_boxes.  
                - The returned number is in the range [0,truth_boxes.size()]
        !*/
        {
            if (boxes.size() == 0)
                return 0;

            unsigned long count = 0;
            std::vector<bool> used(boxes.size(),false);
            for (unsigned long i = 0; i < truth_boxes.size(); ++i)
            {
                unsigned long best_idx = 0;
                double best_overlap = 0;
                for (unsigned long j = 0; j < boxes.size(); ++j)
                {
                    if (used[j])
                        continue;

                    const double overlap = truth_boxes[i].get_rect().intersect(boxes[j]).area() / (double)(truth_boxes[i].get_rect()+boxes[j]).area();
                    if (overlap > best_overlap)
                    {
                        best_overlap = overlap;
                        best_idx = j;
                    }
                }

                if (best_overlap > overlap_eps && used[best_idx] == false)
                {
                    used[best_idx] = true;
                    ++count;
                }
            }

            return count;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,2> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const double overlap_eps = 0.5
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_learning_problem(images,truth_dets) == true &&
                     0 < overlap_eps && overlap_eps <= 1,
                    "\t matrix test_object_detection_function()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(images,truth_dets): " << is_learning_problem(images,truth_dets)
                    << "\n\t overlap_eps: "<< overlap_eps
                    );



        double correct_hits = 0;
        double total_hits = 0;
        double total_true_targets = 0;

        for (unsigned long i = 0; i < images.size(); ++i)
        {
            const std::vector<rectangle>& hits = detector(images[i]);

            total_hits += hits.size();
            correct_hits += impl::number_of_truth_hits(truth_dets[i], hits, overlap_eps);
            total_true_targets += truth_dets[i].size();
        }


        double precision, recall;

        if (total_hits == 0)
            precision = 1;
        else
            precision = correct_hits / total_hits;

        if (total_true_targets == 0)
            recall = 1;
        else
            recall = correct_hits / total_true_targets;

        matrix<double, 1, 2> res;
        res = precision, recall;
        return res;
    }

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,2> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const double overlap_eps = 0.5
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

        return test_object_detection_function(detector, images, rects, overlap_eps);
    }

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
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,2> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const long folds,
        const double overlap_eps = 0.5
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_learning_problem(images,truth_dets) == true &&
                     0 < overlap_eps && overlap_eps <= 1 &&
                     1 < folds && folds <= static_cast<long>(images.size()),
                    "\t matrix cross_validate_object_detection_trainer()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(images,truth_dets): " << is_learning_problem(images,truth_dets)
                    << "\n\t overlap_eps: "<< overlap_eps
                    << "\n\t folds: "<< folds
                    );

        double correct_hits = 0;
        double total_hits = 0;
        double total_true_targets = 0;

        const long test_size = images.size()/folds;

        unsigned long test_idx = 0;
        for (long iter = 0; iter < folds; ++iter)
        {
            std::vector<unsigned long> train_idx_set;
            std::vector<unsigned long> test_idx_set;

            for (long i = 0; i < test_size; ++i)
                test_idx_set.push_back(test_idx++);

            unsigned long train_idx = test_idx%images.size();
            std::vector<std::vector<full_object_detection> > training_rects;
            for (unsigned long i = 0; i < images.size()-test_size; ++i)
            {
                training_rects.push_back(truth_dets[train_idx]);
                train_idx_set.push_back(train_idx);
                train_idx = (train_idx+1)%images.size();
            }


            impl::array_subset_helper<image_array_type> array_subset(images, train_idx_set);
            typename trainer_type::trained_function_type detector = trainer.train(array_subset, training_rects);
            for (unsigned long i = 0; i < test_idx_set.size(); ++i)
            {
                const std::vector<rectangle>& hits = detector(images[test_idx_set[i]]);

                total_hits += hits.size();
                correct_hits += impl::number_of_truth_hits(truth_dets[test_idx_set[i]], hits, overlap_eps);
                total_true_targets += truth_dets[test_idx_set[i]].size();
            }

        }



        double precision, recall;

        if (total_hits == 0)
            precision = 1;
        else
            precision = correct_hits / total_hits;

        if (total_true_targets == 0)
            recall = 1;
        else
            recall = correct_hits / total_true_targets;

        matrix<double, 1, 2> res;
        res = precision, recall;
        return res;
    }

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,2> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const long folds,
        const double overlap_eps = 0.5
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

        return cross_validate_object_detection_trainer(trainer, images, dets, folds, overlap_eps);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_H__

