// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LISf_ABSTRACT_
#ifdef DLIB_LISf_ABSTRACT_

#include "../algs.h"
#include "../serialize.h"
#include "kernel_abstract.h"

namespace dlib
{

    template <
        typename kernel_type
        >
    class linearly_independent_subset_finder
    {
        /*!
            REQUIREMENTS ON kernel_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            INITIAL VALUE
                - size() == 0

            WHAT THIS OBJECT REPRESENTS
                This is an implementation of an online algorithm for recursively finding a
                set (aka dictionary) of linearly independent vectors in a kernel induced 
                feature space.  To use it you decide how large you would like the dictionary 
                to be and then you feed it sample points.  

                The implementation uses the Approximately Linearly Dependent metric described 
                in the paper The Kernel Recursive Least Squares Algorithm by Yaakov Engel to 
                decide which points are more linearly independent than others.  The metric is 
                simply the squared distance between a test point and the subspace spanned by 
                the set of dictionary vectors.

                Each time you present this object with a new sample point (via this->add()) 
                it calculates the projection distance and if it is sufficiently large then this 
                new point is included into the dictionary.  Note that this object can be configured 
                to have a maximum size.  Once the max dictionary size is reached each new point 
                kicks out a previous point.  This is done by removing the dictionary vector that 
                has the smallest projection distance onto the others.  That is, the "least linearly 
                independent" vector is removed to make room for the new one.
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::sample_type type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        linearly_independent_subset_finder (
        );
        /*!
            ensures
                - #minimum_tolerance() == 0.001 
                - this object is properly initialized
                - #get_kernel() == kernel_type()  (i.e. whatever the default is for the supplied kernel) 
                - #max_dictionary_size() == 100 
        !*/

        linearly_independent_subset_finder (
            const kernel_type& kernel_, 
            unsigned long max_dictionary_size_,
            scalar_type min_tolerance = 0.001
        );
        /*!
            requires
                - min_tolerance > 0
                - max_dictionary_size > 1
            ensures
                - #minimum_tolerance() == min_tolerance
                - this object is properly initialized
                - #get_kernel() == kernel_
                - #max_dictionary_size() == max_dictionary_size_
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a const reference to the kernel used by this object
        !*/

        unsigned long max_dictionary_size(
        ) const;
        /*!
            ensures
                - returns the maximum number of dictionary vectors this object
                  will accumulate.  That is, size() will never be
                  greater than max_dictionary_size().
        !*/

        scalar_type minimum_tolerance(
        ) const;
        /*!
            ensures
                - returns the minimum projection error necessary to include a sample point
                  into the dictionary.   
        !*/

        void set_minimum_tolerance (
            scalar_type min_tolerance 
        );
        /*!
            requires
                - min_tolerance > 0
            ensures
                - #minimum_tolerance() == min_tolerance
        !*/

        void clear_dictionary (
        );
        /*!
            ensures
                - clears out all the data (e.g. #size() == 0)
        !*/

        bool add (
            const sample_type& x
        );
        /*!
            ensures
                - if (size() < max_dictionary_size() then
                    - if (projection_error(x) > minimum_tolerance()) then 
                        - adds x into the dictionary
                        - (*this)[#size()-1] == x
                        - #size() == size() + 1
                        - returns true
                    - else
                        - the dictionary is not changed
                        - returns false
                - else
                    - #size() == size() 
                      (i.e. the number of vectors in this object doesn't change)
                    - since the dictionary is full adding a new element means we have to 
                      remove one of the current ones.  So let proj_error[i] be equal to the 
                      projection error obtained when projecting dictionary vector (*this)[i] 
                      onto the other elements of the dictionary.  Then let min_proj_error 
                      be equal to the minimum value in proj_error.  The dictionary element
                      with the minimum projection error is the "least linearly independent"
                      vector in the dictionary and is the one which will be removed to make
                      room for a new element.
                    - if (projection_error(x) > minimum_tolerance() && projection_error(x) > min_proj_error)
                        - the least linearly independent vector in this object is removed
                        - adds x into the dictionary
                        - (*this)[#size()-1] == x
                        - returns true
                    - else
                        - the dictionary is not changed
                        - returns false
        !*/

        scalar_type projection_error (
            const sample_type& x
        ) const;
        /*!
            ensures
                - returns the squared distance between x and the subspace spanned by 
                  the set of dictionary vectors.  (e.g. this is the same number that
                  gets returned by the empirical_kernel_map::project() function's 
                  projection_error argument when the ekm is loaded with the dictionary
                  vectors.)
                - Note that if the dictionary is empty then the return value is
                  equal to get_kernel()(x,x).
        !*/

        void swap (
            linearly_independent_subset_finder& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

        unsigned long size (
        ) const;
        /*!
            ensures
                - returns the number of vectors in the dictionary.  
        !*/

        const sample_type& operator[] (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures
                - returns the index'th element in the set of linearly independent 
                  vectors contained in this object.
        !*/

        const matrix<sample_type,0,1,mem_manager_type> get_dictionary (
        ) const;
        /*!
            ensures
                - returns a column vector that contains all the dictionary
                  vectors in this object.
        !*/

        const matrix<scalar_type,0,0,mem_manager_type>& get_kernel_matrix (
        ) const;
        /*!
            ensures
                - returns a matrix K such that:
                    - K.nr() == K.nc() == size()
                    - K == kernel_matrix(get_kernel(), get_dictionary())
                      i.e. K == the kernel matrix for the dictionary vectors
        !*/

        const matrix<scalar_type,0,0,mem_manager_type>& get_inv_kernel_marix (
        ) const;
        /*!
            ensures
                - if (size() != 0)
                    - returns inv(get_kernel_matrix())
                - else
                    - returns an empty matrix
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    void swap(
        linearly_independent_subset_finder<kernel_type>& a, 
        linearly_independent_subset_finder<kernel_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kernel_type
        >
    void serialize (
        const linearly_independent_subset_finder<kernel_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for linearly_independent_subset_finder objects
    !*/

    template <
        typename kernel_type 
        >
    void deserialize (
        linearly_independent_subset_finder<kernel_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for linearly_independent_subset_finder objects
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename vector_type,
        typename rand_type
        >
    void fill_lisf (
        linearly_independent_subset_finder<kernel_type>& lisf,
        const vector_type& samples,
        rand_type& rnd,
        int sampling_size = 2000
    );
    /*!
        requires
            - vector_type == a dlib::matrix or something convertible to one via 
              vector_to_matrix()
            - is_vector(vector_to_matrix(samples)) == true
            - rand_type == an implementation of rand/rand_kernel_abstract.h or a type
              convertible to a string via cast_to_string()
            - sampling_size > 0
        ensures
            - The purpose of this function is to fill lisf with points from samples.  It does
              this by randomly sampling elements of samples until no more can be added.  The
              precise stopping condition is when sampling_size additions to lisf have failed
              or the max dictionary size has been reached.
            - This function employs a random number generator.  If rand_type is a random 
              number generator then it uses the instance given.  Otherwise it uses cast_to_string(rnd)
              to seed a new random number generator.
    !*/

    template <
        typename kernel_type,
        typename vector_type
        >
    void fill_lisf (
        linearly_independent_subset_finder<kernel_type>& lisf,
        const vector_type& samples
    );
    /*!
        requires
            - vector_type == a dlib::matrix or something convertible to one via 
              vector_to_matrix()
            - is_vector(vector_to_matrix(samples)) == true
        ensures
            - performs fill_lisf(lisf, samples, default_rand_generator, 2000)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LISf_ABSTRACT_

