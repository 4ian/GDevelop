// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_SPARSE_VECTOR_ABSTRACT_
#ifdef DLIB_SVm_SPARSE_VECTOR_ABSTRACT_

#include <cmath>
#include "../algs.h"
#include "../serialize.h"
#include "../matrix.h"
#include <map>
#include <vector>
#include "../graph_utils/sample_pair_abstract.h"
#include "../graph_utils/ordered_sample_pair_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!A sparse_vectors

        In dlib, sparse vectors are represented using the container objects
        in the C++ STL.  In particular, a sparse vector is any container that 
        contains a range of std::pair<key, scalar_value> objects where:
            - key is an unsigned integral type 
            - scalar_value is float, double, or long double
            - the std::pair objects have unique key values
            - the std::pair objects are sorted such that small keys come first 

        Therefore, if an object satisfies the above requirements we call it a
        "sparse vector".  Additionally, we define the concept of an "unsorted sparse vector"
        to be a sparse vector that doesn't necessarily have sorted or unique key values.  
        Therefore, all sparse vectors are valid unsorted sparse vectors but not the other 
        way around.  

        An unsorted sparse vector with duplicate keys is always interpreted as
        a vector where each dimension contains the sum of all corresponding elements 
        of the unsorted sparse vector.  For example, an unsorted sparse vector 
        with the elements { (3,1), (0, 4), (3,5) } represents the 4D vector:
            [4, 0, 0, 1+5]



        Examples of valid sparse vectors are:    
            - std::map<unsigned long, double>
            - std::vector<std::pair<unsigned long, float> > where the vector is sorted.
              (you could make sure it was sorted by applying std::sort to it)


        Finally, by "dense vector" we mean a dlib::matrix object which represents
        either a row or column vector.

        The rest of this file defines a number of helper functions for doing normal 
        vector arithmetic things with sparse vectors.
    !*/

