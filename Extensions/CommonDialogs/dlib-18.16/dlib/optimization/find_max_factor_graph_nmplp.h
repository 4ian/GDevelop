// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_Hh_
#define DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_Hh_

#include "find_max_factor_graph_nmplp_abstract.h"
#include <vector>
#include <map>
#include "../matrix.h"
#include "../hash.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        class simple_hash_map
        {
        public:

            simple_hash_map(
            ) : 
                scan_dist(6)
            {
                data.resize(5000);
            }

            void insert (
                const unsigned long a,
                const unsigned long b,
                const unsigned long value
            ) 
            /*!
                requires
                    - a != std::numeric_limits<unsigned long>::max()
                ensures
                    - #(*this)(a,b) == value
            !*/
            {
                const uint32 h = murmur_hash3_2(a,b)%(data.size()-scan_dist);

                const unsigned long empty_bucket = std::numeric_limits<unsigned long>::max();

                for (uint32 i = 0; i < scan_dist; ++i)
                {
                    if (data[i+h].key1 == empty_bucket)
                    {
                        data[i+h].key1 = a;
                        data[i+h].key2 = b;
                        data[i+h].value = value;
                        return;
                    }
                }

                // if we get this far it means the hash table is filling up.  So double its size.
                std::vector<bucket> new_data;
                new_data.resize(data.size()*2);
                new_data.swap(data);
                for (uint32 i = 0; i < new_data.size(); ++i)
                {
                    if (new_data[i].key1 != empty_bucket)
                    {
                        insert(new_data[i].key1, new_data[i].key2, new_data[i].value);
                    }
                }

                insert(a,b,value);
            }

            unsigned long operator() (
                const unsigned long a,
                const unsigned long b
            ) const
            /*!
                requires
                    - this->insert(a,b,some_value) has been called
                ensures
                    - returns the value stored at key (a,b)
            !*/
            {
                DLIB_ASSERT(a != b, "An invalid map_problem was given to find_max_factor_graph_nmplp()."
                            << "\nNode " << a << " is listed as being a neighbor with itself, which is illegal.");

                uint32 h = murmur_hash3_2(a,b)%(data.size()-scan_dist);


                for (unsigned long i = 0; i < scan_dist; ++i)
                {
                    if (data[h].key1 == a && data[h].key2 == b)
                    {
                        return data[h].value;
                    }
                    ++h;
                }
                

                // this should never happen (since this function requires (a,b) to be in the hash table
                DLIB_ASSERT(false, "An invalid map_problem was given to find_max_factor_graph_nmplp()."
                            << "\nThe nodes in the map_problem are inconsistent because node "<<a<<" is in the neighbor list"
                            << "\nof node "<<b<< " but node "<<b<<" isn't in the neighbor list of node "<<a<<".  The neighbor relationship"
                            << "\nis supposed to be symmetric."
                            );
                return 0;
            }

        private:

            struct bucket
            {
                // having max() in key1 indicates that the bucket isn't used.
                bucket() : key1(std::numeric_limits<unsigned long>::max()) {}
                unsigned long key1;
                unsigned long key2;
                unsigned long value;
            };

            std::vector<bucket> data;
            const unsigned int scan_dist;
        };
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_problem
        >
    void find_max_factor_graph_nmplp (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment,
        unsigned long max_iter,
        double eps
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( eps > 0,
                     "\t void find_max_factor_graph_nmplp()"
                     << "\n\t eps must be greater than zero"
                     << "\n\t eps:  " << eps 
                );

        /*
            This function is an implementation of the NMPLP algorithm introduced in the 
            following papers:
                Fixing Max-Product: Convergent Message Passing Algorithms for MAP LP-Relaxations (2008)
                by Amir Globerson and Tommi Jaakkola

                Introduction to dual decomposition for inference (2011)
                by David Sontag, Amir Globerson, and Tommi Jaakkola 

            In particular, this function implements the star MPLP update equations shown as
            equation 1.20 from the paper Introduction to dual decomposition for inference
            (the method was called NMPLP in the first paper).  It should also be noted that
            the original description of the NMPLP in the first paper had an error in the
            equations and the second paper contains corrected equations, which is what this 
            function uses.
        */

        typedef typename map_problem::node_iterator node_iterator;
        typedef typename map_problem::neighbor_iterator neighbor_iterator;

        map_assignment.resize(prob.number_of_nodes());


        if (prob.number_of_nodes() == 0)
            return;


        std::vector<double> delta_elements;
        delta_elements.reserve(prob.number_of_nodes()*prob.num_states(prob.begin())*3);

        impl::simple_hash_map delta_idx;



        // Initialize delta to zero and fill up the hash table with the appropriate values
        // so we can index into delta later on.
        for (node_iterator i = prob.begin(); i != prob.end(); ++i)
        {
            const unsigned long id_i = prob.node_id(i);

            for (neighbor_iterator j = prob.begin(i); j != prob.end(i); ++j)
            {
                const unsigned long id_j = prob.node_id(j);
                delta_idx.insert(id_i, id_j, delta_elements.size());

                const unsigned long num_states_xj = prob.num_states(j);
                for (unsigned long xj = 0; xj < num_states_xj; ++xj)
                    delta_elements.push_back(0);
            }
        }


        std::vector<double> gamma_i;
        std::vector<std::vector<double> > gamma_ji;
        std::vector<std::vector<double> > delta_to_j_no_i;
        // These arrays will end up with a length equal to the maximum number of neighbors
        // of any node in the graph.  So reserve a bigish number of slots so that we are
        // very unlikely to need to preform an expensive reallocation during the
        // optimization.
        gamma_ji.reserve(10000);
        delta_to_j_no_i.reserve(10000);


        double max_change = eps + 1; 
        // Now do the main body of the optimization. 
        unsigned long iter;
        for (iter = 0; iter < max_iter && max_change > eps; ++iter)
        {
            max_change = -std::numeric_limits<double>::infinity();

            for (node_iterator i = prob.begin(); i != prob.end(); ++i)
            {
                const unsigned long id_i = prob.node_id(i);
                const unsigned long num_states_xi = prob.num_states(i);
                gamma_i.assign(num_states_xi, 0);

                double num_neighbors = 0;

                unsigned int jcnt = 0;
                // first we fill in the gamma vectors
                for (neighbor_iterator j = prob.begin(i); j != prob.end(i); ++j)
                {
                    // Make sure these arrays are big enough to hold all the neighbor
                    // information.
                    if (jcnt >= gamma_ji.size())
                    {
                        gamma_ji.resize(gamma_ji.size()+1);
                        delta_to_j_no_i.resize(delta_to_j_no_i.size()+1);
                    }

                    ++num_neighbors;
                    const unsigned long id_j = prob.node_id(j);
                    const unsigned long num_states_xj = prob.num_states(j);

                    gamma_ji[jcnt].assign(num_states_xi, -std::numeric_limits<double>::infinity());
                    delta_to_j_no_i[jcnt].assign(num_states_xj, 0);

                    // compute delta_j^{-i} and store it in delta_to_j_no_i[jcnt]  
                    for (neighbor_iterator k = prob.begin(j); k != prob.end(j); ++k)
                    {
                        const unsigned long id_k = prob.node_id(k);
                        if (id_k==id_i)
                            continue;
                        const double* const delta_kj = &delta_elements[delta_idx(id_k,id_j)];
                        for (unsigned long xj = 0; xj < num_states_xj; ++xj)
                        {
                            delta_to_j_no_i[jcnt][xj] += delta_kj[xj];
                        }
                    }

                    // now compute gamma values
                    for (unsigned long xi = 0; xi < num_states_xi; ++xi)
                    {
                        for (unsigned long xj = 0; xj < num_states_xj; ++xj)
                        {
                            gamma_ji[jcnt][xi] = std::max(gamma_ji[jcnt][xi], prob.factor_value(i,j,xi,xj) + delta_to_j_no_i[jcnt][xj]);
                        }
                        gamma_i[xi] += gamma_ji[jcnt][xi];
                    }
                    ++jcnt;
                }

                // now update the delta values
                jcnt = 0;
                for (neighbor_iterator j = prob.begin(i); j != prob.end(i); ++j)
                {
                    const unsigned long id_j = prob.node_id(j);
                    const unsigned long num_states_xj = prob.num_states(j);

                    // messages from j to i
                    double* const delta_ji = &delta_elements[delta_idx(id_j,id_i)];

                    // messages from i to j
                    double* const delta_ij = &delta_elements[delta_idx(id_i,id_j)];

                    for (unsigned long xj = 0; xj < num_states_xj; ++xj)
                    {
                        double best_val = -std::numeric_limits<double>::infinity();

                        for (unsigned long xi = 0; xi < num_states_xi; ++xi)
                        {
                            double val = prob.factor_value(i,j,xi,xj) + 2/(num_neighbors+1)*gamma_i[xi] -gamma_ji[jcnt][xi];
                            if (val > best_val)
                                best_val = val;
                        }
                        best_val = -0.5*delta_to_j_no_i[jcnt][xj] + 0.5*best_val;

                        if (std::abs(delta_ij[xj] - best_val) > max_change)
                            max_change = std::abs(delta_ij[xj] - best_val);

                        delta_ij[xj] = best_val;
                    }

                    for (unsigned long xi = 0; xi < num_states_xi; ++xi)
                    {
                        double new_val = -1/(num_neighbors+1)*gamma_i[xi] + gamma_ji[jcnt][xi];
                        if (std::abs(delta_ji[xi] - new_val) > max_change)
                            max_change = std::abs(delta_ji[xi] - new_val);
                        delta_ji[xi] = new_val;
                    }
                    ++jcnt;
                }
            }
        }


        // now decode the "beliefs"
        std::vector<double> b;
        for (node_iterator i = prob.begin(); i != prob.end(); ++i)
        {
            const unsigned long id_i = prob.node_id(i);
            b.assign(prob.num_states(i), 0);

            for (neighbor_iterator k = prob.begin(i); k != prob.end(i); ++k)
            {
                const unsigned long id_k = prob.node_id(k);

                for (unsigned long xi = 0; xi < b.size(); ++xi)
                {
                    const double* const delta_ki = &delta_elements[delta_idx(id_k,id_i)];
                    b[xi] += delta_ki[xi];
                }
            }

            map_assignment[id_i] = index_of_max(mat(b));
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_Hh_

