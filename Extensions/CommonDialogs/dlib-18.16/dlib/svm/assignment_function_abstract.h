// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ASSIGNMENT_FuNCTION_ABSTRACT_Hh_
#ifdef DLIB_ASSIGNMENT_FuNCTION_ABSTRACT_Hh_

#include <vector>
#include "../optimization/max_cost_assignment_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class example_feature_extractor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a feature extractor must implement
                if it is to be used with the assignment_function defined at the bottom
                of this file.  
                
                The model used by assignment_function objects is the following.  
                Given two sets of objects, the Left Hand Set (LHS) and Right Hand Set (RHS),
                find a one-to-one mapping M from LHS into RHS such that:
                    M == argmax_m  sum_{l in LHS} match_score(l,m(l))
                Where match_score() returns a scalar value indicating how good it is
                to say l maps to the RHS element m(l).  Additionally, in this model, 
                m() is allowed to indicate that l doesn't map to anything, and in this 
                case it is excluded from the sum.    

                Finally, match_score() is defined as: 
                    match_score(l,r) == dot(w, PSI(l,r)) + bias
                where l is an element of LHS, r is an element of RHS, w is a parameter
                vector and bias is a scalar valued parameter.

                Therefore, a feature extractor defines how the PSI() feature vector 
                is calculated.  In particular, PSI() is defined by the get_features()
                method of this class.

            THREAD SAFETY
                Instances of this object are required to be threadsafe, that is, it should
                be safe for multiple threads to make concurrent calls to the member
                functions of this object.

        !*/

    public:

        // This type should be a dlib::matrix capable of storing column vectors
        // or an unsorted sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.
        typedef matrix_or_sparse_vector_type feature_vector_type;

        // These two typedefs define the types used to represent an element in 
        // the left hand and right hand sets.  You can use any copyable types here.
        typedef user_defined_type_1 lhs_element;
        typedef user_defined_type_2 rhs_element;

        unsigned long num_features(
        ) const;
        /*!
            ensures
                - returns the dimensionality of the PSI() feature vector.  
        !*/

        void get_features (
            const lhs_element& left,
            const rhs_element& right,
            feature_vector_type& feats
        ) const;
        /*!
            ensures
                - #feats == PSI(left,right)
                  (i.e. This function computes a feature vector which, in some sense, 
                  captures information useful for deciding if matching left to right 
                  is "good").
        !*/

        unsigned long num_nonnegative_weights (
        ) const;
        /*!
            ensures
                - returns the number of elements of the w parameter vector which should be
                  non-negative.  That is, this feature extractor is intended to be used
                  with w vectors where the first num_nonnegative_weights() elements of w
                  are >= 0.  That is, it should be the case that w(i) >= 0 for all i <
                  num_nonnegative_weights().
                - Note that num_nonnegative_weights() is just an optional method to allow
                  you to tell a tool like the structural_assignment_trainer that the
                  learned w should have a certain number of non-negative elements.
                  Therefore, if you do not provide a num_nonnegative_weights() method in
                  your feature extractor then it will default to a value of 0, indicating
                  that all elements of the w parameter vector may be any value.
        !*/

    };

