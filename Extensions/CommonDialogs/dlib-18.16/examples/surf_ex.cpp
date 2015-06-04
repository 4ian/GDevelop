// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is a simple example illustrating the use of the get_surf_points() function.  It
    pulls out SURF points from an input image and displays them on the screen as an overlay
    on the image.

    For a description of the SURF algorithm you should consult the following papers:
        This is the original paper which introduced the algorithm:
            SURF: Speeded Up Robust Features
            By Herbert Bay, Tinne Tuytelaars, and Luc Van Gool

        This paper provides a nice detailed overview of how the algorithm works:
            Notes on the OpenSURF Library by Christopher Evans

*/



#include <dlib/image_keypoint/draw_surf_points.h>
#include <dlib/image_io.h>
#include <dlib/image_keypoint.h>
#include <fstream>


using namespace std;
using namespace dlib;

//  ----------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {
        // make sure the user entered an argument to this program
        if (argc != 2)
        {
            cout << "error, you have to enter a BMP file as an argument to this program" << endl;
            return 1;
        }

        // Here we declare an image object that can store rgb_pixels.  Note that in dlib
        // there is no explicit image object, just a 2D array and various pixel types.  
        array2d<rgb_pixel> img;

        // Now load the image file into our image.  If something is wrong then load_image()
        // will throw an exception.  Also, if you linked with libpng and libjpeg then
        // load_image() can load PNG and JPEG files in addition to BMP files. 
        load_image(img, argv[1]);

        // Get SURF points from the image.  Note that get_surf_points() has some optional
        // arguments that allow you to control the number of points you get back.  Here we
        // simply take the default.
        std::vector<surf_point> sp = get_surf_points(img);
        cout << "number of SURF points found: "<< sp.size() << endl;

        if (sp.size() > 0)
        {
            // A surf_point object contains a lot of information describing each point.
            // The most important fields are shown below:
            cout << "center of first SURF point: "<< sp[0].p.center << endl;
            cout << "pyramid scale:     " << sp[0].p.scale << endl;
            cout << "SURF descriptor: \n" << sp[0].des << endl;
        }

        // Create a window to display the input image and the SURF points.  (Note that
        // you can zoom into the window by holding CTRL and scrolling the mouse wheel)
        image_window my_window(img);
        draw_surf_points(my_window, sp);

        // wait until the user closes the window before we let the program 
        // terminate.
        my_window.wait_until_closed();
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
    }
}

//  ----------------------------------------------------------------------------

