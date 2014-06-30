// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BAYES_UTILs_ABSTRACT_
#ifdef DLIB_BAYES_UTILs_ABSTRACT_

#include "../algs.h"
#include "../noncopyable.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/map_pair.h"
#include "../serialize.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class assignment : public enumerable<map_pair<unsigned long, unsigned long> >
    {
        /*!
            INITIAL VALUE
                - size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the entries in the assignment in 
                ascending order according to index values.  (i.e. the elements are 
                enumerated in sorted order according to the value of their keys)

            WHAT THIS OBJECT REPRESENTS
                This object models an assignment of random variables to particular values.
                It is used with the joint_probability_table and conditional_probability_table
                objects to represent assignments of various random variables to actual values.

                So for example, if you had a joint_probability_table that represented the
                following table:
                    P(A = 0, B = 0) = 0.2
                    P(A = 0, B = 1) = 0.3
                    P(A = 1, B = 0) = 0.1
                    P(A = 1, B = 1) = 0.4

                    Also lets define an enum so we have concrete index numbers for A and B
                    enum { A = 0, B = 1};

                Then you could query the value of P(A=1, B=0) as follows:
                    assignment a;
                    a.set(A, 1);
                    a.set(B, 0);
                    // and now it is the case that:
                    table.probability(a) == 0.1 
                    a[A] == 1
                    a[B] == 0


                Also note that when enumerating the elements of an assignment object
                the key() refers to the index and the value() refers to the value at that
                index. For example: 

                // assume a is an assignment object
                a.reset();
                while (a.move_next())
                {
                    // in this loop it is always the case that:
                    // a[a.element().key()] == a.element().value()
                }
        !*/

    public:

        assignment(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        assignment(
            const assignment& a
        );
        /*!
            ensures
                - #*this is a copy of a
        !*/

        assignment& operator = (
            const assignment& rhs
        );
        /*!
            ensures
                - #*this is a copy of rhs
                - returns *this
        !*/

        void clear(
        );
        /*!
            ensures
                - this object has been returned to its initial value
        !*/

        bool operator < (
            const assignment& item
        ) const;
        /*!
            ensures
                - The exact functioning of this operator is undefined.  The only guarantee
                  is that it establishes a total ordering on all possible assignment objects.
                  In other words, this operator makes it so that you can use assignment
                  objects in the associative containers but otherwise isn't of any 
                  particular use.
        !*/

        bool has_index (
            unsigned long idx
        ) const;
        /*!
            ensures
                - if (this assignment object has an entry for index idx) then
                    - returns true
                - else
                    - returns false
        !*/

        void add (
            unsigned long idx,
            unsigned long value = 0
        );
        /*!
            requires
                - has_index(idx) == false
            ensures
                - #has_index(idx) == true 
                - #(*this)[idx] == value 
        !*/

        void remove (
            unsigned long idx
        );
        /*!
            requires
                - has_index(idx) == true 
            ensures
                - #has_index(idx) == false 
        !*/

        unsigned long& operator[] (
            const long idx
        );
        /*!
            requires
                - has_index(idx) == true
            ensures
                - returns a reference to the value associated with index idx
        !*/

        const unsigned long& operator[] (
            const long idx
        ) const;
        /*!
            requires
                - has_index(idx) == true
            ensures
                - returns a const reference to the value associated with index idx
        !*/

        void swap (
            assignment& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

    inline void swap (
        assignment& a,
        assignment& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

    std::ostream& operator << (
        std::ostream& out,
        const assignment& a
    );
    /*!
        ensures
            - writes a to the given output stream in the following format:
              (index1:value1, index2:value2, ..., indexN:valueN)
    !*/

    void serialize (
        const assignment& item,
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        assignment& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ------------------------------------------------------------------------

    class joint_probability_table : public enumerable<map_pair<assignment, double> >
    {
        /*!
            INITIAL VALUE
                - size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the entries in the probability table 
                in no particular order but they will all be visited.

            WHAT THIS OBJECT REPRESENTS
                This object models a joint probability table.  That is, it models
                the function p(X).  So this object models the probability of a particular
                set of variables (referred to as X).
        !*/

    public:

        joint_probability_table(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        joint_probability_table (
            const joint_probability_table& t
        );
        /*!
            ensures
                - this object is a copy of t
        !*/

        void clear(
        );
        /*!
            ensures
                - this object has its initial value
        !*/

        joint_probability_table& operator= (
            const joint_probability_table& rhs
        );
        /*!
            ensures
                - this object is a copy of rhs
                - returns a reference to *this
        !*/

        bool has_entry_for (
            const assignment& a
        ) const;
        /*!
            ensures
                - if (this joint_probability_table has an entry for p(X = a)) then
                    - returns true
                - else
                    - returns false
        !*/

        void set_probability (
            const assignment& a,
            double p
        );
        /*!
            requires
                - 0 <= p <= 1
            ensures
                - if (has_entry_for(a) == false) then
                    - #size() == size() + 1
                - #probability(a) == p
                - #has_entry_for(a) == true
        !*/

        void add_probability (
            const assignment& a,
            double p
        );
        /*!
            requires
                - 0 <= p <= 1
            ensures
                - if (has_entry_for(a) == false) then
                    - #size() == size() + 1
                    - #probability(a) == p
                - else
                    - #probability(a) == min(probability(a) + p, 1.0)
                      (i.e. does a saturating add)
                - #has_entry_for(a) == true
        !*/

        const double probability (
            const assignment& a
        ) const;
        /*!
            ensures
                - returns the probability p(X == a)
        !*/

        template <
            typename T
            >
        void marginalize (
            const T& vars,
            joint_probability_table& output_table
        ) const;
        /*!
            requires
                - T is an implementation of set/set_kernel_abstract.h
            ensures
                - marginalizes *this by summing over all variables not in vars.  The
                  result is stored in output_table.  
        !*/

        void marginalize (
            const unsigned long var,
            joint_probability_table& output_table
        ) const;
        /*!
            ensures
                - is identical to calling the above marginalize() function with a set
                  that contains only var.  Or in other words, performs a marginalization
                  with just one variable var.  So that output_table will contain a table giving
                  the marginal probability of var all by itself.
        !*/

        void normalize (
        );
        /*!
            ensures
                - let sum == the sum of all the probabilities in this table
                - after normalize() has finished it will be the case that the sum of all
                  the entries in this table is 1.0.  This is accomplished by dividing all
                  the entries by the sum described above.
        !*/

        void swap (
            joint_probability_table& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

    inline void swap (
        joint_probability_table& a,
        joint_probability_table& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

    void serialize (
        const joint_probability_table& item,
        std::ostream& out 
    );   
    /*!
        provides deserialization support 
    !*/

    void deserialize (
        joint_probability_table& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

    class conditional_probability_table : noncopyable
    {
        /*!
            INITIAL VALUE
                - num_values() == 0
                - has_value_for(x, y) == false for all values of x and y

            WHAT THIS OBJECT REPRESENTS
                This object models a conditional probability table.  That is, it models
                the function p( X | parents).  So this object models the conditional 
                probability of a particular variable (referred to as X) given another set 
                of variables (referred to as parents).  
        !*/

    public:

        conditional_probability_table(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void clear(
        );
        /*!
            ensures
                - this object has its initial value
        !*/

        void empty_table (
        );
        /*!
            ensures
                - for all possible v and p:
                    - #has_entry_for(v,p) == false
                  (i.e. this function clears out the table when you call it but doesn't 
                  change the value of num_values())
        !*/

        void set_num_values (
            unsigned long num
        );
        /*!
            ensures
                - #num_values() == num
                - for all possible v and p:
                    - #has_entry_for(v,p) == false
                  (i.e. this function clears out the table when you call it)
        !*/

        unsigned long num_values (
        ) const; 
        /*!
            ensures
                - This object models the probability table p(X | parents).  This
                  function returns the number of values X can take on.
        !*/

        bool has_entry_for (
            unsigned long value,
            const assignment& ps
        ) const;
        /*!
            ensures
                - if (this conditional_probability_table has an entry for p(X = value, parents = ps)) then
                    - returns true
                - else
                    - returns false
        !*/

        void set_probability (
            unsigned long value,
            const assignment& ps,
            double p
        );
        /*!
            requires
                - value < num_values()
                - 0 <= p <= 1
            ensures
                - #probability(ps, value) == p
                - #has_entry_for(value, ps) == true
        !*/

        double probability(
            unsigned long value,
            const assignment& ps
        ) const;
        /*!
            requires
                - value < num_values()
                - has_entry_for(value, ps) == true
            ensures
                - returns the probability p( X = value | parents = ps). 
        !*/

        void swap (
            conditional_probability_table& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    };

    inline void swap (
        conditional_probability_table& a,
        conditional_probability_table& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

    void serialize (
        const conditional_probability_table& item,
        std::ostream& out 
    );   
    /*!
        provides deserialization support 
    !*/

    void deserialize (
        conditional_probability_table& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------

    class bayes_node : noncopyable
    {
        /*!
            INITIAL VALUE
                - is_evidence() == false
                - value() == 0
                - table().num_values() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a node in a bayesian network.  It is
                intended to be used inside the dlib::directed_graph object to
                represent bayesian networks.
        !*/

    public:
        bayes_node (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        unsigned long value (
        ) const;
        /*!
            ensures
                - returns the current value of this node
        !*/

        void set_value (
            unsigned long new_value
        );
        /*!
            requires
                - new_value < table().num_values()
            ensures
                - #value() == new_value
        !*/

        conditional_probability_table& table (
        );
        /*!
            ensures
                - returns a reference to the conditional_probability_table associated with this node
        !*/

        const conditional_probability_table& table (
        ) const;
        /*!
            ensures
                - returns a const reference to the conditional_probability_table associated with this 
                  node.
        !*/

        bool is_evidence (
        ) const;
        /*!
            ensures
                - if (this is an evidence node) then
                    - returns true
                - else
                    - returns false
        !*/

        void set_as_nonevidence (
        );
        /*!
            ensures
                - #is_evidence() == false
        !*/

        void set_as_evidence (
        );
        /*!
            ensures
                - #is_evidence() == true 
        !*/

        void swap (
            bayes_node& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

    inline void swap (
        bayes_node& a,
        bayes_node& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

    void serialize (
        const bayes_node& item,
        std::ostream& out 
    );   
    /*!
        provides deserialization support 
    !*/

    void deserialize (
        bayes_node& item,
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    /*
        The following group of functions are convenience functions for manipulating 
        bayes_node objects while they are inside a directed_graph.   These functions
        also have additional requires clauses that, in debug mode, will protect you
        from attempts to manipulate a bayesian network in an inappropriate way.
    */

    namespace bayes_node_utils
    {

        template <
            typename T
            >
        void set_node_value (
            T& bn,
            unsigned long n,
            unsigned long val
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
                - val < node_num_values(bn, n)
            ensures
                - #bn.node(n).data.value() = val
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        unsigned long node_value (
            const T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - returns bn.node(n).data.value()
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        bool node_is_evidence (
            const T& bn,
            unsigned long n
        ); 
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - returns bn.node(n).data.is_evidence()
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        void set_node_as_evidence (
            T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - executes: bn.node(n).data.set_as_evidence()
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        void set_node_as_nonevidence (
            T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - executes: bn.node(n).data.set_as_nonevidence()
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        void set_node_num_values (
            T& bn,
            unsigned long n,
            unsigned long num
        ); 
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - #bn.node(n).data.table().num_values() == num
                  (i.e. sets the number of different values this node can take)
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        unsigned long node_num_values (
            const T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - returns bn.node(n).data.table().num_values() 
                  (i.e. returns the number of different values this node can take)
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        const double node_probability (
            const T& bn,
            unsigned long n,
            unsigned long value,
            const assignment& parents 
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
                - value < node_num_values(bn,n)
                - parents.size() == bn.node(n).number_of_parents()
                - if (parents.has_index(x)) then
                    - bn.has_edge(x, n)
                    - parents[x] < node_num_values(bn,x)
            ensures
                - returns bn.node(n).data.table().probability(value, parents)
                  (i.e. returns the probability of node n having the given value when
                  its parents have the given assignment)
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        const double set_node_probability (
            const T& bn,
            unsigned long n,
            unsigned long value,
            const assignment& parents,
            double p
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
                - value < node_num_values(bn,n)
                - 0 <= p <= 1
                - parents.size() == bn.node(n).number_of_parents()
                - if (parents.has_index(x)) then
                    - bn.has_edge(x, n)
                    - parents[x] < node_num_values(bn,x)
            ensures
                - #bn.node(n).data.table().probability(value, parents) == p
                  (i.e. sets the probability of node n having the given value when
                  its parents have the given assignment to the probability p)
        !*/

    // ------------------------------------------------------------------------------------

        template <typename T>
        const assignment node_first_parent_assignment (
            const T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - returns an assignment A such that:
                    - A.size() == bn.node(n).number_of_parents()
                    - if (P is a parent of bn.node(n)) then
                        - A.has_index(P)
                        - A[P] == 0
                    - I.e. this function returns an assignment that contains all
                      the parents of the given node.  Also, all the values of each
                      parent in the assignment is set to zero.
        !*/

    // ------------------------------------------------------------------------------------

        template <typename T>
        bool node_next_parent_assignment (
            const T& bn,
            unsigned long n,
            assignment& A
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
                - A.size() == bn.node(n).number_of_parents()
                - if (A.has_index(x)) then
                    - bn.has_edge(x, n)
                    - A[x] < node_num_values(bn,x)
            ensures
                - The behavior of this function is defined by the following code:
                  assignment a(node_first_parent_assignment(bn,n);
                  do {
                    // this loop loops over all possible parent assignments
                    // of the node bn.node(n).  Each time through the loop variable a
                    // will be the next assignment.
                  } while (node_next_parent_assignment(bn,n,a))
        !*/

    // ------------------------------------------------------------------------------------

        template <typename T>
        bool node_cpt_filled_out (
            const T& bn,
            unsigned long n
        );
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
                - n < bn.number_of_nodes()
            ensures
                - if (the conditional_probability_table bn.node(n).data.table() is
                  fully filled out for this node) then
                    - returns true
                    - This means that each parent assignment for the given node
                      along with all possible values of this node shows up in the
                      table.
                    - It also means that all the probabilities conditioned on the
                      same parent assignment sum to 1.0
                - else
                    - returns false
        !*/

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class bayesian_network_gibbs_sampler : noncopyable
    {
        /*!
            INITIAL VALUE
                This object has no state

            WHAT THIS OBJECT REPRESENTS
                This object performs Markov Chain Monte Carlo sampling of a bayesian
                network using the Gibbs sampling technique. 

                Note that this object is limited to only bayesian networks that 
                don't contain deterministic nodes.  That is, incorrect results may
                be computed if this object is used when the bayesian network contains 
                any nodes that have a probability of 1 in their conditional probability
                tables for any event.  So don't use this object for networks with 
                deterministic nodes.
        !*/
    public:

        bayesian_network_gibbs_sampler (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <
            typename T
            >
        void sample_graph (
            T& bn
        )
        /*!
            requires
                - T is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - T::type == bayes_node
            ensures
                - modifies randomly (via the Gibbs sampling technique) samples all the nodes
                  in the network and updates their values with the newly sampled values
        !*/
    };

// ----------------------------------------------------------------------------------------

    class bayesian_network_join_tree : noncopyable
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents an implementation of the join tree algorithm
                for inference in bayesian networks.  It doesn't have any mutable state.
                To you use you just give it a directed_graph that contains a bayesian 
                network and a graph object that contains that networks corresponding
                join tree.  Then you may query this object to determine the probabilities
                of any variables in the original bayesian network.
        !*/

    public:

        template <
            typename bn_type,
            typename join_tree_type 
            >
        bayesian_network_join_tree (
            const bn_type& bn,
            const join_tree_type& join_tree
        );
        /*!
            requires
                - bn_type is an implementation of directed_graph/directed_graph_kernel_abstract.h
                - bn_type::type == bayes_node
                - join_tree_type is an implementation of graph/graph_kernel_abstract.h
                - join_tree_type::type is an implementation of set/set_compare_abstract.h and
                  this set type contains unsigned long objects. 
                - join_tree_type::edge_type is an implementation of set/set_compare_abstract.h and
                  this set type contains unsigned long objects. 
                - is_join_tree(bn, join_tree) == true
                - bn == a valid bayesian network with all its conditional probability tables
                  filled out
                - for all valid n:
                    - node_cpt_filled_out(bn,n) == true
                - graph_contains_length_one_cycle(bn) == false
                - graph_is_connected(bn) == true
                - bn.number_of_nodes() > 0
            ensures
                - this object is properly initialized
        !*/

        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the bayesian network that this
                  object was instantiated from.
        !*/

        const matrix<double,1> probability(
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns the probability distribution for the node with index idx that was in the bayesian 
                  network that *this was instantiated from.  Let D represent this distribution, then:
                    - D.nc() == the number of values the node idx ranges over
                    - D.nr() == 1 
                    - D(i) == the probability of node idx taking on the value i 
        !*/

        void swap (
            bayesian_network_join_tree& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

    };

    inline void swap (
        bayesian_network_join_tree& a,
        bayesian_network_join_tree& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BAYES_UTILs_ABSTRACT_