// ----------------------------------------------------------------------------------------

    void serialize(
        const example_feature_extractor& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    void deserialize(
        example_feature_extractor& item, 
        std::istream& in
    );
    /*!
        provides deserialization support 
    !*/


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor 
        >
    class assignment_function
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor discussed above.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for solving the optimal assignment problem given a 
                user defined method for computing the quality of any particular assignment. 

                To define this precisely, suppose you have two sets of objects, a 
                Left Hand Set (LHS) and a Right Hand Set (RHS) and you want to 
                find a one-to-one mapping M from LHS into RHS such that:
                    M == argmax_m  sum_{l in LHS} match_score(l,m(l))
                Where match_score() returns a scalar value indicating how good it is
                to say l maps to the RHS element m(l).  Additionally, in this model, 
                m() is allowed to indicate that l doesn't map to anything, and in this 
                case it is excluded from the sum.    

                Finally, this object supports match_score() functions of the form: 
                    match_score(l,r) == dot(w, PSI(l,r)) + bias
                where l is an element of LHS, r is an element of RHS, w is a parameter
                vector, bias is a scalar valued parameter, and PSI() is defined by the
                feature_extractor template argument.  

            THREAD SAFETY
                It is always safe to use distinct instances of this object in different
                threads.  However, when a single instance is shared between threads then
                the following rules apply:
                    It is safe to call the const members of this object from multiple
                    threads so long as the feature_extractor is also threadsafe.  This is
                    because the const members are purely read-only operations.  However,
                    any operation that modifies an assignment_function is not threadsafe.
        !*/

    public:

        typedef typename feature_extractor::lhs_element  lhs_element;
        typedef typename feature_extractor::rhs_element  rhs_element;
        typedef          std::vector<long>               label_type;
        typedef          label_type                      result_type;
        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;

        assignment_function(
        );
        /*!
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_weights().size() == #get_feature_extractor().num_features()
                - #get_weights() == 0
                - #get_bias() == 0
                - #forces_assignment() == false 
        !*/

        explicit assignment_function(
            const matrix<double,0,1>& weights,
            double bias
        );
        /*!
            requires
                - feature_extractor().num_features() == weights.size()
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_weights() == weights
                - #get_bias() == bias
                - #forces_assignment() == false 
        !*/

        assignment_function(
            const matrix<double,0,1>& weights,
            double bias,
            const feature_extractor& fe
        );
        /*!
            requires
                - fe.num_features() == weights.size()
            ensures
                - #get_feature_extractor() == fe
                - #get_weights() == weights
                - #get_bias() == bias
                - #forces_assignment() == false 
        !*/

        assignment_function(
            const matrix<double,0,1>& weights,
            double bias,
            const feature_extractor& fe,
            bool force_assignment
        );
        /*!
            requires
                - fe.num_features() == weights.size()
            ensures
                - #get_feature_extractor() == fe
                - #get_weights() == weights
                - #get_bias() == bias
                - #forces_assignment() == force_assignment
        !*/

        const feature_extractor& get_feature_extractor (
        ) const;
        /*!
            ensures
                - returns the feature extractor used by this object
        !*/

        const matrix<double,0,1>& get_weights (
        ) const;
        /*!
            ensures
                - returns the parameter vector (w) associated with this assignment function. 
                  The length of the vector is get_feature_extractor().num_features().  
        !*/

        double get_bias (
        ) const;
        /*!
            ensures
                - returns the bias parameter associated with this assignment function.
        !*/

        bool forces_assignment (
        ) const; 
        /*!
            ensures
                - returns true if this object is in the "forced assignment mode" and false
                  otherwise.
                - When deciding how to match LHS to RHS, this object can operate in one of 
                  two modes.  In the default mode, this object will indicate that there is 
                  no match for an element of LHS if the best matching element of RHS would 
                  result in a negative match_score().  However, in the "forced assignment mode",
                  this object will always make the assignment if there is an available 
                  element in RHS, regardless of the match_score().

                  Another way to understand this distinction is to consider an example.  
                  Suppose LHS and RHS both contain 10 elements.  Then in the default mode, 
                  it is possible for this object to indicate that there are anywhere between 
                  0 to 10 matches between LHS and RHS.  However, in forced assignment mode 
                  it will always indicate exactly 10 matches.   
        !*/

        result_type operator()(
            const std::vector<lhs_element>& lhs,
            const std::vector<rhs_element>& rhs 
        ) const
        /*!
            ensures
                - returns a vector ASSIGN such that:
                    - ASSIGN.size() == lhs.size()
                    - if (ASSIGN[i] != -1) then
                        - lhs[i] is predicted to associate to rhs[ASSIGN[i]].
                    - else
                        - lhs[i] doesn't associate with anything in rhs.
                    - All values in ASSIGN which are not equal to -1 are unique.  
                      That is, ASSIGN will never indicate that more than one element
                      of lhs is assigned to a particular element of rhs.
        !*/

        result_type operator() (
            const sample_type& item
        ) const;
        /*!
            ensures
                - returns (*this)(item.first, item.second);
        !*/

        void predict_assignments (
            const sample_type& item,
            result_type& assignment
        ) const;
        /*!
            ensures
                - #assignment == (*this)(item)
        !*/

        void predict_assignments (
            const std::vector<lhs_element>& lhs,
            const std::vector<rhs_element>& rhs 
            result_type& assignment
        ) const;
        /*!
            ensures
                - #assignment == (*this)(lhs,rhs)
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void serialize (
        const assignment_function<feature_extractor>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void deserialize (
        assignment_function<feature_extractor>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGNMENT_FuNCTION_ABSTRACT_Hh_

