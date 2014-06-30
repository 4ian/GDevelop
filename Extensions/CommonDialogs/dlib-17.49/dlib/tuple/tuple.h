// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TUPLe_H_
#define DLIB_TUPLe_H_

#include "../enable_if.h"
#include "../algs.h"
#include "../serialize.h"
#include "tuple_abstract.h"

// ----------------------------------------------------------------------------------------

#define DLIB_TUPLE_GLOBAL_HELPERS(N)                                                \
    DLIB_TUPLE_GH(N##0) DLIB_TUPLE_GH(N##1) DLIB_TUPLE_GH(N##2) DLIB_TUPLE_GH(N##3) \
    DLIB_TUPLE_GH(N##4) DLIB_TUPLE_GH(N##5) DLIB_TUPLE_GH(N##6) DLIB_TUPLE_GH(N##7) 

#define DLIB_TUPLE_GH(N)  DLIB_TUPLE_GET_INDEX(N)  DLIB_TUPLE_GET_ITEM(N) DLIB_TUPLE_GET_HELPER_STRUCT(N)

#define DLIB_TUPLE_MEMBER_GET(N)                                                    \
    DLIB_TUPLE_MG(N##0) DLIB_TUPLE_MG(N##1) DLIB_TUPLE_MG(N##2) DLIB_TUPLE_MG(N##3) \
    DLIB_TUPLE_MG(N##4) DLIB_TUPLE_MG(N##5) DLIB_TUPLE_MG(N##6) DLIB_TUPLE_MG(N##7) 

#define DLIB_TUPLE_GET_INDEX(N) \
    template <class Q, class T> const typename enable_if<is_same_type<typename T::type##N,Q>, long>::type get_index (const T&) {return N;}

#define DLIB_TUPLE_GET_ITEM(N) \
    template <class Q,class T> const typename enable_if<is_same_type<typename T::type##N,Q>,Q>::type& get_item_const (const T& t) {return t.v##N;}\
    template <class Q,class T>       typename enable_if<is_same_type<typename T::type##N,Q>,Q>::type& get_item (      T& t) {return t.v##N;}


#define DLIB_TUPLE_GET_HELPER_STRUCT(N)                         \
    template <class T> struct get_helper<N,T>                   \
    {                                                           \
        typedef typename T::type##N type;                       \
        static const type& get(const T& t) { return t.v##N; }   \
        static       type& get( T& t) { return t.v##N; }        \
    };  

#define DLIB_TUPLE_TEMPLATE_LIST(N) \
    class T##N##0 = null_type, class T##N##1 = null_type, class T##N##2 = null_type, class T##N##3 = null_type, \
    class T##N##4 = null_type, class T##N##5 = null_type, class T##N##6 = null_type, class T##N##7 = null_type

#define DLIB_TUPLE_VARIABLE_LIST(N) \
    T##N##0 v##N##0; T##N##1 v##N##1; T##N##2 v##N##2; T##N##3 v##N##3; \
    T##N##4 v##N##4; T##N##5 v##N##5; T##N##6 v##N##6; T##N##7 v##N##7;  \
    typedef T##N##0 type##N##0; typedef T##N##1 type##N##1; typedef T##N##2 type##N##2;  \
    typedef T##N##3 type##N##3; typedef T##N##4 type##N##4; typedef T##N##5 type##N##5;  \
    typedef T##N##6 type##N##6; typedef T##N##7 type##N##7; 

// ----------------------------------------------------------------------------------------

namespace dlib
{

    struct null_type{};

    // provide default serialization for the null_type
    inline void serialize (
        const null_type& ,
        std::ostream&
    ){}
    inline void deserialize (
        null_type& ,
        std::istream&
    ){}

// ----------------------------------------------------------------------------------------

    namespace tuple_helpers
    {
        template <long idx, class T> struct get_helper;

        // use these preprocessor macros to declare all the global stuff used by the
        // tuple member functions.
        DLIB_TUPLE_GLOBAL_HELPERS(0)
        DLIB_TUPLE_GLOBAL_HELPERS(01)
        DLIB_TUPLE_GLOBAL_HELPERS(02)
        DLIB_TUPLE_GLOBAL_HELPERS(03)

    // ------------------------------------------------------------------------------------

    // use templates to recursively enumerate everything in the tuple that isn't a null_type
        template <
            typename T,
            typename F,
            long i = 0,
            typename enabled = void 
            >
        struct for_each 
        {
            static void go(
                T& a, 
                F& funct
            ) 
            {
                funct(a.template get<i>());
                for_each<T,F,i+1>::go(a,funct);
            }

            static bool go(
                T& a, 
                F& funct,
                long idx
            ) 
            /*!
                ensures
                    - returns true if the function was applied to the given index
                    - returns false if the index is invalid so the function wasn't 
                      applied to anything
            !*/
            {
                if (idx == i)
                {
                    funct(a.template get<i>());
                    return true;
                }
                else
                {
                    return for_each<T,F,i+1>::go(a,funct,idx);
                }
            }
        };

        template <bool v1, bool v2> struct template_or { const static bool value = true; };
        template <> struct template_or<false,false> { const static bool value = false; };

        // the base case of the recursion
        template <
            typename T,
            typename F,
            long i
            >
        struct for_each<T,F,i,typename enable_if<template_or<i == T::max_fields , is_same_type<null_type,typename T::template get_type<i>::type >::value> >::type >
        { 
            static void go( T&, F& ) { } 
            static bool go( T&, F&, long ) { return false; } 
        };

    // ------------------------------------------------------------------------------------

    // use templates to recursively enumerate everything in the tuple that isn't a null_type
        template <
            typename T,
            long i = 0,
            typename enabled = void 
            >
        struct tuple_swap 
        {
            static void go(
                T& a,
                T& b 
            ) 
            {
                exchange(a.template get<i>(), b.template get<i>());
                tuple_swap<T,i+1>::go(a,b);
            }
        };

        template <typename T, long i>
        struct at_base_case
        {

        };

        // the base case of the recursion
        template <
            typename T,
            long i
            >
        struct tuple_swap<T,i,typename enable_if<template_or<i == T::max_fields, is_same_type<null_type,typename T::template get_type<i>::type >::value > >::type >
        { static void go( T&, T& ) { } };

    // ------------------------------------------------------------------------------------

        struct tuple_serialize
        {
            tuple_serialize (std::ostream& out_) : out(out_){}
            std::ostream& out;

            template <typename T>
            void operator() (
                T& a
            ) const { serialize(a,out); }
        };

    // ------------------------------------------------------------------------------------

        struct tuple_deserialize
        {
            tuple_deserialize (std::istream& in_) : in(in_){}
            std::istream& in; 
            template <typename T>
            void operator() (
                T& a
            ) const { deserialize(a,in); }
        };


    }

// ----------------------------------------------------------------------------------------

    // use these preprocessor macros to declare 4*8 template arguments (below we count them in octal)
    template < 
        DLIB_TUPLE_TEMPLATE_LIST(0),  // args 00-07
        DLIB_TUPLE_TEMPLATE_LIST(01), // args 010-017 
        DLIB_TUPLE_TEMPLATE_LIST(02), // args 020-027
        DLIB_TUPLE_TEMPLATE_LIST(03)  // args 030-037
        >
    class tuple
    {
    public:

        // use these macros to declare 8*4 member variables
        DLIB_TUPLE_VARIABLE_LIST(0)
        DLIB_TUPLE_VARIABLE_LIST(01)
        DLIB_TUPLE_VARIABLE_LIST(02)
        DLIB_TUPLE_VARIABLE_LIST(03)

        const static long max_fields = 4*8;

        template < long idx > 
        struct get_type 
        { 
            typedef typename tuple_helpers::get_helper<idx,tuple>::type type; 
        };

        template < long idx > 
        const typename tuple_helpers::get_helper<idx,tuple>::type& get (
        ) const { return tuple_helpers::get_helper<idx,tuple>::get(*this); }

        template < long idx >       
        typename tuple_helpers::get_helper<idx,tuple>::type& get (
        ) { return tuple_helpers::get_helper<idx,tuple>::get(*this); }

        template < class Q>  
        long index (
        ) const { return tuple_helpers::get_index<Q>(*this); }

        template <class Q>  
        const Q& get (
        ) const {return tuple_helpers::get_item_const<Q>(*this);}

        template <class Q> 
        Q& get (
        ) {return tuple_helpers::get_item<Q>(*this);}




        template <typename F>
        void for_index (
            F& funct,
            long idx
        ) 
        { 
            // do this #ifdef stuff to avoid getting a warning about valid_idx not being
            // used when ENABLE_ASSERTS isn't defined.
#ifdef ENABLE_ASSERTS
            const bool valid_idx = tuple_helpers::for_each<tuple,F>::go(*this,funct,idx); 
#else
            tuple_helpers::for_each<tuple,F>::go(*this,funct,idx); 
#endif
            DLIB_ASSERT(valid_idx,
                "\tvoid tuple::for_index()"
                << "\n\tYou have attempted to call for_index() with an index out of the valid range"
                << "\n\tidx:  " << idx 
                << "\n\tthis: " << this
                );
        }

        template <typename F>
        void for_index (
            F& funct,
            long idx
        ) const 
        { 
            // do this #ifdef stuff to avoid getting a warning about valid_idx not being
            // used when ENABLE_ASSERTS isn't defined.
#ifdef ENABLE_ASSERTS
            const bool valid_idx = tuple_helpers::for_each<const tuple,F>::go(*this,funct,idx); 
#else
            tuple_helpers::for_each<const tuple,F>::go(*this,funct,idx); 
#endif
            DLIB_ASSERT(valid_idx,
                "\tvoid tuple::for_index()"
                << "\n\tYou have attempted to call for_index() with an index out of the valid range"
                << "\n\tidx:  " << idx 
                << "\n\tthis: " << this
                );
        }

        template <typename F>
        void for_index (
            const F& funct,
            long idx
        ) 
        { 
            // do this #ifdef stuff to avoid getting a warning about valid_idx not being
            // used when ENABLE_ASSERTS isn't defined.
#ifdef ENABLE_ASSERTS
            const bool valid_idx = tuple_helpers::for_each<tuple,const F>::go(*this,funct,idx); 
#else
            tuple_helpers::for_each<tuple,const F>::go(*this,funct,idx); 
#endif
            DLIB_ASSERT(valid_idx,
                "\tvoid tuple::for_index()"
                << "\n\tYou have attempted to call for_index() with an index out of the valid range"
                << "\n\tidx:  " << idx 
                << "\n\tthis: " << this
                );
        }

        template <typename F>
        void for_index (
            const F& funct,
            long idx
        ) const
        { 
            // do this #ifdef stuff to avoid getting a warning about valid_idx not being
            // used when ENABLE_ASSERTS isn't defined.
#ifdef ENABLE_ASSERTS
            const bool valid_idx = tuple_helpers::for_each<const tuple,const F>::go(*this,funct,idx); 
#else
            tuple_helpers::for_each<const tuple,const F>::go(*this,funct,idx); 
#endif
            DLIB_ASSERT(valid_idx,
                "\tvoid tuple::for_index()"
                << "\n\tYou have attempted to call for_index() with an index out of the valid range"
                << "\n\tidx:  " << idx 
                << "\n\tthis: " << this
                );
        }




        template <typename F>
        void for_each (
            F& funct
        ) { tuple_helpers::for_each<tuple,F>::go(*this,funct); }

        template <typename F>
        void for_each (
            F& funct
        ) const { tuple_helpers::for_each<const tuple,F>::go(*this,funct); }

        template <typename F>
        void for_each (
            const F& funct
        ) const { tuple_helpers::for_each<const tuple,const F>::go(*this,funct); }

        template <typename F>
        void for_each (
            const F& funct
        ) { tuple_helpers::for_each<tuple,const F>::go(*this,funct); }




        inline friend void serialize (
            tuple& item,
            std::ostream& out
        )
        {
            try
            {
                item.for_each(tuple_helpers::tuple_serialize(out));
            }
            catch (serialization_error& e)
            {
                throw serialization_error(e.info + "\n   while serializing an object of type dlib::tuple<>");
            }
        }

        inline friend void deserialize (
            tuple& item,
            std::istream& in 
        )
        {
            try
            {
                item.for_each(tuple_helpers::tuple_deserialize(in));
            }
            catch (serialization_error& e)
            {
                throw serialization_error(e.info + "\n   while deserializing an object of type dlib::tuple<>");
            }
        }

        inline friend void swap (
            tuple& a,
            tuple& b
        )
        {
            tuple_helpers::tuple_swap<tuple>::go(a,b);
        }

        inline void swap(
            tuple& item
        ) { tuple_helpers::tuple_swap<tuple>::go(item,*this); }

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_TUPLe_H_

