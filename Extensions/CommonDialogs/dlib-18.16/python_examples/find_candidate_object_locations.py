#!/usr/bin/python
#
# This example shows how to use find_candidate_object_locations().  The
# function takes an input image and generates a set of candidate rectangles
# which are expected to bound any objects in the image.
# It is based on the paper:
#    Segmentation as Selective Search for Object Recognition by Koen E. A. van de Sande, et al.
#
# Typically, you would use this as part of an object detection pipeline.
# find_candidate_object_locations() nominates boxes that might contain an
# object and you then run some expensive classifier on each one and throw away
# the false alarms.  Since find_candidate_object_locations() will only generate
# a few thousand rectangles it is much faster than scanning all possible
# rectangles inside an image.
#
#   Also note that this example requires scikit-image which can be installed
#   via the command:
#       pip install -U scikit-image
#   Or downloaded from http://scikit-image.org/download.html. 



import dlib
from skimage import io

image_file = '../examples/faces/2009_004587.jpg'
img = io.imread(image_file)

# Locations of candidate objects will be saved into rects
rects = []
dlib.find_candidate_object_locations(img, rects, min_size=500)

print("number of rectangles found {}".format(len(rects))) 
for k, d in enumerate(rects):
    print("Detection {}: Left: {} Top: {} Right: {} Bottom: {}".format(
        k, d.left(), d.top(), d.right(), d.bottom()))
