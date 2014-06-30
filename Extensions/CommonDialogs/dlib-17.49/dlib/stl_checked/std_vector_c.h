// Copyright (C) 2008  Davis E. King (davis@dlib.net)
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
    class std_vector_c : public std::vector<T,Allocator>
    {
        typedef typename std::vector<T,Allocator> base_type;
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
        explicit std_vector_c(const Allocator& alloc= Allocator()) : base_type(alloc) {}

        explicit std_vector_c(size_type n, const T& value = T(),
                              const Allocator& alloc= Allocator()) : base_type(n, value, alloc) {}

        template <typename InputIterator>
        std_vector_c(InputIterator first, InputIterator last,
                     const Allocator& alloc= Allocator()) : base_type(first,last,alloc) {}

        std_vector_c(const std::vector<T,Allocator>& x) : base_type(x) {}

        std_vector_c<T,Allocator>& operator=(const std::vector<T,Allocator>& x)
        {
            static_cast<base_type&>(*this) = x;
            return *this;
        }

        template <typename InputIterator>
        void assign(InputIterator first, InputIterator last)    { base_type::assign(first,last); }
        void assign(size_type n, const T& u)                    { base_type::assign(n,u); }
        allocator_type          get_allocator() const           { return base_type::get_allocator(); }
        // iterators:
        iterator                begin()                         { return base_type::begin(); }
        const_iterator          begin() const                   { return base_type::begin(); }
        iterator                end()                           { return base_type::end(); }
        const_iterator          end() const                     { return base_type::end(); }
        reverse_iterator        rbegin()                        { return base_type::rbegin(); }
        const_reverse_iterator  rbegin() const                  { return base_type::rbegin(); }
        reverse_iterator        rend()                          { return base_type::rend(); }
        const_reverse_iterator  rend() const                    { return base_type::rend(); }
        // 23.2.4.2 capacity:
        size_type               size() const                    { return base_type::size(); }
        size_type               max_size() const                { return base_type::max_size(); }
        void                    resize(size_type sz, T c = T()) { base_type::resize(sz,c); }
        size_type               capacity() const                { return base_type::capacity(); }
        bool                    empty() const                   { return base_type::empty(); }
        void                    reserve(size_type n)            { base_type::reserve(n); }

        // element access:
        const_reference         at(size_type n) const           { return base_type::at(n); }
        reference               at(size_type n)                 { return base_type::at(n); }


        // 23.2.4.3 modifiers:
        void     push_back(const T& x) { base_type::push_back(x); }
        void     swap(std_vector_c<T,Allocator>& x) { base_type::swap(x); }
        void     clear() { base_type::clear(); }


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
            return static_cast<base_type&>(*this)[n]; 
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
            return static_cast<const base_type&>(*this)[n]; 
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
            return base_type::front(); 
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
            return base_type::front(); 
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
            return base_type::back(); 
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
            return base_type::back(); 
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
            base_type::pop_back(); 
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
            return base_type::insert(position, x); 
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
            base_type::insert(position, n, x); 
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
            base_type::insert(position, first, last); 
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
            return base_type::erase(position); 
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
            return base_type::erase(first,last); 
        }

    // ------------------------------------------------------


    };

// ----------------------------------------------------------------------------------------

// Add these swaps just to make absolutely sure the specialized swap always gets called even
// if the compiler is crappy and would otherwise mess it up.
    template <typename T, typename Allocator>
    void swap(std_vector_c<T,Allocator>& x, std_vector_c<T,Allocator>& y) { x.swap(y); }

    template <typename T, typename Allocator>
    void swap(std::vector<T,Allocator>& x, std_vector_c<T,Allocator>& y) { x.swap(y); }

    template <typename T, typename Allocator>
    void swap(std_vector_c<T,Allocator>& x, std::vector<T,Allocator>& y) { y.swap(x); }

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

