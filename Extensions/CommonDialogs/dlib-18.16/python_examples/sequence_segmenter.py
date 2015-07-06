#!/usr/bin/python
# The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
#
# This example shows how to use dlib to learn to do sequence segmentation.  In
# a sequence segmentation task we are given a sequence of objects (e.g. words in
# a sentence) and we are supposed to detect certain subsequences (e.g. the names
# of people).  Therefore, in the code below we create some very simple training
# sequences and use them to learn a sequence segmentation model.  In particular,
# our sequences will be sentences represented as arrays of words and our task
# will be to learn to identify person names.  Once we have our segmentation
# model we can use it to find names in new sentences, as we will show.
#
# COMPILING THE DLIB PYTHON INTERFACE
#   Dlib comes with a compiled python interface for python 2.7 on MS Windows. If
#   you are using another python version or operating system then you need to
#   compile the dlib python interface before you can use this file.  To do this,
#   run compile_dlib_python_module.bat.  This should work on any operating
#   system so long as you have CMake and boost-python installed.
#   On Ubuntu, this can be done easily by running the command:
#       sudo apt-get install libboost-python-dev cmake
import sys
import dlib


# The sequence segmentation models we work with in this example are chain
# structured conditional random field style models.  Therefore, central to a
# sequence segmentation model is some method for converting the elements of a
# sequence into feature vectors. That is, while you might start out representing
# your sequence as an array of strings, the dlib interface works in terms of
# arrays of feature vectors.  Each feature vector should capture important
# information about its corresponding element in the original raw sequence.  So
# in this example, since we work with sequences of words and want to identify
# names, we will create feature vectors that tell us if the word is capitalized
# or not.  In our simple data, this will be enough to identify names.
# Therefore, we define sentence_to_vectors() which takes a sentence represented
# as a string and converts it into an array of words and then associates a
# feature vector with each word.
def sentence_to_vectors(sentence):
    # Create an empty array of vectors
    vects = dlib.vectors()
    for word in sentence.split():
        # Our vectors are very simple 1-dimensional vectors.  The value of the
        # single feature is 1 if the first letter of the word is capitalized and
        # 0 otherwise.
        if word[0].isupper():
            vects.append(dlib.vector([1]))
        else:
            vects.append(dlib.vector([0]))
    return vects


# Dlib also supports the use of a sparse vector representation.  This is more
# efficient than the above form when you have very high dimensional vectors that
# are mostly full of zeros.  In dlib, each sparse vector is represented as an
# array of pair objects.  Each pair contains an index and value.  Any index not
# listed in the vector is implicitly associated with a value of zero.
# Additionally, when using sparse vectors with dlib.train_sequence_segmenter()
# you can use "unsorted" sparse vectors.  This means you can add the index/value
# pairs into your sparse vectors in any order you want and don't need to worry
# about them being in sorted order.
def sentence_to_sparse_vectors(sentence):
    vects = dlib.sparse_vectors()
    has_cap = dlib.sparse_vector()
    no_cap = dlib.sparse_vector()
    # make has_cap equivalent to dlib.vector([1])
    has_cap.append(dlib.pair(0, 1))

    # Since we didn't add anything to no_cap it is equivalent to
    # dlib.vector([0])
    for word in sentence.split():
        if word[0].isupper():
            vects.append(has_cap)
        else:
            vects.append(no_cap)
    return vects


def print_segment(sentence, names):
    words = sentence.split()
    for name in names:
        for i in name:
            sys.stdout.write(words[i] + " ")
        sys.stdout.write("\n")



# Now let's make some training data.  Each example is a sentence as well as a
# set of ranges which indicate the locations of any names.   
names = dlib.ranges()     # make an array of dlib.range objects.
segments = dlib.rangess() # make an array of arrays of dlib.range objects.
sentences = []

sentences.append("The other day I saw a man named Jim Smith")
# We want to detect person names.  So we note that the name is located within
# the range [8, 10).  Note that we use half open ranges to identify segments.
# So in this case, the segment identifies the string "Jim Smith".
names.append(dlib.range(8, 10))
segments.append(names)
names.clear() # make names empty for use again below

sentences.append("Davis King is the main author of the dlib Library")
names.append(dlib.range(0, 2))
segments.append(names)
names.clear()

sentences.append("Bob Jones is a name and so is George Clinton")
names.append(dlib.range(0, 2))
names.append(dlib.range(8, 10))
segments.append(names)
names.clear()

sentences.append("My dog is named Bob Barker")
names.append(dlib.range(4, 6))
segments.append(names)
names.clear()

sentences.append("ABC is an acronym but John James Smith is a name")
names.append(dlib.range(5, 8))
segments.append(names)
names.clear()

sentences.append("No names in this sentence at all")
segments.append(names)
names.clear()


# Now before we can pass these training sentences to the dlib tools we need to
# convert them into arrays of vectors as discussed above.  We can use either a
# sparse or dense representation depending on our needs.  In this example, we
# show how to do it both ways.
use_sparse_vects = False
if use_sparse_vects:
    # Make an array of arrays of dlib.sparse_vector objects.
    training_sequences = dlib.sparse_vectorss()
    for s in sentences:
        training_sequences.append(sentence_to_sparse_vectors(s))
else:
    # Make an array of arrays of dlib.vector objects.
    training_sequences = dlib.vectorss()
    for s in sentences:
        training_sequences.append(sentence_to_vectors(s))

# Now that we have a simple training set we can train a sequence segmenter.
# However, the sequence segmentation trainer has some optional parameters we can
# set.  These parameters determine properties of the segmentation model we will
# learn.  See the dlib documentation for the sequence_segmenter object for a
# full discussion of their meanings.
params = dlib.segmenter_params()
params.window_size = 3
params.use_high_order_features = True
params.use_BIO_model = True
# This is the common SVM C parameter.  Larger values encourage the trainer to
# attempt to fit the data exactly but might overfit.  In general, you determine
# this parameter by cross-validation.
params.C = 10

# Train a model.  The model object is responsible for predicting the locations
# of names in new sentences.
model = dlib.train_sequence_segmenter(training_sequences, segments, params)

# Let's print out the things the model thinks are names.  The output is a set
# of ranges which are predicted to contain names.  If you run this example
# program you will see that it gets them all correct.
for i, s in enumerate(sentences):
    print_segment(s, model(training_sequences[i]))

# Let's also try segmenting a new sentence.  This will print out "Bob Bucket".
# Note that we need to remember to use the same vector representation as we used
# during training.
test_sentence = "There once was a man from Nantucket " \
                "whose name rhymed with Bob Bucket"
if use_sparse_vects:
    print_segment(test_sentence,
                  model(sentence_to_sparse_vectors(test_sentence)))
else:
    print_segment(test_sentence, model(sentence_to_vectors(test_sentence)))

# We can also measure the accuracy of a model relative to some labeled data.
# This statement prints the precision, recall, and F1-score of the model
# relative to the data in training_sequences/segments.
print("Test on training data: {}".format(
      dlib.test_sequence_segmenter(model, training_sequences, segments)))

# We can also do 5-fold cross-validation and print the resulting precision,
# recall, and F1-score.
print("Cross validation: {}".format(
      dlib.cross_validate_sequence_segmenter(training_sequences, segments, 5,
                                             params)))
