// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LINEAR_MANIFOLD_ReGULARIZER_ABSTRACT_H__
#ifdef DLIB_LINEAR_MANIFOLD_ReGULARIZER_ABSTRACT_H__

#include <limits>
#include <vector>
#include "../serialize.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class linear_manifold_regularizer
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            INITIAL VALUE
                - dimensionality() == 0

            WHAT THIS OBJECT REPRESENTS
                Many learning algorithms attempt to minimize a function that, at a high 
                level, looks like this:   
                    f(w) == complexity + training_set_error

                The idea is to find the set of parameters, w, that gives low error on 
                your training data but also is not "complex" according to some particular
                measure of complexity.  This strategy of penalizing complexity is 
                usually called regularization.

                In the above setting, all the training data consists of labeled samples.  
                However, it would be nice to be able to benefit from unlabeled data.  
                The idea of manifold regularization is to extract useful information from 
                unlabeled data by first defining which data samples are "close" to each other 
                (perhaps by using their 3 nearest neighbors) and then adding a term to 
                the above function that penalizes any decision rule which produces 
                different outputs on data samples which we have designated as being close.
                
                It turns out that it is possible to transform these manifold regularized 
                learning problems into the normal form shown above by applying a certain kind 
                of preprocessing to all our data samples.  Once this is done we can use a 
                normal learning algorithm, such as the svm_c_linear_trainer, on just the
                labeled data samples and obtain the same output as the manifold regularized
                learner would have produced.  
                
                The linear_manifold_regularizer is a tool for creating this preprocessing 
                transformation.  In particular, the transformation is linear.  That is, it 
                is just a matrix you multiply with all your samples.  For a more detailed 
                discussion of this topic you should consult the following paper.  In 
                particular, see section 4.2.  This object computes the inverse T matrix 
                described in that section.

                    Linear Manifold Regularization for Large Scale Semi-supervised Learning
                    by Vikas Sindhwani, Partha Niyogi, and Mikhail Belkin
        !*/

    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;

        template <
            typename vector_type1, 
            typename vector_type2, 
            typename weight_function_type
            >
        void build (
            const vector_type1& samples,
            const vector_type2& edges,
            const weight_function_type& weight_funct
        );
        /*!
            requires
                - vector_type1 == a type with an interface compatible with std::vector and it must
                  in turn contain dlib::matrix objects.
                - vector_type2 == a type with an interface compatible with std::vector and 
                  it must in turn contain objects with an interface compatible with dlib::sample_pair
                - edges.size() > 0
                - contains_duplicate_pairs(edges) == false
                - max_index_plus_one(edges) <= samples.size()
                - weight_funct(edges[i]) must be a valid expression that evaluates to a
                  floating point number >= 0
            ensures
                - #dimensionality() == samples[0].size()
                - This function sets up the transformation matrix describe above.  The manifold
                  regularization is done assuming that the samples are meant to be "close" 
                  according to the graph defined by the given edges.  I.e:
                    - for all valid i:  samples[edges[i].index1()] is close to samples[edges[i].index2()].
                      How much we care about these two samples having similar outputs according
                      to the learned rule is given by weight_funct(edges[i]).  Bigger weights mean
                      we care more.
        !*/

        long dimensionality (
        ) const;
        /*!
            ensures
                - returns the number of rows and columns in the transformation matrix
                  produced by this object.
        !*/

        general_matrix get_transformation_matrix (
            scalar_type intrinsic_regularization_strength
        ) const;
        /*!
            requires
                - intrinsic_regularization_strength >= 0
            ensures
                - returns a matrix that represents the preprocessing transformation described above.
                - You must choose how important the manifold regularizer is relative to the basic
                  "don't be complex" regularizer described above.  The intrinsic_regularization_strength
                  is the parameter that controls this trade-off.  A large value of 
                  intrinsic_regularization_strength means that more emphasis should be placed on
                  finding decision rules which produce the same output on similar samples.  On 
                  the other hand, a small value would mean that we don't care much about the 
                  manifold regularizer.  For example, using 0 will cause this function to return the 
                  identity matrix.
                - The returned matrix will have dimensionality() rows and columns.
        !*/

    };

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LINEAR_MANIFOLD_ReGULARIZER_ABSTRACT_H__


