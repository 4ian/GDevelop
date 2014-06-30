// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_AnY_TRAINER_H_
#define DLIB_AnY_TRAINER_H_

#include "any.h"
#include "../smart_pointers.h"

#include "any_decision_function.h"

#include "any_trainer_abstract.h"
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
    public:
        typedef sample_type_ sample_type;
        typedef scalar_type_ scalar_type;
        typedef default_memory_manager mem_manager_type;
        typedef any_decision_function<sample_type, scalar_type> trained_function_type;


        any_trainer()
        {
        }

        any_trainer (
            const any_trainer& item
        )
        {
            if (item.data)
            {
                item.data->copy_to(data);
            }
        }

        template <typename T>
        any_trainer (
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

        trained_function_type train (
            const std::vector<sample_type>& samples,
            const std::vector<scalar_type>& labels
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_empty() == false,
                "\t trained_function_type any_trainer::train()"
                << "\n\t You can't call train() on an empty any_trainer"
                << "\n\t this: " << this
                );

            return data->train(samples, labels);
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

        any_trainer& operator= (
            const any_trainer& item
        )
        {
            any_trainer(item).swap(*this);
            return *this;
        }

        void swap (
            any_trainer& item
        )
        {
            data.swap(item.data);
        }

    private:

        struct base
        {
            virtual ~base() {}

            virtual trained_function_type train (
                const std::vector<sample_type>& samples,
                const std::vector<scalar_type>& labels
            ) const = 0;

            virtual void copy_to (
                scoped_ptr<base>& dest
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

            virtual trained_function_type train (
                const std::vector<sample_type>& samples,
                const std::vector<scalar_type>& labels
            ) const
            {
                return item.train(samples, labels);
            }
        };

        scoped_ptr<base> data;
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

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename V> 
    T& any_cast(any_trainer<U,V>& a) { return a.template cast_to<T>(); }

    template <typename T, typename U, typename V> 
    const T& any_cast(const any_trainer<U,V>& a) { return a.template cast_to<T>(); }

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_AnY_TRAINER_H_




