// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
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
                - dictionary_size() == 0

            WHAT THIS OBJECT REPRESENTS
                This is an implementation of an online algorithm for recursively finding a
                set of linearly independent vectors in a kernel induced feature space.  To 
                use it you decide how large you would like the set to be and then you feed it 
                sample points.  
                
                Each time you present it with a new sample point (via this->add()) it either 
                keeps the current set of independent points unchanged, or if the new point 
                is "more linearly independent" than one of the points it already has,  
                it replaces the weakly linearly independent point with the new one.

                
                This object uses the Approximately Linearly Dependent metric described in the paper 
                The Kernel Recursive Least Squares Algorithm by Yaakov Engel to decide which
                points are more linearly independent than others.
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        linearly_independent_subset_finder (
            const kernel_type& kernel_, 
            unsigned long max_dictionary_size,
            scalar_type min_tolerance = 0.001
        );
        /*!
            requires
                - min_tolerance > 0
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
                  will accumulate.  That is, dictionary_size() will never be
                  greater than max_dictionary_size().
        !*/

        scalar_type minimum_tolerance(
        ) const;
        /*!
            ensures
                - returns the minimum tolerance to use for the approximately linearly dependent 
                  test used for dictionary vector selection (see KRLS paper for ALD details).  
                  In other words, this is the minimum threshold for how linearly independent 
                  a sample must be for it to even be considered for addition to the dictionary.  
                  Moreover, bigger values of this field will make the algorithm run faster but 
                  might give less accurate results.
        !*/

        void clear_dictionary (
        );
        /*!
            ensures
                - clears out all the data (e.g. #dictionary_size() == 0)
        !*/

        void add (
            const sample_type& x
        );
        /*!
            ensures
                - if (x is linearly independent of the vectors already in this object) then
                    - adds x into the dictionary
                    - if (dictionary_size() < max_dictionary_size()) then
                        - #dictionary_size() == dictionary_size() + 1
                    - else
                        - #dictionary_size() == dictionary_size() 
                          (i.e. the number of vectors in this object doesn't change)
                        - the least linearly independent vector in this object is removed
        !*/

        void swap (
            linearly_independent_subset_finder& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

        unsigned long dictionary_size (
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
                - index < dictionary_size()
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

}

#endif // DLIB_LISf_ABSTRACT_

