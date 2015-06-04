// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/statistics.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include "tester.h"
#include <dlib/pixel.h>
#include <dlib/svm_threaded.h>
#include <dlib/array.h>
#include <dlib/set_utils.h>
#include <dlib/array2d.h>
#include <dlib/image_keypoint.h>
#include <dlib/image_processing.h>
#include <dlib/image_transforms.h>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.object_detector");

// ----------------------------------------------------------------------------------------

    struct funny_image
    {
        array2d<unsigned char> img;
        long nr() const { return img.nr(); }
        long nc() const { return img.nc(); }
    };

    void swap(funny_image& a, funny_image& b)
    {
        a.img.swap(b.img);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type,
        typename detector_type
        >
    void validate_some_object_detector_stuff (
        const image_array_type& images,
        detector_type& detector,
        double eps = 1e-10
    )
    {
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            std::vector<rectangle> dets = detector(images[i]);
            std::vector<std::pair<double,rectangle> > dets2;

            detector(images[i], dets2);

            matrix<double,0,1> psi(detector.get_w().size());
            matrix<double,0,1> psi2(detector.get_w().size());
            const double thresh = detector.get_w()(detector.get_w().size()-1);

            DLIB_TEST(dets.size() == dets2.size());
            for (unsigned long j = 0; j < dets.size(); ++j)
            {
                DLIB_TEST(dets[j] == dets2[j].second);

                const full_object_detection fdet = detector.get_scanner().get_full_object_detection(dets[j], detector.get_w());
                psi = 0;
                detector.get_scanner().get_feature_vector(fdet, psi);

                double check_score = dot(psi,detector.get_w()) - thresh;
                DLIB_TEST_MSG(std::abs(check_score - dets2[j].first) < eps, std::abs(check_score - dets2[j].first) << "  check_score: "<< check_score);
            }

        }
    }