// ----------------------------------------------------------------------------------------

    /*!A has_unsigned_keys

        This is a template where has_unsigned_keys<T>::value == true when T is a
        sparse vector that contains unsigned integral keys and false otherwise.
    !*/

    template <typename T>
    struct has_unsigned_keys
    {
        static const bool value = is_unsigned_type<typename T::value_type::first_type>::value;
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    typename T::value_type::second_type distance_squared (
        const T& a,
        const U& b
    );
    /*!
        requires
            - a and b are sparse vectors
        ensures
            - returns the squared distance between the vectors
              a and b
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V, typename W>
    typename T::value_type::second_type distance_squared (
        const V& a_scale,
        const T& a,
        const W& b_scale,
        const U& b
    );
    /*!
        requires
            - a and b are sparse vectors
        ensures
            - returns the squared distance between the vectors
              a_scale*a and b_scale*b
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    typename T::value_type::second_type distance (
        const T& a,
        const U& b
    );
    /*!
        requires
            - a and b are sparse vectors
        ensures
            - returns the distance between the vectors
              a and b.  (i.e. std::sqrt(distance_squared(a,b)))
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V, typename W>
    typename T::value_type::second_type distance (
        const V& a_scale,
        const T& a,
        const W& b_scale,
        const U& b
    );
    /*!
        requires
            - a and b are sparse vectors
        ensures
            - returns the distance between the vectors
              a_scale*a and b_scale*b.  (i.e. std::sqrt(distance_squared(a_scale,a,b_scale,b)))
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void assign (
        T& dest,
        const U& src
    );
    /*!
        requires
            - dest == a sparse vector or a dense vector
            - src == a sparse vector or a dense vector
            - dest is not dense when src is sparse
              (i.e. you can't assign a sparse vector to a dense vector.  This is
              because we don't know what the proper dimensionality should be for the
              dense vector)
        ensures
            - #src represents the same vector as dest.  
              (conversion between sparse/dense formats is done automatically)
    !*/


// ----------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type dot (
        const T& a,
        const T& b
    );
    /*!
        requires
            - a and b are sparse vectors 
        ensures
            - returns the dot product between the vectors a and b
    !*/

    template <typename T1, typename T2, typename T3, typename T4, typename T5, typename T6>
    T4 dot (
        const std::vector<T1,T2>& a,
        const std::map<T3,T4,T5,T6>& b
    );
    /*!
        requires
            - a and b are sparse vectors 
        ensures
            - returns the dot product between the vectors a and b
    !*/

    template <typename T1, typename T2, typename T3, typename T4, typename T5, typename T6>
    T4 dot (
        const std::map<T3,T4,T5,T6>& a,
        const std::vector<T1,T2>& b
    );
    /*!
        requires
            - a and b are sparse vectors 
        ensures
            - returns the dot product between the vectors a and b
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename EXP>
    typename T::value_type::second_type dot (
        const T& a,
        const matrix_exp<EXP>& b
    );
    /*!
        requires
            - a is an unsorted sparse vector
            - is_vector(b) == true
        ensures
            - returns the dot product between the vectors a and b.  
            - if (max_index_plus_one(a) >= b.size()) then
                - a's dimensionality is greater than b's dimensionality.  In this case we
                  pretend b is padded by as many zeros as is needed to make the dot product
                  work.  So this means that any elements in a that go beyond the length of
                  b are simply ignored.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename EXP>
    typename T::value_type::second_type dot (
        const matrix_exp<EXP>& a,
        const T& b
    );
    /*!
        requires
            - b is an unsorted sparse vector
            - is_vector(a) == true
        ensures
            - returns the dot product between the vectors a and b
            - if (max_index_plus_one(b) >= a.size()) then
                - b's dimensionality is greater than a's dimensionality.  In this case we
                  pretend a is padded by as many zeros as is needed to make the dot product
                  work.  So this means that any elements in b that go beyond the length of
                  a are simply ignored.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type length_squared (
        const T& a
    );
    /*!
        requires
            - a is a sparse vector
        ensures
            - returns dot(a,a) 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type length (
        const T& a
    );
    /*!
        requires
            - a is a sparse vector
        ensures
            - returns std::sqrt(length_squared(a,a))
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void scale_by (
        T& a,
        const U& value
    );
    /*!
        requires
            - a is an unsorted sparse vector or a dlib::matrix
        ensures
            - #a == a*value
              (i.e. multiplies every element of the vector a by value)
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    T add (
        const T& a,
        const T& b
    );
    /*!
        requires
            - a is a sparse vector or dlib::matrix
            - b is a sparse vector or dlib::matrix
        ensures
            - returns a vector or matrix which represents a+b.  If the inputs are
              sparse vectors then the result is a sparse vector.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    T subtract (
        const T& a,
        const T& b
    );
    /*!
        requires
            - a is a sparse vector or dlib::matrix
            - b is a sparse vector or dlib::matrix
        ensures
            - returns a vector or matrix which represents a-b.  If the inputs are
              sparse vectors then the result is a sparse vector.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    unsigned long max_index_plus_one (
        const T& samples
    ); 
    /*!
        requires
            - samples == a single vector (either sparse or dense), or a container
              of vectors which is either a dlib::matrix of vectors or something 
              convertible to a dlib::matrix via mat() (e.g. a std::vector)
              Valid types of samples include (but are not limited to):
                - dlib::matrix<double,0,1>                      // A single dense vector 
                - std::map<unsigned int, double>                // A single sparse vector
                - std::vector<dlib::matrix<double,0,1> >        // An array of dense vectors
                - std::vector<std::map<unsigned int, double> >  // An array of sparse vectors
        ensures
            - This function tells you the dimensionality of a set of vectors.  The vectors
              can be either sparse or dense.  
            - if (samples.size() == 0) then
                - returns 0
            - else if (samples contains dense vectors or is a dense vector) then
                - returns the number of elements in the first sample vector.  This means
                  we implicitly assume all dense vectors have the same length)
            - else
                - In this case samples contains sparse vectors or is a sparse vector.  
                - returns the largest element index in any sample + 1.  Note that the element index values
                  are the values stored in std::pair::first.  So this number tells you the dimensionality
                  of a set of sparse vectors.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename SRC, typename U>
    inline void add_to (
        matrix<T,NR,NC,MM,L>& dest,
        const SRC& src,
        const U& C = 1
    );
    /*!
        requires
            - SRC == a matrix expression or an unsorted sparse vector
            - is_vector(dest) == true
            - Let MAX denote the largest element index in src.
              Then we require that:
                - MAX < dest.size()
                - (i.e. dest needs to be big enough to contain all the elements of src)
        ensures
            - #dest == dest + C*src
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename SRC, typename U>
    inline void subtract_from (
        matrix<T,NR,NC,MM,L>& dest,
        const SRC& src,
        const U& C = 1
    );
    /*!
        requires
            - SRC == a matrix expression or an unsorted sparse vector
            - is_vector(dest) == true
            - Let MAX denote the largest element index in src.
              Then we require that:
                - MAX < dest.size()
                - (i.e. dest needs to be big enough to contain all the elements of src)
        ensures
            - #dest == dest - C*src
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type min (
        const T& vect
    );
    /*!
        requires
            - T == an unsorted sparse vector
        ensures
            - returns the minimum value in the sparse vector vect.  Note that
              this value is always <= 0 since a sparse vector has an unlimited number
              of 0 elements.
    !*/

