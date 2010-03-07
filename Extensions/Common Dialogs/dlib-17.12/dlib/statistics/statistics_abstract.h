// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STATISTICs_ABSTRACT_
#ifdef DLIB_STATISTICs_ABSTRACT_

#include <limits>
#include <cmath>
#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class running_stats
    {
        /*!
            REQUIREMENTS ON T
                - T must be a float, double, or long double type

            INITIAL VALUE
                - max_n() == std::numeric_limits<T>::max()
                - mean() == 0
                - current_n() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute the running mean and
                variance of a stream of real numbers.  

                As this object accumulates more and more numbers it will be the case
                that each new number impacts the current mean and variance estimate
                less and less.  This may be what you want.  But it might not be. 

                For example, your stream of numbers might be non-stationary, that is,
                the mean and variance might change over time.  To enable you to use
                this object on such a stream of numbers this object provides the 
                ability to set a "max_n."  The meaning of the max_n() parameter
                is that after max_n() samples have been seen each new sample will
                have the same impact on the mean and variance estimates from then on.

                So if you have a highly non-stationary stream of data you might
                set the max_n to a small value while if you have a very stationary
                stream you might set it to a very large value.
        !*/
    public:

        running_stats(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear(
        );
        /*!
            ensures
                - this object has its initial value
                - clears all memory of any previous data points
        !*/

        void set_max_n (
            const T& val
        );
        /*!
            ensures
                - #max_n() == val
        !*/

        T max_n (
        ) const;
        /*!
            ensures
                - returns the max value that current_n() is allowed to take on
        !*/

        T current_n (
        ) const;
        /*!
            ensures
                - returns the number of points given to this object so far or
                  max_n(), whichever is smallest.
        !*/

        void add (
            const T& val
        );
        /*!
            ensures
                - updates the mean and variance stored in this object so that
                  the new value is factored into them
                - #mean() == mean()*current_n()/(current_n()+1) + val/(current_n()+1)
                - #variance() == the updated variance that takes this new value into account
                - if (current_n() < max_n()) then
                    - #current_n() == current_n() + 1
                - else
                    - #current_n() == current_n()
        !*/

        T mean (
        ) const;
        /*!
            ensures
                - returns the mean of all the values presented to this object 
                  so far.
        !*/

        T variance (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the variance of all the values presented to this
                  object so far.
        !*/

        T max (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the largest value presented to this object so far.
        !*/

        T min (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the smallest value presented to this object so far.
        !*/

        T scale (
            const T& val
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - return (val-mean())/std::sqrt(variance());
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class vector_normalizer
    {
        /*!
            REQUIREMENTS ON matrix_type
                - must be a dlib::matrix object capable of representing column 
                  vectors

            INITIAL VALUE
                - in_vector_size() == 0
                - out_vector_size() == 0
                - means().size() == 0
                - std_devs().size() == 0
                - pca_matrix().size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can learn to normalize a set 
                of vectors.  In particular, normalized vectors should have zero
                mean and a variance of one.  

                Also, if desired, this object can also use principal component 
                analysis for the purposes of reducing the number of elements in a 
                vector.  
        !*/

    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;

        template <typename vector_type>
        void train (
            const vector_type& samples
        );
        /*!
            requires
                - samples.size() > 0
                - samples == a column matrix or something convertible to a column 
                  matrix via vector_to_matrix().  Also, x should contain 
                  matrix_type objects that represent nonempty column vectors.
            ensures
                - #in_vector_size() == samples(0).nr()
                - #out_vector_size() == samples(0).nr()
                - This object has learned how to normalize vectors that look like
                  vectors in the given set of samples.  
                - #means() == mean(samples)
                - #std_devs() == reciprocal(sqrt(variance(samples)));
                - #pca_matrix().size() == 0
        !*/

        template <typename vector_type>
        void train_pca (
            const vector_type& samples,
            const double eps = 0.99
        );
        /*!
            requires
                - 0 < eps <= 1
                - samples.size() > 0
                - samples == a column matrix or something convertible to a column 
                  matrix via vector_to_matrix().  Also, x should contain 
                  matrix_type objects that represent nonempty column vectors.
            ensures
                - This object has learned how to normalize vectors that look like
                  vectors in the given set of samples.  
                - Principal component analysis is performed to find a transform 
                  that might reduce the number of output features. 
                - #in_vector_size() == samples(0).nr()
                - 0 < #out_vector_size() <= samples(0).nr()
                - eps is a number that controls how "lossy" the pca transform will be.
                  Large values of eps result in #out_vector_size() being larger and
                  smaller values of eps result in #out_vector_size() being smaller. 
                - #means() == mean(samples)
                - #std_devs() == reciprocal(sqrt(variance(samples)));
                - #pca_matrix() == the PCA transform matrix that is out_vector_size()
                  rows by in_vector_size() columns.
        !*/

        long in_vector_size (
        ) const;
        /*!
            ensures
                - returns the number of rows that input vectors are
                  required to contain if they are to be normalized by
                  this object.
        !*/

        long out_vector_size (
        ) const;
        /*!
            ensures
                - returns the number of rows in the normalized vectors
                  that come out of this object.
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& means (
        ) const;
        /*!
            ensures               
                - returns a matrix M such that:
                    - M.nc() == 1
                    - M.nr() == in_vector_size()
                    - M(i) == the mean of the ith input feature shown to train()
                      or train_pca()
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& std_devs (
        ) const;
        /*!
            ensures               
                - returns a matrix SD such that:
                    - SD.nc() == 1
                    - SD.nr() == in_vector_size()
                    - SD(i) == the reciprocal of the standard deviation of the ith 
                      input feature shown to train() or train_pca()
        !*/
 
        const matrix<scalar_type,0,0,mem_manager_type>& pca_matrix (
        ) const;
        /*!
            ensures
                - if (PCA is used in normalization) then
                    - returns a matrix PCA such that:
                        - PCA.nr() == out_vector_size()
                        - PCA.nc() == in_vector_size()
                        - PCA == the principal component analysis transformation 
                          matrix 
                - else
                    - returns an empty matrix object (i.e. it has size() == 0)
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& operator() (
            const matrix_type& x
        ) const;
        /*!
            requires
                - x.nr() == in_vector_size()
                - x.nc() == 1
            ensures
                - returns a normalized version of x, call it Z, that has the 
                  following properties: 
                    - Z.nr() == out_vector_size()
                    - Z.nc() == 1
                    - the expected value of each element of Z is 0 
                    - the expected variance of each element of Z is 1
                    - if (pca_matrix().size() > 0) then
                        - Z == pca_matrix()*pointwise_multiply(x-means(), std_devs());
                    - else
                        - Z == pointwise_multiply(x-means(), std_devs());
        !*/

        void swap (
            vector_normalizer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    };

    template <
        typename matrix_type
        >
    inline void swap (
        vector_normalizer<matrix_type>& a, 
        vector_normalizer<matrix_type>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename matrix_type,
        >
    void deserialize (
        vector_normalizer<matrix_type>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

    template <
        typename matrix_type,
        >
    void serialize (
        const vector_normalizer<matrix_type>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATISTICs_ABSTRACT_

