// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LBP_Hh_
#define DLIB_LBP_Hh_

#include "lbp_abstract.h"
#include "../image_processing/generic_image.h"
#include "assign_image.h"
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename image_type2
        >
    void make_uniform_lbp_image (
        const image_type& img_,
        image_type2& lbp_
    )
    {
        const static unsigned char uniform_lbps[] = {
            0, 1, 2, 3, 4, 58, 5, 6, 7, 58, 58, 58, 8, 58, 9, 10, 11, 58, 58, 58, 58, 58,
            58, 58, 12, 58, 58, 58, 13, 58, 14, 15, 16, 58, 58, 58, 58, 58, 58, 58, 58, 58,
            58, 58, 58, 58, 58, 58, 17, 58, 58, 58, 58, 58, 58, 58, 18, 58, 58, 58, 19, 58,
            20, 21, 22, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58,
            58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 23, 58, 58, 58, 58, 58,
            58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 24, 58, 58, 58, 58, 58, 58, 58, 25, 58,
            58, 58, 26, 58, 27, 28, 29, 30, 58, 31, 58, 58, 58, 32, 58, 58, 58, 58, 58, 58,
            58, 33, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 34, 58, 58,
            58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58,
            58, 58, 58, 58, 58, 58, 58, 58, 58, 35, 36, 37, 58, 38, 58, 58, 58, 39, 58, 58,
            58, 58, 58, 58, 58, 40, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58,
            58, 41, 42, 43, 58, 44, 58, 58, 58, 45, 58, 58, 58, 58, 58, 58, 58, 46, 47, 48,
            58, 49, 58, 58, 58, 50, 51, 52, 58, 53, 54, 55, 56, 57
        };

        COMPILE_TIME_ASSERT(sizeof(uniform_lbps) == 256);

        const_image_view<image_type> img(img_);
        image_view<image_type2> lbp(lbp_);

        lbp.set_size(img.nr(), img.nc());

        // set all the border pixels to the "non-uniform LBP value".
        assign_border_pixels(lbp, 1, 1, 58);

        typedef typename image_traits<image_type>::pixel_type pixel_type;
        typedef typename pixel_traits<pixel_type>::basic_pixel_type basic_pixel_type;

        for (long r = 1; r+1 < img.nr(); ++r)
        {
            for (long c = 1; c+1 < img.nc(); ++c)
            {
                const basic_pixel_type pix = get_pixel_intensity(img[r][c]);
                unsigned char b1 = 0;
                unsigned char b2 = 0;
                unsigned char b3 = 0;
                unsigned char b4 = 0;
                unsigned char b5 = 0;
                unsigned char b6 = 0;
                unsigned char b7 = 0;
                unsigned char b8 = 0;

                unsigned char x = 0;
                if (get_pixel_intensity(img[r-1][c-1]) > pix) b1 = 0x80; 
                if (get_pixel_intensity(img[r-1][c  ]) > pix) b2 = 0x40;
                if (get_pixel_intensity(img[r-1][c+1]) > pix) b3 = 0x20;
                x |= b1;
                if (get_pixel_intensity(img[r  ][c-1]) > pix) b4 = 0x10;
                x |= b2;
                if (get_pixel_intensity(img[r  ][c+1]) > pix) b5 = 0x08;
                x |= b3;
                if (get_pixel_intensity(img[r+1][c-1]) > pix) b6 = 0x04;
                x |= b4;
                if (get_pixel_intensity(img[r+1][c  ]) > pix) b7 = 0x02;
                x |= b5;
                if (get_pixel_intensity(img[r+1][c+1]) > pix) b8 = 0x01;

                x |= b6;
                x |= b7;
                x |= b8;

                lbp[r][c] = uniform_lbps[x];
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_histogram_descriptors (
        const image_type& img_,
        const point& loc,
        std::vector<T>& histograms,
        const unsigned int cell_size = 10,
        const unsigned int block_size = 4,
        const unsigned int max_val = 58
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(cell_size >= 1 && block_size >= 1 && max_val < 256 && 
                    (unsigned int)max(mat(img_)) <= max_val,
            "\t void extract_histogram_descriptors()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t cell_size:      " << cell_size
            << "\n\t block_size:     " << block_size
            << "\n\t max_val:        " << max_val
            << "\n\t max(mat(img_)): " << max(mat(img_))
            );

        typedef typename image_traits<image_type>::pixel_type pixel_type;
        COMPILE_TIME_ASSERT((is_same_type<pixel_type, unsigned char>::value));

        const_image_view<image_type> img(img_);

        const rectangle area = get_rect(img);
        const rectangle window = centered_rect(loc, block_size*cell_size, block_size*cell_size);
        unsigned int cell_top = window.top();
        for (unsigned int br = 0; br < block_size; ++br)
        {
            unsigned int cell_left = window.left();
            for (unsigned int bc = 0; bc < block_size; ++bc)
            {
                // figure out the cell boundaries
                rectangle cell(cell_left, cell_top, cell_left+cell_size-1, cell_top+cell_size-1);
                cell = cell.intersect(area);

                // make the actual histogram for this cell
                unsigned int hist[256] = {0};
                for (long r = cell.top(); r <= cell.bottom(); ++r)
                {
                    for (long c = cell.left(); c <= cell.right(); ++c)
                    {
                        hist[img[r][c]]++;
                    }
                }

                // copy histogram into the output.
                histograms.insert(histograms.end(), hist, hist + max_val+1);

                cell_left += cell_size;
            }
            cell_top += cell_size;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_uniform_lbp_descriptors (
        const image_type& img,
        std::vector<T>& feats,
        const unsigned int cell_size = 10
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(cell_size >= 1,
            "\t void extract_uniform_lbp_descriptors()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t cell_size:      " << cell_size
            );

        feats.clear();
        array2d<unsigned char> lbp;
        make_uniform_lbp_image(img, lbp);
        for (long r = 0; r < lbp.nr(); r+=cell_size)
        {
            for (long c = 0; c < lbp.nc(); c+=cell_size)
            {
                const rectangle cell = rectangle(c,r,c+cell_size-1,r+cell_size-1).intersect(get_rect(lbp));
                // make the actual histogram for this cell
                unsigned int hist[59] = {0};
                for (long r = cell.top(); r <= cell.bottom(); ++r)
                {
                    for (long c = cell.left(); c <= cell.right(); ++c)
                    {
                        hist[lbp[r][c]]++;
                    }
                }

                // copy histogram into the output.
                feats.insert(feats.end(), hist, hist + 59);
            }
        }

        for (unsigned long i = 0; i < feats.size(); ++i)
            feats[i] = std::sqrt(feats[i]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename T
        >
    void extract_highdim_face_lbp_descriptors (
        const image_type& img,
        const full_object_detection& det,
        std::vector<T>& feats
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(det.num_parts() == 68,
            "\t void extract_highdim_face_lbp_descriptors()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t det.num_parts(): " << det.num_parts()
            );

        const unsigned long num_scales = 5; 
        feats.clear();
        dlib::vector<double,2> l, r;
        double cnt = 0;
        // Find the center of the left eye by averaging the points around 
        // the eye.
        for (unsigned long i = 36; i <= 41; ++i) 
        {
            l += det.part(i);
            ++cnt;
        }
        l /= cnt;

        // Find the center of the right eye by averaging the points around 
        // the eye.
        cnt = 0;
        for (unsigned long i = 42; i <= 47; ++i) 
        {
            r += det.part(i);
            ++cnt;
        }
        r /= cnt;

        // We only do feature extraction from these face parts.  These are things like the
        // corners of the eyes and mouth and stuff like that.
        std::vector<point> parts;
        parts.reserve(30);
        parts.push_back(l);
        parts.push_back(r);
        parts.push_back(det.part(17));
        parts.push_back(det.part(21));
        parts.push_back(det.part(22));
        parts.push_back(det.part(28));
        parts.push_back(det.part(36));
        parts.push_back(det.part(39));
        parts.push_back(det.part(42));
        parts.push_back(det.part(45));
        parts.push_back(det.part(27));
        parts.push_back(det.part(28));
        parts.push_back(det.part(29));
        parts.push_back(det.part(30));
        parts.push_back(det.part(31));
        parts.push_back(det.part(35));
        parts.push_back(det.part(33));
        parts.push_back(det.part(48));
        parts.push_back(det.part(54));
        parts.push_back(det.part(51));
        parts.push_back(det.part(57));

        array2d<unsigned char> lbp;
        make_uniform_lbp_image(img, lbp);
        for (unsigned long i = 0; i < parts.size(); ++i)
            extract_histogram_descriptors(lbp, parts[i], feats);

        if (num_scales > 1)
        {
            pyramid_down<4> pyr;
            image_type img_temp;
            pyr(img, img_temp);
            unsigned long num_pyr_calls = 1;

            // now pull the features out at coarser scales
            for (unsigned long iter = 1; iter < num_scales; ++iter)
            {
                // now do the feature extraction
                make_uniform_lbp_image(img_temp, lbp);
                for (unsigned long i = 0; i < parts.size(); ++i)
                    extract_histogram_descriptors(lbp, pyr.point_down(parts[i],num_pyr_calls), feats);

                if (iter+1 < num_scales)
                {
                    pyr(img_temp);
                    ++num_pyr_calls;
                }
            }
        }

        for (unsigned long i = 0; i < feats.size(); ++i)
            feats[i] = std::sqrt(feats[i]);

        DLIB_ASSERT(feats.size() == 99120, feats.size());
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LBP_Hh_