// ------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type max (
        const T& vect
    );
    /*!
        requires
            - T == an unsorted sparse vector
        ensures
            - returns the maximum value in the sparse vector vect.  Note that
              this value is always >= 0 since a sparse vector has an unlimited number
              of 0 elements.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type
        >
    matrix<typename sample_type::value_type::second_type,0,1> sparse_to_dense (
        const sample_type& vect
    );
    /*!
        requires
            - vect must be a sparse vector or a dense column vector.
        ensures
            - converts the single sparse or dense vector vect to a dense (column matrix form)
              representation.  That is, this function returns a vector V such that:
                - V.size() == max_index_plus_one(vect)
                - for all valid j:
                    - V(j) == The value of the j'th dimension of the vector vect.  Note 
                      that V(j) is zero if it is a sparse vector that doesn't contain an 
                      entry for the j'th dimension.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type
        >
    matrix<typename sample_type::value_type::second_type,0,1> sparse_to_dense (
        const sample_type& vect,
        unsigned long num_dimensions 
    );
    /*!
        requires
            - vect must be a sparse vector or a dense column vector.
        ensures
            - converts the single sparse or dense vector vect to a dense (column matrix form)
              representation.  That is, this function returns a vector V such that:
                - V.size() == num_dimensions 
                - for all valid j:
                    - V(j) == The value of the j'th dimension of the vector vect.  Note 
                      that V(j) is zero if it is a sparse vector that doesn't contain an 
                      entry for the j'th dimension.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type, 
        typename alloc
        >
    std::vector<matrix<typename sample_type::value_type::second_type,0,1> > sparse_to_dense (
        const std::vector<sample_type, alloc>& samples
    );
    /*!
        requires
            - all elements of samples must be sparse vectors or dense column vectors.
        ensures
            - converts from sparse sample vectors to dense (column matrix form)
            - That is, this function returns a std::vector R such that:
                - R contains column matrices    
                - R.size() == samples.size()
                - for all valid i: 
                    - R[i] == sparse_to_dense(samples[i], max_index_plus_one(samples))
                      (i.e. the dense (i.e. dlib::matrix) version of the sparse sample
                      given by samples[i].)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type, 
        typename alloc
        >
    std::vector<matrix<typename sample_type::value_type::second_type,0,1> > sparse_to_dense (
        const std::vector<sample_type, alloc>& samples,
        unsigned long num_dimensions 
    );
    /*!
        requires
            - all elements of samples must be sparse vectors or dense column vectors.
        ensures
            - converts from sparse sample vectors to dense (column matrix form)
            - That is, this function returns a std::vector R such that:
                - R contains column matrices    
                - R.size() == samples.size()
                - for all valid i: 
                    - R[i] == sparse_to_dense(samples[i], num_dimensions)
                      (i.e. the dense (i.e. dlib::matrix) version of the sparse sample
                      given by samples[i].)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T make_sparse_vector (
        const T& v
    );
    /*!
        requires
            - v is an unsorted sparse vector
        ensures
            - returns a copy of v which is a sparse vector. 
              (i.e. it will be properly sorted and not have any duplicate key values but
              will still logically represent the same vector).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void make_sparse_vector_inplace(
        T& vect
    );
    /*!
        requires
            - v is an unsorted sparse vector
        ensures
            - vect == make_sparse_vector(vect)
            - This function is just an optimized version of make_sparse_vector(), in
              particular, when T is a std::vector<std::pair<>> type it is much more
              efficient.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename T, 
        long NR, 
        long NC, 
        typename MM, 
        typename L
        >
    void sparse_matrix_vector_multiply (
        const std::vector<sample_pair>& edges,
        const matrix_exp<EXP>& v,
        matrix<T,NR,NC,MM,L>& result
    );
    /*!
        requires
            - is_col_vector(v) == true
            - max_index_plus_one(edges) <= v.size()
        ensures
            - Interprets edges as representing a symmetric sparse matrix M.  The elements
              of M are defined such that, for all valid i,j:
                - M(i,j) == sum of edges[k].distance() for all k where edges[k]==sample_pair(i,j) 
                - This means that any element of M that doesn't have any edges associated
                  with it will have a value of 0.
            - #result == M*v
              (i.e. this function multiplies the vector v with the sparse matrix
              represented by edges and stores the output into result)
            - get_rect(#result) == get_rect(v)
              (i.e. result will have the same dimensions as v)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename T, 
        long NR, 
        long NC, 
        typename MM, 
        typename L
        >
    void sparse_matrix_vector_multiply (
        const std::vector<ordered_sample_pair>& edges,
        const matrix_exp<EXP>& v,
        matrix<T,NR,NC,MM,L>& result
    );
    /*!
        requires
            - is_col_vector(v) == true
            - max_index_plus_one(edges) <= v.size()
        ensures
            - Interprets edges as representing a square sparse matrix M.  The elements of M
              are defined such that, for all valid i,j:
                - M(i,j) == sum of edges[k].distance() for all k where edges[k]==ordered_sample_pair(i,j) 
                - This means that any element of M that doesn't have any edges associated
                  with it will have a value of 0.
            - #result == M*v
              (i.e. this function multiplies the vector v with the sparse matrix
              represented by edges and stores the output into result)
            - get_rect(#result) == get_rect(v)
              (i.e. result will have the same dimensions as v)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const std::vector<sample_pair>& edges,
        const matrix_exp<EXP>& v
    );
    /*!
        requires
            - is_col_vector(v) == true
            - max_index_plus_one(edges) <= v.size()
        ensures
            - This is just a convenience routine for invoking the above
              sparse_matrix_vector_multiply() routine.  In particular, it just calls
              sparse_matrix_vector_multiply() with a temporary result matrix and then
              returns the result.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const std::vector<ordered_sample_pair>& edges,
        const matrix_exp<EXP>& v
    );
    /*!
        requires
            - is_col_vector(v) == true
            - max_index_plus_one(edges) <= v.size()
        ensures
            - This is just a convenience routine for invoking the above
              sparse_matrix_vector_multiply() routine.  In particular, it just calls
              sparse_matrix_vector_multiply() with a temporary result matrix and then
              returns the result.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename sparse_vector_type,
        typename T,
        long NR,
        long NC,
        typename MM,
        typename L
        >
    void sparse_matrix_vector_multiply (
        const matrix_exp<EXP>& m,
        const sparse_vector_type& v,
        matrix<T,NR,NC,MM,L>& result
    );
    /*!
        requires
            - max_index_plus_one(v) <= m.nc()
            - v == an unsorted sparse vector
        ensures
            - #result == m*v
              (i.e. multiply m by the vector v and store the output in result)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename sparse_vector_type
        >
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const matrix_exp<EXP>& m,
        const sparse_vector_type& v
    );
    /*!
        requires
            - max_index_plus_one(v) <= m.nc()
            - v == an unsorted sparse vector
        ensures
            - returns m*v
              (i.e. multiply m by the vector v and return the resulting vector)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_SPARSE_VECTOR_ABSTRACT_



