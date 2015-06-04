// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MODULARITY_ClUSTERING__H__
#define DLIB_MODULARITY_ClUSTERING__H__

#include "modularity_clustering_abstract.h"
#include "../sparse_vector.h"
#include "../graph_utils/edge_list_graphs.h"
#include "../matrix.h"
#include "../rand.h"

namespace dlib
{

// -----------------------------------------------------------------------------------------

    namespace impl
    {
        inline double newman_cluster_split (
            dlib::rand& rnd,
            const std::vector<ordered_sample_pair>& edges,
            const matrix<double,0,1>& node_degrees, // k from the Newman paper
            const matrix<double,0,1>& Bdiag,        // diag(B) from the Newman paper
            const double& edge_sum,                 // m from the Newman paper
            matrix<double,0,1>& labels,
            const double eps,
            const unsigned long max_iterations
        )
        /*!
            requires
                - node_degrees.size() == max_index_plus_one(edges)
                - Bdiag.size() == max_index_plus_one(edges)
                - edges must be sorted according to order_by_index()
            ensures
                - This routine splits a graph into two subgraphs using the Newman 
                  clustering method.  
                - returns the modularity obtained when the graph is split according
                  to the contents of #labels. 
                - #labels.size() == node_degrees.size()
                - for all valid i: #labels(i) == -1 or +1
                - if (this function returns 0) then
                    - all the labels are equal, i.e. the graph is not split.
        !*/
        {
            // Scale epsilon so that it is relative to the expected value of an element of a
            // unit vector of length node_degrees.size().
            const double power_iter_eps = eps * std::sqrt(1.0/node_degrees.size());

            // Make a random unit vector and put in labels.
            labels.set_size(node_degrees.size());
            for (long i = 0; i < labels.size(); ++i)
                labels(i) = rnd.get_random_gaussian();
            labels /= length(labels);

            matrix<double,0,1> Bv, Bv_unit;

            // Do the power iteration for a while.
            double eig = -1;
            double offset = 0;
            while (eig < 0)
            {

                // any number larger than power_iter_eps
                double iteration_change = power_iter_eps*2+1; 
                for (unsigned long i = 0; i < max_iterations && iteration_change > power_iter_eps; ++i) 
                {
                    sparse_matrix_vector_multiply(edges, labels, Bv);
                    Bv -= dot(node_degrees, labels)/(2*edge_sum) * node_degrees;

                    if (offset != 0)
                    {
                        Bv -= offset*labels;
                    }


                    const double len = length(Bv);
                    if (len != 0)
                    {
                        Bv_unit = Bv/len;
                        iteration_change = max(abs(labels-Bv_unit));
                        labels.swap(Bv_unit);
                    }
                    else
                    {
                        // Had a bad time, pick another random vector and try it with the
                        // power iteration.
                        for (long i = 0; i < labels.size(); ++i)
                            labels(i) = rnd.get_random_gaussian();
                    }
                }

                eig = dot(Bv,labels);
                // we will repeat this loop if the largest eigenvalue is negative
                offset = eig;
            }


            for (long i = 0; i < labels.size(); ++i)
            {
                if (labels(i) > 0)
                    labels(i) = 1;
                else
                    labels(i) = -1;
            }


            // compute B*labels, store result in Bv.
            sparse_matrix_vector_multiply(edges, labels, Bv);
            Bv -= dot(node_degrees, labels)/(2*edge_sum) * node_degrees;

            // Do some label refinement.  In this step we swap labels if it
            // improves the modularity score.
            bool flipped_label = true;
            while(flipped_label)
            {
                flipped_label = false;
                unsigned long idx = 0;
                for (long i = 0; i < labels.size(); ++i)
                {
                    const double val = -2*labels(i);
                    const double increase = 4*Bdiag(i) + 2*val*Bv(i);

                    // if there is an increase in modularity for swapping this label
                    if (increase > 0)
                    {
                        labels(i) *= -1;
                        while (idx < edges.size() && edges[idx].index1() == (unsigned long)i)
                        {
                            const long j = edges[idx].index2();
                            Bv(j) += val*edges[idx].distance();
                            ++idx;
                        }

                        Bv -= (val*node_degrees(i)/(2*edge_sum))*node_degrees;

                        flipped_label = true;
                    }
                    else
                    {
                        while (idx < edges.size() && edges[idx].index1() == (unsigned long)i)
                        {
                            ++idx;
                        }
                    }
                }
            }


            const double modularity = dot(Bv, labels)/(4*edge_sum);

            return modularity;
        }

    // -------------------------------------------------------------------------------------

