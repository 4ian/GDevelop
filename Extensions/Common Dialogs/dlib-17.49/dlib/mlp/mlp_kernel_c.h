// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MLP_KERNEl_C_
#define DLIB_MLP_KERNEl_C_

#include "mlp_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{


    template <
        typename mlp_base // is an implementation of mlp_kernel_abstract.h
        >
    class mlp_kernel_c : public mlp_base
    {
        long verify_constructor_args (
            long nodes_in_input_layer,
            long nodes_in_first_hidden_layer, 
            long nodes_in_second_hidden_layer, 
            long nodes_in_output_layer
            )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(nodes_in_input_layer > 0 &&
                    nodes_in_first_hidden_layer > 0 &&
                    nodes_in_second_hidden_layer >= 0 &&
                    nodes_in_output_layer > 0,
                    "\tconst mlp::constructor()"
                    << "\n\tinvalid constructor arguments"
                    << "\n\tnodes_in_input_layer:         " << nodes_in_input_layer 
                    << "\n\tnodes_in_first_hidden_layer:  " << nodes_in_first_hidden_layer 
                    << "\n\tnodes_in_second_hidden_layer: " << nodes_in_second_hidden_layer 
                    << "\n\tnodes_in_output_layer:        " << nodes_in_output_layer 
            );

            return nodes_in_input_layer;
        }

    public:

        mlp_kernel_c (
            long nodes_in_input_layer,
            long nodes_in_first_hidden_layer, 
            long nodes_in_second_hidden_layer = 0, 
            long nodes_in_output_layer = 1,
            double alpha = 0.1,
            double momentum = 0.8
        ) : mlp_base( verify_constructor_args(
                        nodes_in_input_layer, 
                        nodes_in_input_layer, 
                        nodes_in_second_hidden_layer,
                        nodes_in_output_layer),
                      nodes_in_first_hidden_layer,
                      nodes_in_second_hidden_layer,
                      nodes_in_output_layer,
                      alpha,
                      momentum)
        {
        }

        template <typename EXP>
        const matrix<double> operator() (
            const matrix_exp<EXP>& in 
        ) const
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(in.nr() == this->input_layer_nodes() &&
                    in.nc() == 1,
                    "\tconst matrix<double> mlp::operator()(matrix_exp)"
                    << "\n\tthe input matrix dimensions are not correct"
                    << "\n\tin.nr():             " << in.nr() 
                    << "\n\tin.nc():             " << in.nc() 
                    << "\n\tinput_layer_nodes(): " << this->input_layer_nodes() 
                    << "\n\tthis:                " << this
            );

            return mlp_base::operator()(in);
        }

        template <typename EXP1, typename EXP2>
        void train (
            const matrix_exp<EXP1>& example_in,
            const matrix_exp<EXP2>& example_out 
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(example_in.nr() == this->input_layer_nodes() &&
                    example_in.nc() == 1 &&
                    example_out.nr() == this->output_layer_nodes() &&
                    example_out.nc() == 1 &&
                    max(example_out) <= 1.0 && min(example_out) >= 0.0,
                    "\tvoid mlp::train(matrix_exp, matrix_exp)"
                    << "\n\tthe training example dimensions are not correct"
                    << "\n\texample_in.nr():      " << example_in.nr() 
                    << "\n\texample_in.nc():      " << example_in.nc() 
                    << "\n\texample_out.nr():     " << example_out.nr() 
                    << "\n\texample_out.nc():     " << example_out.nc() 
                    << "\n\tmax(example_out):     " << max(example_out) 
                    << "\n\tmin(example_out):     " << min(example_out) 
                    << "\n\tinput_layer_nodes():  " << this->input_layer_nodes() 
                    << "\n\toutput_layer_nodes(): " << this->output_layer_nodes() 
                    << "\n\tthis:                 " << this
            );

            mlp_base::train(example_in,example_out);
        }

        template <typename EXP>
        void train (
            const matrix_exp<EXP>& example_in,
            double example_out
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(example_in.nr() == this->input_layer_nodes() &&
                    example_in.nc() == 1 &&
                    this->output_layer_nodes() == 1 &&
                    example_out <= 1.0 && example_out >= 0.0,
                    "\tvoid mlp::train(matrix_exp, double)"
                    << "\n\tthe training example dimensions are not correct"
                    << "\n\texample_in.nr():      " << example_in.nr() 
                    << "\n\texample_in.nc():      " << example_in.nc() 
                    << "\n\texample_out:          " << example_out 
                    << "\n\tinput_layer_nodes():  " << this->input_layer_nodes() 
                    << "\n\toutput_layer_nodes(): " << this->output_layer_nodes() 
                    << "\n\tthis:                 " << this
            );

            mlp_base::train(example_in,example_out);
        }

    };

    template <
        typename mlp_base
        >
    inline void swap (
        mlp_kernel_c<mlp_base>& a, 
        mlp_kernel_c<mlp_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MLP_KERNEl_C_


