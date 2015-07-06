// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_OBJECT_DETECTION_TRAiNER_Hh_
#define DLIB_STRUCTURAL_OBJECT_DETECTION_TRAiNER_Hh_

#include "structural_object_detection_trainer_abstract.h"
#include "../algs.h"
#include "../optimization.h"
#include "structural_svm_object_detection_problem.h"
#include "../image_processing/object_detector.h"
#include "../image_processing/box_overlap_testing.h"
#include "../image_processing/full_object_detection.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type,
        typename svm_struct_prob_type
        >
    void configure_nuclear_norm_regularizer (
        const image_scanner_type&,
        svm_struct_prob_type& 
    )
    { 
        // does nothing by default.  Specific scanner types overload this function to do
        // whatever is appropriate.
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    class structural_object_detection_trainer : noncopyable
    {

    public:
        typedef double scalar_type;
        typedef default_memory_manager mem_manager_type;
        typedef object_detector<image_scanner_type> trained_function_type;


        explicit structural_object_detection_trainer (
            const image_scanner_type& scanner_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(scanner_.get_num_detection_templates() > 0,
                "\t structural_object_detection_trainer::structural_object_detection_trainer(scanner_)"
                << "\n\t You can't have zero detection templates"
                << "\n\t this: " << this
                );

            C = 1;
            verbose = false;
            eps = 0.1;
            num_threads = 2;
            max_cache_size = 5;
            match_eps = 0.5;
            loss_per_missed_target = 1;
            loss_per_false_alarm = 1;

            scanner.copy_configuration(scanner_);

            auto_overlap_tester = true;
        }

        const image_scanner_type& get_scanner (
        ) const
        {
            return scanner;
        }

        bool auto_set_overlap_tester (
        ) const 
        { 
            return auto_overlap_tester; 
        }

        void set_overlap_tester (
            const test_box_overlap& tester
        )
        {
            overlap_tester = tester;
            auto_overlap_tester = false;
        }

        test_box_overlap get_overlap_tester (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(auto_set_overlap_tester() == false,
                "\t test_box_overlap structural_object_detection_trainer::get_overlap_tester()"
                << "\n\t You can't call this function if the overlap tester is generated dynamically."
                << "\n\t this: " << this
                );

            return overlap_tester;
        }

        void set_num_threads (
            unsigned long num
        )
        {
            num_threads = num;
        }

        unsigned long get_num_threads (
        ) const
        {
            return num_threads;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_object_detection_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        scalar_type get_epsilon (
        ) const { return eps; }

        void set_max_cache_size (
            unsigned long max_size
        )
        {
            max_cache_size = max_size;
        }

        unsigned long get_max_cache_size (
        ) const
        {
            return max_cache_size; 
        }

        void be_verbose (
        )
        {
            verbose = true;
        }

        void be_quiet (
        )
        {
            verbose = false;
        }

        void set_oca (
            const oca& item
        )
        {
            solver = item;
        }

        const oca get_oca (
        ) const
        {
            return solver;
        }

        void set_c (
            scalar_type C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void structural_object_detection_trainer::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        scalar_type get_c (
        ) const
        {
            return C;
        }

        void set_match_eps (
            double eps
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < eps && eps < 1, 
                "\t void structural_object_detection_trainer::set_match_eps(eps)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t eps:  " << eps 
                << "\n\t this: " << this
                );

            match_eps = eps;
        }

        double get_match_eps (
        ) const
        {
            return match_eps;
        }

        double get_loss_per_missed_target (
        ) const
        {
            return loss_per_missed_target;
        }

        void set_loss_per_missed_target (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss > 0, 
                "\t void structural_object_detection_trainer::set_loss_per_missed_target(loss)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t loss: " << loss
                << "\n\t this: " << this
                );

            loss_per_missed_target = loss;
        }

        double get_loss_per_false_alarm (
        ) const
        {
            return loss_per_false_alarm;
        }

        void set_loss_per_false_alarm (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss > 0, 
                "\t void structural_object_detection_trainer::set_loss_per_false_alarm(loss)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t loss: " << loss
                << "\n\t this: " << this
                );

            loss_per_false_alarm = loss;
        }

        template <
            typename image_array_type
            >
        const trained_function_type train (
            const image_array_type& images,
            const std::vector<std::vector<full_object_detection> >& truth_object_detections
        ) const
        {
            std::vector<std::vector<rectangle> > empty_ignore(images.size());
            return train_impl(images, truth_object_detections, empty_ignore, test_box_overlap());
        }

        template <
            typename image_array_type
            >
        const trained_function_type train (
            const image_array_type& images,
            const std::vector<std::vector<full_object_detection> >& truth_object_detections,
            const std::vector<std::vector<rectangle> >& ignore,
            const test_box_overlap& ignore_overlap_tester = test_box_overlap()
        ) const
        {
            return train_impl(images, truth_object_detections, ignore, ignore_overlap_tester);
        }

        template <
            typename image_array_type
            >
        const trained_function_type train (
            const image_array_type& images,
            const std::vector<std::vector<rectangle> >& truth_object_detections
        ) const
        {
            std::vector<std::vector<rectangle> > empty_ignore(images.size());
            return train(images, truth_object_detections, empty_ignore, test_box_overlap());
        }

        template <
            typename image_array_type
            >
        const trained_function_type train (
            const image_array_type& images,
            const std::vector<std::vector<rectangle> >& truth_object_detections,
            const std::vector<std::vector<rectangle> >& ignore,
            const test_box_overlap& ignore_overlap_tester = test_box_overlap()
        ) const
        {
            std::vector<std::vector<full_object_detection> > truth_dets(truth_object_detections.size());
            for (unsigned long i = 0; i < truth_object_detections.size(); ++i)
            {
                for (unsigned long j = 0; j < truth_object_detections[i].size(); ++j)
                {
                    truth_dets[i].push_back(full_object_detection(truth_object_detections[i][j]));
                }
            }

            return train_impl(images, truth_dets, ignore, ignore_overlap_tester);
        }

    private:

        template <
            typename image_array_type
            >
        const trained_function_type train_impl (
            const image_array_type& images,
            const std::vector<std::vector<full_object_detection> >& truth_object_detections,
            const std::vector<std::vector<rectangle> >& ignore,
            const test_box_overlap& ignore_overlap_tester
        ) const
        {
#ifdef ENABLE_ASSERTS
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(images,truth_object_detections) == true && images.size() == ignore.size(),
                "\t trained_function_type structural_object_detection_trainer::train()"
                << "\n\t invalid inputs were given to this function"
                << "\n\t images.size():      " << images.size()
                << "\n\t ignore.size():      " << ignore.size()
                << "\n\t truth_object_detections.size(): " << truth_object_detections.size()
                << "\n\t is_learning_problem(images,truth_object_detections): " << is_learning_problem(images,truth_object_detections)
                );
            for (unsigned long i = 0; i < truth_object_detections.size(); ++i)
            {
                for (unsigned long j = 0; j < truth_object_detections[i].size(); ++j)
                {
                    DLIB_ASSERT(truth_object_detections[i][j].num_parts() == get_scanner().get_num_movable_components_per_detection_template() &&
                                all_parts_in_rect(truth_object_detections[i][j]) == true,
                        "\t trained_function_type structural_object_detection_trainer::train()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t truth_object_detections["<<i<<"]["<<j<<"].num_parts():                " << 
                            truth_object_detections[i][j].num_parts()
                        << "\n\t get_scanner().get_num_movable_components_per_detection_template(): " << 
                            get_scanner().get_num_movable_components_per_detection_template()
                        << "\n\t all_parts_in_rect(truth_object_detections["<<i<<"]["<<j<<"]): " << all_parts_in_rect(truth_object_detections[i][j])
                    );
                }
            }
#endif

            structural_svm_object_detection_problem<image_scanner_type,image_array_type > 
                svm_prob(scanner, overlap_tester, auto_overlap_tester, images,
                    truth_object_detections, ignore, ignore_overlap_tester, num_threads);

            if (verbose)
                svm_prob.be_verbose();

            svm_prob.set_c(C);
            svm_prob.set_epsilon(eps);
            svm_prob.set_max_cache_size(max_cache_size);
            svm_prob.set_match_eps(match_eps);
            svm_prob.set_loss_per_missed_target(loss_per_missed_target);
            svm_prob.set_loss_per_false_alarm(loss_per_false_alarm);
            configure_nuclear_norm_regularizer(scanner, svm_prob);
            matrix<double,0,1> w;

            // Run the optimizer to find the optimal w.
            solver(svm_prob,w);

            // report the results of the training.
            return object_detector<image_scanner_type>(scanner, svm_prob.get_overlap_tester(), w);
        }

        image_scanner_type scanner;
        test_box_overlap overlap_tester;

        double C;
        oca solver;
        double eps;
        double match_eps;
        bool verbose;
        unsigned long num_threads;
        unsigned long max_cache_size;
        double loss_per_missed_target;
        double loss_per_false_alarm;
        bool auto_overlap_tester;

    }; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_OBJECT_DETECTION_TRAiNER_Hh_


