// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the Hough transform tool in the
    dlib C++ Library.


    In this example we are going to draw a line on an image and then use the
    Hough transform to detect the location of the line.  Moreover, we do this in
    a loop that changes the line's position slightly each iteration, which gives
    a pretty animation of the Hough transform in action.
*/

#include <dlib/gui_widgets.h>
#include <dlib/image_transforms.h>

using namespace dlib;

int main()
{
    // First let's make a 400x400 image.  This will form the input to the Hough transform.
    array2d<unsigned char> img(400,400);
    // Now we make a hough_transform object.  The 300 here means that the Hough transform
    // will operate on a 300x300 subwindow of its input image.  
    hough_transform ht(300);

    image_window win, win2;
    double angle1 = 0;
    double angle2 = 0;
    while(true)
    {
        // Generate a line segment that is rotating around inside the image.  The line is
        // generated based on the values in angle1 and angle2. So each iteration creates a
        // slightly different line.
        angle1 += pi/130;
        angle2 += pi/400;
        const point cent = center(get_rect(img));  
        // A point 90 pixels away from the center of the image but rotated by angle1.
        const point arc = rotate_point(cent, cent + point(90,0), angle1); 
        // Now make a line that goes though arc but rotate it by angle2.
        const point l = rotate_point(arc, arc + point(500,0), angle2);
        const point r = rotate_point(arc, arc - point(500,0), angle2);


        // Next, blank out the input image and then draw our line on it.
        assign_all_pixels(img, 0);
        draw_line(img, l, r, 255);

         
        const point offset(50,50);
        array2d<int> himg;
        // pick the window inside img on which we will run the Hough transform.
        const rectangle box = translate_rect(get_rect(ht),offset);
        // Now let's compute the hough transform for a subwindow in the image.  In
        // particular, we run it on the 300x300 subwindow with an upper left corner at the
        // pixel point(50,50).  The output is stored in himg.
        ht(img, box, himg);
        // Now that we have the transformed image, the Hough image pixel with the largest
        // value should indicate where the line is.  So we find the coordinates of the
        // largest pixel:
        point p = max_point(mat(himg));
        // And then ask the ht object for the line segment in the original image that
        // corresponds to this point in Hough transform space.
        std::pair<point,point> line = ht.get_line(p);

        // Finally, let's display all these things on the screen.  We copy the original
        // input image into a color image and then draw the detected line on top in red.
        array2d<rgb_pixel> temp;
        assign_image(temp, img);
        // Note that we must offset the output line to account for our offset subwindow.
        // We do this by just adding in the offset to the line endpoints. 
        draw_line(temp, line.first+offset, line.second+offset, rgb_pixel(255,0,0));
        win.clear_overlay();
        win.set_image(temp);
        // Also show the subwindow we ran the Hough transform on as a green box.  You will
        // see that the detected line is exactly contained within this box and also
        // overlaps the original line.
        win.add_overlay(box, rgb_pixel(0,255,0));

        // We can also display the Hough transform itself using the jet color scheme.
        win2.set_image(jet(himg));
    }
}

