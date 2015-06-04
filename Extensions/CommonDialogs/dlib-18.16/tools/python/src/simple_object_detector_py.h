// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SIMPLE_OBJECT_DETECTOR_PY_H__
#define DLIB_SIMPLE_OBJECT_DETECTOR_PY_H__

#include <dlib/python.h>
#include <dlib/matrix.h>
#include <boost/python/args.hpp>
#include <dlib/geometry.h>
#include <dlib/image_processing/frontal_face_detector.h>

namespace dlib
{
    typedef object_detector<scan_fhog_pyramid<pyramid_down<6> > > simple_object_detector;

    inline void split_rect_detections (
        std::vector<rect_detection>& rect_detections,
        std::vector<rectangle>& rectangles,
        std::vector<double>& detection_confidences,
        std::vector<double>& weight_indices
    )
    {
        rectangles.clear();
        detection_confidences.clear();
        weight_indices.clear();

        for (unsigned long i = 0; i < rect_detections.size(); ++i)
        {
            rectangles.push_back(rect_detections[i].rect);
            detection_confidences.push_back(rect_detections[i].detection_confidence);
            weight_indices.push_back(rect_detections[i].weight_index);
        }
    }


    inline std::vector<dlib::rectangle> run_detector_with_upscale1 (
        dlib::simple_object_detector& detector,
        boost::python::object img,
        const unsigned int upsampling_amount,
        std::vector<double>& detection_confidences,
        std::vector<double>& weight_indices
    )
    {
        pyramid_down<2> pyr;

        std::vector<rectangle> rectangles;
        std::vector<rect_detection> rect_detections;

        if (is_gray_python_image(img))
        {
            array2d<unsigned char> temp;
            if (upsampling_amount == 0)
            {
                detector(numpy_gray_image(img), rect_detections, 0.0);
                split_rect_detections(rect_detections, rectangles,
                                      detection_confidences, weight_indices);
                return rectangles;
            }
            else
            {
                pyramid_up(numpy_gray_image(img), temp, pyr);
                unsigned int levels = upsampling_amount-1;
                while (levels > 0)
                {
                    levels--;
                    pyramid_up(temp);
                }

                detector(temp, rect_detections, 0.0);
                for (unsigned long i = 0; i < rect_detections.size(); ++i)
                    rect_detections[i].rect = pyr.rect_down(rect_detections[i].rect,
                                                            upsampling_amount);
                split_rect_detections(rect_detections, rectangles,
                                      detection_confidences, weight_indices);

                return rectangles;
            }
        }
        else if (is_rgb_python_image(img))
        {
            array2d<rgb_pixel> temp;
            if (upsampling_amount == 0)
            {
                detector(numpy_rgb_image(img), rect_detections, 0.0);
                split_rect_detections(rect_detections, rectangles,
                                      detection_confidences, weight_indices);
                return rectangles;
            }
            else
            {
                pyramid_up(numpy_rgb_image(img), temp, pyr);
                unsigned int levels = upsampling_amount-1;
                while (levels > 0)
                {
                    levels--;
                    pyramid_up(temp);
                }

                detector(temp, rect_detections, 0.0);
                for (unsigned long i = 0; i < rect_detections.size(); ++i)
                    rect_detections[i].rect = pyr.rect_down(rect_detections[i].rect,
                                                            upsampling_amount);
                split_rect_detections(rect_detections, rectangles,
                                      detection_confidences, weight_indices);

                return rectangles;
            }
        }
        else
        {
            throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
        }
    }

    inline std::vector<dlib::rectangle> run_detector_with_upscale2 (
        dlib::simple_object_detector& detector,
        boost::python::object img,
        const unsigned int upsampling_amount
    )
    {
        std::vector<double> detection_confidences;
        std::vector<double> weight_indices;

        return run_detector_with_upscale1(detector, img, upsampling_amount,
                                          detection_confidences, weight_indices);
    }

    inline boost::python::tuple run_rect_detector (
        dlib::simple_object_detector& detector,
        boost::python::object img,
        const unsigned int upsampling_amount)
    {
        boost::python::tuple t;

        std::vector<double> detection_confidences;
        std::vector<double> weight_indices;
        std::vector<rectangle> rectangles;

        rectangles = run_detector_with_upscale1(detector, img, upsampling_amount,
                                                detection_confidences, weight_indices);

        return boost::python::make_tuple(rectangles,
                                         detection_confidences, weight_indices);
    }

    struct simple_object_detector_py
    {
        simple_object_detector detector;
        unsigned int upsampling_amount;

        simple_object_detector_py() {}
        simple_object_detector_py(simple_object_detector& _detector, unsigned int _upsampling_amount) :
            detector(_detector), upsampling_amount(_upsampling_amount) {}

        std::vector<dlib::rectangle> run_detector1 (boost::python::object img,
                                                    const unsigned int upsampling_amount_)
        {
            return run_detector_with_upscale2(detector, img, upsampling_amount_);
        }

        std::vector<dlib::rectangle> run_detector2 (boost::python::object img)
        {
            return run_detector_with_upscale2(detector, img, upsampling_amount);
        }


    };
}

#endif // DLIB_SIMPLE_OBJECT_DETECTOR_PY_H__
