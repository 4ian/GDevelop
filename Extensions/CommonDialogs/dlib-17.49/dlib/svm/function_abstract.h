// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_FUNCTION_ABSTRACT_
#ifdef DLIB_SVm_FUNCTION_ABSTRACT_

#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "../statistics/statistics_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct decision_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a classification or regression function that was 
                learned by a kernel based learning algorithm.   Therefore, it is a function 
                object that takes a sample object and returns a scalar value.
        !*/

        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type        b;
        K                  kernel_function;
        sample_vector_type basis_vectors;

        decision_function (
        );
        /*!
            ensures
                - #b == 0
                - #alpha.nr() == 0
                - #basis_vectors.nr() == 0
        !*/

        decision_function (
            const decision_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        decision_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) : alpha(alpha_), b(b_), kernel_function(kernel_function_), basis_vectors(basis_vectors_) {}
        /*!
            ensures
                - populates the decision function with the given basis vectors, weights(i.e. alphas),
                  b term, and kernel function.
        !*/

        result_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - evaluates this sample according to the decision
                  function contained in this object.
        !*/
        {
            result_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                temp += alpha(i) * kernel_function(x,basis_vectors(i));

            return temp - b;
        }
    };

    template <
        typename K
        >
    void serialize (
        const decision_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for decision_function
    !*/

    template <
        typename K
        >
    void deserialize (
        decision_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for decision_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename function_type 
        >
    struct probabilistic_function 
    {
        /*!
            REQUIREMENTS ON function_type 
                - function_type must be a function object with an overloaded
                  operator() similar to the other function objects defined in
                  this file.  The operator() should return a scalar type such as
                  double or float.

            WHAT THIS OBJECT REPRESENTS 
                This object represents a binary decision function that returns an 
                estimate of the probability that a given sample is in the +1 class.
        !*/

        typedef typename function_type::scalar_type scalar_type;
        typedef typename function_type::result_type result_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        scalar_type alpha;
        scalar_type beta;
        function_type decision_funct;

        probabilistic_function (
        );
        /*!
            ensures
                - #alpha == 0
                - #beta == 0
                - #decision_funct has its initial value
        !*/

        probabilistic_function (
            const probabilistic_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        probabilistic_function (
            const scalar_type a,
            const scalar_type b,
            const function_type& decision_funct_ 
        ) : alpha(a), beta(b), decision_funct(decision_funct_) {}
        /*!
            ensures
                - populates the probabilistic decision function with the given alpha, beta, 
                  and decision function.
        !*/

        result_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - returns a number P such that:
                    - 0 <= P <= 1
                    - P represents the probability that sample x is from 
                      the class +1
        !*/
        {
            // Evaluate the normal decision function
            result_type f = decision_funct(x);
            // Now basically normalize the output so that it is a properly
            // conditioned probability of x being in the +1 class given
            // the output of the decision function.
            return 1/(1 + std::exp(alpha*f + beta));
        }
    };

    template <
        typename function_type
        >
    void serialize (
        const probabilistic_function<function_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for probabilistic_function
    !*/

    template <
        typename function_type
        >
    void deserialize (
        probabilistic_function<function_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for probabilistic_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct probabilistic_decision_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a binary decision function that returns an 
                estimate of the probability that a given sample is in the +1 class.

                Note that this object is essentially just a copy of 
                probabilistic_function but with the template argument 
                changed from being a function type to a kernel type.  Therefore, this
                type is just a convenient version of probabilistic_function
                for the case where the decision function is a dlib::decision_function<K>.
        !*/

        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        scalar_type alpha;
        scalar_type beta;
        decision_function<K> decision_funct;

        probabilistic_decision_function (
        );
        /*!
            ensures
                - #alpha == 0
                - #beta == 0
                - #decision_funct has its initial value
        !*/

        probabilistic_decision_function (
            const probabilistic_decision_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        probabilistic_decision_function (
            const probabilistic_function<decision_function<K> >& d
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        probabilistic_decision_function (
            const scalar_type a,
            const scalar_type b,
            const decision_function<K>& decision_funct_ 
        ) : alpha(a), beta(b), decision_funct(decision_funct_) {}
        /*!
            ensures
                - populates the probabilistic decision function with the given alpha, beta, 
                  and decision_function.
        !*/

        result_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - returns a number P such that:
                    - 0 <= P <= 1
                    - P represents the probability that sample x is from 
                      the class +1
        !*/
        {
            // Evaluate the normal decision function
            result_type f = decision_funct(x);
            // Now basically normalize the output so that it is a properly
            // conditioned probability of x being in the +1 class given
            // the output of the decision function.
            return 1/(1 + std::exp(alpha*f + beta));
        }
    };

    template <
        typename K
        >
    void serialize (
        const probabilistic_decision_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for probabilistic_decision_function
    !*/

    template <
        typename K
        >
    void deserialize (
        probabilistic_decision_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for probabilistic_decision_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    class distance_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a point in kernel induced feature space. 
                You may use this object to find the distance from the point it 
                represents to points in input space as well as other points
                represented by distance_functions.

                Specifically, if O() is the feature mapping associated with
                the kernel used by this object.  Then this object represents
                the point:  
                    sum alpha(i)*O(basis_vectors(i))

                I.e.  It represents a linear combination of the basis vectors where 
                the weights of the linear combination are stored in the alpha vector.
        !*/

    public:
        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        distance_function (
        );
        /*!
            ensures
                - #get_squared_norm() == 0
                - #get_alpha().size() == 0
                - #get_basis_vectors().size() == 0
                - #get_kernel() == K() (i.e. the default value of the kernel)
        !*/

        explicit distance_function (
            const kernel_type& kern
        );
        /*!
            ensures
                - #get_squared_norm() == 0
                - #get_alpha().size() == 0
                - #get_basis_vectors().size() == 0
                - #get_kernel() == kern 
        !*/

        distance_function (
            const kernel_type& kern,
            const sample_type& samp
        );
        /*!
            ensures
                - This object represents the point in kernel feature space which
                  corresponds directly to the given sample.  In particular this means
                  that:
                    - #get_kernel() == kern
                    - #get_alpha() == a vector of length 1 which contains the value 1 
                    - #get_basis_vectors() == a vector of length 1 which contains samp
        !*/

        distance_function (
            const decision_function<K>& f
        );
        /*!
            ensures
                - Every decision_function represents a point in kernel feature space along
                  with a bias value.  This constructor discards the bias value and creates 
                  a distance_function which represents the point associated with the given 
                  decision_function f.  In particular, this means:
                    - #get_alpha() == f.alpha
                    - #get_kernel() == f.kernel_function
                    - #get_basis_vectors() == f.basis_vectors
        !*/

        distance_function (
            const distance_function& f
        );
        /*!
            requires
                - f is a valid distance_function.  In particular, this means that
                  f.alpha.size() == f.basis_vectors.size()
            ensures
                - #*this is a copy of f
        !*/

        distance_function (
            const scalar_vector_type& alpha,
            const scalar_type& squared_norm,
            const K& kernel_function,
            const sample_vector_type& basis_vectors
        ); 
        /*!
            requires
                - alpha.size() == basis_vectors.size()
                - squared_norm == trans(alpha)*kernel_matrix(kernel_function,basis_vectors)*alpha
                  (Basically, squared_norm needs to be set properly for this object to make sense.  
                  You should prefer to use the following constructor which computes squared_norm for 
                  you.  This version is provided just in case you already know squared_norm and 
                  don't want to spend CPU cycles to recompute it.)
            ensures
                - populates the distance function with the given basis vectors, weights(i.e. alphas),
                  squared_norm value, and kernel function. I.e.
                    - #get_alpha() == alpha
                    - #get_squared_norm() == squared_norm 
                    - #get_kernel() == kernel_function
                    - #get_basis_vectors() == basis_vectors
        !*/

        distance_function (
            const scalar_vector_type& alpha,
            const K& kernel_function,
            const sample_vector_type& basis_vectors
        );
        /*!
            requires
                - alpha.size() == basis_vectors.size()
            ensures
                - populates the distance function with the given basis vectors, weights(i.e. alphas), 
                  and kernel function.  The correct b value is computed automatically.  I.e.
                    - #get_alpha() == alpha
                    - #get_squared_norm() == trans(alpha)*kernel_matrix(kernel_function,basis_vectors)*alpha
                      (i.e. get_squared_norm() will be automatically set to the correct value)
                    - #get_kernel() == kernel_function
                    - #get_basis_vectors() == basis_vectors
        !*/

        const scalar_vector_type& get_alpha (
        ) const; 
        /*!
            ensures
                - returns the set of weights on each basis vector in this object
        !*/

        const scalar_type& get_squared_norm (
        ) const;
        /*!
            ensures
                - returns the squared norm of the point represented by this object.  This value is
                  equal to the following expression:
                    trans(get_alpha()) * kernel_matrix(get_kernel(),get_basis_vectors()) * get_alpha()
        !*/

        const K& get_kernel(
        ) const;
        /*!
            ensures
                - returns the kernel used by this object.
        !*/

        const sample_vector_type& get_basis_vectors (
        ) const;
        /*!
            ensures
                - returns the set of basis vectors contained in this object
        !*/

        result_type operator() (
            const sample_type& x
        ) const;
        /*!
            ensures
                - Let O(x) represent the point x projected into kernel induced feature space.
                - let c == sum_over_i get_alpha()(i)*O(get_basis_vectors()(i)) == the point in kernel space that
                  this object represents.  That is, c is the weighted sum of basis vectors.
                - Then this object returns the distance between the point O(x) and c in kernel
                  space. 
        !*/

        result_type operator() (
            const distance_function& x
        ) const;
        /*!
            requires
                - kernel_function == x.kernel_function
            ensures
                - returns the distance between the points in kernel space represented by *this and x.
        !*/

        distance_function operator* (
            const scalar_type& val
        ) const;
        /*!
            ensures
                - multiplies the point represented by *this by val and returns the result.  In
                  particular, this function returns a decision_function DF such that:
                    - DF.get_basis_vectors() == get_basis_vectors()
                    - DF.get_kernel() == get_kernel() 
                    - DF.get_alpha() == get_alpha() * val
        !*/

        distance_function operator/ (
            const scalar_type& val
        ) const;
        /*!
            ensures
                - divides the point represented by *this by val and returns the result.  In
                  particular, this function returns a decision_function DF such that:
                    - DF.get_basis_vectors() == get_basis_vectors()
                    - DF.get_kernel() == get_kernel() 
                    - DF.get_alpha() == get_alpha() / val
        !*/

        distance_function operator+ (
            const distance_function& rhs
        ) const;
        /*!
            requires
                - get_kernel() == rhs.get_kernel()
            ensures
                - returns a distance function DF such that:
                    - DF represents the sum of the point represented by *this and rhs
                    - DF.get_basis_vectors().size() == get_basis_vectors().size() + rhs.get_basis_vectors().size()
                    - DF.get_basis_vectors() contains all the basis vectors in both *this and rhs.
                    - DF.get_kernel() == get_kernel() 
                    - DF.alpha == join_cols(get_alpha(), rhs.get_alpha())
        !*/

        distance_function operator- (
            const distance_function& rhs
        ) const;
        /*!
            requires
                - get_kernel() == rhs.get_kernel()
            ensures
                - returns a distance function DF such that:
                    - DF represents the difference of the point represented by *this and rhs (i.e. *this - rhs)
                    - DF.get_basis_vectors().size() == get_basis_vectors().size() + rhs.get_basis_vectors().size()
                    - DF.get_basis_vectors() contains all the basis vectors in both *this and rhs.
                    - DF.get_kernel() == get_kernel() 
                    - DF.alpha == join_cols(get_alpha(), -1 * rhs.get_alpha())
        !*/
    };

    template <
        typename K
        >
    distance_function<K> operator* (
        const typename K::scalar_type& val,
        const distance_function<K>& df
    ) { return df*val; }
    /*!
        ensures
            - multiplies the point represented by *this by val and returns the result.   This
              function just allows multiplication syntax of the form val*df.
    !*/

    template <
        typename K
        >
    void serialize (
        const distance_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for distance_function
    !*/

    template <
        typename K
        >
    void deserialize (
        distance_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for distance_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename function_type,
        typename normalizer_type = vector_normalizer<typename function_type::sample_type>
        >
    struct normalized_function 
    {
        /*!
            REQUIREMENTS ON function_type 
                - function_type must be a function object with an overloaded
                  operator() similar to the other function objects defined in
                  this file.

            REQUIREMENTS ON normalizer_type
                - normalizer_type must be a function object with an overloaded
                  operator() that takes a sample_type and returns a sample_type.

            WHAT THIS OBJECT REPRESENTS 
                This object represents a container for another function
                object and an instance of a normalizer function.  

                It automatically normalizes all inputs before passing them
                off to the contained function object.
        !*/

        typedef typename function_type::result_type result_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        normalizer_type normalizer;
        function_type function;

        normalized_function (
        );
        /*!
            ensures
                - the members of this object have their default values
        !*/

        normalized_function (
            const normalized_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        normalized_function (
            const vector_normalizer<sample_type>& normalizer_,
            const function_type& funct 
        ) : normalizer(normalizer_), function(funct) {}
        /*!
            ensures
                - populates this object with the vector_normalizer and function object 
        !*/

        result_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - returns function(normalizer(x))
        !*/
    };

    template <
        typename function_type,
        typename normalizer_type 
        >
    void serialize (
        const normalized_function<function_type, normalizer_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for normalized_function
    !*/

    template <
        typename function_type,
        typename normalizer_type 
        >
    void deserialize (
        normalized_function<function_type, normalizer_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for normalized_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct projection_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a function that takes a data sample and projects
                it into kernel feature space.  The result is a real valued column vector that 
                represents a point in a kernel feature space.
        !*/

        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
        typedef scalar_vector_type result_type;

        scalar_matrix_type weights;
        K                  kernel_function;
        sample_vector_type basis_vectors;

        projection_function (
        );
        /*!
            ensures
                - #weights.size() == 0
                - #basis_vectors.size() == 0
        !*/

        projection_function (
            const projection_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        projection_function (
            const scalar_matrix_type& weights_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) : weights(weights_), kernel_function(kernel_function_), basis_vectors(basis_vectors_) {}
        /*!
            ensures
                - populates the projection function with the given basis vectors, weights,
                  and kernel function.
        !*/

        long out_vector_size (
        ) const;
        /*!
            ensures
                - returns weights.nr()
                  (i.e. returns the dimensionality of the vectors output by this projection_function.)
        !*/

        const result_type& operator() (
            const sample_type& x
        ) const
        /*!
            requires
                - weights.nc() == basis_vectors.size()
                - out_vector_size() > 0
            ensures
                - Takes the given x sample and projects it onto part of the kernel feature 
                  space spanned by the basis_vectors.  The exact projection arithmetic is 
                  defined below.
        !*/
        {
            // Run the x sample through all the basis functions we have and then
            // multiply it by the weights matrix and return the result.  Note that
            // the temp vectors are here to avoid reallocating their memory every
            // time this function is called.
            temp1 = kernel_matrix(kernel_function, basis_vectors, x);
            temp2 = weights*temp1;
            return temp2;
        }

    private:
        mutable result_type temp1, temp2;
    };

    template <
        typename K
        >
    void serialize (
        const projection_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for projection_function
    !*/

    template <
        typename K
        >
    void deserialize (
        projection_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for projection_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename result_type_ = typename K::scalar_type 
        >
    struct multiclass_linear_decision_function
    {
        /*!
            REQUIREMENTS ON K
                K must be either linear_kernel or sparse_linear_kernel.  

            WHAT THIS OBJECT REPRESENTS 
                This object represents a multiclass classifier built out of a set of 
                binary classifiers.  Each binary classifier is used to vote for the 
                correct multiclass label using a one vs. all strategy.  Therefore, 
                if you have N classes then there will be N binary classifiers inside 
                this object.  Additionally, this object is linear in the sense that
                each of these binary classifiers is a simple linear plane.
        !*/

        typedef result_type_ result_type;

        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;

        scalar_matrix_type       weights;
        scalar_vector_type       b;
        std::vector<result_type> labels; 

        const std::vector<result_type>& get_labels(
        ) const { return labels; }
        /*!
            ensures
                - returns a vector containing all the labels which can be
                  predicted by this object.
        !*/

        unsigned long number_of_classes (
        ) const;
        /*!
            ensures
                - returns get_labels().size()
                  (i.e. returns the number of different labels/classes predicted by
                  this object)
        !*/

        result_type operator() (
            const sample_type& x
        ) const;
        /*!
            requires
                - weights.size() > 0
                - weights.nr() == number_of_classes() == b.size()
                - if (x is a dense vector, i.e. a dlib::matrix) then
                    - is_vector(x) == true
                    - x.size() == weights.nc()
                      (i.e. it must be legal to multiply weights with x)
            ensures
                - Returns the predicted label for the x sample.  In particular, it returns
                  the following:
                    labels[index_of_max(weights*x-b)]
        !*/
    };

    template <
        typename K,
        typename result_type_
        >
    void serialize (
        const multiclass_linear_decision_function<K,result_type_>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for multiclass_linear_decision_function
    !*/

    template <
        typename K,
        typename result_type_
        >
    void deserialize (
        multiclass_linear_decision_function<K,result_type_>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for multiclass_linear_decision_function
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_FUNCTION_ABSTRACT_



