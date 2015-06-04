// Copyright (C) 2008  Davis E. King (davis@dlib.net), Steve Taylor
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STATISTICs_ABSTRACT_
#ifdef DLIB_STATISTICs_ABSTRACT_

#include <limits>
#include <cmath>
#include "../matrix/matrix_abstract.h"
#include "../svm/sparse_vector_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double mean_sign_agreement (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    );
    /*!
        requires
            - a.size() == b.size()
        ensures
            - returns the number of times a[i] has the same sign as b[i] divided by
              a.size().  So we return the probability that elements of a and b have
              the same sign.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double correlation (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    );
    /*!
        requires
            - a.size() == b.size()
            - a.size() > 1
        ensures
            - returns the correlation coefficient between all the elements of a and b.
              (i.e. how correlated is a(i) with b(i))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double covariance (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    );
    /*!
        requires
            - a.size() == b.size()
            - a.size() > 1
        ensures
            - returns the covariance between all the elements of a and b.
              (i.e. how does a(i) vary with b(i))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double r_squared (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    );
    /*!
        requires
            - a.size() == b.size()
            - a.size() > 1
        ensures
            - returns the R^2 coefficient of determination between all the elements of a and b.
              This value is just the square of correlation(a,b).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double mean_squared_error (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    );
    /*!
        requires
            - a.size() == b.size()
        ensures
            - returns the mean squared error between all the elements of a and b.
              (i.e. mean(squared(mat(a)-mat(b))))
    !*/

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
                - mean() == 0
                - current_n() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute the running mean, 
                variance, skewness, and excess kurtosis of a stream of real numbers.  
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

        T current_n (
        ) const;
        /*!
            ensures
                - returns the number of points given to this object so far. 
        !*/

        void add (
            const T& val
        );
        /*!
            ensures
                - updates the mean, variance, skewness, and kurtosis stored in this object
                  so that the new value is factored into them.
                - #mean() == mean()*current_n()/(current_n()+1) + val/(current_n()+1).
                  (i.e. the updated mean value that takes the new value into account)
                - #variance() == the updated variance that takes this new value into account.
                - #skewness() == the updated skewness that takes this new value into account.
                - #ex_kurtosis() == the updated kurtosis that takes this new value into account.
                - #current_n() == current_n() + 1
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
                - returns the unbiased sample variance of all the values presented to this
                  object so far.
        !*/

        T stddev (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sampled standard deviation of all the values
                  presented to this object so far.
        !*/

        T skewness (
        ) const;
        /*!
            requires
                - current_n() > 2
            ensures
                - returns the unbiased sample skewness of all the values presented 
                  to this object so far.
        !*/

        T ex_kurtosis(
        ) const;
        /*!
            requires
                - current_n() > 3
            ensures
                - returns the unbiased sample kurtosis of all the values presented 
                  to this object so far.
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
                - return (val-mean())/stddev();
        !*/

        running_stats operator+ (
            const running_stats& rhs
        ) const;
        /*!
            ensures
                - returns a new running_stats object that represents the combination of all
                  the values given to *this and rhs.  That is, this function returns a
                  running_stats object, R, that is equivalent to what you would obtain if
                  all calls to this->add() and rhs.add() had instead been done to R.
        !*/
    };

    template <typename T>
    void serialize (
        const running_stats<T>& item, 
        std::ostream& out 
    );
    /*!
        provides serialization support 
    !*/

    template <typename T>
    void deserialize (
        running_stats<T>& item, 
        std::istream& in
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class running_scalar_covariance
    {
        /*!
            REQUIREMENTS ON T
                - T must be a float, double, or long double type

            INITIAL VALUE
                - mean_x() == 0
                - mean_y() == 0
                - current_n() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute the running covariance 
                of a stream of real number pairs.
        !*/

    public:

        running_scalar_covariance(
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

        void add (
            const T& x,
            const T& y
        );
        /*!
            ensures
                - updates the statistics stored in this object so that
                  the new pair (x,y) is factored into them.
                - #current_n() == current_n() + 1
        !*/

        T current_n (
        ) const;
        /*!
            ensures
                - returns the number of points given to this object so far. 
        !*/

        T mean_x (
        ) const;
        /*!
            ensures
                - returns the mean value of all x samples presented to this object
                  via add().
        !*/

        T mean_y (
        ) const;
        /*!
            ensures
                - returns the mean value of all y samples presented to this object
                  via add().
        !*/

        T covariance (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the covariance between all the x and y samples presented
                  to this object via add()
        !*/

        T correlation (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the correlation coefficient between all the x and y samples 
                  presented to this object via add()
        !*/

        T variance_x (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sample variance value of all x samples presented 
                  to this object via add().
        !*/

        T variance_y (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sample variance value of all y samples presented 
                  to this object via add().
        !*/

        T stddev_x (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sample standard deviation of all x samples
                  presented to this object via add().
        !*/

        T stddev_y (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sample standard deviation of all y samples
                  presented to this object via add().
        !*/

        running_scalar_covariance operator+ (
            const running_covariance& rhs
        ) const;
        /*!
            ensures
                - returns a new running_scalar_covariance object that represents the
                  combination of all the values given to *this and rhs.  That is, this
                  function returns a running_scalar_covariance object, R, that is
                  equivalent to what you would obtain if all calls to this->add() and
                  rhs.add() had instead been done to R.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class running_covariance
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            INITIAL VALUE
                - in_vector_size() == 0
                - current_n() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a simple tool for computing the mean and
                covariance of a sequence of vectors.  
        !*/
    public:

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        running_covariance(
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

        long current_n (
        ) const;
        /*!
            ensures
                - returns the number of samples that have been presented to this object
        !*/

        long in_vector_size (
        ) const;
        /*!
            ensures
                - if (this object has been presented with any input vectors or
                  set_dimension() has been called) then
                    - returns the dimension of the column vectors used with this object
                - else
                    - returns 0
        !*/

        void set_dimension (
            long size
        );
        /*!
            requires
                - size > 0
            ensures
                - #in_vector_size() == size
                - #current_n() == 0
        !*/

        template <typename T>
        void add (
            const T& val
        );
        /*!
            requires
                - val must represent a column vector.  It can either be a dlib::matrix
                  object or some kind of unsorted sparse vector type.  See the top of
                  dlib/svm/sparse_vector_abstract.h for a definition of unsorted sparse vector.
                - val must have a number of dimensions which is compatible with the current
                  setting of in_vector_size().  In particular, this means that the
                  following must hold:
                    - if (val is a dlib::matrix) then 
                        - in_vector_size() == 0 || val.size() == val_vector_size()
                    - else
                        - max_index_plus_one(val) <= in_vector_size()
                        - in_vector_size() > 0 
                          (i.e. you must call set_dimension() prior to calling add() if
                          you want to use sparse vectors.)
            ensures
                - updates the mean and covariance stored in this object so that
                  the new value is factored into them.
                - if (val is a dlib::matrix) then
                    - #in_vector_size() == val.size()
        !*/

        const column_matrix mean (
        ) const;
        /*!
            requires
                - in_vector_size() != 0 
            ensures
                - returns the mean of all the vectors presented to this object 
                  so far.
        !*/

        const general_matrix covariance (
        ) const;
        /*!
            requires
                - in_vector_size() != 0 
                - current_n() > 1
            ensures
                - returns the unbiased sample covariance matrix for all the vectors 
                  presented to this object so far.
        !*/

        const running_covariance operator+ (
            const running_covariance& item
        ) const;
        /*!
            requires
                - in_vector_size() == 0 || item.in_vector_size() == 0 || in_vector_size() == item.in_vector_size()
                  (i.e. the in_vector_size() of *this and item must match or one must be zero)
            ensures
                - returns a new running_covariance object that represents the combination of all 
                  the vectors given to *this and item.  That is, this function returns a
                  running_covariance object, R, that is equivalent to what you would obtain if all
                  calls to this->add() and item.add() had instead been done to R.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class running_cross_covariance
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            INITIAL VALUE
                - x_vector_size() == 0
                - y_vector_size() == 0
                - current_n() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a simple tool for computing the mean and cross-covariance
                matrices of a sequence of pairs of vectors.  
        !*/

    public:

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        running_cross_covariance(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear(
        );
        /*!
            ensures
                - This object has its initial value.
                - Clears all memory of any previous data points.
        !*/

        long x_vector_size (
        ) const;
        /*!
            ensures
                - if (this object has been presented with any input vectors or
                  set_dimensions() has been called) then
                    - returns the dimension of the x vectors given to this object via add().
                - else
                    - returns 0
        !*/

        long y_vector_size (
        ) const;
        /*!
            ensures
                - if (this object has been presented with any input vectors or
                  set_dimensions() has been called) then
                    - returns the dimension of the y vectors given to this object via add().
                - else
                    - returns 0
        !*/

        void set_dimensions (
            long x_size,
            long y_size
        );
        /*!
            requires
                - x_size > 0
                - y_size > 0
            ensures
                - #x_vector_size() == x_size
                - #y_vector_size() == y_size
                - #current_n() == 0
        !*/

        long current_n (
        ) const;
        /*!
            ensures
                - returns the number of samples that have been presented to this object.
        !*/

        template <typename T, typename U>
        void add (
            const T& x,
            const U& y
        );
        /*!
            requires
                - x and y must represent column vectors.  They can either be dlib::matrix
                  objects or some kind of unsorted sparse vector type.  See the top of
                  dlib/svm/sparse_vector_abstract.h for a definition of unsorted sparse vector.
                - x and y must have a number of dimensions which is compatible with the
                  current setting of x_vector_size() and y_vector_size().  In particular,
                  this means that the following must hold:
                    - if (x or y is a sparse vector type) then
                        - x_vector_size() > 0 && y_vector_size() > 0
                          (i.e. you must call set_dimensions() prior to calling add() if
                          you want to use sparse vectors.)
                    - if (x is a dlib::matrix) then 
                        - x_vector_size() == 0 || x.size() == x_vector_size()
                    - else
                        - max_index_plus_one(x) <= x_vector_size()
                    - if (y is a dlib::matrix) then 
                        - y_vector_size() == 0 || y.size() == y_vector_size()
                    - else
                        - max_index_plus_one(y) <= y_vector_size()
            ensures
                - updates the mean and cross-covariance matrices stored in this object so
                  that the new (x,y) vector pair is factored into them.
                - if (x is a dlib::matrix) then
                    - #x_vector_size() == x.size()
                - if (y is a dlib::matrix) then
                    - #y_vector_size() == y.size()
        !*/

        const column_matrix mean_x (
        ) const;
        /*!
            requires
                - current_n() != 0 
            ensures
                - returns the mean of all the x vectors presented to this object so far.
                - The returned vector will have x_vector_size() dimensions.
        !*/

        const column_matrix mean_y (
        ) const;
        /*!
            requires
                - current_n() != 0 
            ensures
                - returns the mean of all the y vectors presented to this object so far.
                - The returned vector will have y_vector_size() dimensions.
        !*/

        const general_matrix covariance_xy (
        ) const;
        /*!
            requires
                - current_n() > 1
            ensures
                - returns the unbiased sample cross-covariance matrix for all the vector
                  pairs presented to this object so far.  In particular, returns a matrix
                  M such that:
                    - M.nr() == x_vector_size()
                    - M.nc() == y_vector_size()
                    - M == the cross-covariance matrix of the data given to add().
        !*/

        const running_cross_covariance operator+ (
            const running_cross_covariance& item
        ) const;
        /*!
            requires
                - x_vector_size() == 0 || item.x_vector_size() == 0 || x_vector_size() == item.x_vector_size()
                  (i.e. the x_vector_size() of *this and item must match or one must be zero)
                - y_vector_size() == 0 || item.y_vector_size() == 0 || y_vector_size() == item.y_vector_size()
                  (i.e. the y_vector_size() of *this and item must match or one must be zero)
            ensures
                - returns a new running_cross_covariance object that represents the
                  combination of all the vectors given to *this and item.  That is, this
                  function returns a running_cross_covariance object, R, that is equivalent
                  to what you would obtain if all calls to this->add() and item.add() had
                  instead been done to R.
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

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can learn to normalize a set 
                of column vectors.  In particular, normalized column vectors should 
                have zero mean and a variance of one.  

                Also, if desired, this object can use principal component 
                analysis for the purposes of reducing the number of elements in a 
                vector.  

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

        template <typename vector_type>
        void train (
            const vector_type& samples
        );
        /*!
            requires
                - samples.size() > 0
                - samples == a column matrix or something convertible to a column 
                  matrix via mat().  Also, x should contain 
                  matrix_type objects that represent nonempty column vectors.
                - samples does not contain any infinite or NaN values
            ensures
                - #in_vector_size() == samples(0).nr()
                - #out_vector_size() == samples(0).nr()
                - This object has learned how to normalize vectors that look like
                  vectors in the given set of samples.  
                - #means() == mean(samples)
                - #std_devs() == reciprocal(sqrt(variance(samples)));
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

        const matrix_type& means (
        ) const;
        /*!
            ensures               
                - returns a matrix M such that:
                    - M.nc() == 1
                    - M.nr() == in_vector_size()
                    - M(i) == the mean of the ith input feature shown to train()
        !*/

        const matrix_type& std_devs (
        ) const;
        /*!
            ensures               
                - returns a matrix SD such that:
                    - SD.nc() == 1
                    - SD.nr() == in_vector_size()
                    - SD(i) == the reciprocal of the standard deviation of the ith 
                      input feature shown to train() 
        !*/
 
        const result_type& operator() (
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
                    - the mean of each element of Z is 0 
                    - the variance of each element of Z is 1
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

    template <
        typename matrix_type
        >
    class vector_normalizer_pca
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
                of column vectors.  In particular, normalized column vectors should 
                have zero mean and a variance of one.  

                Also, this object uses principal component analysis for the purposes 
                of reducing the number of elements in a vector.  

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
        typedef matrix<scalar_type,0,1,mem_manager_type> result_type;

        template <typename vector_type>
        void train (
            const vector_type& samples,
            const double eps = 0.99
        );
        /*!
            requires
                - 0 < eps <= 1
                - samples.size() > 0
                - samples == a column matrix or something convertible to a column 
                  matrix via mat().  Also, x should contain 
                  matrix_type objects that represent nonempty column vectors.
                - samples does not contain any infinite or NaN values
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
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& std_devs (
        ) const;
        /*!
            ensures               
                - returns a matrix SD such that:
                    - SD.nc() == 1
                    - SD.nr() == in_vector_size()
                    - SD(i) == the reciprocal of the standard deviation of the ith 
                      input feature shown to train() 
        !*/
 
        const matrix<scalar_type,0,0,mem_manager_type>& pca_matrix (
        ) const;
        /*!
            ensures
                - returns a matrix PCA such that:
                    - PCA.nr() == out_vector_size()
                    - PCA.nc() == in_vector_size()
                    - PCA == the principal component analysis transformation 
                      matrix 
        !*/

        const result_type& operator() (
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
                    - the mean of each element of Z is 0 
                    - the variance of each element of Z is 1
                    - Z == pca_matrix()*pointwise_multiply(x-means(), std_devs());
        !*/

        void swap (
            vector_normalizer_pca& item
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
        vector_normalizer_pca<matrix_type>& a, 
        vector_normalizer_pca<matrix_type>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename matrix_type,
        >
    void deserialize (
        vector_normalizer_pca<matrix_type>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

    template <
        typename matrix_type,
        >
    void serialize (
        const vector_normalizer_pca<matrix_type>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATISTICs_ABSTRACT_

