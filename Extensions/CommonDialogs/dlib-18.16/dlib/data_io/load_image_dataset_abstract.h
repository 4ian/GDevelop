// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LOAD_IMAGE_DaTASET_ABSTRACT_Hh_
#ifdef DLIB_LOAD_IMAGE_DaTASET_ABSTRACT_Hh_

#include "image_dataset_metadata.h"
#include "../array/array_kernel_abstract.h"
#include <string>
#include <vector>
#include "../image_processing/full_object_detection_abstract.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_dataset_file
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a tool used to tell the load_image_dataset() functions which
                boxes and images to load from an XML based image dataset file.  By default,
                this object tells load_image_dataset() to load all images and object boxes.
        !*/

    public:
        image_dataset_file(
            const std::string& filename
        );
        /*!
            ensures
                - #get_filename() == filename
                - #should_skip_empty_images() == false
                - #get_selected_box_labels().size() == 0
                  This means that, initially, all boxes will be loaded.  Therefore, for all
                  possible boxes B we have:
                    - #should_load_box(B) == true
        !*/

        const std::string& get_filename(
        ) const;
        /*!
            ensures
                - returns the name of the XML image dataset metadata file given to this
                  object's constructor.
        !*/
        
        bool should_skip_empty_images(
        ) const;
        /*!
            ensures
                - returns true if we are supposed to skip images that don't have any boxes
                  to load when loading an image dataset using load_image_dataset().
        !*/

        image_dataset_file boxes_match_label(
            const std::string& label
        ) const;
        /*!
            ensures
                - returns a copy of *this that is identical in all respects to *this except
                  that label will be included in the labels set (i.e. the set returned by
                  get_selected_box_labels()).
        !*/

        const std::set<std::string>& get_selected_box_labels(
        ) const;
        /*!
            ensures
                - returns the set of box labels currently selected by the should_load_box()
                  method.  Note that if the set is empty then we select all boxes.
        !*/

        image_dataset_file skip_empty_images(
        ) const;
        /*!
            ensures
                - returns a copy of *this that is identical in all respects to *this except
                  that #should_skip_empty_images() == true.
        !*/

        bool should_boxes_have_parts(
        ) const; 
        /*!
            ensures
                - returns true if boxes must have some parts defined for them to be loaded.
        !*/

        image_dataset_file boxes_have_parts(
        ) const;
        /*!
            ensures
                - returns a copy of *this that is identical in all respects to *this except
                  that #should_boxes_have_parts() == true.
        !*/

        bool should_load_box (
            const image_dataset_metadata::box& box
        ) const;
        /*!
            ensures
                - returns true if we are supposed to load the given box from an image
                  dataset XML file.  In particular, if should_load_box() returns false then
                  the load_image_dataset() routines will not return the box at all, neither
                  in the ignore rectangles list or in the primary object_locations vector.
                  The behavior of this function is defined as follows:
                    - if (should_boxes_have_parts() && boxes.parts.size() == 0) then
                        - returns false
                    - else if (get_selected_box_labels().size() == 0) then
                        - returns true
                    - else if (get_selected_box_labels().count(box.label) != 0) then
                        - returns true
                    - else
                        - returns false
        !*/

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<rectangle> >& object_locations,
        const image_dataset_file& source
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - This routine loads the images and their associated object boxes from the
              image metadata file indicated by source.get_filename().  This metadata file
              should be in the XML format used by the save_image_dataset_metadata() routine.
            - #images.size() == The number of images loaded from the metadata file.  This
              is all the images listed in the file unless source.should_skip_empty_images()
              is set to true.
            - #images.size() == #object_locations.size()
            - This routine is capable of loading any image format which can be read by the
              load_image() routine.
            - let IGNORED_RECTS denote the vector returned from this function.
            - IGNORED_RECTS.size() == #object_locations.size()
            - IGNORED_RECTS == a list of the rectangles which have the "ignore" flag set to
              true in the input XML file.
            - for all valid i:  
                - #images[i] == a copy of the i-th image from the dataset.
                - #object_locations[i] == a vector of all the rectangles associated with
                  #images[i].  These are the rectangles for which source.should_load_box()
                  returns true and are also not marked as "ignore" in the XML file.
                - IGNORED_RECTS[i] == A vector of all the rectangles associated with #images[i] 
                  that are marked as "ignore" but not discarded by source.should_load_box().
                - if (source.should_skip_empty_images() == true) then
                    - #object_locations[i].size() != 0
                      (i.e. we won't load images that don't end up having any object locations)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<rectangle> >& object_locations,
        const std::string& filename
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - performs: return load_image_dataset(images, object_locations, image_dataset_file(filename));
              (i.e. it ignores box labels and therefore loads all the boxes in the dataset)
    !*/

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
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - This routine loads the images and their associated object locations from the
              image metadata file indicated by source.get_filename().  This metadata file
              should be in the XML format used by the save_image_dataset_metadata() routine.
            - The difference between this function and the version of load_image_dataset()
              defined above is that this version will also load object part information and
              thus fully populates the full_object_detection objects.
            - #images.size() == The number of images loaded from the metadata file.  This
              is all the images listed in the file unless source.should_skip_empty_images()
              is set to true.
            - #images.size() == #object_locations.size()
            - This routine is capable of loading any image format which can be read
              by the load_image() routine.
            - #parts_list == a vector that contains the list of object parts found in the
              input file and loaded into object_locations.
            - #parts_list is in lexicographic sorted order.
            - let IGNORED_RECTS denote the vector returned from this function.
            - IGNORED_RECTS.size() == #object_locations.size()
            - IGNORED_RECTS == a list of the rectangles which have the "ignore" flag set to
              true in the input XML file.
            - for all valid i:  
                - #images[i] == a copy of the i-th image from the dataset.
                - #object_locations[i] == a vector of all the rectangles associated with
                  #images[i].  These are the rectangles for which source.should_load_box()
                  returns true and are also not marked as "ignore" in the XML file.
                - IGNORED_RECTS[i] == A vector of all the rectangles associated with #images[i] 
                  that are marked as "ignore" but not discarded by source.should_load_box().
                - if (source.should_skip_empty_images() == true) then
                    - #object_locations[i].size() != 0
                      (i.e. we won't load images that don't end up having any object locations)
                - for all valid j:
                    - #object_locations[i][j].num_parts() == #parts_list.size()
                    - for all valid k:
                        - #object_locations[i][j].part(k) == the location of the part
                          with name #parts_list[k] or OBJECT_PART_NOT_PRESENT if the
                          part was not indicated for object #object_locations[i][j].
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<full_object_detection> >& object_locations,
        const image_dataset_file& source 
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - performs: return load_image_dataset(images, object_locations, source, parts_list);
              (i.e. this function simply calls the above function and discards the output
              parts_list.  So it is just a convenience function you can call if you don't
              care about getting the parts list.)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type, 
        typename MM
        >
    std::vector<std::vector<rectangle> > load_image_dataset (
        array<image_type,MM>& images,
        std::vector<std::vector<full_object_detection> >& object_locations,
        const std::string& filename
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - performs: return load_image_dataset(images, object_locations, image_dataset_file(filename));
              (i.e. it ignores box labels and therefore loads all the boxes in the dataset)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LOAD_IMAGE_DaTASET_ABSTRACT_Hh_


