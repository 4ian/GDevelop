// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is a simple example illustrating the use of the get_surf_points()
    function.  It pulls out the first 100 SURF points from an input image 
    and displays them on the screen as an overlay on the image.

    For a description of the SURF algorithm you should consult the following
    papers:
        This is the original paper which introduced the algorithm:
            SURF: Speeded Up Robust Features
            By Herbert Bay, Tinne Tuytelaars, and Luc Van Gool

        This paper provides a nice detailed overview of how the algorithm works:
            Notes on the OpenSURF Library by Christopher Evans

*/



#include "dlib/gui_widgets.h"
#include "dlib/image_io.h"
#include "dlib/image_keypoint.h"
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

        // Here we declare an image object that can store rgb_pixels.  Note that in 
        // dlib there is no explicit image object, just a 2D array and
        // various pixel types.  
        array2d<rgb_pixel> img;

        // Now load the image file into our image.  If something is wrong then
        // load_image() will throw an exception.  Also, if you linked with libpng
        // and libjpeg then load_image() can load PNG and JPEG files in addition
        // to BMP files. 
        load_image(img, argv[1]);

        // get the 100 strongest SURF points from the image
        std::vector<surf_point> sp = get_surf_points(img, 100);

        // create a window to display the input image and the SURF boxes.  (Note that
        // you can zoom into the window by holding CTRL and scrolling the mouse wheel)
        image_window my_window(img);

        // Now lets draw some rectangles on top of the image so we can see where
        // SURF found its points.
        for (unsigned long i = 0; i < sp.size(); ++i)
        {
            // Pull out the info from the SURF point relevant to figuring out
            // where its rotated box should be.
            const unsigned long box_size = static_cast<unsigned long>(sp[i].p.scale*20);
            const double ang = sp[i].angle;
            const point center(sp[i].p.center);
            const rectangle rect = centered_rect(center, box_size, box_size); 

            // Rotate the 4 corners of the rectangle 
            const point p1 = rotate_point(center, rect.tl_corner(), ang);
            const point p2 = rotate_point(center, rect.tr_corner(), ang);
            const point p3 = rotate_point(center, rect.bl_corner(), ang);
            const point p4 = rotate_point(center, rect.br_corner(), ang);

            // Draw the sides of the box as red lines
            my_window.add_overlay(p1, p2, rgb_pixel(255,0,0));
            my_window.add_overlay(p1, p3, rgb_pixel(255,0,0));
            my_window.add_overlay(p4, p2, rgb_pixel(255,0,0));
            my_window.add_overlay(p4, p3, rgb_pixel(255,0,0));

            // Draw a line from the center to the top side so we can see how the box is oriented.
            // Also make this line green.
            my_window.add_overlay(center, (p1+p2)/2, rgb_pixel(0,255,0));
        }

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

