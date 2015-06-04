// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the graph_labeler and
    structural_graph_labeling_trainer objects.

    Suppose you have a bunch of objects and you need to label each of them as true or
    false.  Suppose further that knowing the labels of some of these objects tells you
    something about the likely label of the others.  This is common in a number of domains.
    For example, in image segmentation problems you need to label each pixel, and knowing
    the labels of neighboring pixels gives you information about the likely label since
    neighboring pixels will often have the same label.
    
    We can generalize this problem by saying that we have a graph and our task is to label
    each node in the graph as true or false.  Additionally, the edges in the graph connect
    nodes which are likely to share the same label.  In this example program, each node
    will have a feature vector which contains information which helps tell if the node
    should be labeled as true or false.  The edges also contain feature vectors which give
    information indicating how strong the edge's labeling consistency constraint should be.
    This is useful since some nodes will have uninformative feature vectors and the only
    way to tell how they should be labeled is by looking at their neighbor's labels.

    Therefore, this program will show you how to learn two things using machine learning.
    The first is a linear classifier which operates on each node and predicts if it should
    be labeled as true or false.  The second thing is a linear function of the edge
    vectors.  This function outputs a penalty for giving two nodes connected by an edge
    differing labels.  The graph_labeler object puts these two things together and uses
    them to compute a labeling which takes both into account.  In what follows, we will use
    a structural SVM method to find the parameters of these linear functions which minimize
    the number of mistakes made by a graph_labeler.


    Finally, you might also consider reading the book Structured Prediction and Learning in
    Computer Vision by Sebastian Nowozin and Christoph H. Lampert since it contains a good
    introduction to machine learning methods such as the algorithm implemented by the
    structural_graph_labeling_trainer.
*/

#include <dlib/svm_threaded.h>
#include <iostream>

using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

// The first thing we do is define the kind of graph object we will be using.
// Here we are saying there will be 2-D vectors at each node and 1-D vectors at
// each edge.  (You should read the matrix_ex.cpp example program for an introduction
// to the matrix object.)
typedef matrix<double,2,1> node_vector_type;
typedef matrix<double,1,1> edge_vector_type;
typedef graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

// ----------------------------------------------------------------------------------------

template <
    typename graph_type,
    typename labels_type
    >
void make_training_examples(
    dlib::array<graph_type>& samples,
    labels_type& labels
)
{
    /*
        This function makes 3 graphs we will use for training.   All of them
        will contain 4 nodes and have the structure shown below:

          (0)-----(1)
           |       |
           |       |
           |       |
          (3)-----(2)

        In this example, each node has a 2-D vector.  The first element of this vector
        is 1 when the node should have a label of false while the second element has
        a value of 1 when the node should have a label of true.  Additionally, the 
        edge vectors will contain a value of 1 when the nodes connected by the edge
        should share the same label and a value of 0 otherwise.  
        
        We want to see that the machine learning method is able to figure out how 
        these features relate to the labels.  If it is successful it will create a 
        graph_labeler which can predict the correct labels for these and other 
        similarly constructed graphs.

        Finally, note that these tools require all values in the edge vectors to be >= 0.
        However, the node vectors may contain both positive and negative values. 
    */

    samples.clear();
    labels.clear();

    std::vector<bool> label;
    graph_type g;

    // ---------------------------
    g.set_number_of_nodes(4);
    label.resize(g.number_of_nodes());
    // store the vector [0,1] into node 0.  Also label it as true.
    g.node(0).data = 0, 1; label[0] = true;
    // store the vector [0,0] into node 1.
    g.node(1).data = 0, 0; label[1] = true;  // Note that this node's vector doesn't tell us how to label it.
                                             // We need to take the edges into account to get it right.
    // store the vector [1,0] into node 2.
    g.node(2).data = 1, 0; label[2] = false;
    // store the vector [0,0] into node 3.
    g.node(3).data = 0, 0; label[3] = false;

    // Add the 4 edges as shown in the ASCII art above.
    g.add_edge(0,1);
    g.add_edge(1,2);
    g.add_edge(2,3);
    g.add_edge(3,0);

    // set the 1-D vector for the edge between node 0 and 1 to the value of 1.
    edge(g,0,1) = 1; 
    // set the 1-D vector for the edge between node 1 and 2 to the value of 0.
    edge(g,1,2) = 0;
    edge(g,2,3) = 1;
    edge(g,3,0) = 0;
    // output the graph and its label.
    samples.push_back(g);
    labels.push_back(label);

    // ---------------------------
    g.set_number_of_nodes(4);
    label.resize(g.number_of_nodes());
    g.node(0).data = 0, 1; label[0] = true;
    g.node(1).data = 0, 1; label[1] = true;
    g.node(2).data = 1, 0; label[2] = false;
    g.node(3).data = 1, 0; label[3] = false;

    g.add_edge(0,1);
    g.add_edge(1,2);
    g.add_edge(2,3);
    g.add_edge(3,0);

    // This time, we have strong edges between all the nodes.  The machine learning 
    // tools will have to learn that when the node information conflicts with the 
    // edge constraints that the node information should dominate.
    edge(g,0,1) = 1;
    edge(g,1,2) = 1; 
    edge(g,2,3) = 1;
    edge(g,3,0) = 1;
    samples.push_back(g);
    labels.push_back(label);
    // ---------------------------

    g.set_number_of_nodes(4);
    label.resize(g.number_of_nodes());
    g.node(0).data = 1, 0; label[0] = false;
    g.node(1).data = 1, 0; label[1] = false;
    g.node(2).data = 1, 0; label[2] = false;
    g.node(3).data = 0, 0; label[3] = false;

    g.add_edge(0,1);
    g.add_edge(1,2);
    g.add_edge(2,3);
    g.add_edge(3,0);

    edge(g,0,1) = 0;
    edge(g,1,2) = 0;
    edge(g,2,3) = 1;
    edge(g,3,0) = 0;
    samples.push_back(g);
    labels.push_back(label);
    // ---------------------------

}

