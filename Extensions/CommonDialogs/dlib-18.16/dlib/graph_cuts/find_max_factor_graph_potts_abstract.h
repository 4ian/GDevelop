// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_ABSTRACT_Hh_
#ifdef DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_ABSTRACT_Hh_

#include "../matrix.h"
#include "min_cut_abstract.h"
#include "../graph_utils.h"
#include "../array2d/array2d_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class potts_problem 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a boolean valued factor graph or graphical model 
                that can be efficiently operated on using graph cuts.  In particular, this 
                object defines the interface a MAP problem on a factor graph must 
                implement if it is to be solved using the find_max_factor_graph_potts() 
                routine defined at the bottom of this file.  

                Note that there is no dlib::potts_problem object.  What you are looking 
                at here is simply the interface definition for a Potts problem.  You must 
                implement your own version of this object for the problem you wish to 
                solve and then pass it to the find_max_factor_graph_potts() routine.

                Note also that a factor graph should not have any nodes which are 
                neighbors with themselves.  Additionally, the graph is undirected. This
                mean that if A is a neighbor of B then B must be a neighbor of A for
                the MAP problem to be valid.
        !*/

    public:

        unsigned long number_of_nodes (
        ) const; 
        /*!
            ensures
                - returns the number of nodes in the factor graph.  Or in other words, 
                  returns the number of variables in the MAP problem/Potts model.
        !*/

        unsigned long number_of_neighbors (
            unsigned long idx
        ) const; 
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns the number of neighbors of node idx.
        !*/

        // This is an optional variable which specifies a number that is always
        // greater than or equal to number_of_neighbors(idx).  If you don't know
        // the value at compile time then either don't include max_number_of_neighbors 
        // in your potts_problem object or set it to 0.
        const static unsigned long max_number_of_neighbors = 0; 

        unsigned long get_neighbor (
            unsigned long idx,
            unsigned long n 
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
                - n < number_of_neighbors(idx)
            ensures
                - returns the node index value of the n-th neighbor of 
                  the node with index value idx.
                - The neighbor relationship is reciprocal.  That is, if 
                  get_neighbor(A,i)==B then there is a value of j such 
                  that get_neighbor(B,j)==A.
                - A node is never its own neighbor.  That is, there is
                  no i such that get_neighbor(idx,i)==idx.
        !*/

        unsigned long get_neighbor_idx (
            unsigned long idx1,
            unsigned long idx2
        ) const;
        /*!
            requires
                - idx1 < number_of_nodes()
                - idx2 < number_of_nodes()
            ensures
                - This function is basically the inverse of get_neighbor().
                - returns a number IDX such that:
                    - get_neighbor(idx1,IDX) == idx2
                    - IDX < number_of_neighbors(idx1)
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
                - returns the current label for the idx-th node.  This is a value which is
                  0 if the node's label is false and is any other value if it is true.  

                  Note that this value is not used by factor_value() or factor_value_disagreement().
                  It is simply here to provide a mechanism for find_max_factor_graph_potts()
                  to return its labeled result.  Additionally, the reason it returns a 
                  node_label rather than a bool is because doing it this way facilitates 
                  use of a graph cut algorithm for the solution of the MAP problem.  For 
                  more of an explanation you should read the paper referenced by the min_cut
                  object.
        !*/

        // This typedef should be for a type like int or double.  It
        // must also be capable of representing signed values.
        typedef an_integer_or_real_type value_type;

        value_type factor_value (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < number_of_nodes()
            ensures
                - returns a value which indicates how "good" it is to assign the idx-th
                  node the label of true.  The larger the value, the more desirable it is 
                  to give it this label.  Similarly, a negative value indicates that it is
                  better to give the node a label of false.
                - It is valid for the returned value to be positive or negative infinity.  
                  A value of positive infinity indicates that the idx-th node must be labeled
                  true while negative infinity means it must be labeled false.
        !*/

        value_type factor_value_disagreement (
            unsigned long idx1, 
            unsigned long idx2
        ) const;
        /*!
            requires
                - idx1 < number_of_nodes()
                - idx2 < number_of_nodes()
                - idx1 != idx2
                - the idx1-th node and idx2-th node are neighbors in the graph.  That is, 
                  get_neighbor(idx1,i)==idx2 for some value of i.
            ensures
                - returns a number >= 0.  This is the penalty for giving node idx1 and idx2
                  different labels.  Larger values indicate a larger penalty.
                - this function is symmetric.  That is, it is true that: 
                  factor_value_disagreement(i,j) == factor_value_disagreement(j,i)
                - It is valid for the returned value to be positive infinity.  Returning
                  infinity indicates that the idx1-th and idx2-th nodes must share the same 
                  label.
        !*/

    };

// ----------------------------------------------------------------------------------------

    class potts_grid_problem 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a specialization of a potts_problem to the case where
                the graph is a regular grid where each node is connected to its four
                neighbors.  An example of this is an image where each pixel is a node
                and is connected to its four immediate neighboring pixels.  Therefore,
                this object defines the interface this special kind of MAP problem
                must implement if it is to be solved by the find_max_factor_graph_potts(potts_grid_problem,array2d)
                routine defined at the end of this file.


                Note that all nodes always have four neighbors, even nodes on the edge
                of the graph.  This is because these border nodes are connected to
                the border nodes on the other side of the graph.  That is, the graph
                "wraps" around at the borders.  
        !*/

    public:

        // This typedef should be for a type like int or double.  It
        // must also be capable of representing signed values.
        typedef an_integer_or_real_type value_type;

        long nr(
        ) const; 
        /*!
            ensures
                - returns the number of rows in the grid
        !*/

        long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in the grid
        !*/

        value_type factor_value (
            unsigned long idx
        ) const;
        /*!
            requires
                - idx < nr()*nc()
            ensures
                - The grid is represented in row-major-order format.  Therefore, idx
                  identifies a node according to its position in the row-major-order 
                  representation of the grid graph.  Or in other words, idx corresponds
                  to the following row and column location in the graph:
                    - row == idx/nc()
                    - col == idx%nc()
                - returns a value which indicates how "good" it is to assign the idx-th 
                  node the label of true.  The larger the value, the more desirable it is 
                  to give it this label.  Similarly, a negative value indicates that it is
                  better to give the node a label of false.
                - It is valid for the returned value to be positive or negative infinity.  
                  A value of positive infinity indicates that the idx-th node must be labeled
                  true while negative infinity means it must be labeled false.
        !*/

        value_type factor_value_disagreement (
            unsigned long idx1,
            unsigned long idx2
        ) const;
        /*!
            requires
                - idx1 < nr()*nc()
                - idx2 < nr()*nc()
                - idx1 != idx2
                - the idx1-th node and idx2-th node are neighbors in the grid graph.  
            ensures
                - The grid is represented in row-major-order format.  Therefore, idx1 and 
                  idx2 identify nodes according to their positions in the row-major-order 
                  representation of the grid graph.  For example, idx1 corresponds
                  to the following row and column location in the graph:
                    - row == idx1/nc()
                    - col == idx1%nc()
                - returns a number >= 0.  This is the penalty for giving node idx1 and idx2
                  different labels.  Larger values indicate a larger penalty.
                - this function is symmetric.  That is, it is true that: 
                  factor_value_disagreement(i,j) == factor_value_disagreement(j,i)
                - It is valid for the returned value to be positive infinity.  Returning
                  infinity indicates that the idx1-th and idx2-th nodes must share the same 
                  label.
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename potts_problem
        >
    typename potts_problem::value_type potts_model_score (
        const potts_problem& prob 
    );
    /*!
        requires
            - potts_problem == an object with an interface compatible with the potts_problem 
              object defined at the top of this file.
            - for all valid i and j:
                - prob.factor_value_disagreement(i,j) >= 0
                - prob.factor_value_disagreement(i,j) == prob.factor_value_disagreement(j,i)
        ensures
            - computes the model score for the given potts_problem.  We define this
              precisely below:
                - let L(i) == the boolean label of the i-th variable in prob.  Or in other 
                  words, L(i) == (prob.get_label(i) != 0).
                - let F == the sum of values of prob.factor_value(i) for only i values
                  where L(i) == true.
                - Let D == the sum of values of prob.factor_value_disagreement(i,j) 
                  for only i and j values which meet the following conditions:
                    - i and j are neighbors in the graph defined by prob, that is,
                      it is valid to call prob.factor_value_disagreement(i,j).
                    - L(i) != L(j)
                    - i < j
                      (i.e. We want to make sure to only count the edge between i and j once)

                - Then this function returns F - D
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    typename graph_type::edge_type potts_model_score (
        const graph_type& g,
        const std::vector<node_label>& labels
    );
    /*!
        requires
            - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
            - graph_type::edge_type is some signed type such as int or double
            - graph_type::type must be the same type as graph_type::edge_type 
            - graph_contains_length_one_cycle(g) == false
            - for all valid i and j:
                - edge(g,i,j) >= 0
        ensures
            - This function does the same thing as the version of potts_model_score()
              defined above, except that this version operates on a dlib::graph
              instead of a potts_problem object.
            - computes the model score for the given graph and labeling.  We define this
              precisely below:
                - let L(i) == the boolean label of the i-th variable in g.  Or in other 
                  words, L(i) == (labels[i] != 0).
                - let F == the sum of values of g.node(i).data for only i values
                  where L(i) == true.
                - Let D == the sum of values of edge(g,i,j) for only i and j 
                  values which meet the following conditions:
                    - i and j are neighbors in the graph defined by g, that is,
                      it is valid to call edge(g,i,j).
                    - L(i) != L(j)
                    - i < j
                      (i.e. We want to make sure to only count the edge between i and j once)

                - Then this function returns F - D
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename potts_grid_problem,
        typename mem_manager
        >
    typename potts_grid_problem::value_type potts_model_score (
        const potts_grid_problem& prob,
        const array2d<node_label,mem_manager>& labels
    );
    /*!
        requires
            - prob.nr() == labels.nr()
            - prob.nc() == labels.nc()
            - potts_grid_problem == an object with an interface compatible with the 
              potts_grid_problem object defined above.
            - for all valid i and j:
                - prob.factor_value_disagreement(i,j) >= 0
                - prob.factor_value_disagreement(i,j) == prob.factor_value_disagreement(j,i)
        ensures
            - computes the model score for the given potts_grid_problem.  We define this
              precisely below:
                - let L(i) == the boolean label of the i-th variable in prob.  Or in other 
                  words, L(i) == (labels[i/labels.nc()][i%labels.nc()] != 0).
                - let F == the sum of values of prob.factor_value(i) for only i values
                  where L(i) == true.
                - Let D == the sum of values of prob.factor_value_disagreement(i,j) 
                  for only i and j values which meet the following conditions:
                    - i and j are neighbors in the graph defined by prob, that is,
                      it is valid to call prob.factor_value_disagreement(i,j).
                    - L(i) != L(j)
                    - i < j
                      (i.e. We want to make sure to only count the edge between i and j once)

                - Then this function returns F - D
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename potts_problem
        >
    void find_max_factor_graph_potts (
        potts_problem& prob 
    );
    /*!
        requires
            - potts_problem == an object with an interface compatible with the potts_problem 
              object defined at the top of this file.
            - for all valid i and j:
                - prob.factor_value_disagreement(i,j) >= 0
                - prob.factor_value_disagreement(i,j) == prob.factor_value_disagreement(j,i)
        ensures
            - This function is a tool for exactly solving the MAP problem in a Potts
              model.  In particular, this means that this function finds the assignments 
              to all the labels in prob which maximizes potts_model_score(#prob).
            - The optimal labels are stored in #prob.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    void find_max_factor_graph_potts (
        const graph_type& g,
        std::vector<node_label>& labels
    );
    /*!
        requires
            - graph_type is an implementation of dlib/graph/graph_kernel_abstract.h
            - graph_type::edge_type is some signed type such as int or double
            - graph_type::type must be the same type as graph_type::edge_type 
            - graph_contains_length_one_cycle(g) == false
            - for all valid i and j:
                - edge(g,i,j) >= 0
        ensures
            - This routine simply converts g into a potts_problem and calls the
              version of find_max_factor_graph_potts() defined above on it.  Therefore,
              this routine is just a convenience wrapper that lets you use a dlib::graph
              to represent a potts problem.  This means that this function maximizes 
              the value of potts_model_score(g, #labels).
            - #labels.size() == g.number_of_nodes() 
            - for all valid i:  
                - #labels[i] == the optimal label for g.node(i)
            - The correspondence between g and a potts_problem is the following:
                - the factor_value() for a node is stored in g.node(i).data.
                - the factor_value_disagreement(i,j) is stored in edge(g,i,j).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename potts_grid_problem,
        typename mem_manager
        >
    void find_max_factor_graph_potts (
        const potts_grid_problem& prob,
        array2d<node_label,mem_manager>& labels
    );
    /*!
        requires
            - potts_grid_problem == an object with an interface compatible with the 
              potts_grid_problem object defined above.
            - for all valid i and j:
                - prob.factor_value_disagreement(i,j) >= 0
                - prob.factor_value_disagreement(i,j) == prob.factor_value_disagreement(j,i)
        ensures
            - This routine solves a version of a potts problem where the graph is a
              regular grid where each node is connected to its four immediate neighbors.
              In particular, this means that this function finds the assignments 
              to all the labels in prob which maximizes potts_model_score(prob,#labels).
            - The optimal labels are stored in #labels.
            - #labels.nr() == prob.nr()
            - #labels.nc() == prob.nc()
    !*/

// ---------------------------------------------------------------------------------------- 
// ---------------------------------------------------------------------------------------- 
//    The following functions and interface definitions are convenience routines for use 
//    with the potts grid problem version of find_max_factor_graph_potts() defined above.
// ---------------------------------------------------------------------------------------- 
// ---------------------------------------------------------------------------------------- 

    struct single_image_model 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines a slightly more convenient interface for creating
                potts_grid_problems which operate on an image.  In this case, the goal 
                is to assign a binary label to each pixel in an image.  In particular, 
                this object defines the interface used by the make_potts_grid_problem() 
                routine defined below. 

                In the following comments, we will refer to the image supplied to 
                make_potts_grid_problem() as IMG.
        !*/

        // This typedef should be for a type like int or double.  It
        // must also be capable of representing signed values.
        typedef an_integer_or_real_type value_type;

        template <typename pixel_type>
        value_type factor_value (
            const pixel_type& v
        ) const;
        /*!
            requires
                - v is a pixel value from IMG.
            ensures
                - returns a value which indicates how "good" it is to assign the location
                  in IMG corresponding to v with the label of true.  The larger the value, 
                  the more desirable it is to give it this label.  Similarly, a negative 
                  value indicates that it is better to give the node a label of false.
                - It is valid for the returned value to be positive or negative infinity.  
                  A value of positive infinity indicates that the pixel must be labeled
                  true while negative infinity means it must be labeled false.
        !*/

        template <typename pixel_type>
        value_type factor_value_disagreement (
            const pixel_type& v1,
            const pixel_type& v2 
        ) const;
        /*!
            requires
                - v1 and v2 are pixel values from neighboring pixels in the IMG image.
            ensures
                - returns a number >= 0.  This is the penalty for giving neighboring pixels 
                  with values v1 and v2 different labels.  Larger values indicate a larger 
                  penalty.
                - this function is symmetric.  That is, it is true that: 
                  factor_value_disagreement(i,j) == factor_value_disagreement(j,i)
                - It is valid for the returned value to be positive infinity.  Returning
                  infinity indicates that the idx1-th and idx2-th nodes must share the same 
                  label.
        !*/
    };

