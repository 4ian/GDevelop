// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the GUI API as well as some 
    aspects of image manipulation from the dlib C++ Library.


    This is a pretty simple example.  It takes a BMP file on the command line
    and opens it up, runs a simple edge detection algorithm on it, and 
    displays the results on the screen.  
*/



#include "dlib/gui_widgets.h"
#include "dlib/image_io.h"
#include "dlib/image_transforms.h"
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


        // Now lets use some image functions.  First lets blur the image a little.
        array2d<unsigned char> blurred_img;
        gaussian_blur(img, blurred_img); 

        // Now find the horizontal and vertical gradient images.
        array2d<short> horz_gradient, vert_gradient;
        array2d<unsigned char> edge_image;
        sobel_edge_detector(blurred_img, horz_gradient, vert_gradient);

        // now we do the non-maximum edge suppression step so that our edges are nice and thin
        suppress_non_maximum_edges(horz_gradient, vert_gradient, edge_image); 

        // Now we would like to see what our images look like.  So lets use a 
        // window to display them on the screen.  (Note that you can zoom into 
        // the window by holding CTRL and scrolling the mouse wheel)
        image_window my_window(edge_image);

        // We can also easily display the edge_image as a heatmap like so.
        image_window win_hot(heatmap(edge_image, 255));
        win_hot.set_title("heatmap version of edge image");

        // also make a window to display the original image
        image_window my_window2(img);

        // wait until the user closes the windows before we let the program 
        // terminate.
        my_window.wait_until_closed();
        win_hot.wait_until_closed();
        my_window2.wait_until_closed();
    }
    catch (exception& e)
    {
        cout << "exception thrown: " << e.what() << endl;
    }
}

//  ----------------------------------------------------------------------------

