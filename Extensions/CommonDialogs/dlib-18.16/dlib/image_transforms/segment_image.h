// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEGMENT_ImAGE_Hh_
#define DLIB_SEGMENT_ImAGE_Hh_

#include "segment_image_abstract.h"
#include "../algs.h"
#include <vector>
#include "../geometry.h"
#include "../disjoint_subsets.h"
#include "../set.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        inline T edge_diff_uint(
            const T& a,
            const T& b
        )
        {
            if (a > b)
                return a - b;
            else
                return b - a;
        }

    // ----------------------------------------

        template <typename T, typename enabled = void>
        struct edge_diff_funct 
        {
            typedef double diff_type;

            template <typename pixel_type>
            double operator()(
                const pixel_type& a,
                const pixel_type& b
            ) const
            {
                return length(pixel_to_vector<double>(a) - pixel_to_vector<double>(b));
            }
        };

        template <>
        struct edge_diff_funct<uint8,void>
        { 
            typedef uint8 diff_type; 
            uint8 operator()( const uint8& a, const uint8& b) const { return edge_diff_uint(a,b); } 
        };

        template <>
        struct edge_diff_funct<uint16,void>
        { 
            typedef uint16 diff_type; 
            uint16 operator()( const uint16& a, const uint16& b) const { return edge_diff_uint(a,b); } 
        };

        template <>
        struct edge_diff_funct<uint32,void>
        { 
            typedef uint32 diff_type; 
            uint32 operator()( const uint32& a, const uint32& b) const { return edge_diff_uint(a,b); } 
        };

        template <>
        struct edge_diff_funct<double,void>
        { 
            typedef double diff_type; 
            double operator()( const double& a, const double& b) const { return std::abs(a-b); } 
        };

        template <typename T>
        struct edge_diff_funct<T, typename enable_if<is_matrix<T> >::type>
        {
            typedef double diff_type;
            double operator()(
                const T& a,
                const T& b
            ) const
            {
                return length(a-b);
            }
        };

    // ------------------------------------------------------------------------------------

        template <typename T>
        struct graph_image_segmentation_data_T
        {
            graph_image_segmentation_data_T() : component_size(1), internal_diff(0) {}
            unsigned long component_size;
            T internal_diff;
        };

    // ------------------------------------------------------------------------------------

        template <typename T>
        struct segment_image_edge_data_T
        {
            segment_image_edge_data_T (){}

            segment_image_edge_data_T (
                const rectangle& rect,
                const point& p1,
                const point& p2,
                const T& diff_
            ) :
                idx1(p1.y()*rect.width() + p1.x()),
                idx2(p2.y()*rect.width() + p2.x()),
                diff(diff_)
            {}

            bool operator<(const segment_image_edge_data_T& item) const
            { return diff < item.diff; }

            unsigned long idx1;
            unsigned long idx2;
            T diff;
        };

    // ------------------------------------------------------------------------------------

        template <typename image_view_type>
        struct uint8_or_uint16_pixels
        {
            typedef typename image_view_type::pixel_type pixel_type;
            const static bool value = is_same_type<pixel_type,uint8>::value ||
                is_same_type<pixel_type,uint16>::value;
        };

        // This is an overload of get_pixel_edges() that is optimized to segment images
        // with 8bit or 16bit  pixels very quickly.  We do this by using a radix sort
        // instead of quicksort.
        template <typename in_image_type, typename T>
        typename enable_if<uint8_or_uint16_pixels<in_image_type> >::type 
        get_pixel_edges (
            const in_image_type& in_img,
            std::vector<segment_image_edge_data_T<T> >& sorted_edges
        )
        {
            typedef typename in_image_type::pixel_type ptype;
            typedef T diff_type;
            std::vector<unsigned long> counts(std::numeric_limits<ptype>::max()+1, 0);

            edge_diff_funct<ptype> edge_diff;

            border_enumerator be(get_rect(in_img), 1);
            // we are going to do a radix sort on the edge weights.  So the first step
            // is to accumulate them into count.
            const rectangle area = get_rect(in_img);
            while (be.move_next())
            {
                const long r = be.element().y();
                const long c = be.element().x();
                const ptype pix = in_img[r][c];
                if (area.contains(c-1,r))   counts[edge_diff(pix, in_img[r  ][c-1])] += 1;
                if (area.contains(c+1,r))   counts[edge_diff(pix, in_img[r  ][c+1])] += 1;
                if (area.contains(c  ,r-1)) counts[edge_diff(pix, in_img[r-1][c  ])] += 1;
                if (area.contains(c  ,r+1)) counts[edge_diff(pix, in_img[r+1][c  ])] += 1;
            }
            for (long r = 1; r+1 < in_img.nr(); ++r)
            {
                for (long c = 1; c+1 < in_img.nc(); ++c)
                {
                    const ptype pix = in_img[r][c];
                    counts[edge_diff(pix, in_img[r-1][c+1])] += 1;
                    counts[edge_diff(pix, in_img[r  ][c+1])] += 1;
                    counts[edge_diff(pix, in_img[r+1][c  ])] += 1;
                    counts[edge_diff(pix, in_img[r+1][c+1])] += 1;
                }
            }

            const unsigned long num_edges = shrink_rect(area,1).area()*4 + in_img.nr()*2*3 - 4 + (in_img.nc()-2)*2*3;
            typedef segment_image_edge_data_T<T> segment_image_edge_data;
            sorted_edges.resize(num_edges);

            // integrate counts.  The idea is to have sorted_edges[counts[i]] be the location that edges
            // with an edge_diff of i go.  So counts[0] == 0, counts[1] == number of 0 edge diff edges, etc.
            unsigned long prev = counts[0];
            for (unsigned long i = 1; i < counts.size(); ++i)
            {
                const unsigned long temp = counts[i];
                counts[i] += counts[i-1];
                counts[i-1] -= prev;
                prev = temp;
            }
            counts[counts.size()-1] -= prev;


            // now build a sorted list of all the edges
            be.reset();
            while(be.move_next())
            {
                const point p = be.element();
                const long r = p.y();
                const long c = p.x();
                const ptype pix = in_img[r][c];
                if (area.contains(c-1,r))
                {
                    const diff_type diff = edge_diff(pix, in_img[r  ][c-1]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c-1,r),diff);
                }

                if (area.contains(c+1,r))
                {
                    const diff_type diff = edge_diff(pix, in_img[r  ][c+1]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c+1,r),diff);
                }

                if (area.contains(c  ,r-1))
                {
                    const diff_type diff = edge_diff(pix, in_img[r-1][c  ]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c  ,r-1),diff);
                }

                if (area.contains(c  ,r+1))
                {
                    const diff_type diff = edge_diff(pix, in_img[r+1][c  ]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c  ,r+1),diff);
                }
            }
            // same thing as the above loop but now we do it on the interior of the image and therefore
            // don't have to include the boundary checking if statements used above.
            for (long r = 1; r+1 < in_img.nr(); ++r)
            {
                for (long c = 1; c+1 < in_img.nc(); ++c)
                {
                    const point p(c,r);
                    const ptype pix = in_img[r][c];
                    diff_type diff;

                    diff = edge_diff(pix, in_img[r  ][c+1]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c+1,r),diff);
                    diff = edge_diff(pix, in_img[r-1][c+1]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c+1,r-1),diff);
                    diff = edge_diff(pix, in_img[r+1][c+1]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c+1,r+1),diff);
                    diff = edge_diff(pix, in_img[r+1][c  ]);
                    sorted_edges[counts[diff]++] = segment_image_edge_data(area,p,point(c  ,r+1),diff);
                }
            }
        }
        
    // ----------------------------------------------------------------------------------------

        // This is the general purpose version of get_pixel_edges().  It handles all pixel types.
        template <typename in_image_type, typename T>
        typename disable_if<uint8_or_uint16_pixels<in_image_type> >::type 
        get_pixel_edges (
            const in_image_type& in_img,
            std::vector<segment_image_edge_data_T<T> >& sorted_edges
        )
        {   
            const rectangle area = get_rect(in_img);
            sorted_edges.reserve(area.area()*4);

            typedef typename in_image_type::pixel_type ptype;
            edge_diff_funct<ptype> edge_diff;
            typedef T diff_type;
            typedef segment_image_edge_data_T<T> segment_image_edge_data;

            border_enumerator be(get_rect(in_img), 1);

            // now build a sorted list of all the edges
            be.reset();
            while(be.move_next())
            {
                const point p = be.element();
                const long r = p.y();
                const long c = p.x();
                const ptype& pix = in_img[r][c];
                if (area.contains(c-1,r))
                {
                    const diff_type diff = edge_diff(pix, in_img[r  ][c-1]);
                    sorted_edges.push_back(segment_image_edge_data(area,p,point(c-1,r),diff));
                }

                if (area.contains(c+1,r))
                {
                    const diff_type diff = edge_diff(pix, in_img[r  ][c+1]);
                    sorted_edges.push_back(segment_image_edge_data(area,p,point(c+1,r),diff));
                }

                if (area.contains(c  ,r-1))
                {
                    const diff_type diff = edge_diff(pix, in_img[r-1][c  ]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c  ,r-1),diff));
                }
                if (area.contains(c  ,r+1))
                {
                    const diff_type diff = edge_diff(pix, in_img[r+1][c  ]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c  ,r+1),diff));
                }
            }
            // same thing as the above loop but now we do it on the interior of the image and therefore
            // don't have to include the boundary checking if statements used above.
            for (long r = 1; r+1 < in_img.nr(); ++r)
            {
                for (long c = 1; c+1 < in_img.nc(); ++c)
                {
                    const point p(c,r);
                    const ptype& pix = in_img[r][c];
                    diff_type diff;

                    diff = edge_diff(pix, in_img[r  ][c+1]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c+1,r),diff));
                    diff = edge_diff(pix, in_img[r+1][c+1]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c+1,r+1),diff));
                    diff = edge_diff(pix, in_img[r+1][c  ]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c  ,r+1),diff));
                    diff = edge_diff(pix, in_img[r-1][c+1]);
                    sorted_edges.push_back( segment_image_edge_data(area,p,point(c+1,r-1),diff));
                }
            }

            std::sort(sorted_edges.begin(), sorted_edges.end());

        }

    // ------------------------------------------------------------------------------------

    } // end of namespace impl

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void segment_image (
        const in_image_type& in_img_,
        out_image_type& out_img_,
        const double k = 200,
        const unsigned long min_size = 10
    )
    {
        using namespace dlib::impl;
        typedef typename image_traits<in_image_type>::pixel_type ptype;
        typedef typename edge_diff_funct<ptype>::diff_type diff_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_same_object(in_img_, out_img_) == false,
            "\t void segment_image()"
            << "\n\t The input images can't be the same object."
            );

        COMPILE_TIME_ASSERT(is_unsigned_type<typename image_traits<out_image_type>::pixel_type>::value);

        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

        out_img.set_size(in_img.nr(), in_img.nc());
        // don't bother doing anything if the image is too small
        if (in_img.nr() < 2 || in_img.nc() < 2)
        {
            assign_all_pixels(out_img,0);
            return;
        }

        disjoint_subsets sets;
        sets.set_size(in_img.size());

        std::vector<segment_image_edge_data_T<diff_type> > sorted_edges;
        get_pixel_edges(in_img, sorted_edges);

        std::vector<graph_image_segmentation_data_T<diff_type> > data(in_img.size());

        // now start connecting blobs together to make a minimum spanning tree.
        for (unsigned long i = 0; i < sorted_edges.size(); ++i)
        {
            const unsigned long idx1 = sorted_edges[i].idx1;
            const unsigned long idx2 = sorted_edges[i].idx2;

            unsigned long set1 = sets.find_set(idx1);
            unsigned long set2 = sets.find_set(idx2);
            if (set1 != set2)
            {
                const diff_type diff = sorted_edges[i].diff;
                const diff_type tau1 = static_cast<diff_type>(k/data[set1].component_size);
                const diff_type tau2 = static_cast<diff_type>(k/data[set2].component_size);

                const diff_type mint = std::min(data[set1].internal_diff + tau1, 
                                                data[set2].internal_diff + tau2);
                if (diff <= mint)
                {
                    const unsigned long new_set = sets.merge_sets(set1, set2);
                    data[new_set].component_size = data[set1].component_size + data[set2].component_size;
                    data[new_set].internal_diff = diff;
                }
            }
        }

        // now merge any really small blobs
        if (min_size != 0)
        {
            for (unsigned long i = 0; i < sorted_edges.size(); ++i)
            {
                const unsigned long idx1 = sorted_edges[i].idx1;
                const unsigned long idx2 = sorted_edges[i].idx2;

                unsigned long set1 = sets.find_set(idx1);
                unsigned long set2 = sets.find_set(idx2);
                if (set1 != set2 && (data[set1].component_size < min_size || data[set2].component_size < min_size))
                {
                    const unsigned long new_set = sets.merge_sets(set1, set2);
                    data[new_set].component_size = data[set1].component_size + data[set2].component_size;
                    //data[new_set].internal_diff = sorted_edges[i].diff;
                }
            }
        }

        unsigned long idx = 0;
        for (long r = 0; r < out_img.nr(); ++r)
        {
            for (long c = 0; c < out_img.nc(); ++c)
            {
                out_img[r][c] = sets.find_set(idx++);
            }
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                     Candidate object location generation code.
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        struct edge_data
        {
            double edge_diff;
            unsigned long set1;  
            unsigned long set2;
            bool operator<(const edge_data& item) const
            {
                return edge_diff < item.edge_diff;
            }
        };

        template <
            typename in_image_type,
            typename diff_type
            >
        void find_basic_candidate_object_locations (
            const in_image_type& in_img,
            const std::vector<dlib::impl::segment_image_edge_data_T<diff_type> >& sorted_edges,
            std::vector<rectangle>& out_rects,
            std::vector<edge_data>& edges,
            const double k,
            const unsigned long min_size 
        )
        {
            using namespace dlib::impl;

            std::vector<dlib::impl::segment_image_edge_data_T<diff_type> > rejected_edges;
            rejected_edges.reserve(sorted_edges.size());

            out_rects.clear();
            edges.clear();

            // don't bother doing anything if the image is too small
            if (in_img.nr() < 2 || in_img.nc() < 2)
            {
                return;
            }

            disjoint_subsets sets;
            sets.set_size(in_img.size());


            std::vector<graph_image_segmentation_data_T<diff_type> > data(in_img.size());



            std::pair<unsigned long,unsigned long> last_blob_edge(std::numeric_limits<unsigned long>::max(),
                                                                  std::numeric_limits<unsigned long>::max());;
            // now start connecting blobs together to make a minimum spanning tree.
            for (unsigned long i = 0; i < sorted_edges.size(); ++i)
            {
                const unsigned long idx1 = sorted_edges[i].idx1;
                const unsigned long idx2 = sorted_edges[i].idx2;

                unsigned long set1 = sets.find_set(idx1);
                unsigned long set2 = sets.find_set(idx2);
                if (set1 != set2)
                {
                    const diff_type diff = sorted_edges[i].diff;
                    const diff_type tau1 = static_cast<diff_type>(k/data[set1].component_size);
                    const diff_type tau2 = static_cast<diff_type>(k/data[set2].component_size);

                    const diff_type mint = std::min(data[set1].internal_diff + tau1, 
                        data[set2].internal_diff + tau2);
                    if (diff <= mint)
                    {
                        const unsigned long new_set = sets.merge_sets(set1, set2);
                        data[new_set].component_size = data[set1].component_size + data[set2].component_size;
                        data[new_set].internal_diff = diff;
                    }
                    else
                    {
                        // Don't bother keeping multiple edges from the same pair of blobs, we
                        // only need one for what we will do later.
                        if (std::make_pair(set1,set2) != last_blob_edge)
                        {
                            segment_image_edge_data_T<diff_type> temp = sorted_edges[i];
                            temp.idx1 = set1;
                            temp.idx2 = set2;
                            rejected_edges.push_back(temp);
                            last_blob_edge = std::make_pair(set1,set2);
                        }
                    }
                }
            }


            // merge small blobs
            for (unsigned long i = 0; i < rejected_edges.size(); ++i)
            {
                const unsigned long idx1 = rejected_edges[i].idx1;
                const unsigned long idx2 = rejected_edges[i].idx2;

                unsigned long set1 = sets.find_set(idx1);
                unsigned long set2 = sets.find_set(idx2);
                rejected_edges[i].idx1 = set1;
                rejected_edges[i].idx2 = set2;
                if (set1 != set2 && (data[set1].component_size < min_size || data[set2].component_size < min_size))
                {
                    const unsigned long new_set = sets.merge_sets(set1, set2);
                    data[new_set].component_size = data[set1].component_size + data[set2].component_size;
                    data[new_set].internal_diff = rejected_edges[i].diff;
                }
            }

            // find bounding boxes of each blob
            std::map<unsigned long, rectangle> boxes;
            std::map<unsigned long, unsigned long> box_id_map;
            unsigned long idx = 0;
            for (long r = 0; r < in_img.nr(); ++r)
            {
                for (long c = 0; c < in_img.nc(); ++c)
                {
                    const unsigned long id = sets.find_set(idx++);
                    // Accumulate the current point into its box and if it is the first point
                    // in the box then also record the id number for this box.
                    if ((boxes[id] += point(c,r)).area() == 1)
                        box_id_map[id] = boxes.size()-1;
                }
            }

            // copy boxes into out_rects
            out_rects.resize(boxes.size());
            for (std::map<unsigned long,rectangle>::iterator i = boxes.begin(); i != boxes.end(); ++i)
            {
                out_rects[box_id_map[i->first]] = i->second;
            }

            // Now find the edges between the boxes 
            typedef dlib::memory_manager<char>::kernel_2c mm_type;
            dlib::set<std::pair<unsigned long, unsigned long>, mm_type>::kernel_1a neighbors_final;
            for (unsigned long i = 0; i < rejected_edges.size(); ++i)
            {
                const unsigned long idx1 = rejected_edges[i].idx1;
                const unsigned long idx2 = rejected_edges[i].idx2;

                unsigned long set1 = sets.find_set(idx1);
                unsigned long set2 = sets.find_set(idx2);
                if (set1 != set2)
                {
                    std::pair<unsigned long, unsigned long> p = std::make_pair(set1,set2);
                    if (!neighbors_final.is_member(p))
                    {
                        neighbors_final.add(p);

                        edge_data temp;
                        const diff_type mint = std::min(data[set1].internal_diff , 
                                                        data[set2].internal_diff );
                        temp.edge_diff = rejected_edges[i].diff - mint;
                        temp.set1 = box_id_map[set1];
                        temp.set2 = box_id_map[set2];
                        edges.push_back(temp);
                    }
                }
            }

            std::sort(edges.begin(), edges.end());
        }
    } // end namespace impl

