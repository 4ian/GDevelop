// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SERIALIZE_OBJECT_DETECTOR_H__
#define DLIB_SERIALIZE_OBJECT_DETECTOR_H__

#include "simple_object_detector_py.h"

namespace dlib
{
    inline void serialize (const dlib::simple_object_detector_py& item, std::ostream& out)
    {
        int version = 1;
        serialize(item.detector, out);
        serialize(version, out);
        serialize(item.upsampling_amount, out);
    }

    inline void deserialize (dlib::simple_object_detector_py& item, std::istream& in)
    {
        int version = 0;
        deserialize(item.detector, in);
        deserialize(version, in);
        if (version != 1)
            throw dlib::serialization_error("Unexpected version found while deserializing a simple_object_detector.");
        deserialize(item.upsampling_amount, in);
    }

    inline void save_simple_object_detector_py(const simple_object_detector_py& detector, const std::string& detector_output_filename)
    {
        std::ofstream fout(detector_output_filename.c_str(), std::ios::binary);
        int version = 1;
        serialize(detector.detector, fout);
        serialize(version, fout);
        serialize(detector.upsampling_amount, fout);
    }

// ----------------------------------------------------------------------------------------

    inline void save_simple_object_detector(const simple_object_detector& detector, const std::string& detector_output_filename)
    {
        std::ofstream fout(detector_output_filename.c_str(), std::ios::binary);
        serialize(detector, fout);
        // Don't need to save version of upsampling amount because want to write out the
        // object detector just like the C++ code that serializes an object_detector would.
        // We also don't know the upsampling amount in this case anyway.
    }
}

#endif // DLIB_SERIALIZE_OBJECT_DETECTOR_H__
