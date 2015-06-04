// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <boost/shared_ptr.hpp>
#include <dlib/matrix.h>
#include <dlib/svm_threaded.h>
#include <boost/python/suite/indexing/vector_indexing_suite.hpp>
#include <boost/python/args.hpp>

using namespace dlib;
using namespace std;
using namespace boost::python;

typedef matrix<double,0,1> dense_vect; 
typedef std::vector<std::pair<unsigned long,double> > sparse_vect;
typedef std::vector<std::pair<unsigned long, unsigned long> > ranges;

// ----------------------------------------------------------------------------------------

template <typename samp_type, bool BIO, bool high_order, bool nonnegative>
class segmenter_feature_extractor
{

public:
    typedef std::vector<samp_type> sequence_type;
    const static bool use_BIO_model = BIO;
    const static bool use_high_order_features = high_order;
    const static bool allow_negative_weights = nonnegative;


    unsigned long _num_features;
    unsigned long _window_size;

    segmenter_feature_extractor(
    ) : _num_features(1), _window_size(1) {}

    segmenter_feature_extractor(
        unsigned long _num_features_,
        unsigned long _window_size_
    ) : _num_features(_num_features_), _window_size(_window_size_) {}

    unsigned long num_features(
    ) const { return _num_features; }

    unsigned long window_size(
    ) const {return _window_size; }

    template <typename feature_setter>
    void get_features (
        feature_setter& set_feature,
        const std::vector<dense_vect>& x,
        unsigned long position
    ) const
    {
        for (long i = 0; i < x[position].size(); ++i)
        {
            set_feature(i, x[position](i));
        }
    }

    template <typename feature_setter>
    void get_features (
        feature_setter& set_feature,
        const std::vector<sparse_vect>& x,
        unsigned long position
    ) const
    {
        for (unsigned long i = 0; i < x[position].size(); ++i)
        {
            set_feature(x[position][i].first, x[position][i].second);
        }
    }

    friend void serialize(const segmenter_feature_extractor& item, std::ostream& out)
    {
        dlib::serialize(item._num_features, out);
        dlib::serialize(item._window_size, out);
    }
    friend void deserialize(segmenter_feature_extractor& item, std::istream& in)
    {
        dlib::deserialize(item._num_features, in);
        dlib::deserialize(item._window_size, in);
    }
};

// ----------------------------------------------------------------------------------------

