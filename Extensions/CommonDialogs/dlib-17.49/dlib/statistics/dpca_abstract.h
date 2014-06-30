// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DPCA_ABSTRaCT_
#ifdef DLIB_DPCA_ABSTRaCT_

#include <limits>
#include <cmath>
#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class discriminant_pca
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            INITIAL VALUE
                - in_vector_size() == 0
                - between_class_weight() == 1
                - within_class_weight() == 1

            WHAT THIS OBJECT REPRESENTS
                This object implements the Discriminant PCA technique described in the paper:
                    A New Discriminant Principal Component Analysis Method with Partial Supervision (2009)
                    by Dan Sun and Daoqiang Zhang

                This algorithm is basically a straightforward generalization of the classical PCA
                technique to handle partially labeled data.  It is useful if you want to learn a linear
                dimensionality reduction rule using a bunch of data that is partially labeled.  
                
                It functions by estimating three different scatter matrices.  The first is the total scatter 
                matrix St (i.e. the total data covariance matrix), the second is the between class scatter 
                matrix Sb (basically a measure of the variance between data of different classes) and the 
                third is the within class scatter matrix Sw (a measure of the variance of data within the 
                same classes).  

                Once these three matrices are estimated they are combined according to the following equation:
                   S = St + a*Sb - b*Sw
                Where a and b are user supplied weights.  Then the largest eigenvalues of the S matrix are 
                computed and their associated eigenvectors are returned as the output of this algorithm.  
                That is, the desired linear dimensionality reduction is given by the matrix with these 
                eigenvectors stored in its rows.

                Note that if a and b are set to 0 (or no labeled data is provided) then the output transformation
                matrix is the same as the one produced by the classical PCA algorithm.
        !*/

    public:

        struct discriminant_pca_error : public error;
        /*!
            This exception is thrown if there is some error that prevents us from creating
            a DPCA matrix.
        !*/

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        discriminant_pca (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
        !*/

        long in_vector_size (
        ) const;
        /*!
            ensures
                - if (this object has been presented with any input vectors) then
                    - returns the dimension of the column vectors used with this object
                - else
                    - returns 0
        !*/

        void set_within_class_weight (
            scalar_type weight
        );
        /*!
            requires
                - weight >= 0
            ensures
                - #within_class_weight() == weight
        !*/

        scalar_type within_class_weight (
        ) const;
        /*!
            ensures
                - returns the weight used when combining the within class scatter matrix with
                  the other scatter matrices.  
        !*/

        void set_between_class_weight (
            scalar_type weight
        );
        /*!
            requires
                - weight >= 0
            ensures
                - #between_class_weight() == weight
        !*/

        scalar_type between_class_weight (
        ) const;
        /*!
            ensures
                - returns the weight used when combining the between class scatter matrix with
                  the other scatter matrices.  
        !*/

        void add_to_within_class_variance(
            const matrix_exp& x,
            const matrix_exp& y
        );
        /*!
            requires
                - is_col_vector(x) == true
                - is_col_vector(y) == true
                - x.size() == y.size()
                - if (in_vector_size() != 0) then
                    - x.size() == y.size() == in_vector_size()
            ensures
                - #in_vector_size() == x.size()
                - Adds (x-y)*trans(x-y) to the within class scatter matrix.
                  (i.e. the direction given by (x-y) is recorded as being a direction associated
                  with within class variance and is therefore unimportant and will be weighted
                  less in the final dimensionality reduction)
        !*/

        void add_to_between_class_variance(
            const matrix_exp& x,
            const matrix_exp& y
        );
        /*!
            requires
                - is_col_vector(x) == true
                - is_col_vector(y) == true
                - x.size() == y.size()
                - if (in_vector_size() != 0) then
                    - x.size() == y.size() == in_vector_size()
            ensures
                - #in_vector_size() == x.size()
                - Adds (x-y)*trans(x-y) to the between class scatter matrix.
                  (i.e. the direction given by (x-y) is recorded as being a direction associated
                  with between class variance and is therefore important and will be weighted
                  higher in the final dimensionality reduction)
        !*/

        void add_to_total_variance(
            const matrix_exp& x
        );
        /*!
            requires
                - is_col_vector(x) == true
                - if (in_vector_size() != 0) then
                    - x.size() == in_vector_size()
            ensures
                - #in_vector_size() == x.size()
                - let M denote the centroid (or mean) of all the data.  Then this function 
                  Adds (x-M)*trans(x-M) to the total scatter matrix.
                  (i.e. the direction given by (x-M) is recorded as being a direction associated
                  with unlabeled variance and is therefore of default importance and will be weighted
                  as described in the discriminant_pca class description.)
        !*/

        const general_matrix dpca_matrix (
            const double eps = 0.99
        ) const;
        /*!
            requires
                - 0 < eps <= 1
                - in_vector_size() != 0
                  (i.e. you have to have given this object some data)
            ensures
                - computes and returns the matrix MAT given by dpca_matrix(MAT,eigen,eps).  
                  That is, this function returns the dpca_matrix computed by the function
                  defined below.  
                - Note that MAT is the desired linear transformation matrix.  That is, 
                  multiplying a vector by MAT performs the desired linear dimensionality reduction.
            throws
                - discriminant_pca_error
                    This exception is thrown if we are unable to create the dpca_matrix for some 
                    reason.  For example, if only within class examples have been given or
                    within_class_weight() is very large then all eigenvalues will be negative and
                    that prevents this algorithm from working properly.
        !*/

        void dpca_matrix (
            general_matrix& dpca_mat,
            general_matrix& eigenvalues,
            const double eps = 0.99
        ) const;
        /*!
            requires
                - 0 < eps <= 1
                - in_vector_size() != 0
                  (i.e. you have to have given this object some data)
            ensures
                - is_col_vector(#eigenvalues) == true
                - #dpca_mat.nr() == eigenvalues.size() 
                - #dpca_mat.nc() == in_vector_size()
                - rowm(#dpca_mat,i) represents the ith eigenvector of the S matrix described
                  in the class description and its eigenvalue is given by eigenvalues(i).
                - all values in #eigenvalues are > 0.  Moreover, the eigenvalues are in
                  sorted order with the largest eigenvalue stored at eigenvalues(0).
                - (#dpca_mat)*trans(#dpca_mat) == identity_matrix.  
                  (i.e. the rows of the dpca_matrix are all unit length vectors and are mutually
                  orthogonal)
                - Note that #dpca_mat is the desired linear transformation matrix.  That is, 
                  multiplying a vector by #dpca_mat performs the desired linear dimensionality 
                  reduction.
                - sum(#eigenvalues) will be equal to about eps times the total sum of all 
                  positive eigenvalues in the S matrix described in this class's description.
                  This means that eps is a number that controls how "lossy" the dimensionality
                  reduction will be.  Large values of eps result in more output dimensions 
                  while smaller values result in fewer. 
            throws
                - discriminant_pca_error
                    This exception is thrown if we are unable to create the dpca_matrix for some 
                    reason.  For example, if only within class examples have been given or
                    within_class_weight() is very large then all eigenvalues will be negative and
                    that prevents this algorithm from working properly.
        !*/

        const general_matrix dpca_matrix_of_size (
            const long num_rows 
        );
        /*!
            requires
                - 0 < num_rows <= in_vector_size()
            ensures
                - computes and returns the matrix MAT given by dpca_matrix_of_size(MAT,eigen,num_rows).  
                  That is, this function returns the dpca_matrix computed by the function
                  defined below.  
                - Note that MAT is the desired linear transformation matrix.  That is,
                  multiplying a vector by MAT performs the desired linear dimensionality
                  reduction to num_rows dimensions.
        !*/

        void dpca_matrix_of_size (
            general_matrix& dpca_mat,
            general_matrix& eigenvalues,
            const long num_rows 
        );
        /*!
            requires
                - 0 < num_rows <= in_vector_size()
            ensures
                - is_col_vector(#eigenvalues) == true
                - #dpca_mat.nr() == eigenvalues.size() 
                - #dpca_mat.nr() == num_rows 
                - #dpca_mat.nc() == in_vector_size()
                - rowm(#dpca_mat,i) represents the ith eigenvector of the S matrix described
                  in the class description and its eigenvalue is given by eigenvalues(i).
                - The values in #eigenvalues might be positive or negative.  Additionally, the
                  eigenvalues are in sorted order with the largest eigenvalue stored at
                  eigenvalues(0).
                - (#dpca_mat)*trans(#dpca_mat) == identity_matrix.  
                  (i.e. the rows of the dpca_matrix are all unit length vectors and are mutually
                  orthogonal)
                - Note that #dpca_mat is the desired linear transformation matrix.  That is, 
                  multiplying a vector by #dpca_mat performs the desired linear dimensionality 
                  reduction to num_rows dimensions.
        !*/

        const discriminant_pca operator+ (
            const discriminant_pca& item
        ) const;
        /*!
            requires
                - in_vector_size() == 0 || item.in_vector_size() == 0 || in_vector_size() == item.in_vector_size()
                  (i.e. the in_vector_size() of *this and item must match or one must be zero)
                - between_class_weight() == item.between_class_weight()
                - within_class_weight() == item.within_class_weight()
            ensures
                - returns a new discriminant_pca object that represents the combination of all 
                  the measurements given to *this and item.  That is, this function returns a
                  discriminant_pca object, R, that is equivalent to what you would obtain if all
                  modifying calls (e.g. the add_to_*() functions) to *this and item had instead 
                  been done to R.
        !*/

        void swap (
            discriminant_pca& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    inline void swap (
        discriminant_pca<matrix_type>& a, 
        discriminant_pca<matrix_type>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename matrix_type,
        >
    void deserialize (
        discriminant_pca<matrix_type>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

    template <
        typename matrix_type,
        >
    void serialize (
        const discriminant_pca<matrix_type>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DPCA_ABSTRaCT_