// ----------------------------------------------------------------------------------------

int main()
{
    try
    {
        // Get the training samples we defined above.
        dlib::array<graph_type> samples;
        std::vector<std::vector<bool> > labels;
        make_training_examples(samples, labels);


        // Create a structural SVM trainer for graph labeling problems.  The vector_type
        // needs to be set to a type capable of holding node or edge vectors.
        typedef matrix<double,0,1> vector_type;
        structural_graph_labeling_trainer<vector_type> trainer;
        // This is the usual SVM C parameter.  Larger values make the trainer try 
        // harder to fit the training data but might result in overfitting.  You 
        // should set this value to whatever gives the best cross-validation results.
        trainer.set_c(10);

        // Do 3-fold cross-validation and print the results.  In this case it will
        // indicate that all nodes were correctly classified.  
        cout << "3-fold cross-validation: " << cross_validate_graph_labeling_trainer(trainer, samples, labels, 3) << endl;

        // Since the trainer is working well.  Let's have it make a graph_labeler 
        // based on the training data.
        graph_labeler<vector_type> labeler = trainer.train(samples, labels);


        /*
            Let's try the graph_labeler on a new test graph.  In particular, let's
            use one with 5 nodes as shown below:

            (0 F)-----(1 T)
              |         |
              |         |
              |         |
            (3 T)-----(2 T)------(4 T)

            I have annotated each node with either T or F to indicate the correct 
            output (true or false).  
        */
        graph_type g;
        g.set_number_of_nodes(5);
        g.node(0).data = 1, 0;  // Node data indicates a false node.
        g.node(1).data = 0, 1;  // Node data indicates a true node.
        g.node(2).data = 0, 0;  // Node data is ambiguous.
        g.node(3).data = 0, 0;  // Node data is ambiguous.
        g.node(4).data = 0.1, 0; // Node data slightly indicates a false node.

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);
        g.add_edge(2,4);

        // Set the edges up so nodes 1, 2, 3, and 4 are all strongly connected.
        edge(g,0,1) = 0;
        edge(g,1,2) = 1;
        edge(g,2,3) = 1;
        edge(g,3,0) = 0;
        edge(g,2,4) = 1;

        // The output of this shows all the nodes are correctly labeled.
        cout << "Predicted labels: " << endl;
        std::vector<bool> temp = labeler(g);
        for (unsigned long i = 0; i < temp.size(); ++i)
            cout << " " << i << ": " << temp[i] << endl;



        // Breaking the strong labeling consistency link between node 1 and 2 causes
        // nodes 2, 3, and 4 to flip to false.  This is because of their connection
        // to node 4 which has a small preference for false.
        edge(g,1,2) = 0;
        cout << "Predicted labels: " << endl;
        temp = labeler(g);
        for (unsigned long i = 0; i < temp.size(); ++i)
            cout << " " << i << ": " << temp[i] << endl;
    }
    catch (std::exception& e)
    {
        cout << "Error, an exception was thrown!" << endl;
        cout << e.what() << endl;
    }
}

