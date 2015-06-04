// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LABEL_CONNeCTED_BLOBS_H_
#define DLIB_LABEL_CONNeCTED_BLOBS_H_

#include "label_connected_blobs_abstract.h"
#include "../geometry.h"
#include <stack>
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct neighbors_8 
    {
        void operator() (
            const point& p,
            std::vector<point>& neighbors
        ) const
        {
            neighbors.push_back(point(p.x()+1,p.y()+1));
            neighbors.push_back(point(p.x()+1,p.y()  ));
            neighbors.push_back(point(p.x()+1,p.y()-1));

            neighbors.push_back(point(p.x(),p.y()+1));
            neighbors.push_back(point(p.x(),p.y()-1));

            neighbors.push_back(point(p.x()-1,p.y()+1));
            neighbors.push_back(point(p.x()-1,p.y()  ));
            neighbors.push_back(point(p.x()-1,p.y()-1));
        }
    };

    struct neighbors_4 
    {
        void operator() (
            const point& p,
            std::vector<point>& neighbors
        ) const
        {
            neighbors.push_back(point(p.x()+1,p.y()));
            neighbors.push_back(point(p.x()-1,p.y()));
            neighbors.push_back(point(p.x(),p.y()+1));
            neighbors.push_back(point(p.x(),p.y()-1));
        }
    };

// ----------------------------------------------------------------------------------------

    struct connected_if_both_not_zero
    {
        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& a,
            const point& b
        ) const
        {
            return (img[a.y()][a.x()] != 0 && img[b.y()][b.x()] != 0);
        }
    };

    struct connected_if_equal
    {
        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& a,
            const point& b
        ) const
        {
            return (img[a.y()][a.x()] == img[b.y()][b.x()]);
        }
    };

// ----------------------------------------------------------------------------------------

    struct zero_pixels_are_background
    {
        template <typename image_type>
        bool operator() (
            const image_type& img,
            const point& p
        ) const
        {
            return img[p.y()][p.x()] == 0;
        }

    };

    struct nothing_is_background 
    {
        template <typename image_type>
        bool operator() (
            const image_type&, 
            const point& 
        ) const
        {
            return false;
        }

    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename label_image_type,
        typename background_functor_type,
        typename neighbors_functor_type,
        typename connected_functor_type
        >
    unsigned long label_connected_blobs (
        const image_type& img_,
        const background_functor_type& is_background,
        const neighbors_functor_type&  get_neighbors,
        const connected_functor_type&  is_connected,
        label_image_type& label_img_
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_same_object(img_, label_img_) == false,
            "\t unsigned long label_connected_blobs()"
            << "\n\t The input image and output label image can't be the same object."
            );

        const_image_view<image_type> img(img_);
        image_view<label_image_type> label_img(label_img_);

        std::stack<point> neighbors;
        label_img.set_size(img.nr(), img.nc());
        assign_all_pixels(label_img, 0);
        unsigned long next = 1;

        if (img.size() == 0)
            return 0;

        const rectangle area = get_rect(img);

        std::vector<point> window;

        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                // skip already labeled pixels or background pixels
                if (label_img[r][c] != 0 || is_background(img,point(c,r)))
                    continue;

                label_img[r][c] = next;

                // label all the neighbors of this point 
                neighbors.push(point(c,r));
                while (neighbors.size() > 0)
                {
                    const point p = neighbors.top();
                    neighbors.pop();

                    window.clear();
                    get_neighbors(p, window);

                    for (unsigned long i = 0; i < window.size(); ++i)
                    {
                        if (area.contains(window[i]) &&                     // point in image.
                            !is_background(img,window[i]) &&                // isn't background.
                            label_img[window[i].y()][window[i].x()] == 0 && // haven't already labeled it.
                            is_connected(img, p, window[i]))                // it's connected.
                        {
                            label_img[window[i].y()][window[i].x()] = next;
                            neighbors.push(window[i]);
                        }
                    }
                }

                ++next;
            }
        }

        return next;
    }
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LABEL_CONNeCTED_BLOBS_H_

