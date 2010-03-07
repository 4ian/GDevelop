// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_EXPANd_1_
#define DLIB_ARRAY_EXPANd_1_

#include "array_expand_abstract.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_expand_1 : public array_base
    {
        typedef typename array_base::type T;

    public:

        void expand (
            unsigned long new_size
        );

        const T& back (
        ) const;

        T& back (
        );

        void pop_back (
        );

        void pop_back (
            T& item
        );

        void push_back (
            T& item
        );

    };

    template <
        typename array_base
        >
    inline void swap (
        array_expand_1<array_base>& a, 
        array_expand_1<array_base>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_1<array_base>::
    expand (
        unsigned long new_size
    )
    {
        if (this->max_size() < new_size)
        {
            array_base temp;
            temp.set_max_size(new_size);
            temp.set_size(new_size);
            for (unsigned long i = 0; i < this->size(); ++i)
            {
                exchange((*this)[i],temp[i]);
            }
            temp.swap(*this);
        }
        else
        {
            this->set_size(new_size);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    typename array_base::type& array_expand_1<array_base>::
    back (
    ) 
    {
        return (*this)[this->size()-1];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    const typename array_base::type& array_expand_1<array_base>::
    back (
    ) const
    {
        return (*this)[this->size()-1];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_1<array_base>::
    pop_back (
        typename array_base::type& item
    ) 
    {
        exchange(item,(*this)[this->size()-1]);
        this->set_size(this->size()-1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_1<array_base>::
    pop_back (
    ) 
    {
        this->set_size(this->size()-1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_1<array_base>::
    push_back (
        typename array_base::type& item
    ) 
    {
        if (this->max_size() == this->size())
        {
            // double the size of the array
            array_base temp;
            temp.set_max_size(this->size()*2 + 1);
            temp.set_size(this->size()+1);
            for (unsigned long i = 0; i < this->size(); ++i)
            {
                exchange((*this)[i],temp[i]);
            }
            exchange(item,temp[temp.size()-1]);
            temp.swap(*this);
        }
        else
        {
            this->set_size(this->size()+1);
            exchange(item,(*this)[this->size()-1]);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_EXPANd_1_

