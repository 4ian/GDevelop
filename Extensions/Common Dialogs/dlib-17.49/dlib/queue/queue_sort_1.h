// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUEUE_SORt_1_
#define DLIB_QUEUE_SORt_1_

#include "queue_sort_abstract.h"
#include "../algs.h"
#include <vector>
#include "../sort.h"

namespace dlib
{

    template <
        typename queue_base 
        >
    class queue_sort_1 : public queue_base
    {
        typedef typename queue_base::type T;

        public:

            /*!
                This implementation uses the QuickSort algorithm and
                when the quicksort depth goes too high it uses the dlib::qsort_array()
                function on the data.
            !*/

            void sort (
            );

            template <typename compare_type>
            void sort (
                const compare_type& compare
            )
            {
                if (this->size() > 1)
                {
                    sort_this_queue(*this,0,compare);
                }
            }

        private:

            template <typename compare_type>
            void sort_this_queue (
                queue_base& queue,
                long depth,
                const compare_type& compare
            )
            /*!
                ensures
                    each element in the queue is < the element behind it according
                    to compare
            !*/
            {
                if (queue.size() <= 1)
                {
                    // already sorted
                }
                else if (queue.size() <= 29)
                {
                    T vect[29];
                    const unsigned long size = queue.size();
                    for (unsigned long i = 0; i < size; ++i)
                    {
                        queue.dequeue(vect[i]);
                    }
                    isort_array(vect,0,size-1,compare);
                    for (unsigned long i = 0; i < size; ++i)
                    {
                        queue.enqueue(vect[i]);
                    }
                }
                else if (depth > 50)
                {
                    std::vector<T> vect(queue.size());
                    for (unsigned long i = 0; i < vect.size(); ++i)
                    {
                        queue.dequeue(vect[i]);
                    }
                    hsort_array(vect,0,vect.size()-1,compare);
                    for (unsigned long i = 0; i < vect.size(); ++i)
                    {
                        queue.enqueue(vect[i]);
                    }
                }
                else
                {
                    queue_base left, right;
                    T partition_element;
                    T temp;
                    // do this just to avoid a compiler warning
                    assign_zero_if_built_in_scalar_type(temp);
                    assign_zero_if_built_in_scalar_type(partition_element);

                    queue.dequeue(partition_element);

                    // partition queue into left and right
                    while (queue.size() > 0)
                    {
                        queue.dequeue(temp);
                        if (compare(temp , partition_element))
                        {
                            left.enqueue(temp);
                        }
                        else
                        {
                            right.enqueue(temp);
                        }
                    }


                    long ratio;
                    if (left.size() > right.size())
                        ratio = left.size()/(right.size()+1);  // add 1 so we can't divide by zero
                    else
                        ratio = right.size()/(left.size()+1);

                    sort_this_queue(left,ratio+depth,compare);
                    sort_this_queue(right,ratio+depth,compare);

                    // combine the two queues
                    left.swap(queue);
                    queue.enqueue(partition_element);
                    queue.cat(right);
                }
            }


    };

    template <
        typename queue_base
        >
    inline void swap (
        queue_sort_1<queue_base>& a, 
        queue_sort_1<queue_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    void queue_sort_1<queue_base>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            sort_this_queue(*this,0,std::less<typename queue_base::type>());
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUEUE_SORt_1_

