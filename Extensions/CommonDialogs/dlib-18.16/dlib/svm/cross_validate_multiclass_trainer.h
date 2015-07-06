// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CROSS_VALIDATE_MULTICLASS_TRaINER_Hh_
#define DLIB_CROSS_VALIDATE_MULTICLASS_TRaINER_Hh_

#include <vector>
#include "../matrix.h"
#include "cross_validate_multiclass_trainer_abstract.h"
#include <sstream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type,
        typename sample_type,
        typename label_type
        >
    const matrix<double> test_multiclass_decision_function (
        const dec_funct_type& dec_funct,
        const std::vector<sample_type>& x_test,
        const std::vector<label_type>& y_test
    )
    {

        // make sure requires clause is not broken
        DLIB_ASSERT( is_learning_problem(x_test,y_test) == true,
                    "\tmatrix test_multiclass_decision_function()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_learning_problem(x_test,y_test): " 
                    << is_learning_problem(x_test,y_test));


        const std::vector<label_type> all_labels = dec_funct.get_labels();

        // make a lookup table that maps from labels to their index in all_labels
        std::map<label_type,unsigned long> label_to_int;
        for (unsigned long i = 0; i < all_labels.size(); ++i)
            label_to_int[all_labels[i]] = i;

        matrix<double, 0, 0, typename dec_funct_type::mem_manager_type> res;
        res.set_size(all_labels.size(), all_labels.size());

        res = 0;

        typename std::map<label_type,unsigned long>::const_iterator iter;

        // now test this trained object 
        for (unsigned long i = 0; i < x_test.size(); ++i)
        {
            iter = label_to_int.find(y_test[i]);
            // ignore samples with labels that the decision function doesn't know about.
            if (iter == label_to_int.end())
                continue;

            const unsigned long truth = iter->second;
            const unsigned long pred  = label_to_int[dec_funct(x_test[i])];

            res(truth,pred) += 1;
        }

        return res;
    }

// ----------------------------------------------------------------------------------------

    class cross_validation_error : public dlib::error 
    { 
    public: 
        cross_validation_error(const std::string& msg) : dlib::error(msg){};
    };

    template <
        typename trainer_type,
        typename sample_type,
        typename label_type 
        >
    const matrix<double> cross_validate_multiclass_trainer (
        const trainer_type& trainer,
        const std::vector<sample_type>& x,
        const std::vector<label_type>& y,
        const long folds
    )
    {
        typedef typename trainer_type::mem_manager_type mem_manager_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_learning_problem(x,y) == true &&
                    1 < folds && folds <= static_cast<long>(x.size()),
            "\tmatrix cross_validate_multiclass_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.size(): " << x.size() 
            << "\n\t folds:  " << folds 
            << "\n\t is_learning_problem(x,y): " << is_learning_problem(x,y)
            );

        const std::vector<label_type> all_labels = select_all_distinct_labels(y);

        // count the number of times each label shows up 
        std::map<label_type,long> label_counts;
        for (unsigned long i = 0; i < y.size(); ++i)
            label_counts[y[i]] += 1;


        // figure out how many samples from each class will be in the test and train splits 
        std::map<label_type,long> num_in_test, num_in_train;
        for (typename std::map<label_type,long>::iterator i = label_counts.begin(); i != label_counts.end(); ++i)
        {
            const long in_test = i->second/folds;
            if (in_test == 0)
            {
                std::ostringstream sout;
                sout << "In dlib::cross_validate_multiclass_trainer(), the number of folds was larger" << std::endl;
                sout << "than the number of elements of one of the training classes." << std::endl;
                sout << "  folds: "<< folds << std::endl;
                sout << "  size of class " << i->first << ": "<< i->second << std::endl;
                throw cross_validation_error(sout.str());
            }
            num_in_test[i->first] = in_test; 
            num_in_train[i->first] = i->second - in_test;
        }



        std::vector<sample_type> x_test, x_train;
        std::vector<label_type> y_test, y_train;

        matrix<double, 0, 0, mem_manager_type> res;

        std::map<label_type,long> next_test_idx;
        for (unsigned long i = 0; i < all_labels.size(); ++i)
            next_test_idx[all_labels[i]] = 0;

        label_type label;

        for (long i = 0; i < folds; ++i)
        {
            x_test.clear();
            y_test.clear();
            x_train.clear();
            y_train.clear();

            // load up the test samples
            for (unsigned long j = 0; j < all_labels.size(); ++j)
            {
                label = all_labels[j];
                long next = next_test_idx[label];

                long cur = 0;
                const long num_needed = num_in_test[label];
                while (cur < num_needed)
                {
                    if (y[next] == label)
                    {
                        x_test.push_back(x[next]);
                        y_test.push_back(label);
                        ++cur;
                    }
                    next = (next + 1)%x.size();
                }

                next_test_idx[label] = next;
            }

            // load up the training samples
            for (unsigned long j = 0; j < all_labels.size(); ++j)
            {
                label = all_labels[j];
                long next = next_test_idx[label];

                long cur = 0;
                const long num_needed = num_in_train[label];
                while (cur < num_needed)
                {
                    if (y[next] == label)
                    {
                        x_train.push_back(x[next]);
                        y_train.push_back(label);
                        ++cur;
                    }
                    next = (next + 1)%x.size();
                }
            }


            try
            {
                // do the training and testing
                res += test_multiclass_decision_function(trainer.train(x_train,y_train),x_test,y_test);
            }
            catch (invalid_nu_error&)
            {
                // just ignore cases which result in an invalid nu
            }

        } // for (long i = 0; i < folds; ++i)

        return res;
    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_CROSS_VALIDATE_MULTICLASS_TRaINER_Hh_

