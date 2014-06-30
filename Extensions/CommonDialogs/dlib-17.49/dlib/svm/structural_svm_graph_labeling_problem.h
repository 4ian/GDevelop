// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_H__
#define DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_H__


#include "structural_svm_graph_labeling_problem_abstract.h"
#include "../graph_cuts.h"
#include "../matrix.h"
#include "../array.h"
#include <vector>
#include <iterator>
#include "structural_svm_problem_threaded.h"
#include "../graph.h"
#include "sparse_vector.h"
#include <sstream>

// ----------------------------------------------------------------------------------------

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type
        >
    bool is_graph_labeling_problem (
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels,
        std::string& reason_for_failure
    )
    {
        typedef typename graph_type::type node_vector_type;
        typedef typename graph_type::edge_type edge_vector_type;
        // The graph must use all dense vectors or all sparse vectors.  It can't mix the two types together.
        COMPILE_TIME_ASSERT( (is_matrix<node_vector_type>::value && is_matrix<edge_vector_type>::value) ||
                            (!is_matrix<node_vector_type>::value && !is_matrix<edge_vector_type>::value));
                            

        std::ostringstream sout;
        reason_for_failure.clear();

        if (!is_learning_problem(samples, labels))
        {
            reason_for_failure = "is_learning_problem(samples, labels) returned false.";
            return false;
        }

        const bool ismat = is_matrix<typename graph_type::type>::value;

        // these are -1 until assigned with a value
        long node_dims = -1;
        long edge_dims = -1;

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            if (samples[i].number_of_nodes() != labels[i].size())
            {
                sout << "samples["<<i<<"].number_of_nodes() doesn't match labels["<<i<<"].size().";
                reason_for_failure = sout.str();
                return false;
            }
            if (graph_contains_length_one_cycle(samples[i]))
            {
                sout << "graph_contains_length_one_cycle(samples["<<i<<"]) returned true.";
                reason_for_failure = sout.str();
                return false;
            }

            for (unsigned long j = 0; j < samples[i].number_of_nodes(); ++j)
            {
                if (ismat && samples[i].node(j).data.size() == 0)
                {
                    sout << "A graph contains an empty vector at node: samples["<<i<<"].node("<<j<<").data.";
                    reason_for_failure = sout.str();
                    return false;
                }

                if (ismat && node_dims == -1)
                    node_dims = samples[i].node(j).data.size();
                // all nodes must have vectors of the same size. 
                if (ismat && (long)samples[i].node(j).data.size() != node_dims)
                {
                    sout << "Not all node vectors in samples["<<i<<"] are the same dimension.";
                    reason_for_failure = sout.str();
                    return false;
                }

                for (unsigned long n = 0; n < samples[i].node(j).number_of_neighbors(); ++n)
                {
                    if (ismat && samples[i].node(j).edge(n).size() == 0)
                    {
                        sout << "A graph contains an empty vector at edge: samples["<<i<<"].node("<<j<<").edge("<<n<<").";
                        reason_for_failure = sout.str();
                        return false;
                    }
                    if (min(samples[i].node(j).edge(n)) < 0)
                    {
                        sout << "A graph contains negative values on an edge vector at: samples["<<i<<"].node("<<j<<").edge("<<n<<").";
                        reason_for_failure = sout.str();
                        return false;
                    }

                    if (ismat && edge_dims == -1)
                        edge_dims = samples[i].node(j).edge(n).size();
                    // all edges must have vectors of the same size.
                    if (ismat && (long)samples[i].node(j).edge(n).size() != edge_dims)
                    {
                        sout << "Not all edge vectors in samples["<<i<<"] are the same dimension.";
                        reason_for_failure = sout.str();
                        return false;
                    }
                }
            }
        }

        return true;
    }

    template <
        typename graph_type
        >
    bool is_graph_labeling_problem (
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels
    )
    {
        std::string reason_for_failure;
        return is_graph_labeling_problem(samples, labels, reason_for_failure);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    bool sizes_match (
        const std::vector<std::vector<T> >& lhs,
        const std::vector<std::vector<U> >& rhs
    )
    {
        if (lhs.size() != rhs.size())
            return false;

        for (unsigned long i = 0; i < lhs.size(); ++i)
        {
            if (lhs[i].size() != rhs[i].size())
                return false;
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    inline bool all_values_are_nonnegative (
        const std::vector<std::vector<double> >& x
    )
    {
        for (unsigned long i = 0; i < x.size(); ++i)
        {
            for (unsigned long j = 0; j < x[i].size(); ++j)
            {
                if (x[i][j] < 0)
                    return false;
            }
        }
        return true;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename T,
            typename enable = void
            >
        struct fvect
        {
            // In this case type should be some sparse vector type
            typedef typename T::type type;
        };

        template < typename T >
        struct fvect<T, typename enable_if<is_matrix<typename T::type> >::type>
        {
            // The point of this stuff is to create the proper matrix
            // type to represent the concatenation of an edge vector
            // with an node vector.
            typedef typename T::type      node_mat;
            typedef typename T::edge_type edge_mat;
            const static long NRd = node_mat::NR; 
            const static long NRe = edge_mat::NR; 
            const static long NR = ((NRd!=0) && (NRe!=0)) ? (NRd+NRe) : 0;
            typedef typename node_mat::value_type value_type;

            typedef matrix<value_type,NR,1, typename node_mat::mem_manager_type, typename node_mat::layout_type> type;
        };
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    class structural_svm_graph_labeling_problem : noncopyable,
        public structural_svm_problem_threaded<matrix<double,0,1>, 
                                            typename dlib::impl::fvect<graph_type>::type >
    {
    public:
        typedef matrix<double,0,1> matrix_type;
        typedef typename dlib::impl::fvect<graph_type>::type feature_vector_type;

        typedef graph_type sample_type;

        typedef std::vector<bool> label_type;

        structural_svm_graph_labeling_problem(
            const dlib::array<sample_type>& samples_,
            const std::vector<label_type>& labels_,
            const std::vector<std::vector<double> >& losses_,
            unsigned long num_threads = 2
        ) :
            structural_svm_problem_threaded<matrix_type,feature_vector_type>(num_threads),
            samples(samples_),
            labels(labels_),
            losses(losses_)
        {
            // make sure requires clause is not broken
#ifdef ENABLE_ASSERTS
            std::string reason_for_failure;
            DLIB_ASSERT(is_graph_labeling_problem(samples, labels, reason_for_failure) == true ,
                    "\t structural_svm_graph_labeling_problem::structural_svm_graph_labeling_problem()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t reason_for_failure: " << reason_for_failure 
                    << "\n\t samples.size(): " << samples.size() 
                    << "\n\t labels.size():  " << labels.size() 
                    << "\n\t this: " << this );
            DLIB_ASSERT((losses.size() == 0 || sizes_match(labels, losses) == true) &&
                        all_values_are_nonnegative(losses) == true,
                    "\t structural_svm_graph_labeling_problem::structural_svm_graph_labeling_problem()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t labels.size():  " << labels.size() 
                    << "\n\t losses.size():  " << losses.size() 
                    << "\n\t sizes_match(labels,losses): " << sizes_match(labels,losses) 
                    << "\n\t all_values_are_nonnegative(losses): " << all_values_are_nonnegative(losses) 
                    << "\n\t this: " << this );
#endif

            loss_pos = 1.0;
            loss_neg = 1.0;

            // figure out how many dimensions are in the node and edge vectors.
            node_dims = 0;
            edge_dims = 0;
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                for (unsigned long j = 0; j < samples[i].number_of_nodes(); ++j)
                {
                    node_dims = std::max(node_dims,(long)max_index_plus_one(samples[i].node(j).data));
                    for (unsigned long n = 0; n < samples[i].node(j).number_of_neighbors(); ++n)
                    {
                        edge_dims = std::max(edge_dims, (long)max_index_plus_one(samples[i].node(j).edge(n)));
                    }
                }
            }
        }

        const std::vector<std::vector<double> >& get_losses (
        ) const { return losses; }

        long get_num_edge_weights (
        ) const
        { 
            return edge_dims;
        }

        void set_loss_on_positive_class (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0 && get_losses().size() == 0,
                    "\t void structural_svm_graph_labeling_problem::set_loss_on_positive_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t loss: " << loss 
                    << "\n\t this: " << this );

            loss_pos = loss;
        }

        void set_loss_on_negative_class (
            double loss
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(loss >= 0 && get_losses().size() == 0,
                    "\t void structural_svm_graph_labeling_problem::set_loss_on_negative_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t loss: " << loss 
                    << "\n\t this: " << this );

            loss_neg = loss;
        }

        double get_loss_on_negative_class (
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(get_losses().size() == 0,
                    "\t double structural_svm_graph_labeling_problem::get_loss_on_negative_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t this: " << this );

            return loss_neg; 
        }

        double get_loss_on_positive_class (
        ) const 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(get_losses().size() == 0,
                    "\t double structural_svm_graph_labeling_problem::get_loss_on_positive_class()"
                    << "\n\t Invalid inputs were given to this function."
                    << "\n\t this: " << this );

            return loss_pos; 
        }


    private:
        virtual long get_num_dimensions (
        ) const 
        {
            // The psi/w vector will begin with all the edge dims and then follow with the node dims.
            return edge_dims + node_dims;
        }

        virtual long get_num_samples (
        ) const 
        {
            return samples.size();
        }

        template <typename psi_type>
        typename enable_if<is_matrix<psi_type> >::type get_joint_feature_vector (
            const sample_type& sample, 
            const label_type& label,
            psi_type& psi
        ) const 
        {
            psi.set_size(get_num_dimensions());
            psi = 0;
            for (unsigned long i = 0; i < sample.number_of_nodes(); ++i)
            {
                // accumulate the node vectors
                if (label[i] == true)
                    set_rowm(psi, range(edge_dims, psi.size()-1)) += sample.node(i).data;

                for (unsigned long n = 0; n < sample.node(i).number_of_neighbors(); ++n)
                {
                    const unsigned long j = sample.node(i).neighbor(n).index();

                    // Don't double count edges.  Also only include the vector if
                    // the labels disagree.
                    if (i < j && label[i] != label[j])
                    {
                        set_rowm(psi, range(0, edge_dims-1)) -= sample.node(i).edge(n);
                    }
                }
            }
        }

        template <typename T>
        void add_to_sparse_vect (
            T& psi,
            const T& vect,
            unsigned long offset 
        ) const
        {
            for (typename T::const_iterator i = vect.begin(); i != vect.end(); ++i)
            {
                psi.insert(psi.end(), std::make_pair(i->first+offset, i->second));
            }
        }

        template <typename T>
        void subtract_from_sparse_vect (
            T& psi,
            const T& vect
        ) const
        {
            for (typename T::const_iterator i = vect.begin(); i != vect.end(); ++i)
            {
                psi.insert(psi.end(), std::make_pair(i->first, -i->second));
            }
        }

        template <typename psi_type>
        typename disable_if<is_matrix<psi_type> >::type get_joint_feature_vector (
            const sample_type& sample, 
            const label_type& label,
            psi_type& psi
        ) const 
        {
            psi.clear();
            for (unsigned long i = 0; i < sample.number_of_nodes(); ++i)
            {
                // accumulate the node vectors
                if (label[i] == true)
                    add_to_sparse_vect(psi, sample.node(i).data, edge_dims);

                for (unsigned long n = 0; n < sample.node(i).number_of_neighbors(); ++n)
                {
                    const unsigned long j = sample.node(i).neighbor(n).index();

                    // Don't double count edges.  Also only include the vector if
                    // the labels disagree.
                    if (i < j && label[i] != label[j])
                    {
                        subtract_from_sparse_vect(psi, sample.node(i).edge(n));
                    }
                }
            }
        }

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi 
        ) const 
        {
            get_joint_feature_vector(samples[idx], labels[idx], psi);
        }

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            double& loss,
            feature_vector_type& psi
        ) const
        {
            const sample_type& samp = samples[idx];

            // setup the potts graph based on samples[idx] and current_solution.
            graph<double,double>::kernel_1a g; 
            copy_graph_structure(samp, g);
            for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
            {
                g.node(i).data = dot(rowm(current_solution,range(edge_dims,current_solution.size()-1)),
                                    samp.node(i).data);

                // Include a loss augmentation so that we will get the proper loss augmented
                // max when we use find_max_factor_graph_potts() below.
                if (labels[idx][i])
                    g.node(i).data -= get_loss_for_sample(idx,i,!labels[idx][i]);
                else
                    g.node(i).data += get_loss_for_sample(idx,i,!labels[idx][i]);

                for (unsigned long n = 0; n < g.node(i).number_of_neighbors(); ++n)
                {
                    const unsigned long j = g.node(i).neighbor(n).index();
                    // Don't compute an edge weight more than once. 
                    if (i < j)
                    {
                        g.node(i).edge(n) = dot(rowm(current_solution,range(0,edge_dims-1)),
                                                samp.node(i).edge(n));
                    }
                }

            }

            std::vector<node_label> labeling;
            find_max_factor_graph_potts(g, labeling);


            std::vector<bool> bool_labeling;
            bool_labeling.reserve(labeling.size());
            // figure out the loss
            loss = 0;
            for (unsigned long i = 0; i < labeling.size(); ++i)
            {
                const bool predicted_label = (labeling[i]!= 0);
                bool_labeling.push_back(predicted_label);
                loss += get_loss_for_sample(idx, i, predicted_label);
            }

            // compute psi
            get_joint_feature_vector(samp, bool_labeling, psi);
        }

        double get_loss_for_sample (
            long sample_idx,
            long node_idx,
            bool predicted_label
        ) const
        /*!
            requires
                - 0 <= sample_idx < labels.size()
                - 0 <= node_idx < labels[sample_idx].size()
            ensures
                - returns the loss incurred for predicting that the node
                  samples[sample_idx].node(node_idx) has a label of predicted_label.
        !*/
        {
                const bool true_label = labels[sample_idx][node_idx];
                if (true_label != predicted_label)
                {
                    if (losses.size() != 0)
                        return losses[sample_idx][node_idx];
                    else if (true_label == true)
                        return loss_pos;
                    else
                        return loss_neg;
                }
                else
                {
                    // no loss for making the correct prediction.
                    return 0;
                }
        }

        const dlib::array<sample_type>& samples;
        const std::vector<label_type>& labels;
        const std::vector<std::vector<double> >& losses;

        long node_dims;
        long edge_dims;
        double loss_pos;
        double loss_neg;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_GRAPH_LAbELING_PROBLEM_H__


