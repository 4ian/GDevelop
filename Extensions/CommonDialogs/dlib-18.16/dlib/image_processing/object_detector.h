// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OBJECT_DeTECTOR_Hh_
#define DLIB_OBJECT_DeTECTOR_Hh_

#include "object_detector_abstract.h"
#include "../geometry.h"
#include <vector>
#include "box_overlap_testing.h"
#include "full_object_detection.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct rect_detection
    {
        double detection_confidence;
        unsigned long weight_index;
        rectangle rect;

        bool operator<(const rect_detection& item) const { return detection_confidence < item.detection_confidence; }
    };

    struct full_detection
    {
        double detection_confidence;
        unsigned long weight_index;
        full_object_detection rect;

        bool operator<(const full_detection& item) const { return detection_confidence < item.detection_confidence; }
    };

// ----------------------------------------------------------------------------------------

    template <typename image_scanner_type>
    struct processed_weight_vector
    {
        processed_weight_vector(){}

        typedef typename image_scanner_type::feature_vector_type feature_vector_type;

        void init (
            const image_scanner_type& 
        ) 
        /*!
            requires
                - w has already been assigned its value.  Note that the point of this
                  function is to allow an image scanner to overload the
                  processed_weight_vector template and provide some different kind of
                  object as the output of get_detect_argument().  For example, the
                  scan_fhog_pyramid object uses an overload that causes
                  get_detect_argument() to return the special fhog_filterbank object
                  instead of a feature_vector_type.  This avoids needing to construct the
                  fhog_filterbank during each call to detect and therefore speeds up
                  detection.
        !*/
        {}

        // return the first argument to image_scanner_type::detect()
        const feature_vector_type& get_detect_argument() const { return w; }

        feature_vector_type w;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type_
        >
    class object_detector
    {
    public:
        typedef image_scanner_type_ image_scanner_type;
        typedef typename image_scanner_type::feature_vector_type feature_vector_type;

        object_detector (
        );

        object_detector (
            const object_detector& item 
        );

        object_detector (
            const image_scanner_type& scanner_, 
            const test_box_overlap& overlap_tester_,
            const feature_vector_type& w_ 
        );

        object_detector (
            const image_scanner_type& scanner_, 
            const test_box_overlap& overlap_tester_,
            const std::vector<feature_vector_type>& w_ 
        );

        explicit object_detector (
            const std::vector<object_detector>& detectors
        );

        unsigned long num_detectors (
        ) const { return w.size(); }

        const feature_vector_type& get_w (
            unsigned long idx = 0
        ) const { return w[idx].w; }
        
        const processed_weight_vector<image_scanner_type>& get_processed_w (
            unsigned long idx = 0
        ) const { return w[idx]; }

        const test_box_overlap& get_overlap_tester (
        ) const;

        const image_scanner_type& get_scanner (
        ) const;

        object_detector& operator= (
            const object_detector& item 
        );

        template <
            typename image_type
            >
        std::vector<rectangle> operator() (
            const image_type& img,
            double adjust_threshold = 0
        );

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<std::pair<double, rectangle> >& final_dets,
            double adjust_threshold = 0
        );

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<std::pair<double, full_object_detection> >& final_dets,
            double adjust_threshold = 0
        );

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<full_object_detection>& final_dets,
            double adjust_threshold = 0
        );

        // These typedefs are here for backwards compatibility with previous versions of
        // dlib.
        typedef ::dlib::rect_detection rect_detection;
        typedef ::dlib::full_detection full_detection;

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<rect_detection>& final_dets,
            double adjust_threshold = 0
        );

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<full_detection>& final_dets,
            double adjust_threshold = 0
        );

        template <typename T>
        friend void serialize (
            const object_detector<T>& item,
            std::ostream& out
        );

        template <typename T>
        friend void deserialize (
            object_detector<T>& item,
            std::istream& in 
        );

    private:

        bool overlaps_any_box (
            const std::vector<rect_detection>& rects,
            const dlib::rectangle& rect
        ) const
        {
            for (unsigned long i = 0; i < rects.size(); ++i)
            {
                if (boxes_overlap(rects[i].rect, rect))
                    return true;
            }
            return false;
        }

        test_box_overlap boxes_overlap;
        std::vector<processed_weight_vector<image_scanner_type> > w;
        image_scanner_type scanner;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const object_detector<T>& item,
        std::ostream& out
    )
    {
        int version = 2;
        serialize(version, out);

        T scanner;
        scanner.copy_configuration(item.scanner);
        serialize(scanner, out);
        serialize(item.boxes_overlap, out);
        // serialize all the weight vectors
        serialize(item.w.size(), out);
        for (unsigned long i = 0; i < item.w.size(); ++i)
            serialize(item.w[i].w, out);
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void deserialize (
        object_detector<T>& item,
        std::istream& in 
    )
    {
        int version = 0;
        deserialize(version, in);
        if (version == 1)
        {
            deserialize(item.scanner, in);
            item.w.resize(1);
            deserialize(item.w[0].w, in);
            item.w[0].init(item.scanner);
            deserialize(item.boxes_overlap, in);
        }
        else if (version == 2)
        {
            deserialize(item.scanner, in);
            deserialize(item.boxes_overlap, in);
            unsigned long num_detectors = 0;
            deserialize(num_detectors, in);
            item.w.resize(num_detectors);
            for (unsigned long i = 0; i < item.w.size(); ++i)
            {
                deserialize(item.w[i].w, in);
                item.w[i].init(item.scanner);
            }
        }
        else 
        {
            throw serialization_error("Unexpected version encountered while deserializing a dlib::object_detector object.");
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                      object_detector member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>::
    object_detector (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>::
    object_detector (
        const object_detector& item 
    )
    {
        boxes_overlap = item.boxes_overlap;
        w = item.w;
        scanner.copy_configuration(item.scanner);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>::
    object_detector (
        const image_scanner_type& scanner_, 
        const test_box_overlap& overlap_tester,
        const feature_vector_type& w_ 
    ) :
        boxes_overlap(overlap_tester)
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(scanner_.get_num_detection_templates() > 0 &&
                    w_.size() == scanner_.get_num_dimensions() + 1, 
            "\t object_detector::object_detector(scanner_,overlap_tester,w_)"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t scanner_.get_num_detection_templates(): " << scanner_.get_num_detection_templates()
            << "\n\t w_.size():                     " << w_.size()
            << "\n\t scanner_.get_num_dimensions(): " << scanner_.get_num_dimensions()
            << "\n\t this: " << this
            );

        scanner.copy_configuration(scanner_);
        w.resize(1);
        w[0].w = w_;
        w[0].init(scanner);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>::
    object_detector (
        const image_scanner_type& scanner_, 
        const test_box_overlap& overlap_tester,
        const std::vector<feature_vector_type>& w_ 
    ) :
        boxes_overlap(overlap_tester)
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(scanner_.get_num_detection_templates() > 0 && w_.size() > 0,
            "\t object_detector::object_detector(scanner_,overlap_tester,w_)"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t scanner_.get_num_detection_templates(): " << scanner_.get_num_detection_templates()
            << "\n\t w_.size():                     " << w_.size()
            << "\n\t this: " << this
            );

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < w_.size(); ++i)
        {
            DLIB_ASSERT(w_[i].size() == scanner_.get_num_dimensions() + 1, 
                "\t object_detector::object_detector(scanner_,overlap_tester,w_)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t scanner_.get_num_detection_templates(): " << scanner_.get_num_detection_templates()
                << "\n\t w_["<<i<<"].size():                     " << w_[i].size()
                << "\n\t scanner_.get_num_dimensions(): " << scanner_.get_num_dimensions()
                << "\n\t this: " << this
                );
        }
#endif

        scanner.copy_configuration(scanner_);
        w.resize(w_.size());
        for (unsigned long i = 0; i < w.size(); ++i)
        {
            w[i].w = w_[i];
            w[i].init(scanner);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>::
    object_detector (
        const std::vector<object_detector>& detectors
    )
    {
        DLIB_ASSERT(detectors.size() != 0,
                "\t object_detector::object_detector(detectors)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t this: " << this
        );
        std::vector<feature_vector_type> weights;
        weights.reserve(detectors.size());
        for (unsigned long i = 0; i < detectors.size(); ++i)
        {
            for (unsigned long j = 0; j < detectors[i].num_detectors(); ++j)
                weights.push_back(detectors[i].get_w(j));
        }

        *this = object_detector(detectors[0].get_scanner(), detectors[0].get_overlap_tester(), weights);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    object_detector<image_scanner_type>& object_detector<image_scanner_type>::
    operator= (
        const object_detector& item 
    )
    {
        if (this == &item)
            return *this;

        boxes_overlap = item.boxes_overlap;
        w = item.w;
        scanner.copy_configuration(item.scanner);
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    void object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        std::vector<rect_detection>& final_dets,
        double adjust_threshold
    ) 
    {
        scanner.load(img);
        std::vector<std::pair<double, rectangle> > dets;
        std::vector<rect_detection> dets_accum;
        for (unsigned long i = 0; i < w.size(); ++i)
        {
            const double thresh = w[i].w(scanner.get_num_dimensions());
            scanner.detect(w[i].get_detect_argument(), dets, thresh + adjust_threshold);
            for (unsigned long j = 0; j < dets.size(); ++j)
            {
                rect_detection temp;
                temp.detection_confidence = dets[j].first-thresh;
                temp.weight_index = i;
                temp.rect = dets[j].second;
                dets_accum.push_back(temp);
            }
        }

        // Do non-max suppression
        final_dets.clear();
        if (w.size() > 1)
            std::sort(dets_accum.rbegin(), dets_accum.rend());
        for (unsigned long i = 0; i < dets_accum.size(); ++i)
        {
            if (overlaps_any_box(final_dets, dets_accum[i].rect))
                continue;

            final_dets.push_back(dets_accum[i]);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    void object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        std::vector<full_detection>& final_dets,
        double adjust_threshold 
    )
    {
        std::vector<rect_detection> dets;
        (*this)(img,dets,adjust_threshold);

        final_dets.resize(dets.size());

        // convert all the rectangle detections into full_object_detections.
        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            final_dets[i].detection_confidence = dets[i].detection_confidence;
            final_dets[i].weight_index = dets[i].weight_index;
            final_dets[i].rect = scanner.get_full_object_detection(dets[i].rect, w[dets[i].weight_index].w);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    std::vector<rectangle> object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        double adjust_threshold
    ) 
    {
        std::vector<rect_detection> dets;
        (*this)(img,dets,adjust_threshold);

        std::vector<rectangle> final_dets(dets.size());
        for (unsigned long i = 0; i < dets.size(); ++i)
            final_dets[i] = dets[i].rect;

        return final_dets;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    void object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        std::vector<std::pair<double, rectangle> >& final_dets,
        double adjust_threshold
    ) 
    {
        std::vector<rect_detection> dets;
        (*this)(img,dets,adjust_threshold);

        final_dets.resize(dets.size());
        for (unsigned long i = 0; i < dets.size(); ++i)
            final_dets[i] = std::make_pair(dets[i].detection_confidence,dets[i].rect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    void object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        std::vector<std::pair<double, full_object_detection> >& final_dets,
        double adjust_threshold
    ) 
    {
        std::vector<rect_detection> dets;
        (*this)(img,dets,adjust_threshold);

        final_dets.clear();
        final_dets.reserve(dets.size());

        // convert all the rectangle detections into full_object_detections.
        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            final_dets.push_back(std::make_pair(dets[i].detection_confidence, 
                                                scanner.get_full_object_detection(dets[i].rect, w[dets[i].weight_index].w)));
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    template <
        typename image_type
        >
    void object_detector<image_scanner_type>::
    operator() (
        const image_type& img,
        std::vector<full_object_detection>& final_dets,
        double adjust_threshold
    ) 
    {
        std::vector<rect_detection> dets;
        (*this)(img,dets,adjust_threshold);

        final_dets.clear();
        final_dets.reserve(dets.size());

        // convert all the rectangle detections into full_object_detections.
        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            final_dets.push_back(scanner.get_full_object_detection(dets[i].rect, w[dets[i].weight_index].w));
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    const test_box_overlap& object_detector<image_scanner_type>::
    get_overlap_tester (
    ) const
    {
        return boxes_overlap;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    const image_scanner_type& object_detector<image_scanner_type>::
    get_scanner (
    ) const
    {
        return scanner;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OBJECT_DeTECTOR_Hh_