// ----------------------------------------------------------------------------------------

    class very_simple_feature_extractor : noncopyable
    {
        /*!
        WHAT THIS OBJECT REPRESENTS
            This object is a feature extractor which goes to every pixel in an image and
            produces a 32 dimensional feature vector.  This vector is an indicator vector
            which records the pattern of pixel values in a 4-connected region.  So it should
            be able to distinguish basic things like whether or not a location falls on the
            corner of a white box, on an edge, in the middle, etc.


            Note that this object also implements the interface defined in dlib/image_keypoint/hashed_feature_image_abstract.h.
            This means all the member functions in this object are supposed to behave as 
            described in the hashed_feature_image specification.  So when you define your own
            feature extractor objects you should probably refer yourself to that documentation
            in addition to reading this example program.
        !*/


    public:

        inline void load (
            const funny_image& img_
        )
        {
            const array2d<unsigned char>& img = img_.img;

            feat_image.set_size(img.nr(), img.nc());
            assign_all_pixels(feat_image,0);
            for (long r = 1; r+1 < img.nr(); ++r)
            {
                for (long c = 1; c+1 < img.nc(); ++c)
                {
                    unsigned char f = 0;
                    if (img[r][c])   f |= 0x1;
                    if (img[r][c+1]) f |= 0x2;
                    if (img[r][c-1]) f |= 0x4;
                    if (img[r+1][c]) f |= 0x8;
                    if (img[r-1][c]) f |= 0x10;

                    // Store the code value for the pattern of pixel values in the 4-connected
                    // neighborhood around this row and column.
                    feat_image[r][c] = f;
                }
            }
        }

        inline void load (
            const array2d<unsigned char>& img
        )
        {
            feat_image.set_size(img.nr(), img.nc());
            assign_all_pixels(feat_image,0);
            for (long r = 1; r+1 < img.nr(); ++r)
            {
                for (long c = 1; c+1 < img.nc(); ++c)
                {
                    unsigned char f = 0;
                    if (img[r][c])   f |= 0x1;
                    if (img[r][c+1]) f |= 0x2;
                    if (img[r][c-1]) f |= 0x4;
                    if (img[r+1][c]) f |= 0x8;
                    if (img[r-1][c]) f |= 0x10;

                    // Store the code value for the pattern of pixel values in the 4-connected
                    // neighborhood around this row and column.
                    feat_image[r][c] = f;
                }
            }
        }

        inline unsigned long size () const { return feat_image.size(); }
        inline long nr () const { return feat_image.nr(); }
        inline long nc () const { return feat_image.nc(); }

        inline long get_num_dimensions (
        ) const
        {
            // Return the dimensionality of the vectors produced by operator()
            return 32;
        }

        typedef std::vector<std::pair<unsigned int,double> > descriptor_type;

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const
            /*!
                requires
                    - 0 <= row < nr()
            - 0 <= col < nc()
                ensures
                    - returns a sparse vector which describes the image at the given row and column.  
                      In particular, this is a vector that is 0 everywhere except for one element. 
            !*/
        {
            feat.clear();
            const unsigned long only_nonzero_element_index = feat_image[row][col];
            feat.push_back(make_pair(only_nonzero_element_index,1.0));
            return feat;
        }

        // This block of functions is meant to provide a way to map between the row/col space taken by
        // this object's operator() function and the images supplied to load().  In this example it's trivial.  
        // However, in general, you might create feature extractors which don't perform extraction at every 
        // possible image location (e.g. the hog_image) and thus result in some more complex mapping.  
        inline const rectangle get_block_rect       ( long row, long col) const { return centered_rect(col,row,3,3); }
        inline const point image_to_feat_space      ( const point& p) const { return p; } 
        inline const rectangle image_to_feat_space  ( const rectangle& rect) const { return rect; } 
        inline const point feat_to_image_space      ( const point& p) const { return p; } 
        inline const rectangle feat_to_image_space  ( const rectangle& rect) const { return rect; }

        inline friend void serialize   ( const very_simple_feature_extractor& item, std::ostream& out)  { serialize(item.feat_image, out); }
        inline friend void deserialize ( very_simple_feature_extractor& item, std::istream& in ) { deserialize(item.feat_image, in); }

        void copy_configuration ( const very_simple_feature_extractor& ){}

    private:
        array2d<unsigned char> feat_image;

        // This variable doesn't logically contribute to the state of this object.  It is here
        // only to avoid returning a descriptor_type object by value inside the operator() method.
        mutable descriptor_type feat;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void make_simple_test_data (
        image_array_type& images,
        std::vector<std::vector<rectangle> >& object_locations
    )
    {
        images.clear();
        object_locations.clear();

        images.resize(3);
        images[0].set_size(400,400);
        images[1].set_size(400,400);
        images[2].set_size(400,400);

        // set all the pixel values to black
        assign_all_pixels(images[0], 0);
        assign_all_pixels(images[1], 0);
        assign_all_pixels(images[2], 0);

        // Now make some squares and draw them onto our black images. All the
        // squares will be 70 pixels wide and tall.

        std::vector<rectangle> temp;
        temp.push_back(centered_rect(point(100,100), 70,70)); 
        fill_rect(images[0],temp.back(),255); // Paint the square white
        temp.push_back(centered_rect(point(200,300), 70,70));
        fill_rect(images[0],temp.back(),255); // Paint the square white
        object_locations.push_back(temp);

        temp.clear();
        temp.push_back(centered_rect(point(140,200), 70,70));
        fill_rect(images[1],temp.back(),255); // Paint the square white
        temp.push_back(centered_rect(point(303,200), 70,70));
        fill_rect(images[1],temp.back(),255); // Paint the square white
        object_locations.push_back(temp);

        temp.clear();
        temp.push_back(centered_rect(point(123,121), 70,70));
        fill_rect(images[2],temp.back(),255); // Paint the square white
        object_locations.push_back(temp);

        // corrupt each image with random noise just to make this a little more 
        // challenging 
        dlib::rand rnd;
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            for (long r = 0; r < images[i].nr(); ++r)
            {
                for (long c = 0; c < images[i].nc(); ++c)
                {
                    typedef typename image_array_type::type image_type;
                    typedef typename image_type::type type;
                    images[i][r][c] = (type)put_in_range(0,255,images[i][r][c] + 10*rnd.get_random_gaussian());
                }
            }
        }
    }

    template <
        typename image_array_type
        >
    void make_simple_test_data (
        image_array_type& images,
        std::vector<std::vector<full_object_detection> >& object_locations
    )
    {
        images.clear();
        object_locations.clear();


        images.resize(3);
        images[0].set_size(400,400);
        images[1].set_size(400,400);
        images[2].set_size(400,400);

        // set all the pixel values to black
        assign_all_pixels(images[0], 0);
        assign_all_pixels(images[1], 0);
        assign_all_pixels(images[2], 0);

        // Now make some squares and draw them onto our black images. All the
        // squares will be 70 pixels wide and tall.
        const int shrink = 0;
        std::vector<full_object_detection> temp;

        rectangle rect = centered_rect(point(100,100), 70,71);
        std::vector<point> movable_parts;
        movable_parts.push_back(shrink_rect(rect,shrink).tl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).tr_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).bl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).br_corner());
        temp.push_back(full_object_detection(rect, movable_parts)); 
        fill_rect(images[0],rect,255); // Paint the square white

        rect = centered_rect(point(200,200), 70,71);
        movable_parts.clear();
        movable_parts.push_back(shrink_rect(rect,shrink).tl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).tr_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).bl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).br_corner());
        temp.push_back(full_object_detection(rect, movable_parts)); 
        fill_rect(images[0],rect,255); // Paint the square white

        object_locations.push_back(temp);
        // ------------------------------------
        temp.clear();

        rect = centered_rect(point(140,200), 70,71);
        movable_parts.clear();
        movable_parts.push_back(shrink_rect(rect,shrink).tl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).tr_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).bl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).br_corner());
        temp.push_back(full_object_detection(rect, movable_parts)); 
        fill_rect(images[1],rect,255); // Paint the square white


        rect = centered_rect(point(303,200), 70,71);
        movable_parts.clear();
        movable_parts.push_back(shrink_rect(rect,shrink).tl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).tr_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).bl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).br_corner());
        temp.push_back(full_object_detection(rect, movable_parts)); 
        fill_rect(images[1],rect,255); // Paint the square white

        object_locations.push_back(temp);
        // ------------------------------------
        temp.clear();

        rect = centered_rect(point(123,121), 70,71);
        movable_parts.clear();
        movable_parts.push_back(shrink_rect(rect,shrink).tl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).tr_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).bl_corner());
        movable_parts.push_back(shrink_rect(rect,shrink).br_corner());
        temp.push_back(full_object_detection(rect, movable_parts)); 
        fill_rect(images[2],rect,255); // Paint the square white

        object_locations.push_back(temp);

        // corrupt each image with random noise just to make this a little more 
        // challenging 
        dlib::rand rnd;
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            for (long r = 0; r < images[i].nr(); ++r)
            {
                for (long c = 0; c < images[i].nc(); ++c)
                {
                    typedef typename image_array_type::type image_type;
                    typedef typename image_type::type type;
                    images[i][r][c] = (type)put_in_range(0,255,images[i][r][c] + 40*rnd.get_random_gaussian());
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void test_fhog_pyramid (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_fhog_pyramid()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef scan_fhog_pyramid<pyramid_down<2> > image_scanner_type;
        image_scanner_type scanner;
        scanner.set_detection_window_size(35,35);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector, 1e-6);
        }

        {
            std::vector<object_detector<image_scanner_type> > detectors;
            detectors.push_back(detector);
            detectors.push_back(detector);
            detectors.push_back(detector);

            std::vector<rectangle> dets1 = evaluate_detectors(detectors, images[0]);
            std::vector<rectangle> dets2 = detector(images[0]);
            DLIB_TEST(dets1.size() > 0);
            DLIB_TEST(dets2.size()*3 == dets1.size());
            dlib::set<rectangle>::kernel_1a_c d1, d2;
            for (unsigned long i = 0; i < dets1.size(); ++i)
            {
                if (!d1.is_member(dets1[i]))
                    d1.add(dets1[i]);
            }
            for (unsigned long i = 0; i < dets2.size(); ++i)
            {
                if (!d2.is_member(dets2[i]))
                    d2.add(dets2[i]);
            }
            DLIB_TEST(d1.size() == d2.size());
            DLIB_TEST(set_intersection_size(d1,d2) == d1.size());
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1 (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<hog_image<3,3,1,4,hog_signed_gradient,hog_full_interpolation> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,35*35);
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1_boxes (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_boxes()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<hog_image<3,3,1,4,hog_signed_gradient,hog_full_interpolation> > feature_extractor_type;
        typedef scan_image_boxes<feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1m (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1m()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<full_object_detection> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<hog_image<3,3,1,4,hog_signed_gradient,hog_full_interpolation> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,35*35);
        std::vector<rectangle> mboxes;
        const int mbox_size = 20;
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,1,1), mboxes);
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1_fine_hog (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_fine_hog()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<fine_hog_image<3,3,2,4,hog_signed_gradient> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,35*35);
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1_poly (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_poly()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<poly_image<2> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,35*35);
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1m_poly (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_poly()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<full_object_detection> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef hashed_feature_image<poly_image<2> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<3>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,35*35);
        std::vector<rectangle> mboxes;
        const int mbox_size = 20;
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        mboxes.push_back(centered_rect(0,0, mbox_size,mbox_size));
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2), mboxes);
        setup_hashed_features(scanner, images, 9);
        use_uniform_feature_weights(scanner);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        trainer.set_overlap_tester(test_box_overlap(0,0));
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1_poly_nn (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_poly_nn()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef nearest_neighbor_feature_image<poly_image<5> > feature_extractor_type;
        typedef scan_image_pyramid<pyramid_down<2>, feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;

        setup_grid_detection_templates(scanner, object_locations, 2, 2);
        feature_extractor_type nnfe;
        pyramid_down<2> pyr_down;
        poly_image<5> polyi;
        nnfe.set_basis(randomly_sample_image_features(images, pyr_down, polyi, 80));
        scanner.copy_configuration(nnfe);

        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_1_poly_nn_boxes (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_1_poly_nn_boxes()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef nearest_neighbor_feature_image<poly_image<5> > feature_extractor_type;
        typedef scan_image_boxes<feature_extractor_type> image_scanner_type;
        image_scanner_type scanner;

        feature_extractor_type nnfe;
        pyramid_down<2> pyr_down;
        poly_image<5> polyi;
        nnfe.set_basis(randomly_sample_image_features(images, pyr_down, polyi, 80));
        scanner.copy_configuration(nnfe);

        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);

            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_2 (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_2()";

        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        grayscale_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images, object_locations);

        typedef scan_image_pyramid<pyramid_down<5>, very_simple_feature_extractor> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,70*70);
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));
        scanner.set_max_pyramid_levels(1);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(0);  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        res = cross_validate_object_detection_trainer(trainer, images, object_locations, 3);
        dlog << LINFO << "3-fold cross validation (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);
            validate_some_object_detector_stuff(images, detector);
        }
    }

