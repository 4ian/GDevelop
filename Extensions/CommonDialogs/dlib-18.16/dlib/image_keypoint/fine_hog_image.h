// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FINE_HOG_IMaGE_Hh_
#define DLIB_FINE_HOG_IMaGE_Hh_

#include "fine_hog_image_abstract.h"
#include "../array2d.h"
#include "../matrix.h"
#include "hog.h"


namespace dlib
{
    template <
        unsigned long cell_size_,
        unsigned long block_size_,
        unsigned long pixel_stride_,
        unsigned char num_orientation_bins_,
        int           gradient_type_
        >
    class fine_hog_image : noncopyable
    {
        COMPILE_TIME_ASSERT(cell_size_ > 1);
        COMPILE_TIME_ASSERT(block_size_ > 0);
        COMPILE_TIME_ASSERT(pixel_stride_ > 0);
        COMPILE_TIME_ASSERT(num_orientation_bins_ > 0);

        COMPILE_TIME_ASSERT( gradient_type_ == hog_signed_gradient ||
                             gradient_type_ == hog_unsigned_gradient);


    public:

        const static unsigned long cell_size = cell_size_;
        const static unsigned long block_size = block_size_;
        const static unsigned long pixel_stride = pixel_stride_;
        const static unsigned long num_orientation_bins = num_orientation_bins_;
        const static int           gradient_type = gradient_type_;

        const static long min_size = cell_size*block_size+2;

        typedef matrix<double, block_size*block_size*num_orientation_bins, 1> descriptor_type;

        fine_hog_image (
        ) : 
            num_block_rows(0),
            num_block_cols(0)
        {}

        void clear (
        )
        {
            num_block_rows = 0;
            num_block_cols = 0;
            hist_counts.clear();
        }

        void copy_configuration (
            const fine_hog_image&
        ){}

        template <
            typename image_type
            >
        inline void load (
            const image_type& img
        )
        {
            COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<image_type>::pixel_type>::has_alpha == false );
            load_impl(mat(img));
        }

        inline void unload(
        ) { clear(); }

        inline unsigned long size (
        ) const { return static_cast<unsigned long>(nr()*nc()); }

        inline long nr (
        ) const { return num_block_rows; }

        inline long nc (
        ) const { return num_block_cols; }

        long get_num_dimensions (
        ) const
        {
            return block_size*block_size*num_orientation_bins;
        }

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( 0 <= row && row < nr() &&
                         0 <= col && col < nc(),
                "\t descriptor_type fine_hog_image::operator()()"
                << "\n\t invalid row or col argument"
                << "\n\t row:  " << row
                << "\n\t col:  " << col 
                << "\n\t nr(): " << nr() 
                << "\n\t nc(): " << nc() 
                << "\n\t this: " << this
                );

            row *= pixel_stride;
            col *= pixel_stride;

            des = 0;
            unsigned long off = 0;
            for (unsigned long r = 0; r < block_size; ++r)
            {
                for (unsigned long c = 0; c < block_size; ++c)
                {
                    for (unsigned long rr = 0; rr < cell_size; ++rr)
                    {
                        for (unsigned long cc = 0; cc < cell_size; ++cc)
                        {
                            const histogram_count& hist = hist_counts[row + r*cell_size + rr][col + c*cell_size + cc];
                            des(off + hist.quantized_angle_lower) += hist.lower_strength;
                            des(off + hist.quantized_angle_upper) += hist.upper_strength;
                        }
                    }

                    off += num_orientation_bins;
                }
            }

            des /= length(des) + 1e-8;

