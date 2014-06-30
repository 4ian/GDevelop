// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IS_KINd_H_
#define DLIB_IS_KINd_H_

#include <vector>

namespace dlib
{
    /*!
        This file contains a set of templates that enable you to determine if
        a given type implements an abstract interface defined in one of the
        dlib *_abstract.h files.
    !*/

// ----------------------------------------------------------------------------------------

    struct default_is_kind_value { static const bool value = false; };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_graph : public default_is_kind_value
    {
        /*!
            - if (T is an implementation of graph/graph_kernel_abstract.h) then
                - is_graph<T>::value == true
            - else
                - is_graph<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_directed_graph : public default_is_kind_value
    {
        /*!
            - if (T is an implementation of directed_graph/directed_graph_kernel_abstract.h) then
                - is_directed_graph<T>::value == true
            - else
                - is_directed_graph<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename helper = void>
    struct is_matrix : public default_is_kind_value  
    {
        /*!
            - if (T is some kind of matrix expression from the matrix/matrix_exp_abstract.h component) then
                - is_matrix<T>::value == true
            - else
                - is_matrix<T>::value == false
        !*/

        // Don't set the helper to anything.  Just let it be void.
        ASSERT_ARE_SAME_TYPE(helper,void);
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_array2d : public default_is_kind_value  
    {
        /*!
            - if (T is an implementation of array2d/array2d_kernel_abstract.h) then
                - is_array2d<T>::value == true
            - else
                - is_array2d<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_array : public default_is_kind_value  
    {
        /*!
            - if (T is an implementation of array/array_kernel_abstract.h) then
                - is_array<T>::value == true
            - else
                - is_array<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_std_vector : public default_is_kind_value  
    {
        /*!
            - if (T is an implementation of the standard C++ std::vector object) then
                - is_std_vector<T>::value == true
            - else
                - is_std_vector<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_pair : public default_is_kind_value  
    {
        /*!
            - if (T is a std::pair object) then
                - is_std_vector<T>::value == true
            - else
                - is_std_vector<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_rand : public default_is_kind_value  
    {
        /*!
            - if (T is an implementation of rand/rand_kernel_abstract.h) then
                - is_rand<T>::value == true
            - else
                - is_rand<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_config_reader : public default_is_kind_value  
    {
        /*!
            - if (T is an implementation of config_reader/config_reader_kernel_abstract.h) then
                - is_config_reader<T>::value == true
            - else
                - is_config_reader<T>::value == false
        !*/
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                              Implementation details
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc> 
    struct is_std_vector<std::vector<T,alloc> >         { const static bool value = true; };
    template <typename T> struct is_std_vector<T&>      { const static bool value = is_std_vector<T>::value; };
    template <typename T> struct is_std_vector<const T&>{ const static bool value = is_std_vector<T>::value; };
    template <typename T> struct is_std_vector<const T> { const static bool value = is_std_vector<T>::value; };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    struct is_pair<std::pair<T,U> > { const static bool value = true; };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IS_KINd_H_