// ----------------------------------------------------------------------------------------

    class pyramid_down_funny : noncopyable
    {
        pyramid_down<2> pyr;
    public:

        template <typename T>
        dlib::vector<double,2> point_down ( const dlib::vector<T,2>& p) const { return pyr.point_down(p); }

        template <typename T>
        dlib::vector<double,2> point_up ( const dlib::vector<T,2>& p) const { return pyr.point_up(p); }

        template <typename T>
        dlib::vector<double,2> point_down ( const dlib::vector<T,2>& p, unsigned int levels) const { return pyr.point_down(p,levels); }

        template <typename T>
        dlib::vector<double,2> point_up ( const dlib::vector<T,2>& p, unsigned int levels) const { return pyr.point_up(p,levels); }

        rectangle rect_up ( const rectangle& rect) const { return pyr.rect_up(rect); }

        rectangle rect_up ( const rectangle& rect, unsigned int levels) const { return pyr.rect_up(rect,levels); }

        rectangle rect_down ( const rectangle& rect) const { return pyr.rect_down(rect); }

        rectangle rect_down ( const rectangle& rect, unsigned int levels) const { return pyr.rect_down(rect,levels); }

        template <
            typename in_image_type,
            typename out_image_type
            >
        void operator() (
            const in_image_type& original,
            out_image_type& down
        ) const
        {
            pyr(original.img, down.img);
        }

    };

    // make sure everything works even when the image isn't a dlib::array2d.
    // So test with funny_image.
    void test_3 (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_3()";


        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        typedef dlib::array<funny_image>  funny_image_array_type;
        grayscale_image_array_type images_temp;
        funny_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images_temp, object_locations);
        images.resize(images_temp.size());
        for (unsigned long i = 0; i < images_temp.size(); ++i)
        {
            images[i].img.swap(images_temp[i]);
        }

        typedef scan_image_pyramid<pyramid_down_funny, very_simple_feature_extractor> image_scanner_type;
        image_scanner_type scanner;
        const rectangle object_box = compute_box_dimensions(1,70*70);
        scanner.add_detection_template(object_box, create_grid_detection_template(object_box,2,2));
        scanner.set_max_pyramid_levels(1);
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        res = cross_validate_object_detection_trainer(trainer, images, object_locations, 3);
        dlog << LINFO << "3-fold cross validation (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);
        }
    }

