// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This example shows how you can use the dlib machine learning tools to make
    an object tracker.  Depending on your tracking application there can be a
    lot of components to a tracker.  However, a central element of many trackers
    is the "detection to track" association step and this is the part of the
    tracker we discuss in this example.  Therefore, in the code below we define
    simple detection and track structures and then go through the steps needed
    to learn, using training data, how to best associate detections to tracks.  

    It should be noted that these tools are implemented essentially as wrappers
    around the more general assignment learning tools present in dlib.  So if
    you want to get an idea of how they work under the covers you should read
    the assignment_learning_ex.cpp example program and its supporting
    documentation.  However, to just use the learning-to-track tools you won't
    need to understand these implementation details.
*/


#include <iostream>
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>

using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

struct detection 
{
    /*
        When you use these tools you need to define two structures.  One represents a
        detection and another a track.  In this example we call these structures detection
        and track but you can name them however you like.  Moreover, You can put anything
        you want in your detection structure.  The only requirement is that detection be
        copyable and contain a public typedef named track_type that tells us the track type
        meant for use with this detection object.
    */
    typedef struct track track_type;

    
    
    // Again, note that this field is NOT REQUIRED by the dlib tools.  You can put whatever
    // you want in your detection object.  Here we are including a column vector of
    // measurements from the sensor that generated the detection.  In this example we don't
    // have a real sensor so we will simulate a very basic one using a random number
    // generator.   But the idea is that you should be able to use the contents of your
    // detection to somehow tell which track it goes with.  So these numbers should contain
    // some identifying information about the real world object that caused this detection.  
    matrix<double,0,1> measurements;
};


struct track
{
    /*
        Here we define our corresponding track object.  This object has more requirements
        than the detection.  In particular, the dlib machine learning tools require it to
        have the following elements:
            - A typedef named feature_vector_type
            - It should be copyable and default constructable
            - The three functions: get_similarity_features(), update_track(), and propagate_track()
    
        Just like the detection object, you can also add any additional fields you like.
        In this example we keep it simple and say that a track maintains only a copy of the
        most recent sensor measurements it has seen and also a number telling us how long
        it has been since the track was updated with a detection.
    */

    // This type should be a dlib::matrix capable of storing column vectors or an
    // unsorted sparse vector type such as std::vector<std::pair<unsigned long,double>>.
    typedef matrix<double,0,1> feature_vector_type;

    track()
    {
        time_since_last_association = 0;
    }

    void get_similarity_features(const detection& det, feature_vector_type& feats) const
    {
        /*
            The get_similarity_features() function takes a detection and outputs a feature
            vector that tells the machine learning tools how "similar" the detection is to
            the track.  The idea here is to output a set of numbers (i.e. the contents of
            feats) that can be used to decide if det should be associated with this track.
            In this example we output the difference between the last sensor measurements
            for this track and the detection's measurements.  This works since we expect
            the sensor measurements to be relatively constant for each track because that's
            how our simple sensor simulator in this example works.  However, in a real
            world application it's likely to be much more complex.  But here we keep things
            simple.

            It should also be noted that get_similarity_features() must always output
            feature vectors with the same number of dimensions.  Finally, the machine
            learning tools are going to learn a linear function of feats and use that to
            predict if det should associate to this track.  So try and define features that
            you think would work in a linear function.  There are all kinds of ways to do
            this.  If you want to get really clever about it you can even use kernel
            methods like the empirical_kernel_map (see empirical_kernel_map_ex.cpp).  I
            would start out with something simple first though.
        */
        feats = abs(last_measurements - det.measurements);
    }

    void update_track(const detection& det)
    {
        /*
            This function is called when the dlib tools have decided that det should be
            associated with this track.  So the point of update_track() is to, as the name
            suggests, update the track with the given detection.  In general, you can do
            whatever you want in this function.  Here we simply record the last measurement
            state and reset the time since last association.
        */
        last_measurements = det.measurements;
        time_since_last_association = 0;
    }

