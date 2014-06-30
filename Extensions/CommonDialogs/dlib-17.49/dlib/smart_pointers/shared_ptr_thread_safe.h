// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SHARED_THREAD_SAFE_PTr_
#define DLIB_SHARED_THREAD_SAFE_PTr_ 

#include <algorithm>
#include <memory>
#include <typeinfo>
#include <string>       // for the exceptions
#include "../algs.h"
#include "shared_ptr_thread_safe_abstract.h"
#include "../threads/threads_kernel.h"


namespace dlib 
{

// ----------------------------------------------------------------------------------------

    struct shared_ptr_thread_safe_deleter
    {
        virtual void del(const void* p) = 0;
        virtual ~shared_ptr_thread_safe_deleter() {}

        virtual void* get_deleter_void(const std::type_info& t) const = 0;
        /*!
            ensures
                - if (the deleter in this object has typeid() == t) then
                    - returns a pointer to the deleter
                - else
                    - return 0
        !*/
    };

    struct shared_ptr_thread_safe_node
    {
        shared_ptr_thread_safe_node(
        ) : 
            ref_count(1),
            del(0)
        {}

        dlib::mutex m;
        long ref_count;
        shared_ptr_thread_safe_deleter* del;
    };

    struct shared_ptr_ts_static_cast {};
    struct shared_ptr_ts_const_cast {};
    struct shared_ptr_ts_dynamic_cast {};

// ----------------------------------------------------------------------------------------

    template<typename T> 
    class shared_ptr_thread_safe 
    {
        /*!
            CONVENTION
                - get() == data
                - unique() == (shared_node != 0) && (shared_node->ref_count == 1)
                - if (shared_node != 0) then
                    - use_count() == shared_node->ref_count
                    - get() == a valid pointer
                    - if (we are supposed to use the deleter) then
                        - shared_node->del == the deleter to use
                    - else
                        - shared_node->del == 0
                - else
                    - use_count() == 0
                    - get() == 0

        !*/

        template <typename D>
        struct deleter_template : public shared_ptr_thread_safe_deleter
        {
            deleter_template(const D& d_) : d(d_) {}
            void del(const void* p) { d((T*)p); }
            D d;

            void* get_deleter_void(const std::type_info& t) const 
            {
                if (typeid(D) == t)
                    return (void*)&d;
                else
                    return 0;
            }
        };

    public:

        typedef T element_type;

        shared_ptr_thread_safe(
        ) : data(0), shared_node(0) {} 

        template<typename Y> 
        explicit shared_ptr_thread_safe(
            Y* p
        ) : data(p)
        {
            DLIB_ASSERT(p != 0,
                "\tshared_ptr::shared_ptr_thread_safe(p)"
                << "\n\tp can't be null"
                << "\n\tthis: " << this
                );
            try
            {
                shared_node = new shared_ptr_thread_safe_node;
            }
            catch (...)
            {
                delete p;
                throw;
            }
        }

        template<typename Y, typename D> 
        shared_ptr_thread_safe(
            Y* p, 
            const D& d
        ) : 
            data(p)
        {
            DLIB_ASSERT(p != 0,
                "\tshared_ptr::shared_ptr_thread_safe(p,d)"
                << "\n\tp can't be null"
                << "\n\tthis: " << this
                );
            try
            {
                shared_node = 0;
                shared_node = new shared_ptr_thread_safe_node;
                shared_node->del = new deleter_template<D>(d);
            }
            catch (...)
            {
                if (shared_node) delete shared_node;
                d(p);
                throw;
            }
        }

        ~shared_ptr_thread_safe() 
        { 
            if ( shared_node != 0)
            {
                shared_node->m.lock();
                if (shared_node->ref_count == 1)
                {
                    // delete the data in the appropriate way
                    if (shared_node->del)
                    {
                        shared_node->del->del(data);
                        
                        shared_node->m.unlock();
                        delete shared_node->del;
                    }
                    else
                    {
                        shared_node->m.unlock();
                        delete data;
                    }

                    // finally delete the shared_node
                    delete shared_node;
                }
                else 
                {
                    shared_node->ref_count -= 1;
                    shared_node->m.unlock();
                }
            }
        }

        shared_ptr_thread_safe( 
            const shared_ptr_thread_safe& r
        ) 
        { 
            data = r.data;
            shared_node = r.shared_node;
            if (shared_node)
            {
                auto_mutex M(shared_node->m);
                shared_node->ref_count += 1;
            }
        }

        template<typename Y> 
        shared_ptr_thread_safe(
            const shared_ptr_thread_safe<Y>& r,
            const shared_ptr_ts_static_cast&
        )
        {
            data = static_cast<T*>(r.data);
            if (data != 0)
            {
                shared_node = r.shared_node;
                auto_mutex M(shared_node->m);
                shared_node->ref_count += 1;
            }
            else
            {
                shared_node = 0;
            }
        }

        template<typename Y> 
        shared_ptr_thread_safe(
            const shared_ptr_thread_safe<Y>& r,
            const shared_ptr_ts_const_cast&
        )
        {
            data = const_cast<T*>(r.data);
            if (data != 0)
            {
                shared_node = r.shared_node;
                auto_mutex M(shared_node->m);
                shared_node->ref_count += 1;
            }
            else
            {
                shared_node = 0;
            }
        }

        template<typename Y> 
        shared_ptr_thread_safe(
            const shared_ptr_thread_safe<Y>& r,
            const shared_ptr_ts_dynamic_cast&
        )
        {
            data = dynamic_cast<T*>(r.data);
            if (data != 0)
            {
                shared_node = r.shared_node;
                auto_mutex M(shared_node->m);
                shared_node->ref_count += 1;
            }
            else
            {
                shared_node = 0;
            }
        }

