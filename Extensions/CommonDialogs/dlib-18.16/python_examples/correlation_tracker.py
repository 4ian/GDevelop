#!/usr/bin/python
# The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
#
# This example shows how to use the correlation_tracker from the dlib Python
# library.  This object lets you track the position of an object as it moves
# from frame to frame in a video sequence.  To use it, you give the
# correlation_tracker the bounding box of the object you want to track in the
# current video frame.  Then it will identify the location of the object in
# subsequent frames.
#
# In this particular example, we are going to run on the
# video sequence that comes with dlib, which can be found in the
# examples/video_frames folder.  This video shows a juice box sitting on a table
# and someone is waving the camera around.  The task is to track the position of
# the juice box as the camera moves around.
#
# COMPILING THE DLIB PYTHON INTERFACE
#   Dlib comes with a compiled python interface for python 2.7 on MS Windows. If
#   you are using another python version or operating system then you need to
#   compile the dlib python interface before you can use this file.  To do this,
#   run compile_dlib_python_module.bat.  This should work on any operating
#   system so long as you have CMake and boost-python installed.
#   On Ubuntu, this can be done easily by running the command:
#       sudo apt-get install libboost-python-dev cmake
#
#   Also note that this example requires scikit-image which can be installed
#   via the command:
#       pip install -U scikit-image
#   Or downloaded from http://scikit-image.org/download.html. 

import os
import glob

import dlib
from skimage import io

# Path to the video frames
video_folder = os.path.join("..", "examples", "video_frames")

# Create the correlation tracker - the object needs to be initialized
# before it can be used
tracker = dlib.correlation_tracker()

win = dlib.image_window()
# We will track the frames as we load them off of disk
for k, f in enumerate(sorted(glob.glob(os.path.join(video_folder, "*.jpg")))):
    print("Processing Frame {}".format(k))
    img = io.imread(f)

    # We need to initialize the tracker on the first frame
    if k == 0:
        # Start a track on the juice box. If you look at the first frame you
        # will see that the juice box is contained within the bounding
        # box (74, 67, 112, 153).
        tracker.start_track(img, dlib.rectangle(74, 67, 112, 153))
    else:
        # Else we just attempt to track from the previous frame
        tracker.update(img)

    win.clear_overlay()
    win.set_image(img)
    win.add_overlay(tracker.get_position())
    dlib.hit_enter_to_continue()
