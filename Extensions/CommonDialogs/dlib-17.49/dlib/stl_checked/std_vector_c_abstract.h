// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STD_VECTOr_C_ABSTRACT_H_
#ifdef DLIB_STD_VECTOr_C_ABSTRACT_H_

#include <vector>
#include <algorithm>
#include "../assert.h"

namespace dlib
{

    template <
        typename T,
        typename Allocator = std::allocator<T>
        >
    class std_vector_c : public std::vector<T,Allocator>
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a simple wrapper around the std::vector object.  It 
                provides an identical interface but also checks the preconditions of
                each member function.  That is, if you violate a requires
                clause the dlib::fatal_error exception is thrown. 
        !*/

        typedef typename std::vector<T,Allocator> base_type;
    public:
        typedef typename Allocator::reference         reference;
        typedef typename Allocator::const_reference   const_reference;
        typedef typename base_type::iterator          iterator;       
        typedef typename base_type::const_iterator    const_iterator; 
        typedef typename base_type::size_type         size_type;      
        typedef typename base_type::difference_type   difference_type;
        typedef T                                     value_type;
        typedef Allocator                             allocator_type;
        typedef typename Allocator::pointer           pointer;
        typedef typename Allocator::const_pointer     const_pointer;
        typedef std::reverse_iterator<iterator>       reverse_iterator;
        typedef std::reverse_iterator<const_iterator> const_reverse_iterator;


        explicit std_vector_c(
            const Allocator& alloc = Allocator()
        );
        /*!
            ensures
                - #get_allocator() == alloc
                - #size() == 0
        !*/

        explicit std_vector_c (
            size_type n, 
            const T& value = T(),
            const Allocator& alloc = Allocator()
        );
        /*!
            ensures
                - #size() == n
                - #get_allocator() == alloc
                - for all valid i:
                    - (*this)[i] == value
        !*/

        template <typename InputIterator>
        std_vector_c (
            InputIterator first,
            InputIterator last,
            const Allocator& alloc = Allocator()
        );
        /*!
            ensures
                - #size() == std::distance(first,last)
                - #get_allocator() == alloc
                - std::equal(first, last, begin()) == true
        !*/

        std_vector_c(
            const std::vector<T,Allocator>& x
        );
        /*!
            ensures
                - #*this == x
        !*/

        std_vector_c<T,Allocator>& operator= (
            const std::vector<T,Allocator>& x
        );
        /*!
            ensures
                - #*this == x
                - returns #*this
        !*/

        template <typename InputIterator>
        void assign(
            InputIterator first, 
            InputIterator last
        );
        /*!
            ensures
                - #size() == std::distance(first,last)
                - std::equal(first, last, begin()) == true
        !*/

        void assign(
            size_type n, 
            const T& value 
        ); 
        /*!
            ensures
                - #size() == n
                - for all valid i:
                    - (*this)[i] == value
        !*/

        allocator_type get_allocator(
        ) const;
        /*!
            ensures
                - returns the allocator used by this vector
        !*/
        
        iterator begin(
        );
        /*!
            ensures
                - if (size() > 0) then
                    - returns an iterator referring to the first element in 
                      this container.
                - else
                    - returns end()
        !*/
        
        const_iterator begin(
        ) const;
        /*!
            ensures
                - if (size() > 0) then
                    - returns a const_iterator referring to the first element in 
                      this container.
                - else
                    - returns end()
        !*/

        iterator end(
        ); 
        /*!
            ensures
                - returns an iterator that represents one past the end of
                  this container
        !*/

        const_iterator end(
        ) const;
        /*!
            ensures
                - returns an iterator that represents one past the end of
                  this container
        !*/

        reverse_iterator rbegin(
        );
        /*!
            ensures
                - returns std::reverse_iterator(end())
        !*/

        const_reverse_iterator rbegin(
        ) const;
        /*!
            ensures
                - returns std::reverse_iterator(end())
        !*/
        
        reverse_iterator rend(
        );
        /*!
            ensures
                - returns std::reverse_iterator(begin())
        !*/

        const_reverse_iterator rend(
        ) const; 
        /*!
            ensures
                - returns std::reverse_iterator(begin())
        !*/

        size_type size(
        ) const;  
        /*!
            ensures
                - returns end()-begin()
                  (i.e. returns the number of elements in this container)
        !*/

        size_type max_size(
        ) const;
        /*!
            ensures
                - returns the maximum number of elements this vector can contain
        !*/

