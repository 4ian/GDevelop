// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HESSIAN_PYRAMId_Hh_
#define DLIB_HESSIAN_PYRAMId_Hh_

#include "hessian_pyramid_abstract.h"
#include "../algs.h"
#include "../image_transforms/integral_image.h"
#include "../array.h"
#include "../array2d.h"
#include "../noncopyable.h"
#include "../matrix.h"
#include "../stl_checked.h"
#include <algorithm>
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct interest_point
    {
        interest_point() : scale(0), score(0), laplacian(0) {}

        dlib::vector<double,2> center;
        double scale;
        double score;
        double laplacian;

        bool operator < (const interest_point& p) const { return score < p.score; }
    };

// ----------------------------------------------------------------------------------------

    inline void serialize(
        const interest_point& item,  
        std::ostream& out
    )
    {
        try
        {
            serialize(item.center,out);
            serialize(item.scale,out);
            serialize(item.score,out);
            serialize(item.laplacian,out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type interest_point"); 
        }
    }

// ----------------------------------------------------------------------------------------

    inline void deserialize(
        interest_point& item,  
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.center,in);
            deserialize(item.scale,in);
            deserialize(item.score,in);
            deserialize(item.laplacian,in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type interest_point"); 
        }
    }

// ----------------------------------------------------------------------------------------

    class hessian_pyramid : noncopyable
    {
    public:
        hessian_pyramid()
        {
            num_octaves = 0;
            num_intervals = 0;
            initial_step_size = 0;
        }

        template <typename integral_image_type>
        void build_pyramid (
            const integral_image_type& img,
            long num_octaves,
            long num_intervals,
            long initial_step_size
        )
        {
            DLIB_ASSERT(num_octaves > 0 && num_intervals > 0 && initial_step_size > 0,
                "\tvoid build_pyramid()"
                << "\n\tAll arguments to this function must be > 0"
                << "\n\t this:              " << this
                << "\n\t num_octaves:       " << num_octaves 
                << "\n\t num_intervals:     " << num_intervals 
                << "\n\t initial_step_size: " << initial_step_size 
            );

            this->num_octaves = num_octaves;
            this->num_intervals = num_intervals;
            this->initial_step_size = initial_step_size;

            // allocate space for the pyramid
            pyramid.resize(num_octaves*num_intervals);
            for (long o = 0; o < num_octaves; ++o)
            {
                const long step_size = get_step_size(o);
                for (long i = 0; i < num_intervals; ++i)
                {
                    pyramid[num_intervals*o + i].set_size(img.nr()/step_size, img.nc()/step_size);
                }
            }

            // now fill out the pyramid with data
            for (long o = 0; o < num_octaves; ++o)
            {
                const long step_size = get_step_size(o);

                for (long i = 0; i < num_intervals; ++i)
                {
                    const long border_size = get_border_size(i)*step_size;
                    const long lobe_size = static_cast<long>(std::pow(2.0, o+1.0)+0.5)*(i+1) + 1;
                    const double area_inv = 1.0/std::pow(3.0*lobe_size, 2.0);

                    const long lobe_offset = lobe_size/2+1;
                    const point tl(-lobe_offset,-lobe_offset);
                    const point tr(lobe_offset,-lobe_offset);
                    const point bl(-lobe_offset,lobe_offset);
                    const point br(lobe_offset,lobe_offset);

                    for (long r = border_size; r < img.nr() - border_size; r += step_size)
                    {
                        for (long c = border_size; c < img.nc() - border_size; c += step_size)
                        {
                            const point p(c,r);

                            double Dxx = img.get_sum_of_area(centered_rect(p, lobe_size*3, 2*lobe_size-1)) - 
                                         img.get_sum_of_area(centered_rect(p, lobe_size,   2*lobe_size-1))*3.0;

                            double Dyy = img.get_sum_of_area(centered_rect(p, 2*lobe_size-1, lobe_size*3)) - 
                                         img.get_sum_of_area(centered_rect(p, 2*lobe_size-1, lobe_size))*3.0;

                            double Dxy = img.get_sum_of_area(centered_rect(p+bl, lobe_size, lobe_size)) + 
                                         img.get_sum_of_area(centered_rect(p+tr, lobe_size, lobe_size)) -
                                         img.get_sum_of_area(centered_rect(p+tl, lobe_size, lobe_size)) -
                                         img.get_sum_of_area(centered_rect(p+br, lobe_size, lobe_size));

                            // now we normalize the filter responses
                            Dxx *= area_inv;
                            Dyy *= area_inv;
                            Dxy *= area_inv;


                            double sign_of_laplacian = +1;
                            if (Dxx + Dyy < 0)
                                sign_of_laplacian = -1;

                            double determinant = Dxx*Dyy - 0.81*Dxy*Dxy;

                            // If the determinant is negative then just blank it out by setting
                            // it to zero.
                            if (determinant < 0)
                                determinant = 0;

                            // Save the determinant of the Hessian into our image pyramid.  Also
                            // pack the laplacian sign into the value so we can get it out later.
                            pyramid[o*num_intervals + i][r/step_size][c/step_size] = sign_of_laplacian*determinant;

                        }
                    }

                }
            }
        }

        long get_border_size (
            long interval 
        ) const
        {
            DLIB_ASSERT(0 <= interval && interval < intervals(),
                "\tlong get_border_size(interval)"
                << "\n\tInvalid interval value"
                << "\n\t this:   " << this
                << "\n\t interval: " << interval 
            );

            const double lobe_size = 2.0*(interval+1) + 1;
            const double filter_size = 3*lobe_size;

            const long bs = static_cast<long>(std::ceil(filter_size/2.0));
            return bs;
        }

        long get_step_size (
            long octave
        ) const
        {
            DLIB_ASSERT(0 <= octave && octave < octaves(),
                "\tlong get_step_size(octave)"
                << "\n\tInvalid octave value"
                << "\n\t this:   " << this
                << "\n\t octave: " << octave 
            );

            return initial_step_size*static_cast<long>(std::pow(2.0, (double)octave)+0.5);
        }

        long nr (
            long octave
        ) const
        {
            DLIB_ASSERT(0 <= octave && octave < octaves(),
                "\tlong nr(octave)"
                << "\n\tInvalid octave value"
                << "\n\t this:   " << this
                << "\n\t octave: " << octave 
            );

            return pyramid[num_intervals*octave].nr();
        }

        long nc (
            long octave
        ) const
        {
            DLIB_ASSERT(0 <= octave && octave < octaves(),
                "\tlong nc(octave)"
                << "\n\tInvalid octave value"
                << "\n\t this:   " << this
                << "\n\t octave: " << octave 
            );

            return pyramid[num_intervals*octave].nc();
        }

        double get_value (
            long octave,
            long interval,
            long r,
            long c
        ) const
        {
            DLIB_ASSERT(0 <= octave && octave < octaves() &&
                        0 <= interval && interval < intervals() &&
                        get_border_size(interval) <= r && r < nr(octave)-get_border_size(interval) &&
                        get_border_size(interval) <= c && c < nc(octave)-get_border_size(interval),
                "\tdouble get_value(octave, interval, r, c)"
                << "\n\tInvalid inputs to this function"
                << "\n\t this:      " << this
                << "\n\t octave:    " << octave 
                << "\n\t interval:  " << interval 
                << "\n\t octaves:   " << octaves() 
                << "\n\t intervals: " << intervals()
                << "\n\t r:         " << r  
                << "\n\t c:         " << c 
                << "\n\t nr(octave): " << nr(octave)  
                << "\n\t nc(octave): " << nc(octave) 
                << "\n\t get_border_size(interval): " << get_border_size(interval) 
            );

            return std::abs(pyramid[num_intervals*octave + interval][r][c]);
        }

        double get_laplacian (
            long octave,
            long interval,
            long r,
            long c
        ) const
        {
            DLIB_ASSERT(0 <= octave && octave < octaves() &&
                        0 <= interval && interval < intervals() &&
                        get_border_size(interval) <= r && r < nr(octave)-get_border_size(interval) &&
                        get_border_size(interval) <= c && c < nc(octave)-get_border_size(interval),
                "\tdouble get_laplacian(octave, interval, r, c)"
                << "\n\tInvalid inputs to this function"
                << "\n\t this:      " << this
                << "\n\t octave:    " << octave 
                << "\n\t interval:  " << interval 
                << "\n\t octaves:   " << octaves() 
                << "\n\t intervals: " << intervals()
                << "\n\t r:         " << r  
                << "\n\t c:         " << c 
                << "\n\t nr(octave): " << nr(octave)  
                << "\n\t nc(octave): " << nc(octave) 
                << "\n\t get_border_size(interval): " << get_border_size(interval) 
            );

            // return the sign of the laplacian
            if (pyramid[num_intervals*octave + interval][r][c] > 0)
                return +1;
            else
                return -1;
        }

        long octaves (
        ) const { return num_octaves; }

        long intervals (
        ) const { return num_intervals; }

    private:

        long num_octaves;
        long num_intervals;
        long initial_step_size;

        typedef array2d<double> image_type;
        typedef array<image_type> pyramid_type;

        pyramid_type pyramid;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace hessian_pyramid_helpers
    {
        inline bool is_maximum_in_region(
            const hessian_pyramid& pyr,
            long o, 
            long i, 
            long r, 
            long c
        )
        {
            // First check if this point is near the edge of the octave 
            // If it is then we say it isn't a maximum as these points are
            // not as reliable.
            if (i <= 0 || i+1 >= pyr.intervals())
            {
                return false;
            }

            const double val = pyr.get_value(o,i,r,c);

            // now check if there are any bigger values around this guy
            for (long ii = i-1; ii <= i+1; ++ii)
            {
                for (long rr = r-1; rr <= r+1; ++rr)
                {
                    for (long cc = c-1; cc <= c+1; ++cc)
                    {
                        if (pyr.get_value(o,ii,rr,cc) > val)
                            return false;
                    }
                }
            }

            return true;
        }

    // ------------------------------------------------------------------------------------

        inline const matrix<double,3,1> get_hessian_gradient (
            const hessian_pyramid& pyr,
            long o, 
            long i, 
            long r, 
            long c
        )
        {
            matrix<double,3,1> grad;
            grad(0) = (pyr.get_value(o,i,r,c+1) - pyr.get_value(o,i,r,c-1))/2.0;
            grad(1) = (pyr.get_value(o,i,r+1,c) - pyr.get_value(o,i,r-1,c))/2.0;
            grad(2) = (pyr.get_value(o,i+1,r,c) - pyr.get_value(o,i-1,r,c))/2.0;
            return grad;
        }

    // ------------------------------------------------------------------------------------

        inline const matrix<double,3,3> get_hessian_hessian (
            const hessian_pyramid& pyr,
            long o, 
            long i, 
            long r, 
            long c
        )
        {
            matrix<double,3,3> hess;
            const double val = pyr.get_value(o,i,r,c);

            double Dxx = (pyr.get_value(o,i,r,c+1) + pyr.get_value(o,i,r,c-1)) - 2*val;
            double Dyy = (pyr.get_value(o,i,r+1,c) + pyr.get_value(o,i,r-1,c)) - 2*val;
            double Dss = (pyr.get_value(o,i+1,r,c) + pyr.get_value(o,i-1,r,c)) - 2*val;

            double Dxy = (pyr.get_value(o,i,r+1,c+1) + pyr.get_value(o,i,r-1,c-1) -
                          pyr.get_value(o,i,r-1,c+1) - pyr.get_value(o,i,r+1,c-1)) / 4.0;

            double Dxs = (pyr.get_value(o,i+1,r,c+1) + pyr.get_value(o,i-1,r,c-1) -
                          pyr.get_value(o,i-1,r,c+1) - pyr.get_value(o,i+1,r,c-1)) / 4.0;

            double Dys = (pyr.get_value(o,i+1,r+1,c) + pyr.get_value(o,i-1,r-1,c) -
                          pyr.get_value(o,i-1,r+1,c) - pyr.get_value(o,i+1,r-1,c)) / 4.0;


            hess = Dxx, Dxy, Dxs,
            Dxy, Dyy, Dys,
            Dxs, Dys, Dss;

            return hess;
        }

    // ------------------------------------------------------------------------------------

        inline const interest_point interpolate_point (
            const hessian_pyramid& pyr, 
            long o, 
            long i, 
            long r, 
            long c
        )
        {
            dlib::vector<double,2> p(c,r);

            dlib::vector<double,3> start_point(c,r,i);
            dlib::vector<double,3> interpolated_point = -inv(get_hessian_hessian(pyr,o,i,r,c))*get_hessian_gradient(pyr,o,i,r,c);

            //cout << "inter: " <<  trans(interpolated_point);

            interest_point temp;
            if (max(abs(interpolated_point)) < 0.5)
            {
                p = (start_point+interpolated_point)*pyr.get_step_size(o);
                const double lobe_size = std::pow(2.0, o+1.0)*(i+interpolated_point.z()+1) + 1;
                const double filter_size = 3*lobe_size;
                const double scale = 1.2/9.0 * filter_size;

                temp.center = p;
                temp.scale = scale;
                temp.score = pyr.get_value(o,i,r,c);
                temp.laplacian = pyr.get_laplacian(o,i,r,c);
            }
            else
            {
                // this indicates to the caller that no interest point was found.
                temp.score = -1;
            }

            return temp;
        }

    }

// ----------------------------------------------------------------------------------------

    template <typename Alloc>
    void get_interest_points (
        const hessian_pyramid& pyr,
        double threshold,
        std::vector<interest_point,Alloc>& result_points
    )
    {
        DLIB_ASSERT(threshold >= 0,
            "\tvoid get_interest_points()"
            << "\n\t Invalid arguments to this function"
            << "\n\t threshold: " << threshold 
        );
        using namespace std;
        using namespace hessian_pyramid_helpers;

        result_points.clear();

        for (long o = 0; o < pyr.octaves(); ++o)
        {
            const long nr = pyr.nr(o);
            const long nc = pyr.nc(o);

            // do non-maximum suppression on all the intervals in the current octave and 
            // accumulate the results in result_points
            for (long i = 1; i < pyr.intervals()-1;  i += 1)
            {
                const long border_size = pyr.get_border_size(i+1);
                for (long r = border_size+1; r < nr - border_size-1; r += 1)
                {
                    for (long c = border_size+1; c < nc - border_size-1; c += 1)
                    {
                        double max_val = pyr.get_value(o,i,r,c);
                        long max_i = i;
                        long max_r = r;
                        long max_c = c;


                        // If the max point we found is really a maximum in its own region and
                        // is big enough then add it to the results.
                        if (max_val >= threshold && is_maximum_in_region(pyr, o, max_i, max_r, max_c))
                        {
                            //cout << max_val << endl;
                            interest_point sp = interpolate_point (pyr, o, max_i, max_r, max_c);
                            if (sp.score >= threshold)
                            {
                                result_points.push_back(sp);
                            }
                        }

                    }
                }
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <typename Alloc>
    void get_interest_points (
        const hessian_pyramid& pyr,
        double threshold,
        std_vector_c<interest_point,Alloc>& result_points
    )
    /*!
        This function is just an overload that automatically casts std_vector_c objects
        into std::vector objects.  (Usually this is automatic but the template argument
        there messes up the conversion so we have to do it explicitly)
    !*/
    {
        std::vector<interest_point,Alloc>& v = result_points;
        get_interest_points(pyr, threshold, v);
    }

// ----------------------------------------------------------------------------------------

}

#endif  // DLIB_HESSIAN_PYRAMId_Hh_

