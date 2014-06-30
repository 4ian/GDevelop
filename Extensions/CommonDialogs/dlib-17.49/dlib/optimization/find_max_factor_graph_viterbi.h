// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_H__
#define DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_H__

#include "find_max_factor_graph_viterbi_abstract.h"
#include <vector>
#include "../matrix.h"
#include "../array2d.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        struct viterbi_data
        {
            viterbi_data() :val(-std::numeric_limits<double>::infinity()), back_index(0) {}
            double val;
            unsigned long back_index;
        };

        template <long NC>
        inline bool advance_state(
            matrix<unsigned long,1,NC>& node_states,
            unsigned long num_states
        )
        /*!
            ensures
                - advances node_states to the next state by adding 1
                  to node_states(node_states.size()-1) and carrying any 
                  rollover (modulo num_states).  Stores the result into #node_states.
                - if (#node_states is all zeros) then
                    - returns false
                - else
                    - returns true
        !*/
        {
            for (long i = node_states.size()-1; i >= 0; --i)
            {
                node_states(i) += 1;
                if (node_states(i) < num_states)
                    return true;

                node_states(i) = 0;
            }
            return false;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_problem
        >
    void find_max_factor_graph_viterbi (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment
    )
    {
        using namespace dlib::impl;
        const unsigned long order = prob.order();
        const unsigned long num_states = prob.num_states();


        DLIB_ASSERT(prob.num_states() > 0,
            "\t void find_max_factor_graph_viterbi()"
            << "\n\t The nodes in a factor graph have to be able to take on more than 0 states."
            );
        DLIB_ASSERT(std::pow(num_states,(double)order) < std::numeric_limits<unsigned long>::max(),
            "\t void find_max_factor_graph_viterbi()"
            << "\n\t The order is way too large for this algorithm to handle."
            << "\n\t order:      " << order
            << "\n\t num_states: " << num_states 
            << "\n\t std::pow(num_states,order):                " << std::pow(num_states,(double)order) 
            << "\n\t std::numeric_limits<unsigned long>::max(): " << std::numeric_limits<unsigned long>::max() 
            );

        if (prob.number_of_nodes() == 0)
        {
            map_assignment.clear();
            return;
        }

        if (order == 0)
        {
            map_assignment.resize(prob.number_of_nodes());
            for (unsigned long i = 0; i < map_assignment.size(); ++i)
            {
                matrix<unsigned long,1,1> node_state;
                unsigned long best_state = 0;
                double best_val = -std::numeric_limits<double>::infinity();
                for (unsigned long s = 0; s < num_states; ++s)
                {
                    node_state(0) = s;
                    const double temp = prob.factor_value(i,node_state);
                    if (temp > best_val)
                    {
                        best_val = temp;
                        best_state = s;
                    }
                }
                map_assignment[i] = best_state;
            }
            return;
        }


        const unsigned long trellis_size = static_cast<unsigned long>(std::pow(num_states,(double)order)); 
        unsigned long init_ring_size = 1; 

        array2d<impl::viterbi_data> trellis;
        trellis.set_size(prob.number_of_nodes(), trellis_size);


        for (unsigned long node = 0; node < prob.number_of_nodes(); ++node)
        {

            if (node < order)
            {
                matrix<unsigned long,1,0> node_states;
                node_states.set_size(std::min<int>(node, order) + 1);
                node_states = 0;

                unsigned long idx = 0;
                if (node == 0)
                {
                    do 
                    {
                        trellis[node][idx].val = prob.factor_value(node,node_states);
                        ++idx;
                    } while(advance_state(node_states,num_states));
                }
                else
                {
                    init_ring_size *= num_states;
                    do 
                    {
                        const unsigned long back_index = idx%init_ring_size;
                        trellis[node][idx].val = prob.factor_value(node,node_states) + trellis[node-1][back_index].val;
                        trellis[node][idx].back_index = back_index;
                        ++idx;
                    } while(advance_state(node_states,num_states));

                }
            }
            else if (order == 1)
            {
                /*
                    WHAT'S THE DEAL WITH THIS PREPROCESSOR MACRO?
                        Well, if we can declare the dimensions of node_states as a compile
                        time constant then this function runs significantly faster.  So this macro
                        is here to let us do that.  It just lets us avoid replicating this code
                        block in the following if statements for different order sizes.
                */
#define DLIB_FMFGV_WORK                                                                                                     \
                node_states = 0;                                                                                            \
                unsigned long count = 0;                                                                                    \
                for (unsigned long i = 0; i < trellis_size; ++i)                                                            \
                {                                                                                                           \
                    unsigned long back_index = 0;                                                                           \
                    double best_score = -std::numeric_limits<double>::infinity();                                           \
                    for (unsigned long s = 0; s < num_states; ++s)                                                          \
                    {                                                                                                       \
                        const double temp = prob.factor_value(node,node_states) + trellis[node-1][count%trellis_size].val;  \
                        if (temp > best_score)                                                                              \
                        {                                                                                                   \
                            best_score = temp;                                                                              \
                            back_index = count%trellis_size;                                                                \
                        }                                                                                                   \
                        advance_state(node_states,num_states);                                                              \
                        ++count;                                                                                            \
                    }                                                                                                       \
                    trellis[node][i].val = best_score;                                                                      \
                    trellis[node][i].back_index = back_index;                                                               \
                }

                matrix<unsigned long,1,2> node_states;
                DLIB_FMFGV_WORK
            }
            else if (order == 2)
            {
                matrix<unsigned long,1,3> node_states;
                DLIB_FMFGV_WORK
            }
            else if (order == 3)
            {
                matrix<unsigned long,1,4> node_states;
                DLIB_FMFGV_WORK
            }
            else 
            {
                // The general case, here we don't define the size of node_states at compile time.
                matrix<unsigned long,1,0> node_states(order+1);
                DLIB_FMFGV_WORK
            }
        }


        map_assignment.resize(prob.number_of_nodes());
        // Figure out which state of the last node has the biggest value. 
        unsigned long back_index = 0;
        double best_val = -std::numeric_limits<double>::infinity();
        for (long i = 0; i < trellis.nc(); ++i)
        {
            if (trellis[trellis.nr()-1][i].val > best_val)
            {
                best_val = trellis[trellis.nr()-1][i].val;
                back_index = i;
            }
        }
        // Follow the back links to find the decoding.
        for (long node = map_assignment.size()-1; node >= 0; --node)
        {
            map_assignment[node] = back_index/init_ring_size;
            back_index = trellis[node][back_index].back_index;
            if (node < (long)order)
                init_ring_size /= num_states;
        }

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_H__


