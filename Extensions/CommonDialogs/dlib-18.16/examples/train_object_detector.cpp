// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example showing how you might use dlib to create a reasonably 
    functional command line tool for object detection.  This example assumes 
    you are familiar with the contents of at least the following example 
    programs:
        - fhog_object_detector_ex.cpp
        - compress_stream_ex.cpp




    This program is a command line tool for learning to detect objects in images.  
    Therefore, to create an object detector it requires a set of annotated training 
    images.  To create this annotated data you will need to use the imglab tool 
    included with dlib.  It is located in the tools/imglab folder and can be compiled
    using the following commands.  
        cd tools/imglab
        mkdir build
        cd build
        cmake ..
        cmake --build . --config Release
    Note that you may need to install CMake (www.cmake.org) for this to work.  

    Next, let's assume you have a folder of images called /tmp/images.  These images 
    should contain examples of the objects you want to learn to detect.  You will 
    use the imglab tool to label these objects.  Do this by typing the following
        ./imglab -c mydataset.xml /tmp/images
    This will create a file called mydataset.xml which simply lists the images in 
    /tmp/images.  To annotate them run
        ./imglab mydataset.xml
    A window will appear showing all the images.  You can use the up and down arrow 
    keys to cycle though the images and the mouse to label objects.  In particular, 
    holding the shift key, left clicking, and dragging the mouse will allow you to 
    draw boxes around the objects you wish to detect.  So next, label all the objects 
    with boxes.  Note that it is important to label all the objects since any object 
    not labeled is implicitly assumed to be not an object we should detect.  If there
    are objects you are not sure about you should draw a box around them, then double
    click the box and press i.  This will cross out the box and mark it as "ignore".
    The training code in dlib will then simply ignore detections matching that box.
    

    Once you finish labeling objects go to the file menu, click save, and then close 
    the program. This will save the object boxes back to mydataset.xml.  You can verify 
    this by opening the tool again with
        ./imglab mydataset.xml
    and observing that the boxes are present.

    Returning to the present example program, we can compile it using cmake just as we 
    did with the imglab tool.  Once compiled, we can issue the command 
        ./train_object_detector -tv mydataset.xml
    which will train an object detection model based on our labeled data.  The model 
    will be saved to the file object_detector.svm.  Once this has finished we can use 
    the object detector to locate objects in new images with a command like
        ./train_object_detector some_image.png
    This command will display some_image.png in a window and any detected objects will
    be indicated by a red box.

    Finally, to make running this example easy dlib includes some training data in the
    examples/faces folder.  Therefore, you can test this program out by running the
    following sequence of commands:
      ./train_object_detector -tv examples/faces/training.xml -u1 --flip
      ./train_object_detector --test examples/faces/testing.xml -u1
      ./train_object_detector examples/faces/*.jpg -u1
    That will make a face detector that performs perfectly on the test images listed in
    testing.xml and then it will show you the detections on all the images.
*/


#include <dlib/svm_threaded.h>
#include <dlib/string.h>
#include <dlib/gui_widgets.h>
#include <dlib/image_processing.h>
#include <dlib/data_io.h>
#include <dlib/cmd_line_parser.h>


#include <iostream>
#include <fstream>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

void pick_best_window_size (
    const std::vector<std::vector<rectangle> >& boxes,
    unsigned long& width,
    unsigned long& height,
    const unsigned long target_size
)
/*!
    ensures
        - Finds the average aspect ratio of the elements of boxes and outputs a width
          and height such that the aspect ratio is equal to the average and also the
          area is equal to target_size.  That is, the following will be approximately true:
            - #width*#height == target_size
            - #width/#height == the average aspect ratio of the elements of boxes.
!*/
{
    // find the average width and height
    running_stats<double> avg_width, avg_height;
    for (unsigned long i = 0; i < boxes.size(); ++i)
    {
        for (unsigned long j = 0; j < boxes[i].size(); ++j)
        {
            avg_width.add(boxes[i][j].width());
            avg_height.add(boxes[i][j].height());
        }
    }

    // now adjust the box size so that it is about target_pixels pixels in size
    double size = avg_width.mean()*avg_height.mean();
    double scale = std::sqrt(target_size/size);

    width = (unsigned long)(avg_width.mean()*scale+0.5);
    height = (unsigned long)(avg_height.mean()*scale+0.5);
    // make sure the width and height never round to zero.
    if (width == 0)
        width = 1;
    if (height == 0)
        height = 1;
}

// ----------------------------------------------------------------------------------------

bool contains_any_boxes (
    const std::vector<std::vector<rectangle> >& boxes
)
{
    for (unsigned long i = 0; i < boxes.size(); ++i)
    {
        if (boxes[i].size() != 0)
            return true;
    }
    return false;
}

// ----------------------------------------------------------------------------------------