// ---------------------------------------------------------------------------------------- 

    struct pair_image_model 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines a slightly more convenient interface for creating
                potts_grid_problems which operate on a pair of identically sized images.
                In this case, the goal is to assign a label to each pixel in the first
                image of the pair.  In particular, this object defines the interface
                used by the make_potts_grid_problem() routine defined below. 

                In the following comments, we will refer to the two images supplied to 
                make_potts_grid_problem() as IMG1 and IMG2.  The goal of the potts
                problem will be to assign labels to each pixel in IMG1 (IMG2 is
                not labeled, it is simply used as a place to keep auxiliary data).
        !*/

        // This typedef should be for a type like int or double.  It
        // must also be capable of representing signed values.
        typedef an_integer_or_real_type value_type;

        template <typename pixel_type1, typename pixel_type2>
        value_type factor_value (
            const pixel_type1& v1,
            const pixel_type2& v2 
        ) const;
        /*!
            requires
                - v1 and v2 are corresponding pixels from IMG1 and IMG2 respectively.
                  That is, both pixel values have the same coordinates in the images.
                  So for example, if v1 is the value of IMG1[4][5] then v2 is the value
                  of IMG2[4][5].
            ensures
                - returns a value which indicates how "good" it is to assign the location
                  in IMG1 corresponding to v1 with the label of true.  The larger the value, 
                  the more desirable it is to give it this label.  Similarly, a negative 
                  value indicates that it is better to give the node a label of false.
                - It is valid for the returned value to be positive or negative infinity.  
                  A value of positive infinity indicates that the pixel must be labeled
                  true while negative infinity means it must be labeled false.
        !*/

        template <typename pixel_type>
        value_type factor_value_disagreement (
            const pixel_type& v1,
            const pixel_type& v2 
        ) const;
        /*!
            requires
                - v1 and v2 are pixel values from neighboring pixels in the IMG1 image.
            ensures
                - returns a number >= 0.  This is the penalty for giving neighboring pixels 
                  with values v1 and v2 different labels.  Larger values indicate a larger 
                  penalty.
                - this function is symmetric.  That is, it is true that: 
                  factor_value_disagreement(i,j) == factor_value_disagreement(j,i)
                - It is valid for the returned value to be positive infinity.  Returning
                  infinity indicates that the idx1-th and idx2-th nodes must share the same 
                  label.
        !*/
    };