struct segmenter_type
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This the object that python will use directly to represent a
            sequence_segmenter.  All it does is contain all the possible template
            instantiations of a sequence_segmenter and invoke the right one depending on
            the mode variable. 
    !*/

    segmenter_type() : mode(-1)
    { }

    ranges segment_sequence_dense (
        const std::vector<dense_vect>& x
    ) const 
    {
        switch (mode)
        {
            case 0: return segmenter0(x);
            case 1: return segmenter1(x);
            case 2: return segmenter2(x);
            case 3: return segmenter3(x);
            case 4: return segmenter4(x);
            case 5: return segmenter5(x);
            case 6: return segmenter6(x);
            case 7: return segmenter7(x);
            default: throw dlib::error("Invalid mode");
        }
    }

    ranges segment_sequence_sparse (
        const std::vector<sparse_vect>& x
    ) const 
    {
        switch (mode)
        {
            case 8: return segmenter8(x);
            case 9: return segmenter9(x);
            case 10: return segmenter10(x);
            case 11: return segmenter11(x);
            case 12: return segmenter12(x);
            case 13: return segmenter13(x);
            case 14: return segmenter14(x);
            case 15: return segmenter15(x);
            default: throw dlib::error("Invalid mode");
        }
    }

    const matrix<double,0,1> get_weights() 
    { 
        switch(mode)
        {
            case 0: return segmenter0.get_weights(); 
            case 1: return segmenter1.get_weights(); 
            case 2: return segmenter2.get_weights(); 
            case 3: return segmenter3.get_weights(); 
            case 4: return segmenter4.get_weights(); 
            case 5: return segmenter5.get_weights(); 
            case 6: return segmenter6.get_weights(); 
            case 7: return segmenter7.get_weights(); 

            case 8: return segmenter8.get_weights(); 
            case 9: return segmenter9.get_weights(); 
            case 10: return segmenter10.get_weights(); 
            case 11: return segmenter11.get_weights(); 
            case 12: return segmenter12.get_weights(); 
            case 13: return segmenter13.get_weights(); 
            case 14: return segmenter14.get_weights(); 
            case 15: return segmenter15.get_weights(); 

            default: throw dlib::error("Invalid mode");
        }
    }

    friend void serialize (const segmenter_type& item, std::ostream& out) 
    {
        serialize(item.mode, out);
        switch(item.mode)
        {
            case 0: serialize(item.segmenter0, out); break;
            case 1: serialize(item.segmenter1, out); break;
            case 2: serialize(item.segmenter2, out); break;
            case 3: serialize(item.segmenter3, out); break;
            case 4: serialize(item.segmenter4, out); break;
            case 5: serialize(item.segmenter5, out); break;
            case 6: serialize(item.segmenter6, out); break;
            case 7: serialize(item.segmenter7, out); break;

            case 8: serialize(item.segmenter8, out); break;
            case 9: serialize(item.segmenter9, out); break;
            case 10: serialize(item.segmenter10, out); break;
            case 11: serialize(item.segmenter11, out); break;
            case 12: serialize(item.segmenter12, out); break;
            case 13: serialize(item.segmenter13, out); break;
            case 14: serialize(item.segmenter14, out); break;
            case 15: serialize(item.segmenter15, out); break;
            default: throw dlib::error("Invalid mode");
        }
    }
    friend void deserialize (segmenter_type& item, std::istream& in)
    {
        deserialize(item.mode, in);
        switch(item.mode)
        {
            case 0: deserialize(item.segmenter0, in); break;
            case 1: deserialize(item.segmenter1, in); break;
            case 2: deserialize(item.segmenter2, in); break;
            case 3: deserialize(item.segmenter3, in); break;
            case 4: deserialize(item.segmenter4, in); break;
            case 5: deserialize(item.segmenter5, in); break;
            case 6: deserialize(item.segmenter6, in); break;
            case 7: deserialize(item.segmenter7, in); break;

            case 8: deserialize(item.segmenter8, in); break;
            case 9: deserialize(item.segmenter9, in); break;
            case 10: deserialize(item.segmenter10, in); break;
            case 11: deserialize(item.segmenter11, in); break;
            case 12: deserialize(item.segmenter12, in); break;
            case 13: deserialize(item.segmenter13, in); break;
            case 14: deserialize(item.segmenter14, in); break;
            case 15: deserialize(item.segmenter15, in); break;
            default: throw dlib::error("Invalid mode");
        }
    }

    int mode;

    typedef segmenter_feature_extractor<dense_vect, false,false,false> fe0;
    typedef segmenter_feature_extractor<dense_vect, false,false,true>  fe1;
    typedef segmenter_feature_extractor<dense_vect, false,true, false> fe2;
    typedef segmenter_feature_extractor<dense_vect, false,true, true>  fe3;
    typedef segmenter_feature_extractor<dense_vect, true, false,false> fe4;
    typedef segmenter_feature_extractor<dense_vect, true, false,true>  fe5;
    typedef segmenter_feature_extractor<dense_vect, true, true, false> fe6;
    typedef segmenter_feature_extractor<dense_vect, true, true, true>  fe7;
    sequence_segmenter<fe0> segmenter0;
    sequence_segmenter<fe1> segmenter1;
    sequence_segmenter<fe2> segmenter2;
    sequence_segmenter<fe3> segmenter3;
    sequence_segmenter<fe4> segmenter4;
    sequence_segmenter<fe5> segmenter5;
    sequence_segmenter<fe6> segmenter6;
    sequence_segmenter<fe7> segmenter7;

    typedef segmenter_feature_extractor<sparse_vect, false,false,false> fe8;
    typedef segmenter_feature_extractor<sparse_vect, false,false,true>  fe9;
    typedef segmenter_feature_extractor<sparse_vect, false,true, false> fe10;
    typedef segmenter_feature_extractor<sparse_vect, false,true, true>  fe11;
    typedef segmenter_feature_extractor<sparse_vect, true, false,false> fe12;
    typedef segmenter_feature_extractor<sparse_vect, true, false,true>  fe13;
    typedef segmenter_feature_extractor<sparse_vect, true, true, false> fe14;
    typedef segmenter_feature_extractor<sparse_vect, true, true, true>  fe15;
    sequence_segmenter<fe8> segmenter8;
    sequence_segmenter<fe9> segmenter9;
    sequence_segmenter<fe10> segmenter10;
    sequence_segmenter<fe11> segmenter11;
    sequence_segmenter<fe12> segmenter12;
    sequence_segmenter<fe13> segmenter13;
    sequence_segmenter<fe14> segmenter14;
    sequence_segmenter<fe15> segmenter15;
};