        template<typename Y> 
        shared_ptr_thread_safe(
            const shared_ptr_thread_safe<Y>& r
        )
        {
            data = r.data;
            shared_node = r.shared_node;
            if (shared_node)
            {
                auto_mutex M(shared_node->m);
                shared_node->ref_count += 1;
            }
        }


        template<typename Y>
        explicit shared_ptr_thread_safe(
            std::auto_ptr<Y>& r
        )
        {
            DLIB_ASSERT(r.get() != 0,
                "\tshared_ptr::shared_ptr_thread_safe(auto_ptr r)"
                << "\n\tr.get() can't be null"
                << "\n\tthis: " << this
                );
            shared_node = new shared_ptr_thread_safe_node;
            data = r.release();
        }

        shared_ptr_thread_safe& operator= (
            const shared_ptr_thread_safe& r
        )
        {
            shared_ptr_thread_safe(r).swap(*this);
            return *this;
        }

        template<typename Y> 
        shared_ptr_thread_safe& operator= (
            const shared_ptr_thread_safe<Y>& r
        )
        {
            shared_ptr_thread_safe(r).swap(*this);
            return *this;
        }

        template<typename Y> 
        shared_ptr_thread_safe& operator= (
            std::auto_ptr<Y>& r
        )
        {
            DLIB_ASSERT(r.get() != 0,
                "\tshared_ptr::operator=(auto_ptr r)"
                << "\n\tr.get() can't be null"
                << "\n\tthis: " << this
                );

            reset();
            shared_node = new shared_ptr_thread_safe_node;
            data = r.release();
            return *this;
        }

        void reset()
        {
            shared_ptr_thread_safe().swap(*this);
        }

        template<typename Y> 
        void reset(Y* p)
        {
            DLIB_ASSERT(p != 0,
                "\tshared_ptr::reset(p)"
                << "\n\tp can't be null"
                << "\n\tthis: " << this
                );

            shared_ptr_thread_safe(p).swap(*this);
        }

        template<typename Y, typename D> 
        void reset(
            Y* p, 
            const D& d
        )
        {
            DLIB_ASSERT(p != 0,
                "\tshared_ptr::reset(p,d)"
                << "\n\tp can't be null"
                << "\n\tthis: " << this
                );

            shared_ptr_thread_safe(p,d).swap(*this);
        }

        T& operator*(
        ) const 
        { 
            DLIB_ASSERT(get() != 0,
                "\tshared_ptr::operator*()"
                << "\n\tget() can't be null if you are going to dereference it"
                << "\n\tthis: " << this
                );

            return *data; 
        } 

        T* operator->(
        ) const 
        { 
            DLIB_ASSERT(get() != 0,
                "\tshared_ptr::operator->()"
                << "\n\tget() can't be null"
                << "\n\tthis: " << this
                );

            return data; 
        } 
        
        T* get() const { return data; } 

        bool unique() const 
        {  
            return use_count() == 1;
        }

        long use_count() const
        {
            if (shared_node != 0) 
            {
                auto_mutex M(shared_node->m);
                return shared_node->ref_count;
            }
            else
            {
                return 0;
            }
        }

        operator bool(
        ) const { return get() != 0; }  

        void swap(shared_ptr_thread_safe& b)
        {
            std::swap(data, b.data);
            std::swap(shared_node, b.shared_node);
        }

        template <typename D>
        D* _get_deleter(
        ) const
        {
            if (shared_node)
            {
                auto_mutex M(shared_node->m);
                if (shared_node->del)
                    return static_cast<D*>(shared_node->del->get_deleter_void(typeid(D)));
            }
            else
            {
                return 0;
            }
        }

        template <typename Y>
        bool _private_less (
            const shared_ptr_thread_safe<Y>& rhs
        ) const
        {
            return shared_node < rhs.shared_node;
        }

    private:

        template <typename Y> friend class shared_ptr_thread_safe;

        T* data;
        shared_ptr_thread_safe_node* shared_node;
    };

// ----------------------------------------------------------------------------------------

    template<typename T, typename U>
    bool operator== (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    ) { return a.get() == b.get(); }

    template<typename T, typename U>
    bool operator!= (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    ) { return a.get() != b.get(); }

    template<typename T, typename U>
    bool operator< (
        const shared_ptr_thread_safe<T>& a, 
        const shared_ptr_thread_safe<U>& b
    )
    {
        return a._private_less(b);
    }

    template<typename T> 
    void swap(
        shared_ptr_thread_safe<T>& a, 
        shared_ptr_thread_safe<T>& b
    ) { a.swap(b); }

    template<typename T, typename U>
    shared_ptr_thread_safe<T> static_pointer_cast(
        const shared_ptr_thread_safe<U>& r
    )
    {
        return shared_ptr_thread_safe<T>(r, shared_ptr_ts_static_cast());
    }

    template<typename T, typename U>
    shared_ptr_thread_safe<T> const_pointer_cast(
        shared_ptr_thread_safe<U> const & r
    )
    {
        return shared_ptr_thread_safe<T>(r, shared_ptr_ts_const_cast());
    }

    template<typename T, typename U>
    shared_ptr_thread_safe<T> dynamic_pointer_cast(
        const shared_ptr_thread_safe<U>& r
    )
    {
        return shared_ptr_thread_safe<T>(r, shared_ptr_ts_dynamic_cast());
    }

    template<typename E, typename T, typename Y>
    std::basic_ostream<E, T> & operator<< (std::basic_ostream<E, T> & os, shared_ptr_thread_safe<Y> const & p)
    {
        os << p.get();
        return os;
    }

    template<typename D, typename T>
    D* get_deleter(const shared_ptr_thread_safe<T>& p)
    {
        return p.template _get_deleter<D>();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SHARED_THREAD_SAFE_PTr_