    void propagate_track()
    {
        /*
            This function is called when the dlib tools have decided, for the current time
            step, that none of the available detections associate with this track.  So the
            point of this function is to perform a track update without a detection.  To
            say that another way.  Every time you ask the dlib tools to perform detection
            to track association they will update each track by calling either
            update_track() or propagate_track().  Which function they call depends on
            whether or not a detection was associated to the track.
        */
        ++time_since_last_association;
    }

    matrix<double,0,1> last_measurements;
    unsigned long time_since_last_association;
};

// ----------------------------------------------------------------------------------------

/*
    Now that we have defined our detection and track structures we are going to define our
    sensor simulator.  In it we will imagine that there are num_objects things in the world
    and those things generate detections from our sensor.  Moreover, each detection from
    the sensor comes with a measurement vector with num_properties elements.  

    So the first function, initialize_object_properties(), just randomly generates
    num_objects and saves them in a global variable.  Then when we are generating
    detections we will output copies of these objects that have been corrupted by a little
    bit of random noise.
*/

dlib::rand rnd;
const long num_objects = 4;
const long num_properties = 6;
std::vector<matrix<double,0,1> > object_properties(num_objects);

void initialize_object_properties()
{
    for (unsigned long i = 0; i < object_properties.size(); ++i)
        object_properties[i] = randm(num_properties,1,rnd);
}

// So here is our function that samples a detection from our simulated sensor.  You tell it
// what object you want to sample a detection from and it returns a detection from that
// object.
detection sample_detection_from_sensor(long object_id)
{
    DLIB_CASSERT(object_id < num_objects, 
        "You can't ask to sample a detection from an object that doesn't exist."); 
    detection temp;
    // Set the measurements equal to the object's true property values plus a little bit of
    // noise.
    temp.measurements = object_properties[object_id] + randm(num_properties,1,rnd)*0.1;
    return temp;
}

// ----------------------------------------------------------------------------------------

typedef std::vector<labeled_detection<detection> > detections_at_single_time_step;
typedef std::vector<detections_at_single_time_step> track_history;

track_history make_random_tracking_data_for_training()
{
    /*
        Since we are using machine learning we need some training data.  This function
        samples data from our sensor and creates labeled track histories.  In these track
        histories, each detection is labeled with its true track ID.  The goal of the
        machine learning tools will then be to learn to associate all the detections with
        the same ID to the same track object.
    */

    track_history data;

    // At each time step we get a set of detections from the objects in the world.
    // Simulate 100 time steps worth of data where there are 3 objects present. 
    const int num_time_steps = 100;
    for (int i = 0; i < num_time_steps; ++i)
    {
        detections_at_single_time_step dets(3);
        // sample a detection from object 0
        dets[0].det = sample_detection_from_sensor(0);
        dets[0].label = 0;

        // sample a detection from object 1
        dets[1].det = sample_detection_from_sensor(1);
        dets[1].label = 1;

        // sample a detection from object 2
        dets[2].det = sample_detection_from_sensor(2);
        dets[2].label = 2;

        data.push_back(dets);
    }

    // Now let's imagine object 1 and 2 are gone but a new object, object 3 has arrived.  
    for (int i = 0; i < num_time_steps; ++i)
    {
        detections_at_single_time_step dets(2);
        // sample a detection from object 0
        dets[0].det = sample_detection_from_sensor(0);
        dets[0].label = 0;

        // sample a detection from object 3
        dets[1].det = sample_detection_from_sensor(3);
        dets[1].label = 3;

        data.push_back(dets);
    }

    return data;
}

// ----------------------------------------------------------------------------------------

std::vector<detection> make_random_detections(long num_dets)
{
    /*
        Finally, when we test the tracker we learned we will need to sample regular old
        unlabeled detections.  This function helps us do that.
    */
    DLIB_CASSERT(num_dets <= num_objects, 
        "You can't ask for more detections than there are objects in our little simulation."); 

    std::vector<detection> dets(num_dets);
    for (unsigned long i = 0; i < dets.size(); ++i)
    {
        dets[i] = sample_detection_from_sensor(i);
    }
    return dets;
}

// ----------------------------------------------------------------------------------------

