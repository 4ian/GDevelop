// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RLS_FiLTER_Hh_
#define DLIB_RLS_FiLTER_Hh_

#include "rls_filter_abstract.h"
#include "../svm/rls.h"
#include <vector>
#include "../matrix.h"
#include "../sliding_buffer.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rls_filter
    {
        /*!
            CONVENTION
                - data.size() == the number of variables in a measurement 
                - data[i].size() == data[j].size() for all i and j.  
                - data[i].size() == get_window_size() 
                - data[i][0] == most recent measurement of i-th variable given to update.
                - data[i].back() == oldest measurement of i-th variable given to update 
                  (or zero if we haven't seen this much data yet).

                - if (count <= 2) then
                    - count == number of times update(z) has been called
        !*/
    public:

        rls_filter()
        {
            size = 5;
            count = 0;
            filter = rls(0.8, 100);
        }

        explicit rls_filter (
            unsigned long size_,
            double forget_factor = 0.8,
            double C = 100
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < forget_factor && forget_factor <= 1 &&
                        0 < C && size_ >= 2,
                "\t rls_filter::rls_filter()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t forget_factor: " << forget_factor 
                << "\n\t C:     " << C 
                << "\n\t size_: " << size_
                << "\n\t this: " << this
                );

            size = size_;
            count = 0;
            filter = rls(forget_factor, C);
        }

        double get_c(
        ) const
        {
            return filter.get_c();
        }

        double get_forget_factor(
        ) const
        {
            return filter.get_forget_factor();
        }

        unsigned long get_window_size (
        ) const
        {
            return size;
        }

        void update (
        )
        {
            if (filter.get_w().size() == 0)
                return;

            for (unsigned long i = 0; i < data.size(); ++i)
            {
                // Put old predicted value into the circular buffer as if it was 
                // the measurement we just observed.  But don't update the rls filter.
                data[i].push_front(next(i));
            }

            // predict next state
            for (long i = 0; i < next.size(); ++i)
                next(i) = filter(mat(data[i]));
        }

        template <typename EXP>
        void update (
            const matrix_exp<EXP>& z
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(z) == true &&
                        z.size() != 0 &&
                        (get_predicted_next_state().size()==0 || z.size()==get_predicted_next_state().size()),
                "\t void rls_filter::update(z)"
                << "\n\t invalid arguments were given to this function"
                << "\n\t is_col_vector(z): " << is_col_vector(z) 
                << "\n\t z.size():         " << z.size()
                << "\n\t get_predicted_next_state().size(): " << get_predicted_next_state().size()
                << "\n\t this: " << this
                );

            // initialize data if necessary 
            if (data.size() == 0)
            {
                data.resize(z.size());
                for (long i = 0; i < z.size(); ++i)
                    data[i].assign(size, 0);
            }


            for (unsigned long i = 0; i < data.size(); ++i)
            {
                // Once there is some stuff in the circular buffer, start
                // showing it to the rls filter so it can do its thing.
                if (count >= 2)
                {
                    filter.train(mat(data[i]), z(i));
                }

                // keep track of the measurements in our circular buffer
                data[i].push_front(z(i));
            }

            // Don't bother with the filter until we have seen two samples
            if (count >= 2)
            {
                // predict next state
                for (long i = 0; i < z.size(); ++i)
                    next(i) = filter(mat(data[i]));
            }
            else
            {
                // Use current measurement as the next state prediction
                // since we don't know any better at this point.
                ++count;
                next = matrix_cast<double>(z);
            }
        }

        const matrix<double,0,1>& get_predicted_next_state(
        )
        {
            return next;
        }

        friend inline void serialize(const rls_filter& item, std::ostream& out)
        {
            int version = 1;
            serialize(version, out);
            serialize(item.count, out);
            serialize(item.size, out);
            serialize(item.filter, out);
            serialize(item.next, out);
            serialize(item.data, out);
        }

        friend inline void deserialize(rls_filter& item, std::istream& in)
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw dlib::serialization_error("Unknown version number found while deserializing rls_filter object.");

            deserialize(item.count, in);
            deserialize(item.size, in);
            deserialize(item.filter, in);
            deserialize(item.next, in);
            deserialize(item.data, in);
        }

    private:

        unsigned long count;
        unsigned long size;
        rls filter;
        matrix<double,0,1> next;
        std::vector<circular_buffer<double> > data;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RLS_FiLTER_Hh_

