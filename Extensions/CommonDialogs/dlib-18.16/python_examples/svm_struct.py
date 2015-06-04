#!/usr/bin/python
# The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
#
# This is an example illustrating the use of the structural SVM solver from
# the dlib C++ Library.  Therefore, this example teaches you the central ideas
# needed to setup a structural SVM model for your machine learning problems.  To
# illustrate the process, we use dlib's structural SVM solver to learn the
# parameters of a simple multi-class classifier.  We first discuss the
# multi-class classifier model and then walk through using the structural SVM
# tools to find the parameters of this classification model.     As an aside,
# dlib's C++ interface to the structural SVM solver is threaded.  So on a
# multi-core computer it is significantly faster than using the python
# interface.  So consider using the C++ interface instead if you find that
# running it in python is slow.
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


def main():
    # In this example, we have three types of samples: class 0, 1, or 2.  That
    # is, each of our sample vectors falls into one of three classes.  To keep
    # this example very simple, each sample vector is zero everywhere except at
    # one place.  The non-zero dimension of each vector determines the class of
    # the vector.  So for example, the first element of samples has a class of 1
    # because samples[0][1] is the only non-zero element of samples[0].
    samples = [[0, 2, 0], [1, 0, 0], [0, 4, 0], [0, 0, 3]]
    # Since we want to use a machine learning method to learn a 3-class
    # classifier we need to record the labels of our samples.  Here samples[i]
    # has a class label of labels[i].
    labels = [1, 0, 1, 2]

    # Now that we have some training data we can tell the structural SVM to
    # learn the parameters of our 3-class classifier model.  The details of this
    # will be explained later.  For now, just note that it finds the weights
    # (i.e. a vector of real valued parameters) such that predict_label(weights,
    # sample) always returns the correct label for a sample vector.
    problem = ThreeClassClassifierProblem(samples, labels)
    weights = dlib.solve_structural_svm_problem(problem)

    # Print the weights and then evaluate predict_label() on each of our
    # training samples. Note that the correct label is predicted for each
    # sample.
    print(weights)
    for k, s in enumerate(samples):
        print("Predicted label for sample[{0}]: {1}".format(
            k, predict_label(weights, s)))


def predict_label(weights, sample):
    """Given the 9-dimensional weight vector which defines a 3 class classifier,
    predict the class of the given 3-dimensional sample vector.   Therefore, the
    output of this function is either 0, 1, or 2 (i.e. one of the three possible
    labels)."""

    # Our 3-class classifier model can be thought of as containing 3 separate
    # linear classifiers.  So to predict the class of a sample vector we
    # evaluate each of these three classifiers and then whatever classifier has
    # the largest output "wins" and predicts the label of the sample.  This is
    # the popular one-vs-all multi-class classifier model.
    # Keeping this in mind, the code below simply pulls the three separate
    # weight vectors out of weights and then evaluates each against sample.  The
    # individual classifier scores are stored in scores and the highest scoring
    # index is returned as the label.
    w0 = weights[0:3]
    w1 = weights[3:6]
    w2 = weights[6:9]
    scores = [dot(w0, sample), dot(w1, sample), dot(w2, sample)]
    max_scoring_label = scores.index(max(scores))
    return max_scoring_label


def dot(a, b):
    """Compute the dot product between the two vectors a and b."""
    return sum(i * j for i, j in zip(a, b))


################################################################################


