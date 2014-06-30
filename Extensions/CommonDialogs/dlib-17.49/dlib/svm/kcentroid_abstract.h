// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_KCENTROId_ABSTRACT_
#ifdef DLIB_KCENTROId_ABSTRACT_

#include "../algs.h"
#include "../serialize.h"
#include "kernel_abstract.h"

namespace dlib
{

    template <
        typename kernel_type
        >
    class kcentroid
    {
        /*!
            REQUIREMENTS ON kernel_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            INITIAL VALUE
                - dictionary_size() == 0
                - samples_trained() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a weighted sum of sample points in a kernel induced
                feature space.  It can be used to kernelize any algorithm that requires only
                the ability to perform vector addition, subtraction, scalar multiplication,
                and inner products.  

                An example use of this object is as an online algorithm for recursively estimating 
                the centroid of a sequence of training points.  This object then allows you to 
                compute the distance between the centroid and any test points.  So you can use 
                this object to predict how similar a test point is to the data this object has 
                been trained on (larger distances from the centroid indicate dissimilarity/anomalous 
                points).  

                Also note that the algorithm internally keeps a set of "dictionary vectors" 
                that are used to represent the centroid.  You can force the algorithm to use 
                no more than a set number of vectors by setting the 3rd constructor argument 
                to whatever you want.  

                This object uses the sparsification technique described in the paper The 
                Kernel Recursive Least Squares Algorithm by Yaakov Engel.  This technique
                allows us to keep the number of dictionary vectors down to a minimum.  In fact,
                the object has a user selectable tolerance parameter that controls the trade off
                between accuracy and number of stored dictionary vectors.
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        kcentroid (
        );
        /*!
            ensures
                - this object is properly initialized
                - #tolerance() == 0.001 
                - #get_kernel() == kernel_type() (i.e. whatever the kernel's default value is) 
                - #max_dictionary_size() == 1000000
                - #remove_oldest_first() == false 
        !*/

        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        );
        /*!
            requires
                - tolerance > 0
                - max_dictionary_size_ > 1
            ensures
                - this object is properly initialized
                - #tolerance() == tolerance_
                - #get_kernel() == kernel_
                - #max_dictionary_size() == max_dictionary_size_
                - #remove_oldest_first() == remove_oldest_first_
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
                - returns the maximum number of dictionary vectors this object will 
                  use at a time.  That is, dictionary_size() will never be greater 
                  than max_dictionary_size().
        !*/

        bool remove_oldest_first (
        ) const;
        /*!
            ensures
                - When the maximum dictionary size is reached this object sometimes
                  needs to discard dictionary vectors when new samples are added via
                  one of the train functions.  When this happens this object chooses 
                  the dictionary vector to discard based on the setting of the
                  remove_oldest_first() parameter.
                - if (remove_oldest_first() == true) then
                    - This object discards the oldest dictionary vectors when necessary.  
                      This is an appropriate mode when using this object in an online
                      setting and the input training samples come from a slowly 
                      varying distribution.
                - else (remove_oldest_first() == false) then
                    - This object discards the most linearly dependent dictionary vectors 
                      when necessary.  This it the default behavior and should be used 
                      in most cases.
        !*/

        unsigned long dictionary_size (
        ) const;
        /*!
            ensures
                - returns the number of basis vectors in the dictionary.  These are
                  the basis vectors used by this object to represent a point in kernel
                  feature space.
        !*/

        scalar_type samples_trained (
        ) const;
        /*!
            ensures
                - returns the number of samples this object has been trained on so far
        !*/

