// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RANDOM_SUBSeT_SELECTOR_H_
#define DLIB_RANDOM_SUBSeT_SELECTOR_H_

#include "random_subset_selector_abstract.h"
#include "../rand.h"
#include <vector>
#include "../algs.h"
#include "../string.h"
#include "../serialize.h"
#include <iostream>

namespace dlib
{
    template <
        typename T,
        typename Rand_type = dlib::rand
        >
    class random_subset_selector
    {
        /*!
            INITIAL VALUE
                - _max_size == 0
                - items.size() == 0
                - count == 0
                - _next_add_accepts == false

            CONVENTION
                - count == the number of times add() has been called since the last
                  time this object was empty.
                - items.size() == size()
                - max_size() == _max_size
                - next_add_accepts() == _next_add_accepts
        !*/
    public:
        typedef T type;
        typedef T value_type;
        typedef default_memory_manager mem_manager_type;
        typedef Rand_type rand_type;

        typedef typename std::vector<T>::iterator iterator;
        typedef typename std::vector<T>::const_iterator const_iterator;


        random_subset_selector (
        )
        {
            _max_size = 0;
            make_empty();
        }

        void set_seed(const std::string& value)
        {
            rnd.set_seed(value);
        }

        void make_empty (
        )
        {
            items.resize(0);
            count = 0;
            update_next_add_accepts();
        }

        unsigned long size (
        ) const 
        {
            return items.size();
        }

        void set_max_size (
            unsigned long new_max_size
        )
        {
            items.reserve(new_max_size);
            make_empty();
            _max_size = new_max_size;
            update_next_add_accepts();
        }

        unsigned long max_size (
        ) const
        {
            return _max_size;
        }

        T& operator[] (
            unsigned long idx
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(idx < size(),
                "\tvoid random_subset_selector::operator[]()"
                << "\n\t idx is out of range"
                << "\n\t idx:    " << idx 
                << "\n\t size(): " << size() 
                << "\n\t this:   " << this
                );

            return items[idx];
        }

        const T& operator[] (
            unsigned long idx
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(idx < size(),
                "\tvoid random_subset_selector::operator[]()"
                << "\n\t idx is out of range"
                << "\n\t idx:    " << idx 
                << "\n\t size(): " << size() 
                << "\n\t this:   " << this
                );

            return items[idx];
        }

        iterator                begin()                         { return items.begin(); }
        const_iterator          begin() const                   { return items.begin(); }
        iterator                end()                           { return items.end(); }
        const_iterator          end() const                     { return items.end(); }

        bool next_add_accepts (
        ) const 
        {
            return _next_add_accepts;
        }

        void add (
            const T& new_item
        )
        {
            if (items.size() < _max_size)
            {
                items.push_back(new_item);
                // swap into a random place
                exchange(items[rnd.get_random_32bit_number()%items.size()], items.back());
            }
            else if (_next_add_accepts)
            {
                // pick a random element of items and replace it.
                items[rnd.get_random_32bit_number()%items.size()] = new_item;
            }

            update_next_add_accepts();
            ++count;
        }

        void add (
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(next_add_accepts() == false,
                "\tvoid random_subset_selector::add()"
                << "\n\t You should be calling the version of add() that takes an argument"
                << "\n\t this: " << this
                );

            update_next_add_accepts();
            ++count;
        }

        void swap (
            random_subset_selector& a
        )
        {
            a.swap(a.items);
            std::swap(_max_size, a._max_size);
            std::swap(count, a.count);
            rnd.swap(a.rnd);
            std::swap(_next_add_accepts, a._next_add_accepts);
        }

        template <typename T1, typename T2>
        friend void serialize (
            const random_subset_selector<T1,T2>& item,
            std::ostream& out
        );

        template <typename T1, typename T2>
        friend void deserialize (
            random_subset_selector<T1,T2>& item,
            std::istream& in 
        );

    private:

        void update_next_add_accepts (
        )
        {
            if (items.size() < _max_size)
            {
                _next_add_accepts = true;
            }
            else if (_max_size == 0)
            {
                _next_add_accepts = false;
            }
            else
            {
                // At this point each element of items has had an equal chance of being in this object.   
                // In particular, the probability that each arrived here is currently items.size()/count.    
                // We need to be able to say that, after this function ends, the probability of any 
                // particular object ending up in items is items.size()/(count+1).  So this means that 
                // we should decide to add a new item into items with this probability.  Also, if we do 
                // so then we pick one of the current items and replace it at random with the new item.

                // Make me a random 64 bit number.   This might seem excessive but I want this object
                // to be able to handle an effectively infinite number of calls to add().  So count
                // might get very large and we need to deal with that properly.
                const unsigned long num1 = rnd.get_random_32bit_number();
                const unsigned long num2 = rnd.get_random_32bit_number();
                uint64 num = num1;
                num <<= 32;
                num |= num2;

                num %= (count+1);

                _next_add_accepts = (num < items.size());
            }

        }

        std::vector<T> items;
        unsigned long _max_size;
        uint64 count; 

        rand_type rnd;

        bool _next_add_accepts;

    };

    template <
        typename T,
        typename rand_type 
        >
    void swap (
        random_subset_selector<T,rand_type>& a,
        random_subset_selector<T,rand_type>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <typename T1, typename T2>
    void serialize (
        const random_subset_selector<T1,T2>& item,
        std::ostream& out
    )
    {
        serialize(item.items, out);
        serialize(item._max_size, out);
        serialize(item.count, out);
        serialize(item.rnd, out);
        serialize(item._next_add_accepts, out);
    }

    template <typename T1, typename T2>
    void deserialize (
        random_subset_selector<T1,T2>& item,
        std::istream& in 
    )
    {
        deserialize(item.items, in);
        deserialize(item._max_size, in);
        deserialize(item.count, in);
        deserialize(item.rnd, in);
        deserialize(item._next_add_accepts, in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename alloc
        >
    random_subset_selector<T> randomly_subsample (
        const std::vector<T,alloc>& samples,
        unsigned long num
    )
    {
        random_subset_selector<T> subset;
        subset.set_max_size(num);
        for (unsigned long i = 0; i < samples.size(); ++i)
            subset.add(samples[i]);
        return subset;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename alloc,
        typename U
        >
    random_subset_selector<T> randomly_subsample (
        const std::vector<T,alloc>& samples,
        unsigned long num,
        const U& random_seed
    )
    {
        random_subset_selector<T> subset;
        subset.set_seed(cast_to_string(random_seed));
        subset.set_max_size(num);
        for (unsigned long i = 0; i < samples.size(); ++i)
            subset.add(samples[i]);
        return subset;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    random_subset_selector<T> randomly_subsample (
        const random_subset_selector<T>& samples,
        unsigned long num
    )
    {
        random_subset_selector<T> subset;
        subset.set_max_size(num);
        for (unsigned long i = 0; i < samples.size(); ++i)
            subset.add(samples[i]);
        return subset;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    random_subset_selector<T> randomly_subsample (
        const random_subset_selector<T>& samples,
        unsigned long num,
        const U& random_seed
    )
    {
        random_subset_selector<T> subset;
        subset.set_seed(cast_to_string(random_seed));
        subset.set_max_size(num);
        for (unsigned long i = 0; i < samples.size(); ++i)
            subset.add(samples[i]);
        return subset;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANDOM_SUBSeT_SELECTOR_H_