        inline unsigned long newman_cluster_helper (
            dlib::rand& rnd,
            const std::vector<ordered_sample_pair>& edges,
            const matrix<double,0,1>& node_degrees, // k from the Newman paper
            const matrix<double,0,1>& Bdiag,        // diag(B) from the Newman paper
            const double& edge_sum,                 // m from the Newman paper
            std::vector<unsigned long>& labels,
            double modularity_threshold,
            const double eps,
            const unsigned long max_iterations
        )
        /*!
            ensures
                - returns the number of clusters the data was split into
        !*/
        {
            matrix<double,0,1> l;
            const double modularity = newman_cluster_split(rnd,edges,node_degrees,Bdiag,edge_sum,l,eps,max_iterations);


            // We need to collapse the node index values down to contiguous values.  So
            // we use the following two vectors to contain the mappings from input index
            // values to their corresponding index values in each split.
            std::vector<unsigned long> left_idx_map(node_degrees.size());
            std::vector<unsigned long> right_idx_map(node_degrees.size());

            // figure out how many nodes went into each side of the split.
            unsigned long num_left_split = 0;
            unsigned long num_right_split = 0;
            for (long i = 0; i < l.size(); ++i)
            {
                if (l(i) > 0)
                {
                    left_idx_map[i] = num_left_split;
                    ++num_left_split;
                }
                else
                {
                    right_idx_map[i] = num_right_split;
                    ++num_right_split;
                }
            }

            // do a recursive split if it will improve the modularity.
            if (modularity > modularity_threshold && num_left_split > 0 && num_right_split > 0)
            {

                // split the node_degrees and Bdiag matrices into left and right split parts
                matrix<double,0,1> left_node_degrees(num_left_split);
                matrix<double,0,1> right_node_degrees(num_right_split);
                matrix<double,0,1> left_Bdiag(num_left_split);
                matrix<double,0,1> right_Bdiag(num_right_split);
                for (long i = 0; i < l.size(); ++i)
                {
                    if (l(i) > 0)
                    {
                        left_node_degrees(left_idx_map[i]) = node_degrees(i);
                        left_Bdiag(left_idx_map[i]) = Bdiag(i);
                    }
                    else
                    {
                        right_node_degrees(right_idx_map[i]) = node_degrees(i);
                        right_Bdiag(right_idx_map[i]) = Bdiag(i);
                    }
                }


                // put the edges from one side of the split into split_edges
                std::vector<ordered_sample_pair> split_edges;
                modularity_threshold = 0;
                for (unsigned long k = 0; k < edges.size(); ++k)
                {
                    const unsigned long i = edges[k].index1();
                    const unsigned long j = edges[k].index2();
                    const double d = edges[k].distance();
                    if (l(i) > 0 && l(j) > 0)
                    {
                        split_edges.push_back(ordered_sample_pair(left_idx_map[i], left_idx_map[j], d));
                        modularity_threshold += d;
                    }
                }
                modularity_threshold -= sum(left_node_degrees*sum(left_node_degrees))/(2*edge_sum);
                modularity_threshold /= 4*edge_sum;

                unsigned long num_left_clusters;
                std::vector<unsigned long> left_labels;
                num_left_clusters = newman_cluster_helper(rnd,split_edges,left_node_degrees,left_Bdiag,
                                                          edge_sum,left_labels,modularity_threshold,
                                                          eps, max_iterations);

                // now load the other side into split_edges and cluster it as well
                split_edges.clear();
                modularity_threshold = 0;
                for (unsigned long k = 0; k < edges.size(); ++k)
                {
                    const unsigned long i = edges[k].index1();
                    const unsigned long j = edges[k].index2();
                    const double d = edges[k].distance();
                    if (l(i) < 0 && l(j) < 0)
                    {
                        split_edges.push_back(ordered_sample_pair(right_idx_map[i], right_idx_map[j], d));
                        modularity_threshold += d;
                    }
                }
                modularity_threshold -= sum(right_node_degrees*sum(right_node_degrees))/(2*edge_sum);
                modularity_threshold /= 4*edge_sum;

                unsigned long num_right_clusters;
                std::vector<unsigned long> right_labels;
                num_right_clusters = newman_cluster_helper(rnd,split_edges,right_node_degrees,right_Bdiag,
                                                           edge_sum,right_labels,modularity_threshold,
                                                           eps, max_iterations);

                // Now merge the labels from the two splits.
                labels.resize(node_degrees.size());
                for (unsigned long i = 0; i < labels.size(); ++i)
                {
                    // if this node was in the left split
                    if (l(i) > 0)
                    {
                        labels[i] = left_labels[left_idx_map[i]];
                    }
                    else // if this node was in the right split
                    {
                        labels[i] = right_labels[right_idx_map[i]] + num_left_clusters;
                    }
                }


                return num_left_clusters + num_right_clusters;
            }
            else
            {
                labels.assign(node_degrees.size(),0);
                return 1;
            }

        }
    }

// ----------------------------------------------------------------------------------------

    inline unsigned long newman_cluster (
        const std::vector<ordered_sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const double eps = 1e-4,
        const unsigned long max_iterations = 2000
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_ordered_by_index(edges),
                    "\t unsigned long newman_cluster()"
                    << "\n\t Invalid inputs were given to this function"
        );

        labels.clear();
        if (edges.size() == 0)
            return 0;

        const unsigned long num_nodes = max_index_plus_one(edges);