// ----------------------------------------------------------------------------------------

    class funny_box_generator
    {
    public:
        template <typename image_type>
        void operator() (
            const image_type& img,
            std::vector<rectangle>& rects
        ) const
        {
            rects.clear();
            find_candidate_object_locations(img.img, rects);
            dlog << LINFO << "funny_box_generator, rects.size(): "<< rects.size();
        }
    };

    inline void serialize(const funny_box_generator&, std::ostream& ) {}
    inline void deserialize(funny_box_generator&, std::istream& ) {}


    // make sure everything works even when the image isn't a dlib::array2d.
    // So test with funny_image.
    void test_3_boxes (
    )
    {        
        print_spinner();
        dlog << LINFO << "test_3_boxes()";


        typedef dlib::array<array2d<unsigned char> >  grayscale_image_array_type;
        typedef dlib::array<funny_image>  funny_image_array_type;
        grayscale_image_array_type images_temp;
        funny_image_array_type images;
        std::vector<std::vector<rectangle> > object_locations;
        make_simple_test_data(images_temp, object_locations);
        images.resize(images_temp.size());
        for (unsigned long i = 0; i < images_temp.size(); ++i)
        {
            images[i].img.swap(images_temp[i]);
        }

        typedef scan_image_boxes<very_simple_feature_extractor, funny_box_generator> image_scanner_type;
        image_scanner_type scanner;
        structural_object_detection_trainer<image_scanner_type> trainer(scanner);
        trainer.set_num_threads(4);  
        object_detector<image_scanner_type> detector = trainer.train(images, object_locations);

        matrix<double> res = test_object_detection_function(detector, images, object_locations);
        dlog << LINFO << "Test detector (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        res = cross_validate_object_detection_trainer(trainer, images, object_locations, 3);
        dlog << LINFO << "3-fold cross validation (precision,recall): " << res;
        DLIB_TEST(sum(res) == 3);

        {
            ostringstream sout;
            serialize(detector, sout);
            istringstream sin(sout.str());
            object_detector<image_scanner_type> d2;
            deserialize(d2, sin);
            matrix<double> res = test_object_detection_function(d2, images, object_locations);
            dlog << LINFO << "Test detector (precision,recall): " << res;
            DLIB_TEST(sum(res) == 3);
        }
    }

// ----------------------------------------------------------------------------------------

    class object_detector_tester : public tester
    {
    public:
        object_detector_tester (
        ) :
            tester ("test_object_detector",
                    "Runs tests on the structural object detection stuff.")
        {}

        void perform_test (
        )
        {
            test_fhog_pyramid();
            test_1_boxes();
            test_1_poly_nn_boxes();
            test_3_boxes();

            test_1();
            test_1m();
            test_1_fine_hog();
            test_1_poly();
            test_1m_poly();
            test_1_poly_nn();
            test_2();
            test_3();
        }
    } a;

}


