// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ONE_VS_ALL_TRAiNER_H__
#define DLIB_ONE_VS_ALL_TRAiNER_H__

#include "one_vs_all_trainer_abstract.h"

#include "one_vs_all_decision_function.h"
#include <vector>

#include "multiclass_tools.h"

#include <sstream>
#include <iostream>

#include "../any.h"
#include <map>
#include <set>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename any_trainer,
        typename label_type_ = double
        >
    class one_vs_all_trainer
    {
    public:
        typedef label_type_ label_type;

        typedef typename any_trainer::sample_type sample_type;
        typedef typename any_trainer::scalar_type scalar_type;
        typedef typename any_trainer::mem_manager_type mem_manager_type;

        typedef one_vs_all_decision_function<one_vs_all_trainer> trained_function_type;

        one_vs_all_trainer (
        ) : 
            verbose(false)
        {}

        void set_trainer (
            const any_trainer& trainer
        )
        {
            default_trainer = trainer;
            trainers.clear();
        }

        void set_trainer (
            const any_trainer& trainer,
            const label_type& l
        )
        {
            trainers[l] = trainer;
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

        struct invalid_label : public dlib::error 
        { 
            invalid_label(const std::string& msg, const label_type& l_
                ) : dlib::error(msg), l(l_) {};

            virtual ~invalid_label(
            ) throw() {}

            label_type l;
        };

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type one_vs_all_trainer::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            const std::vector<label_type> distinct_labels = select_all_distinct_labels(all_labels);

            std::vector<scalar_type> labels;


            typename trained_function_type::binary_function_table dfs;

            for (unsigned long i = 0; i < distinct_labels.size(); ++i)
            {
                labels.clear();

                const label_type l = distinct_labels[i];

                // setup one of the one vs all training sets
                for (unsigned long k = 0; k < all_samples.size(); ++k)
                {
                    if (all_labels[k] == l)
                        labels.push_back(+1);
                    else 
                        labels.push_back(-1);
                }


                if (verbose)
                {
                    std::cout << "Training classifier for " << l << " vs. all" << std::endl;
                }

                // now train a binary classifier using the samples we selected
                const typename binary_function_table::const_iterator itr = trainers.find(l);

                if (itr != trainers.end())
                {
                    dfs[l] = itr->second.train(all_samples, labels);
                }
                else if (default_trainer.is_empty() == false)
                {
                    dfs[l] = default_trainer.train(all_samples, labels);
                }
                else
                {
                    std::ostringstream sout;
                    sout << "In one_vs_all_trainer, no trainer registered for the " << l << " label.";
                    throw invalid_label(sout.str(), l);
                }
            }

            return trained_function_type(dfs);
        }

    private:

        any_trainer default_trainer;

        typedef std::map<label_type, any_trainer> binary_function_table;
        binary_function_table trainers;

        bool verbose;

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ONE_VS_ALL_TRAiNER_H__