        // compute the node_degrees vector, edge_sum value, and diag(B).
        matrix<double,0,1> node_degrees(num_nodes);
        matrix<double,0,1> Bdiag(num_nodes);
        Bdiag = 0;
        double edge_sum = 0;
        node_degrees = 0;
        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            node_degrees(edges[i].index1()) += edges[i].distance();
            edge_sum += edges[i].distance();
            if (edges[i].index1() == edges[i].index2())
                Bdiag(edges[i].index1()) += edges[i].distance();
        }
        edge_sum /= 2;
        Bdiag -= squared(node_degrees)/(2*edge_sum);


        dlib::rand rnd;
        return impl::newman_cluster_helper(rnd,edges,node_degrees,Bdiag,edge_sum,labels,0,eps,max_iterations);
    }

// ----------------------------------------------------------------------------------------

    inline unsigned long newman_cluster (
        const std::vector<sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const double eps = 1e-4,
        const unsigned long max_iterations = 2000
    )
    {
        std::vector<ordered_sample_pair> oedges;
        convert_unordered_to_ordered(edges, oedges);
        std::sort(oedges.begin(), oedges.end(), &order_by_index<ordered_sample_pair>);

        return newman_cluster(oedges, labels, eps, max_iterations);
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline std::vector<unsigned long> remap_labels (
            const std::vector<unsigned long>& labels,
            unsigned long& num_labels
        )
        /*!
            ensures
                - This function takes labels and produces a mapping which maps elements of
                  labels into the most compact range in [0, max] as possible.  In particular,
                  there won't be any unused integers in the mapped range.
                - #num_labels == the number of distinct values in labels.
                - returns a vector V such that:
                    - V.size() == labels.size()
                    - max(mat(V))+1 == num_labels.
                    - for all valid i,j:
                        - if (labels[i] == labels[j]) then
                            - V[i] == V[j]
                        - else
                            - V[i] != V[j]
        !*/
        {
            std::map<unsigned long, unsigned long> temp;
            for (unsigned long i = 0; i < labels.size(); ++i)
            {
                if (temp.count(labels[i]) == 0)
                {
                    const unsigned long next = temp.size();
                    temp[labels[i]] = next;
                }
            }

            num_labels = temp.size();

            std::vector<unsigned long> result(labels.size());
            for (unsigned long i = 0; i < labels.size(); ++i)
            {
                result[i] = temp[labels[i]];
            }
            return result;
        }
    }

// ----------------------------------------------------------------------------------------

    inline double modularity (
        const std::vector<sample_pair>& edges,
        const std::vector<unsigned long>& labels
    )
    {
        const unsigned long num_nodes = max_index_plus_one(edges);
        // make sure requires clause is not broken
        DLIB_ASSERT(labels.size() == num_nodes,
                    "\t double modularity()"
                    << "\n\t Invalid inputs were given to this function"
        );

        unsigned long num_labels;
        const std::vector<unsigned long>& labels_ = dlib::impl::remap_labels(labels,num_labels);

        std::vector<double> cluster_sums(num_labels,0);
        std::vector<double> k(num_nodes,0);

        double Q = 0;
        double m = 0;
        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            const unsigned long n1 = edges[i].index1();
            const unsigned long n2 = edges[i].index2();
            k[n1] += edges[i].distance();
            if (n1 != n2)
                k[n2] += edges[i].distance();

            if (n1 != n2)
                m += edges[i].distance();
            else
                m += edges[i].distance()/2;

            if (labels_[n1] == labels_[n2])
            {
                if (n1 != n2)
                    Q += 2*edges[i].distance();
                else
                    Q += edges[i].distance();
            }
        }

        if (m == 0)
            return 0;

        for (unsigned long i = 0; i < labels_.size(); ++i)
        {
            cluster_sums[labels_[i]] += k[i];
        }

        for (unsigned long i = 0; i < labels_.size(); ++i)
        {
            Q -= k[i]*cluster_sums[labels_[i]]/(2*m);
        }

        return 1.0/(2*m)*Q;
    }

// ----------------------------------------------------------------------------------------

    inline double modularity (
        const std::vector<ordered_sample_pair>& edges,
        const std::vector<unsigned long>& labels
    )
    {
        const unsigned long num_nodes = max_index_plus_one(edges);
        // make sure requires clause is not broken
        DLIB_ASSERT(labels.size() == num_nodes,
                    "\t double modularity()"
                    << "\n\t Invalid inputs were given to this function"
        );


        unsigned long num_labels;
        const std::vector<unsigned long>& labels_ = dlib::impl::remap_labels(labels,num_labels);

        std::vector<double> cluster_sums(num_labels,0);
        std::vector<double> k(num_nodes,0);

        double Q = 0;
        double m = 0;
        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            const unsigned long n1 = edges[i].index1();
            const unsigned long n2 = edges[i].index2();
            k[n1] += edges[i].distance();
            m += edges[i].distance();
            if (labels_[n1] == labels_[n2])
            {
                Q += edges[i].distance();
            }
        }

        if (m == 0)
            return 0;

        for (unsigned long i = 0; i < labels_.size(); ++i)
        {
            cluster_sums[labels_[i]] += k[i];
        }

        for (unsigned long i = 0; i < labels_.size(); ++i)
        {
            Q -= k[i]*cluster_sums[labels_[i]]/m;
        }

        return 1.0/m*Q;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MODULARITY_ClUSTERING__H__

