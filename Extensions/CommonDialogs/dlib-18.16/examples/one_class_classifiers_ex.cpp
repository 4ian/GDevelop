// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the tools in dlib for doing distribution
    estimation or detecting anomalies using one-class support vector machines. 

    Unlike regular classifiers, these tools take unlabeled points and try to learn what
    parts of the feature space normally contain data samples and which do not.  Typically
    you use these tools when you are interested in finding outliers or otherwise
    identifying "unusual" data samples.

    In this example, we will sample points from the sinc() function to generate our set of
    "typical looking" points.  Then we will train some one-class classifiers and use them
    to predict if new points are unusual or not.  In this case, unusual means a point is
    not from the sinc() curve.
*/

#include <iostream>
#include <vector>
#include <dlib/svm.h>
#include <dlib/gui_widgets.h>
#include <dlib/array2d.h>
#include <dlib/image_transforms.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with the one-class SVMs 
double sinc(double x)
{
    if (x == 0)
        return 2;
    return 2*sin(x)/x;
}

int main()
{
    // We will use column vectors to store our points.  Here we make a convenient typedef
    // for the kind of vector we will use.
    typedef matrix<double,0,1> sample_type;

    // Then we select the kernel we want to use.  For our present problem the radial basis
    // kernel is quite effective.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Now make the object responsible for training one-class SVMs.
    svm_one_class_trainer<kernel_type> trainer;
    // Here we set the width of the radial basis kernel to 4.0.  Larger values make the
    // width smaller and give the radial basis kernel more resolution.  If you play with
    // the value and observe the program output you will get a more intuitive feel for what
    // that means.
    trainer.set_kernel(kernel_type(4.0));

    // Now sample some 2D points.  The points will be located on the curve defined by the
    // sinc() function.
    std::vector<sample_type> samples;
    sample_type m(2);
    for (double x = -15; x <= 8; x += 0.3)
    {
        m(0) = x;
        m(1) = sinc(x);
        samples.push_back(m);
    }

    // Now train a one-class SVM.  The result is a function, df(), that outputs large
    // values for points from the sinc() curve and smaller values for points that are
    // anomalous (i.e. not on the sinc() curve in our case).
    decision_function<kernel_type> df = trainer.train(samples);

    // So for example, let's look at the output from some points on the sinc() curve.  
    cout << "Points that are on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -0;   m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -4.1; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << df(m) << endl;  

    cout << endl;
    // Now look at some outputs for points not on the sinc() curve.  You will see that
    // these values are all notably smaller. 
    cout << "Points that are NOT on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0))+4;   cout << "   " << df(m) << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+3;   cout << "   " << df(m) << endl;
    m(0) = -0;   m(1) = -sinc(m(0));    cout << "   " << df(m) << endl;
    m(0) = -0.5; m(1) = -sinc(m(0));    cout << "   " << df(m) << endl;
    m(0) = -4.1; m(1) = sinc(m(0))+2;   cout << "   " << df(m) << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+0.9; cout << "   " << df(m) << endl;
    m(0) = -0.5; m(1) = sinc(m(0))+1;   cout << "   " << df(m) << endl;

    // The output is as follows:
    /*
    Points that are on the sinc function:
        0.000389691
        0.000389691
        -0.000239037
        -0.000179978
        -0.000178491
        0.000389691
        -0.000179978

    Points that are NOT on the sinc function:
        -0.269389
        -0.269389
        -0.269389
        -0.269389
        -0.269389
        -0.239954
        -0.264318
    */

    // So we can see that in this example the one-class SVM correctly indicates that 
    // the non-sinc points are definitely not points from the sinc() curve.


    // It should be noted that the svm_one_class_trainer becomes very slow when you have
    // more than 10 or 20 thousand training points.  However, dlib comes with very fast SVM
    // tools which you can use instead at the cost of a little more setup.  In particular,
    // it is possible to use one of dlib's very fast linear SVM solvers to train a one
    // class SVM.  This is what we do below.  We will train on 115,000 points and it only
    // takes a few seconds with this tool!
    // 
    // The first step is constructing a feature space that is appropriate for use with a
    // linear SVM.  In general, this is quite problem dependent.  However, if you have
    // under about a hundred dimensions in your vectors then it can often be quite
    // effective to use the empirical_kernel_map as we do below (see the
    // empirical_kernel_map documentation and example program for an extended discussion of
    // what it does).  
    //
    // But putting the empirical_kernel_map aside, the most important step in turning a
    // linear SVM into a one-class SVM is the following.  We append a -1 value onto the end
    // of each feature vector and then tell the trainer to force the weight for this
    // feature to 1.  This means that if the linear SVM assigned all other weights a value
    // of 0 then the output from a learned decision function would always be -1.  The
    // second step is that we ask the SVM to label each training sample with +1.  This
    // causes the SVM to set the other feature weights such that the training samples have
    // positive outputs from the learned decision function.  But the starting bias for all
    // the points in the whole feature space is -1.  The result is that points outside our
    // training set will not be affected, so their outputs from the decision function will
    // remain close to -1.

    empirical_kernel_map<kernel_type> ekm;
    ekm.load(trainer.get_kernel(),samples);

    samples.clear();
    std::vector<double> labels;
    // make a vector with just 1 element in it equal to -1.
    sample_type bias(1);
    bias = -1;
    sample_type augmented;
    // This time sample 115,000 points from the sinc() function.
    for (double x = -15; x <= 8; x += 0.0002)
    {
        m(0) = x;
        m(1) = sinc(x);
        // Apply the empirical_kernel_map transformation and then append the -1 value
        augmented = join_cols(ekm.project(m), bias);
        samples.push_back(augmented);
        labels.push_back(+1);
    }
    cout << "samples.size(): "<< samples.size() << endl;

    // The svm_c_linear_dcd_trainer is a very fast SVM solver which only works with the
    // linear_kernel.  It has the nice feature of supporting this "force_last_weight_to_1"
    // mode we discussed above.
    svm_c_linear_dcd_trainer<linear_kernel<sample_type> > linear_trainer;
    linear_trainer.force_last_weight_to_1(true);

    // Train the SVM
    decision_function<linear_kernel<sample_type> > df2 = linear_trainer.train(samples, labels);

    // Here we test it as before, again we note that points from the sinc() curve have
    // large outputs from the decision function.  Note also that we must remember to
    // transform the points in exactly the same manner used to construct the training set
    // before giving them to df2() or the code will not work.
    cout << "Points that are on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -0;   m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -4.1; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;  

    cout << endl;
    // Again, we see here that points not on the sinc() function have small values.
    cout << "Points that are NOT on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0))+4;   cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+3;   cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -0;   m(1) = -sinc(m(0));    cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -0.5; m(1) = -sinc(m(0));    cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -4.1; m(1) = sinc(m(0))+2;   cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+0.9; cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;
    m(0) = -0.5; m(1) = sinc(m(0))+1;   cout << "   " << df2(join_cols(ekm.project(m),bias)) << endl;


    // The output is as follows:
    /*
    Points that are on the sinc function:
        1.00454
        1.00454
        1.00022
        1.00007
        1.00371
        1.00454
        1.00007

    Points that are NOT on the sinc function:
        -1
        -1
        -1
        -1
        -0.999998
        -0.781231
        -0.96242
    */


    // Finally, to help you visualize what is happening here we are going to plot the
    // response of the one-class classifiers on the screen.  The code below creates two
    // heatmap images which show the response.  In these images you can clearly see where
    // the algorithms have identified the sinc() curve.  The hotter the pixel looks, the
    // larger the value coming out of the decision function and therefore the more "normal"
    // it is according to the classifier.
    const long size = 500;
    array2d<double> img1(size,size);
    array2d<double> img2(size,size);
    for (long r = 0; r < img1.nr(); ++r)
    {
        for (long c = 0; c < img1.nc(); ++c)
        {
            double x = 30.0*c/size - 19;
            double y = 8.0*r/size - 4;
            m(0) = x;
            m(1) = y;
            img1[r][c] = df(m);
            img2[r][c] = df2(join_cols(ekm.project(m),bias));
        }
    }
    image_window win1(heatmap(img1), "svm_one_class_trainer");
    image_window win2(heatmap(img2), "svm_c_linear_dcd_trainer");
    win1.wait_until_closed();
}


