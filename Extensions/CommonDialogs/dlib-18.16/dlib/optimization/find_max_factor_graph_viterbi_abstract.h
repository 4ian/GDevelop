// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_ABSTRACT_Hh_
#ifdef DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class map_problem 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a chain-structured factor graph or graphical 
                model.  In particular, this object defines the interface a MAP problem 
                on a factor graph must implement if it is to be solved using the 
                find_max_factor_graph_viterbi() routine defined at the bottom of this file.  

                Note that there is no dlib::map_problem object.  What you are looking 
                at here is simply the interface definition for a map problem.  You must 
                implement your own version of this object for the problem you wish to 
                solve and then pass it to the find_max_factor_graph_viterbi() routine.
        !*/

    public:

        unsigned long order (
        ) const;
        /*!
            ensures
                - returns the order of this model.  The order has the following interpretation:
                  This model can represent a high order Markov chain.  If order()==1 then map_problem
                  represents a basic chain-structured graph where nodes only depend on their immediate
                  neighbors.  However, high order Markov models can also be used by setting order() > 1.
        !*/

        unsigned long num_states (
        ) const;
        /*!
            ensures
                - returns the number of states attainable by each variable/node in the graph.
        !*/

        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the factor graph.  Or in other words, 
                  returns the number of variables in the MAP problem.
        !*/

        template <
            typename EXP 
            >
        double factor_value (
            unsigned long node_id,
            const matrix_exp<EXP>& node_states
        ) const;
        /*!
            requires
                - EXP::type == unsigned long
                  (i.e. node_states contains unsigned longs)
                - node_id < number_of_nodes()
                - node_states.size() == min(node_id, order()) + 1
                - is_vector(node_states) == true
                - max(node_states) < num_states()
            ensures
                - In a chain-structured graph, each node has a potential function associated with
                  it.  The potential function operates on the variable given by the node as well
                  as the order() previous variables.  Therefore, factor_value() returns the value 
                  of the factor/potential function associated with node node_id where the following 
                  nodes take on the values defined below:
                    - node_states(0) == the value of the node with ID node_id
                    - node_states(i) == the value of the node with ID node_id-i
                - It is ok for this function to return a value of -std::numeric_limits<double>::infinity().
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename map_problem
        >
    void find_max_factor_graph_viterbi (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment
    );
    /*!
        requires
            - prob.num_states() > 0
            - std::pow(prob.num_states(), prob.order()) < std::numeric_limits<unsigned long>::max()
              (i.e. The Viterbi algorithm is exponential in the order of the map problem.  So don't 
              make order too large.)
            - map_problem == an object with an interface compatible with the map_problem
              object defined at the top of this file.
        ensures
            - This function is a tool for exactly solving the MAP problem in a chain-structured 
              graphical model or factor graph.  That is, it attempts to solve a certain kind of 
              optimization problem which can be defined as follows:
                - Let X denote a set of prob.number_of_nodes() integer valued variables, each taking
                  a value in the range [0, prob.num_states()).
                - Let X(i) = the ith variable in X.
                - Let F(i) = factor_value_i(X(i), X(i-1), ..., X(i-prob.order()))
                  (This is the value returned by prob.factor_value(i, node_states).  Note that
                  each factor's value function operates on at most prob.order()+1 variables.
                  Moreover, the variables are adjacent and hence the graph is "chain-structured".)

                 Then this function finds the assignments to the X variables which  
                 maximizes: sum over all valid i: F(i)

            - #map_assignment == the result of the optimization.   
            - #map_assignment.size() == prob.number_of_nodes()
            - for all valid i:
                - #map_assignment[i] < prob.num_states()
                - #map_assignment[i] == The MAP assignment for node/variable i.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_VITERBi_ABSTRACT_Hh_



