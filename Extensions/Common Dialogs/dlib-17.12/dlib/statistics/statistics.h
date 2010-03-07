// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
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
            const T div_n   = 1/(n+1);
            const T n_div_n = n*div_n;

            sum     = n_div_n*sum     + val*div_n;
            sum_sqr = n_div_n*sum_sqr + val*div_n*val;

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
            return max_n;
        }

        T current_n (
        ) const
        {
            return n;
        }

        T mean (
        ) const
        {
            return sum;
        }

        T max (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(current_n() > 1,
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
            DLIB_ASSERT(current_n() > 1,
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

            T temp = n/(n-1);
            temp = temp*(sum_sqr - sum*sum);
            // make sure the variance is never negative.  This might
            // happen due to numerical errors.
            if (temp >= 0)
                return temp;
            else
                return 0;
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

    private:
        T sum;
        T sum_sqr;
        T n;
        T maximum_n;
        T min_value;
        T max_value;
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
            pca.set_size(0,0);
        }

        template <typename vector_type>
        void train_pca (
            const vector_type& samples,
            const double eps = 0.99
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(samples.size() > 0,
                "\tvoid vector_normalizer::train_pca()"
                << "\n\tyou have to give a nonempty set of samples to this function"
                << "\n\tthis: " << this
                );
            DLIB_ASSERT(0 < eps && eps <= 1,
                "\tvoid vector_normalizer::train_pca()"
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
            if (pca.size() == 0)
                return m.nr();
            else
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

        const matrix<scalar_type,0,1,mem_manager_type>& operator() (
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

            if (pca.size() == 0)
            {
                temp_out = pointwise_multiply(x-m, sd);
            }
            else
            {
                // If we have a pca transform matrix on hand then
                // also apply that.
                temp_out = pca*pointwise_multiply(x-m, sd);
            }
            return temp_out;
        }

        void swap (
            vector_normalizer& item
        )
        {
            m.swap(item.m);
            sd.swap(item.sd);
            pca.swap(item.pca);
            temp_out.swap(item.temp_out);
        }

        friend void deserialize (
            vector_normalizer& item, 
            std::istream& in
        )   
        {
            deserialize(item.m, in);
            deserialize(item.sd, in);
            deserialize(item.pca, in);
        }

        friend void serialize (
            const vector_normalizer& item, 
            std::ostream& out 
        )
        {
            serialize(item.m, out);
            serialize(item.sd, out);
            serialize(item.pca, out);
        }

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

            // so now we know we want to use num_vectors of the first eigenvectors.
            temp.set_size(num_vectors, eigen.nr());
            for (long i = 0; i < num_vectors; ++i)
            {
                set_rowm(temp,i) = trans(colm(pca,i));
            }
            temp.swap(pca);

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
        mutable matrix<scalar_type,0,1,mem_manager_type> temp_out;
    };

    template <
        typename matrix_type
        >
    inline void swap (
        vector_normalizer<matrix_type>& a, 
        vector_normalizer<matrix_type>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATISTICs_

