#!/usr/bin/python
# The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
#
# 
# This is an example illustrating the use of the SVM-Rank tool from the dlib C++
# Library.  This is a tool useful for learning to rank objects.  For example,
# you might use it to learn to rank web pages in response to a user's query.
# The idea being to rank the most relevant pages higher than non-relevant pages.
# 
# In this example, we will create a simple test dataset and show how to learn a
# ranking function from it.  The purpose of the function will be to give
# "relevant" objects higher scores than "non-relevant" objects.  The idea is
# that you use this score to order the objects so that the most relevant objects
# come to the top of the ranked list.
#
# COMPILING THE DLIB PYTHON INTERFACE
#   Dlib comes with a compiled python interface for python 2.7 on MS Windows. If
#   you are using another python version or operating system then you need to
#   compile the dlib python interface before you can use this file.  To do this,
#   run compile_dlib_python_module.bat.  This should work on any operating
#   system so long as you have CMake and boost-python installed.
#   On Ubuntu, this can be done easily by running the command:
#       sudo apt-get install libboost-python-dev cmake
import dlib


# Now let's make some testing data.  To make it really simple, let's suppose
# that we are ranking 2D vectors and that vectors with positive values in the
# first dimension should rank higher than other vectors.  So what we do is make
# examples of relevant (i.e. high ranking) and non-relevant (i.e. low ranking)
# vectors and store them into a ranking_pair object like so:
data = dlib.ranking_pair()
# Here we add two examples.  In real applications, you would want lots of
# examples of relevant and non-relevant vectors.
data.relevant.append(dlib.vector([1, 0]))
data.nonrelevant.append(dlib.vector([0, 1]))

# Now that we have some data, we can use a machine learning method to learn a
# function that will give high scores to the relevant vectors and low scores to
# the non-relevant vectors.
trainer = dlib.svm_rank_trainer()
# Note that the trainer object has some parameters that control how it behaves.
# For example, since this is the SVM-Rank algorithm it has a C parameter that
# controls the trade-off between trying to fit the training data exactly or
# selecting a "simpler" solution which might generalize better. 
trainer.c = 10

# So let's do the training.
rank = trainer.train(data)

# Now if you call rank on a vector it will output a ranking score.  In
# particular, the ranking score for relevant vectors should be larger than the
# score for non-relevant vectors.  
print("Ranking score for a relevant vector:     {}".format(
    rank(data.relevant[0])))
print("Ranking score for a non-relevant vector: {}".format(
    rank(data.nonrelevant[0])))
# The output is the following:
#    ranking score for a relevant vector:     0.5
#    ranking score for a non-relevant vector: -0.5


# If we want an overall measure of ranking accuracy we can compute the ordering
# accuracy and mean average precision values by calling test_ranking_function().
# In this case, the ordering accuracy tells us how often a non-relevant vector
# was ranked ahead of a relevant vector.  In this case, it returns 1 for both
# metrics, indicating that the rank function outputs a perfect ranking.
print(dlib.test_ranking_function(rank, data))

# The ranking scores are computed by taking the dot product between a learned
# weight vector and a data vector.  If you want to see the learned weight vector
# you can display it like so:
print("Weights: {}".format(rank.weights))
# In this case the weights are:
#  0.5 
# -0.5 

# In the above example, our data contains just two sets of objects.  The
# relevant set and non-relevant set.  The trainer is attempting to find a
# ranking function that gives every relevant vector a higher score than every
# non-relevant vector.  Sometimes what you want to do is a little more complex
# than this. 
#
# For example, in the web page ranking example we have to rank pages based on a
# user's query.  In this case, each query will have its own set of relevant and
# non-relevant documents.  What might be relevant to one query may well be
# non-relevant to another.  So in this case we don't have a single global set of
# relevant web pages and another set of non-relevant web pages.  
#
# To handle cases like this, we can simply give multiple ranking_pair instances
# to the trainer.  Therefore, each ranking_pair would represent the
# relevant/non-relevant sets for a particular query.  An example is shown below
# (for simplicity, we reuse our data from above to make 4 identical "queries").
queries = dlib.ranking_pairs()
queries.append(data)
queries.append(data)
queries.append(data)
queries.append(data)

# We can train just as before.  
rank = trainer.train(queries)

# Now that we have multiple ranking_pair instances, we can also use
# cross_validate_ranking_trainer().  This performs cross-validation by splitting
# the queries up into folds.  That is, it lets the trainer train on a subset of
# ranking_pair instances and tests on the rest.  It does this over 4 different
# splits and returns the overall ranking accuracy based on the held out data.
# Just like test_ranking_function(), it reports both the ordering accuracy and
# mean average precision.
print("Cross validation results: {}".format(
    dlib.cross_validate_ranking_trainer(trainer, queries, 4)))

# Finally, note that the ranking tools also support the use of sparse vectors in
# addition to dense vectors (which we used above).  So if we wanted to do
# exactly what we did in the first part of the example program above but using
# sparse vectors we would do it like so:

data = dlib.sparse_ranking_pair()
samp = dlib.sparse_vector()

# Make samp represent the same vector as dlib.vector([1, 0]).  In dlib, a sparse
# vector is just an array of pair objects.  Each pair stores an index and a
# value.  Moreover, the svm-ranking tools require sparse vectors to be sorted
# and to have unique indices.  This means that the indices are listed in
# increasing order and no index value shows up more than once.  If necessary,
# you can use the dlib.make_sparse_vector() routine to make a sparse vector
# object properly sorted and contain unique indices. 
samp.append(dlib.pair(0, 1))
data.relevant.append(samp)

# Now make samp represent the same vector as dlib.vector([0, 1])
samp.clear()
samp.append(dlib.pair(1, 1))
data.nonrelevant.append(samp)

trainer = dlib.svm_rank_trainer_sparse()
rank = trainer.train(data)
print("Ranking score for a relevant vector:     {}".format(
    rank(data.relevant[0])))
print("Ranking score for a non-relevant vector: {}".format(
    rank(data.nonrelevant[0])))
# Just as before, the output is the following:
#    ranking score for a relevant vector:     0.5
#    ranking score for a non-relevant vector: -0.5
