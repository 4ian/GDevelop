// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_SORt_1_
#define DLIB_SEQUENCE_SORt_1_

#include "sequence_sort_abstract.h"
#include "../algs.h"

namespace dlib
{

    template <
        typename seq_base 
        >
    class sequence_sort_1 : public seq_base
    {
        typedef typename seq_base::type T;

    public:

        /*!
            this is a median of three version of the QuickSort algorithm and
            it sorts sequences of less than 30 elements with a selection sort
        !*/

        void sort (
        );

    private:

        void sort_this_sequence (
            seq_base& sequence
        );
        /*!
            ensures
                - each element in the sequence is < the element behind it
        !*/

        void selection_sort (
            seq_base& sequence
        );
        /*!
            ensures
                - sequence is sorted with a selection_sort
        !*/


    };


    template <
        typename seq_base
        >
    inline void swap (
        sequence_sort_1<seq_base>& a, 
        sequence_sort_1<seq_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_sort_1<seq_base>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            sort_this_sequence(*this);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_sort_1<seq_base>::
    sort_this_sequence (
        seq_base& sequence
    )
    {
        if (sequence.size() < 30)
        {
            selection_sort(sequence);
        }
        else 
        {
            seq_base left, right;
            T partition_element;

            sequence.remove(0,partition_element);

            dlib::median (
                partition_element,
                sequence[sequence.size()-1],
                sequence[(sequence.size()-1)/2]
            );

            // partition sequence into left and right
            T temp;
            while (sequence.size() > 0)
            {
                sequence.remove(0,temp);
                if (temp < partition_element)
                {
                    left.add(0,temp);
                }
                else
                {
                    right.add(0,temp);
                }
            }

            sort_this_sequence(left);
            sort_this_sequence(right);

            // combine left and right into sequence
            left.swap(sequence);
            sequence.add(sequence.size(),partition_element);
            sequence.cat(right);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_sort_1<seq_base>::
    selection_sort (
        seq_base& sequence
    )
    {
        if (sequence.size() > 2)
        {
            T temp[29];
            unsigned long ssize = sequence.size();

            for (unsigned long i = 0; i < ssize; ++i)
                sequence.remove(0,temp[i]);

            unsigned long smallest;
            for (unsigned long i = 0; i < ssize - 1; ++i)
            {    
                // find smallest element and swap into i
                smallest = i;
                for (unsigned long j = i+1; j < ssize; ++j)
                {
                    if (temp[j] < temp[smallest])
                        smallest = j;
                }
                exchange(temp[smallest],temp[i]);
            }

            for (unsigned long i = 0; i < ssize; ++i)
                sequence.add(i,temp[i]);
        }
        else if (sequence.size() == 2)
        {
            if (sequence[1] < sequence[0])
            {
                exchange(sequence[0],sequence[1]);
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_SORt_1_