// ---------------------------------------------------------------------------------------- 

    template <
        typename single_image_model,
        typename pixel_type,
        typename mem_manager
        >
    potts_grid_problem make_potts_grid_problem (
        const single_image_model& model,
        const array2d<pixel_type,mem_manager>& img
    );
    /*!
        requires
            - single_image_model == an object with an interface compatible with the 
              single_image_model object defined above.
            - for all valid i and j:
                - model.factor_value_disagreement(i,j) >= 0
                - model.factor_value_disagreement(i,j) == model.factor_value_disagreement(j,i)
        ensures
            - returns a potts_grid_problem which can be solved using the 
              find_max_factor_graph_potts(prob,array2d) routine defined above.  That is,
              given an image to store the labels, the following statement would solve the 
              potts problem defined by the given model and image:
                find_max_factor_graph_potts(make_potts_grid_problem(model,img),labels);
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pair_image_model,
        typename pixel_type1,
        typename pixel_type2,
        typename mem_manager
        >
    potts_grid_problem make_potts_grid_problem (
        const pair_image_model& model,
        const array2d<pixel_type1,mem_manager>& img1,
        const array2d<pixel_type2,mem_manager>& img2
    );
    /*!
        requires
            - get_rect(img1) == get_rect(img2)
              (i.e. img1 and img2 have the same dimensions)
            - pair_image_model == an object with an interface compatible with the 
              pair_image_model object defined above.
            - for all valid i and j:
                - model.factor_value_disagreement(i,j) >= 0
                - model.factor_value_disagreement(i,j) == model.factor_value_disagreement(j,i)
        ensures
            - returns a potts_grid_problem which can be solved using the 
              find_max_factor_graph_potts(prob,array2d) routine defined above.  That is,
              given an image to store the labels, the following statement would solve the 
              potts problem defined by the given model and pair of images:
                find_max_factor_graph_potts(make_potts_grid_problem(model,img1,img2),labels);
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_ABSTRACT_Hh_