// ----------------------------------------------------------------------------------------

struct segmenter_params
{
    segmenter_params()
    {
        use_BIO_model = true;
        use_high_order_features = true;
        allow_negative_weights = true;
        window_size = 5;
        num_threads = 4;
        epsilon = 0.1;
        max_cache_size = 40;
        be_verbose = false;
        C = 100;
    }

    bool use_BIO_model;
    bool use_high_order_features;
    bool allow_negative_weights;
    unsigned long window_size;
    unsigned long num_threads;
    double epsilon;
    unsigned long max_cache_size;
    bool be_verbose;
    double C;
};


string segmenter_params__str__(const segmenter_params& p)
{
    ostringstream sout;
    if (p.use_BIO_model)
        sout << "BIO,";
    else
        sout << "BILOU,";

    if (p.use_high_order_features)
        sout << "highFeats,";
    else
        sout << "lowFeats,";

    if (p.allow_negative_weights)
        sout << "signed,";
    else
        sout << "non-negative,";

    sout << "win="<<p.window_size << ",";
    sout << "threads="<<p.num_threads << ",";
    sout << "eps="<<p.epsilon << ",";
    sout << "cache="<<p.max_cache_size << ",";
    if (p.be_verbose)
        sout << "verbose,";
    else
        sout << "non-verbose,";
    sout << "C="<<p.C;
    return trim(sout.str());
}

string segmenter_params__repr__(const segmenter_params& p)
{
    ostringstream sout;
    sout << "<";
    sout << segmenter_params__str__(p);
    sout << ">";
    return sout.str();
}

void serialize ( const segmenter_params& item, std::ostream& out)
{
    serialize(item.use_BIO_model, out);
    serialize(item.use_high_order_features, out);
    serialize(item.allow_negative_weights, out);
    serialize(item.window_size, out);
    serialize(item.num_threads, out);
    serialize(item.epsilon, out);
    serialize(item.max_cache_size, out);
    serialize(item.be_verbose, out);
    serialize(item.C, out);
}

void deserialize (segmenter_params& item, std::istream& in)
{
    deserialize(item.use_BIO_model, in);
    deserialize(item.use_high_order_features, in);
    deserialize(item.allow_negative_weights, in);
    deserialize(item.window_size, in);
    deserialize(item.num_threads, in);
    deserialize(item.epsilon, in);
    deserialize(item.max_cache_size, in);
    deserialize(item.be_verbose, in);
    deserialize(item.C, in);
}

// ----------------------------------------------------------------------------------------

template <typename T>
void configure_trainer (
    const std::vector<std::vector<dense_vect> >& samples,
    structural_sequence_segmentation_trainer<T>& trainer,
    const segmenter_params& params
)
{
    pyassert(samples.size() != 0, "Invalid arguments.  You must give some training sequences.");
    pyassert(samples[0].size() != 0, "Invalid arguments. You can't have zero length training sequences.");
    pyassert(params.window_size != 0, "Invalid window_size parameter, it must be > 0.");
    pyassert(params.epsilon > 0, "Invalid epsilon parameter, it must be > 0.");
    pyassert(params.C > 0, "Invalid C parameter, it must be > 0.");
    const long dims = samples[0][0].size();

    trainer = structural_sequence_segmentation_trainer<T>(T(dims, params.window_size));
    trainer.set_num_threads(params.num_threads);
    trainer.set_epsilon(params.epsilon);
    trainer.set_max_cache_size(params.max_cache_size);
    trainer.set_c(params.C);
    if (params.be_verbose)
        trainer.be_verbose();
}

// ----------------------------------------------------------------------------------------

template <typename T>
void configure_trainer (
    const std::vector<std::vector<sparse_vect> >& samples,
    structural_sequence_segmentation_trainer<T>& trainer,
    const segmenter_params& params
)
{
    pyassert(samples.size() != 0, "Invalid arguments.  You must give some training sequences.");
    pyassert(samples[0].size() != 0, "Invalid arguments. You can't have zero length training sequences.");

    unsigned long dims = 0;
    for (unsigned long i = 0; i < samples.size(); ++i)
    {
        dims = std::max(dims, max_index_plus_one(samples[i]));
    }

    trainer = structural_sequence_segmentation_trainer<T>(T(dims, params.window_size));
    trainer.set_num_threads(params.num_threads);
    trainer.set_epsilon(params.epsilon);
    trainer.set_max_cache_size(params.max_cache_size);
    trainer.set_c(params.C);
    if (params.be_verbose)
        trainer.be_verbose();
}

