// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_NULL_TRAINERs_ABSTRACT_
#ifdef DLIB_NULL_TRAINERs_ABSTRACT_

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
        /*!
            REQUIREMENTS ON dec_funct_type
                dec_funct_type can be any copyable type that provides the needed 
                typedefs used below (e.g. kernel_type, scalar_type, etc.).

            WHAT THIS OBJECT REPRESENTS
                This object is a simple tool for turning a decision function 
                into a trainer object that always returns the original decision
                function when you try to train with it.  

                dlib contains a few "training post processing" algorithms (e.g. 
                reduced() and reduced2()).  These tools take in a trainer object,
                tell it to perform training, and then they take the output decision
                function and do some kind of post processing to it.  The null_trainer_type 
                object is useful because you can use it to run an already
                learned decision function through the training post processing
                algorithms by turning a decision function into a null_trainer_type
                and then giving it to a post processor.  
        !*/

    public:
        typedef typename dec_funct_type::kernel_type kernel_type;
        typedef typename dec_funct_type::scalar_type scalar_type;
        typedef typename dec_funct_type::sample_type sample_type;
        typedef typename dec_funct_type::mem_manager_type mem_manager_type;
        typedef dec_funct_type trained_function_type;

        null_trainer_type (
        );
        /*!
            ensures
                - any call to this->train(x,y) will return a default initialized
                  dec_funct_type object.
        !*/

        null_trainer_type (
            const dec_funct_type& dec_funct
        );
        /*!
            ensures
                - any call to this->train(x,y) will always return a copy of
                  the given dec_funct object.
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const dec_funct_type& train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const;
        /*!
            ensures
                - returns a copy of the decision function object given to
                  this object's constructor.
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type
        >
    const null_trainer_type<dec_funct_type> null_trainer (
        const dec_funct_type& dec_funct
    ) { return null_trainer_type<dec_funct_type>(dec_funct); }
    /*!
        ensures
            - returns a null_trainer_type object that has been instantiated with 
              the given arguments.  That is, this function returns a null_trainer_type
              trainer that will return a copy of the given dec_funct object every time 
              someone calls its train() function.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_NULL_TRAINERs_ABSTRACT_


