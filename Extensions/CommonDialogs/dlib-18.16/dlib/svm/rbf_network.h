// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RBf_NETWORK_
#define DLIB_RBf_NETWORK_

#include "../matrix.h"
#include "rbf_network_abstract.h"
#include "kernel.h"
#include "linearly_independent_subset_finder.h"
#include "function.h"
#include "../algs.h"

namespace dlib
{

// ------------------------------------------------------------------------------

    template <
        typename Kern 
        >
    class rbf_network_trainer 
    {
        /*!
            This is an implementation of an RBF network trainer that follows
            the directions right off Wikipedia basically.  So nothing 
            particularly fancy.  Although the way the centers are selected
            is somewhat unique.
        !*/

    public:
        typedef Kern kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rbf_network_trainer (
        ) :
            num_centers(10)
        {
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kernel = k;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        void set_num_centers (
            const unsigned long num 
        )
        {
            num_centers = num;
        }

        unsigned long get_num_centers (
        ) const
        {
            return num_centers;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            return do_train(mat(x), mat(y));
        }

        void swap (
            rbf_network_trainer& item
        )
        {
            exchange(kernel, item.kernel);
            exchange(num_centers, item.num_centers);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            typedef typename decision_function<kernel_type>::scalar_vector_type scalar_vector_type;

            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,y),
                "\tdecision_function rbf_network_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                );

            // use the linearly_independent_subset_finder object to select the centers.  So here
            // we show it all the data samples so it can find the best centers.
            linearly_independent_subset_finder<kernel_type> lisf(kernel, num_centers);
            fill_lisf(lisf, x);

            const long num_centers = lisf.size();

            // fill the K matrix with the output of the kernel for all the center and sample point pairs
            matrix<scalar_type,0,0,mem_manager_type> K(x.nr(), num_centers+1);
            for (long r = 0; r < x.nr(); ++r)
            {
                for (long c = 0; c < num_centers; ++c)
                {
                    K(r,c) = kernel(x(r), lisf[c]);
                }
                // This last column of the K matrix takes care of the bias term
                K(r,num_centers) = 1;
            }

            // compute the best weights by using the pseudo-inverse
            scalar_vector_type weights(pinv(K)*y);

            // now put everything into a decision_function object and return it
            return decision_function<kernel_type> (remove_row(weights,num_centers),
                                                   -weights(num_centers),
                                                   kernel,
                                                   lisf.get_dictionary());

        }

        kernel_type kernel;
        unsigned long num_centers;

    }; // end of class rbf_network_trainer 

// ----------------------------------------------------------------------------------------

    template <typename sample_type>
    void swap (
        rbf_network_trainer<sample_type>& a,
        rbf_network_trainer<sample_type>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RBf_NETWORK_