class ThreeClassClassifierProblem:
    # Now we arrive at the meat of this example program.  To use the
    # dlib.solve_structural_svm_problem() routine you need to define an object
    # which tells the structural SVM solver what to do for your problem.  In
    # this example, this is done by defining the ThreeClassClassifierProblem
    # object.  Before we get into the details, we first discuss some background
    # information on structural SVMs.
    #
    # A structural SVM is a supervised machine learning method for learning to
    # predict complex outputs.  This is contrasted with a binary classifier
    # which makes only simple yes/no predictions.  A structural SVM, on the
    # other hand, can learn to predict complex outputs such as entire parse
    # trees or DNA sequence alignments.  To do this, it learns a function F(x,y)
    # which measures how well a particular data sample x matches a label y,
    # where a label is potentially a complex thing like a parse tree. However,
    # to keep this example program simple we use only a 3 category label output.
    #
    # At test time, the best label for a new x is given by the y which
    # maximizes F(x,y). To put this into the context of the current example,
    # F(x,y) computes the score for a given sample and class label.  The
    # predicted class label is therefore whatever value of y which makes F(x,y)
    # the biggest.  This is exactly what predict_label() does. That is, it
    # computes F(x,0), F(x,1), and F(x,2) and then reports which label has the
    # biggest value.
    #
    # At a high level, a structural SVM can be thought of as searching the
    # parameter space of F(x,y) for the set of parameters that make the
    # following inequality true as often as possible:
    #     F(x_i,y_i) > max{over all incorrect labels of x_i} F(x_i, y_incorrect)
    # That is, it seeks to find the parameter vector such that F(x,y) always
    # gives the highest score to the correct output.  To define the structural
    # SVM optimization problem precisely, we first introduce some notation:
    #    - let PSI(x,y)    == the joint feature vector for input x and a label y
    #    - let F(x,y|w)    == dot(w,PSI(x,y)).
    #      (we use the | notation to emphasize that F() has the parameter vector
    #       of weights called w)
    #    - let LOSS(idx,y) == the loss incurred for predicting that the
    #      idx-th training  sample has a label of y.  Note that LOSS()
    #      should always be >= 0 and should become exactly 0 when y is the
    #      correct label for the idx-th sample.  Moreover, it should notionally
    #      indicate how bad it is to predict y for the idx'th sample.
    #    - let x_i == the i-th training sample.
    #    - let y_i == the correct label for the i-th training sample.
    #    - The number of data samples is N.
    #
    # Then the optimization problem solved by a structural SVM using
    # dlib.solve_structural_svm_problem() is the following:
    #     Minimize: h(w) == 0.5*dot(w,w) + C*R(w)
    #
    #     Where R(w) == sum from i=1 to N: 1/N * sample_risk(i,w) and
    #     sample_risk(i,w) == max over all
    #         Y: LOSS(i,Y) + F(x_i,Y|w) - F(x_i,y_i|w) and C > 0
    #
    # You can think of the sample_risk(i,w) as measuring the degree of error
    # you would make when predicting the label of the i-th sample using
    # parameters w.  That is, it is zero only when the correct label would be
    # predicted and grows larger the more "wrong" the predicted output becomes.
    # Therefore, the objective function is minimizing a balance between making
    # the weights small (typically this reduces overfitting) and fitting the
    # training data.  The degree to which you try to fit the data is controlled
    # by the C parameter.
    #
    # For a more detailed introduction to structured support vector machines
    # you should consult the following paper:
    #     Predicting Structured Objects with Support Vector Machines by
    #     Thorsten Joachims, Thomas Hofmann, Yisong Yue, and Chun-nam Yu
    #

    # Finally, we come back to the code.  To use
    # dlib.solve_structural_svm_problem() you need to provide the things
    # discussed above.  This is the value of C, the number of training samples,
    # the dimensionality of PSI(), as well as methods for calculating the loss
    # values and PSI() vectors.  You will also need to write code that can
    # compute:
    # max over all Y: LOSS(i,Y) + F(x_i,Y|w).  To summarize, the
    # ThreeClassClassifierProblem class is required to have the following
    # fields:
    #   - C
    #   - num_samples
    #   - num_dimensions
    #   - get_truth_joint_feature_vector()
    #   - separation_oracle()

    C = 1

    # There are also a number of optional arguments:
    # epsilon is the stopping tolerance.  The optimizer will run until R(w) is
    # within epsilon of its optimal value. If you don't set this then it
    # defaults to 0.001.
    # epsilon = 1e-13

    # Uncomment this and the optimizer will print its progress to standard
    # out.  You will be able to see things like the current risk gap.  The
    # optimizer continues until the
    # risk gap is below epsilon.
    # be_verbose = True

    # If you want to require that the learned weights are all non-negative
    # then set this field to True.
    # learns_nonnegative_weights = True

    # The optimizer uses an internal cache to avoid unnecessary calls to your
    # separation_oracle() routine.  This parameter controls the size of that
    # cache.  Bigger values use more RAM and might make the optimizer run
    # faster.  You can also disable it by setting it to 0 which is good to do
    # when your separation_oracle is very fast.  If If you don't call this
    # function it defaults to a value of 5.
    # max_cache_size = 20

    def __init__(self, samples, labels):
        # dlib.solve_structural_svm_problem() expects the class to have
        # num_samples and num_dimensions fields.  These fields should contain
        # the number of training samples and the dimensionality of the PSI
        # feature vector respectively.
        self.num_samples = len(samples)
        self.num_dimensions = len(samples[0])*3

        self.samples = samples
        self.labels = labels

    def make_psi(self, x, label):
        """Compute PSI(x,label)."""
        # All we are doing here is taking x, which is a 3 dimensional sample
        # vector in this example program, and putting it into one of 3 places in
        # a 9 dimensional PSI vector, which we then return.  So this function
        # returns PSI(x,label).  To see why we setup PSI like this, recall how
        # predict_label() works.  It takes in a 9 dimensional weight vector and
        # breaks the vector into 3 pieces.  Each piece then defines a different
        # classifier and we use them in a one-vs-all manner to predict the
        # label.  So now that we are in the structural SVM code we have to
        # define the PSI vector to correspond to this usage.  That is, we need
        # to setup PSI so that argmax_y dot(weights,PSI(x,y)) ==
        # predict_label(weights,x).  This is how we tell the structural SVM
        # solver what kind of problem we are trying to solve.
        #
        # It's worth emphasizing that the single biggest step in using a
        # structural SVM is deciding how you want to represent PSI(x,label).  It
        # is always a vector, but deciding what to put into it to solve your
        # problem is often not a trivial task. Part of the difficulty is that
        # you need an efficient method for finding the label that makes
        # dot(w,PSI(x,label)) the biggest.  Sometimes this is easy, but often
        # finding the max scoring label turns into a difficult combinatorial
        # optimization problem.  So you need to pick a PSI that doesn't make the
        # label maximization step intractable but also still well models your
        # problem.
        #
        # Create a dense vector object (note that you can also use unsorted
        # sparse vectors (i.e.  dlib.sparse_vector objects) to represent your
        # PSI vector.  This is useful if you have very high dimensional PSI
        # vectors that are mostly zeros.  In the context of this example, you
        # would simply return a dlib.sparse_vector at the end of make_psi() and
        # the rest of the example would still work properly. ).
        psi = dlib.vector()
        # Set it to have 9 dimensions.  Note that the elements of the vector
        # are 0 initialized.
        psi.resize(self.num_dimensions)
        dims = len(x)
        if label == 0:
            for i in range(0, dims):
                psi[i] = x[i]
        elif label == 1:
            for i in range(dims, 2 * dims):
                psi[i] = x[i - dims]
        else:  # the label must be 2
            for i in range(2 * dims, 3 * dims):
                psi[i] = x[i - 2 * dims]
        return psi

    # Now we get to the two member functions that are directly called by
    # dlib.solve_structural_svm_problem().
    #
    # In get_truth_joint_feature_vector(), all you have to do is return the
    # PSI() vector for the idx-th training sample when it has its true label.
    # So here it returns
    # PSI(self.samples[idx], self.labels[idx]).
    def get_truth_joint_feature_vector(self, idx):
        return self.make_psi(self.samples[idx], self.labels[idx])

    # separation_oracle() is more interesting.
    # dlib.solve_structural_svm_problem() will call separation_oracle() many
    # times during the optimization.  Each time it will give it the current
    # value of the parameter weights and the separation_oracle() is supposed to
    # find the label that most violates the structural SVM objective function
    # for the idx-th sample.  Then the separation oracle reports the
    # corresponding PSI vector and loss value.  To state this more precisely,
    # the separation_oracle() member function has the following contract:
    #   requires
    #      - 0 <= idx < self.num_samples
    #      - len(current_solution) == self.num_dimensions
    #   ensures
    #      - runs the separation oracle on the idx-th sample.
    #        We define this as follows:
    #         - let X           == the idx-th training sample.
    #         - let PSI(X,y)    == the joint feature vector for input X
    #                              and an arbitrary label y.
    #         - let F(X,y)      == dot(current_solution,PSI(X,y)).
    #         - let LOSS(idx,y) == the loss incurred for predicting that the
    #           idx-th sample has a label of y.  Note that LOSS()
    #           should always be >= 0 and should become exactly 0 when y is the
    #           correct label for the idx-th sample.
    #  
    #            Then the separation oracle finds a Y such that:
    #               Y = argmax over all y: LOSS(idx,y) + F(X,y)
    #            (i.e. It finds the label which maximizes the above expression.)
    #  
    #            Finally, separation_oracle() returns LOSS(idx,Y),PSI(X,Y)
    def separation_oracle(self, idx, current_solution):
        samp = self.samples[idx]
        dims = len(samp)
        scores = [0, 0, 0]
        # compute scores for each of the three classifiers
        scores[0] = dot(current_solution[0:dims], samp)
        scores[1] = dot(current_solution[dims:2*dims], samp)
        scores[2] = dot(current_solution[2*dims:3*dims], samp)

        # Add in the loss-augmentation.  Recall that we maximize
        # LOSS(idx,y) + F(X,y) in the separate oracle, not just F(X,y) as we
        # normally would in predict_label(). Therefore, we must add in this
        # extra amount to account for the loss-augmentation. For our simple
        # multi-class classifier, we incur a loss of 1 if we don't predict the
        # correct label and a loss of 0 if we get the right label.
        if self.labels[idx] != 0:
            scores[0] += 1
        if self.labels[idx] != 1:
            scores[1] += 1
        if self.labels[idx] != 2:
            scores[2] += 1

        # Now figure out which classifier has the largest loss-augmented score.
        max_scoring_label = scores.index(max(scores))
        # And finally record the loss that was associated with that predicted
        # label. Again, the loss is 1 if the label is incorrect and 0 otherwise.
        if max_scoring_label == self.labels[idx]:
            loss = 0
        else:
            loss = 1

        # Finally, return the loss and PSI vector corresponding to the label
        # we just found.
        psi = self.make_psi(samp, max_scoring_label)
        return loss, psi


if __name__ == "__main__":
    main()