        void resize(
            size_type sz, 
            T c = T()
        );
        /*!
            ensures
                - #size() == sz
                - any element with index between 0 and sz - 1 which was in the 
                  vector before the call to resize() retains its value and index.
                  All other elements have a value given by c.
        !*/

        size_type capacity(
        ) const;
        /*!
            ensures
                - returns the total number of elements that the vector can hold without 
                  requiring reallocation. 
        !*/

        bool empty(
        ) const; 
        /*!
            ensures
                - if (size() == 0) then
                    - returns true
                - else
                    - returns false
        !*/

        void reserve(
            size_type n
        ); 
        /*!
            ensures
                - #capacity() >= n
        !*/

        const_reference at(
            size_type n
        ) const; 
        /*!
            ensures
                - if (n < size()) then 
                    - returns a const reference to (*this)[n]
                - else
                    - throws std::out_of_range
        !*/

        reference at(
            size_type n
        ); 
        /*!
            ensures
                - if (n < size()) then 
                    - returns a reference to (*this)[n]
                - else
                    - throws std::out_of_range
        !*/

        void push_back(
            const T& x
        ); 
        /*!
            ensures
                - #size() == size() + 1
                - #back() == x
        !*/

        void swap(
            std_vector_c<T,Allocator>& x
        );
        /*!
            ensures
                - swaps the state of *this and x
        !*/

        void clear(
        ); 
        /*!
            ensures
                - #size() == 0
        !*/

        reference operator[](
            size_type n
        ); 
        /*!
            requires
                - n < size()
            ensures
                - returns a reference to the nth element of this container
        !*/

        const_reference operator[](
            size_type n
        ) const;
        /*!
            requires
                - n < size()
            ensures
                - returns a const reference to the nth element of this container
        !*/

        reference front(
        );
        /*!
            requires
                - size() > 0
            ensures
                - returns a reference to (*this)[0]
        !*/

        const_reference front(
        ) const;
        /*!
            requires
                - size() > 0
            ensures
                - returns a const reference to (*this)[0]
        !*/

        reference back(
        );
        /*!
            requires
                - size() > 0
            ensures
                - returns a reference to (*this)[size()-1]
        !*/

        const_reference back(
        ) const;
        /*!
            requires
                - size() > 0
            ensures
                - returns a const reference to (*this)[size()-1]
        !*/

        void pop_back(
        );
        /*!
            requires
                - size() > 0
            ensures
                - #size() == size() - 1
                - removes the last element in the vector but leaves the others
                  unmodified.
        !*/

        iterator insert(
            iterator position, 
            const T& x
        );
        /*!
            requires
                - begin() <= position && position <= end()
                  (i.e. position references an element in this vector object)
            ensures
                - #size() == size() + 1
                - inserts a copy of x into *this before the given position
                - returns an iterator that points to the copy of x inserted
                  into *this
        !*/

        void insert(
            iterator position, 
            size_type n, 
            const T& x
        );
        /*!
            requires
                - begin() <= position && position <= end()
                  (i.e. position references an element in this vector object)
            ensures
                - #size() == size() + n
                - inserts n copies of x into *this before the given position
        !*/

        template <typename InputIterator>
        void insert(
            iterator position,
            InputIterator first, 
            InputIterator last
        );
        /*!
            requires
                - begin() <= position && position <= end()
                  (i.e. position references an element in this vector object)
                - first and last are not iterators into *this
            ensures
                - #size() == size() + std::distance(last,first)
                - inserts copies of the range of elements [first,last) into *this 
                  before the given position
        !*/

        iterator erase(
            iterator position
        ); 
        /*!
            requires
                - begin() <= position && position < end()
                  (i.e. position references an element in this vector object)
            ensures
                - #size() == size() - 1 
                - removes the element in this vector referenced by position but
                  leaves all other elements in this vector unmodified.
                - if (position < end()-1) then
                    - returns an iterator referencing the element immediately 
                      following *position prior to the erase.
                - else
                    - returns end()
        !*/

        iterator erase(
            iterator first, 
            iterator last
        );
        /*!
            requires
                - begin() <= first && first <= last && last <= end()
                  (i.e. the range [first,last) must be inside this container )
            ensures
                - #size() == size() - (last-first) 
                - removes the elements in this vector referenced by the
                  iterator range [first,last) but leaves all other elements 
                  in this vector unmodified.
                - if (last < end()-1) then
                    - returns an iterator referencing the element immediately 
                      following *last prior to the erase.
                - else
                    - returns end()
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    void serialize (
        const std_vector_c<T,alloc>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    void deserialize (
        std_vector_c<T, alloc>& item,
        std::istream& in
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STD_VECTOr_C_ABSTRACT_H_