// ----------------------------------------------------------------------------------------

segmenter_type train_dense (
    const std::vector<std::vector<dense_vect> >& samples,
    const std::vector<ranges>& segments,
    segmenter_params params
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");

    int mode = 0;
    if (params.use_BIO_model)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.use_high_order_features)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.allow_negative_weights)
        mode = mode*2 + 1;
    else 
        mode = mode*2;


    segmenter_type res;
    res.mode = mode;
    switch(mode)
    {
        case 0: { structural_sequence_segmentation_trainer<segmenter_type::fe0> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter0 = trainer.train(samples, segments);
                } break;
        case 1: { structural_sequence_segmentation_trainer<segmenter_type::fe1> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter1 = trainer.train(samples, segments);
                } break;
        case 2: { structural_sequence_segmentation_trainer<segmenter_type::fe2> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter2 = trainer.train(samples, segments);
                } break;
        case 3: { structural_sequence_segmentation_trainer<segmenter_type::fe3> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter3 = trainer.train(samples, segments);
                } break;
        case 4: { structural_sequence_segmentation_trainer<segmenter_type::fe4> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter4 = trainer.train(samples, segments);
                } break;
        case 5: { structural_sequence_segmentation_trainer<segmenter_type::fe5> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter5 = trainer.train(samples, segments);
                } break;
        case 6: { structural_sequence_segmentation_trainer<segmenter_type::fe6> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter6 = trainer.train(samples, segments);
                } break;
        case 7: { structural_sequence_segmentation_trainer<segmenter_type::fe7> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter7 = trainer.train(samples, segments);
                } break;
        default: throw dlib::error("Invalid mode");
    }


    return res;
}

// ----------------------------------------------------------------------------------------

segmenter_type train_sparse (
    const std::vector<std::vector<sparse_vect> >& samples,
    const std::vector<ranges>& segments,
    segmenter_params params
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");

    int mode = 0;
    if (params.use_BIO_model)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.use_high_order_features)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.allow_negative_weights)
        mode = mode*2 + 1;
    else 
        mode = mode*2;

    mode += 8;

    segmenter_type res;
    res.mode = mode;
    switch(mode)
    {
        case 8: { structural_sequence_segmentation_trainer<segmenter_type::fe8> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter8 = trainer.train(samples, segments);
                } break;
        case 9: { structural_sequence_segmentation_trainer<segmenter_type::fe9> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter9 = trainer.train(samples, segments);
                } break;
        case 10: { structural_sequence_segmentation_trainer<segmenter_type::fe10> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter10 = trainer.train(samples, segments);
                } break;
        case 11: { structural_sequence_segmentation_trainer<segmenter_type::fe11> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter11 = trainer.train(samples, segments);
                } break;
        case 12: { structural_sequence_segmentation_trainer<segmenter_type::fe12> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter12 = trainer.train(samples, segments);
                } break;
        case 13: { structural_sequence_segmentation_trainer<segmenter_type::fe13> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter13 = trainer.train(samples, segments);
                } break;
        case 14: { structural_sequence_segmentation_trainer<segmenter_type::fe14> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter14 = trainer.train(samples, segments);
                } break;
        case 15: { structural_sequence_segmentation_trainer<segmenter_type::fe15> trainer;
                  configure_trainer(samples, trainer, params);
                  res.segmenter15 = trainer.train(samples, segments);
                } break;
        default: throw dlib::error("Invalid mode");
    }


    return res;
}

// ----------------------------------------------------------------------------------------


struct segmenter_test 
{
    double precision;
    double recall;
    double f1;
};

void serialize(const segmenter_test& item, std::ostream& out)
{
    serialize(item.precision, out);
    serialize(item.recall, out);
    serialize(item.f1, out);
}

void deserialize(segmenter_test& item, std::istream& in)
{
    deserialize(item.precision, in);
    deserialize(item.recall, in);
    deserialize(item.f1, in);
}

