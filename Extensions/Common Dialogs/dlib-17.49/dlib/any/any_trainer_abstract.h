// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AnY_TRAINER_ABSTRACT_H_
#ifdef DLIB_AnY_TRAINER_ABSTRACT_H_

#include "any_abstract.h"
#include "../algs.h"
#include "any_decision_function_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type_,
        typename scalar_type_ = double
        >
    class any_trainer
    {
        /*!
            INITIAL VALUE
                - is_empty() == true
                - for all T: contains<T>() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a version of dlib::any that is restricted to containing 
                elements which are some kind of object with a .train() method compatible 
                with the following signature: 

                    decision_function train(
                        const std::vector<sample_type>& samples,
                        const std::vector<scalar_type>& labels
                    ) const

                    Where decision_function is a type capable of being stored in an
                    any_decision_function<sample_type,scalar_type> object.

                any_trainer is intended to be used to contain objects such as the svm_nu_trainer
                and other similar types which represent supervised machine learning algorithms.   
                It allows you to write code which contains and processes these trainer objects 
                without needing to know the specific types of trainer objects used.
        !*/

    public:

        typedef sample_type_ sample_type;
        typedef scalar_type_ scalar_type;
        typedef default_memory_manager mem_manager_type;
        typedef any_decision_function<sample_type, scalar_type> trained_function_type;

        any_trainer(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        any_trainer (
            const any_trainer& item
        );
        /*!
            ensures
                - copies the state of item into *this.  
                - Note that *this and item will contain independent copies of the
                  contents of item.  That is, this function performs a deep
                  copy and therefore does not result in *this containing
                  any kind of reference to item.
        !*/

        template < typename T >
        any_trainer (
            const T& item
        );
        /*!
            ensures
                - #contains<T>() == true
                - #cast_to<T>() == item
                  (i.e. a copy of item will be stored in *this)
        !*/

        void clear (
        );
        /*!
            ensures
                - #*this will have its default value.  I.e. #is_empty() == true
        !*/

        template <typename T>
        bool contains (
        ) const;
        /*!
            ensures
                - if (this object currently contains an object of type T) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_empty(
        ) const;
        /*!
            ensures
                - if (this object contains any kind of object) then
                    - returns false 
                - else
                    - returns true
        !*/

        trained_function_type train (
            const std::vector<sample_type>& samples,
            const std::vector<scalar_type>& labels
        ) const
        /*!
            requires
                - is_empty() == false
            ensures
                - Let TRAINER denote the object contained within *this.  Then
                  this function performs:
                    return TRAINER.train(samples, labels)
        !*/

        template <typename T>
        T& cast_to(
        );
        /*!
            ensures
                - if (contains<T>() == true) then
                    - returns a non-const reference to the object contained within *this
                - else
                    - throws bad_any_cast
        !*/

        template <typename T>
        const T& cast_to(
        ) const;
        /*!
            ensures
                - if (contains<T>() == true) then
                    - returns a const reference to the object contained within *this
                - else
                    - throws bad_any_cast
        !*/

        template <typename T>
        T& get(
        );
        /*!
            ensures
                - #is_empty() == false
                - #contains<T>() == true
                - if (contains<T>() == true)
                    - returns a non-const reference to the object contained in *this.
                - else
                    - Constructs an object of type T inside *this
                    - Any previous object stored in this any_trainer object is destructed and its
                      state is lost.
                    - returns a non-const reference to the newly created T object.
        !*/

        any_trainer& operator= (
            const any_trainer& item
        );
        /*!
            ensures
                - copies the state of item into *this.  
                - Note that *this and item will contain independent copies of the
                  contents of item.  That is, this function performs a deep
                  copy and therefore does not result in *this containing
                  any kind of reference to item.
        !*/

        void swap (
            any_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type,
        typename scalar_type
        >
    inline void swap (
        any_trainer<sample_type,scalar_type>& a,
        any_trainer<sample_type,scalar_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename sample_type,
        typename scalar_type
        > 
    T& any_cast(
        any_trainer<sample_type,scalar_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename sample_type,
        typename scalar_type
        > 
    const T& any_cast(
        const any_trainer<sample_type,scalar_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AnY_TRAINER_ABSTRACT_H_


