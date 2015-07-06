// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MLp_KERNEL_1_
#define DLIB_MLp_KERNEL_1_

#include "../algs.h"
#include "../serialize.h"
#include "../matrix.h"
#include "../rand.h"
#include "mlp_kernel_abstract.h"
#include <ctime>
#include <sstream>

namespace dlib
{

    class mlp_kernel_1 : noncopyable
    {
        /*!
            INITIAL VALUE
                The network is initially initialized with random weights 

            CONVENTION
                - input_layer_nodes() == input_nodes
                - first_hidden_layer_nodes() == first_hidden_nodes
                - second_hidden_layer_nodes() == second_hidden_nodes
                - output_layer_nodes() == output_nodes
                - get_alpha == alpha
                - get_momentum() == momentum


                - if (second_hidden_nodes == 0) then
                    - for all i and j:
                        - w1(i,j) == the weight on the link from node i in the first hidden layer 
                          to input node j
                        - w3(i,j) == the weight on the link from node i in the output layer 
                          to first hidden layer node j
                    - for all i and j:
                        - w1m == the momentum terms for w1 from the previous update 
                        - w3m == the momentum terms for w3 from the previous update 
                - else
                    - for all i and j:
                        - w1(i,j) == the weight on the link from node i in the first hidden layer 
                          to input node j
                        - w2(i,j) == the weight on the link from node i in the second hidden layer 
                          to first hidden layer node j
                        - w3(i,j) == the weight on the link from node i in the output layer 
                          to second hidden layer node j
                    - for all i and j:
                        - w1m == the momentum terms for w1 from the previous update 
                        - w2m == the momentum terms for w2 from the previous update 
                        - w3m == the momentum terms for w3 from the previous update 
        !*/

    public:

        mlp_kernel_1 (
            long nodes_in_input_layer,
            long nodes_in_first_hidden_layer, 
            long nodes_in_second_hidden_layer = 0, 
            long nodes_in_output_layer = 1,
            double alpha_ = 0.1,
            double momentum_ = 0.8
        ) :
            input_nodes(nodes_in_input_layer),
            first_hidden_nodes(nodes_in_first_hidden_layer),
            second_hidden_nodes(nodes_in_second_hidden_layer),
            output_nodes(nodes_in_output_layer),
            alpha(alpha_),
            momentum(momentum_)
        {

            // seed the random number generator
            std::ostringstream sout;
            sout << time(0);
            rand_nums.set_seed(sout.str());

            w1.set_size(first_hidden_nodes+1, input_nodes+1);
            w1m.set_size(first_hidden_nodes+1, input_nodes+1);
            z.set_size(input_nodes+1,1);

            if (second_hidden_nodes != 0)
            {
                w2.set_size(second_hidden_nodes+1, first_hidden_nodes+1);
                w3.set_size(output_nodes, second_hidden_nodes+1);

                w2m.set_size(second_hidden_nodes+1, first_hidden_nodes+1);
                w3m.set_size(output_nodes, second_hidden_nodes+1);
            }
            else
            {
                w3.set_size(output_nodes, first_hidden_nodes+1);

                w3m.set_size(output_nodes, first_hidden_nodes+1);
            }

            reset();
        }

        virtual ~mlp_kernel_1 (
        ) {}

        void reset (
        ) 
        {
            // randomize the weights for the first layer
            for (long r = 0; r < w1.nr(); ++r)
                for (long c = 0; c < w1.nc(); ++c)
                    w1(r,c) = rand_nums.get_random_double();

            // randomize the weights for the second layer
            for (long r = 0; r < w2.nr(); ++r)
                for (long c = 0; c < w2.nc(); ++c)
                    w2(r,c) = rand_nums.get_random_double();

            // randomize the weights for the third layer
            for (long r = 0; r < w3.nr(); ++r)
                for (long c = 0; c < w3.nc(); ++c)
                    w3(r,c) = rand_nums.get_random_double();

            // zero all the momentum terms
            set_all_elements(w1m,0);
            set_all_elements(w2m,0);
            set_all_elements(w3m,0);
        }

        long input_layer_nodes (
        ) const { return input_nodes; }

        long first_hidden_layer_nodes (
        ) const { return first_hidden_nodes; }

        long second_hidden_layer_nodes (
        ) const { return second_hidden_nodes; }

        long output_layer_nodes (
        ) const { return output_nodes; }

        double get_alpha (
        ) const { return alpha; }

        double get_momentum (
        ) const { return momentum; }

        template <typename EXP>
        const matrix<double> operator() (
            const matrix_exp<EXP>& in 
        ) const
        {
            for (long i = 0; i < in.nr(); ++i)
                z(i) = in(i);
            // insert the bias 
            z(z.nr()-1) = -1;

            tmp1 = sigmoid(w1*z);
            // insert the bias 
            tmp1(tmp1.nr()-1) = -1;

            if (second_hidden_nodes == 0)
            {
                return sigmoid(w3*tmp1);
            }
            else
            {
                tmp2 = sigmoid(w2*tmp1);
                // insert the bias 
                tmp2(tmp2.nr()-1) = -1;

                return sigmoid(w3*tmp2);
            }
        }