std::string segmenter_test__str__(const segmenter_test& item)
{
    std::ostringstream sout;
    sout << "precision: "<< item.precision << "  recall: "<< item.recall << "  f1-score: " << item.f1; 
    return sout.str();
}
std::string segmenter_test__repr__(const segmenter_test& item) { return "< " + segmenter_test__str__(item) + " >";}

// ----------------------------------------------------------------------------------------

const segmenter_test test_sequence_segmenter1 (
    const segmenter_type& segmenter,
    const std::vector<std::vector<dense_vect> >& samples,
    const std::vector<ranges>& segments 
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");
    matrix<double,1,3> res;
    
    switch(segmenter.mode)
    {
        case 0: res = test_sequence_segmenter(segmenter.segmenter0, samples, segments); break;
        case 1: res = test_sequence_segmenter(segmenter.segmenter1, samples, segments); break;
        case 2: res = test_sequence_segmenter(segmenter.segmenter2, samples, segments); break;
        case 3: res = test_sequence_segmenter(segmenter.segmenter3, samples, segments); break;
        case 4: res = test_sequence_segmenter(segmenter.segmenter4, samples, segments); break;
        case 5: res = test_sequence_segmenter(segmenter.segmenter5, samples, segments); break;
        case 6: res = test_sequence_segmenter(segmenter.segmenter6, samples, segments); break;
        case 7: res = test_sequence_segmenter(segmenter.segmenter7, samples, segments); break;
        default: throw dlib::error("Invalid mode");
    }


    segmenter_test temp;
    temp.precision = res(0);
    temp.recall = res(1);
    temp.f1 = res(2);
    return temp;
}

const segmenter_test test_sequence_segmenter2 (
    const segmenter_type& segmenter,
    const std::vector<std::vector<sparse_vect> >& samples,
    const std::vector<ranges>& segments 
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");
    matrix<double,1,3> res;
    
    switch(segmenter.mode)
    {
        case 8: res = test_sequence_segmenter(segmenter.segmenter8, samples, segments); break;
        case 9: res = test_sequence_segmenter(segmenter.segmenter9, samples, segments); break;
        case 10: res = test_sequence_segmenter(segmenter.segmenter10, samples, segments); break;
        case 11: res = test_sequence_segmenter(segmenter.segmenter11, samples, segments); break;
        case 12: res = test_sequence_segmenter(segmenter.segmenter12, samples, segments); break;
        case 13: res = test_sequence_segmenter(segmenter.segmenter13, samples, segments); break;
        case 14: res = test_sequence_segmenter(segmenter.segmenter14, samples, segments); break;
        case 15: res = test_sequence_segmenter(segmenter.segmenter15, samples, segments); break;
        default: throw dlib::error("Invalid mode");
    }


    segmenter_test temp;
    temp.precision = res(0);
    temp.recall = res(1);
    temp.f1 = res(2);
    return temp;
}

// ----------------------------------------------------------------------------------------

