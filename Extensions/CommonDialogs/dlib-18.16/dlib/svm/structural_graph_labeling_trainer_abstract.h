// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_ABSTRACT_Hh_

#include "../algs.h"
#include "../optimization.h"
#include "structural_svm_graph_labeling_problem_abstract.h"
#include "../graph_cuts/graph_labeler_abstract.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type 
        >
    class structural_graph_labeling_trainer
    {
        /*!
            REQUIREMENTS ON vector_type 
                - vector_type is a dlib::matrix capable of representing column 
                  vectors or it is a sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.  

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning to solve a graph labeling problem based
                on a training dataset of example labeled graphs.  The training procedure 
                produces a graph_labeler object which can be used to predict the labelings
                of new graphs.

                Note that this is just a convenience wrapper around the 
                structural_svm_graph_labeling_problem to make it look 
                similar to all the other trainers in dlib.  
        !*/

    public:
        typedef std::vector<bool> label_type;
        typedef graph_labeler<vector_type> trained_function_type;

        structural_graph_labeling_trainer (
        );
        /*!
            ensures
                - #get_c() == 10
                - this object isn't verbose
                - #get_epsilon() == 0.1
                - #get_num_threads() == 2
                - #get_max_cache_size() == 5
                - #get_loss_on_positive_class() == 1.0
                - #get_loss_on_negative_class() == 1.0
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

        void set_epsilon (
            double eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        double get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer 
                  to train.  You can think of this epsilon value as saying "solve the 
                  optimization problem until the average number of labeling mistakes per 
                  example graph is within epsilon of its optimal value".
        !*/

        void set_max_cache_size (
            unsigned long max_size
        );
        /*!
            ensures
                - #get_max_cache_size() == max_size
        !*/

        unsigned long get_max_cache_size (
        ) const;
        /*!
            ensures
                - During training, this object basically runs the graph_labeler on each 
                  training sample, over and over.  To speed this up, it is possible to 
                  cache the results of these invocations.  This function returns the number 
                  of cache elements per training sample kept in the cache.  Note that a value 
                  of 0 means caching is not used at all.  
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

        void set_oca (
            const oca& item
        );
        /*!
            ensures
                - #get_oca() == item 
        !*/

        const oca get_oca (
        ) const;
        /*!
            ensures
                - returns a copy of the optimizer used to solve the structural SVM problem.  
        !*/

        void set_c (
            double C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c() = C
        !*/

        double get_c (
        ) const;
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter 
                  that determines the trade-off between trying to fit the training 
                  data (i.e. minimize the loss) or allowing more errors but hopefully 
                  improving the generalization of the resulting graph_labeler.  Larger 
                  values encourage exact fitting while smaller values of C may encourage 
                  better generalization. 
        !*/

        void set_loss_on_positive_class (
            double loss
        );
        /*!
            requires
                - loss >= 0
            ensures
                - #get_loss_on_positive_class() == loss
        !*/

        void set_loss_on_negative_class (
            double loss
        );
        /*!
            requires
                - loss >= 0
            ensures
                - #get_loss_on_negative_class() == loss
        !*/

        double get_loss_on_positive_class (
        ) const;
        /*!
            ensures
                - returns the loss incurred when a graph node which is supposed to have
                  a label of true gets misclassified.  This value controls how much we care 
                  about correctly classifying nodes which should be labeled as true.  Larger 
                  loss values indicate that we care more strongly than smaller values.
        !*/

        double get_loss_on_negative_class (
        ) const;
        /*!
            ensures
                - returns the loss incurred when a graph node which is supposed to have
                  a label of false gets misclassified.  This value controls how much we care 
                  about correctly classifying nodes which should be labeled as false.  Larger 
                  loss values indicate that we care more strongly than smaller values.
        !*/

        template <
            typename graph_type
            >
        const graph_labeler<vector_type> train (  
            const dlib::array<graph_type>& samples,
            const std::vector<label_type>& labels
        ) const;
        /*!
            requires
                - is_graph_labeling_problem(samples,labels) == true
            ensures
                - Uses the structural_svm_graph_labeling_problem to train a graph_labeler
                  on the given samples/labels training pairs.  The idea is to learn to
                  predict a label given an input sample.
                - The values of get_loss_on_positive_class() and get_loss_on_negative_class() 
                  are used to determine how to value mistakes on each node during training.
                - returns a function F with the following properties:
                    - F(new_sample) == The predicted labels for the nodes in the graph
                      new_sample.
        !*/

        template <
            typename graph_type
            >
        const graph_labeler<vector_type> train (  
            const dlib::array<graph_type>& samples,
            const std::vector<label_type>& labels,
            const std::vector<std::vector<double> >& losses
        ) const;
        /*!
            requires
                - is_graph_labeling_problem(samples,labels) == true
                - if (losses.size() != 0) then
                    - sizes_match(labels, losses) == true
                    - all_values_are_nonnegative(losses) == true
            ensures
                - Uses the structural_svm_graph_labeling_problem to train a graph_labeler
                  on the given samples/labels training pairs.  The idea is to learn to
                  predict a label given an input sample.
                - returns a function F with the following properties:
                    - F(new_sample) == The predicted labels for the nodes in the graph
                      new_sample.
                - if (losses.size() == 0) then
                    - The values of get_loss_on_positive_class() and get_loss_on_negative_class() 
                      are used to determine how to value mistakes on each node during training.
                    - The losses argument is effectively ignored if its size is zero.
                - else
                    - Each node in the training data has its own loss value defined by the
                      corresponding entry of losses.  In particular, this means that the
                      node with label labels[i][j] incurs a loss of losses[i][j] if it is
                      incorrectly labeled.
                    - The get_loss_on_positive_class() and get_loss_on_negative_class()
                      parameters are ignored.  Only losses is used in this case.
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_GRAPH_LABELING_tRAINER_ABSTRACT_Hh_

