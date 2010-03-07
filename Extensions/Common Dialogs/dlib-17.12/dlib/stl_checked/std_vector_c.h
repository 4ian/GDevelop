// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STD_VECTOr_C_H_
#define DLIB_STD_VECTOr_C_H_

#include <vector>
#include <algorithm>
#include "../assert.h"
#include "std_vector_c_abstract.h"
#include "../serialize.h"
#include "../is_kind.h"

namespace dlib
{

    template <
        typename T,
        typename Allocator = std::allocator<T>
        >
    class std_vector_c 
    {
        typedef typename std::vector<T,Allocator> base_type;
        base_type impl;
    public:
        // types:
        typedef typename Allocator::reference         reference;
        typedef typename Allocator::const_reference   const_reference;
        typedef typename base_type::iterator          iterator;       // See 23.1
        typedef typename base_type::const_iterator    const_iterator; // See 23.1
        typedef typename base_type::size_type         size_type;      // See 23.1
        typedef typename base_type::difference_type   difference_type;// See 23.1
        typedef T                                     value_type;
        typedef Allocator                             allocator_type;
        typedef typename Allocator::pointer           pointer;
        typedef typename Allocator::const_pointer     const_pointer;
        typedef std::reverse_iterator<iterator>       reverse_iterator;
        typedef std::reverse_iterator<const_iterator> const_reverse_iterator;


        // 23.2.4.1 construct/copy/destroy:
        explicit std_vector_c(const Allocator& alloc= Allocator()) : impl(alloc) {}

        explicit std_vector_c(size_type n, const T& value = T(),
                              const Allocator& alloc= Allocator()) : impl(n, value, alloc) {}

        template <typename InputIterator>
        std_vector_c(InputIterator first, InputIterator last,
                     const Allocator& alloc= Allocator()) : impl(first,last,alloc) {}

        std_vector_c(const std_vector_c<T,Allocator>& x) : impl(x.impl) {}


        std_vector_c<T,Allocator>& operator=(const std_vector_c<T,Allocator>& x)
        {
            impl = x.impl;
            return *this;
        }

        template <typename InputIterator>
        void assign(InputIterator first, InputIterator last)    { impl.assign(first,last); }
        void assign(size_type n, const T& u)                    { impl.assign(n,u); }
        allocator_type          get_allocator() const           { return impl.get_allocator(); }
        // iterators:
        iterator                begin()                         { return impl.begin(); }
        const_iterator          begin() const                   { return impl.begin(); }
        iterator                end()                           { return impl.end(); }
        const_iterator          end() const                     { return impl.end(); }
        reverse_iterator        rbegin()                        { return impl.rbegin(); }
        const_reverse_iterator  rbegin() const                  { return impl.rbegin(); }
        reverse_iterator        rend()                          { return impl.rend(); }
        const_reverse_iterator  rend() const                    { return impl.rend(); }
        // 23.2.4.2 capacity:
        size_type               size() const                    { return impl.size(); }
        size_type               max_size() const                { return impl.max_size(); }
        void                    resize(size_type sz, T c = T()) { impl.resize(sz,c); }
        size_type               capacity() const                { return impl.capacity(); }
        bool                    empty() const                   { return impl.empty(); }
        void                    reserve(size_type n)            { impl.reserve(n); }

        // element access:
        const_reference         at(size_type n) const           { return impl.at(n); }
        reference               at(size_type n)                 { return impl.at(n); }


        // 23.2.4.3 modifiers:
        void     push_back(const T& x) { impl.push_back(x); }
        void     swap(std_vector_c<T,Allocator>& x) { impl.swap(x.impl); }
        void     clear() { impl.clear(); }


    // ------------------------------------------------------
    // Things that have preconditions that should be checked.
    // ------------------------------------------------------

        reference operator[](
            size_type n
        ) 
        { 
            DLIB_CASSERT(n < size(),
                "\treference std_vector_c::operator[](n)"
                << "\n\tYou have supplied an invalid index"
                << "\n\tthis:   " << this
                << "\n\tn:      " << n 
                << "\n\tsize(): " << size()
            );
            return impl[n]; 
        }

    // ------------------------------------------------------

        const_reference operator[](
            size_type n
        ) const 
        { 
            DLIB_CASSERT(n < size(),
                "\tconst_reference std_vector_c::operator[](n)"
                << "\n\tYou have supplied an invalid index"
                << "\n\tthis:   " << this
                << "\n\tn:      " << n 
                << "\n\tsize(): " << size()
            );
            return impl[n]; 
        }

    // ------------------------------------------------------

        reference front(
        ) 
        { 
            DLIB_CASSERT(size() > 0,
                "\treference std_vector_c::front()"
                << "\n\tYou can't call front() on an empty vector"
                << "\n\tthis:   " << this
            );
            return impl.front(); 
        }

    // ------------------------------------------------------