        template <typename EXP1, typename EXP2>
        void train (
            const matrix_exp<EXP1>& example_in,
            const matrix_exp<EXP2>& example_out 
        )
        {
            for (long i = 0; i < example_in.nr(); ++i)
                z(i) = example_in(i);
            // insert the bias 
            z(z.nr()-1) = -1;

            tmp1 = sigmoid(w1*z);
            // insert the bias 
            tmp1(tmp1.nr()-1) = -1;


            if (second_hidden_nodes == 0)
            {
                o = sigmoid(w3*tmp1);

                // now compute the errors and propagate them backwards though the network
                e3 = pointwise_multiply(example_out-o, uniform_matrix<double>(output_nodes,1,1.0)-o, o);
                e1 = pointwise_multiply(tmp1, uniform_matrix<double>(first_hidden_nodes+1,1,1.0) - tmp1, trans(w3)*e3 );

                // compute the new weight updates
                w3m = alpha * e3*trans(tmp1) + w3m*momentum;
                w1m = alpha * e1*trans(z)    + w1m*momentum;

                // now update the weights
                w1 += w1m;
                w3 += w3m;
            }
            else
            {
                tmp2 = sigmoid(w2*tmp1);
                // insert the bias 
                tmp2(tmp2.nr()-1) = -1;

                o = sigmoid(w3*tmp2);


                // now compute the errors and propagate them backwards though the network
                e3 = pointwise_multiply(example_out-o, uniform_matrix<double>(output_nodes,1,1.0)-o, o);
                e2 = pointwise_multiply(tmp2, uniform_matrix<double>(second_hidden_nodes+1,1,1.0) - tmp2, trans(w3)*e3 );
                e1 = pointwise_multiply(tmp1, uniform_matrix<double>(first_hidden_nodes+1,1,1.0) - tmp1, trans(w2)*e2 );

                // compute the new weight updates
                w3m = alpha * e3*trans(tmp2) + w3m*momentum;
                w2m = alpha * e2*trans(tmp1) + w2m*momentum;
                w1m = alpha * e1*trans(z)    + w1m*momentum;

                // now update the weights
                w1 += w1m;
                w2 += w2m;
                w3 += w3m;
            }
        }

        template <typename EXP>
        void train (
            const matrix_exp<EXP>& example_in,
            double example_out
        )
        {
            matrix<double,1,1> e_out;
            e_out(0) = example_out;
            train(example_in,e_out);
        }

        double get_average_change (
        ) const
        {
            // sum up all the weight changes
            double delta = sum(abs(w1m)) + sum(abs(w2m)) + sum(abs(w3m));

            // divide by the number of weights
            delta /=  w1m.nr()*w1m.nc() + 
                w2m.nr()*w2m.nc() + 
                w3m.nr()*w3m.nc();

            return delta;
        }

        void swap (
            mlp_kernel_1& item
        )
        {
            exchange(input_nodes, item.input_nodes);
            exchange(first_hidden_nodes, item.first_hidden_nodes);
            exchange(second_hidden_nodes, item.second_hidden_nodes);
            exchange(output_nodes, item.output_nodes);
            exchange(alpha, item.alpha);
            exchange(momentum, item.momentum);

            w1.swap(item.w1);
            w2.swap(item.w2);
            w3.swap(item.w3);

            w1m.swap(item.w1m);
            w2m.swap(item.w2m);
            w3m.swap(item.w3m);

            // even swap the temporary matrices because this may ultimately result in 
            // fewer calls to new and delete.
            e1.swap(item.e1);
            e2.swap(item.e2);
            e3.swap(item.e3);
            z.swap(item.z);
            tmp1.swap(item.tmp1);
            tmp2.swap(item.tmp2);
            o.swap(item.o);
        }


        friend void serialize (
            const mlp_kernel_1& item, 
            std::ostream& out
        );

        friend void deserialize (
            mlp_kernel_1& item, 
            std::istream& in
        );

    private:

        long input_nodes;
        long first_hidden_nodes;
        long second_hidden_nodes;
        long output_nodes;
        double alpha;
        double momentum;

        matrix<double> w1;
        matrix<double> w2;
        matrix<double> w3;

        matrix<double> w1m;
        matrix<double> w2m;
        matrix<double> w3m;


        rand rand_nums;

        // temporary storage
        mutable matrix<double> e1, e2, e3;
        mutable matrix<double> z, tmp1, tmp2, o;
    };   

    inline void swap (
        mlp_kernel_1& a, 
        mlp_kernel_1& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const mlp_kernel_1& item, 
        std::ostream& out
    )   
    {
        try
        {
            serialize(item.input_nodes, out);
            serialize(item.first_hidden_nodes, out);
            serialize(item.second_hidden_nodes, out);
            serialize(item.output_nodes, out);
            serialize(item.alpha, out);
            serialize(item.momentum, out);

            serialize(item.w1, out);
            serialize(item.w2, out);
            serialize(item.w3, out);

            serialize(item.w1m, out);
            serialize(item.w2m, out);
            serialize(item.w3m, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type mlp_kernel_1"); 
        }
    }

    inline void deserialize (
        mlp_kernel_1& item, 
        std::istream& in
    )   
    {
        try
        {
            deserialize(item.input_nodes, in);
            deserialize(item.first_hidden_nodes, in);
            deserialize(item.second_hidden_nodes, in);
            deserialize(item.output_nodes, in);
            deserialize(item.alpha, in);
            deserialize(item.momentum, in);

            deserialize(item.w1, in);
            deserialize(item.w2, in);
            deserialize(item.w3, in);

            deserialize(item.w1m, in);
            deserialize(item.w2m, in);
            deserialize(item.w3m, in);

            item.z.set_size(item.input_nodes+1,1);
        }
        catch (serialization_error& e)
        { 
            // give item a reasonable value since the deserialization failed
            mlp_kernel_1(1,1).swap(item);
            throw serialization_error(e.info + "\n   while deserializing object of type mlp_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MLp_KERNEL_1_