int main()
{
    initialize_object_properties();


    // Get some training data.  Here we sample 5 independent track histories.  In a real
    // world problem you would get this kind of data by, for example, collecting data from
    // your sensor on 5 separate days where you did an independent collection each day.
    // You can train a model with just one track history but the more you have the better.
    std::vector<track_history> data;
    data.push_back(make_random_tracking_data_for_training());
    data.push_back(make_random_tracking_data_for_training());
    data.push_back(make_random_tracking_data_for_training());
    data.push_back(make_random_tracking_data_for_training());
    data.push_back(make_random_tracking_data_for_training());


    structural_track_association_trainer trainer;
    // Note that the machine learning tools have a parameter.  This is the usual SVM C
    // parameter that controls the trade-off between trying to fit the training data or
    // producing a "simpler" solution.  You need to try a few different values of this
    // parameter to find out what setting works best for your problem (try values in the
    // range 0.001 to 1000000).
    trainer.set_c(100);
    // Now do the training.
    track_association_function<detection> assoc = trainer.train(data);

    // We can test the accuracy of the learned association function on some track history
    // data.  Here we test it on the data we trained on.  It outputs a single number that
    // measures the fraction of detections which were correctly associated to their tracks.
    // So a value of 1 indicates perfect tracking and a value of 0 indicates totally wrong
    // tracking.
    cout << "Association accuracy on training data: "<< test_track_association_function(assoc, data) << endl;
    // It's very important to test the output of a machine learning method on data it
    // wasn't trained on.  You can do that by calling test_track_association_function() on
    // held out data.  You can also use cross-validation like so:
    cout << "Association accuracy from 5-fold CV:   "<< cross_validate_track_association_trainer(trainer, data, 5) << endl;
    // Unsurprisingly, the testing functions show that the assoc function we learned
    // perfectly associates all detections to tracks in this easy data.




    // OK.  So how do you use this assoc thing?  Let's use it to do some tracking!

    // tracks contains all our current tracks.  Initially it is empty.
    std::vector<track> tracks;
    cout << "number of tracks: "<< tracks.size() << endl;

    // Sample detections from 3 objects.
    std::vector<detection> dets = make_random_detections(3);
    // Calling assoc(), the function we just learned, performs the detection to track
    // association.  It will also call each track's update_track() function with the
    // associated detection.  For tracks that don't get a detection, it calls
    // propagate_track(). 
    assoc(tracks, dets);
    // Now there are 3 things in tracks.
    cout << "number of tracks: "<< tracks.size() << endl;

    // Run the tracker for a few more time steps...
    dets = make_random_detections(3);
    assoc(tracks, dets);
    cout << "number of tracks: "<< tracks.size() << endl;

    dets = make_random_detections(3);
    assoc(tracks, dets);
    cout << "number of tracks: "<< tracks.size() << endl;

    // Now another object has appeared!  There are 4 objects now.
    dets = make_random_detections(4);
    assoc(tracks, dets);
    // Now there are 4 tracks instead of 3!
    cout << "number of tracks: "<< tracks.size() << endl;

    // That 4th object just vanished.  Let's look at the time_since_last_association values
    // for each track.  We will see that one of the tracks isn't getting updated with
    // detections anymore since the object it corresponds to is no longer present.
    dets = make_random_detections(3);
    assoc(tracks, dets);
    cout << "number of tracks: "<< tracks.size() << endl;
    for (unsigned long i = 0; i < tracks.size(); ++i)
        cout << "   time since last association: "<< tracks[i].time_since_last_association << endl;

    dets = make_random_detections(3);
    assoc(tracks, dets);
    cout << "number of tracks: "<< tracks.size() << endl;
    for (unsigned long i = 0; i < tracks.size(); ++i)
        cout << "   time since last association: "<< tracks[i].time_since_last_association << endl;






    // Finally, you can save your track_association_function to disk like so:
    serialize("track_assoc.svm") << assoc;

    // And recall it from disk later like so:
    deserialize("track_assoc.svm") >> assoc;
}

// ----------------------------------------------------------------------------------------