            return des;
        }

        const rectangle get_block_rect (
            long row,
            long col
        ) const
        {
            row *= pixel_stride;
            col *= pixel_stride;

            // do this to account for the 1 pixel padding we use all around the image
            ++row;
            ++col;

            return rectangle(col, row, col+cell_size*block_size-1, row+cell_size*block_size-1);
        }

        const point image_to_feat_space (
            const point& p
        ) const
        {
            const long border_size = 1 + cell_size*block_size/2;
            return (p-point(border_size,border_size))/(long)pixel_stride;
        }

        const rectangle image_to_feat_space (
            const rectangle& rect
        ) const
        {
            return rectangle(image_to_feat_space(rect.tl_corner()), image_to_feat_space(rect.br_corner()));
        }

        const point feat_to_image_space (
            const point& p
        ) const
        {
            const long border_size = 1 + cell_size*block_size/2;
            return p*(long)pixel_stride + point(border_size,border_size);
        }

        const rectangle feat_to_image_space (
            const rectangle& rect
        ) const
        {
            return rectangle(feat_to_image_space(rect.tl_corner()), feat_to_image_space(rect.br_corner()));
        }



        // these _PRIVATE_ functions are only here as a workaround for a bug in visual studio 2005.  
        void _PRIVATE_serialize (std::ostream& out) const
        {
            // serialize hist_counts
            serialize(hist_counts.nc(),out);
            serialize(hist_counts.nr(),out);
            hist_counts.reset();
            while (hist_counts.move_next())
                hist_counts.element().serialize(out);
            hist_counts.reset();


            serialize(num_block_rows, out);
            serialize(num_block_cols, out);
        }

        void _PRIVATE_deserialize (std::istream& in )
        {
            // deserialize item.hist_counts
            long nc, nr;
            deserialize(nc,in);
            deserialize(nr,in);
            hist_counts.set_size(nr,nc);
            while (hist_counts.move_next())
                hist_counts.element().deserialize(in); 
            hist_counts.reset();


            deserialize(num_block_rows, in);
            deserialize(num_block_cols, in);
        }

    private:

        template <
            typename image_type
            >
        void load_impl (
            const image_type& img
        )
        {
            // Note that we keep a border of 1 pixel all around the image so that we don't have
            // to worry about running outside the image when computing the horizontal and vertical 
            // gradients.



            // check if the window is just too small
            if (img.nr() < min_size || img.nc() < min_size)
            {
                // If the image is smaller than our windows then there aren't any descriptors at all!
                num_block_rows = 0;
                num_block_cols = 0;
                hist_counts.clear();
                return;
            }

            hist_counts.set_size(img.nr()-2, img.nc()-2);




            for (long r = 0; r < hist_counts.nr(); ++r)
            {
                for (long c = 0; c < hist_counts.nc(); ++c)
                {
                    unsigned long left; 
                    unsigned long right;
                    unsigned long top;   
                    unsigned long bottom; 

                    assign_pixel(left,   img(r+1,c));
                    assign_pixel(right,  img(r+1,c+2));
                    assign_pixel(top,    img(r  ,c+1));
                    assign_pixel(bottom, img(r+2,c+1));

                    double grad_x = (long)right-(long)left;
                    double grad_y = (long)top-(long)bottom;

                    // obtain the angle of the gradient.  Make sure it is scaled between 0 and 1.
                    double angle = std::max(0.0, std::atan2(grad_y, grad_x)/pi + 1)/2;


                    if (gradient_type == hog_unsigned_gradient)
                    {
                        angle *= 2;
                        if (angle >= 1)
                            angle -= 1;
                    }


                    // now scale angle to between 0 and num_orientation_bins
                    angle *= num_orientation_bins;


                    const double strength = std::sqrt(grad_y*grad_y + grad_x*grad_x);


                    unsigned char quantized_angle_lower = static_cast<unsigned char>(std::floor(angle));
                    unsigned char quantized_angle_upper = static_cast<unsigned char>(std::ceil(angle));

                    quantized_angle_lower %= num_orientation_bins;
                    quantized_angle_upper %= num_orientation_bins;

                    const double angle_split = (angle-std::floor(angle));
                    const double upper_strength = angle_split*strength;
                    const double lower_strength = (1-angle_split)*strength;

                    // Stick into gradient counts.  Note that we linearly interpolate between neighboring
                    // histogram buckets.
                    hist_counts[r][c].quantized_angle_lower = quantized_angle_lower;
                    hist_counts[r][c].quantized_angle_upper = quantized_angle_upper;
                    hist_counts[r][c].lower_strength = lower_strength;
                    hist_counts[r][c].upper_strength = upper_strength;

                }
            }


            // Now figure out how many feature extraction blocks we should have.  
            num_block_rows = (hist_counts.nr() - block_size*cell_size + 1)/(long)pixel_stride; 
            num_block_cols = (hist_counts.nc() - block_size*cell_size + 1)/(long)pixel_stride; 

        }

        struct histogram_count
        {
            unsigned char quantized_angle_lower;
            unsigned char quantized_angle_upper;
            float lower_strength;
            float upper_strength;

            void serialize(std::ostream& out) const
            {
                dlib::serialize(quantized_angle_lower, out);
                dlib::serialize(quantized_angle_upper, out);
                dlib::serialize(lower_strength, out);
                dlib::serialize(upper_strength, out);
            }
            void deserialize(std::istream& in) 
            {
                dlib::deserialize(quantized_angle_lower, in);
                dlib::deserialize(quantized_angle_upper, in);
                dlib::deserialize(lower_strength, in);
                dlib::deserialize(upper_strength, in);
            }
        };

        array2d<histogram_count> hist_counts;

        mutable descriptor_type des;

        long num_block_rows;
        long num_block_cols;


    };

// ----------------------------------------------------------------------------------------

    template <
        unsigned long T1,
        unsigned long T2,
        unsigned long T3,
        unsigned char T4,
        int           T5
        >
    void serialize (
        const fine_hog_image<T1,T2,T3,T4,T5>& item,
        std::ostream& out
    )
    {
        item._PRIVATE_serialize(out);
    }

    template <
        unsigned long T1,
        unsigned long T2,
        unsigned long T3,
        unsigned char T4,
        int           T5
        >
    void deserialize (
        fine_hog_image<T1,T2,T3,T4,T5>& item,
        std::istream& in 
    )
    {
        item._PRIVATE_deserialize(in);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FINE_HOG_IMaGE_Hh_

