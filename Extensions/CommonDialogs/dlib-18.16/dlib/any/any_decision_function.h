// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AnY_DECISION_FUNCTION_Hh_
#define DLIB_AnY_DECISION_FUNCTION_Hh_

#include "any.h"
#include "../smart_pointers.h"

#include "any_decision_function_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type_,
        typename result_type_ = double
        >
    class any_decision_function
    {

    public:

        typedef sample_type_ sample_type;
        typedef result_type_ result_type;
        typedef default_memory_manager mem_manager_type;

        any_decision_function()
        {
        }

        any_decision_function (
            const any_decision_function& item
        )
        {
            if (item.data)
            {
                item.data->copy_to(data);
            }
        }

        template <typename T>
        any_decision_function (
            const T& item
        )
        {
            typedef typename basic_type<T>::type U;
            data.reset(new derived<U>(item));
        }

        void clear (
        )
        {
            data.reset();
        }

        template <typename T>
        bool contains (
        ) const
        {
            typedef typename basic_type<T>::type U;
            return dynamic_cast<derived<U>*>(data.get()) != 0;
        }

        bool is_empty(
        ) const
        {
            return data.get() == 0;
        }

        result_type operator() (
            const sample_type& item
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_empty() == false,
                "\t result_type any_decision_function::operator()"
                << "\n\t You can't call operator() on an empty any_decision_function"
                << "\n\t this: " << this
                );

            return data->evaluate(item);
        }

        template <typename T>
        T& cast_to(
        ) 
        {
            typedef typename basic_type<T>::type U;
            derived<U>* d = dynamic_cast<derived<U>*>(data.get());
            if (d == 0)
            {
                throw bad_any_cast();
            }

            return d->item;
        }

        template <typename T>
        const T& cast_to(
        ) const
        {
            typedef typename basic_type<T>::type U;
            derived<U>* d = dynamic_cast<derived<U>*>(data.get());
            if (d == 0)
            {
                throw bad_any_cast();
            }

            return d->item;
        }

        template <typename T>
        T& get(
        ) 
        {
            typedef typename basic_type<T>::type U;
            derived<U>* d = dynamic_cast<derived<U>*>(data.get());
            if (d == 0)
            {
                d = new derived<U>();
                data.reset(d);
            }

            return d->item;
        }

        any_decision_function& operator= (
            const any_decision_function& item
        )
        {
            any_decision_function(item).swap(*this);
            return *this;
        }

        void swap (
            any_decision_function& item
        )
        {
            data.swap(item.data);
        }

    private:

        struct base
        {
            virtual ~base() {}

            virtual void copy_to (
                scoped_ptr<base>& dest
            ) const = 0;

            virtual result_type evaluate (
                const sample_type& samp
            ) const = 0;
        };

        template <typename T>
        struct derived : public base
        {
            T item;
            derived() {}
            derived(const T& val) : item(val) {}

            virtual void copy_to (
                scoped_ptr<base>& dest
            ) const
            {
                dest.reset(new derived<T>(item));
            }

            virtual result_type evaluate (
                const sample_type& samp
            ) const 
            {
                return item(samp);
            }
        };

        scoped_ptr<base> data;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type,
        typename result_type
        >
    inline void swap (
        any_decision_function<sample_type, result_type>& a,
        any_decision_function<sample_type, result_type>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V> 
    T& any_cast(any_decision_function<U,V>& a) { return a.template cast_to<T>(); }

    template <typename T, typename U, typename V> 
    const T& any_cast(const any_decision_function<U,V>& a) { return a.template cast_to<T>(); }

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_AnY_DECISION_FUNCTION_Hh_


