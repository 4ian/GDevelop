// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DPCA_h_
#define DLIB_DPCA_h_

#include "dpca_abstract.h"
#include <limits>
#include <cmath>
#include "../algs.h"
#include "../matrix.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class discriminant_pca
    {
        /*!
            INITIAL VALUE
                - vect_size == 0
                - total_count == 0
                - between_count == 0
                - within_count == 0
                - between_weight == 1
                - within_weight == 1

            CONVENTION
                - vect_size == in_vector_size()
                - total_count == the number of times add_to_total_variance() has been called.
                - within_count == the number of times add_to_within_class_variance() has been called.
                - between_count == the number of times add_to_between_class_variance() has been called.
                - between_weight == between_class_weight()
                - within_weight == within_class_weight()

                - if (total_count != 0)
                    - total_sum == the sum of all vectors given to add_to_total_variance()
                    - the covariance of all the elements given to add_to_total_variance() is given
                      by:
                        - let avg == total_sum/total_count
                        - covariance == total_cov/total_count - avg*trans(avg)
                - if (within_count != 0)
                    - within_cov/within_count == the normalized within class scatter matrix  
                - if (between_count != 0)
                    - between_cov/between_count == the normalized between class scatter matrix  
        !*/

    public:

        struct discriminant_pca_error : public error
        {
            discriminant_pca_error(const std::string& message): error(message) {}
        };

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        discriminant_pca (
        ) 
        {
            clear();
        }

        void clear(
        )
        {
            total_count = 0;
            between_count = 0;
            within_count = 0;

            vect_size = 0;


            between_weight = 1;
            within_weight = 1;


            total_sum.set_size(0);
            between_cov.set_size(0,0);
            total_cov.set_size(0,0);
            within_cov.set_size(0,0);
        }

        long in_vector_size (
        ) const
        {
            return vect_size;
        }

        void set_within_class_weight (
            scalar_type weight
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(weight >= 0,
                "\t void discriminant_pca::set_within_class_weight()"
                << "\n\t You can't use negative weight values"
                << "\n\t weight: " << weight 
                << "\n\t this:   " << this
                );

            within_weight = weight;
        }

        scalar_type within_class_weight (
        ) const
        {
            return within_weight;
        }

        void set_between_class_weight (
            scalar_type weight
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(weight >= 0,
                "\t void discriminant_pca::set_between_class_weight()"
                << "\n\t You can't use negative weight values"
                << "\n\t weight: " << weight 
                << "\n\t this:   " << this
                );

            between_weight = weight;
        }

        scalar_type between_class_weight (
        ) const
        {
            return between_weight;
        }

        template <typename EXP1, typename EXP2>
        void add_to_within_class_variance(
            const matrix_exp<EXP1>& x,
            const matrix_exp<EXP2>& y
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) && is_col_vector(y) && 
                         x.size() == y.size() &&
                         (in_vector_size() == 0 || x.size() == in_vector_size()),
                "\t void discriminant_pca::add_to_within_class_variance()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t is_col_vector(x): " << is_col_vector(x) 
                << "\n\t is_col_vector(y): " << is_col_vector(y) 
                << "\n\t x.size():         " << x.size() 
                << "\n\t y.size():         " << y.size() 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t this:             " << this
                );

            vect_size = x.size();
            if (within_count == 0)
            {
                within_cov = (x-y)*trans(x-y);
            }
            else
            {
                within_cov += (x-y)*trans(x-y);
            }
            ++within_count;
        }

        template <typename EXP1, typename EXP2>
        void add_to_between_class_variance(
            const matrix_exp<EXP1>& x,
            const matrix_exp<EXP2>& y
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) && is_col_vector(y) && 
                         x.size() == y.size() &&
                         (in_vector_size() == 0 || x.size() == in_vector_size()),
                "\t void discriminant_pca::add_to_between_class_variance()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t is_col_vector(x): " << is_col_vector(x) 
                << "\n\t is_col_vector(y): " << is_col_vector(y) 
                << "\n\t x.size():         " << x.size() 
                << "\n\t y.size():         " << y.size() 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t this:             " << this
                );

            vect_size = x.size();
            if (between_count == 0)
            {
                between_cov = (x-y)*trans(x-y);
            }
            else
            {
                between_cov += (x-y)*trans(x-y);
            }
            ++between_count;
        }

        template <typename EXP>
        void add_to_total_variance(
            const matrix_exp<EXP>& x
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) && (in_vector_size() == 0 || x.size() == in_vector_size()),
                "\t void discriminant_pca::add_to_total_variance()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t is_col_vector(x): " << is_col_vector(x) 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t x.size():         " << x.size() 
                << "\n\t this:             " << this
                );

            vect_size = x.size();
            if (total_count == 0)
            {
                total_cov = x*trans(x);
                total_sum = x;
            }
            else
            {
                total_cov += x*trans(x);
                total_sum += x;
            }
            ++total_count;
        }

        const general_matrix dpca_matrix (
            const double eps = 0.99
        ) const
        {
            general_matrix dpca_mat;
            general_matrix eigenvalues;
            dpca_matrix(dpca_mat, eigenvalues, eps);
            return dpca_mat;
        }

        const general_matrix dpca_matrix_of_size (
            const long num_rows 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < num_rows && num_rows <= in_vector_size(),
                "\t general_matrix discriminant_pca::dpca_matrix_of_size()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t num_rows:         " << num_rows 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t this:             " << this
                );

            general_matrix dpca_mat;
            general_matrix eigenvalues;
            dpca_matrix_of_size(dpca_mat, eigenvalues, num_rows);
            return dpca_mat;
        }

        void dpca_matrix (
            general_matrix& dpca_mat,
            general_matrix& eigenvalues,
            const double eps = 0.99
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < eps && eps <= 1 && in_vector_size() != 0,
                "\t void discriminant_pca::dpca_matrix()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t eps:              " << eps 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t this:             " << this
                );

            compute_dpca_matrix(dpca_mat, eigenvalues, eps, 0);
        }

        void dpca_matrix_of_size (
            general_matrix& dpca_mat,
            general_matrix& eigenvalues,
            const long num_rows 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < num_rows && num_rows <= in_vector_size(),
                "\t general_matrix discriminant_pca::dpca_matrix_of_size()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t num_rows:         " << num_rows 
                << "\n\t in_vector_size(): " << in_vector_size() 
                << "\n\t this:             " << this
                );

            compute_dpca_matrix(dpca_mat, eigenvalues, 1, num_rows);
        }

        void swap (
            discriminant_pca& item
        )
        {
            using std::swap;
            swap(total_cov, item.total_cov);
            swap(total_sum, item.total_sum);
            swap(total_count, item.total_count);
            swap(vect_size, item.vect_size);
            swap(between_cov, item.between_cov);

            swap(between_count, item.between_count);
            swap(between_weight, item.between_weight);
            swap(within_cov, item.within_cov);
            swap(within_count, item.within_count);
            swap(within_weight, item.within_weight);
        }

        friend void deserialize (
            discriminant_pca& item, 
            std::istream& in
        )
        {
            deserialize( item.total_cov, in);
            deserialize( item.total_sum, in);
            deserialize( item.total_count, in);
            deserialize( item.vect_size, in);
            deserialize( item.between_cov, in);
            deserialize( item.between_count, in);
            deserialize( item.between_weight, in);
            deserialize( item.within_cov, in);
            deserialize( item.within_count, in);
            deserialize( item.within_weight, in);
        }

        friend void serialize (
            const discriminant_pca& item, 
            std::ostream& out 
        )   
        {
            serialize( item.total_cov, out);
            serialize( item.total_sum, out);
            serialize( item.total_count, out);
            serialize( item.vect_size, out);
            serialize( item.between_cov, out);
            serialize( item.between_count, out);
            serialize( item.between_weight, out);
            serialize( item.within_cov, out);
            serialize( item.within_count, out);
            serialize( item.within_weight, out);
        }

        const discriminant_pca operator+ (
            const discriminant_pca& item
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT((in_vector_size() == 0 || item.in_vector_size() == 0 || in_vector_size() == item.in_vector_size()) &&
                         between_class_weight() == item.between_class_weight() &&
                         within_class_weight() == item.within_class_weight(),
                "\t discriminant_pca discriminant_pca::operator+()"
                << "\n\t The two discriminant_pca objects being added must have compatible parameters"
                << "\n\t in_vector_size():            " << in_vector_size() 
                << "\n\t item.in_vector_size():       " << item.in_vector_size() 
                << "\n\t between_class_weight():      " << between_class_weight() 
                << "\n\t item.between_class_weight(): " << item.between_class_weight() 
                << "\n\t within_class_weight():       " << within_class_weight() 
                << "\n\t item.within_class_weight():  " << item.within_class_weight() 
                << "\n\t this:                        " << this
                );

            discriminant_pca temp(item);

            // We need to make sure to ignore empty matrices.  That's what these if statements
            // are for.

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

            if (between_count != 0 && temp.between_count != 0)
            {
                temp.between_cov += between_cov;
                temp.between_count += between_count;
            }
            else if (between_count != 0)
            {
                temp.between_cov = between_cov;
                temp.between_count = between_count;
            }

            if (within_count != 0 && temp.within_count != 0)
            {
                temp.within_cov += within_cov;
                temp.within_count += within_count;
            }
            else if (within_count != 0)
            {
                temp.within_cov = within_cov;
                temp.within_count = within_count;
            }

            return temp;
        }

    private:

        void compute_dpca_matrix (
            general_matrix& dpca_mat,
            general_matrix& eigenvalues,
            const double eps,
            long num_rows 
        ) const
        {
            general_matrix cov;

            // now combine the three measures of variance into a single matrix by using the
            // within_weight and between_weight weights.
            cov = get_total_covariance_matrix();
            if (within_count != 0)
                cov -= within_weight*within_cov/within_count; 
            if (between_count != 0)
                cov += between_weight*between_cov/between_count; 


            eigenvalue_decomposition<general_matrix> eig(make_symmetric(cov));

            eigenvalues = eig.get_real_eigenvalues();
            dpca_mat = eig.get_pseudo_v();

            // sort the eigenvalues and eigenvectors so that the biggest eigenvalues come first
            rsort_columns(dpca_mat, eigenvalues);

            long num_vectors = 0;
            if (num_rows == 0)
            {
                // Some of the eigenvalues might be negative.  So first lets zero those out
                // so they won't get considered.
                eigenvalues = pointwise_multiply(eigenvalues > 0, eigenvalues);
                // figure out how many eigenvectors we want in our dpca matrix
                const double thresh = sum(eigenvalues)*eps;
                double total = 0;
                for (long r = 0; r < eigenvalues.size() && total < thresh; ++r)
                {
                    // Don't even think about looking at eigenvalues that are 0.  If we go this
                    // far then we have all we need.
                    if (eigenvalues(r) == 0)
                        break;

                    ++num_vectors;
                    total += eigenvalues(r);
                }

                if (num_vectors == 0)
                    throw discriminant_pca_error("While performing discriminant_pca, all eigenvalues were negative or 0");
            }
            else
            {
                num_vectors = num_rows;
            }


            // So now we know we want to use num_vectors of the first eigenvectors.  So
            // pull those out and discard the rest.
            dpca_mat = trans(colm(dpca_mat,range(0,num_vectors-1)));

            // also clip off the eigenvalues we aren't using
            eigenvalues = rowm(eigenvalues, range(0,num_vectors-1));

        }

        general_matrix get_total_covariance_matrix (
        ) const
        /*!
            ensures
                - returns the covariance matrix of all the data given to the add_to_total_variance()
        !*/
        {
            // if we don't even know the dimensionality of the vectors we are dealing
            // with then just return an empty matrix
            if (vect_size == 0)
                return general_matrix();

            // we know the vector size but we have zero total covariance.  
            if (total_count == 0)
            {
                general_matrix temp(vect_size,vect_size);
                temp = 0;
                return temp;
            }

            // In this case we actually have something to make a total covariance matrix out of. 
            // So do that.
            column_matrix avg = total_sum/total_count;

            return total_cov/total_count - avg*trans(avg);
        }

        general_matrix total_cov;
        column_matrix total_sum;
        scalar_type total_count;

        long vect_size;

        general_matrix between_cov;
        scalar_type between_count;
        scalar_type between_weight;

        general_matrix within_cov;
        scalar_type within_count;
        scalar_type within_weight;
    };

    template <
        typename matrix_type
        >
    inline void swap (
        discriminant_pca<matrix_type>& a, 
        discriminant_pca<matrix_type>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DPCA_h_


