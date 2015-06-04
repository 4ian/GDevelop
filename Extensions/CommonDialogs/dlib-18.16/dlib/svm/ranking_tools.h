// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RANKING_ToOLS_Hh_
#define DLIB_RANKING_ToOLS_Hh_

#include "ranking_tools_abstract.h"

#include "../algs.h"
#include "../matrix.h"
#include <vector>
#include <utility>
#include <algorithm>
#include "sparse_vector.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct ranking_pair
    {
        ranking_pair() {}

        ranking_pair(
            const std::vector<T>& r, 
            const std::vector<T>& nr
        ) :
            relevant(r), nonrelevant(nr) 
        {}

        std::vector<T> relevant;
        std::vector<T> nonrelevant;
    };

    template <
        typename T
        >
    void serialize (
        const ranking_pair<T>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.relevant, out);
        serialize(item.nonrelevant, out);
    }


    template <
        typename T
        >
    void deserialize (
        ranking_pair<T>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw dlib::serialization_error("Wrong version found while deserializing dlib::ranking_pair");

        deserialize(item.relevant, in);
        deserialize(item.nonrelevant, in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename disable_if<is_matrix<T>,bool>::type is_ranking_problem (
        const std::vector<ranking_pair<T> >& samples
    )
    {
        if (samples.size() == 0)
            return false;


        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            if (samples[i].relevant.size() == 0)
                return false;
            if (samples[i].nonrelevant.size() == 0)
                return false;
        }

        return true;
    }

    template <
        typename T
        >
    typename enable_if<is_matrix<T>,bool>::type is_ranking_problem (
        const std::vector<ranking_pair<T> >& samples
    )
    {
        if (samples.size() == 0)
            return false;


        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            if (samples[i].relevant.size() == 0)
                return false;
            if (samples[i].nonrelevant.size() == 0)
                return false;
        }

        // If these are dense vectors then they must all have the same dimensionality.
        const long dims = max_index_plus_one(samples[0].relevant);
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            for (unsigned long j = 0; j < samples[i].relevant.size(); ++j)
            {
                if (is_vector(samples[i].relevant[j]) == false)
                    return false;

                if (samples[i].relevant[j].size() != dims)
                    return false;
            }
            for (unsigned long j = 0; j < samples[i].nonrelevant.size(); ++j)
            {
                if (is_vector(samples[i].nonrelevant[j]) == false)
                    return false;

                if (samples[i].nonrelevant[j].size() != dims)
                    return false;
            }
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    unsigned long max_index_plus_one (
        const ranking_pair<T>& item
    )
    {
        return std::max(max_index_plus_one(item.relevant), max_index_plus_one(item.nonrelevant));
    }

    template <
        typename T
        >
    unsigned long max_index_plus_one (
        const std::vector<ranking_pair<T> >& samples
    )
    {
        unsigned long dims = 0;
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            dims = std::max(dims, max_index_plus_one(samples[i]));
        }
        return dims;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void count_ranking_inversions (
        const std::vector<T>& x,
        const std::vector<T>& y,
        std::vector<unsigned long>& x_count,
        std::vector<unsigned long>& y_count
    )
    {
        x_count.assign(x.size(),0);
        y_count.assign(y.size(),0);

        if (x.size() == 0 || y.size() == 0)
            return;

        std::vector<std::pair<T,unsigned long> > xsort(x.size());
        std::vector<std::pair<T,unsigned long> > ysort(y.size());
        for (unsigned long i = 0; i < x.size(); ++i)
            xsort[i] = std::make_pair(x[i], i);
        for (unsigned long j = 0; j < y.size(); ++j)
            ysort[j] = std::make_pair(y[j], j);

        std::sort(xsort.begin(), xsort.end());
        std::sort(ysort.begin(), ysort.end());


        unsigned long i, j;

        // Do the counting for the x values.
        for (i = 0, j = 0; i < x_count.size(); ++i)
        {
            // Skip past y values that are in the correct order with respect to xsort[i].
            while (j < ysort.size() && ysort[j].first < xsort[i].first) 
                ++j;

            x_count[xsort[i].second] = ysort.size() - j;
        }


        // Now do the counting for the y values.
        for (i = 0, j = 0; j < y_count.size(); ++j)
        {
            // Skip past x values that are in the incorrect order with respect to ysort[j].
            while (i < xsort.size() && !(ysort[j].first < xsort[i].first)) 
                ++i;

            y_count[ysort[j].second] = i;
        }
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline bool compare_first_reverse_second (
            const std::pair<double,bool>& a,
            const std::pair<double,bool>& b
        )
        {
            if (a.first < b.first)
                return true;
            else if (a.first > b.first)
                return false;
            else if (a.second && !b.second)
                return true;
            else
                return false;
        }
    }

    template <
        typename ranking_function,
        typename T
        >
    matrix<double,1,2> test_ranking_function (
        const ranking_function& funct,
        const std::vector<ranking_pair<T> >& samples
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_ranking_problem(samples),
            "\t double test_ranking_function()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t is_ranking_problem(samples): " << is_ranking_problem(samples)
            );

        unsigned long total_pairs = 0;
        unsigned long total_wrong = 0;

        std::vector<double> rel_scores;
        std::vector<double> nonrel_scores;
        std::vector<unsigned long> rel_counts;
        std::vector<unsigned long> nonrel_counts;

        running_stats<double> rs;
        std::vector<std::pair<double,bool> > total_scores;
        std::vector<bool> total_ranking;

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            rel_scores.resize(samples[i].relevant.size());
            nonrel_scores.resize(samples[i].nonrelevant.size());
            total_scores.clear();

            for (unsigned long k = 0; k < rel_scores.size(); ++k)
            {
                rel_scores[k] = funct(samples[i].relevant[k]);
                total_scores.push_back(std::make_pair(rel_scores[k], true));
            }

            for (unsigned long k = 0; k < nonrel_scores.size(); ++k)
            {
                nonrel_scores[k] = funct(samples[i].nonrelevant[k]);
                total_scores.push_back(std::make_pair(nonrel_scores[k], false));
            }

            // Now compute the average precision for this sample.  We need to sort the
            // results and the back them into total_ranking.  Note that we sort them so
            // that, if you get a block of ranking values that are all equal, the elements
            // marked as true will come last.  This prevents a ranking from outputting a
            // constant value for everything and still getting a good MAP score.
            std::sort(total_scores.rbegin(), total_scores.rend(), impl::compare_first_reverse_second);
            total_ranking.clear();
            for (unsigned long i = 0; i < total_scores.size(); ++i)
                total_ranking.push_back(total_scores[i].second);
            rs.add(average_precision(total_ranking));


            count_ranking_inversions(rel_scores, nonrel_scores, rel_counts, nonrel_counts);

            total_pairs += rel_scores.size()*nonrel_scores.size();

            // Note that we don't need to look at nonrel_counts since it is redundant with
            // the information in rel_counts in this case.
            total_wrong += sum(mat(rel_counts));
        }

        const double rank_swaps = static_cast<double>(total_pairs - total_wrong) / total_pairs;
        const double mean_average_precision = rs.mean();
        matrix<double,1,2> res;
        res = rank_swaps, mean_average_precision;
        return res;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename ranking_function,
        typename T
        >
    matrix<double,1,2> test_ranking_function (
        const ranking_function& funct,
        const ranking_pair<T>& sample
    )
    {
        return test_ranking_function(funct, std::vector<ranking_pair<T> >(1,sample));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename T
        >
    matrix<double,1,2> cross_validate_ranking_trainer (
        const trainer_type& trainer,
        const std::vector<ranking_pair<T> >& samples,
        const long folds
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_ranking_problem(samples) &&
                    1 < folds && folds <= static_cast<long>(samples.size()),
            "\t double cross_validate_ranking_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t folds:  " << folds 
            << "\n\t is_ranking_problem(samples): " << is_ranking_problem(samples)
            );


        const long num_in_test  = samples.size()/folds;
        const long num_in_train = samples.size() - num_in_test;


        std::vector<ranking_pair<T> > samples_test, samples_train;


        long next_test_idx = 0;

        unsigned long total_pairs = 0;
        unsigned long total_wrong = 0;

        std::vector<double> rel_scores;
        std::vector<double> nonrel_scores;
        std::vector<unsigned long> rel_counts;
        std::vector<unsigned long> nonrel_counts;

        running_stats<double> rs;
        std::vector<std::pair<double,bool> > total_scores;
        std::vector<bool> total_ranking;

        for (long i = 0; i < folds; ++i)
        {
            samples_test.clear();
            samples_train.clear();

            // load up the test samples
            for (long cnt = 0; cnt < num_in_test; ++cnt)
            {
                samples_test.push_back(samples[next_test_idx]);
                next_test_idx = (next_test_idx + 1)%samples.size();
            }

            // load up the training samples
            long next = next_test_idx;
            for (long cnt = 0; cnt < num_in_train; ++cnt)
            {
                samples_train.push_back(samples[next]);
                next = (next + 1)%samples.size();
            }


            const typename trainer_type::trained_function_type& df = trainer.train(samples_train);

            // check how good df is on the test data
            for (unsigned long i = 0; i < samples_test.size(); ++i)
            {
                rel_scores.resize(samples_test[i].relevant.size());
                nonrel_scores.resize(samples_test[i].nonrelevant.size());

                total_scores.clear();

                for (unsigned long k = 0; k < rel_scores.size(); ++k)
                {
                    rel_scores[k] = df(samples_test[i].relevant[k]);
                    total_scores.push_back(std::make_pair(rel_scores[k], true));
                }

                for (unsigned long k = 0; k < nonrel_scores.size(); ++k)
                {
                    nonrel_scores[k] = df(samples_test[i].nonrelevant[k]);
                    total_scores.push_back(std::make_pair(nonrel_scores[k], false));
                }

                // Now compute the average precision for this sample.  We need to sort the
                // results and the back them into total_ranking.  Note that we sort them so
                // that, if you get a block of ranking values that are all equal, the elements
                // marked as true will come last.  This prevents a ranking from outputting a
                // constant value for everything and still getting a good MAP score.
                std::sort(total_scores.rbegin(), total_scores.rend(), impl::compare_first_reverse_second);
                total_ranking.clear();
                for (unsigned long i = 0; i < total_scores.size(); ++i)
                    total_ranking.push_back(total_scores[i].second);
                rs.add(average_precision(total_ranking));


                count_ranking_inversions(rel_scores, nonrel_scores, rel_counts, nonrel_counts);

                total_pairs += rel_scores.size()*nonrel_scores.size();

                // Note that we don't need to look at nonrel_counts since it is redundant with
                // the information in rel_counts in this case.
                total_wrong += sum(mat(rel_counts));
            }

        } // for (long i = 0; i < folds; ++i)

        const double rank_swaps = static_cast<double>(total_pairs - total_wrong) / total_pairs;
        const double mean_average_precision = rs.mean();
        matrix<double,1,2> res;
        res = rank_swaps, mean_average_precision;
        return res;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANKING_ToOLS_Hh_

