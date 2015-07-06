// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TESTING_ReSULTS_H__
#define DLIB_TESTING_ReSULTS_H__

#include <dlib/matrix.h>

struct binary_test
{
    binary_test() : class1_accuracy(0), class2_accuracy(0) {}
    binary_test(
        const dlib::matrix<double,1,2>& m
    ) : class1_accuracy(m(0)),
        class2_accuracy(m(1)) {}

    double class1_accuracy;
    double class2_accuracy;
};

struct regression_test 
{
    regression_test() : mean_squared_error(0), R_squared(0) {}
    regression_test(
        const dlib::matrix<double,1,2>& m
    ) : mean_squared_error(m(0)),
        R_squared(m(1)) {}

    double mean_squared_error;
    double R_squared;
};

struct ranking_test 
{
    ranking_test() : ranking_accuracy(0), mean_ap(0) {}
    ranking_test(
        const dlib::matrix<double,1,2>& m
    ) : ranking_accuracy(m(0)),
        mean_ap(m(1)) {}

    double ranking_accuracy;
    double mean_ap;
};

#endif // DLIB_TESTING_ReSULTS_H__

