// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_NULL_TRAINERs_H_
#define DLIB_NULL_TRAINERs_H_

#include "null_trainer_abstract.h"
#include "../algs.h"
#include "function_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type 
        >
    class null_trainer_type
    {
    public:
        typedef typename dec_funct_type::kernel_type kernel_type;
        typedef typename dec_funct_type::scalar_type scalar_type;
        typedef typename dec_funct_type::sample_type sample_type;
        typedef typename dec_funct_type::mem_manager_type mem_manager_type;
        typedef dec_funct_type trained_function_type;

        null_trainer_type (
        ){}

        null_trainer_type (
            const dec_funct_type& dec_funct_
        ) : dec_funct(dec_funct_) {}

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const dec_funct_type& train (
            const in_sample_vector_type& ,
            const in_scalar_vector_type& 
        ) const { return dec_funct; }

    private:
        dec_funct_type dec_funct;
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type
        >
    const null_trainer_type<dec_funct_type> null_trainer (
        const dec_funct_type& dec_funct
    ) { return null_trainer_type<dec_funct_type>(dec_funct); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_NULL_TRAINERs_H_

