/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui_bitmaps.cpp

Draws the hardcoded images listed in glui_bitmap_img_data with OpenGL.

FIXME: upload the images to a texture.  This will allow them to be:
	- Drawn with alpha blending
	- Drawn at random sizes and angles onscreen
	- Drawn much faster than with glDrawPixels

 --------------------------------------------------

  Copyright (c) 1998 Paul Rademacher

  WWW:    http://sourceforge.net/projects/glui/
  Forums: http://sourceforge.net/forum/?group_id=92496

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

*****************************************************************************/

#include "GL/glui.h"
#include "glui_internal.h"
#include <cassert>

/************ Image Bitmap arrays **********/

extern unsigned char glui_img_checkbox_0[];
extern unsigned char glui_img_checkbox_1[];
extern unsigned char glui_img_radiobutton_0[];
extern unsigned char glui_img_radiobutton_1[];
extern unsigned char glui_img_uparrow[];
extern unsigned char glui_img_downarrow[];
extern unsigned char glui_img_leftarrow[];
extern unsigned char glui_img_rightarrow[];
extern unsigned char glui_img_spinup_0[];
extern unsigned char glui_img_spinup_1[];
extern unsigned char glui_img_spindown_0[];
extern unsigned char glui_img_spindown_1[];
extern unsigned char glui_img_checkbox_0_dis[];
extern unsigned char glui_img_checkbox_1_dis[];
extern unsigned char glui_img_radiobutton_0_dis[];
extern unsigned char glui_img_radiobutton_1_dis[];
extern unsigned char glui_img_spinup_dis[];
extern unsigned char glui_img_spindown_dis[];
extern unsigned char glui_img_listbox_up[];
extern unsigned char glui_img_listbox_down[];
extern unsigned char glui_img_listbox_up_dis[];


// These must be in the same order as the GLUI_STDBITMAP enums from glui.h!
unsigned char *bitmap_arrays[] = {  
  glui_img_checkbox_0,
  glui_img_checkbox_1,
  glui_img_radiobutton_0,
  glui_img_radiobutton_1,
  glui_img_uparrow,
  glui_img_downarrow,
  glui_img_leftarrow,
  glui_img_rightarrow,
  glui_img_spinup_0,
  glui_img_spinup_1,
  glui_img_spindown_0,
  glui_img_spindown_1,
  glui_img_checkbox_0_dis,
  glui_img_checkbox_1_dis,
  glui_img_radiobutton_0_dis,
  glui_img_radiobutton_1_dis,
  glui_img_spinup_dis,
  glui_img_spindown_dis,
  glui_img_listbox_up,
  glui_img_listbox_down,
  glui_img_listbox_up_dis,
};


/************************************ GLUI_Bitmap::load_from_array() ********/

GLUI_Bitmap::GLUI_Bitmap() 
:   pixels(NULL),
    w(0), 
    h(0)
{
}

GLUI_Bitmap::~GLUI_Bitmap()
{
	if (pixels)
	{
		free(pixels);
		pixels = NULL;
	}
}

/* Create bitmap from greyscale byte array */
void GLUI_Bitmap::init_grey(unsigned char *array)
{
	w = array[0]; h = array[1];
	pixels = (unsigned char *) malloc(w*h*3);
	assert(pixels);

	for(int i = 0; i<w*h; i++ ) 
		for (int j = 0; j<3; j++) /* copy grey to r,g,b channels */
			pixels[i*3+j] = (unsigned char) array[i+2];
}


/* Create bitmap from color int array.
  (OSL) This used to be how all GLUI bitmaps were stored, which was horribly
  inefficient--three ints per pixel, or 12 bytes per pixel!
*/
void GLUI_Bitmap::init(int *array)
{
	w = array[0]; h = array[1];
	pixels = (unsigned char *) malloc(w*h*3);
	assert(pixels);

	for (int i = 0; i<w*h*3; i++)
		pixels[i] = (unsigned char) array[i+2];
}


/*********************************** GLUI_StdBitmaps::draw() *****************/

GLUI_StdBitmaps::GLUI_StdBitmaps() 
{
    for (int i=0; i<GLUI_STDBITMAP_NUM_ITEMS; i++) 
        bitmaps[i].init_grey(bitmap_arrays[i]);
}

GLUI_StdBitmaps::~GLUI_StdBitmaps()
{
}

int GLUI_StdBitmaps::width(int i) const
{
	assert(i>=0 && i<GLUI_STDBITMAP_NUM_ITEMS);
	return bitmaps[i].w;
}

int GLUI_StdBitmaps::height(int i) const
{
	assert(i>=0 && i<GLUI_STDBITMAP_NUM_ITEMS);
	return bitmaps[i].h;
}

void GLUI_StdBitmaps::draw(int i, int x, int y) const
{
	assert(i>=0 && i<GLUI_STDBITMAP_NUM_ITEMS);

	if (bitmaps[i].pixels != NULL ) 
	{
		glPixelStorei(GL_UNPACK_ALIGNMENT,1);
		glRasterPos2f(0.5f+x, 0.5f+y+bitmaps[i].h);
		glDrawPixels( 
			bitmaps[i].w, bitmaps[i].h,
			GL_RGB, GL_UNSIGNED_BYTE, bitmaps[i].pixels); 
	}
}

