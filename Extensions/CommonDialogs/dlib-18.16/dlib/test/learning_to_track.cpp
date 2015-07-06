// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include "tester.h"
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>



namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.learning_to_track");

// ----------------------------------------------------------------------------------------

    struct detection_dense
    {
        typedef struct track_dense track_type;
        matrix<double,0,1> measurements;
    };


    struct track_dense
    {
        typedef matrix<double,0,1> feature_vector_type;

        track_dense()
        {
            time_since_last_association = 0;
        }

        void get_similarity_features(const detection_dense det, feature_vector_type& feats) const
        {
            feats = abs(last_measurements - det.measurements);
        }

        void update_track(const detection_dense det)
        {
            last_measurements = det.measurements;
            time_since_last_association = 0;
        }

        void propagate_track()
        {
            ++time_since_last_association;
        }

        matrix<double,0,1> last_measurements;
        unsigned long time_since_last_association;
    };

// ----------------------------------------------------------------------------------------

    struct detection_sparse
    {
        typedef struct track_sparse track_type;
        matrix<double,0,1> measurements;
    };


    struct track_sparse
    {
        typedef std::vector<std::pair<unsigned long,double> > feature_vector_type;

        track_sparse()
        {
            time_since_last_association = 0;
        }

        void get_similarity_features(const detection_sparse det, feature_vector_type& feats) const
        {
            matrix<double,0,1> temp = abs(last_measurements - det.measurements);
            feats.clear();
            for (long i = 0; i < temp.size(); ++i)
                feats.push_back(make_pair(i, temp(i)));
        }

        void update_track(const detection_sparse det)
        {
            last_measurements = det.measurements;
            time_since_last_association = 0;
        }

        void propagate_track()
        {
            ++time_since_last_association;
        }

        matrix<double,0,1> last_measurements;
        unsigned long time_since_last_association;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    dlib::rand rnd;
    const long num_objects = 4;
    const long num_properties = 6;
    std::vector<matrix<double,0,1> > object_properties(num_objects);

    void initialize_object_properties()
    {
        rnd.set_seed("23ja2oirfjaf");
        for (unsigned long i = 0; i < object_properties.size(); ++i)
            object_properties[i] = randm(num_properties,1,rnd);
    }

    template <typename detection>
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


    template <typename detection>
    std::vector<std::vector<labeled_detection<detection> > > make_random_tracking_data_for_training()
    {
        typedef std::vector<labeled_detection<detection> > detections_at_single_time_step;
        typedef std::vector<detections_at_single_time_step> track_history;

        track_history data;

        // At each time step we get a set of detections from the objects in the world.
        // Simulate 100 time steps worth of data where there are 3 objects present. 
        const int num_time_steps = 100;
        for (int i = 0; i < num_time_steps; ++i)
        {
            detections_at_single_time_step dets(3);
            // sample a detection from object 0
            dets[0].det = sample_detection_from_sensor<detection>(0);
            dets[0].label = 0;

            // sample a detection from object 1
            dets[1].det = sample_detection_from_sensor<detection>(1);
            dets[1].label = 1;

            // sample a detection from object 2
            dets[2].det = sample_detection_from_sensor<detection>(2);
            dets[2].label = 2;

            randomize_samples(dets, rnd);
            data.push_back(dets);
        }

        // Now let's imagine object 1 and 2 are gone but a new object, object 3 has arrived.  
        for (int i = 0; i < num_time_steps; ++i)
        {
            detections_at_single_time_step dets(2);
            // sample a detection from object 0
            dets[0].det = sample_detection_from_sensor<detection>(0);
            dets[0].label = 0;

            // sample a detection from object 3
            dets[1].det = sample_detection_from_sensor<detection>(3);
            dets[1].label = 3;

            randomize_samples(dets, rnd);
            data.push_back(dets);
        }

        return data;
    }

// ----------------------------------------------------------------------------------------

    template <typename detection>
    std::vector<detection> make_random_detections(long num_dets)
    {
        DLIB_CASSERT(num_dets <= num_objects, 
            "You can't ask for more detections than there are objects in our little simulation."); 

        std::vector<detection> dets(num_dets);
        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            dets[i] = sample_detection_from_sensor<detection>(i);
        }
        randomize_samples(dets, rnd);
        return dets;
    }

// ----------------------------------------------------------------------------------------

    template <typename detection>
    void test_tracking_stuff()
    {
        print_spinner();


        typedef std::vector<labeled_detection<detection> > detections_at_single_time_step;
        typedef std::vector<detections_at_single_time_step> track_history;
        std::vector<track_history> data;
        data.push_back(make_random_tracking_data_for_training<detection>());
        data.push_back(make_random_tracking_data_for_training<detection>());
        data.push_back(make_random_tracking_data_for_training<detection>());
        data.push_back(make_random_tracking_data_for_training<detection>());
        data.push_back(make_random_tracking_data_for_training<detection>());


        structural_track_association_trainer trainer;
        trainer.set_c(1000);
        track_association_function<detection> assoc = trainer.train(data);

        double test_val = test_track_association_function(assoc, data); 
        DLIB_TEST_MSG( test_val == 1, test_val);
        test_val = cross_validate_track_association_trainer(trainer, data, 5); 
        DLIB_TEST_MSG ( test_val == 1, test_val);



        typedef typename detection::track_type track;
        std::vector<track> tracks;

        std::vector<detection> dets = make_random_detections<detection>(3);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 3);

        dets = make_random_detections<detection>(3);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 3);

        dets = make_random_detections<detection>(3);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 3);

        dets = make_random_detections<detection>(4);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 4);

        dets = make_random_detections<detection>(3);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 4);
        unsigned long total_miss = 0;
        for (unsigned long i = 0; i < tracks.size(); ++i)
            total_miss += tracks[i].time_since_last_association;
        DLIB_TEST(total_miss == 1);

        dets = make_random_detections<detection>(3);
        assoc(tracks, dets);
        DLIB_TEST(tracks.size() == 4);
        total_miss = 0;
        unsigned long num_zero = 0;
        for (unsigned long i = 0; i < tracks.size(); ++i)
        {
            total_miss += tracks[i].time_since_last_association;
            if (tracks[i].time_since_last_association == 0)
                ++num_zero;
        }
        DLIB_TEST(total_miss == 2);
        DLIB_TEST(num_zero == 3);



        ostringstream sout; 
        serialize(assoc, sout);

        istringstream sin(sout.str());
        deserialize(assoc, sin);
        DLIB_TEST( test_track_association_function(assoc, data) == 1);
    }


// ----------------------------------------------------------------------------------------

    class test_learning_to_track : public tester
    {
    public:
        test_learning_to_track (
        ) :
            tester ("test_learning_to_track",
                "Runs tests on the assignment learning code.")
        {}

        void perform_test (
        )
        {
            initialize_object_properties();
            for (int i = 0; i < 3; ++i)
            {
                dlog << LINFO << "run test_tracking_stuff<detection_dense>()";
                test_tracking_stuff<detection_dense>();
                dlog << LINFO << "run test_tracking_stuff<detection_sparse>()";
                test_tracking_stuff<detection_sparse>();
            }
        }
    } a;

// ----------------------------------------------------------------------------------------

}


