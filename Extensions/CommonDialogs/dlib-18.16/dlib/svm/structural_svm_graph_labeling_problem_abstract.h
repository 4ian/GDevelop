// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_ABSTRACT_Hh_

#include "../array/array_kernel_abstract.h"
#include "../graph/graph_kernel_abstract.h"
#include "../matrix/matrix_abstract.h"
#include "sparse_vector_abstract.h"
#include "structural_svm_problem_threaded_abstract.h"
#include <vector>

// ----------------------------------------------------------------------------------------

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type
        >
    bool is_graph_labeling_problem (
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels
    );
    /*!
        requires
            - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
            - graph_type::type and graph_type::edge_type are either both dlib::matrix types
              capable of containing column vectors or both some kind of sparse vector type
              as defined in dlib/svm/sparse_vector_abstract.h.
        ensures
            - Note that a graph labeling problem is a task to learn a binary classifier which 
              predicts the correct label for each node in the provided graphs.  Additionally, 
              we have information in the form of edges between nodes where edges are present 
              when we believe the linked nodes are likely to have the same label.  Therefore, 
              part of a graph labeling problem is to learn to score each edge in terms of how 
              strongly the edge should enforce labeling consistency between its two nodes.  
              Thus, to be a valid graph labeling problem, samples should contain example graphs 
              of connected nodes while labels should indicate the desired label of each node.  
              The precise requirements for a valid graph labeling problem are listed below.
            - This function returns true if all of the following are true and false otherwise:
                - is_learning_problem(samples, labels) == true
                - All the vectors stored on the edges of each graph in samples 
                  contain only values which are >= 0. 
                - for all valid i:
                    - graph_contains_length_one_cycle(samples[i]) == false 
                    - samples[i].number_of_nodes() == labels[i].size()
                      (i.e. Every graph node gets its own label)
                - if (graph_type::edge_type is a dlib::matrix) then     
                    - All the nodes must contain vectors with the same number of dimensions.
                    - All the edges must contain vectors with the same number of dimensions.
                      (However, edge vectors may differ in dimension from node vectors.)
                    - All vectors have non-zero size.  That is, they have more than 0 dimensions.
    !*/

    template <
        typename graph_type
        >
    bool is_graph_labeling_problem (
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        std::string& reason_for_failure
    );
    /*!
        This function is identical to the above version of is_graph_labeling_problem()
        except that if it returns false it will populate reason_for_failure with a message
        describing why the graph is not a valid learning problem.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    bool sizes_match (
        const std::vector<std::vector<T> >& lhs,
        const std::vector<std::vector<U> >& rhs
    );
    /*!
        ensures
            - returns true if the sizes of lhs and rhs, as well as their constituent vectors
              all match.  In particular, we return true if all of the following conditions are
              met and false otherwise:
                - lhs.size() == rhs.size()
                - for all valid i:
                    - lhs[i].size() == rhs[i].size()
    !*/

// ----------------------------------------------------------------------------------------

    bool all_values_are_nonnegative (
        const std::vector<std::vector<double> >& x
    );
    /*!
        ensures
            - returns true if all the double values contained in x are >= 0.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    class structural_svm_graph_labeling_problem : noncopyable,
                                                  public structural_svm_problem_threaded<matrix<double,0,1>, 
                                                         typename graph_type::type >
    {
        /*!
            REQUIREMENTS ON graph_type 
                - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
                - graph_type::type and graph_type::edge_type must be either matrix objects
                  capable of representing column vectors or some kind of sparse vector
                  type as defined in dlib/svm/sparse_vector_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning the weight vectors needed to use
                a graph_labeler object.  It learns the parameter vectors by formulating 
                the problem as a structural SVM problem.  
        !*/

    public:
        typedef matrix<double,0,1> matrix_type;
        typedef typename graph_type::type feature_vector_type;
        typedef graph_type sample_type;
        typedef std::vector<bool> label_type;

        structural_svm_graph_labeling_problem(
            const dlib::array<sample_type>& samples,
            const std::vector<label_type>& labels,
            const std::vector<std::vector<double> >& losses,
            unsigned long num_threads 
        );
        /*!
            requires
                - is_graph_labeling_problem(samples,labels) == true
                - if (losses.size() != 0) then
                    - sizes_match(labels, losses) == true
                    - all_values_are_nonnegative(losses) == true
            ensures
                - This object attempts to learn a mapping from the given samples to the 
                  given labels.  In particular, it attempts to learn to predict labels[i] 
                  based on samples[i].  Or in other words, this object can be used to learn 
                  parameter vectors, E and W, such that a graph_labeler declared as:
                    graph_labeler<feature_vector_type> labeler(E,W)
                  results in a labeler object which attempts to compute the following mapping:
                    labels[i] == labeler(samples[i])
                - When you use this object with the oca optimizer you get back just one
                  big parameter vector as the solution.  Therefore, note that this single
                  big vector is the concatenation of E and W.  The first get_num_edge_weights()
                  elements of this vector correspond to E and the rest is W.
                - This object will use num_threads threads during the optimization 
                  procedure.  You should set this parameter equal to the number of 
                  available processing cores on your machine.
                - if (losses.size() == 0) then
                    - #get_loss_on_positive_class() == 1.0
                    - #get_loss_on_negative_class() == 1.0
                    - #get_losses().size() == 0
                    - The losses argument is effectively ignored if its size is zero.
                - else
                    - #get_losses() == losses
                    - Each node in the training data has its own loss value defined by
                      the corresponding entry of losses.  In particular, this means that 
                      the node with label labels[i][j] incurs a loss of losses[i][j] if 
                      it is incorrectly labeled.
                    - The get_loss_on_positive_class() and get_loss_on_negative_class()
                      parameters are ignored.  Only get_losses() is used in this case.
        !*/

        const std::vector<std::vector<double> >& get_losses (
        ) const;
        /*!
            ensures
                - returns the losses vector given to this object's constructor. 
                  This vector defines the per sample loss values used.  If the vector
                  is empty then the loss values defined by get_loss_on_positive_class() and
                  get_loss_on_positive_class() are used instead.
        !*/

        long get_num_edge_weights (
        ) const;
        /*!
            ensures
                - returns the dimensionality of the edge weight vector.  It is also
                  important to know that when using the oca solver with this object,
                  you must set it to generate non-negative weights for the edge weight
                  part of the total weight vector.  You can do this by passing get_num_edge_weights()
                  to the third argument to oca::operator().
        !*/

        void set_loss_on_positive_class (
            double loss
        );
        /*!
            requires
                - loss >= 0
                - get_losses().size() == 0
            ensures
                - #get_loss_on_positive_class() == loss
        !*/

        void set_loss_on_negative_class (
            double loss
        );
        /*!
            requires
                - loss >= 0
                - get_losses().size() == 0
            ensures
                - #get_loss_on_negative_class() == loss
        !*/

        double get_loss_on_positive_class (
        ) const;
        /*!
            requires
                - get_losses().size() == 0
            ensures
                - returns the loss incurred when a graph node which is supposed to have
                  a label of true gets misclassified.  This value controls how much we care 
                  about correctly classifying nodes which should be labeled as true.  Larger 
                  loss values indicate that we care more strongly than smaller values.
        !*/

        double get_loss_on_negative_class (
        ) const;
        /*!
            requires
                - get_losses().size() == 0
            ensures
                - returns the loss incurred when a graph node which is supposed to have
                  a label of false gets misclassified.  This value controls how much we care 
                  about correctly classifying nodes which should be labeled as false.  Larger 
                  loss values indicate that we care more strongly than smaller values.
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_ABSTRACT_Hh_




