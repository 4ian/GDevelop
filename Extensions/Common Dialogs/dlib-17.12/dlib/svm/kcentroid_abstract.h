// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
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
                This is an implementation of an online algorithm for recursively estimating the
                centroid of a sequence of training points.  It uses the sparsification technique
                described in the paper The Kernel Recursive Least Squares Algorithm by Yaakov Engel.

                This object then allows you to compute the distance between the centroid 
                and any test points.  So you can use this object to predict how similar a test
                point is to the data this object has been trained on (larger distances from the
                centroid indicate dissimilarity/anomalous points).

                Also note that the algorithm internally keeps a set of "dictionary vectors" 
                that are used to represent the centroid.  You can force the algorithm to use 
                no more than a set number of vectors by setting the 3rd constructor argument 
                to whatever you want.  However, note that doing this causes the algorithm 
                to bias it's results towards more recent training examples.  
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000
        );
        /*!
            requires
                - tolerance >= 0
            ensures
                - this object is properly initialized
                - #tolerance() == tolerance_
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
                  will use at a time.  That is, dictionary_size() will never be
                  greater than max_dictionary_size().
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
                  centroid it is learning.  Smaller values generally result in a more accurate 
                  estimate while also resulting in a bigger set of support vectors in 
                  the learned dictionary.  Bigger tolerances values result in a 
                  less accurate estimate but also in less support vectors.
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

        unsigned long dictionary_size (
        ) const;
        /*!
            ensures
                - returns the number of "support vectors" in the dictionary.  
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

