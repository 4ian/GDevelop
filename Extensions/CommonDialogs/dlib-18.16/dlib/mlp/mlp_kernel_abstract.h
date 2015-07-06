// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MLp_ABSTRACT_
#ifdef DLIB_MLp_ABSTRACT_

#include "../algs.h"
#include "../serialize.h"
#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class mlp : noncopyable
    {
        /*!
            INITIAL VALUE
                The network is initially initialized with random weights 

            WHAT THIS OBJECT REPRESENTS
                This object represents a multilayer layer perceptron network that is
                trained using the back propagation algorithm.  The training algorithm also
                incorporates the momentum method.  That is, each round of back propagation
                training also adds a fraction of the previous update.  This fraction
                is controlled by the momentum term set in the constructor.  

                The activation function used at each node is the sigmoid function.  I.e.
                sigmoid(x) = 1/(1 + pow(e,-x)).  Thus the output of the network is
                always in the range [0,1]
        !*/

    public:

        mlp (
            long nodes_in_input_layer,
            long nodes_in_first_hidden_layer, 
            long nodes_in_second_hidden_layer = 0, 
            long nodes_in_output_layer = 1,
            double alpha = 0.1,
            double momentum = 0.8
        );
        /*!
            requires
                - nodes_in_input_layer > 0
                - nodes_in_first_hidden_layer > 0
                - nodes_in_second_hidden_layer >= 0
                - nodes_in_output_layer > 0
            ensures
                - #*this is properly initialized 
                - #input_layer_nodes() == nodes_in_input_layer
                - #first_hidden_layer_nodes() == nodes_in_first_hidden_layer
                - #second_hidden_layer_nodes() == nodes_in_second_hidden_layer
                - #output_layer_nodes() == nodes_in_output_layer
                - #get_alpha() == alpha
                - #get_momentum() == momentum
            throws
                - std::bad_alloc
                    if this is thrown the mlp will be unusable but 
                    will not leak memory
        !*/

        virtual ~mlp (
        );
        /*!
            ensures
                - all resources associated with #*this have been released
        !*/

        void reset (
        ) const;
        /*!
            ensures
                - reinitialize the network with random weights
        !*/

        long input_layer_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the input layer
        !*/

        long first_hidden_layer_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the first hidden layer.  This is
                  the hidden layer that is directly connected to the input layer.
        !*/

        long second_hidden_layer_nodes (
        ) const;
        /*!
            ensures
                - if (this network has a second hidden layer) then
                    - returns the number of nodes in the second hidden layer.  This is 
                      the hidden layer that is directly connected to the output layer.
                - else
                    - returns 0
        !*/

        long output_layer_nodes (
        ) const;
        /*!
            ensures
                - returns the number of nodes in the output layer
        !*/

        double get_alpha (
        ) const;
        /*!
            ensures
                - returns the back propagation learning rate used by this object.
        !*/

        double get_momentum (
        ) const;
        /*!
            ensures
                - returns the momentum term used by this object during back propagation
                  training.  The momentum is is the fraction of a previous update to 
                  carry forward to the next call to train()
        !*/

        template <typename EXP>
        const matrix<double> operator() (
            const matrix_exp<EXP>& in 
        ) const;
        /*!
            requires
                - in.nr() == input_layer_nodes()
                - in.nc() == 1
                - EXP::type == double
            ensures
                - returns the output of the network when it is given the
                  input in.  The output's elements are always in the range
                  of 0.0 to 1.0
        !*/

        template <typename EXP1, typename EXP2>
        void train (
            const matrix_exp<EXP1>& example_in,
            const matrix_exp<EXP2>& example_out 
        );
        /*!
            requires
                - example_in.nr() == input_layer_nodes()
                - example_in.nc() == 1
                - example_out.nr() == output_layer_nodes()
                - example_out.nc() == 1
                - max(example_out) <= 1.0 && min(example_out) >= 0.0
                - EXP1::type == double
                - EXP2::type == double
            ensures
                - trains the network that the correct output when given example_in 
                  should be example_out.
        !*/

        template <typename EXP>
        void train (
            const matrix_exp<EXP>& example_in,
            double example_out
        );
        /*!
            requires
                - example_in.nr() == input_layer_nodes()
                - example_in.nc() == 1
                - output_layer_nodes() == 1
                - example_out <= 1.0 && example_out >= 0.0
                - EXP::type == double
            ensures
                - trains the network that the correct output when given example_in 
                  should be example_out.
        !*/

        double get_average_change (
        ) const;
        /*!
            ensures
                - returns the average change in the node weights in the
                  neural network during the last call to train()
        !*/

        void swap (
            mlp& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };   
   
    inline void swap (
        mlp& a, 
        mlp& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    void serialize (
        const mlp& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        mlp& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MLp_ABSTRACT_ 


