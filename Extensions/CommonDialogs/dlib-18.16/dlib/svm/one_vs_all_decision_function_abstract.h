// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ONE_VS_ALL_DECISION_FUnCTION_ABSTRACT_Hh_
#ifdef DLIB_ONE_VS_ALL_DECISION_FUnCTION_ABSTRACT_Hh_


#include "../serialize.h"
#include <map>
#include "../any/any_decision_function_abstract.h"
#include "one_vs_all_trainer_abstract.h"
#include "null_df.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename one_vs_all_trainer,
        typename DF1 = null_df, typename DF2 = null_df, typename DF3 = null_df,
        typename DF4 = null_df, typename DF5 = null_df, typename DF6 = null_df,
        typename DF7 = null_df, typename DF8 = null_df, typename DF9 = null_df,
        typename DF10 = null_df
        >
    class one_vs_all_decision_function
    {
        /*!
            REQUIREMENTS ON one_vs_all_trainer
                This should be an instantiation of the one_vs_all_trainer template.  
                It is used to infer which types are used for various things, such as 
                representing labels.

            REQUIREMENTS ON DF*
                These types can either be left at their default values or set
                to any kind of decision function object capable of being
                stored in an any_decision_function<sample_type,scalar_type>
                object.  These types should also be serializable.

            WHAT THIS OBJECT REPRESENTS
                This object represents a multiclass classifier built out of a set of 
                binary classifiers.  Each binary classifier is used to vote for the 
                correct multiclass label using a one vs. all strategy.  Therefore, 
                if you have N classes then there will be N binary classifiers inside 
                this object.

                Note that the DF* template arguments are only used if you want
                to serialize and deserialize one_vs_all_decision_function objects. 
                Specifically, all the types of binary decision function contained
                within a one_vs_all_decision_function must be listed in the
                template arguments if serialization and deserialization is to
                be used.

            THREAD SAFETY
                It is always safe to use distinct instances of this object in different
                threads.  However, when a single instance is shared between threads then
                the following rules apply:
                    It is safe to call the const members of this object from multiple
                    threads so long as all the decision functions contained in this object
                    are also threadsafe.  This is because the const members are purely
                    read-only operations.  However, any operation that modifies a
                    one_vs_all_decision_function is not threadsafe.
        !*/
    public:

        typedef typename one_vs_all_trainer::label_type result_type;
        typedef typename one_vs_all_trainer::sample_type sample_type;
        typedef typename one_vs_all_trainer::scalar_type scalar_type;
        typedef typename one_vs_all_trainer::mem_manager_type mem_manager_type;

        typedef std::map<result_type, any_decision_function<sample_type, scalar_type> > binary_function_table;

        one_vs_all_decision_function(
        );
        /*!
            ensures
                - #number_of_classes() == 0
                - #get_binary_decision_functions().size() == 0
                - #get_labels().size() == 0
        !*/

        explicit one_vs_all_decision_function(
            const binary_function_table& decision_functions
        ); 
        /*!
            ensures
                - #get_binary_decision_functions() == decision_functions
                - #get_labels() == a list of all the labels which appear in the
                  given set of decision functions
                - #number_of_classes() == #get_labels().size() 
        !*/

        template <
            typename df1, typename df2, typename df3, typename df4, typename df5,
            typename df6, typename df7, typename df8, typename df9, typename df10
            >
        one_vs_all_decision_function (
            const one_vs_all_decision_function<one_vs_all_trainer, 
                                               df1, df2, df3, df4, df5,
                                               df6, df7, df8, df9, df10>& item
        ); 
        /*!
            ensures
                - #*this will be a copy of item
                - #number_of_classes() == item.number_of_classes()
                - #get_labels() == item.get_labels()
                - #get_binary_decision_functions() == item.get_binary_decision_functions()
        !*/

        const binary_function_table& get_binary_decision_functions (
        ) const;
        /*!
            ensures
                - returns the table of binary decision functions used by this
                  object.  The label given to a test sample is computed by
                  determining which binary decision function has the largest
                  (i.e. most positive) output and returning the label associated
                  with that decision function.
        !*/

        const std::vector<result_type> get_labels (
        ) const;
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

        std::pair<result_type, scalar_type> predict (
            const sample_type& sample 
        ) const;
        /*!
            requires
                - number_of_classes() != 0
            ensures
                - Evaluates all the decision functions in get_binary_decision_functions()
                  and returns the predicted label and score for the input sample.  That is,
                  returns std::make_pair(label,score)
                - The label is determined by whichever classifier outputs the largest
                  score.  
        !*/

        result_type operator() (
            const sample_type& sample
        ) const
        /*!
            requires
                - number_of_classes() != 0
            ensures
                - Evaluates all the decision functions in get_binary_decision_functions()
                  and returns the predicted label.  That is, returns predict(sample).first.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename DF1, typename DF2, typename DF3,
        typename DF4, typename DF5, typename DF6,
        typename DF7, typename DF8, typename DF9,
        typename DF10 
        >
    void serialize(
        const one_vs_all_decision_function<T,DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10>& item, 
        std::ostream& out
    );
    /*!
        ensures
            - writes the given item to the output stream out.
        throws
            - serialization_error.  
              This is thrown if there is a problem writing to the ostream or if item 
              contains a type of decision function not listed among the DF* template 
              arguments.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename DF1, typename DF2, typename DF3,
        typename DF4, typename DF5, typename DF6,
        typename DF7, typename DF8, typename DF9,
        typename DF10 
        >
    void deserialize(
        one_vs_all_decision_function<T,DF1,DF2,DF3,DF4,DF5,DF6,DF7,DF8,DF9,DF10>& item, 
        std::istream& in 
    );
    /*!
        ensures
            - deserializes a one_vs_all_decision_function from in and stores it in item.
        throws
            - serialization_error.  
              This is thrown if there is a problem reading from the istream or if the
              serialized data contains decision functions not listed among the DF*
              template arguments.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ONE_VS_ALL_DECISION_FUnCTION_ABSTRACT_Hh_

