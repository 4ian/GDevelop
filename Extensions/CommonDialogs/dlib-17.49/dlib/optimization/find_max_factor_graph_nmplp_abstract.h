// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_ABSTRACT_H__
#ifdef DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_ABSTRACT_H__

#include <vector>


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class map_problem 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a factor graph or graphical model.  In 
                particular, this object defines the interface a MAP problem on
                a factor graph must implement if it is to be solved using the 
                find_max_factor_graph_nmplp() routine defined at the bottom of this file.  

                Note that there is no dlib::map_problem object.  What you are
                looking at here is simply the interface definition for a map problem.
                You must implement your own version of this object for the problem
                you wish to solve and then pass it to the find_max_factor_graph_nmplp() routine.


                Note also that a factor graph should not have any nodes which are 
                neighbors with themselves.  Additionally, the graph is undirected. This
                mean that if A is a neighbor of B then B must be a neighbor of A for
                the map problem to be valid.


                Finally, note that the "neighbor" relationship between nodes means the
                following:  Two nodes are neighbors if and only if there is a potential 
                function (implemented by the factor_value() method) which operates on 
                the nodes.
        !*/

    public:

        class node_iterator
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is a simple forward iterator for iterating over 
                    the nodes/variables in this factor graph.  

                    Note that you can't dereference the iterator and
                    obtain a value.  That is, the iterator is opaque to 
                    the user.  It is used only as an argument to the other 
                    methods defined in this interface.
            !*/

        public:
            node_iterator(
            );
            /*!
                ensures
                    - constructs an iterator in an undefined state
            !*/

            node_iterator(
                const node_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
            !*/

            node_iterator& operator= (
                const node_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
                    - returns #*this
            !*/

            bool operator== (
                const node_iterator& item
            ) const; 
            /*!
                ensures
                    - returns true if *this and item both reference
                      the same node in the factor graph and false 
                      otherwise.
            !*/

            bool operator!= (
                const node_iterator& item
            ) const;
            /*!
                ensures
                    - returns false if *this and item both reference
                      the same node in the factor graph and true 
                      otherwise.
            !*/

            node_iterator& operator++(
            );
            /*!
                ensures
                    - advances *this to the next node in the factor graph.
                    - returns a reference to the updated *this
                      (i.e. this is the ++object form of the increment operator)
            !*/
        };

        class neighbor_iterator
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is a simple forward iterator for iterating over 
                    the nodes/variables in this factor graph.  This version
                    of the iterator is used for iterating over the neighbors
                    of another node in the graph.
            !*/

        public:
            neighbor_iterator(
            ); 
            /*!
                ensures
                    - constructs an iterator in an undefined state
            !*/

            neighbor_iterator(
                const neighbor_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
            !*/

            neighbor_iterator& operator= (
                const neighbor_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
                    - returns #*this
            !*/

            bool operator== (
                const neighbor_iterator& item
            ) const; 
            /*!
                ensures
                    - returns true if *this and item both reference
                      the same node in the factor graph and false 
                      otherwise.
            !*/

            bool operator!= (
                const neighbor_iterator& item
            ) const;
            /*!
                ensures
                    - returns false if *this and item both reference
                      the same node in the factor graph and true 
                      otherwise.
            !*/

            neighbor_iterator& operator++(
            ); 
            /*!
                ensures
                    - advances *this to the next node in the factor graph.
                    - returns a reference to the updated *this
                      (i.e. this is the ++object form of the increment operator) 
            !*/
        };

        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the factor graph.  Or in other words, 
                  returns the number of variables in the MAP problem.
        !*/

        node_iterator begin(
        ) const;
        /*!
            ensures
                - returns an iterator to the first node in the graph.  If no such
                  node exists then returns end().
        !*/

        node_iterator end(
        ) const;
        /*!
            ensures
                - returns an iterator to one past the last node in the graph.
        !*/

        neighbor_iterator begin(
            const node_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [begin(), end()))
            ensures
                - returns an iterator to the first neighboring node of the node
                  referenced by it.  If no such node exists then returns end(it).
        !*/

        neighbor_iterator begin(
            const neighbor_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator. (i.e. it must be in the range 
                  [begin(i), end(i)) where i is some valid iterator. ) 
            ensures
                - returns an iterator to the first neighboring node of the node
                  referenced by it.  If no such node exists then returns end(it).
        !*/

        neighbor_iterator end(
            const node_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [begin(), end()))
            ensures
                - returns an iterator to one past the last neighboring node of the node
                  referenced by it.
        !*/

        neighbor_iterator end(
            const neighbor_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator. (i.e. it must be in the range 
                  [begin(i), end(i)) where i is some valid iterator. ) 
            ensures
                - returns an iterator to one past the last neighboring node of the node
                  referenced by it.
        !*/

        unsigned long node_id (
            const node_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [begin(), end()))
            ensures
                - returns a number ID such that:
                    - 0 <= ID < number_of_nodes()
                    - ID == a number which uniquely identifies the node pointed to by it.
        !*/

        unsigned long node_id (
            const neighbor_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator. (i.e. it must be in the range 
                  [begin(i), end(i)) where i is some valid iterator. ) 
            ensures
                - returns a number ID such that:
                    - 0 <= ID < number_of_nodes()
                    - ID == a number which uniquely identifies the node pointed to by it.
        !*/

        unsigned long num_states (
            const node_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [begin(), end()))
            ensures
                - returns the number of states attainable by the node/variable referenced by it.
        !*/

        unsigned long num_states (
            const neighbor_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator. (i.e. it must be in the range 
                  [begin(i), end(i)) where i is some valid iterator. ) 
            ensures
                - returns the number of states attainable by the node/variable referenced by it.
        !*/

        // The next four functions all have the same contract.
        double factor_value (const node_iterator& it1,     const node_iterator& it2,     unsigned long s1, unsigned long s2) const;
        double factor_value (const neighbor_iterator& it1, const node_iterator& it2,     unsigned long s1, unsigned long s2) const;
        double factor_value (const node_iterator& it1,     const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const;
        double factor_value (const neighbor_iterator& it1, const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const;
        /*!
            requires
                - it1 == a valid iterator
                - it2 == a valid iterator
                - 0 <= s1 < num_states(it1)
                - 0 <= s2 < num_states(it2)
                - it1 and it2 reference nodes which are neighbors in the factor graph
            ensures
                - returns the value of the factor/potential function for the given pair of 
                  nodes, defined by it1 and it2, for the case where they take on the values
                  s1 and s2 respectively.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename map_problem
        >
    void find_max_factor_graph_nmplp (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment,
        unsigned long max_iter,
        double eps
    );
    /*!
        requires
            - for all valid i: prob.num_states(i) >= 2
            - map_problem == an object with an interface compatible with the map_problem
              object defined at the top of this file.
            - eps > 0
        ensures
            - This function is a tool for approximately solving the given MAP problem in a graphical 
              model or factor graph with pairwise potential functions.  That is, it attempts 
              to solve a certain kind of optimization problem which can be defined as follows:
                 maximize: f(X)
                 where X is a set of integer valued variables and f(X) can be written as the 
                 sum of functions which each involve only two variables from X.  In reference 
                 to the prob object, the nodes in prob represent the variables in X and the 
                 functions which are summed are represented by prob.factor_value().
            - #map_assignment == the result of the optimization.   
            - #map_assignment.size() == prob.number_of_nodes()
            - for all valid i:
                - #map_assignment[prob.node_id(i)] < prob.num_states(i)
                - #map_assignment[prob.node_id(i)] == The approximate MAP assignment for node/variable i.
            - eps controls the stopping condition, smaller values of eps lead to more accurate 
              solutions of the relaxed linear program but may take more iterations.  Note that
              the algorithm will never execute more than max_iter iterations regardless of
              the setting of eps.
            - If the graph is tree-structured then this routine always gives the exact solution 
              to the MAP problem.  However, for graphs with cycles, the solution may be approximate.
              

            - This function is an implementation of the NMPLP algorithm introduced in the 
              following paper:
                Fixing Max-Product: Convergent Message Passing Algorithms for MAP LP-Relaxations 
                by Amir Globerson and Tommi Jaakkola
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_nMPLP_H__


