// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ROC_TRAINEr_H_
#define DLIB_ROC_TRAINEr_H_

#include "roc_trainer_abstract.h"
#include "../algs.h"
#include <limits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class roc_trainer_type
    {
    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        roc_trainer_type (
        ) : desired_accuracy(0), class_selection(0){}

        roc_trainer_type (
            const trainer_type& trainer_,
            const scalar_type& desired_accuracy_,
            const scalar_type& class_selection_
        ) : trainer(trainer_), desired_accuracy(desired_accuracy_), class_selection(class_selection_) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 <= desired_accuracy && desired_accuracy <= 1 &&
                         (class_selection == -1 || class_selection == +1), 
                        "\t roc_trainer_type::roc_trainer_type()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t desired_accuracy: " << desired_accuracy 
                        << "\n\t class_selection:  " << class_selection 
                        );
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const trained_function_type train (
            const in_sample_vector_type& samples,
            const in_scalar_vector_type& labels
        ) const 
        /*!
            requires
                - is_binary_classification_problem(samples, labels) == true
        !*/
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(samples, labels), 
                        "\t roc_trainer_type::train()"
                        << "\n\t invalid inputs were given to this function"
                        );


            return do_train(vector_to_matrix(samples), vector_to_matrix(labels));
        }

    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const trained_function_type do_train (
            const in_sample_vector_type& samples,
            const in_scalar_vector_type& labels
        ) const 
        { 
            trained_function_type df = trainer.train(samples, labels);

            // clear out the old bias
            df.b = 0;

            // obtain all the scores from the df using all the class_selection labeled samples
            std::vector<double> scores;
            for (long i = 0; i < samples.size(); ++i)
            {
                if (labels(i) == class_selection)
                    scores.push_back(df(samples(i)));
            }

            if (class_selection == +1)
                std::sort(scores.rbegin(), scores.rend());
            else
                std::sort(scores.begin(), scores.end());

            // now pick out the index that gives us the desired accuracy with regards to selected class 
            unsigned long idx = static_cast<unsigned long>(desired_accuracy*scores.size() + 0.5);
            if (idx >= scores.size())
                idx = scores.size()-1;

            df.b = scores[idx];

            // In this case add a very small extra amount to the bias so that all the samples
            // with the class_selection label are classified correctly.
            if (desired_accuracy == 1)
            {
                if (class_selection == +1)
                    df.b -= std::numeric_limits<scalar_type>::epsilon()*df.b;
                else
                    df.b += std::numeric_limits<scalar_type>::epsilon()*df.b;
            }

            return df;
        }

        trainer_type trainer;
        scalar_type desired_accuracy;
        scalar_type class_selection;
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const roc_trainer_type<trainer_type> roc_c1_trainer (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type& desired_accuracy
    ) { return roc_trainer_type<trainer_type>(trainer, desired_accuracy, +1); }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const roc_trainer_type<trainer_type> roc_c2_trainer (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type& desired_accuracy
    ) { return roc_trainer_type<trainer_type>(trainer, desired_accuracy, -1); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ROC_TRAINEr_H_


