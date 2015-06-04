// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_VECTOR_NORMALIZER_FRoBMETRIC_ABSTRACT_Hh_
#ifdef DLIB_VECTOR_NORMALIZER_FRoBMETRIC_ABSTRACT_Hh_

#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    struct frobmetric_training_sample 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a training data sample for the
                vector_normalizer_frobmetric object.  It defines a set of training triplets
                relative to a single anchor_vect vector.  That is, it specifies that the
                learned distance metric should satisfy num_triples() constraints which are,
                for all valid i and j:
                    length(T*anchor_vect-T*near_vects[i]) + 1 < length(T*anchor_vect - T*far_vects[j])
                for some appropriate linear transformation T which will be learned by
                vector_normalizer_frobmetric.
        !*/

        matrix_type anchor_vect;
        std::vector<matrix_type> near_vects;
        std::vector<matrix_type> far_vects;

        unsigned long num_triples (
        ) const { return near_vects.size() * far_vects.size(); }
        /*!
            ensures
                - returns the number of training triplets defined by this object.
        !*/

        void clear()
        /*!
            ensures
                - #near_vects.size() == 0
                - #far_vects.size() == 0
        !*/
    };

    template < typename matrix_type >
    void serialize(const frobmetric_training_sample<matrix_type>& item, std::ostream& out)
    template < typename matrix_type >
    void deserialize(frobmetric_training_sample<matrix_type>& item, std::istream& in)
    /*!
        provides serialisation support.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class vector_normalizer_frobmetric
    {
        /*!
            REQUIREMENTS ON matrix_type
                - must be a dlib::matrix object capable of representing column 
                  vectors

            INITIAL VALUE
                - in_vector_size() == 0
                - out_vector_size() == 0
                - get_epsilon() == 0.1
                - get_c() == 1
                - get_max_iterations() == 5000
                - This object is not verbose
                - uses_identity_matrix_prior() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for performing the FrobMetric distance metric
                learning algorithm described in the following paper:
                    A Scalable Dual Approach to Semidefinite Metric Learning
                    By Chunhua Shen, Junae Kim, Lei Wang, in CVPR 2011

                Therefore, this object is a tool that takes as input training triplets
                (anchor_vect, near, far) of vectors and attempts to learn a linear
                transformation T such that:
                    length(T*anchor_vect-T*near) + 1 < length(T*anchor_vect - T*far)
                That is, you give a bunch of anchor_vect vectors and for each anchor_vect
                you specify some vectors which should be near to it and some that should be
                far form it.  This object then tries to find a transformation matrix that
                makes the "near" vectors close to their anchors while the "far" vectors are
                farther away.

            THREAD SAFETY
                Note that this object contains a cached matrix object it uses 
                to store intermediate results for normalization.  This avoids
                needing to reallocate it every time this object performs normalization
                but also makes it non-thread safe.  So make sure you don't share
                instances of this object between threads. 
        !*/

    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef matrix_type result_type;

        vector_normalizer_frobmetric (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        bool uses_identity_matrix_prior (
        ) const;
        /*!
            ensures
                - Normally this object will try and find a matrix transform() that
                  minimizes sum(squared(transform())) but also fits the training data.
                  However, if #uses_identity_matrix_prior() == true then it will instead
                  try to find the transformation matrix that minimizes
                  sum(squared(identity_matrix()-transform())).  That is, it will try to
                  find the matrix most similar to the identity matrix that best fits the
                  training data.
        !*/

        void set_uses_identity_matrix_prior (
            bool use_prior
        );
        /*!
            ensures
                - #uses_identity_matrix_prior() == use_prior
        !*/

        void be_verbose(
        );
        /*!
            ensures
                - This object will print status messages to standard out so the user can
                  observe the progress of the train() routine.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - this object will not print anything to standard out.
        !*/

        void set_epsilon (
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps 
        !*/

        double get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer to
                  execute.
        !*/

        void set_c (
            double C 
        );
        /*!
            requires
                - C > 0
            ensures
                - #set_c() == C
        !*/

        double get_c (
        ) const;
        /*!
            ensures
                - returns the regularization parameter.  It is the parameter that
                  determines the trade-off between trying to fit the training data exactly
                  or allowing more errors but hopefully improving the generalization of the
                  resulting distance metric.  Larger values encourage exact fitting while
                  smaller values of C may encourage better generalization. 
        !*/
       
        void set_max_iterations (
            unsigned long max_iterations
        );
        /*!
            ensures
                - #get_max_iterations() == max_iterations
        !*/

        unsigned long get_max_iterations (
        ) const;
        /*!
            ensures
                - The train() routine uses an iterative numerical solver to find the best
                  distance metric.  This function returns the maximum allowable number of
                  iterations it will use before terminating.  Note that typically the
                  solver terminates prior to the max iteration count limit due to the error
                  dropping below get_epsilon().
        !*/

        void train (
            const std::vector<frobmetric_training_sample<matrix_type> >& samples
        );
        /*!
            requires
                - samples.size() != 0
                - All matrices inside samples (i.e. anchors and elements of near_vects and far_vects)
                  are column vectors with the same non-zero dimension.
                - All the vectors in samples contain finite values.
                - All elements of samples contain data, specifically, for all valid i:
                    - samples[i].num_triples() != 0
            ensures
                - learns a distance metric from the given training samples.  After train
                  finishes you can use this object's operator() to transform vectors
                  according to the learned distance metric.  In particular, we will have:
                    - #transform() == The linear transformation learned by the FrobMetric
                      learning procedure.
                    - #in_vector_size() == samples[0].anchor_vect.size()
                    - You can call (*this)(x) to transform a vector according to the learned 
                      distance metric.  That is, it should generally be the case that:
                        - length((*this)(anchor_vect) - (*this)(near)) + 1 < length((*this)(anchor_vect) - (*this)(far))
                      for the anchor_vect, near, and far vectors in the training data.
                    - #transformed_means() == the mean of the input anchor_vect vectors
                      after being transformed by #transform()
        !*/

        long in_vector_size (
        ) const;
        /*!
            ensures
                - returns the number of rows that input vectors are required to contain if
                  they are to be normalized by this object.
        !*/

        long out_vector_size (
        ) const;
        /*!
            ensures
                - returns the number of rows in the normalized vectors that come out of
                  this object.
                - The value returned is always in_vector_size().  So out_vector_size() is
                  just provided to maintain interface consistency with other vector
                  normalizer objects.  That is, the transformations applied by this object
                  do not change the dimensionality of the vectors.
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& transformed_means (
        ) const;
        /*!
            ensures
                - returns a column vector V such that:
                    - V.size() == in_vector_size()
                    - V is a vector such that subtracting it from transformed vectors
                      results in them having an expected value of 0.  Therefore, it is
                      equal to transform() times the mean of the input anchor_vect vectors
                      given to train().
        !*/

        const matrix<scalar_type,0,0,mem_manager_type>& transform (
        ) const;
        /*!
            ensures
                - returns a copy of the transformation matrix we learned during the last 
                  call to train().
                - The returned matrix is square and has in_vector_size() by in_vector_size()
                  dimensions.
        !*/

        const result_type& operator() (
            const matrix_type& x
        ) const;
        /*!
            requires
                - in_vector_size() != 0
                - in_vector_size() == x.size()
                - is_col_vector(x) == true
            ensures
                - returns a normalized version of x, call it Z, that has the following
                  properties: 
                    - Z == The result of applying the linear transform we learned during
                      train() to the input vector x.
                    - Z == transform()*x-transformed_means()
                    - is_col_vector(Z) == true
                    - Z.size() == x.size()
                    - The expected value of each element of Z is 0.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void serialize (
        const vector_normalizer_frobmetric<matrix_type>& item, 
        std::ostream& out 
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void deserialize (
        vector_normalizer_frobmetric<matrix_type>& item, 
        std::istream& in
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_VECTOR_NORMALIZER_FRoBMETRIC_ABSTRACT_Hh_

