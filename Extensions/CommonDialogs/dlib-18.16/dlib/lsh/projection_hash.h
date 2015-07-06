// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PROJECTION_HASh_Hh_
#define DLIB_PROJECTION_HASh_Hh_

#include "projection_hash_abstract.h"
#include "../matrix.h"
#include "../rand.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class projection_hash
    {
    public:

        projection_hash() {}

        template <typename EXP1, typename EXP2>
        projection_hash(
            const matrix_exp<EXP1>& proj_,
            const matrix_exp<EXP2>& offset_
        ) : proj(proj_), offset(offset_) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(proj.nr() == offset.nr(),
                "\t projection_hash::projection_hash()"
                << "\n\t Invalid arguments were given to this function."
                << "\n\t proj.nr():   " << proj.nr() 
                << "\n\t offset.nr(): " << offset.nr() 
                );

        }

        const matrix<double>& get_projection_matrix (
        ) const { return proj; }

        const matrix<double,0,1>& get_offset_matrix (
        ) const { return offset; }

        unsigned long num_hash_bins (
        ) const
        {
            return static_cast<unsigned long>(std::pow(2.0, (double)offset.size()));
        }

        template <typename EXP>
        unsigned long operator() (
            const matrix_exp<EXP>& v
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(v) && 
                        v.size() == get_projection_matrix().nc() &&
                        v.size() > 0,
                "\t unsigned long projection_hash::operator()(v)"
                << "\n\t Invalid arguments were given to this function."
                << "\n\t is_col_vector(v):             " << is_col_vector(v) 
                << "\n\t get_projection_matrix().nc(): " << get_projection_matrix().nc() 
                << "\n\t v.size():                     " << v.size() 
                );

            return do_hash(proj*matrix_cast<double>(v) + offset);
        }

    private:

        template <typename EXP>
        unsigned long do_hash (
            const matrix_exp<EXP>& v
        ) const
        {
            unsigned long h = 0;
            for (long i = 0; i < v.size(); ++i)
            {
                h <<= 1;
                if (v(i) > 0)
                    h |= 1;
            }
            return h;
        }

        matrix<double> proj;
        matrix<double,0,1> offset;
    };

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const projection_hash& item,
        std::ostream& out
    )
    {
        serialize(item.get_projection_matrix(), out);
        serialize(item.get_offset_matrix(), out);
    }

    inline void deserialize (
        projection_hash& item,
        std::istream& in 
    )
    {
        matrix<double> proj;
        matrix<double,0,1> offset;
        deserialize(proj, in);
        deserialize(offset, in);
        item = projection_hash(proj, offset);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PROJECTION_HASh_Hh_