        scalar_type tolerance(
        ) const;
        /*!
            ensures
                - returns the tolerance to use for the approximately linearly dependent 
                  test used for sparsification (see the KRLS paper for details).  This is 
                  a number which governs how accurately this object will approximate the 
                  centroid it is learning.  Smaller values generally result in a more 
                  accurate estimate while also resulting in a bigger set of vectors in 
                  the dictionary.  Bigger tolerances values result in a less accurate 
                  estimate but also in less dictionary vectors.  (Note that in any case, 
                  the max_dictionary_size() limits the number of dictionary vectors no 
                  matter the setting of the tolerance)
                - The exact meaning of the tolerance parameter is the following: 
                  Imagine that we have an empirical_kernel_map that contains all
                  the current dictionary vectors.  Then the tolerance is the minimum
                  projection error (as given by empirical_kernel_map::project()) required
                  to cause us to include a new vector in the dictionary.  So each time
                  you call train() the kcentroid basically just computes the projection
                  error for that new sample and if it is larger than the tolerance
                  then that new sample becomes part of the dictionary.
        !*/

        void clear_dictionary (
        );
        /*!
            ensures
                - clears out all learned data (e.g. #dictionary_size() == 0)
                - #samples_seen() == 0
        !*/

        scalar_type operator() (
            const kcentroid& x
        ) const;
        /*!
            requires
                - x.get_kernel() == get_kernel()
            ensures
                - returns the distance in kernel feature space between this centroid and the
                  centroid represented by x.  
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const;
        /*!
            ensures
                - returns the distance in kernel feature space between the sample x and the
                  current estimate of the centroid of the training samples given
                  to this object so far.
        !*/

        scalar_type inner_product (
            const sample_type& x
        ) const;
        /*!
            ensures
                - returns the inner product of the given x point and the current
                  estimate of the centroid of the training samples given to this object
                  so far.
        !*/

        scalar_type inner_product (
            const kcentroid& x
        ) const;
        /*!
            requires
                - x.get_kernel() == get_kernel()
            ensures
                - returns the inner product between x and this centroid object.
        !*/

        scalar_type squared_norm (
        ) const;
        /*!
            ensures
                - returns the squared norm of the centroid vector represented by this
                  object.  I.e. returns this->inner_product(*this)
        !*/

        void train (
            const sample_type& x
        );
        /*!
            ensures
                - adds the sample x into the current estimate of the centroid
                - also note that calling this function is equivalent to calling
                  train(x, samples_trained()/(samples_trained()+1.0, 1.0/(samples_trained()+1.0).  
                  That is, this function finds the normal unweighted centroid of all training points.
        !*/

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        );
        /*!
            ensures
                - adds the sample x into the current estimate of the centroid but
                  uses a user given scale.  That is, this function performs:
                    - new_centroid = cscale*old_centroid + xscale*x
                - This function allows you to weight different samples however 
                  you want.
        !*/

        void scale_by (
            scalar_type cscale
        );
        /*!
            ensures
                - multiplies the current centroid vector by the given scale value.  
                  This function is equivalent to calling train(some_x_value, cscale, 0).
                  So it performs:   
                    - new_centroid == cscale*old_centroid
        !*/

        scalar_type test_and_train (
            const sample_type& x
        );
        /*!
            ensures
                - calls train(x)
                - returns (*this)(x)
                - The reason this function exists is because train() and operator() 
                  both compute some of the same things.  So this function is more efficient
                  than calling both individually.
        !*/

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        );
        /*!
            ensures
                - calls train(x,cscale,xscale)
                - returns (*this)(x)
                - The reason this function exists is because train() and operator() 
                  both compute some of the same things.  So this function is more efficient
                  than calling both individually.
        !*/

        void swap (
            kcentroid& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

        distance_function<kernel_type> get_distance_function (
        ) const;
        /*!
            ensures
                - returns a distance function F that represents the point learned
                  by this object so far.  I.e. it is the case that:
                    - for all x: F(x) == (*this)(x)
        !*/


    };

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    void swap(
        kcentroid<kernel_type>& a, 
        kcentroid<kernel_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kernel_type
        >
    void serialize (
        const kcentroid<kernel_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for kcentroid objects
    !*/

    template <
        typename kernel_type 
        >
    void deserialize (
        kcentroid<kernel_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for kcentroid objects
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KCENTROId_ABSTRACT_

