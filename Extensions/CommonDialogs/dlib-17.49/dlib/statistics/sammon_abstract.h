// Copyright (C) 2012  Emanuele Cesena (emanuele.cesena@gmail.com), Davis E. King
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SAMMoN_ABSTRACT_H__
#ifdef DLIB_SAMMoN_ABSTRACT_H__

#include "../matrix/matrix_abstract.h"
#include <vector>

namespace dlib
{

    class sammon_projection
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object that computes the Sammon projection of a set
                of N points in a L-dimensional vector space onto a d-dimensional space
                (d < L), according to the paper:
                    A Nonlinear Mapping for Data Structure Analysis (1969) by J.W. Sammon

                The current implementation is a vectorized version of the original algorithm.
        !*/

    public:

        sammon_projection(
        );
        /*!
            ensures
                - this object is properly initialized 
        !*/

        template <typename matrix_type>
        std::vector<matrix<double,0,1> > operator() (
            const std::vector<matrix_type>& data,       
            const long num_dims                      
        );
        /*!
            requires
                - num_dims > 0
                - matrix_type should be a kind of dlib::matrix of doubles capable
                  of representing column vectors.
                - for all valid i:
                    - is_col_vector(data[i]) == true
                    - data[0].size() == data[i].size()
                      (i.e. all the vectors in data must have the same dimensionality)
                - if (data.size() != 0) then
                    - 0 < num_dims <= data[0].size()
                      (i.e. you can't project into a higher dimension than the input data,
                      only to a lower dimension.)
            ensures
                - This routine computes Sammon's dimensionality reduction method based on the
                  given input data.  It will attempt to project the contents of data into a
                  num_dims dimensional space that preserves relative distances between the
                  input data points.
                - This function returns a std::vector, OUT, such that:
                    - OUT == a set of column vectors that represent the Sammon projection of 
                      the input data vectors. 
                    - OUT.size() == data.size()
                    - for all valid i:
                        - OUT[i].size() == num_dims
                        - OUT[i] == the Sammon projection of the input vector data[i]
        !*/

        template <typename matrix_type>
        void operator() (
            const std::vector<matrix_type>& data,       
            const long num_dims,                     
            std::vector<matrix<double,0,1> >& result,   
            double &err,                                
            const unsigned long num_iters = 1000,             
            const double err_delta = 1.0e-9            
        );
        /*!
            requires
                - num_iters > 0
                - err_delta > 0
                - num_dims > 0
                - matrix_type should be a kind of dlib::matrix of doubles capable
                  of representing column vectors.
                - for all valid i:
                    - is_col_vector(data[i]) == true
                    - data[0].size() == data[i].size()
                      (i.e. all the vectors in data must have the same dimensionality)
                - if (data.size() != 0) then
                    - 0 < num_dims <= data[0].size()
                      (i.e. you can't project into a higher dimension than the input data,
                      only to a lower dimension.)
            ensures
                - This routine computes Sammon's dimensionality reduction method based on the
                  given input data.  It will attempt to project the contents of data into a
                  num_dims dimensional space that preserves relative distances between the
                  input data points.
                - #err == the final error value at the end of the algorithm.  The goal of Sammon's
                  algorithm is to find a lower dimensional projection of the input data that
                  preserves the relative distances between points.  The value in #err is a measure
                  of the total error at the end of the algorithm.  So smaller values indicate
                  a better projection was found than if a large value is returned via #err.
                - Sammon's algorithm will run until either num_iters iterations has executed
                  or the change in error from one iteration to the next is less than err_delta.
                - Upon completion, the output of Sammon's projection is stored into #result, in
                  particular, we will have:
                    - #result == a set of column vectors that represent the Sammon projection of 
                      the input data vectors. 
                    - #result.size() == data.size()
                    - for all valid i:
                        - #result[i].size() == num_dims
                        - #result[i] == the Sammon projection of the input vector data[i]
        !*/

    };

} 

#endif // DLIB_SAMMoN_ABSTRACT_H__