void throw_invalid_box_error_message (
    const std::string& dataset_filename,
    const std::vector<std::vector<rectangle> >& removed,
    const unsigned long target_size
)
{
    image_dataset_metadata::dataset data;
    load_image_dataset_metadata(data, dataset_filename);

    std::ostringstream sout;
    sout << "Error!  An impossible set of object boxes was given for training. ";
    sout << "All the boxes need to have a similar aspect ratio and also not be ";
    sout << "smaller than about " << target_size << " pixels in area. ";
    sout << "The following images contain invalid boxes:\n";
    std::ostringstream sout2;
    for (unsigned long i = 0; i < removed.size(); ++i)
    {
        if (removed[i].size() != 0)
        {
            const std::string imgname = data.images[i].filename;
            sout2 << "  " << imgname << "\n";
        }
    }
    throw error("\n"+wrap_string(sout.str()) + "\n" + sout2.str());
}

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{  
    try
    {
        command_line_parser parser;
        parser.add_option("h","Display this help message.");
        parser.add_option("t","Train an object detector and save the detector to disk.");
        parser.add_option("cross-validate",
                          "Perform cross-validation on an image dataset and print the results.");
        parser.add_option("test", "Test a trained detector on an image dataset and print the results.");
        parser.add_option("u", "Upsample each input image <arg> times. Each upsampling quadruples the number of pixels in the image (default: 0).", 1);

        parser.set_group_name("training/cross-validation sub-options");
        parser.add_option("v","Be verbose.");
        parser.add_option("folds","When doing cross-validation, do <arg> folds (default: 3).",1);
        parser.add_option("c","Set the SVM C parameter to <arg> (default: 1.0).",1);
        parser.add_option("threads", "Use <arg> threads for training (default: 4).",1);
        parser.add_option("eps", "Set training epsilon to <arg> (default: 0.01).", 1);
        parser.add_option("target-size", "Set size of the sliding window to about <arg> pixels in area (default: 80*80).", 1);
        parser.add_option("flip", "Add left/right flipped copies of the images into the training dataset.  Useful when the objects "
            "you want to detect are left/right symmetric.");


        parser.parse(argc, argv);

        // Now we do a little command line validation.  Each of the following functions
        // checks something and throws an exception if the test fails.
        const char* one_time_opts[] = {"h", "v", "t", "cross-validate", "c", "threads", "target-size",
                                        "folds", "test", "eps", "u", "flip"};
        parser.check_one_time_options(one_time_opts); // Can't give an option more than once
        // Make sure the arguments to these options are within valid ranges if they are supplied by the user.
        parser.check_option_arg_range("c", 1e-12, 1e12);
        parser.check_option_arg_range("eps", 1e-5, 1e4);
        parser.check_option_arg_range("threads", 1, 1000);
        parser.check_option_arg_range("folds", 2, 100);
        parser.check_option_arg_range("u", 0, 8);
        parser.check_option_arg_range("target-size", 4*4, 10000*10000);
        const char* incompatible[] = {"t", "cross-validate", "test"};
        parser.check_incompatible_options(incompatible);
        // You are only allowed to give these training_sub_ops if you also give either -t or --cross-validate.
        const char* training_ops[] = {"t", "cross-validate"};
        const char* training_sub_ops[] = {"v", "c", "threads", "target-size", "eps", "flip"};
        parser.check_sub_options(training_ops, training_sub_ops); 
        parser.check_sub_option("cross-validate", "folds"); 


        if (parser.option("h"))
        {
            cout << "Usage: train_object_detector [options] <image dataset file|image file>\n";
            parser.print_options(); 
                                       
            return EXIT_SUCCESS;
        }


        typedef scan_fhog_pyramid<pyramid_down<6> > image_scanner_type; 
        // Get the upsample option from the user but use 0 if it wasn't given.
        const unsigned long upsample_amount = get_option(parser, "u", 0);

        if (parser.option("t") || parser.option("cross-validate"))
        {
            if (parser.number_of_arguments() != 1)
            {
                cout << "You must give an image dataset metadata XML file produced by the imglab tool." << endl;
                cout << "\nTry the -h option for more information." << endl;
                return EXIT_FAILURE;
            }

            dlib::array<array2d<unsigned char> > images;
            std::vector<std::vector<rectangle> > object_locations, ignore;

            cout << "Loading image dataset from metadata file " << parser[0] << endl;
            ignore = load_image_dataset(images, object_locations, parser[0]);
            cout << "Number of images loaded: " << images.size() << endl;

            // Get the options from the user, but use default values if they are not
            // supplied.
            const int threads = get_option(parser, "threads", 4);
            const double C   = get_option(parser, "c", 1.0);
            const double eps = get_option(parser, "eps", 0.01);
            unsigned int num_folds = get_option(parser, "folds", 3);
            const unsigned long target_size = get_option(parser, "target-size", 80*80);
            // You can't do more folds than there are images.  
            if (num_folds > images.size())
                num_folds = images.size();

            // Upsample images if the user asked us to do that.
            for (unsigned long i = 0; i < upsample_amount; ++i)
                upsample_image_dataset<pyramid_down<2> >(images, object_locations, ignore);


            image_scanner_type scanner;
            unsigned long width, height;
            pick_best_window_size(object_locations, width, height, target_size);
            scanner.set_detection_window_size(width, height); 

            structural_object_detection_trainer<image_scanner_type> trainer(scanner);
            trainer.set_num_threads(threads);
            if (parser.option("v"))
                trainer.be_verbose();
            trainer.set_c(C);
            trainer.set_epsilon(eps);

            // Now make sure all the boxes are obtainable by the scanner.  
            std::vector<std::vector<rectangle> > removed;
            removed = remove_unobtainable_rectangles(trainer, images, object_locations);
            // if we weren't able to get all the boxes to match then throw an error 
            if (contains_any_boxes(removed))
            {
                unsigned long scale = upsample_amount+1;
                scale = scale*scale;
                throw_invalid_box_error_message(parser[0], removed, target_size/scale);
            }

            if (parser.option("flip"))
                add_image_left_right_flips(images, object_locations, ignore);

            if (parser.option("t"))
            {
                // Do the actual training and save the results into the detector object.  
                object_detector<image_scanner_type> detector = trainer.train(images, object_locations, ignore);

                cout << "Saving trained detector to object_detector.svm" << endl;
                serialize("object_detector.svm") << detector;

                cout << "Testing detector on training data..." << endl;
                cout << "Test detector (precision,recall,AP): " << test_object_detection_function(detector, images, object_locations) << endl;
            }
            else
            {
                // shuffle the order of the training images
                randomize_samples(images, object_locations);

                cout << num_folds << "-fold cross validation (precision,recall,AP): "
                     << cross_validate_object_detection_trainer(trainer, images, object_locations, ignore, num_folds) << endl;
            }

            cout << "Parameters used: " << endl;
            cout << "  threads:                 "<< threads << endl;
            cout << "  C:                       "<< C << endl;
            cout << "  eps:                     "<< eps << endl;
            cout << "  target-size:             "<< target_size << endl;
            cout << "  detection window width:  "<< width << endl;
            cout << "  detection window height: "<< height << endl;
            cout << "  upsample this many times : "<< upsample_amount << endl;
            if (parser.option("flip"))
                cout << "  trained using left/right flips." << endl;
            if (parser.option("cross-validate"))
                cout << "  num_folds: "<< num_folds << endl;
            cout << endl;

            return EXIT_SUCCESS;
        }







        // The rest of the code is devoted to testing an already trained object detector.

        if (parser.number_of_arguments() == 0)
        {
            cout << "You must give an image or an image dataset metadata XML file produced by the imglab tool." << endl;
            cout << "\nTry the -h option for more information." << endl;
            return EXIT_FAILURE;
        }

        // load a previously trained object detector and try it out on some data
        ifstream fin("object_detector.svm", ios::binary);
        if (!fin)
        {
            cout << "Can't find a trained object detector file object_detector.svm. " << endl;
            cout << "You need to train one using the -t option." << endl;
            cout << "\nTry the -h option for more information." << endl;
            return EXIT_FAILURE;

        }
        object_detector<image_scanner_type> detector;
        deserialize(detector, fin);

        dlib::array<array2d<unsigned char> > images;
        // Check if the command line argument is an XML file
        if (tolower(right_substr(parser[0],".")) == "xml")
        {
            std::vector<std::vector<rectangle> > object_locations, ignore;
            cout << "Loading image dataset from metadata file " << parser[0] << endl;
            ignore = load_image_dataset(images, object_locations, parser[0]);
            cout << "Number of images loaded: " << images.size() << endl;

            // Upsample images if the user asked us to do that.
            for (unsigned long i = 0; i < upsample_amount; ++i)
                upsample_image_dataset<pyramid_down<2> >(images, object_locations, ignore);

            if (parser.option("test"))
            {
                cout << "Testing detector on data..." << endl;
                cout << "Results (precision,recall,AP): " << test_object_detection_function(detector, images, object_locations, ignore) << endl;
                return EXIT_SUCCESS;
            }
        }
        else
        {
            // In this case, the user should have given some image files.  So just
            // load them.
            images.resize(parser.number_of_arguments());
            for (unsigned long i = 0; i < images.size(); ++i)
                load_image(images[i], parser[i]);

            // Upsample images if the user asked us to do that.
            for (unsigned long i = 0; i < upsample_amount; ++i)
            {
                for (unsigned long j = 0; j < images.size(); ++j)
                    pyramid_up(images[j]);
            }
        }


        // Test the detector on the images we loaded and display the results
        // in a window.
        image_window win;
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            // Run the detector on images[i] 
            const std::vector<rectangle> rects = detector(images[i]);
            cout << "Number of detections: "<< rects.size() << endl;

            // Put the image and detections into the window.
            win.clear_overlay();
            win.set_image(images[i]);
            win.add_overlay(rects, rgb_pixel(255,0,0));

            cout << "Hit enter to see the next image.";
            cin.get();
        }


    }
    catch (exception& e)
    {
        cout << "\nexception thrown!" << endl;
        cout << e.what() << endl;
        cout << "\nTry the -h option for more information." << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

// ----------------------------------------------------------------------------------------

