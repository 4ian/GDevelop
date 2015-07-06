// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ONE_VS_ALL_TRAiNER_ABSTRACT_Hh_
#ifdef DLIB_ONE_VS_ALL_TRAiNER_ABSTRACT_Hh_


#include "one_vs_all_decision_function_abstract.h"
#include <vector>

#include "../any/any_trainer_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename any_trainer,
        typename label_type_ = double
        >
    class one_vs_all_trainer
    {
        /*!
            REQUIREMENTS ON any_trainer
                must be an instantiation of the dlib::any_trainer template.   

            REQUIREMENTS ON label_type_
                label_type_ must be default constructable, copyable, and comparable using
                operator < and ==.  It must also be possible to write it to an std::ostream
                using operator<<.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for turning a bunch of binary classifiers into a 
                multiclass classifier.  It does this by training the binary classifiers 
                in a one vs. all fashion.  That is, if you have N possible classes then 
                it trains N binary classifiers which are then used to vote on the identity 
                of a test sample.

                This object works with any kind of binary classification trainer object
                capable of being assigned to an any_trainer object.  (e.g. the svm_nu_trainer) 
        !*/

    public:


        typedef label_type_ label_type;

        typedef typename any_trainer::sample_type sample_type;
        typedef typename any_trainer::scalar_type scalar_type;
        typedef typename any_trainer::mem_manager_type mem_manager_type;

        typedef one_vs_all_decision_function<one_vs_all_trainer> trained_function_type;

        one_vs_all_trainer (
        );
        /*!
            ensures
                - This object is properly initialized.
                - This object will not be verbose unless be_verbose() is called.
                - No binary trainers are associated with *this.  I.e. you have to
                  call set_trainer() before calling train().
                - #get_num_threads() == 4
        !*/

        void set_trainer (
            const any_trainer& trainer
        );
        /*!
            ensures
                - sets the trainer used for all binary subproblems.  Any previous 
                  calls to set_trainer() are overridden by this function.  Even the
                  more specific set_trainer(trainer, l) form. 
        !*/

        void set_trainer (
            const any_trainer& trainer,
            const label_type& l
        );
        /*!
            ensures
                - Sets the trainer object used to create a binary classifier to
                  distinguish l labeled samples from all other samples.
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a 
                  user can observe the progress of the algorithm.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        void set_num_threads (
            unsigned long num
        );
        /*!
            ensures
                - #get_num_threads() == num
        !*/

        unsigned long get_num_threads (
        ) const;
        /*!
            ensures
                - returns the number of threads used during training.  You should 
                  usually set this equal to the number of processing cores on your
                  machine.
        !*/

        struct invalid_label : public dlib::error 
        { 
            /*!
                This is the exception thrown by the train() function below.
            !*/
            label_type l;
        };

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const;
        /*!
            requires
                - is_learning_problem(all_samples, all_labels)
            ensures
                - trains a bunch of binary classifiers in a one vs all fashion to solve the given 
                  multiclass classification problem.  
                - returns a one_vs_all_decision_function F with the following properties:
                    - F contains all the learned binary classifiers and can be used to predict
                      the labels of new samples.
                    - if (new_x is a sample predicted to have a label of L) then
                        - F(new_x) == L
                    - F.get_labels() == select_all_distinct_labels(all_labels)
                    - F.number_of_classes() == select_all_distinct_labels(all_labels).size()
            throws
                - invalid_label
                  This exception is thrown if there are labels in all_labels which don't have
                  any corresponding trainer object.  This will never happen if set_trainer(trainer)
                  has been called.  However, if only the set_trainer(trainer,l) form has been
                  used then this exception is thrown if not all labels have been given a trainer.

                  invalid_label::l will contain the label which is missing a trainer object.  
                  Additionally, the exception will contain an informative error message available 
                  via invalid_label::what().
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ONE_VS_ALL_TRAiNER_ABSTRACT_Hh_



