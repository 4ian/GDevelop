// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_COMPARe_1_
#define DLIB_SEQUENCE_COMPARe_1_

#include "sequence_compare_abstract.h"

#include "../algs.h"


namespace dlib
{

    template <
        typename seq_base 
        >
    class sequence_compare_1 : public seq_base
    {
        typedef typename seq_base::type T;

    public:

        bool operator< (
            const sequence_compare_1& rhs
        ) const;

        bool operator== (
            const sequence_compare_1& rhs
        ) const;

    };


    template <
        typename seq_base
        >
    inline void swap (
        sequence_compare_1<seq_base>& a, 
        sequence_compare_1<seq_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    bool sequence_compare_1<seq_base>::
    operator< (
        const sequence_compare_1<seq_base>& rhs
    ) const
    {
        unsigned int length;
        if (this->size() < rhs.size())
            length = this->size();
        else
            length = rhs.size();

        for (unsigned long i = 0; i < length; ++i)
        {
            if ((*this)[i] < rhs[i])
                return true;
            else if ( !((*this)[i] == rhs[i]) )
                return false;
        }
        // they are equal so far
        if (this->size() < rhs.size())
            return true;
        else
            return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    bool sequence_compare_1<seq_base>::
    operator== (
        const sequence_compare_1<seq_base>& rhs
    ) const
    {
        if (this->size() != rhs.size())
            return false;

        for (unsigned long i = 0; i < this->size(); ++i)
        {
            if (!((*this)[i] == rhs[i]))
                return false;
        }
        return true;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_COMPARe_1_

