// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_EMPIRICAL_KERNEl_MAP_ABSTRACT_H_
#ifdef DLIB_EMPIRICAL_KERNEl_MAP_ABSTRACT_H_

#include <vector>
#include "../matrix.h"
#include "kernel_abstract.h"
#include "function_abstract.h"
#include "linearly_independent_subset_finder_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type, 
        typename EXP
        >
    const decision_function<kernel_type> convert_to_decision_function (
        const projection_function<kernel_type>& project_funct,
        const matrix_exp<EXP>& vect
    );
    /*!
        requires
            - is_vector(vect) == true
            - vect.size() == project_funct.out_vector_size()
            - project_funct.out_vector_size() > 0
            - project_funct.weights.nc() == project_funct.basis_vectors.size()
        ensures
            - This function interprets the given vector as a point in the kernel feature space defined 
              by the given projection function.  The return value of this function is a decision 
              function, DF, that represents the given vector in the following sense:
                - for all possible sample_type objects, S, it is the case that DF(S) == dot(project_funct(S), vect)
                  (i.e. the returned decision function computes dot products, in kernel feature space, 
                  between vect and any argument you give it.  Note also that this equality is exact, even
                  for sample_type objects not in the span of the basis_vectors.)
                - DF.kernel_function == project_funct.kernel_function
                - DF.b == 0
                - DF.basis_vectors == project_funct.basis_vectors.  
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename kern_type
        >
    class empirical_kernel_map
    {
        /*!
            REQUIREMENTS ON kern_type
                - must be a kernel function object as defined in dlib/svm/kernel_abstract.h

            INITIAL VALUE
                - out_vector_size() == 0
                - basis_size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a map from objects of sample_type (the kind of object 
                a kernel function operates on) to finite dimensional column vectors which 
                represent points in the kernel feature space defined by whatever kernel 
                is used with this object. 

                To use the empirical_kernel_map you supply it with a particular kernel and a set of 
                basis samples.  After that you can present it with new samples and it will project 
                them into the part of kernel feature space spanned by your basis samples.   
                
                This means the empirical_kernel_map is a tool you can use to very easily kernelize 
                any algorithm that operates on column vectors.  All you have to do is select a 
                set of basis samples and then use the empirical_kernel_map to project all your 
                data points into the part of kernel feature space spanned by those basis samples.
                Then just run your normal algorithm on the output vectors and it will be effectively 
                kernelized.  

                Regarding methods to select a set of basis samples, if you are working with only a 
                few thousand samples then you can just use all of them as basis samples.  
                Alternatively, the linearly_independent_subset_finder often works well for 
                selecting a basis set.  I also find that picking a random subset typically works 
                well.


                The empirical kernel map is something that has been around in the kernel methods
                literature for a long time but is seemingly not well known.  Anyway, one of the
                best books on the subject is the following:
                    Learning with Kernels: Support Vector Machines, Regularization, Optimization, 
                    and Beyond by Bernhard Schlkopf, Alexander J. Smola
                The authors discuss the empirical kernel map as well as many other interesting 
                topics.
        !*/

    public:

        typedef kern_type kernel_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        struct empirical_kernel_map_error : public error;
        /*!
            This is an exception class used to indicate a failure to create a 
            kernel map from data given by the user.
        !*/

        empirical_kernel_map (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear (
        );
        /*!
            ensures
                - this object has its initial value
        !*/

        template <typename T>
        void load(
            const kernel_type& kernel,
            const T& basis_samples
        );
        /*!
            requires
                - T must be a dlib::matrix type or something convertible to a matrix via mat()
                  (e.g. a std::vector)
                - is_vector(basis_samples) == true
                - basis_samples.size() > 0
                - kernel must be capable of operating on the elements of basis_samples.  That is,
                  expressions such as kernel(basis_samples(0), basis_samples(0)) should make sense.
            ensures
                - 0 < #out_vector_size() <= basis_samples.size()
                - #basis_size() == basis_samples.size()
                - #get_kernel() == kernel
                - This function constructs a map between normal sample_type objects and the 
                  subspace of the kernel feature space defined by the given kernel and the
                  given set of basis samples.  So after this function has been called you
                  will be able to project sample_type objects into kernel feature space
                  and obtain the resulting vector as a regular column matrix.
                - The basis samples are loaded into this object in the order in which they
                  are stored in basis_samples.  That is:
                    - for all valid i: (*this)[i] == basis_samples(i)
            throws
                - empirical_kernel_map_error
                    This exception is thrown if we are unable to create a kernel map.
                    If this happens then this object will revert back to its initial value.
        !*/

        void load(
            const linearly_independent_subset_finder<kernel_type>& lisf
        );
        /*!
            ensures
                - #out_vector_size() == lisf.dictionary_size() 
                - #basis_size() == lisf.dictionary_size()
                - #get_kernel() == lisf.get_kernel()
                - Uses the dictionary vectors from lisf as a basis set.  Thus, this function 
                  constructs a map between normal sample_type objects and the subspace of 
                  the kernel feature space defined by the given kernel and the given set 
                  of basis samples.  So after this function has been called you will be 
                  able to project sample_type objects into kernel feature space and obtain 
                  the resulting vector as a regular column matrix.
                - The basis samples are loaded into this object in the order in which they
                  are stored in lisf.  That is:
                    - for all valid i: (*this)[i] == lisf[i]
            throws
                - empirical_kernel_map_error
                    This exception is thrown if we are unable to create a kernel map.  
                    E.g.  if the lisf.size() == 0.  
                    If this happens then this object will revert back to its initial value.
        !*/

        const kernel_type get_kernel (
        ) const;
        /*!
            requires
                - out_vector_size() != 0
            ensures
                - returns a copy of the kernel used by this object
        !*/

        long out_vector_size (
        ) const;
        /*!
            ensures
                - if (this object has been loaded with basis samples) then
                    - returns the dimensionality of the vectors output by the project() function.
                - else
                    - returns 0
        !*/

        unsigned long basis_size (
        ) const;
        /*!
            ensures
                - returns the number of basis vectors in projection_functions created
                  by this object.  This is also equal to the number of basis vectors
                  given to the load() function.
        !*/

        const sample_type& operator[] (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < basis_size()
            ensures
                - returns a const reference to the idx'th basis vector contained inside 
                  this object.
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& project (
            const sample_type& sample 
        ) const;
        /*!
            requires
                - out_vector_size() != 0
            ensures
                - takes the given sample and projects it into the kernel feature space
                  of out_vector_size() dimensions defined by this kernel map and 
                  returns the resulting vector.
                - in more precise terms, this function returns a vector such that:
                    - The returned vector will contain out_vector_size() elements.
                    - for any sample_type object S, the following equality is approximately true:
                        - get_kernel()(sample,S) == dot(project(sample), project(S)).  
                    - The approximation error in the above equality will be zero (within rounding error)
                      if both sample_type objects involved are within the span of the set of basis 
                      samples given to the load() function.  If they are not then there will be some 
                      approximation error.  Note that all the basis samples are always within their
                      own span.  So the equality is always exact for the samples given to the load() 
                      function.
        !*/

        const matrix<scalar_type,0,1,mem_manager_type>& project (
            const sample_type& samp,
            scalar_type& projection_error
        ) const;
        /*!
            requires
                - out_vector_size() != 0
            ensures
                - This function returns project(samp)
                  (i.e. it returns the same thing as the above project() function)
                - #projection_error == the square of the distance between the point samp 
                  gets projected onto and samp's true image in kernel feature space.  
                  That is, this value is equal to: 
                    pow(convert_to_distance_function(project(samp))(samp),2)
        !*/

        template <typename EXP>
        const decision_function<kernel_type> convert_to_decision_function (
            const matrix_exp<EXP>& vect
        ) const;
        /*!
            requires
                - is_vector(vect) == true
                - vect.size() == out_vector_size()
                - out_vector_size() != 0
            ensures
                - This function interprets the given vector as a point in the kernel feature space defined 
                  by this empirical_kernel_map.  The return value of this function is a decision 
                  function, DF, that represents the given vector in the following sense:
                    - for all possible sample_type objects, S, it is the case that DF(S) == dot(project(S), vect)
                      (i.e. the returned decision function computes dot products, in kernel feature space, 
                      between vect and any argument you give it.  Note also that this equality is exact, even
                      for sample_type objects not in the span of the basis samples.)
                    - DF.kernel_function == get_kernel()
                    - DF.b == 0
                    - DF.basis_vectors == these will be the basis samples given to the previous call to load().  Note
                      that it is possible for there to be fewer basis_vectors than basis samples given to load().  
                    - DF.basis_vectors.size() == basis_size()
        !*/

        template <typename EXP>
        const distance_function<kernel_type> convert_to_distance_function (
            const matrix_exp<EXP>& vect
        ) const
        /*!
            requires
                - is_vector(vect) == true
                - vect.size() == out_vector_size()
                - out_vector_size() != 0
            ensures
                - This function interprets the given vector as a point in the kernel feature space defined 
                  by this empirical_kernel_map.  The return value of this function is a distance 
                  function, DF, that represents the given vector in the following sense:
                    - for any sample_type object S, the following equality is approximately true: 
                        - DF(S) == length(project(S) - vect)
                          (i.e. the returned distance function computes distances, in kernel feature space, 
                          between vect and any argument you give it. )
                    - The approximation error in the above equality will be zero (within rounding error)
                      if S is within the span of the set of basis samples given to the load() function.  
                      If it is not then there will be some approximation error.  Note that all the basis 
                      samples are always within their own span.  So the equality is always exact for the 
                      samples given to the load() function.  Note further that the distance computed
                      by DF(S) is always the correct distance in kernel feature space between vect and
                      the true projection of S.  That is, the above equality is approximate only because 
                      of potential error in the project() function, not in DF(S).
                    - DF.kernel_function == get_kernel()
                    - DF.b == dot(vect,vect) 
                    - DF.basis_vectors == these will be the basis samples given to the previous call to load().  Note
                      that it is possible for there to be fewer basis_vectors than basis samples given to load().  
                    - DF.basis_vectors.size() == basis_size()
        !*/

        const projection_function<kernel_type> get_projection_function (
        ) const;
        /*!
            requires
                - out_vector_size() != 0
            ensures
                - returns a projection_function, PF, that computes the same projection as project().
                  That is, calling PF() on any sample will produce the same output vector as calling
                  this->project() on that sample.
                - PF.basis_vectors.size() == basis_size()
        !*/

        const matrix<scalar_type,0,0,mem_manager_type> get_transformation_to (
            const empirical_kernel_map& target
        ) const;
        /*!
            requires
                - get_kernel() == target.get_kernel()
                - out_vector_size() != 0
                - target.out_vector_size() != 0
            ensures
                - A point in the kernel feature space defined by the kernel get_kernel() typically
                  has different representations with respect to different empirical_kernel_maps.
                  This function lets you obtain a transformation matrix that will allow you
                  to project between these different representations. That is, this function returns 
                  a matrix M with the following properties:    
                    - M maps vectors represented according to *this into the representation used by target. 
                    - M.nr() == target.out_vector_size()
                    - M.nc() == this->out_vector_size()
                    - Let V be a vector of this->out_vector_size() length.  Then define two distance_functions
                      DF1 = this->convert_to_distance_function(V)
                      DF2 = target.convert_to_distance_function(M*V)

                      Then DF1(DF2) == 0 // i.e. the distance between these two points should be 0

                      That is, DF1 and DF2 both represent the same point in kernel feature space.  Note
                      that the above equality is only approximate.  If the vector V represents a point in
                      kernel space that isn't in the span of the basis samples used by target then the 
                      equality is approximate.  However, if it is in their span then the equality will
                      be exact.  For example, if target's basis samples are a superset of the basis samples
                      used by *this then the equality will always be exact (within rounding error).
        !*/

        void get_transformation_to (
            const empirical_kernel_map& target,
            matrix<scalar_type, 0, 0, mem_manager_type>& tmat,
            projection_function<kernel_type>& partial_projection
        ) const;
        /*!
            requires
                - get_kernel() == target.get_kernel()
                - out_vector_size() != 0
                - target.out_vector_size() != 0
                - basis_size() < target.basis_size()
                - for all i < basis_size(): (*this)[i] == target[i]
                  i.e. target must contain a superset of the basis vectors contained in *this.  Moreover,
                  it must contain them in the same order.
            ensures
                - The single argument version of get_transformation_to() allows you to project 
                  vectors from one empirical_kernel_map representation to another.  This version
                  provides a somewhat different capability.  Assuming target's basis vectors form a
                  superset of *this's basis vectors then this form of get_transformation_to() allows
                  you to reuse a vector from *this ekm to speed up the projection performed by target.
                  The defining relation is given below.
                - for any sample S: 
                    - target.project(S) == #tmat * this->project(S) + #partial_projection(S)
                      (this is always true to within rounding error for any S)
                - #partial_projection.basis_vectors.size() == target.basis_vectors.size() - this->basis_vectors.size()
                - #tmat.nr() == target.out_vector_size()
                - #tmat.nc() == this->out_vector_size()
        !*/

        void swap (
            empirical_kernel_map& item
        );
        /*!
            ensures
                - swaps the state of *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    void swap (
        empirical_kernel_map<kernel_type>& a,
        empirical_kernel_map<kernel_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kernel_type
        >
    void serialize (
        const empirical_kernel_map<kernel_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for empirical_kernel_map objects
    !*/

    template <
        typename kernel_type
        >
    void deserialize (
        empirical_kernel_map<kernel_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for empirical_kernel_map objects
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EMPIRICAL_KERNEl_MAP_ABSTRACT_H_

