// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_READ_FROM_ISTREAM_H_h_
#define DLIB_MATRIx_READ_FROM_ISTREAM_H_h_

#include "matrix.h"
#include <vector>
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline bool next_is_whitespace (
            std::istream& in
        )
        {
            return in.peek() == '\n' ||
                in.peek() == ' ' || 
                in.peek() == ',' || 
                in.peek() == '\t' ||
                in.peek() == '\r';
        }
    }

    template <typename T, long NR, long NC, typename MM, typename L>
    std::istream& operator>> (
        std::istream& in,
        matrix<T,NR,NC,MM,L>& m
    )
    {
        using namespace dlib::impl;
        long num_rows = 0;
        std::vector<T> buf;
        buf.reserve(100);

        // eat any leading whitespace
        while (next_is_whitespace(in))
            in.get();

        bool at_start_of_line = true;
        bool stop = false;
        while(!stop && in.peek() != EOF)
        {
            T temp;
            in >> temp;
            if (!in)
                return in;

            buf.push_back(temp);
            if (at_start_of_line)
            {
                at_start_of_line = false;
                ++num_rows;
            }

            // Eat next block of whitespace but also note if we hit the start of the next
            // line. 
            while (next_is_whitespace(in))
            {
                if (at_start_of_line && in.peek() == '\n')
                {
                    stop = true;
                    break;
                }

                if (in.get() == '\n')
                    at_start_of_line = true;
            }
        }

        // It's an error for there to not be any matrix data in the input stream
        if (num_rows == 0)
        {
            in.clear(in.rdstate() | std::ios::failbit);
            return in;
        }

        const long num_cols = buf.size()/num_rows;
        // It's also an error if the sizes don't make sense.
        if (num_rows*num_cols != (long)buf.size() ||
            (NR != 0 && NR != num_rows) ||
            (NC != 0 && NC != num_cols))
        {
            in.clear(in.rdstate() | std::ios::failbit);
            return in;
        }


        m = reshape(mat(buf),num_rows, buf.size()/num_rows);

        if (in.eof())
        {
            // Clear the eof and fail bits since this is caused by peeking at the EOF.
            // But in the current case, we have successfully read the matrix.
            in.clear(in.rdstate() & (~(std::ios::eofbit | std::ios::failbit)));
        }
        return in;
    }
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_MATRIx_READ_FROM_ISTREAM_H_h_

