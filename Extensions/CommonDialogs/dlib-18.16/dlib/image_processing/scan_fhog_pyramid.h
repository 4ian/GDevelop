// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_fHOG_PYRAMID_Hh_
#define DLIB_SCAN_fHOG_PYRAMID_Hh_

#include "scan_fhog_pyramid_abstract.h"
#include "../matrix.h"
#include "../image_transforms.h"
#include "../array.h"
#include "../array2d.h"
#include "object_detector.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class default_fhog_feature_extractor
    {
    public:
        inline rectangle image_to_feats (
            const rectangle& rect,
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const
        {
            return image_to_fhog(rect, cell_size, filter_rows_padding, filter_cols_padding);
        }

        inline rectangle feats_to_image (
            const rectangle& rect,
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const
        {
            return fhog_to_image(rect, cell_size, filter_rows_padding, filter_cols_padding);
        }

        template <
            typename image_type
            >
        void operator()(
            const image_type& img, 
            dlib::array<array2d<float> >& hog, 
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding
        ) const
        {
            extract_fhog_features(img,hog,cell_size,filter_rows_padding,filter_cols_padding);
        }

        inline unsigned long get_num_planes (
        ) const
        {
            return 31;
        }
    };

    inline void serialize   (const default_fhog_feature_extractor&, std::ostream&) {}
    inline void deserialize (default_fhog_feature_extractor&, std::istream&) {}

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename Feature_extractor_type = default_fhog_feature_extractor
        >
    class scan_fhog_pyramid : noncopyable
    {

    public:

        typedef matrix<double,0,1> feature_vector_type;

        typedef Pyramid_type pyramid_type;
        typedef Feature_extractor_type feature_extractor_type;

        scan_fhog_pyramid (
        );  

        explicit scan_fhog_pyramid (
            const feature_extractor_type& fe_
        );  

        template <
            typename image_type
            >
        void load (
            const image_type& img
        );

        inline bool is_loaded_with_image (
        ) const;

        inline void copy_configuration (
            const scan_fhog_pyramid& item
        );

        void set_detection_window_size (
            unsigned long width,
            unsigned long height
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(width > 0 && height > 0,
                "\t void scan_fhog_pyramid::set_detection_window_size()"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t width:  " << width
                << "\n\t height: " << height
                << "\n\t this:   " << this
                );

            window_width = width;
            window_height = height;
            feats.clear();
        }

        inline unsigned long get_detection_window_width (
        ) const { return window_width; }
        inline unsigned long get_detection_window_height (
        ) const { return window_height; }

        inline unsigned long get_num_detection_templates (
        ) const;

        inline unsigned long get_num_movable_components_per_detection_template (
        ) const;

        void set_padding (
            unsigned long new_padding
        )
        {
            padding = new_padding;
            feats.clear();
        }

        unsigned long get_padding (
        ) const { return padding; }

        void set_cell_size (
            unsigned long new_cell_size
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(new_cell_size > 0 ,
                "\t void scan_fhog_pyramid::set_cell_size()"
                << "\n\t You can't have zero sized fHOG cells. "
                << "\n\t this: " << this
                );

            cell_size = new_cell_size;
            feats.clear();
        }

        unsigned long get_cell_size (
        ) const { return cell_size; }

        inline long get_num_dimensions (
        ) const;

        unsigned long get_max_pyramid_levels (
        ) const;

        const feature_extractor_type& get_feature_extractor(
        ) const { return fe; }

        void set_max_pyramid_levels (
            unsigned long max_levels
        );

        void set_min_pyramid_layer_size (
            unsigned long width,
            unsigned long height 
        );

        inline unsigned long get_min_pyramid_layer_width (
        ) const;

        inline unsigned long get_min_pyramid_layer_height (
        ) const;

        void detect (
            const feature_vector_type& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_loaded_with_image() &&
                        w.size() >= get_num_dimensions(), 
                "\t void scan_fhog_pyramid::detect()"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
                << "\n\t w.size():               " << w.size()
                << "\n\t get_num_dimensions():   " << get_num_dimensions()
                << "\n\t this: " << this
                );

            fhog_filterbank temp = build_fhog_filterbank(w);
            detect(temp, dets, thresh);
        }

        class fhog_filterbank 
        {
            friend class scan_fhog_pyramid;
        public:
            inline long get_num_dimensions() const
            {
                unsigned long dims = 0;
                for (unsigned long i = 0; i < filters.size(); ++i)
                {
                    dims += filters[i].size();
                }
                return dims;
            }

            const std::vector<matrix<float> >& get_filters() const { return filters;} 

            unsigned long num_separable_filters() const 
            {
                unsigned long num = 0;
                for (unsigned long i = 0; i < row_filters.size(); ++i)
                {
                    num += row_filters[i].size();
                }
                return num;
            }

            std::vector<matrix<float> > filters;
            std::vector<std::vector<matrix<float,0,1> > > row_filters, col_filters;
        };

        fhog_filterbank build_fhog_filterbank (
            const feature_vector_type& weights 
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(weights.size() >= get_num_dimensions(),
                "\t fhog_filterbank scan_fhog_pyramid::build_fhog_filterbank()"
                << "\n\t The number of weights isn't enough to fill out the filterbank. "
                << "\n\t weights.size():       " << weights.size() 
                << "\n\t get_num_dimensions(): " << get_num_dimensions() 
                << "\n\t this: " << this
                );

            fhog_filterbank temp;
            temp.filters.resize(fe.get_num_planes());
            temp.row_filters.resize(fe.get_num_planes());
            temp.col_filters.resize(fe.get_num_planes());

            // load filters from w
            unsigned long width, height;
            compute_fhog_window_size(width, height);
            const long size = width*height;
            for (unsigned long i = 0; i < temp.filters.size(); ++i)
            {
                matrix<double> u,v,w,f;
                f = reshape(rowm(weights, range(i*size, (i+1)*size-1)), height, width);
                temp.filters[i] = matrix_cast<float>(f);

                svd3(f, u,w,v);

                matrix<double> w2 = w;
                rsort_columns(u,w);
                rsort_columns(v,w2);

                double thresh = std::max(1e-4, max(w)*0.001);
                w = round_zeros(w, thresh);


                for (long j = 0; j < w.size(); ++j)
                {
                    if (w(j) != 0)
                    {
                        temp.col_filters[i].push_back(matrix_cast<float>(colm(u,j)*std::sqrt(w(j))));
                        temp.row_filters[i].push_back(matrix_cast<float>(colm(v,j)*std::sqrt(w(j))));
                    }
                }
            }

            return temp;
        }

        void detect (
            const fhog_filterbank& w,
            std::vector<std::pair<double, rectangle> >& dets,
            const double thresh
        ) const;


        void get_feature_vector (
            const full_object_detection& obj,
            feature_vector_type& psi
        ) const;

        full_object_detection get_full_object_detection (
            const rectangle& rect,
            const feature_vector_type& w
        ) const;

        const rectangle get_best_matching_rect (
            const rectangle& rect
        ) const;

        double get_nuclear_norm_regularization_strength (
        ) const { return nuclear_norm_regularization_strength; }

        void set_nuclear_norm_regularization_strength (
            double strength
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(strength >= 0 ,
                "\t void scan_fhog_pyramid::set_nuclear_norm_regularization_strength()"
                << "\n\t You can't have a negative regularization strength."
                << "\n\t strength: " << strength 
                << "\n\t this: " << this
            );

            nuclear_norm_regularization_strength = strength;
        }

        unsigned long get_fhog_window_width (
        ) const 
        {
            unsigned long width, height;
            compute_fhog_window_size(width, height);
            return width;
        }

        unsigned long get_fhog_window_height (
        ) const 
        {
            unsigned long width, height;
            compute_fhog_window_size(width, height);
            return height;
        }

        template <typename T, typename U>
        friend void serialize (
            const scan_fhog_pyramid<T,U>& item,
            std::ostream& out
        );

        template <typename T, typename U>
        friend void deserialize (
            scan_fhog_pyramid<T,U>& item,
            std::istream& in 
        );

    private:
        inline void compute_fhog_window_size(
            unsigned long& width,
            unsigned long& height
        ) const
        {
            const rectangle rect = centered_rect(point(0,0),window_width,window_height);
            const rectangle temp = grow_rect(fe.image_to_feats(rect, cell_size, 1, 1), padding);
            width = temp.width();
            height = temp.height();
        }

        void get_mapped_rect_and_metadata (
            const unsigned long number_pyramid_levels,
            const rectangle& rect,
            rectangle& mapped_rect,
            rectangle& fhog_rect,
            unsigned long& best_level
        ) const;

        double get_match_score (
            rectangle r1,
            rectangle r2
        ) const
        {
            // make the rectangles overlap as much as possible before computing the match score.
            r1 = move_rect(r1, r2.tl_corner());
            return (r1.intersect(r2).area())/(double)(r1 + r2).area();
        }

        typedef array<array2d<float> > fhog_image;

        feature_extractor_type fe;
        array<fhog_image> feats;
        int cell_size;
        unsigned long padding; 
        unsigned long window_width;
        unsigned long window_height;
        unsigned long max_pyramid_levels;
        unsigned long min_pyramid_layer_width;
        unsigned long min_pyramid_layer_height;
        double nuclear_norm_regularization_strength;

        void init()
        {
            cell_size = 8;
            padding = 1;
            window_width = 64;
            window_height = 64;
            max_pyramid_levels = 1000;
            min_pyramid_layer_width = 64;
            min_pyramid_layer_height = 64;
            nuclear_norm_regularization_strength = 0;
        }

    };

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename fhog_filterbank>
        rectangle apply_filters_to_fhog (
            const fhog_filterbank& w,
            const array<array2d<float> >& feats,
            array2d<float>& saliency_image
        )
        {
            const unsigned long num_separable_filters = w.num_separable_filters();
            rectangle area;
            // use the separable filters if they would be faster than running the regular filters.
            if (num_separable_filters > w.filters.size()*std::min(w.filters[0].nr(),w.filters[0].nc())/3.0)
            {
                area = spatially_filter_image(feats[0], saliency_image, w.filters[0]);
                for (unsigned long i = 1; i < w.filters.size(); ++i)
                {
                    // now we filter but the output adds to saliency_image rather than
                    // overwriting it.
                    spatially_filter_image(feats[i], saliency_image, w.filters[i], 1, false, true);
                }
            }
            else
            {
                saliency_image.clear();
                array2d<float> scratch;

                // find the first filter to apply
                unsigned long i = 0;
                while (i < w.row_filters.size() && w.row_filters[i].size() == 0) 
                    ++i;

                for (; i < w.row_filters.size(); ++i)
                {
                    for (unsigned long j = 0; j < w.row_filters[i].size(); ++j)
                    {
                        if (saliency_image.size() == 0)
                            area = float_spatially_filter_image_separable(feats[i], saliency_image, w.row_filters[i][j], w.col_filters[i][j],scratch,false);
                        else
                            area = float_spatially_filter_image_separable(feats[i], saliency_image, w.row_filters[i][j], w.col_filters[i][j],scratch,true);
                    }
                }
                if (saliency_image.size() == 0)
                {
                    saliency_image.set_size(feats[0].nr(), feats[0].nc());
                    assign_all_pixels(saliency_image, 0);
                }
            }
            return area;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void serialize (
        const scan_fhog_pyramid<T,U>& item,
        std::ostream& out
    )
    {
        int version = 1;
        serialize(version, out);
        serialize(item.fe, out);
        serialize(item.feats, out);
        serialize(item.cell_size, out);
        serialize(item.padding, out);
        serialize(item.window_width, out);
        serialize(item.window_height, out);
        serialize(item.max_pyramid_levels, out);
        serialize(item.min_pyramid_layer_width, out);
        serialize(item.min_pyramid_layer_height, out);
        serialize(item.nuclear_norm_regularization_strength, out);
        serialize(item.get_num_dimensions(), out);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void deserialize (
        scan_fhog_pyramid<T,U>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unsupported version found when deserializing a scan_fhog_pyramid object.");

        deserialize(item.fe, in);
        deserialize(item.feats, in);
        deserialize(item.cell_size, in);
        deserialize(item.padding, in);
        deserialize(item.window_width, in);
        deserialize(item.window_height, in);
        deserialize(item.max_pyramid_levels, in);
        deserialize(item.min_pyramid_layer_width, in);
        deserialize(item.min_pyramid_layer_height, in);
        deserialize(item.nuclear_norm_regularization_strength, in);

        // When developing some feature extractor, it's easy to accidentally change its
        // number of dimensions and then try to deserialize data from an older version of
        // your extractor into the current code.  This check is here to catch that kind of
        // user error.
        long dims;
        deserialize(dims, in);
        if (item.get_num_dimensions() != dims)
            throw serialization_error("Number of dimensions in serialized scan_fhog_pyramid doesn't match the expected number.");
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                         scan_fhog_pyramid member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    scan_fhog_pyramid (
    ) 
    {
        init();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    scan_fhog_pyramid (
        const feature_extractor_type& fe_
    ) 
    {
        init();
        fe = fe_;
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <
            typename pyramid_type,
            typename image_type,
            typename feature_extractor_type
            >
        void create_fhog_pyramid (
            const image_type& img,
            const feature_extractor_type& fe,
            array<array<array2d<float> > >& feats,
            int cell_size,
            int filter_rows_padding,
            int filter_cols_padding,
            unsigned long min_pyramid_layer_width,
            unsigned long min_pyramid_layer_height,
            unsigned long max_pyramid_levels
        )
        {
            unsigned long levels = 0;
            rectangle rect = get_rect(img);

            // figure out how many pyramid levels we should be using based on the image size
            pyramid_type pyr;
            do
            {
                rect = pyr.rect_down(rect);
                ++levels;
            } while (rect.width() >= min_pyramid_layer_width && rect.height() >= min_pyramid_layer_height &&
                levels < max_pyramid_levels);

            if (feats.max_size() < levels)
                feats.set_max_size(levels);
            feats.set_size(levels);



            // build our feature pyramid
            fe(img, feats[0], cell_size,filter_rows_padding,filter_cols_padding);
            DLIB_ASSERT(feats[0].size() == fe.get_num_planes(), 
                "Invalid feature extractor used with dlib::scan_fhog_pyramid.  The output does not have the \n"
                "indicated number of planes.");

            if (feats.size() > 1)
            {
                typedef typename image_traits<image_type>::pixel_type pixel_type;
                array2d<pixel_type> temp1, temp2;
                pyr(img, temp1);
                fe(temp1, feats[1], cell_size,filter_rows_padding,filter_cols_padding);
                swap(temp1,temp2);

                for (unsigned long i = 2; i < feats.size(); ++i)
                {
                    pyr(temp2, temp1);
                    fe(temp1, feats[i], cell_size,filter_rows_padding,filter_cols_padding);
                    swap(temp1,temp2);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    template <
        typename image_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    load (
        const image_type& img
    )
    {
        unsigned long width, height;
        compute_fhog_window_size(width,height);
        impl::create_fhog_pyramid<Pyramid_type>(img, fe, feats, cell_size, height,
            width, min_pyramid_layer_width, min_pyramid_layer_height,
            max_pyramid_levels);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    bool scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    is_loaded_with_image (
    ) const
    {
        return feats.size() != 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    copy_configuration (
        const scan_fhog_pyramid& item
    )
    {
        cell_size = item.cell_size;
        padding = item.padding;
        window_width = item.window_width;
        window_height = item.window_height;
        max_pyramid_levels = item.max_pyramid_levels;
        min_pyramid_layer_width = item.min_pyramid_layer_width;
        min_pyramid_layer_height = item.min_pyramid_layer_height;
        nuclear_norm_regularization_strength = item.nuclear_norm_regularization_strength;
        fe = item.fe;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_num_detection_templates (
    ) const
    {
        return 1;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_num_movable_components_per_detection_template (
    ) const
    {
        return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_num_dimensions (
    ) const
    {
        unsigned long width, height;
        compute_fhog_window_size(width,height);
        return width*height*fe.get_num_planes();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_max_pyramid_levels (
    ) const
    {
        return max_pyramid_levels;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    set_max_pyramid_levels (
        unsigned long max_levels
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_levels > 0 ,
            "\t void scan_fhog_pyramid::set_max_pyramid_levels()"
            << "\n\t You can't have zero levels. "
            << "\n\t max_levels: " << max_levels 
            << "\n\t this: " << this
            );

        max_pyramid_levels = max_levels;
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        inline bool compare_pair_rect (
            const std::pair<double, rectangle>& a,
            const std::pair<double, rectangle>& b
        )
        {
            return a.first < b.first;
        }

        template <
            typename pyramid_type,
            typename feature_extractor_type,
            typename fhog_filterbank
            >
        void detect_from_fhog_pyramid (
            const array<array<array2d<float> > >& feats,
            const feature_extractor_type& fe,
            const fhog_filterbank& w,
            const double thresh,
            const unsigned long det_box_height,
            const unsigned long det_box_width,
            const int cell_size,
            const int filter_rows_padding,
            const int filter_cols_padding,
            std::vector<std::pair<double, rectangle> >& dets
        ) 
        {
            dets.clear();

            array2d<float> saliency_image;
            pyramid_type pyr;

            // for all pyramid levels
            for (unsigned long l = 0; l < feats.size(); ++l)
            {
                const rectangle area = apply_filters_to_fhog(w, feats[l], saliency_image);

                // now search the saliency image for any detections
                for (long r = area.top(); r <= area.bottom(); ++r)
                {
                    for (long c = area.left(); c <= area.right(); ++c)
                    {
                        // if we found a detection
                        if (saliency_image[r][c] >= thresh)
                        {
                            rectangle rect = fe.feats_to_image(centered_rect(point(c,r),det_box_width,det_box_height), 
                                cell_size, filter_rows_padding, filter_cols_padding);
                            rect = pyr.rect_up(rect, l);
                            dets.push_back(std::make_pair(saliency_image[r][c], rect));
                        }
                    }
                }
            }

            std::sort(dets.rbegin(), dets.rend(), compare_pair_rect);
        }

        inline bool overlaps_any_box (
            const test_box_overlap& tester,
            const std::vector<rect_detection>& rects,
            const rect_detection& rect
        ) 
        {
            for (unsigned long i = 0; i < rects.size(); ++i)
            {
                // Only compare detections from the same detector.  That is, we don't want
                // the output of one detector to stop on the output of another detector. 
                if (rects[i].weight_index == rect.weight_index && tester(rects[i].rect, rect.rect))
                    return true;
            }
            return false;
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    detect (
        const fhog_filterbank& w,
        std::vector<std::pair<double, rectangle> >& dets,
        const double thresh
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    w.get_num_dimensions() == get_num_dimensions(), 
            "\t void scan_fhog_pyramid::detect()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t w.get_num_dimensions(): " << w.get_num_dimensions()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t this: " << this
            );

        unsigned long width, height;
        compute_fhog_window_size(width,height);

        impl::detect_from_fhog_pyramid<pyramid_type>(feats, fe, w, thresh,
            height-2*padding, width-2*padding, cell_size, height, width, dets);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    const rectangle scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_best_matching_rect (
        const rectangle& rect
    ) const
    {
        rectangle mapped_rect, fhog_rect;
        unsigned long best_level;
        get_mapped_rect_and_metadata(max_pyramid_levels, rect, mapped_rect, fhog_rect, best_level);
        return mapped_rect;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_mapped_rect_and_metadata (
        const unsigned long number_pyramid_levels,
        const rectangle& rect,
        rectangle& mapped_rect,
        rectangle& fhog_rect,
        unsigned long& best_level
    ) const
    {
        pyramid_type pyr;
        best_level = 0;
        double best_match_score = -1;


        unsigned long width, height;
        compute_fhog_window_size(width,height);

        // Figure out the pyramid level which best matches rect against our detection
        // window. 
        for (unsigned long l = 0; l < number_pyramid_levels; ++l)
        {
            const rectangle rect_fhog_space = fe.image_to_feats(pyr.rect_down(rect,l), cell_size, height,width);

            const rectangle win_image_space = pyr.rect_up(fe.feats_to_image(centered_rect(center(rect_fhog_space),width-2*padding,height-2*padding), cell_size, height,width), l);

            const double match_score = get_match_score(win_image_space, rect); 
            if (match_score > best_match_score)
            {
                best_match_score = match_score;
                best_level = l;
                fhog_rect = centered_rect(center(rect_fhog_space), width, height);
            }

            if (rect_fhog_space.area() <= 1) 
                break;
        }
        mapped_rect = pyr.rect_up(fe.feats_to_image(shrink_rect(fhog_rect,padding), cell_size,height,width),best_level);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    full_object_detection scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_full_object_detection (
        const rectangle& rect,
        const feature_vector_type& 
    ) const
    {
        return full_object_detection(rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_feature_vector (
        const full_object_detection& obj,
        feature_vector_type& psi
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_loaded_with_image() &&
                    psi.size() >= get_num_dimensions() &&
                    obj.num_parts() == 0,
            "\t void scan_fhog_pyramid::get_feature_vector()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_loaded_with_image(): " << is_loaded_with_image()
            << "\n\t psi.size():             " << psi.size()
            << "\n\t get_num_dimensions():   " << get_num_dimensions()
            << "\n\t obj.num_parts():                            " << obj.num_parts()
            << "\n\t this: " << this
            );



        rectangle mapped_rect;
        unsigned long best_level;
        rectangle fhog_rect;
        get_mapped_rect_and_metadata(feats.size(), obj.get_rect(), mapped_rect, fhog_rect, best_level);


        long i = 0;
        for (unsigned long ii = 0; ii < feats[best_level].size(); ++ii)
        {
            const rectangle rect = get_rect(feats[best_level][0]);
            for (long r = fhog_rect.top(); r <= fhog_rect.bottom(); ++r)
            {
                for (long c = fhog_rect.left(); c <= fhog_rect.right(); ++c)
                {
                    if (rect.contains(c,r))
                        psi(i) += feats[best_level][ii][r][c];
                    ++i;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    void scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    set_min_pyramid_layer_size (
        unsigned long width,
        unsigned long height 
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(width > 0 && height > 0 ,
            "\t void scan_fhog_pyramid::set_min_pyramid_layer_size()"
            << "\n\t These sizes can't be zero. "
            << "\n\t width:  " << width 
            << "\n\t height: " << height 
            << "\n\t this:   " << this
            );

        min_pyramid_layer_width = width;
        min_pyramid_layer_height = height;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_min_pyramid_layer_width (
    ) const
    {
        return min_pyramid_layer_width;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::
    get_min_pyramid_layer_height (
    ) const
    {
        return min_pyramid_layer_height;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    matrix<unsigned char> draw_fhog (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        const unsigned long weight_index = 0,
        const long cell_draw_size = 15
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(weight_index < detector.num_detectors(),
            "\t matrix draw_fhog()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t weight_index:             " << weight_index
            << "\n\t detector.num_detectors(): " << detector.num_detectors()
            );
        DLIB_ASSERT(cell_draw_size > 0 && detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions(),
            "\t matrix draw_fhog()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t cell_draw_size:                              " << cell_draw_size
            << "\n\t weight_index:                                " << weight_index
            << "\n\t detector.get_w(weight_index).size():         " << detector.get_w(weight_index).size()
            << "\n\t detector.get_scanner().get_num_dimensions(): " << detector.get_scanner().get_num_dimensions()
            );

        typename scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::fhog_filterbank fb = detector.get_scanner().build_fhog_filterbank(detector.get_w(weight_index));
        return draw_fhog(fb.get_filters(),cell_draw_size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    unsigned long num_separable_filters (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        const unsigned long weight_index = 0
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(weight_index < detector.num_detectors(),
            "\t unsigned long num_separable_filters()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t weight_index:             " << weight_index
            << "\n\t detector.num_detectors(): " << detector.num_detectors()
            );
        DLIB_ASSERT(detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions() ,
            "\t unsigned long num_separable_filters()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t detector.get_w(weight_index).size():         " << detector.get_w(weight_index).size()
            << "\n\t detector.get_scanner().get_num_dimensions(): " << detector.get_scanner().get_num_dimensions()
            );

        typename scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::fhog_filterbank fb = detector.get_scanner().build_fhog_filterbank(detector.get_w(weight_index));
        return fb.num_separable_filters();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> > threshold_filter_singular_values (
        const object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >& detector,
        double thresh,
        const unsigned long weight_index = 0
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(thresh >= 0 ,
            "\t object_detector threshold_filter_singular_values()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t thresh: " << thresh 
        );

        DLIB_ASSERT(weight_index < detector.num_detectors(),
            "\t object_detector threshold_filter_singular_values()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t weight_index:             " << weight_index
            << "\n\t detector.num_detectors(): " << detector.num_detectors()
            );
        DLIB_ASSERT(detector.get_w(weight_index).size() >= detector.get_scanner().get_num_dimensions() ,
            "\t object_detector threshold_filter_singular_values()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t detector.get_w(weight_index).size():         " << detector.get_w(weight_index).size()
            << "\n\t detector.get_scanner().get_num_dimensions(): " << detector.get_scanner().get_num_dimensions()
            );


        const unsigned long width = detector.get_scanner().get_fhog_window_width();
        const unsigned long height = detector.get_scanner().get_fhog_window_height();
        const long num_planes = detector.get_scanner().get_feature_extractor().get_num_planes();
        const long size = width*height;

        std::vector<matrix<double,0,1> > detector_weights;
        for (unsigned long j = 0; j < detector.num_detectors(); ++j)
        {
            matrix<double,0,1> weights = detector.get_w(j);

            if (j == weight_index)
            {
                matrix<double> u,v,w,f;
                for (long i = 0; i < num_planes; ++i)
                {
                    f = reshape(rowm(weights, range(i*size, (i+1)*size-1)), height, width);

                    svd3(f, u,w,v);
                    const double scaled_thresh = std::max(1e-3, max(w)*thresh);
                    w = round_zeros(w, scaled_thresh);
                    f = u*diagm(w)*trans(v);

                    set_rowm(weights,range(i*size, (i+1)*size-1)) = reshape_to_column_vector(f);
                }
            }
            detector_weights.push_back(weights);
        }
        
        return object_detector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >(detector.get_scanner(), 
                                                                 detector.get_overlap_tester(),
                                                                 detector_weights);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type,
        typename svm_struct_prob_type
        >
    void configure_nuclear_norm_regularizer (
        const scan_fhog_pyramid<Pyramid_type,feature_extractor_type>& scanner,
        svm_struct_prob_type& prob
    )
    { 
        const double strength = scanner.get_nuclear_norm_regularization_strength();
        const long num_planes = scanner.get_feature_extractor().get_num_planes();
        if (strength != 0)
        {
            const unsigned long width = scanner.get_fhog_window_width();
            const unsigned long height = scanner.get_fhog_window_height();
            for (long i = 0; i < num_planes; ++i)
            {
                prob.add_nuclear_norm_regularizer(i*width*height, height, width, strength);
            }
            prob.set_cache_based_epsilon(0.001);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename feature_extractor_type
        >
    struct processed_weight_vector<scan_fhog_pyramid<Pyramid_type,feature_extractor_type> >
    {
        processed_weight_vector(){}

        typedef matrix<double,0,1> feature_vector_type;
        typedef typename scan_fhog_pyramid<Pyramid_type,feature_extractor_type>::fhog_filterbank fhog_filterbank;

        void init (
            const scan_fhog_pyramid<Pyramid_type,feature_extractor_type>& scanner
        ) 
        {
            fb = scanner.build_fhog_filterbank(w);
        }

        const fhog_filterbank& get_detect_argument() const { return fb; }

        feature_vector_type w;
        fhog_filterbank fb;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename pyramid_type,
        typename image_type
        >
    void evaluate_detectors (
        const std::vector<object_detector<scan_fhog_pyramid<pyramid_type> > >& detectors,
        const image_type& img,
        std::vector<rect_detection>& dets,
        const double adjust_threshold = 0
    )
    {
        typedef scan_fhog_pyramid<pyramid_type> scanner_type;

        dets.clear();
        if (detectors.size() == 0)
            return;

        const unsigned long cell_size = detectors[0].get_scanner().get_cell_size();

        // Find the maximum sized filters and also most extreme pyramiding settings used.
        unsigned long max_filter_width = 0;
        unsigned long max_filter_height = 0;
        unsigned long min_pyramid_layer_width = std::numeric_limits<unsigned long>::max();
        unsigned long min_pyramid_layer_height = std::numeric_limits<unsigned long>::max();
        unsigned long max_pyramid_levels = 0;
        bool all_cell_sizes_the_same = true;
        for (unsigned long i = 0; i < detectors.size(); ++i)
        {
            const scanner_type& scanner = detectors[i].get_scanner();
            max_filter_width = std::max(max_filter_width, scanner.get_fhog_window_width());
            max_filter_height = std::max(max_filter_height, scanner.get_fhog_window_height());
            max_pyramid_levels = std::max(max_pyramid_levels, scanner.get_max_pyramid_levels());
            min_pyramid_layer_width = std::min(min_pyramid_layer_width, scanner.get_min_pyramid_layer_width());
            min_pyramid_layer_height = std::min(min_pyramid_layer_height, scanner.get_min_pyramid_layer_height());
            if (cell_size != scanner.get_cell_size())
                all_cell_sizes_the_same = false;
        }

        std::vector<rect_detection> dets_accum;
        // Do to the HOG feature extraction to make the fhog pyramid.  Again, note that we
        // are making a pyramid that will work with any of the detectors.  But only if all
        // the cell sizes are the same.  If they aren't then we have to calculate the
        // pyramid for each detector individually.
        array<array<array2d<float> > > feats;
        if (all_cell_sizes_the_same)
        {
            impl::create_fhog_pyramid<pyramid_type>(img,
                detectors[0].get_scanner().get_feature_extractor(), feats, cell_size,
                max_filter_height, max_filter_width, min_pyramid_layer_width,
                min_pyramid_layer_height, max_pyramid_levels);
        }

        std::vector<std::pair<double, rectangle> > temp_dets;
        for (unsigned long i = 0; i < detectors.size(); ++i)
        {
            const scanner_type& scanner = detectors[i].get_scanner();
            if (!all_cell_sizes_the_same)
            {
                impl::create_fhog_pyramid<pyramid_type>(img,
                    scanner.get_feature_extractor(), feats, scanner.get_cell_size(),
                    max_filter_height, max_filter_width, min_pyramid_layer_width,
                    min_pyramid_layer_height, max_pyramid_levels);
            }

            const unsigned long det_box_width  = scanner.get_fhog_window_width()  - 2*scanner.get_padding();
            const unsigned long det_box_height = scanner.get_fhog_window_height() - 2*scanner.get_padding();
            // A single detector object might itself have multiple weight vectors in it. So
            // we need to evaluate all of them.
            for (unsigned d = 0; d < detectors[i].num_detectors(); ++d)
            {
                const double thresh = detectors[i].get_processed_w(d).w(scanner.get_num_dimensions());

                impl::detect_from_fhog_pyramid<pyramid_type>(feats, scanner.get_feature_extractor(),
                    detectors[i].get_processed_w(d).get_detect_argument(), thresh+adjust_threshold,
                    det_box_height, det_box_width, cell_size, max_filter_height,
                    max_filter_width, temp_dets);

                for (unsigned long j = 0; j < temp_dets.size(); ++j)
                {
                    rect_detection temp;
                    temp.detection_confidence = temp_dets[j].first-thresh;
                    temp.weight_index = i;
                    temp.rect = temp_dets[j].second;
                    dets_accum.push_back(temp);
                }
            }
        }


        // Do non-max suppression
        dets.clear();
        if (detectors.size() > 1)
            std::sort(dets_accum.rbegin(), dets_accum.rend());
        for (unsigned long i = 0; i < dets_accum.size(); ++i)
        {
            const test_box_overlap tester = detectors[dets_accum[i].weight_index].get_overlap_tester();
            if (impl::overlaps_any_box(tester, dets, dets_accum[i]))
                continue;

            dets.push_back(dets_accum[i]);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename Pyramid_type,
        typename image_type
        >
    std::vector<rectangle> evaluate_detectors (
        const std::vector<object_detector<scan_fhog_pyramid<Pyramid_type> > >& detectors,
        const image_type& img,
        const double adjust_threshold = 0
    )
    {
        std::vector<rectangle> out_dets;
        std::vector<rect_detection> dets;
        evaluate_detectors(detectors, img, dets, adjust_threshold);
        out_dets.reserve(dets.size());
        for (unsigned long i = 0; i < dets.size(); ++i)
            out_dets.push_back(dets[i].rect);
        return out_dets;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_fHOG_PYRAMID_Hh_

