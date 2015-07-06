// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_LA_FUNCTS_ABSTRACT_
#ifdef DLIB_MATRIx_LA_FUNCTS_ABSTRACT_ 

#include "matrix_abstract.h"
#include <complex>

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                             Global linear algebra functions 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns the inverse of m 
              (Note that if m is singular or so close to being singular that there
              is a lot of numerical error then the returned matrix will be bogus.  
              You can check by seeing if m*inv(m) is an identity matrix)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix pinv (
        const matrix_exp& m,
        double tol = 0
    );
    /*!
        requires
            - tol >= 0
        ensures
            - returns the Moore-Penrose pseudoinverse of m.
            - The returned matrix has m.nc() rows and m.nr() columns.
            - if (tol == 0) then
                - singular values less than max(m.nr(),m.nc()) times the machine epsilon 
                  times the largest singular value are ignored.  
            - else
                - singular values less than tol are ignored.
    !*/

// ----------------------------------------------------------------------------------------

    void svd (
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        ensures
            - computes the singular value decomposition of m
            - m == #u*#w*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - diag(#w) == the singular values of the matrix m in no 
              particular order.  All non-diagonal elements of #w are
              set to 0.
            - #u.nr() == m.nr()
            - #u.nc() == m.nc()
            - #w.nr() == m.nc()
            - #w.nc() == m.nc()
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
            - if DLIB_USE_LAPACK is #defined then the xGESVD routine
              from LAPACK is used to compute the SVD.
    !*/

// ----------------------------------------------------------------------------------------

    long svd2 (
        bool withu, 
        bool withv, 
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        requires
            - m.nr() >= m.nc()
        ensures
            - computes the singular value decomposition of matrix m
            - m == subm(#u,get_rect(m))*diagm(#w)*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the singular values of the matrix m in no 
              particular order.  
            - #u.nr() == m.nr()
            - #u.nc() == m.nr()
            - #w.nr() == m.nc()
            - #w.nc() == 1 
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
            - if (widthu == false) then
                - ignore the above regarding #u, it isn't computed and its
                  output state is undefined.
            - if (widthv == false) then
                - ignore the above regarding #v, it isn't computed and its
                  output state is undefined.
            - returns an error code of 0, if no errors and 'k' if we fail to
              converge at the 'kth' singular value.
            - if (DLIB_USE_LAPACK is #defined) then 
                - if (withu == withv) then
                    - the xGESDD routine from LAPACK is used to compute the SVD.
                - else
                    - the xGESVD routine from LAPACK is used to compute the SVD.
    !*/

// ----------------------------------------------------------------------------------------

    void svd3 (
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        ensures
            - computes the singular value decomposition of m
            - m == #u*diagm(#w)*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the singular values of the matrix m in no 
              particular order.  
            - #u.nr() == m.nr()
            - #u.nc() == m.nc()
            - #w.nr() == m.nc()
            - #w.nc() == 1 
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
            - if DLIB_USE_LAPACK is #defined then the xGESVD routine
              from LAPACK is used to compute the SVD.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void svd_fast (
        const matrix<T>& A,
        matrix<T>& u,
        matrix<T>& w,
        matrix<T>& v,
        unsigned long l,
        unsigned long q = 1
    );
    /*!
        requires
            - l > 0
            - A.size() > 0 
              (i.e. A can't be an empty matrix)
        ensures
            - computes the singular value decomposition of A.  
            - Lets define some constants we use to document the behavior of svd_fast():
                - Let m = A.nr()
                - Let n = A.nc() 
                - Let k = min(l, min(m,n))
                - Therefore, A represents an m by n matrix and svd_fast() is designed
                  to find a rank-k representation of it.
            - if (the rank of A is <= k) then 
                - A == #u*diagm(#w)*trans(#v)
            - else
                - A is approximated by #u*diagm(#w)*trans(#v)
                  (i.e. In this case A can't be represented with a rank-k matrix, so the
                  matrix you get by trying to reconstruct A from the output of the SVD is
                  not exactly the same.)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the top k singular values of the matrix A (in no particular order).  
            - #u.nr() == m 
            - #u.nc() == k 
            - #w.nr() == k 
            - #w.nc() == 1 
            - #v.nr() == n 
            - #v.nc() == k 
            - This function implements the randomized subspace iteration defined in the
              algorithm 4.4 and 5.1 boxes of the paper: 
                Finding Structure with Randomness: Probabilistic Algorithms for
                Constructing Approximate Matrix Decompositions by Halko et al.
              Therefore, it is very fast and suitable for use with very large matrices.
              Moreover, q is the number of subspace iterations performed.  Larger
              values of q might increase the accuracy of the solution but the default
              value should be good for many problems.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sparse_vector_type, 
        typename T
        >
    void svd_fast (
        const std::vector<sparse_vector_type>& A,
        matrix<T>& u,
        matrix<T>& w,
        matrix<T>& v,
        unsigned long l,
        unsigned long q = 1
    );
    /*!
        requires
            - A contains a set of sparse vectors.  See dlib/svm/sparse_vector_abstract.h
              for a definition of what constitutes a sparse vector.
            - l > 0
            - max_index_plus_one(A) > 0
              (i.e. A can't be an empty matrix)
        ensures
            - computes the singular value decomposition of A.  In this case, we interpret A
              as a matrix of A.size() rows, where each row is defined by a sparse vector.
            - Lets define some constants we use to document the behavior of svd_fast():
                - Let m = A.size()
                - Let n = max_index_plus_one(A)
                - Let k = min(l, min(m,n))
                - Therefore, A represents an m by n matrix and svd_fast() is designed
                  to find a rank-k representation of it.
            - if (the rank of A is <= k) then 
                - A == #u*diagm(#w)*trans(#v)
            - else
                - A is approximated by #u*diagm(#w)*trans(#v)
                  (i.e. In this case A can't be represented with a rank-k matrix, so the
                  matrix you get by trying to reconstruct A from the output of the SVD is
                  not exactly the same.)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the top k singular values of the matrix A (in no particular order).  
            - #u.nr() == m 
            - #u.nc() == k 
            - #w.nr() == k 
            - #w.nc() == 1 
            - #v.nr() == n 
            - #v.nc() == k 
            - This function implements the randomized subspace iteration defined in the
              algorithm 4.4 and 5.1 boxes of the paper: 
                Finding Structure with Randomness: Probabilistic Algorithms for
                Constructing Approximate Matrix Decompositions by Halko et al.
              Therefore, it is very fast and suitable for use with very large matrices.
              Moreover, q is the number of subspace iterations performed.  Larger
              values of q might increase the accuracy of the solution but the default
              value should be good for many problems.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename L
        >
    void orthogonalize (
        matrix<T,NR,NC,MM,L>& m
    );
    /*!
        requires
            - m.nr() >= m.nc()
            - m.size() > 0
        ensures
            - #m == an orthogonal matrix with the same dimensions as m.  In particular,
              the columns of #m have the same span as the columns of m.
            - trans(#m)*#m == identity matrix
            - This function is just shorthand for computing the QR decomposition of m
              and then storing the Q factor into #m.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix real_eigenvalues (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() == m.nc()
            - matrix_exp::type == float or double
        ensures
            - returns a matrix E such that:
                - E.nr() == m.nr()
                - E.nc() == 1
                - E contains the real part of all eigenvalues of the matrix m.
                  (note that the eigenvalues are not sorted)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type det (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns the determinant of m
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type trace (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns the trace of m
              (i.e. returns sum(diag(m)))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type chol (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A has a Cholesky Decomposition) then
                - returns the decomposition of A.  That is, returns a matrix L
                  such that L*trans(L) == A.  L will also be lower triangular.
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be a decomposition.
                  In this case the algorithm returns a partial decomposition.
                - You can tell when chol fails by looking at the lower right
                  element of the returned matrix.  If it is 0 then it means
                  A does not have a cholesky decomposition.  

            - If DLIB_USE_LAPACK is defined then the LAPACK routine xPOTRF 
              is used to compute the cholesky decomposition.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv_lower_triangular (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A is lower triangular) then
                - returns the inverse of A. 
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be an inverse.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv_upper_triangular (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A is upper triangular) then
                - returns the inverse of A. 
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be an inverse.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                             Matrix decomposition classes 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename matrix_exp_type
        >
    class lu_decomposition
    {
        /*!
            REQUIREMENTS ON matrix_exp_type
                must be some kind of matrix expression as defined in the 
                dlib/matrix/matrix_abstract.h file.   (e.g. a dlib::matrix object)
                The matrix type must also contain float or double values.

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute an LU 
                decomposition of a real valued matrix.  That is, for any 
                matrix A it computes matrices L, U, and a pivot vector P such 
                that rowm(A,P) == L*U.

                The LU decomposition with pivoting always exists, even if the matrix is
                singular, so the constructor will never fail.  The primary use of the
                LU decomposition is in the solution of square systems of simultaneous
                linear equations.  This will fail if is_singular() returns true (or
                if A is very nearly singular).

                If DLIB_USE_LAPACK is defined then the LAPACK routine xGETRF 
                is used to compute the LU decomposition.
        !*/

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef matrix<type,0,0,mem_manager_type,layout_type>  matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;
        typedef matrix<long,NR,1,mem_manager_type,layout_type> pivot_column_vector_type;

        template <typename EXP>
        lu_decomposition (
            const matrix_exp<EXP> &A
        );
        /*!
            requires
                - EXP::type == lu_decomposition::type 
                - A.size() > 0
            ensures
                - #nr() == A.nr()
                - #nc() == A.nc()
                - #is_square() == (A.nr() == A.nc())
                - computes the LU factorization of the given A matrix.
        !*/

        bool is_square (
        ) const;
        /*!
            ensures
                - if (the input A matrix was a square matrix) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_singular (
        ) const;
        /*!
            requires
                - is_square() == true
            ensures
                - if (the input A matrix is singular) then
                    - returns true
                - else
                    - returns false
        !*/

        long nr(
        ) const;
        /*!
            ensures
                - returns the number of rows in the input matrix
        !*/

        long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in the input matrix
        !*/

        const matrix_type get_l (
        ) const; 
        /*!
            ensures
                - returns the lower triangular L factor of the LU factorization.  
                - L.nr() == nr()
                - L.nc() == min(nr(),nc())
        !*/

        const matrix_type get_u (
        ) const;
        /*!
            ensures
                - returns the upper triangular U factor of the LU factorization.  
                - U.nr() == min(nr(),nc())
                - U.nc() == nc()
        !*/

        const pivot_column_vector_type& get_pivot (
        ) const;
        /*!
            ensures
                - returns the pivot permutation vector.  That is,
                  if A is the input matrix then this function 
                  returns a vector P such that:
                    - rowm(A,P) == get_l()*get_u() 
                    - P.nr() == A.nr()
        !*/

        type det (
        ) const;
        /*!
            requires
                - is_square() == true
            ensures
                - computes and returns the determinant of the input 
                  matrix using LU factors.
        !*/

        template <typename EXP>
        const matrix_type solve (
            const matrix_exp<EXP> &B
        ) const;
        /*!
            requires
                - EXP::type == lu_decomposition::type
                - is_square() == true
                - B.nr() == nr()
            ensures
                - Let A denote the input matrix to this class's constructor.  
                  Then this function solves A*X == B for X and returns X.  
                - Note that if A is singular (or very close to singular) then
                  the X returned by this function won't fit A*X == B very well (if at all).
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_exp_type
        >
    class cholesky_decomposition
    {
        /*! 
            REQUIREMENTS ON matrix_exp_type
                must be some kind of matrix expression as defined in the 
                dlib/matrix/matrix_abstract.h file.   (e.g. a dlib::matrix object)
                The matrix type must also contain float or double values.

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute a cholesky 
                decomposition of a real valued matrix.  That is, for any 
                symmetric, positive definite matrix A, it computes a lower 
                triangular matrix L such that A == L*trans(L).
                
                If the matrix is not symmetric or positive definite, the function
                computes only a partial decomposition.  This can be tested with
                the is_spd() flag.
            
                If DLIB_USE_LAPACK is defined then the LAPACK routine xPOTRF 
                is used to compute the cholesky decomposition.
        !*/

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef typename matrix_exp_type::matrix_type matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;

        template <typename EXP>
        cholesky_decomposition(
            const matrix_exp<EXP>& A
        );
        /*!
            requires
                - EXP::type == cholesky_decomposition::type 
                - A.size() > 0
                - A.nr() == A.nc() 
                  (i.e. A must be a square matrix)
            ensures
                - if (A is symmetric positive-definite) then
                    - #is_spd() == true 
                    - Constructs a lower triangular matrix L, such that L*trans(L) == A.
                      and #get_l() == L
                - else
                    - #is_spd() == false
        !*/

        bool is_spd(
        ) const;
        /*!
            ensures
                - if (the input matrix was symmetric positive-definite) then
                    - returns true
                - else
                    - returns false
        !*/

        const matrix_type& get_l(
        ) const;
        /*!
            ensures
                - returns the lower triangular factor, L, such that L*trans(L) == A
                  (where A is the input matrix to this class's constructor)
                - Note that if A is not symmetric positive definite or positive semi-definite
                  then the equation L*trans(L) == A won't hold.  
        !*/

        template <typename EXP>
        const matrix solve (
            const matrix_exp<EXP>& B
        ) const;
        /*!
            requires
                - EXP::type == cholesky_decomposition::type
                - B.nr() == get_l().nr()
                  (i.e. the number of rows in B must match the number of rows in the
                  input matrix A)
            ensures
                - Let A denote the input matrix to this class's constructor.  Then 
                  this function solves A*X = B for X and returns X.  
                - Note that if is_spd() == false or A was really close to being
                  non-SPD then the solver will fail to find an accurate solution.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_exp_type
        >
    class qr_decomposition 
    {
        /*! 
            REQUIREMENTS ON matrix_exp_type
                must be some kind of matrix expression as defined in the 
                dlib/matrix/matrix_abstract.h file.   (e.g. a dlib::matrix object)
                The matrix type must also contain float or double values.

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute a classical
                QR decomposition of an m-by-n real valued matrix A with m >= n.  

                The QR decomposition is an m-by-n orthogonal matrix Q and an 
                n-by-n upper triangular matrix R so that A == Q*R. The QR decomposition 
                always exists, even if the matrix does not have full rank, so the 
                constructor will never fail.  The primary use of the QR decomposition 
                is in the least squares solution of non-square systems of simultaneous 
                linear equations.  This will fail if is_full_rank() returns false or
                A is very nearly not full rank.

                The Q and R factors can be retrieved via the get_q() and get_r()
                methods. Furthermore, a solve() method is provided to find the
                least squares solution of Ax=b using the QR factors.  

                If DLIB_USE_LAPACK is #defined then the xGEQRF routine
                from LAPACK is used to compute the QR decomposition.
        !*/

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef matrix<type,0,0,mem_manager_type,layout_type> matrix_type;

        template <typename EXP>
        qr_decomposition(
            const matrix_exp<EXP>& A
        );
        /*!
            requires
                - EXP::type == qr_decomposition::type
                - A.nr() >= A.nc()
                - A.size() > 0
            ensures
                - #nr() == A.nr()
                - #nc() == A.nc()
                - computes the QR decomposition of the given A matrix.
        !*/

        bool is_full_rank(
        ) const;
        /*!
            ensures
                - if (the input A matrix had full rank) then
                    - returns true
                - else
                    - returns false
        !*/

        long nr(
        ) const;
        /*!
            ensures
                - returns the number of rows in the input matrix
        !*/

        long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in the input matrix
        !*/

        const matrix_type get_r (
        ) const;
        /*!
            ensures
                - returns a matrix R such that: 
                    - R is the upper triangular factor, R, of the QR factorization
                    - get_q()*R == input matrix A
                    - R.nr() == nc()
                    - R.nc() == nc()
        !*/

        const matrix_type get_q (
        ) const;
        /*!
            ensures
                - returns a matrix Q such that:
                    - Q is the economy-sized orthogonal factor Q from the QR 
                      factorization.  
                    - trans(Q)*Q == identity matrix
                    - Q*get_r() == input matrix A 
                    - Q.nr() == nr()
                    - Q.nc() == nc()
        !*/

        void get_q (
            matrix_type& Q
        ) const;
        /*!
            ensures
                - #Q == get_q()
                - This function exists to allow a user to get the Q matrix without the
                  overhead of returning a matrix by value.
        !*/

        template <typename EXP>
        const matrix_type solve (
            const matrix_exp<EXP>& B
        ) const;
        /*!
            requires
                - EXP::type == qr_decomposition::type
                - B.nr() == nr()
            ensures
                - Let A denote the input matrix to this class's constructor.  
                  Then this function finds the least squares solution to the equation A*X = B 
                  and returns X.  X has the following properties: 
                    - X is the matrix that minimizes the two norm of A*X-B.  That is, it
                      minimizes sum(squared(A*X - B)).
                    - X.nr() == nc()
                    - X.nc() == B.nc()
                - Note that this function will fail to output a good solution if is_full_rank() == false
                  or the A matrix is close to not being full rank.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_exp_type
        >
    class eigenvalue_decomposition
    {
        /*!
            REQUIREMENTS ON matrix_exp_type
                must be some kind of matrix expression as defined in the 
                dlib/matrix/matrix_abstract.h file.   (e.g. a dlib::matrix object)
                The matrix type must also contain float or double values.

            WHAT THIS OBJECT REPRESENTS
                This object represents something that can compute an eigenvalue 
                decomposition of a real valued matrix.   So it gives 
                you the set of eigenvalues and eigenvectors for a matrix.   

                Let A denote the input matrix to this object's constructor.  Then 
                what this object does is it finds two matrices, D and V, such that
                    - A*V == V*D
                Where V is a square matrix that contains all the eigenvectors
                of the A matrix (each column of V is an eigenvector) and
                D is a diagonal matrix containing the eigenvalues of A.


                It is important to note that if A is symmetric or non-symmetric you
                get somewhat different results.  If A is a symmetric matrix (i.e. A == trans(A))
                then:
                    - All the eigenvalues and eigenvectors of A are real numbers. 
                        - Because of this there isn't really any point in using the
                          part of this class's interface that returns complex matrices.
                          All you need are the get_real_eigenvalues() and
                          get_pseudo_v() functions.  
                    - V*trans(V) should be equal to the identity matrix.  That is, all the
                      eigenvectors in V should be orthonormal. 
                        - So A == V*D*trans(V)
                    - If DLIB_USE_LAPACK is #defined then this object uses the xSYEVR LAPACK
                      routine.

                On the other hand, if A is not symmetric then:
                    - Some of the eigenvalues and eigenvectors might be complex numbers.  
                        - An eigenvalue is complex if and only if its corresponding eigenvector 
                          is complex.  So you can check for this case by just checking 
                          get_imag_eigenvalues() to see if any values are non-zero.  You don't 
                          have to check the V matrix as well.
                    - V*trans(V) won't be equal to the identity matrix but it is usually
                      invertible.  So A == V*D*inv(V) is usually a valid statement but
                      A == V*D*trans(V) won't be.
                    - If DLIB_USE_LAPACK is #defined then this object uses the xGEEV LAPACK
                      routine.
        !*/

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef typename matrix_exp_type::matrix_type matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;

        typedef matrix<std::complex<type>,0,0,mem_manager_type,layout_type> complex_matrix_type;
        typedef matrix<std::complex<type>,NR,1,mem_manager_type,layout_type> complex_column_vector_type;


        template <typename EXP>
        eigenvalue_decomposition(
            const matrix_exp<EXP>& A
        ); 
        /*!
            requires
                - A.nr() == A.nc() 
                - A.size() > 0
                - EXP::type == eigenvalue_decomposition::type 
            ensures
                - #dim() == A.nr()
                - computes the eigenvalue decomposition of A.  
                - #get_eigenvalues() == the eigenvalues of A
                - #get_v() == all the eigenvectors of A
        !*/

        template <typename EXP>
        eigenvalue_decomposition(
            const matrix_op<op_make_symmetric<EXP> >& A
        ); 
        /*!
            requires
                - A.nr() == A.nc() 
                - A.size() > 0
                - EXP::type == eigenvalue_decomposition::type 
            ensures
                - #dim() == A.nr()
                - computes the eigenvalue decomposition of the symmetric matrix A.  Does so
                  using a method optimized for symmetric matrices.
                - #get_eigenvalues() == the eigenvalues of A
                - #get_v() == all the eigenvectors of A
                - moreover, since A is symmetric there won't be any imaginary eigenvalues. So 
                  we will have:
                    - #get_imag_eigenvalues() == 0
                    - #get_real_eigenvalues() == the eigenvalues of A
                    - #get_pseudo_v() == all the eigenvectors of A
                    - diagm(#get_real_eigenvalues()) == #get_pseudo_d()

                Note that the symmetric matrix operator is created by the
                dlib::make_symmetric() function.  This function simply reflects
                the lower triangular part of a square matrix into the upper triangular
                part to create a symmetric matrix.  It can also be used to denote that a 
                matrix is already symmetric using the C++ type system.
        !*/

        long dim (
        ) const;
        /*!
            ensures
                - dim() == the number of rows/columns in the input matrix A 
        !*/

        const complex_column_vector_type get_eigenvalues (
        ) const;
        /*!
            ensures
                - returns diag(get_d()).  That is, returns a 
                  vector that contains the eigenvalues of the input 
                  matrix.
                - the returned vector has dim() rows
                - the eigenvalues are not sorted in any particular way
        !*/

        const column_vector_type& get_real_eigenvalues (
        ) const;
        /*! 
            ensures
                - returns the real parts of the eigenvalues.  That is,
                  returns real(get_eigenvalues()) 
                - the returned vector has dim() rows
                - the eigenvalues are not sorted in any particular way
        !*/

        const column_vector_type& get_imag_eigenvalues (
        ) const;
        /*! 
            ensures
                - returns the imaginary parts of the eigenvalues.  That is,
                  returns imag(get_eigenvalues()) 
                - the returned vector has dim() rows
                - the eigenvalues are not sorted in any particular way
        !*/

        const complex_matrix_type get_v (
        ) const;
        /*!
            ensures
                - returns the eigenvector matrix V that is 
                  dim() rows by dim() columns
                - Each column in V is one of the eigenvectors of the input 
                  matrix
        !*/

        const complex_matrix_type get_d (
        ) const; 
        /*!
            ensures
                - returns a matrix D such that:
                    - D.nr() == dim()
                    - D.nc() == dim()
                    - diag(D) == get_eigenvalues()
                      (i.e. the diagonal of D contains all the eigenvalues in the input matrix)
                    - all off diagonal elements of D are set to 0
        !*/

        const matrix_type& get_pseudo_v (
        ) const;
        /*!
            ensures
                - returns a matrix that is dim() rows by dim() columns
                - Let A denote the input matrix given to this object's constructor.
                - if (A has any imaginary eigenvalues) then
                    - returns the pseudo-eigenvector matrix V  
                    - The matrix V returned by this function is structured such that:
                        - A*V == V*get_pseudo_d()
                - else
                    - returns the eigenvector matrix V with A's eigenvectors as
                      the columns of V
                    - A*V == V*diagm(get_real_eigenvalues())
        !*/

        const matrix_type get_pseudo_d (
        ) const; 
        /*!
            ensures
                - The returned matrix is dim() rows by dim() columns
                - Computes and returns the block diagonal eigenvalue matrix.
                  If the original matrix A is not symmetric, then the eigenvalue 
                  matrix D is block diagonal with the real eigenvalues in 1-by-1 
                  blocks and any complex eigenvalues,
                  a + i*b, in 2-by-2 blocks, (a, b; -b, a).  That is, if the complex
                  eigenvalues look like

                      u + iv     .        .          .      .    .
                        .      u - iv     .          .      .    .
                        .        .      a + ib       .      .    .
                        .        .        .        a - ib   .    .
                        .        .        .          .      x    .
                        .        .        .          .      .    y

                  Then D looks like

                        u        v        .          .      .    .
                       -v        u        .          .      .    . 
                        .        .        a          b      .    .
                        .        .       -b          a      .    .
                        .        .        .          .      x    .
                        .        .        .          .      .    y

                  This keeps V (The V you get from get_pseudo_v()) a real matrix in both 
                  symmetric and non-symmetric cases, and A*V = V*D.
                - the eigenvalues are not sorted in any particular way
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_LA_FUNCTS_ABSTRACT_

