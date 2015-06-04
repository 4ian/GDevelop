// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOAD_IMAGE_DaTASET_Hh_
#define DLIB_LOAD_IMAGE_DaTASET_Hh_

#include "load_image_dataset_abstract.h"
#include "../misc_api.h"
#include "../dir_nav.h"
#include "../image_io.h"
#include "../array.h"
#include <vector>
#include "../geometry.h"
#include "image_dataset_metadata.h"
#include <string>
#include <set>
#include "../image_processing/full_object_detection.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_dataset_file
    {
    public:
        image_dataset_file(const std::string& filename)
        {
            _skip_empty_images = false;
            _have_parts = false;
            _filename = filename;
        }

        image_dataset_file boxes_match_label(
            const std::string& label
        ) const
        {
            image_dataset_file temp(*this);
            temp._labels.insert(label);
            return temp;
        }

        image_dataset_file skip_empty_images(
        ) const
        {
            image_dataset_file temp(*this);
            temp._skip_empty_images = true;
            return temp;
        }

        image_dataset_file boxes_have_parts(
        ) const
        {
            image_dataset_file temp(*this);
            temp._have_parts = true;
            return temp;
        }

        bool should_load_box (
            const image_dataset_metadata::box& box
        ) const
        {
            if (_have_parts && box.parts.size() == 0)
                return false;
            if (_labels.size() == 0)
                return true;
            if (_labels.count(box.label) != 0)
                return true;
            return false;
        }

        const std::string& get_filename() const { return _filename; }
        bool should_skip_empty_images() const { return _skip_empty_images; }
        bool should_boxes_have_parts() const { return _have_parts; }
        const std::set<std::string>& get_selected_box_labels() const { return _labels; }

    private:
        std::string _filename;
        std::set<std::string> _labels;
        bool _skip_empty_images;
        bool _have_parts;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<rectangle> >& object_locations,
        const image_dataset_file& source
    )
    {
        images.clear();
        object_locations.clear();
        const std::string old_working_dir = get_current_dir();

        std::vector<std::vector<rectangle> > ignored_rects;

        using namespace dlib::image_dataset_metadata;
        dataset data;
        load_image_dataset_metadata(data, source.get_filename());

        // Set the current directory to be the one that contains the
        // metadata file. We do this because the file might contain
        // file paths which are relative to this folder.
        set_current_dir(get_parent_directory(file(source.get_filename())));




        image_type img;
        std::vector<rectangle> rects, ignored;
        for (unsigned long i = 0; i < data.images.size(); ++i)
        {
            rects.clear();
            ignored.clear();
            for (unsigned long j = 0; j < data.images[i].boxes.size(); ++j)
            {
                if (source.should_load_box(data.images[i].boxes[j]))
                {
                    if (data.images[i].boxes[j].ignore)
                        ignored.push_back(data.images[i].boxes[j].rect);
                    else
                        rects.push_back(data.images[i].boxes[j].rect);
                }
            }

            if (!source.should_skip_empty_images() || rects.size() != 0)
            {
                object_locations.push_back(rects);
                ignored_rects.push_back(ignored);
                load_image(img, data.images[i].filename);
                images.push_back(img);
            }
        }

        set_current_dir(old_working_dir);
        return ignored_rects;
    }

// ----------------------------------------------------------------------------------------

// ******* THIS FUNCTION IS DEPRECATED, you should use another version of load_image_dataset() *******
    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<rectangle> >& object_locations,
        const std::string& filename,
        const std::string& label,
        bool skip_empty_images = false
    )
    {
        image_dataset_file f(filename);
        if (label.size() != 0)
            f = f.boxes_match_label(label);
        if (skip_empty_images)
            f = f.skip_empty_images();
        return load_image_dataset(images, object_locations, f);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<rectangle> >& object_locations,
        const std::string& filename
    )
    {
        return load_image_dataset(images, object_locations, image_dataset_file(filename));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<full_object_detection> >& object_locations,
        const image_dataset_file& source,
        std::vector<std::string>& parts_list
    )
    {
        parts_list.clear();
        images.clear();
        object_locations.clear();
        const std::string old_working_dir = get_current_dir();

        using namespace dlib::image_dataset_metadata;
        dataset data;
        load_image_dataset_metadata(data, source.get_filename());

        // Set the current directory to be the one that contains the
        // metadata file. We do this because the file might contain
        // file paths which are relative to this folder.
        set_current_dir(get_parent_directory(file(source.get_filename())));


        std::set<std::string> all_parts;

        // find out what parts are being used in the dataset.  Store results in all_parts.
        for (unsigned long i = 0; i < data.images.size(); ++i)
        {
            for (unsigned long j = 0; j < data.images[i].boxes.size(); ++j)
            {
                if (source.should_load_box(data.images[i].boxes[j]))
                {
                    const std::map<std::string,point>& parts = data.images[i].boxes[j].parts;
                    std::map<std::string,point>::const_iterator itr;

                    for (itr = parts.begin(); itr != parts.end(); ++itr)
                    {
                        all_parts.insert(itr->first);
                    }
                }
            }
        }

        // make a mapping between part names and the integers [0, all_parts.size())
        std::map<std::string,int> parts_idx;
        for (std::set<std::string>::iterator i = all_parts.begin(); i != all_parts.end(); ++i)
        {
            parts_idx[*i] = parts_list.size();
            parts_list.push_back(*i);
        }

        std::vector<std::vector<rectangle> > ignored_rects;
        std::vector<rectangle> ignored;
        image_type img;
        std::vector<full_object_detection> object_dets;
        for (unsigned long i = 0; i < data.images.size(); ++i)
        {
            object_dets.clear();
            ignored.clear();
            for (unsigned long j = 0; j < data.images[i].boxes.size(); ++j)
            {
                if (source.should_load_box(data.images[i].boxes[j]))
                {
                    if (data.images[i].boxes[j].ignore)
                    {
                        ignored.push_back(data.images[i].boxes[j].rect);
                    }
                    else
                    {
                        std::vector<point> partlist(parts_idx.size(), OBJECT_PART_NOT_PRESENT);

                        // populate partlist with all the parts present in this box.
                        const std::map<std::string,point>& parts = data.images[i].boxes[j].parts;
                        std::map<std::string,point>::const_iterator itr;
                        for (itr = parts.begin(); itr != parts.end(); ++itr)
                        {
                            partlist[parts_idx[itr->first]] = itr->second;
                        }

                        object_dets.push_back(full_object_detection(data.images[i].boxes[j].rect, partlist));
                    }
                }
            }

            if (!source.should_skip_empty_images() || object_dets.size() != 0)
            {
                object_locations.push_back(object_dets);
                ignored_rects.push_back(ignored);
                load_image(img, data.images[i].filename);
                images.push_back(img);
            }
        }

        set_current_dir(old_working_dir);

        return ignored_rects;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<full_object_detection> >& object_locations,
        const image_dataset_file& source 
    )
    {
        std::vector<std::string> parts_list;
        return load_image_dataset(images, object_locations, source, parts_list);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<full_object_detection> >& object_locations,
        const std::string& filename
    )
    {
        std::vector<std::string> parts_list;
        return load_image_dataset(images, object_locations, image_dataset_file(filename), parts_list);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LOAD_IMAGE_DaTASET_Hh_