const segmenter_test cross_validate_sequence_segmenter1 (
    const std::vector<std::vector<dense_vect> >& samples,
    const std::vector<ranges>& segments,
    long folds,
    segmenter_params params
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");
    pyassert(1 < folds && folds <= static_cast<long>(samples.size()), "folds argument is outside the valid range.");

    matrix<double,1,3> res;
    
    int mode = 0;
    if (params.use_BIO_model)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.use_high_order_features)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.allow_negative_weights)
        mode = mode*2 + 1;
    else 
        mode = mode*2;


    switch(mode)
    {
        case 0: { structural_sequence_segmentation_trainer<segmenter_type::fe0> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 1: { structural_sequence_segmentation_trainer<segmenter_type::fe1> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 2: { structural_sequence_segmentation_trainer<segmenter_type::fe2> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 3: { structural_sequence_segmentation_trainer<segmenter_type::fe3> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 4: { structural_sequence_segmentation_trainer<segmenter_type::fe4> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 5: { structural_sequence_segmentation_trainer<segmenter_type::fe5> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 6: { structural_sequence_segmentation_trainer<segmenter_type::fe6> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 7: { structural_sequence_segmentation_trainer<segmenter_type::fe7> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        default: throw dlib::error("Invalid mode");
    }


    segmenter_test temp;
    temp.precision = res(0);
    temp.recall = res(1);
    temp.f1 = res(2);
    return temp;
}

const segmenter_test cross_validate_sequence_segmenter2 (
    const std::vector<std::vector<sparse_vect> >& samples,
    const std::vector<ranges>& segments,
    long folds,
    segmenter_params params
)
{
    pyassert(is_sequence_segmentation_problem(samples, segments), "Invalid inputs");
    pyassert(1 < folds && folds <= static_cast<long>(samples.size()), "folds argument is outside the valid range.");

    matrix<double,1,3> res;
    
    int mode = 0;
    if (params.use_BIO_model)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.use_high_order_features)
        mode = mode*2 + 1;
    else 
        mode = mode*2;
    if (params.allow_negative_weights)
        mode = mode*2 + 1;
    else 
        mode = mode*2;

    mode += 8;

    switch(mode)
    {
        case 8: { structural_sequence_segmentation_trainer<segmenter_type::fe8> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 9: { structural_sequence_segmentation_trainer<segmenter_type::fe9> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 10: { structural_sequence_segmentation_trainer<segmenter_type::fe10> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 11: { structural_sequence_segmentation_trainer<segmenter_type::fe11> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 12: { structural_sequence_segmentation_trainer<segmenter_type::fe12> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 13: { structural_sequence_segmentation_trainer<segmenter_type::fe13> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 14: { structural_sequence_segmentation_trainer<segmenter_type::fe14> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        case 15: { structural_sequence_segmentation_trainer<segmenter_type::fe15> trainer;
                  configure_trainer(samples, trainer, params);
                  res = cross_validate_sequence_segmenter(trainer, samples, segments, folds);
                } break;
        default: throw dlib::error("Invalid mode");
    }


    segmenter_test temp;
    temp.precision = res(0);
    temp.recall = res(1);
    temp.f1 = res(2);
    return temp;
}

// ----------------------------------------------------------------------------------------

void bind_sequence_segmenter()
{
    class_<segmenter_params>("segmenter_params",
"This class is used to define all the optional parameters to the    \n\
train_sequence_segmenter() and cross_validate_sequence_segmenter() routines.   ")
        .def_readwrite("use_BIO_model", &segmenter_params::use_BIO_model)
        .def_readwrite("use_high_order_features", &segmenter_params::use_high_order_features)
        .def_readwrite("allow_negative_weights", &segmenter_params::allow_negative_weights)
        .def_readwrite("window_size", &segmenter_params::window_size)
        .def_readwrite("num_threads", &segmenter_params::num_threads)
        .def_readwrite("epsilon", &segmenter_params::epsilon)
        .def_readwrite("max_cache_size", &segmenter_params::max_cache_size)
        .def_readwrite("C", &segmenter_params::C, "SVM C parameter")
        .def_readwrite("be_verbose", &segmenter_params::be_verbose)
        .def("__repr__",&segmenter_params__repr__)
        .def("__str__",&segmenter_params__str__)
        .def_pickle(serialize_pickle<segmenter_params>());

    class_<segmenter_type> ("segmenter_type", "This object represents a sequence segmenter and is the type of object "
        "returned by the dlib.train_sequence_segmenter() routine.")
        .def("__call__", &segmenter_type::segment_sequence_dense)
        .def("__call__", &segmenter_type::segment_sequence_sparse)
        .def_readonly("weights", &segmenter_type::get_weights)
        .def_pickle(serialize_pickle<segmenter_type>());

    class_<segmenter_test> ("segmenter_test", "This object is the output of the dlib.test_sequence_segmenter() and "
        "dlib.cross_validate_sequence_segmenter() routines.")
        .def_readwrite("precision", &segmenter_test::precision)
        .def_readwrite("recall", &segmenter_test::recall)
        .def_readwrite("f1", &segmenter_test::f1)
        .def("__repr__",&segmenter_test__repr__)
        .def("__str__",&segmenter_test__str__)
        .def_pickle(serialize_pickle<segmenter_test>());

    using boost::python::arg;
    def("train_sequence_segmenter", train_dense, (arg("samples"), arg("segments"), arg("params")=segmenter_params()));
    def("train_sequence_segmenter", train_sparse, (arg("samples"), arg("segments"), arg("params")=segmenter_params()));


    def("test_sequence_segmenter", test_sequence_segmenter1);
    def("test_sequence_segmenter", test_sequence_segmenter2);

    def("cross_validate_sequence_segmenter", cross_validate_sequence_segmenter1,
        (arg("samples"), arg("segments"), arg("folds"), arg("params")=segmenter_params()));
    def("cross_validate_sequence_segmenter", cross_validate_sequence_segmenter2,
        (arg("samples"), arg("segments"), arg("folds"), arg("params")=segmenter_params()));
}




