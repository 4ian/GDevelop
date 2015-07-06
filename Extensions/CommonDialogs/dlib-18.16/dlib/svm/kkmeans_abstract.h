// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_KKMEANs_ABSTRACT_
#ifdef DLIB_KKMEANs_ABSTRACT_

#include <cmath>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "kernel_abstract.h"
#include "kcentroid_abstract.h"
#include "../noncopyable.h"

namespace dlib
{

    template <
        typename kernel_type 
        >
    class kkmeans : public noncopyable
    {
        /*!
            REQUIREMENTS ON kernel_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            INITIAL VALUE
                - number_of_centers() == 1
                - get_min_change() == 0.01

            WHAT THIS OBJECT REPRESENTS
                This is an implementation of a kernelized k-means clustering algorithm.  
                It performs k-means clustering by using the kcentroid object.  
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        kkmeans (
            const kcentroid<kernel_type>& kc_ 
        );
        /*!
            ensures
                - #number_of_centers() == 1
                - #get_min_change() == 0.01
                - #get_kcentroid(0) == a copy of kc_
        !*/

        ~kkmeans(
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/

        void set_kcentroid (
            const kcentroid<kernel_type>& kc_
        );
        /*!
            ensures
                - for all idx:  
                    - #get_kcentroid(idx) == a copy of kc_
        !*/

        const kcentroid<kernel_type>& get_kcentroid (
            unsigned long i
        ) const;
        /*!
            requires
                - i < number_of_centers()
            ensures
                - returns a const reference to the ith kcentroid object contained in
                  this object.  Each kcentroid represents one of the centers found
                  by the k-means clustering algorithm.
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a const reference to the kernel used by this object
        !*/

        void set_number_of_centers (
            unsigned long num
        );
        /*!
            requires
                - num > 0
            ensures
                - #number_of_centers() == num
        !*/

        unsigned long number_of_centers (
        ) const;
        /*!
            ensures
                - returns the number of centers used in this instance of the k-means clustering
                  algorithm.
        !*/

        template <
            typename matrix_type,
            typename matrix_type2
            >
        void train (
            const matrix_type& samples,
            const matrix_type2& initial_centers,
            long max_iter = 1000
        );
        /*!
            requires
                - matrix_type and matrix_type2 must either be dlib::matrix objects or convertible to dlib::matrix
                  via mat()
                - matrix_type::type == sample_type  (i.e. matrix_type should contain sample_type objects)
                - matrix_type2::type == sample_type (i.e. matrix_type2 should contain sample_type objects)
                - initial_centers.nc() == 1         (i.e. must be a column vector)
                - samples.nc() == 1                 (i.e. must be a column vector)
                - initial_centers.nr() == number_of_centers()
            ensures
                - performs k-means clustering of the given set of samples.  The initial center points
                  are taken from the initial_centers argument.
                - loops over the data and continues to refine the clustering until either less than 
                  get_min_change() fraction of the data points change clusters or we have done max_iter 
                  iterations over the data.
                - After this function finishes you can call the operator() function below
                  to determine which centroid a given sample is closest to.
        !*/

        unsigned long operator() (
            const sample_type& sample
        ) const;
        /*!
            ensures
                - returns a number idx such that:
                    - idx < number_of_centers()
                    - get_kcentroid(idx) == the centroid that is closest to the given
                      sample.
        !*/

        void set_min_change (
            scalar_type min_change
        );
        /*!
            requires
                - 0 <= min_change < 1
            ensures
                - #get_min_change() == min_change
        !*/

        const scalar_type get_min_change (
        ) const;
        /*!
            ensures
                - returns the minimum fraction of data points that need to change
                  centers in an iteration of kmeans for the algorithm to keep going.
        !*/

        void swap (
            kkmeans& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    void swap(
        kkmeans<kernel_type>& a, 
        kkmeans<kernel_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kernel_type
        >
    void serialize (
        const kkmeans<kernel_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for kkmeans objects
    !*/

    template <
        typename kernel_type 
        >
    void deserialize (
        kkmeans<kernel_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for kkmeans objects
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type1, 
        typename vector_type2, 
        typename kernel_type
        >
    void pick_initial_centers(
        long num_centers, 
        vector_type1& centers, 
        const vector_type2& samples, 
        const kernel_type& k, 
        double percentile = 0.01
    );
    /*!
        requires
            - num_centers > 1
            - 0 <= percentile < 1
            - samples.size() > 1
            - vector_type1 == something with an interface compatible with std::vector
            - vector_type2 == something with an interface compatible with std::vector
            - k(samples[0],samples[0]) must be a valid expression that returns a double
            - both centers and samples must be able to contain kernel_type::sample_type 
              objects
        ensures
            - finds num_centers candidate cluster centers in the data in the samples 
              vector.  Assumes that k is the kernel that will be used during clustering 
              to define the space in which clustering occurs.
            - The centers are found by looking for points that are far away from other 
              candidate centers.  However, if the data is noisy you probably want to 
              ignore the farthest way points since they will be outliers.  To do this 
              set percentile to the fraction of outliers you expect the data to contain.
            - #centers.size() == num_centers
            - #centers == a vector containing the candidate centers found
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type1, 
        typename vector_type2
        >
    void pick_initial_centers(
        long num_centers, 
        vector_type1& centers, 
        const vector_type2& samples, 
        double percentile = 0.01
    );
    /*!
        requires
            - num_centers > 1
            - 0 <= percentile < 1
            - samples.size() > 1
            - vector_type1 == something with an interface compatible with std::vector
            - vector_type2 == something with an interface compatible with std::vector
            - Both centers and samples must be able to contain dlib::matrix based row or
              column vectors.
        ensures
            - performs: pick_initial_centers(num_centers, centers, samples, linear_kernel<sample_type>(), percentile)
              (i.e. this function is simply an overload that uses the linear kernel.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename array_type, 
        typename sample_type,
        typename alloc
        >
    void find_clusters_using_kmeans (
        const array_type& samples,
        std::vector<sample_type, alloc>& centers,
        unsigned long max_iter = 1000
    );
    /*!
        requires
            - samples.size() > 0
            - samples == a bunch of row or column vectors and they all must be of the
              same length.
            - centers.size() > 0
            - array_type == something with an interface compatible with std::vector
              and it must contain row or column vectors capable of being stored in 
              sample_type objects
            - sample_type == a dlib::matrix capable of representing vectors
        ensures
            - performs regular old linear kmeans clustering on the samples.  The clustering
              begins with the initial set of centers given as an argument to this function.
              When it finishes #centers will contain the resulting centers.
            - no more than max_iter iterations will be performed before this function
              terminates.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename array_type, 
        typename EXP 
        >
    unsigned long nearest_center (
        const array_type& centers,
        const matrix_exp<EXP>& sample
    );
    /*!
        requires
            - centers.size() > 0
            - sample.size() > 0
            - is_vector(sample) == true
            - centers must be an array of vectors such that the following expression is
              valid: length_squared(sample - centers[0]).  (e.g. centers could be a
              std::vector of matrix objects holding column vectors).
        ensures
            - returns the index that identifies the element of centers that is nearest to
              sample.  That is, returns a number IDX such that centers[IDX] is the element
              of centers that minimizes length(centers[IDX]-sample).
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KKMEANs_ABSTRACT_