// ----------------------------------------------------------------------------------------

    template <typename alloc>
    void remove_duplicates (
        std::vector<rectangle,alloc>& rects
    )
    {
        std::sort(rects.begin(), rects.end(), std::less<rectangle>());
        unsigned long num_unique = 1;
        for (unsigned long i = 1; i < rects.size(); ++i)
        {
            if (rects[i] != rects[i-1])
            {
                rects[num_unique++] = rects[i];
            }
        }
        if (rects.size() != 0)
            rects.resize(num_unique);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename EXP
        >
    void find_candidate_object_locations (
        const in_image_type& in_img_,
        std::vector<rectangle>& rects,
        const matrix_exp<EXP>& kvals,
        const unsigned long min_size = 20,
        const unsigned long max_merging_iterations = 50
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(kvals) && kvals.size() > 0,
            "\t void find_candidate_object_locations()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_vector(kvals): " << is_vector(kvals)
            << "\n\t kvals.size():     " << kvals.size()
            );

        typedef dlib::memory_manager<char>::kernel_2c mm_type;
        typedef dlib::set<rectangle, mm_type>::kernel_1a set_of_rects;

        using namespace dlib::impl;
        typedef typename image_traits<in_image_type>::pixel_type ptype;
        typedef typename edge_diff_funct<ptype>::diff_type diff_type;

        const_image_view<in_image_type> in_img(in_img_);

        // don't bother doing anything if the image is too small
        if (in_img.nr() < 2 || in_img.nc() < 2)
        {
            return;
        }

        std::vector<edge_data> edges;
        std::vector<rectangle> working_rects;
        std::vector<segment_image_edge_data_T<diff_type> > sorted_edges;
        get_pixel_edges(in_img, sorted_edges);

        disjoint_subsets sets;

        for (long j = 0; j < kvals.size(); ++j)
        {
            const double k = kvals(j);

            find_basic_candidate_object_locations(in_img, sorted_edges, working_rects, edges, k, min_size);
            rects.insert(rects.end(), working_rects.begin(), working_rects.end());


            // Now iteratively merge all the rectangles we have and record the results.
            // Note that, unlike what is described in the paper 
            //    Segmentation as Selective Search for Object Recognition" by Koen E. A. van de Sande, et al.
            // we don't use any kind of histogram/SIFT like thing to order the edges
            // between the blobs.  Here we simply order by the pixel difference value.
            // Additionally, note that we keep progressively merging boxes in the outer
            // loop rather than performing just a single iteration as indicated in the
            // paper.
            set_of_rects detected_rects;
            bool did_merge = true;
            for (unsigned long iter = 0; did_merge && iter < max_merging_iterations; ++iter) 
            {
                did_merge = false;
                sets.clear();
                sets.set_size(working_rects.size());

                // recursively merge neighboring blobs until we have merged everything
                for (unsigned long i = 0; i < edges.size(); ++i)
                {
                    edge_data temp = edges[i];

                    temp.set1 = sets.find_set(temp.set1);
                    temp.set2 = sets.find_set(temp.set2);
                    if (temp.set1 != temp.set2)
                    {
                        rectangle merged_rect = working_rects[temp.set1] + working_rects[temp.set2];
                        // Skip merging this pair of blobs if it was merged in a previous
                        // iteration.  Doing this lets us consider other possible blob
                        // merges.
                        if (!detected_rects.is_member(merged_rect))
                        {
                            const unsigned long new_set = sets.merge_sets(temp.set1, temp.set2);
                            rects.push_back(merged_rect);
                            working_rects[new_set] = merged_rect;
                            did_merge = true;
                            detected_rects.add(merged_rect);
                        }
                    }
                }
            }
        }

        remove_duplicates(rects);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type
        >
    void find_candidate_object_locations (
        const in_image_type& in_img,
        std::vector<rectangle>& rects
    )
    {
        find_candidate_object_locations(in_img, rects, linspace(50, 200, 3));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEGMENT_ImAGE_Hh_

