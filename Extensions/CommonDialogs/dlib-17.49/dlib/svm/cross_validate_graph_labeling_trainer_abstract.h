// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_ABSTRACT_H__
#ifdef DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_ABSTRACT_H__

#include "../array/array_kernel_abstract.h"
#include <vector>
#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename graph_labeler,
        typename graph_type
        >
    matrix<double,1,2> test_graph_labeling_function (
        const graph_labeler& labeler,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels
    );
    /*!
        requires
            - is_graph_labeling_problem(samples,labels) == true
            - graph_labeler == an object with an interface compatible with the
              dlib::graph_labeler object.
            - the following must be a valid expression: labeler(samples[0]);
        ensures
            - This function tests the accuracy of the given graph labeler against
              the sample graphs and their associated labels.  In particular, this
              function returns a matrix R such that:
                - R(0) == The fraction of nodes which are supposed to have a label of
                  true that are labeled as such by the labeler.
                - R(1) == The fraction of nodes which are supposed to have a label of
                  false that are labeled as such by the labeler.
              Therefore, if R is [1,1] then the labeler makes perfect predictions while
              an R of [0,0] indicates that it gets everything wrong.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_labeler,
        typename graph_type
        >
    matrix<double,1,2> test_graph_labeling_function (
        const graph_labeler& labeler,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const std::vector<std::vector<double> >& losses
    );
    /*!
        requires
            - is_graph_labeling_problem(samples,labels) == true
            - graph_labeler == an object with an interface compatible with the
              dlib::graph_labeler object.
            - the following must be a valid expression: labeler(samples[0]);
            - if (losses.size() != 0) then
                - sizes_match(labels, losses) == true
                - all_values_are_nonnegative(losses) == true
        ensures
            - This overload of test_graph_labeling_function() does the same thing as the
              one defined above, except that instead of counting 1 for each labeling
              mistake, it weights each mistake according to the corresponding value in
              losses.  That is, instead of counting a value of 1 for making a mistake on
              samples[i].node(j), this routine counts a value of losses[i][j].  Under this
              interpretation, the loss values represent how useful it is to correctly label
              each node.  Therefore, the values returned represent fractions of overall
              labeling utility rather than raw labeling accuracy.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename graph_type
        >
    matrix<double,1,2> cross_validate_graph_labeling_trainer (
        const trainer_type& trainer,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const long folds
    );
    /*!
        requires
            - is_graph_labeling_problem(samples,labels) == true
            - 1 < folds <= samples.size()
            - trainer_type == an object which trains some kind of graph labeler object
              (e.g. structural_graph_labeling_trainer)
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given graph labeling problem for the given number of folds.  Each fold 
              is tested using the output of the trainer and the average classification 
              accuracy from all folds is returned.  In particular, this function returns 
              a matrix R such that:
                - R(0) == The fraction of nodes which are supposed to have a label of
                  true that are labeled as such by the learned labeler.
                - R(1) == The fraction of nodes which are supposed to have a label of
                  false that are labeled as such by the learned labeler.
              Therefore, if R is [1,1] then the labeler makes perfect predictions while
              an R of [0,0] indicates that it gets everything wrong.
            - The number of folds used is given by the folds argument.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename graph_type
        >
    matrix<double,1,2> cross_validate_graph_labeling_trainer (
        const trainer_type& trainer,
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        const std::vector<std::vector<double> >& losses,
        const long folds
    );
    /*!
        requires
            - is_graph_labeling_problem(samples,labels) == true
            - 1 < folds <= samples.size()
            - trainer_type == an object which trains some kind of graph labeler object
              (e.g. structural_graph_labeling_trainer)
            - if (losses.size() != 0) then
                - sizes_match(labels, losses) == true
                - all_values_are_nonnegative(losses) == true
        ensures
            - This overload of cross_validate_graph_labeling_trainer() does the same thing
              as the one defined above, except that instead of counting 1 for each labeling
              mistake, it weights each mistake according to the corresponding value in
              losses.  That is, instead of counting a value of 1 for making a mistake on
              samples[i].node(j), this routine counts a value of losses[i][j].  Under this
              interpretation, the loss values represent how useful it is to correctly label
              each node.  Therefore, the values returned represent fractions of overall
              labeling utility rather than raw labeling accuracy.  
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_GRAPh_LABELING_TRAINER_ABSTRACT_H__



