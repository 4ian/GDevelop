// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MIN_CuT_ABSTRACT_H__
#ifdef DLIB_MIN_CuT_ABSTRACT_H__

#include "../graph_utils.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    /*!A node_label
        The node_label type is the type used to label which part of a graph cut
        a node is on.  It is used by all the graph cut tools.  The three possible
        values of a node label are SOURCE_CUT, SINK_CUT, or FREE_NODE.
    !*/

    typedef unsigned char node_label;
    const node_label SOURCE_CUT = 0;
    const node_label SINK_CUT = 254;
    const node_label FREE_NODE = 255;

// ----------------------------------------------------------------------------------------

    class flow_graph 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a flow capacity graph for use with the
                min_cut algorithm defined below.  In particular, this object
                is a kind of directed graph where the edge weights specify the
                flow capacities.

                Note that there is no dlib::flow_graph object.  What you are
                looking at here is simply the interface definition for a graph 
                which can be used with the min_cut algorithm.  You must implement 
                your own version of this object for the graph you wish to work with 
                and then pass it to the min_cut::operator() routine.

                It's also worth pointing out that this graph has symmetric edge 
                connections.  That is, if there is an edge from node A to node B
                then there must also be an edge from node B to node A.
        !*/

    public:

        class out_edge_iterator
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is a simple forward iterator for iterating over the neighbors
                    of a node in the graph.  It also represents the fact that the neighbors 
                    are on the end of an outgoing edge.  That is, the edge represents
                    the amount of flow which can flow towards the neighbor.
            !*/

        public:
            out_edge_iterator(
            );
            /*!
                ensures
                    - constructs an iterator in an undefined state.  It can't
                      be used until assigned with a valid iterator.
            !*/

            out_edge_iterator(
                const out_edge_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
            !*/

            out_edge_iterator& operator=(
                const out_edge_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
                    - returns #*this
            !*/

            bool operator!= (
                const out_edge_iterator& item
            ) const;
            /*!
                requires
                    - *this and item are iterators over the neighbors for the
                      same node.  
                ensures
                    - returns false if *this and item both reference the same
                      node in the graph and true otherwise.
            !*/

            out_edge_iterator& operator++(
            );
            /*!
                ensures
                    - advances *this to the next neighbor node.
                    - returns a reference to the updated *this
                      (i.e. this is the ++object form of the increment operator) 
            !*/
        };

        class in_edge_iterator
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is a simple forward iterator for iterating over the neighbors
                    of a node in the graph.  It also represents the fact that the neighbors 
                    are on the end of an incoming edge.  That is, the edge represents
                    the amount of flow which can flow out of the neighbor node.
            !*/

        public:

            in_edge_iterator(
            );
            /*!
                ensures
                    - constructs an iterator in an undefined state.  It can't
                      be used until assigned with a valid iterator.
            !*/

            in_edge_iterator(
                const in_edge_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
            !*/

            in_edge_iterator& operator=(
                const in_edge_iterator& item
            );
            /*!
                ensures
                    - #*this is a copy of item
                    - returns #*this
            !*/

            bool operator!= (
                const in_edge_iterator& item
            ) const;
            /*!
                requires
                    - *this and item are iterators over the neighbors for the
                      same node.  
                ensures
                    - returns false if *this and item both reference the same
                      node in the graph and true otherwise.
            !*/

            in_edge_iterator& operator++(
            );
            /*!
                ensures
                    - advances *this to the next neighbor node.
                    - returns a reference to the updated *this
                      (i.e. this is the ++object form of the increment operator) 
            !*/
        };



        unsigned long number_of_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the graph.  
        !*/

        out_edge_iterator out_begin(
            const unsigned long& idx
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns an iterator pointing to the first neighboring node of
                  the idx-th node.  If no such node exists then returns out_end(idx).
                - The returned iterator also represents the directed edge going from 
                  node idx to the neighbor.
        !*/

        in_edge_iterator in_begin(
            const unsigned long& idx
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns an iterator pointing to the first neighboring node of
                  the idx-th node.  If no such node exists then returns in_end(idx).
                - The returned iterator also represents the directed edge going from 
                  the neighbor to node idx.
        !*/

        out_edge_iterator out_end(
            const unsigned long& idx 
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns an iterator to one past the last neighboring node of
                  the idx-th node.
        !*/

        in_edge_iterator in_end(
            const unsigned long& idx 
        ) const; 
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns an iterator to one past the last neighboring node of
                  the idx-th node.
        !*/


        unsigned long node_id (
            const out_edge_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [out_begin(idx), out_end(idx))
                  for some valid idx)
            ensures
                - returns a number IDX such that:
                    - 0 <= IDX < number_of_nodes()
                    - IDX == The index which uniquely identifies the node pointed to by the
                      iterator it.  This number can be used with any member function in this
                      object which expect a node index.  (e.g. get_label(IDX) == the label for the
                      node pointed to by it)
        !*/

        unsigned long node_id (
            const in_edge_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [in_begin(idx), in_end(idx))
                  for some valid idx)
            ensures
                - returns a number IDX such that:
                    - 0 <= IDX < number_of_nodes()
                    - IDX == The index which uniquely identifies the node pointed to by the
                      iterator it.  This number can be used with any member function in this
                      object which expect a node index.  (e.g. get_label(IDX) == the label for the
                      node pointed to by it)
        !*/

        // This typedef should be for a type like int or double.  It
        // must also be capable of representing signed values.
        typedef an_integer_or_real_type edge_type;

        edge_type get_flow (
            const unsigned long& idx1,     
            const unsigned long& idx2 
        ) const;
        /*!
            requires
                - idx1 < number_of_nodes()
                - idx2 < number_of_nodes()
                - idx1 and idx2 are neighbors in the graph
            ensures
                - returns the residual flow capacity from the idx1-th node to the idx2-th node.
                - It is valid for this function to return a floating point value of infinity.
                  This value means this edge has an unlimited capacity.
        !*/

        edge_type get_flow (
            const out_edge_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [out_begin(idx), out_end(idx))
                  for some valid idx)
            ensures
                - let IDX = node_id(it)
                - it represents the directed edge from a node, call it H, to the node IDX. Therefore,
                  this function returns get_flow(H,IDX)
                - It is valid for this function to return a floating point value of infinity.
                  This value means this edge has an unlimited capacity.
        !*/

        edge_type get_flow (
            const in_edge_iterator& it
        ) const;
        /*!
            requires
                - it == a valid iterator (i.e. it must be in the range [in_begin(idx), in_end(idx))
                  for some valid idx)
            ensures
                - let IDX = node_id(it)
                - it represents the directed edge from node IDX to another node, call it H. Therefore,
                  this function returns get_flow(IDX,H)
                - It is valid for this function to return a floating point value of infinity.
                  This value means this edge has an unlimited capacity.
        !*/

        void adjust_flow (
            const unsigned long& idx1,
            const unsigned long& idx2,
            const edge_type& value
        );
        /*!
            requires
                - idx1 < number_of_nodes()
                - idx2 < number_of_nodes()
                - idx1 and idx2 are neighbors in the graph
            ensures
                - #get_flow(idx1,idx2) == get_flow(idx1,idx2) + value
                - #get_flow(idx2,idx1) == get_flow(idx2,idx1) - value
        !*/

        void set_label (
            const unsigned long& idx,
            node_label value
        );
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - #get_label(idx) == value
        !*/

        node_label get_label (
            const unsigned long& idx
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns the label for the idx-th node in the graph.
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename flow_graph
        >
    typename flow_graph::edge_type graph_cut_score (
        const flow_graph& g
    );
    /*!
        requires
            - flow_graph == an object with an interface compatible with the flow_graph
              object defined at the top of this file, or, an implementation of 
              dlib/directed_graph/directed_graph_kernel_abstract.h.
        ensures
            - returns the sum of the outgoing flows from nodes with a label of SOURCE_CUT 
              to nodes with a label != SOURCE_CUT.  Note that for a directed_graph object,
              the labels are stored in the node's data field.
    !*/

// ----------------------------------------------------------------------------------------

    class min_cut
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a function object which can be used to find the min cut
                on a graph.

                The implementation is based on the method described in the following
                paper:
                    An Experimental Comparison of Min-Cut/Max-Flow Algorithms for
                    Energy Minimization in Vision, by Yuri Boykov and Vladimir Kolmogorov, 
                    in PAMI 2004.

        !*/

    public:

        min_cut(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        template <
            typename flow_graph
            >
        void operator() (
            flow_graph& g,
            const unsigned long source_node,
            const unsigned long sink_node
        ) const;
        /*!
            requires
                - flow_graph == an object with an interface compatible with the flow_graph
                  object defined at the top of this file.
                - source_node != sink_node
                - source_node < g.number_of_nodes()
                - sink_node < g.number_of_nodes()
                - for all valid i and j:
                    - g.get_flow(i,j) >= 0
                      (i.e. all the flow capacities/edge weights are non-negative)
                - g does not contain any self loops.  That is, no nodes are neighbors with
                  themselves.
            ensures
                - Finds the minimum cut on the given graph.  That is, this function finds
                  a labeling of nodes in g such that graph_cut_score(g) would be minimized.  Note 
                  that the flow values in #g are modified by this algorithm so if you want 
                  to obtain the min cut score you must call min_cut::operator(), then copy 
                  the flow values back into #g, and then call graph_cut_score(#g).  But in most 
                  cases you don't care about the value of the min cut score, rather, you 
                  just want the labels in #g.
                - #g.get_label(source_node) == SOURCE_CUT 
                - #g.get_label(sink_node) == SINK_CUT 
                - for all valid i:
                    - #g.get_label(i) == SOURCE_CUT, SINK_CUT, or FREE_NODE
                    - if (#g.get_label(i) == SOURCE_CUT) then
                        - The minimum cut of g places node i into the source side of the cut.
                    - if (#g.get_label(i) == SINK_CUT) then
                        - The minimum cut of g places node i into the sink side of the cut.
                    - if (#g.get_label(i) == FREE_NODE) then
                        - Node i can be labeled SOURCE_CUT or SINK_CUT.  Both labelings
                          result in the same cut score.  
                - When interpreting g as a graph of flow capacities from the source_node 
                  to the sink_node we can say that the min cut problem is equivalent to
                  the max flow problem.  This equivalent problem is to find out how to push 
                  as much "flow" from the source node to the sink node as possible.  
                  Upon termination, #g will contain the final flow residuals in addition to 
                  the graph cut labels.  That is, for all valid i and j:
                    - #g.get_flow(i,j) == the residual flow capacity left after the max 
                      possible amount of flow is passing from the source node to the sink
                      node.  For example, this means that #g.get_flow(i,j) == 0 whenever 
                      node i is in the SOURCE_CUT and j is in the SINK_CUT. 
                    - #g.get_flow(i,j) >= 0
        !*/

        template <
            typename directed_graph
            >
        void operator() (
            directed_graph& g,
            const unsigned long source_node,
            const unsigned long sink_node
        ) const;
        /*!
            requires
                - directed_graph == an implementation of dlib/directed_graph/directed_graph_kernel_abstract.h 
                - directed_graph::type == node_label
                - directed_graph::edge_type == and integer or double type
                - source_node != sink_node
                - source_node < g.number_of_nodes()
                - sink_node < g.number_of_nodes()
                - for all valid i and j:
                    - edge(g,i,j) >= 0
                      (i.e. all the flow capacities/edge weights are positive)
                - graph_contains_length_one_cycle(g) == false 
                - graph_has_symmetric_edges(g) == true
            ensures
                - This routine simply converts g into a flow graph and calls the version
                  of operator() defined above.  Note that the conversion is done in O(1)
                  time, it's just an interface adaptor. 
                - edge weights in g correspond to network flows while the .data field of
                  each node in g corresponds to the graph node labels.  
                - upon termination, the flows and labels in g will have been modified
                  as described in the above operator() routine.
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MIN_CuT_ABSTRACT_H__


