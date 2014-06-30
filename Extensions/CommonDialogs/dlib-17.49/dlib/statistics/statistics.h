// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATISTICs_
#define DLIB_STATISTICs_

#include "statistics_abstract.h"
#include <limits>
#include <cmath>
#include "../algs.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class running_stats
    {
    public:

        running_stats()
        {
            clear();

            COMPILE_TIME_ASSERT ((
                    is_same_type<float,T>::value ||
                    is_same_type<double,T>::value ||
                    is_same_type<long double,T>::value 
            ));
        }

        void clear()
        {
            sum = 0;
            sum_sqr = 0;
            n = 0;
            maximum_n = std::numeric_limits<T>::max();
            min_value = std::numeric_limits<T>::infinity();
            max_value = -std::numeric_limits<T>::infinity();
        }

        void set_max_n (
            const T& val
        )
        {
            maximum_n = val;
        }

        void add (
            const T& val
        )
        {
            sum     += val;
            sum_sqr += val*val;

            if (val < min_value)
                min_value = val;
            if (val > max_value)
                max_value = val;

            if (n < maximum_n)
                ++n;
        }

        T max_n (
        ) const
        {
            return maximum_n;
        }

        T current_n (
        ) const
        {
            return n;
        }

        T mean (
        ) const
        {
            if (n != 0)
                return sum/n;
            else
                return 0;
        }

        T max (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 0,
                "\tT running_stats::max"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return max_value;
        }

        T min (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 0,
                "\tT running_stats::min"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return min_value;
        }

        T variance (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_stats::variance"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            T temp = 1/(n-1);
            temp = temp*(sum_sqr - sum*sum/n);
            // make sure the variance is never negative.  This might
            // happen due to numerical errors.
            if (temp >= 0)
                return temp;
            else
                return 0;
        }

        T stddev (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_stats::stddev"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return std::sqrt(variance());
        }

        T scale (
            const T& val
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_stats::variance"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );
            return (val-mean())/std::sqrt(variance());
        }

        running_stats operator+ (
            const running_stats& rhs
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(max_n() == rhs.max_n(),
                "\trunning_stats running_stats::operator+(rhs)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t max_n():     " << max_n() 
                << "\n\t rhs.max_n(): " << rhs.max_n() 
                << "\n\t this:        " << this
                );

            running_stats temp(*this);

            temp.sum += rhs.sum;
            temp.sum_sqr += rhs.sum_sqr;
            temp.n += rhs.n;
            temp.min_value = std::min(rhs.min_value, min_value);
            temp.max_value = std::max(rhs.max_value, max_value);
            return temp;
        }

        template <typename U>
        friend void serialize (
            const running_stats<U>& item, 
            std::ostream& out 
        );

        template <typename U>
        friend void deserialize (
            running_stats<U>& item, 
            std::istream& in
        ); 

    private:
        T sum;
        T sum_sqr;
        T n;
        T maximum_n;
        T min_value;
        T max_value;
    };

    template <typename T>
    void serialize (
        const running_stats<T>& item, 
        std::ostream& out 
    )
    {
        serialize(item.sum, out);
        serialize(item.sum_sqr, out);
        serialize(item.n, out);
        serialize(item.maximum_n, out);
        serialize(item.min_value, out);
        serialize(item.max_value, out);
    }

    template <typename T>
    void deserialize (
        running_stats<T>& item, 
        std::istream& in
    ) 
    {
        deserialize(item.sum, in);
        deserialize(item.sum_sqr, in);
        deserialize(item.n, in);
        deserialize(item.maximum_n, in);
        deserialize(item.min_value, in);
        deserialize(item.max_value, in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class running_scalar_covariance
    {
    public:

        running_scalar_covariance()
        {
            clear();

            COMPILE_TIME_ASSERT ((
                    is_same_type<float,T>::value ||
                    is_same_type<double,T>::value ||
                    is_same_type<long double,T>::value 
            ));
        }

        void clear()
        {
            sum_xy = 0;
            sum_x = 0;
            sum_y = 0;
            sum_xx = 0;
            sum_yy = 0;
            n = 0;
        }

        void add (
            const T& x,
            const T& y
        )
        {
            sum_xy += x*y;

            sum_xx += x*x;
            sum_yy += y*y;

            sum_x  += x;
            sum_y  += y;

            n += 1;
        }

        T current_n (
        ) const
        {
            return n;
        }

        T mean_x (
        ) const
        {
            if (n != 0)
                return sum_x/n;
            else
                return 0;
        }

        T mean_y (
        ) const
        {
            if (n != 0)
                return sum_y/n;
            else
                return 0;
        }

        T covariance (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::covariance()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            T temp = 1/(n-1) * (sum_xy - sum_y*sum_x/n);
            // make sure the variance is never negative.  This might
            // happen due to numerical errors.
            if (temp >= 0)
                return temp;
            else
                return 0;
        }

        T correlation (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::correlation()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return covariance() / std::sqrt(variance_x()*variance_y());
        }

        T variance_x (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::variance_x()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            T temp = 1/(n-1) * (sum_xx - sum_x*sum_x/n);
            // make sure the variance is never negative.  This might
            // happen due to numerical errors.
            if (temp >= 0)
                return temp;
            else
                return 0;
        }

        T variance_y (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::variance_y()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            T temp = 1/(n-1) * (sum_yy - sum_y*sum_y/n);
            // make sure the variance is never negative.  This might
            // happen due to numerical errors.
            if (temp >= 0)
                return temp;
            else
                return 0;
        }

        T stddev_x (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::stddev_x()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return std::sqrt(variance_x());
        }

        T stddev_y (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
                "\tT running_scalar_covariance::stddev_y()"
                << "\n\tyou have to add some numbers to this object first"
                << "\n\tthis: " << this
                );

            return std::sqrt(variance_y());
        }

        running_scalar_covariance operator+ (
            const running_scalar_covariance& rhs
        ) const
        {
            running_scalar_covariance temp(rhs);

            temp.sum_xy += sum_xy;
            temp.sum_x  += sum_x;
            temp.sum_y  += sum_y;
            temp.sum_xx += sum_xx;
            temp.sum_yy += sum_yy;
            temp.n      += n;
            return temp;
        }

    private:

        T sum_xy;
        T sum_x;
        T sum_y;
        T sum_xx;
        T sum_yy;
        T n;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double mean_sign_agreement (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(a.size() == b.size(),
                    "\t double mean_sign_agreement(a,b)"
                    << "\n\t a and b must be the same length."
                    << "\n\t a.size(): " << a.size()
                    << "\n\t b.size(): " << b.size()
        );

        
        double temp = 0;
        for (unsigned long i = 0; i < a.size(); ++i)
        {
            if ((a[i] >= 0 && b[i] >= 0) ||
                (a[i] < 0  && b[i] <  0))
            {
                temp += 1;
            }
        }

        return temp/a.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double correlation (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(a.size() == b.size() && a.size() > 1,
                    "\t double correlation(a,b)"
                    << "\n\t a and b must be the same length and have more than one element."
                    << "\n\t a.size(): " << a.size()
                    << "\n\t b.size(): " << b.size()
        );

        running_scalar_covariance<double> rs;
        for (unsigned long i = 0; i < a.size(); ++i)
        {
            rs.add(a[i], b[i]);
        }
        return rs.correlation();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double covariance (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(a.size() == b.size() && a.size() > 1,
                    "\t double covariance(a,b)"
                    << "\n\t a and b must be the same length and have more than one element."
                    << "\n\t a.size(): " << a.size()
                    << "\n\t b.size(): " << b.size()
        );

        running_scalar_covariance<double> rs;
        for (unsigned long i = 0; i < a.size(); ++i)
        {
            rs.add(a[i], b[i]);
        }
        return rs.covariance();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double r_squared (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(a.size() == b.size() && a.size() > 1,
                    "\t double r_squared(a,b)"
                    << "\n\t a and b must be the same length and have more than one element."
                    << "\n\t a.size(): " << a.size()
                    << "\n\t b.size(): " << b.size()
        );

        return std::pow(correlation(a,b),2.0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double mean_squared_error (
        const std::vector<T,alloc>& a,
        const std::vector<T,alloc>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(a.size() == b.size(),
                    "\t double mean_squared_error(a,b)"
                    << "\n\t a and b must be the same length."
                    << "\n\t a.size(): " << a.size()
                    << "\n\t b.size(): " << b.size()
        );

        return mean(squared(matrix_cast<double>(vector_to_matrix(a))-matrix_cast<double>(vector_to_matrix(b))));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class running_covariance
    {
        /*!
            INITIAL VALUE
                - vect_size == 0
                - total_count == 0

            CONVENTION
                - vect_size == in_vector_size()
                - total_count == current_n() 

                - if (total_count != 0)
                    - total_sum == the sum of all vectors given to add()
                    - the covariance of all the elements given to add() is given
                      by:
                        - let avg == total_sum/total_count
                        - covariance == total_cov/total_count - avg*trans(avg)
        !*/
    public:

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        running_covariance(
        )
        {
            clear();
        }

        void clear(
        )
        {
            total_count = 0;

            vect_size = 0;

            total_sum.set_size(0);
            total_cov.set_size(0,0);
        }

        long in_vector_size (
        ) const
        {
            return vect_size;
        }

        long current_n (
        ) const
        {
            return static_cast<long>(total_count);
        }

        template <typename EXP>
        void add (
            const matrix_exp<EXP>& val
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(val) && (in_vector_size() == 0 || val.size() == in_vector_size()),
                "\t void running_covariance::add()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t is_col_vector(val): " << is_col_vector(val) 
                << "\n\t in_vector_size():   " << in_vector_size() 
                << "\n\t val.size():         " << val.size() 
                << "\n\t this:               " << this
                );

            vect_size = val.size();
            if (total_count == 0)
            {
                total_cov = val*trans(val);
                total_sum = val;
            }
            else
            {
                total_cov += val*trans(val);
                total_sum += val;
            }
            ++total_count;
        }

        const column_matrix mean (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( in_vector_size() != 0,
                "\t running_covariance::mean()"
                << "\n\t This object can not execute this function in its current state."
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t current_n():      " << current_n() 
                << "\n\t this:             " << this
                );

            return total_sum/total_count;
        }

        const general_matrix covariance (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( in_vector_size() != 0 && current_n() > 1,
                "\t running_covariance::covariance()"
                << "\n\t This object can not execute this function in its current state."
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t current_n():      " << current_n() 
                << "\n\t this:             " << this
                );

            return (total_cov - total_sum*trans(total_sum)/total_count)/(total_count-1);
        }

        const running_covariance operator+ (
            const running_covariance& item
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT((in_vector_size() == 0 || item.in_vector_size() == 0 || in_vector_size() == item.in_vector_size()),
                "\t running_covariance running_covariance::operator+()"
                << "\n\t The two running_covariance objects being added must have compatible parameters"
                << "\n\t in_vector_size():            " << in_vector_size() 
                << "\n\t item.in_vector_size():       " << item.in_vector_size() 
                << "\n\t this:                        " << this
                );

            running_covariance temp(item);

            // make sure we ignore empty matrices
            if (total_count != 0 && temp.total_count != 0)
            {
                temp.total_cov += total_cov;
                temp.total_sum += total_sum;
                temp.total_count += total_count;
            }
            else if (total_count != 0)
            {
                temp.total_cov = total_cov;
                temp.total_sum = total_sum;
                temp.total_count = total_count;
            }

            return temp;
        }


    private:

        general_matrix total_cov;
        column_matrix total_sum;
        scalar_type total_count;

        long vect_size;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class vector_normalizer
    {
    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef matrix_type result_type;

        template <typename vector_type>
        void train (
            const vector_type& samples
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(samples.size() > 0,
                "\tvoid vector_normalizer::train()"
                << "\n\tyou have to give a nonempty set of samples to this function"
                << "\n\tthis: " << this
                );

            m = mean(vector_to_matrix(samples));
            sd = reciprocal(sqrt(variance(vector_to_matrix(samples))));
        }

        long in_vector_size (
        ) const
        {
            return m.nr();
        }

        long out_vector_size (
        ) const
        {
            return m.nr();
        }

        const matrix_type& means (
        ) const
        {
            return m;
        }

        const matrix_type& std_devs (
        ) const
        {
            return sd;
        }

        const result_type& operator() (
            const matrix_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(x.nr() == in_vector_size() && x.nc() == 1,
                "\tmatrix vector_normalizer::operator()"
                << "\n\t you have given invalid arguments to this function"
                << "\n\t x.nr():           " << x.nr()
                << "\n\t in_vector_size(): " << in_vector_size()
                << "\n\t x.nc():           " << x.nc()
                << "\n\t this:             " << this
                );

            temp_out = pointwise_multiply(x-m, sd);
            return temp_out;
        }

        void swap (
            vector_normalizer& item
        )
        {
            m.swap(item.m);
            sd.swap(item.sd);
            temp_out.swap(item.temp_out);
        }

        template <typename mt>
        friend void deserialize (
            vector_normalizer<mt>& item, 
            std::istream& in
        ); 

        template <typename mt>
        friend void serialize (
            const vector_normalizer<mt>& item, 
            std::ostream& out 
        );

    private:

        // ------------------- private data members -------------------

        matrix_type m, sd;

        // This is just a temporary variable that doesn't contribute to the
        // state of this object.
        mutable matrix_type temp_out;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    inline void swap (
        vector_normalizer<matrix_type>& a, 
        vector_normalizer<matrix_type>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void deserialize (
        vector_normalizer<matrix_type>& item, 
        std::istream& in
    )   
    {
        deserialize(item.m, in);
        deserialize(item.sd, in);
        // Keep deserializing the pca matrix for backwards compatibility.
        matrix<double> pca;
        deserialize(pca, in);

        if (pca.size() != 0)
            throw serialization_error("Error deserializing object of type vector_normalizer\n"   
                                        "It looks like a serialized vector_normalizer_pca was accidentally deserialized into \n"
                                        "a vector_normalizer object.");
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void serialize (
        const vector_normalizer<matrix_type>& item, 
        std::ostream& out 
    )
    {
        serialize(item.m, out);
        serialize(item.sd, out);
        // Keep serializing the pca matrix for backwards compatibility.
        matrix<double> pca;
        serialize(pca, out);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class vector_normalizer_pca
    {
    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef matrix<scalar_type,0,1,mem_manager_type> result_type;

        template <typename vector_type>
        void train (
            const vector_type& samples,
            const double eps = 0.99
        )
        {
            // You are getting an error here because you are trying to apply PCA
            // to a vector of fixed length.  But PCA is going to try and do 
            // dimensionality reduction so you can't use a vector with a fixed dimension.
            COMPILE_TIME_ASSERT(matrix_type::NR == 0);

            // make sure requires clause is not broken
            DLIB_ASSERT(samples.size() > 0,
                "\tvoid vector_normalizer_pca::train_pca()"
                << "\n\tyou have to give a nonempty set of samples to this function"
                << "\n\tthis: " << this
                );
            DLIB_ASSERT(0 < eps && eps <= 1,
                "\tvoid vector_normalizer_pca::train_pca()"
                << "\n\tyou have to give a nonempty set of samples to this function"
                << "\n\tthis: " << this
                );
            train_pca_impl(vector_to_matrix(samples),eps);
        }

        long in_vector_size (
        ) const
        {
            return m.nr();
        }

        long out_vector_size (
        ) const
        {
            return pca.nr();
        }

        const matrix<scalar_type,0,1,mem_manager_type>& means (
        ) const
        {
            return m;
        }

        const matrix<scalar_type,0,1,mem_manager_type>& std_devs (
        ) const
        {
            return sd;
        }

        const matrix<scalar_type,0,0,mem_manager_type>& pca_matrix (
        ) const
        {
            return pca;
        }

        const result_type& operator() (
            const matrix_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(x.nr() == in_vector_size() && x.nc() == 1,
                "\tmatrix vector_normalizer_pca::operator()"
                << "\n\t you have given invalid arguments to this function"
                << "\n\t x.nr():           " << x.nr()
                << "\n\t in_vector_size(): " << in_vector_size()
                << "\n\t x.nc():           " << x.nc()
                << "\n\t this:             " << this
                );

            // If we have a pca transform matrix on hand then
            // also apply that.
            temp_out = pca*pointwise_multiply(x-m, sd);

            return temp_out;
        }

        void swap (
            vector_normalizer_pca& item
        )
        {
            m.swap(item.m);
            sd.swap(item.sd);
            pca.swap(item.pca);
            temp_out.swap(item.temp_out);
        }

        template <typename T>
        friend void deserialize (
            vector_normalizer_pca<T>& item, 
            std::istream& in
        );

        template <typename T>
        friend void serialize (
            const vector_normalizer_pca<T>& item, 
            std::ostream& out 
        );

    private:

        template <typename mat_type>
        void train_pca_impl (
            const mat_type& samples,
            const double eps 
        )
        {
            m = mean(samples);
            sd = reciprocal(sqrt(variance(samples)));

            // fill x with the normalized version of the input samples
            matrix<typename mat_type::type,0,1,mem_manager_type> x(samples);
            for (long r = 0; r < x.size(); ++r)
                x(r) = pointwise_multiply(x(r)-m, sd);

            matrix<scalar_type,0,0,mem_manager_type> temp, eigen;
            matrix<scalar_type,0,1,mem_manager_type> eigenvalues;

            // Compute the svd of the covariance matrix of the normalized inputs
            svd(covariance(x), temp, eigen, pca);
            eigenvalues = diag(eigen);

            rsort_columns(pca, eigenvalues);

            // figure out how many eigenvectors we want in our pca matrix
            const double thresh = sum(eigenvalues)*eps;
            long num_vectors = 0;
            double total = 0;
            for (long r = 0; r < eigenvalues.size() && total < thresh; ++r)
            {
                ++num_vectors;
                total += eigenvalues(r);
            }

            // So now we know we want to use num_vectors of the first eigenvectors.  So
            // pull those out and discard the rest.
            pca = trans(colm(pca,range(0,num_vectors-1)));

            // Apply the pca transform to the data in x.  Then we will normalize the
            // pca matrix below.
            for (long r = 0; r < x.nr(); ++r)
            {
                x(r) = pca*x(r);
            }

            // Here we just scale the output features from the pca transform so 
            // that the variance of each feature is 1.  So this doesn't really change
            // what the pca is doing, it just makes sure the output features are
            // normalized.
            pca = trans(scale_columns(trans(pca), reciprocal(sqrt(variance(x)))));
        }


        // ------------------- private data members -------------------

        matrix<scalar_type,0,1,mem_manager_type> m, sd;
        matrix<scalar_type,0,0,mem_manager_type> pca;

        // This is just a temporary variable that doesn't contribute to the
        // state of this object.
        mutable result_type temp_out;
    };

    template <
        typename matrix_type
        >
    inline void swap (
        vector_normalizer_pca<matrix_type>& a, 
        vector_normalizer_pca<matrix_type>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void deserialize (
        vector_normalizer_pca<matrix_type>& item, 
        std::istream& in
    )   
    {
        deserialize(item.m, in);
        deserialize(item.sd, in);
        deserialize(item.pca, in);
        if (item.pca.nc() != item.m.nr())
            throw serialization_error("Error deserializing object of type vector_normalizer_pca\n"   
                                        "It looks like a serialized vector_normalizer was accidentally deserialized into \n"
                                        "a vector_normalizer_pca object.");
    }

    template <
        typename matrix_type
        >
    void serialize (
        const vector_normalizer_pca<matrix_type>& item, 
        std::ostream& out 
    )
    {
        serialize(item.m, out);
        serialize(item.sd, out);
        serialize(item.pca, out);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATISTICs_