        const_reference front(
        ) const 
        {
            DLIB_CASSERT(size() > 0,
                "\tconst_reference std_vector_c::front()"
                << "\n\tYou can't call front() on an empty vector"
                << "\n\tthis:   " << this
            );
            return impl.front(); 
        }

    // ------------------------------------------------------

        reference back(
        ) 
        { 
            DLIB_CASSERT(size() > 0,
                "\treference std_vector_c::back()"
                << "\n\tYou can't call back() on an empty vector"
                << "\n\tthis:   " << this
            );
            return impl.back(); 
        }

    // ------------------------------------------------------

        const_reference back(
        ) const 
        { 
            DLIB_CASSERT(size() > 0,
                "\tconst_reference std_vector_c::back()"
                << "\n\tYou can't call back() on an empty vector"
                << "\n\tthis:   " << this
            );
            return impl.back(); 
        }

    // ------------------------------------------------------

        void pop_back(
        ) 
        { 
            DLIB_CASSERT(size() > 0,
                "\tconst_reference std_vector_c::pop_back()"
                << "\n\tYou can't call pop_back() on an empty vector"
                << "\n\tthis:   " << this
            );
            impl.pop_back(); 
        }

    // ------------------------------------------------------

        iterator insert(
            iterator position, 
            const T& x
        ) 
        { 
            DLIB_CASSERT( begin() <= position && position <= end(), 
                "\titerator std_vector_c::insert(position,x)"
                << "\n\tYou have called insert() with an invalid position"
                << "\n\tthis:   " << this
            );
            return impl.insert(position, x); 
        }

    // ------------------------------------------------------

        void insert(
            iterator position, 
            size_type n, 
            const T& x
        ) 
        { 
            DLIB_CASSERT( begin() <= position && position <= end(), 
                "\tvoid std_vector_c::insert(position,n,x)"
                << "\n\tYou have called insert() with an invalid position"
                << "\n\tthis:   " << this
            );
            impl.insert(position, n, x); 
        }

    // ------------------------------------------------------

        template <typename InputIterator>
        void insert(
            iterator position,
            InputIterator first, 
            InputIterator last
        ) 
        { 
            DLIB_CASSERT( begin() <= position && position <= end(), 
                "\tvoid std_vector_c::insert(position,first,last)"
                << "\n\tYou have called insert() with an invalid position"
                << "\n\tthis:   " << this
            );
            impl.insert(position, first, last); 
        }

    // ------------------------------------------------------

        iterator erase(
            iterator position
        ) 
        { 
            DLIB_CASSERT( begin() <= position && position < end(), 
                "\titerator std_vector_c::erase(position)"
                << "\n\tYou have called erase() with an invalid position"
                << "\n\tthis:   " << this
            );
            return impl.erase(position); 
        }

    // ------------------------------------------------------

        iterator erase(
            iterator first, 
            iterator last
        ) 
        { 
            DLIB_CASSERT( begin() <= first && first <= last && last <= end(),
                "\titerator std_vector_c::erase(first,last)"
                << "\n\tYou have called erase() with an invalid range of iterators"
                << "\n\tthis:   " << this
            );
            return impl.erase(first,last); 
        }

    // ------------------------------------------------------


    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename Allocator>
    bool operator==(const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y) 
    { return x.size() == y.size() && std::equal(x.begin(), x.end(), y.begin()); }

    template <typename T, typename Allocator>
    bool operator< (const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y)
    { return std::lexicographical_compare(x.begin(), x.end(), y.begin(), y.end()); }

    template <typename T, typename Allocator>
    bool operator!=(const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y) 
    { return !(x == y); }

    template <typename T, typename Allocator>
    bool operator> (const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y)
    { return y < x; }

    template <typename T, typename Allocator>
    bool operator>=(const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y)
    { return !(x < y); }

    template <typename T, typename Allocator>
    bool operator<=(const std_vector_c<T,Allocator>& x, const std_vector_c<T,Allocator>& y)
    { return !(y < x); }

    // specialized algorithms:
    template <typename T, typename Allocator>
    void swap(std_vector_c<T,Allocator>& x, std_vector_c<T,Allocator>& y) { x.swap(y); }

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    void serialize (
        const std_vector_c<T,alloc>& item,
        std::ostream& out
    )
    {
        try
        { 
            const unsigned long size = static_cast<unsigned long>(item.size());

            serialize(size,out); 
            for (unsigned long i = 0; i < item.size(); ++i)
                serialize(item[i],out);
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type std_vector_c"); }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    void deserialize (
        std_vector_c<T, alloc>& item,
        std::istream& in
    )
    {
        try 
        { 
            unsigned long size;
            deserialize(size,in); 
            item.resize(size);
            for (unsigned long i = 0; i < size; ++i)
                deserialize(item[i],in);
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type std_vector_c"); }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc> 
    struct is_std_vector<std_vector_c<T,alloc> >        { const static bool value = true; };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STD_VECTOr_C_H_

