// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RANKING_ToOLS_ABSTRACT_Hh_
#ifdef DLIB_RANKING_ToOLS_ABSTRACT_Hh_


#include "../algs.h"
#include "../matrix.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct ranking_pair
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is used to contain a ranking example.  In particular, we say
                that a good ranking of T objects is one in which all the elements in
                this->relevant are ranked higher than the elements of this->nonrelevant.
                Therefore, ranking_pair objects are used to represent training examples for
                learning-to-rank tasks.
        !*/

        ranking_pair() {}
        /*!
            ensures
                - #relevant.size() == 0
                - #nonrelevant.size() == 0
        !*/

        ranking_pair(
            const std::vector<T>& r, 
            const std::vector<T>& nr
        ) : relevant(r), nonrelevant(nr) {}
        /*!
            ensures
                - #relevant == r
                - #nonrelevant == nr
        !*/

        std::vector<T> relevant;
        std::vector<T> nonrelevant;
    };

    template <
        typename T
        >
    void serialize (
        const ranking_pair<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

    template <
        typename T
        >
    void deserialize (
        ranking_pair<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    bool is_ranking_problem (
        const std::vector<ranking_pair<T> >& samples
    );
    /*!
        ensures
            - returns true if the data in samples represents a valid learning-to-rank
              learning problem.  That is, this function returns true if all of the
              following are true and false otherwise:
                - samples.size() > 0
                - for all valid i:
                    - samples[i].relevant.size() > 0
                    - samples[i].nonrelevant.size() > 0
                - if (is_matrix<T>::value == true) then 
                    - All the elements of samples::nonrelevant and samples::relevant must
                      represent row or column vectors and they must be the same dimension.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    unsigned long max_index_plus_one (
        const ranking_pair<T>& item
    );
    /*!
        requires
            - T must be a dlib::matrix capable of storing column vectors or T must be a
              sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.
        ensures
            - returns std::max(max_index_plus_one(item.relevant), max_index_plus_one(item.nonrelevant)).
              Therefore, this function can be used to find the dimensionality of the
              vectors stored in item.
    !*/

    template <
        typename T
        >
    unsigned long max_index_plus_one (
        const std::vector<ranking_pair<T> >& samples
    );
    /*!
        requires
            - T must be a dlib::matrix capable of storing column vectors or T must be a
              sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.
        ensures
            - returns the maximum of max_index_plus_one(samples[i]) over all valid values
              of i.  Therefore, this function can be used to find the dimensionality of the
              vectors stored in samples
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void count_ranking_inversions (
        const std::vector<T>& x,
        const std::vector<T>& y,
        std::vector<unsigned long>& x_count,
        std::vector<unsigned long>& y_count
    );
    /*!
        requires
            - T objects must be copyable
            - T objects must be comparable via operator<
        ensures
            - This function counts how many times we see a y value greater than or equal to
              an x value.  This is done efficiently in O(n*log(n)) time via the use of
              quick sort.
            - #x_count.size() == x.size()
            - #y_count.size() == y.size()
            - for all valid i:
                - #x_count[i] == how many times a value in y was >= x[i].
            - for all valid j:
                - #y_count[j] == how many times a value in x was <= y[j].
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename ranking_function,
        typename T
        >
    matrix<double,1,2> test_ranking_function (
        const ranking_function& funct,
        const std::vector<ranking_pair<T> >& samples
    );
    /*!
        requires
            - is_ranking_problem(samples) == true
            - ranking_function == some kind of decision function object (e.g. decision_function)
        ensures
            - Tests the given ranking function on the supplied example ranking data and
              returns the fraction of ranking pair orderings predicted correctly.  This is
              a number in the range [0,1] where 0 means everything was incorrectly
              predicted while 1 means everything was correctly predicted.  This function
              also returns the mean average precision.
            - In particular, this function returns a matrix M summarizing the results.
              Specifically, it returns an M such that:
                - M(0) == the fraction of times that the following is true:                
                    - funct(samples[k].relevant[i]) > funct(samples[k].nonrelevant[j])
                      (for all valid i,j,k)
                - M(1) == the mean average precision of the rankings induced by funct.
                  (Mean average precision is a number in the range 0 to 1.  Moreover, a
                  mean average precision of 1 means everything was correctly predicted
                  while smaller values indicate worse rankings.  See the documentation
                  for average_precision() for details of its computation.)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename ranking_function,
        typename T
        >
    matrix<double,1,2> test_ranking_function (
        const ranking_function& funct,
        const ranking_pair<T>& sample
    );
    /*!
        requires
            - is_ranking_problem(std::vector<ranking_pair<T> >(1, sample)) == true
            - ranking_function == some kind of decision function object (e.g. decision_function)
        ensures
            - This is just a convenience routine for calling the above
              test_ranking_function() routine.  That is, it just copies sample into a
              std::vector object and invokes the above test_ranking_function() routine.
              This means that calling this function is equivalent to invoking: 
                return test_ranking_function(funct, std::vector<ranking_pair<T> >(1, sample));
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename T
        >
    matrix<double,1,2> cross_validate_ranking_trainer (
        const trainer_type& trainer,
        const std::vector<ranking_pair<T> >& samples,
        const long folds
    );
    /*!
        requires
            - is_ranking_problem(samples) == true
            - 1 < folds <= samples.size()
            - trainer_type == some kind of ranking trainer object (e.g. svm_rank_trainer)
        ensures
            - Performs k-fold cross validation by using the given trainer to solve the
              given ranking problem for the given number of folds.  Each fold is tested
              using the output of the trainer and the average ranking accuracy as well as
              the mean average precision over the number of folds is returned.
            - The accuracy is computed the same way test_ranking_function() computes its
              accuracy.  Therefore, it is a number in the range [0,1] that represents the
              fraction of times a ranking pair's ordering was predicted correctly.  Similarly,
              the mean average precision is computed identically to test_ranking_function().
              In particular, this means that this function returns a matrix M such that:
                - M(0) == the ranking accuracy
                - M(1) == the mean average precision
            - The number of folds used is given by the folds argument.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANKING_ToOLS_ABSTRACT_Hh_


