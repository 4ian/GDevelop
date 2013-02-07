// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_WEAK_PTr_
#define DLIB_WEAK_PTr_ 

#include <algorithm>
#include <memory>
#include "shared_ptr.h"
#include "../algs.h"
#include "weak_ptr_abstract.h"

namespace dlib {

    template <
        typename T
        > 
    class weak_ptr 
    {

        /*!
            CONVENTION
                - if (weak_node != 0) then
                    - data == valid pointer to shared data
                    - weak_node->ref_count == the number of weak_ptrs that reference this->data
                - else
                    - data == 0

                - expired() == ((weak_node == 0) || (weak_node->shared_node == 0))
                - if (expired() == false) then
                    - use_count() == weak_node->shared_node->ref_count
                - else
                    - use_count() == 0
        !*/

    public:
        typedef T element_type;

        weak_ptr(
        ) : data(0), weak_node(0)
        {
        }

        template<typename Y> 
        weak_ptr(
            const shared_ptr<Y>& r
        ) 
        {
            data = r.data;
            if (r.shared_node)
            {
                if (r.shared_node->weak_node)
                {
                    weak_node = r.shared_node->weak_node;
                    weak_node->ref_count += 1;
                }
                else
                {
                    weak_node = new weak_ptr_node(r.shared_node); 
                    r.shared_node->weak_node = weak_node;
                }
            }
            else
            {
                weak_node = 0;
            }
        }

        weak_ptr(
            const weak_ptr& r
        )
        {
            data = r.data;
            weak_node = r.weak_node;
            if (weak_node)
                weak_node->ref_count += 1;
        }

        template<typename Y> 
        weak_ptr(
            const weak_ptr<Y>& r
        )
        {
            data = r.data;
            weak_node = r.weak_node;
            if (weak_node)
                weak_node->ref_count += 1;
        }

        ~weak_ptr(
        )
        {
            if (weak_node)
            {
                // make note that this weak_ptr is being destroyed
                weak_node->ref_count -= 1;

                // if this is the last weak_ptr then we should clean up our stuff
                if (weak_node->ref_count == 0)
                {
                    if (expired() == false)
                        weak_node->shared_node->weak_node = 0;
                    delete weak_node;
                }
            }
        }

        weak_ptr& operator= (
            const weak_ptr& r
        )
        {
            weak_ptr(r).swap(*this);
            return *this;
        }

        template<typename Y> 
        weak_ptr& operator= (
            const weak_ptr<Y>& r
        )
        {
            weak_ptr(r).swap(*this);
            return *this;
        }

        template<typename Y> 
        weak_ptr& operator=(
            const shared_ptr<Y>& r
        )
        {
            weak_ptr(r).swap(*this);
            return *this;
        }

        long use_count(
        ) const
        {
            if (expired())
                return 0;
            else
                return weak_node->shared_node->ref_count;
        }

        bool expired() const { return weak_node == 0 || weak_node->shared_node == 0; }

        shared_ptr<T> lock(
        ) const 
        {
            if (expired())
                return shared_ptr<T>();
            else
                return shared_ptr<T>(*this);
        }

        void reset(
        )
        {
            weak_ptr().swap(*this);
        }

        void swap(
            weak_ptr<T>& b
        )
        {
            std::swap(data, b.data);
            std::swap(weak_node, b.weak_node);
        }

        template <typename Y>
        bool _private_less (
            const weak_ptr<Y>& rhs
        ) const
        {
            if (expired())
            {
                if (rhs.expired())
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                if (rhs.expired())
                {
                    return false;
                }
                else
                {
                    // in this case they have both not expired so lets
                    // compare the shared_node pointers
                    return (weak_node->shared_node) < (rhs.weak_node->shared_node);
                }
            }
        }

    private:

        template <typename Y> friend class shared_ptr;
        template <typename Y> friend class weak_ptr;

        T* data;
        weak_ptr_node* weak_node;
    };

    template<typename T, typename U>
    bool operator< (
        const weak_ptr<T>& a, 
        const weak_ptr<U>& b
    )
    {
        return a._private_less(b);
    }

    template<typename T>
    void swap(
        weak_ptr<T>& a, 
        weak_ptr<T> & b
    ) { a.swap(b); }
}

#endif // DLIB_WEAK_PTr_


