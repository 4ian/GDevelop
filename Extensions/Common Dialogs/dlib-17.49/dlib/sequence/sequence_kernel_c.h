// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_KERNEl_C_
#define DLIB_SEQUENCE_KERNEl_C_

#include "sequence_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename seq_base
        >
    class sequence_kernel_c : public seq_base
    {
        typedef typename seq_base::type T;
    public:


        void add (
            unsigned long pos,
            T& item
        );

        void remove (
            unsigned long pos,
            T& item
        );

        const T& operator[] (
            unsigned long pos
        ) const;

        T& operator[] (
            unsigned long pos
        );

        void cat (
            sequence_kernel_c& item
        );

        const T& element (
        ) const;

        T& element (
        );

        void remove_any (
            T& item
        );

    };


    template <
        typename seq_base
        >
    inline void swap (
        sequence_kernel_c<seq_base>& a, 
        sequence_kernel_c<seq_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_kernel_c<seq_base>::
    add(
        unsigned long pos,
        T& item
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( pos <= this->size() ), 
                "\tvoid sequence::add"
                << "\n\tpos must be >= 0 and <= size()" 
                << "\n\tpos: " << pos 
                << "\n\tsize(): " << this->size()
                << "\n\tthis: " << this
        );

        // call the real function
        seq_base::add(pos,item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_kernel_c<seq_base>::
    cat (
        sequence_kernel_c<seq_base>& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(&item != this, 
                "\tvoid sequence::cat"
                << "\n\tyou can't concatenate a sequence onto itself" 
                << "\n\t&item: " << &item
                << "\n\tthis:  " << this
        );

        // call the real function
        seq_base::cat(item);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_kernel_c<seq_base>::
    remove (
        unsigned long pos,
        T& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(( pos < this->size() ), 
                "\tvoid sequence::remove"
                << "\n\tpos must be >= 0 and < size()" 
                << "\n\tpos: " << pos 
                << "\n\tsize(): " << this->size()
                << "\n\tthis: " << this
        );

        // call the real function
        seq_base::remove(pos,item);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    const typename seq_base::type& sequence_kernel_c<seq_base>::
    operator[] (
        unsigned long pos
    ) const
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( pos < this->size() ), 
                "\tconst T& sequence::operator[]"
                << "\n\tpos must be >= 0 and < size()" 
                << "\n\tpos: " << pos 
                << "\n\tsize(): " << this->size()
                << "\n\tthis: " << this
        );

        // call the real function
        return seq_base::operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    typename seq_base::type& sequence_kernel_c<seq_base>::
    operator[] (
        unsigned long pos
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(( pos < this->size() ), 
                "\tT& sequence::operator[]"
                << "\n\tpos must be >= 0 and < size()" 
                << "\n\tpos: " << pos 
                << "\n\tsize(): " << this->size()
                << "\n\tthis: " << this
        );

        // call the real function
        return seq_base::operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    const typename seq_base::type& sequence_kernel_c<seq_base>::
    element (
    ) const
    {
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tconst T& sequence::element() const"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        return seq_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    typename seq_base::type& sequence_kernel_c<seq_base>::
    element (
    ) 
    {
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tT& sequence::element()"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        return seq_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_kernel_c<seq_base>::
    remove_any (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->size() > 0),
                 "\tvoid sequence::remove_any"
                 << "\n\tsize() must be greater than zero if something is going to be removed"
                 << "\n\tsize(): " << this->size() 
                 << "\n\tthis:   " << this
        );

        // call the real function
        seq_base::remove_any(item);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_KERNEl_C_

