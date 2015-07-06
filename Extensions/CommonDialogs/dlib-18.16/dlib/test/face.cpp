// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/image_processing/frontal_face_detector.h>
#include <dlib/image_processing.h>
#include <vector>
#include <sstream>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>
#include <dlib/image_io.h>

//#include <dlib/gui_widgets.h>
//#include <dlib/image_processing/render_face_detections.h>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.face");


    class face_tester : public tester
    {
    public:
        face_tester (
        ) :
            tester (
                "test_face",       // the command line argument name for this test
                "Run tests on the face detection/landmarking modules.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }


        void get_test_face_landmark_dataset (
            dlib::array<array2d<unsigned char> >& images,
            std::vector<std::vector<full_object_detection> >& objects
        )
        {
            istringstream sin(get_decoded_string());
            images.resize(1);
            objects.resize(1);
            load_dng(images[0], sin);
            pyramid_up(images[0]);
            deserialize(objects[0], sin);
        }

        void perform_test()
        {
            print_spinner();
            dlib::array<array2d<unsigned char> > images;
            std::vector<std::vector<full_object_detection> > objects;
            get_test_face_landmark_dataset(images, objects);

            frontal_face_detector detector = get_frontal_face_detector();

            print_spinner();
            shape_predictor_trainer trainer;
            trainer.set_tree_depth(2);
            trainer.set_nu(0.05);
            //trainer.be_verbose();

            shape_predictor sp = trainer.train(images, objects);

            print_spinner();

            // It should have been able to perfectly fit the data
            DLIB_TEST(test_shape_predictor(sp, images, objects) == 0);

            print_spinner();

            // While we are here, make sure the default face detector works
            std::vector<rectangle> dets = detector(images[0]);
            DLIB_TEST(dets.size() == 3);


            /*
            // visualize the detections
            std::vector<full_object_detection> shapes;
            for (unsigned long j = 0; j < dets.size(); ++j)
            {
                full_object_detection shape = sp(images[0], dets[j]);
                shapes.push_back(shape);
            }
            image_window win(images[0]);
            win.add_overlay(render_face_detections(shapes));
            cin.get();
            */

        }


    // ------------------------------------------------------------------------------------

        // This function returns the contents of the file 'test_faces.dat'
        const std::string get_decoded_string()
        {
            dlib::base64 base64_coder;
            dlib::compress_stream::kernel_1ea compressor;
            std::ostringstream sout;
            std::istringstream sin;

            // The base64 encoded data from the file 'test_faces.dat' we want to decode and return.
            sout << "RFYXmMn7UA64INJ2Umw+YCh5xX6v+y3bqV/1EKP3ZtvdIWxDCoyZ8oJjj/LXTw3PyEMQReTyXO+8";
            sout << "423ExTTLMRLxc5gEI4PK8vLMVWdRjRKldYfFLisH5qk7o6TxYfRXqmch/t4c53UfsUuJuVMvA+nf";
            sout << "05tfgx0Z2VgrlMmvKSxX0VHEjQ3ZVqQl0mLeur1qoMRmcPjYA4QJOvcruwyz/hFpVU8snvsri4QA";
            sout << "hkCrOtvl/iTlLvcWXDM98OXEYLk4vr6z2v73mGGEdbaJFafXOgutY0NRESpJfingJkuZKXNV7fQ8";
            sout << "F1DmHwFM0Izoc3fUyN7+xtLo2LSEH8uohv79wjxdbm71n5kgHb6cnpYiiCLOgqKrK+qJUJG1/OBB";
            sout << "9IORGL6SHrogefDg76m4ayil0lE4pQLa1fKhXGqphdxDMyBXHkOpxA356i5Evk7jZb/AqHUu/hQV";
            sout << "QYOsW20TRhuFfrasrb/Veq10hMZomosAnNb+Uhgnu2Ip4igX6ozJqmCL4NngjEgoXuCA02KzmIqK";
            sout << "fcslrBjyg7WZnF2w7UZXcHoZ0AVijb/ANPUqvq9H4k5WCFh53pwG6oj+CG5N7EXLzt9UHtillGJH";
            sout << "S252/dLvzaNxSq0vDP+Y0IvtKhZgIlmX3duu+L7iJUMinE90OXQFzhwCaOM8oP3Mq+Becgto5Vjb";
            sout << "vv+2xeyrYL9hBfMyPzbBhVWZdaPyI62MGMPjTfmAUmufWm3/Pxey5Jw6MUNX1rfWMXYQTtamdtcE";
            sout << "XmuFGhLCWbnJN2GtlOWu+S0LdWAziktr0mdovdFZTwKnd2Fuf1VeMMHBCgF5D56UK6/JTXO1gPlj";
            sout << "VpavizirUH46rHVnGOFZHWarPKymXyrQ/VhFbVBSOi9UGbsMo9sYNYhvFlzSBN5orNoY+5AP+Y2X";
            sout << "BDw342Vg3YRIZBqaXZ7oOqyDtjFYNf2g7ColnaFrPiYCKg9VQvVQVXvr4Oa6TTryepXylHk11ijw";
            sout << "xYgjiENTDKVuXPLVrAEWZD6wq5+LGbmj1cgh59XgLErkoliKxVeEv4ktXqceCFK9YWljqJZSBxFj";
            sout << "T64N945O47Oek591sfRFYrjebJz3kooaaOQ7lm4BWpW64Am/Od0FIkggSzPUgf+jYrnPdH4oqv3d";
            sout << "NJIXJO8aeCi/WCqgbdgLwpu1MB8cTdbK2TrCbi3sHhQddE6rqZ1XIg25gYTw72q4ZFUHmRrBEgdz";
            sout << "i2xh7qHevCWC9Ht7HrUcLl35/UCcNck/ftiDa/xN3rBJp+cJCyS9ZXScFbgFKYfBau8Dx+JA3ygU";
            sout << "pvYbUP29UeK5hXZoQzC74UKw/liapW8GbR3ZPV+59xmw1b7phyApZfODkDLG5lyTB5Co6vIfmqXp";
            sout << "DSA1I0ZPIk7hJHWtddgvAg6Yv4GhMZs/cn08Z/ZRXYSMw20rA66BeMD+IPFe3MPFPnKsl/qRvXIC";
            sout << "gTmLcjPQ5naBo/3haQg4TjJCBCErTC2JktJE0vRfm8v+1kEFoycTsRfhDZtjMnqmqSiNO3VSbnbb";
            sout << "et/mFvCdd9kqBXQ4VaeYdJwORA7/TocC84G91jlfNRhbY2KW9xHXYYwscfaV5DtPWhyJBEimzLsz";
            sout << "F59UbkO/WOT7HEwJ3p1/ReH6feLrIYwR8OdSeuOUtK2oboodiUmx/if9pyNONd0If9jFGDXvWP/r";
            sout << "dL6NdRh68swmPyiCn7sAwaUbd7PF7K+jqgk3jMDMaoWE6p+aAFK3H/JxRO7th2XvX57uA+RKoXEq";
            sout << "LBJrDkoPGbA5Ctj6KUWknMM62HVIO1SjwZH7ROOlCVbHvDd3JTT6TNs2Lj8g78q6WRMnDVV0L9Q7";
            sout << "S6awjHePvyj9fDn66jpmRxI9TkqNPx0b8tGfOnUoXGKK/WcInBjVd+FYy1SO5FIVZ4JQdiSMgehu";
            sout << "EU7X2yjbdgCtVg+kY3ZgYcCMM72NLdm7+U+qVxzfY9bNtzLRsEDNFL2wnq3DkbRRiHKHswEugXjG";
            sout << "fFfzqjU71sDH3gc1dhOQT456XK0zhmV/62+N+oTxrFY2F/ArALeDiR1q1JOrE1UDzU/ezAZVWS/a";
            sout << "DJ8O9TVZsbOXOU4hAiQ6mR5hh6i5c/zb7jBl6ehNgixrJqguo9PT10P3S6I+IiTG2vHlws4ZoTmz";
            sout << "7iOj1ICCN6ivwPj5+afYScxPGLVujxWTW8ksey8RjSIbH+N9wUEAJAcZAGXo2UrP93uRkdLt/cvi";
            sout << "Q4eIONlUrJ79hlo1xyvPmyNw9Ye1zG6epUK+lsXxtUbtX+uX+sDM/Gkr5QUdzzorfa4Mj9vEglQp";
            sout << "iK5319kTeymqqV25YhNZZsoqCg+eckmoZP21cAHkPYZWAzg4lxhm71EAp+fE67Y44szeCSRNydRh";
            sout << "mCl0ZGV59wVfUONdohN/9OQJ8gxifHspscrRszBALwCu2FrniGwRMvIi6lD6tb49dmpPlO1y5SEl";
            sout << "HPF2I271RVx0YwFPprp+2/fzsnKIIhfgTNRVji2tfjHPoge84e5O02Z/cLlg7EzIfr/JK8Xd6mwp";
            sout << "t3kIofktLqWbnBrr8qEvz2BmHRlEjYlpb6HfbK82ZHiOusVJdhAxRcRIqmImh5wtunlJOXdQqfmg";
            sout << "8P0TYVDzQlc6ywbKt/VjTsxI4qisabVvVBkW5VsKU4/JONoNj7fgomwfHqryIIZcgc5vPLawnurD";
            sout << "7JR1LRiTy7+7riDIxKdYtgbTuOnK6tO103XC+5NT07cKydDgtTu1gYoTTgzY+gkK53lX2Swbbme7";
            sout << "wIFOXRwSK4ntGt4XXuuPbF8gc0T8ez8/tOEXE6Di8Ckj2O3uz2vGM27PQH9YU3Y3YCdcuaHlUIMG";
            sout << "s7bgx4nM+xMPmS5baTuAHiPAxp3SepeKpHg0on6Bv99NPSDf7nWRcvvd3+/MHhyDfkbzd88GPnkQ";
            sout << "Y7a91Tlj8RKG6B8W+zzn+SWzTIz5eJcLJCEKN7fXm1YjJjk3Tdi99PZA/K3Ek2k2lcd2oQPXj6fc";
            sout << "EUs9zy6sZdSjttwsYlZzLW0Rpiscjqs1XNA+2D5UahufMk4AVpnDPqZ/OvmSZIPpTT4r+uQsEZlJ";
            sout << "BYf6A9riAPhgR68zPz+i+ffpPcgwURCDviqf370nLIqfbDgJSztxXI2MPsHZqypB+VtvuLTq+M2s";
            sout << "NVdvA6z5J35d3fk8EHVo8/TIWbsSulqnpJvjIHT9GeTV4EvaJo0kh092cFQ3QkbRIIzEqnT/o06z";
            sout << "/+gqB0fKl93o50EUVzJbz02rPc/4qVaqfSJLg+HEZUg30PB8wQHb2oWqgL1lYDlqrv5plbK2kJm9";
            sout << "HW9aQfOyX57rBsYi4aljZl5icy/JElsuNanhnTcTvrHQ/9ntw8QqV2PuVesbbaUQSjDRWG6D1uaK";
            sout << "HSYB/6fvMZ+8hy+gq4d/tMKpoCzgERJjJOU+N0vHpKmyZgE0EGkPJwlgev/oxTJtsQndgrNviPkr";
            sout << "ub9ZRkS5uM7Jb+1mKztyVWDdtVvxnvgboNayuS5/VdwlbQezQKEiB8I8UWLsgEJiXg9sgjBaFrv8";
            sout << "3WgtSQmMRyukOnDPWwDskmUyIHKIye1wOY3H1BUuav52tg8gv1+y2CrVVebRm/8MmhJYe/8DpLeo";
            sout << "1eEAX2SNtZH4VzpZSuAdANtYXgBaNTc0uWtw9Wc8mwo2hTfbu5nVYJ6vlUFP7HH7L+1idfrz832x";
            sout << "l20/+8EKd8y2f20iP6m1mnKCQ9PUPPhWMfWMkJ21VhKJJDcpKhvQq20O/yqhfxabl+73QZiCS/eR";
            sout << "E1ih71FN4x+s952FXOakzYlo5Gge1OCgHE0+YVXBSal4fz6Ye1iRG7+XgLxDIx6AGbOfemRQbOzW";
            sout << "e/8pe0kPqkkS5ogdkCGemb3hKTgGFGXgP9IvJ18VuRDxPSHD1e5THwvULz7V0hUWO4aKx8t8tZIK";
            sout << "flDB/npEo3L/1jU5rLEuX5KQbxJfEY2V22hND1ohUZdU+Uy6BFZ/hdYzFAUyNdLAFS36wB3XThar";
            sout << "54CQ0RGIxCCtv5ucI7VQuc46jkk6SEmZV8FUwv79ExsrB+rAlBvhNOrmVA2vmikrb/iZfA6z1hC2";
            sout << "aj8BGiULdcW0YUiN/TXxoVT0qgh87VjPcOfkj8gTRMF8VGAgRs0HpXVXKZf+ncAOKJ59yu3EsOCp";
            sout << "vSG5zxDxrUYD7TFxrelev/7Jtan4J8ouFsK8ZA4WmBkbWLDBkKvV09c7Jxfmgt27aVI5uuUBJYb0";
            sout << "TdKIG6J/JC85GrRedIb/kRaMiTP0Els6jGp3C/B9PQq6HbzSCUEkLE8is+uWnTDOynbgTtUVEGxH";
            sout << "EKZGBtnPfqgZRDOnZTWMO9Hd9qATpI2qRrgxIvHTUhqD3DQQ37AGTcNsMmj/+mXTBV2vbM9H7Q5K";
            sout << "APzltdgkGc+hZIL8Fy3CXzzRFlXAEoIcnJ3BKT7AdGg3pEaW1YcX4akaOTDmImZelYTCoTGu1R4Y";
            sout << "ZD/rRCeiGR9txS9x9/ptvxeD3J8wYOXxDzCkyMQy1io+izFuN4kTd5MW3RlvepWT4FE2hvjyTyV+";
            sout << "G4F+lcZFjCGmJKguZEzH3Qtww3OTGZqOfL9oADqQsUpEl92hm0uNOPHH6+8gWPZgb3EcCRkWeXaA";
            sout << "DkTbCC5rV04N6Fg3j27K1v7qkykWB4y61W00dFejgPitoYuln4A8lY9RtIKzJYFfSOKnrAqYGMkn";
            sout << "PReI5ZneFTiklSL6FkhWHvr5oz4EsAoU3fLWjky27E1CtpFkPKHLGyc2mnf2N7iBMGa8j2ipy9xd";
            sout << "JwInqdDdGIHR5dUmNAy1A4vyGbOE7qa0ErVy4m3riKkyE0ObQTNoBeYa6CUHwNWCLCbiW2VzRY/H";
            sout << "s6APvI6QIco+Wu9dx36qklvA6/OfM79BsUACnCRG2yo3bHeTeKMwKIx05RkNNJ76eOhjxOiPJBVR";
            sout << "K5V+G3SutaRM0hSK0ABS5nfveZmowfJr8nZHRBAPHyIdv0bJW8lSNIRtZtgwm1dl13+eaeAJNpJm";
            sout << "3eVvhP8c43LG938Bjxs/nfDl5GMzPnyLOIYInIt4wTXCZlRbt6pMXs9IX9/DpUt/AF44b+XQLnUT";
            sout << "DgJa4In4qREDt58wel1oAGe9xpIqdFNPduUuCo/Ly0XHrBFd3jQFgp0JWZ039GtG2YTHpo8rLfu+";
            sout << "TiTAmKnFbVZa6dlOzmVDV+53ptJxiWNfNMa2ri/YEFI7BpKi1FZvMfpGBzNmAdZBAt7kaSvIzqdl";
            sout << "OHMqka3GBbzyW1PusVpj6SWBZ7rsfIFPRdVO4PGcOWSIQ/YlZYXtkV82cw+m4D/ScXdlj0VZBB04";
            sout << "YfeUz1m8tiWsLdHxIKRI1JcLek5PzCQX33RFmfeqGBEa7q/kCzGiJ0QHiJV07Fxm2NKRUZQIWiJO";
            sout << "n1roUf9C06IT03Wd0rcSlwG8Ji9SJZOlBEi7B9Vos61eXMEnkcNiRVeOxLaOfqr20XMde4kquqrS";
            sout << "qZi2ZhNVqokhXNswwMtlMDfWBWWI39q4evlS8c60lQjXg39kyKbyVZOzp6KrJ+xDYUxURb2d/7DZ";
            sout << "+UpikS9DmbUgWqV1pmx84ARtPp8/5teoBM7qd6sRrpJ1Q4cE4WLQfr/nVnVmSfZVzm6yqlxjGvhQ";
            sout << "Bwz85XvMn4xjWIRDNnuwyJh7PoXkoacU54idHA4k7B3qeW59MKtXD3hA34qKUqqE0amH1Xzi3W84";
            sout << "HpL4xT9EoNUPv+ufvo/4Yir/YIMIVuj1BFQACONJWezdbHO7ze7DQrceR9ojpVlkM442CArpnYWZ";
            sout << "3SR0NRB0PFjJcgA3RPVWW591v7Aw3G7/aUh5OLSZsOoxrnE2Hb8wM4wQXutleUjcUCxdliAbLl/k";
            sout << "RcLSE+IzpwRpnSo05sBx91Q71Ws9NeS0Pruy03wScuztfv15MPoBmMH4Nc+JhF/iokGM7C4IICOb";
            sout << "Woffq9KzUSWaIEEO+qaKqfnG7+/bW5U/gDW0xAfvTt0IuXtoJH5/Gq/g/anFdecnyCdBa4C02MFJ";
            sout << "gLqm9Dyiuh5Hny9bAuE08YxgrfpwOx3nGxQ/MrXwGUNjCxJEz4TkmFt/Z6HmOUhobQ4Xue5rK6gp";
            sout << "qWkg7gkXJmpNaj40TFnxQ3Fvw7S1UPNcY3vEvskuYXlB6mI16FCa6ApkR3+krkCKokxelBU5eMxx";
            sout << "+j5Lv8hYzlSlULUJrDOmGRxQ65lOJPmxbuukr6Uaeh3/i5m8GLqJ3EAkeIABkck+sT/OCCS+1hmY";
            sout << "/wRbadX8sd19GjHTLkZ7jwEss0qQj1LdtcEtqXgtzy7+8NhQv9c4KhxFNZdYDezehZYZuf4+UeHM";
            sout << "UAPE6+DX+AtKRD5lSwcAEoFID5GLbsLa+gGWzhmn5dfTDvaJrQNYzI6K1f0MBsWxuXu5SM6dRehm";
            sout << "9FR9es1OnhIFP8bg5uR7lfIEsfAH6ysgkJyylceoooXwE+cALB+IYfk3mIHNuDMbrQxWIMZmS1er";
            sout << "I45Gz53QPLgcSjH9Z1mzrhaZV3ZiJqrTYETtObMRX0136rNLBCaytijF1H4QBJaNEsuJpHAYQHsC";
            sout << "ko8cTk8lzMmh+ENtUjLvrG+pEx9FKCPIgUIZrAAM39fWS5uKhFaAPEkfD/FxbEMdM/hjzbQzcMHy";
            sout << "iYywZCaCYwolzrQtlTIL3I4VqzpUk/vWMIZt/PMK8lUGBDxzELkXNTYepRJ+uR6QZKOU+/LpLk8K";
            sout << "MD6+BZNl2karSYjx9qDDHuADoiNJbSXLV2NqyJiNyTmdKv8E4e52mVFfetoMp+gpd7vMJaAObPuJ";
            sout << "A7rUsNjWz+Zho52LXUSUC1G1MdZPRZPMfk/KvNnXZX93P/KaBXTNLlRf4KkRXQdrnmP5KgKFOvIX";
            sout << "KUMJ7UQtP0koYJl8OsFHG5yX+qI4BOJqVT0eUypXtlW/CHRX51Wl11wIDsTqbi7zEkBu3kFLMfnr";
            sout << "3MEYcVWthG5Y9KecfsdLtRnQVSFRMEKEn1kpVAb7xqZhwKDqREVs+32AawqNxPdO4JOCC/wW0zzH";
            sout << "QlJ8KhbcrxKLaygvVOrqaZGeCNTrrRxpG792CtX4OqXdkxpqcPNjhQJXMgSm/OvHJ1sJOrIHYaru";
            sout << "JPDH/J4e0qg28rlRpN/iY9xc5Q/dMxhoEsv87ehP+MPKF5ByxrWHbNc9IaOiz5BQIQWAc1glXkKc";
            sout << "oyMgoCbZ1Zss8zJ1+k4NwoC59BpnT4KbZHZP7+MbXZidCSosl1P88yC0vj0BX8MK+8x6PA3X9Zc5";
            sout << "Sg2OMThc6WRR3oi/DeHePYqJgPtJwhZt7N651llY8/YIJD7pqVEiB8KJGcrjZ9tDuU0MDTkKnrr7";
            sout << "qhlSl/XFBGq0x9zIfYeBt6k2wgrpE2/FjgziM3YuH/e7jfppGx3S3G4O+yrUuAynknZQ6Opq+Qs1";
            sout << "PYFZMW8Fj+CPMgXGy/2+JPXULK8vf0hN3FfNDeHiGpuGEVaEBHdZdE3CW8cWwyRSdvQHgPbXwEaL";
            sout << "pLGxPhgGQlPLK/JvDQhtL7gqS1LQEAER1sleOHoTV5zEpCsKUcvisz0V7TyFozYnzaG0IcfeGysR";
            sout << "Kx7O4dq05dlnXicv2IrhcCp9+QZSHDL/E/t/SEafxZJu+sIhqknM+Sgx3MAhE/U8KyOANAYy1aPB";
            sout << "H5Qt5RnDbYuFJXHDG9DfEWWcNP8e2EL1CX0/gncYvIz3b5Ge0gv4hwbV23Xzsi3hOki4A/B44nOd";
            sout << "fAE3Ao1D16+6XowEVC8gUh+y1TSnYPTtnB30NbrcMhHNaJP0pYzG41gNaMJNjK8SGXSnPKiXrsJ2";
            sout << "1jsvbLaMTEBdCqw+2lgg/QwEVgUef7JhVNKbQKf/HTtuD50Ofa4PXv37Q92/xnHWHwjbWfeNEZWA";
            sout << "Y5bqQI/MlWBKWSGFjpoQsfbCzS6P3ieD3ID91DmB7tDjTDYm5Wq6LoHAQzx+tTxiq45Qn5tUg0zx";
            sout << "7VC8Xh0ygItADoEqXpKUXdfv0o6G4zxjePM4dvyf4NBkh27q1S/aQwQp8UOury2Eunij57XSxaOb";
            sout << "IFwlFJYC6wtmg6oV0QZAburx8qJMLdIvHyqa5YJJ3HGuHJIyiD+tuxWVxDZSJQ1RedYqBPAiloyy";
            sout << "Z3j6EJKqNh0kq3c0K/B7gpX0P1ZjOFZUadIbEW6dd8bxl0RuyhzdSUMkn4rWgmx7zPvoOEgXzbK+";
            sout << "mJmBT9lEaYE4sFkXfZqDCGq66jdc4RrlD4IZbGkXwMeTuHsfLL1hviKSOyJCTbmS5dKZUdWuVk8R";
            sout << "XFqATzyHHdArHR9RvNa2bQk5b59tODpeKCqECv5DJ5T2ap8u21ctDCJiFCHq3gLfw6IumI1L2m6/";
            sout << "aPGdZ0d4ZMR9ooQvJuhAODKg0ZsA+LjHTakpfUwHpanPWkCbmhuh3oMC+hMX+AqOi55nr2O5uxRL";
            sout << "9UwixLBmRa8g3lbgUGdteTTbvZ2ePyzwxhWp1RS+aFJqtORmRMkgB6vRc4SC1CywKwwHoR3RKEj7";
            sout << "uW6oQyLQqPYevLuBrbO6yn7U6DkU6blGF7jg/2y12MpwYPr8l661YMXXsmVHCVSJ0AsPSGhJ8oL3";
            sout << "Cqk6DJbpyoN8O1xK4zNE0cToRFMhEBjlim0lg56HtbEHfLkqRwnFqfo6vvK6opxJoShMXDa5jrLH";
            sout << "GkpmE4DzaGtZ/P397TF3Y12c6lXJFDYWslp4tMskzsy9FdW63kRUvl6Q3UsWj72qGE6r/PGVetJ9";
            sout << "in33oiVHTjYppFrza0ryzPE02V4uobC3y2DtoG/YK/GJFkhm68O0QKxyuBURMfT4j046fBQAbwUo";
            sout << "B/Ylsb+srIUK6sIEnnzdJ/8ve3f961Yx5Kywf/9kVZnUz5RoiP/bOWXm6jasSq7LEvX2nT2fweup";
            sout << "/TI83XIDWd0rFQoGTfuIuXFfLQbXkX4oZpmYLdr0kQAKjFtNB/JYV5PTE7PskJKD/AS6iYLd2pOf";
            sout << "cEYJxPZWSWUSz+EmRNmeDl3lfch9LD6VXgaxY1xPF0/1uQfU+BBikdVQJPlMzVB9QK17ir6rynim";
            sout << "CP038a8ctWt5RMBsaJPZr7bieh11aTTW2mC65Y3PYQ8WsXofuw4x3xoXI1S/hGCM2QvmgWq29xHp";
            sout << "5Jkp/Z5YLaGBGxCHM+QQm4LzggVnhYjlguAbfEmWFapwhzmx1L26gv2q2AUiozn2I7dAh1vDRKD/";
            sout << "u5XMODPPJE+NTsr5DQz7aIdEwRLZynp1FO+VN71nYDa5G8ruF4v320ocRKm/mQ5uzU4X7w69CLdS";
            sout << "kmag9jfDGvuolYqCooAts5b7tFIcC3WjlXeLPq5y8HmzY69Z72HrISpq0Fyq4vcZaksLSdpv+Pil";
            sout << "iUu6Vmti4LYLHYsmue1UgMzL0qqdRMz6XmCPBkUXYDS4oOoQuDcH5iJo9aWRoADapKUHqIUnoR3O";
            sout << "Vx4h5b2/XtCEb8dNF0ubJ+oZGbAize7SWTGnUCQdpz2wxAWFymc5/5jFxfVU2BKSPhrKRYImgnVU";
            sout << "8GOms14wCx4wyGuRZY3p9s1uPUBNNjDnJqVg6I+7STXJKrYzeP2gP227k2JE3o9eLehe66hcqaPi";
            sout << "egdpG5RfPN9X87FtePJ6lPjJ8j0Ysgoa6l+DDUDuEZHp6APIG5miY893oac8uo/r2RgRNVv6vLFo";
            sout << "8VIFR7IwcLj1zXvwriv/Szw3POh7y8svSb4eGKr1c1/5JTJB58Fcjz0AMm2+rW0Twwb3STxn4SZ6";
            sout << "nXOyP0btY0VCckovcLoFij3lsl21ZGMdfG9cHVlKL88pg4Ip00QmgcQW3QmBBoCjlPlRVSSsDHGY";
            sout << "8TBBGLuxJi7NPzU1HNtjG3cnYw0t49og2hjrIbF+6fHb9x0pPtnJZwX7SbBYlk4Z8v84fR7cjC+9";
            sout << "l6SLvaRgqkTj/aaiiHtC17zaxNhP9wHqXmPUZdKM6xs3vsAF1dYOLPlIv+nmMLBPfravTZDkf3p1";
            sout << "x56EjPHwT1GULNkLBG8iod/cteD0E0GIZf0g5/o0hfI1t18CMGxfMyeaASZugV3+KL1yOwXD07D0";
            sout << "lp8iLn8FlYgXOgUO7+OweJcIu1IwkzLSM2aNbnH3VDPlu/Ff8ZHL0jiuxhQAVT6jdWJSUEOf2yiB";
            sout << "8mIGCK7CH9Xv9l/grSdh6GrE+NvvWqKQrhX1k8wxHEM4PnhMSO4R+5dRFWeeh6cYfTNHTYWZ2xzU";
            sout << "run1L6tULZzpksLtHYDg0vEEq3hDS/3yf+/cvCX4ibt5pUqorTpAtNvbTaguUyBy2TOAy6fSFGh2";
            sout << "eHil/3JEYZXnfFtcBo+pIvt3LWEPlWCUHNKFLQnpd77Y6wUFn3Ku7o7Nu7zBxemmvxxYUXImAlzt";
            sout << "354O5G/5G1GUGFf1K2u11fFcuXrfowEE+1eUEpC0KLyxZhOJa5nA6dKtnQbq8wrGXxuGuJGlDSAu";
            sout << "0sUYLPmELc+kGUyY6A27B0FKFN50bP1U5iWLAtxt0NmPqOnwzvnj5GYQ9R/ZIpzf73N2OoYL4+ba";
            sout << "6E32ION5IxY2YQ1IqEHxsjzvDW5KoQCb8oz63eKgwLHBz/1yhA0ELpzG9ti5pVE4WbGKOtS/2xTh";
            sout << "RIgpnpbB7bPUdtw33cjky7t6UAO+QYI1kg8rscd/Ug44hd627JK61SxnGlK5wBRj7aoUxH2yb3Dt";
            sout << "jMgmcgZYtdIsHjuU63vrN0acMHULcyCRIFuFEtXgnQNIKjPUG3iuN3714Y9sncW5HqDGAYLyRpaA";
            sout << "69XPtqYEajN2uLF1Q9KIeW701X1diQoHw7TFq0p5x1oTMRzjqcz5lnLIM0DycqCPGoGAnyL0o5A3";
            sout << "Rw9qaSq1bB5VOdqpZHyN38huATstlHmcO2GqN2r9k2BKqqDYxuzmhB1K5ugoJID0lm6KfR87e+2q";
            sout << "CQL1tr6ecqFe4LkO6nRR57w6gl48J0tFYuxsgRcktYvkt/BF1JHNnw/BChE9lDBgBZz8TfAqUv5b";
            sout << "Ofi4WiuGxq5sKIa8a5SRwfVbz1h/MBqBEd9nDlZ1acbg9ZGakzwCfH0WrcArLiN9FqGqmiZClS0d";
            sout << "cUwftQDUI7yEoiIb18/479c1VU2q5dJddCBaabm8CtGtd8w8KTANBXX4pZoSuOlYUUQaxYsZ/avm";
            sout << "RYqfU1uOkHlmqm++EvfKEGW/Rmoq/fCIl4mk7YoLpMcub9wlTSVP2W//uvZG0LYwlZScWGOGmo6Z";
            sout << "xa02FmCXVIyXUfnitTEv2oYj3CV/57nW4+1jkXTcYhH8wt5wX5G2eO7qw3esj1x1kL07xmven4Il";
            sout << "nmKMri2FNxrWUBzvCwmfKGfPh1IkQ9LAfaJJATfGeBFI33RQdSILTaozNl88dHbUO8I+ZnySvavV";
            sout << "uX9Ia4Gvrm0nzV6WYbE4SCDjppsaz0CSZy1exA9t/NFoQFjvf25pszQ9JlDtwDm65ssYqCTLjyoJ";
            sout << "AjMMUygef0nD9WxtWkVCywmyR5HIZWqwV/poAROWBUNL72p0kYxDsm8u8D6LFDQJj+/rSQFr4jzF";
            sout << "RkH7zemYp52d7nSo7ZV84Pf11aTTWqg1OCwAFz+bcg5wZObUL48+WzPAPePNtlo2ef4hn3tyi/pj";
            sout << "v62xZax1oHnnB4ozyZqwSd7aH8LGN4G0Pk37PCagVXLEyLEGQXA3NqxxokimT93xORZOF4hZjhUR";
            sout << "EM6aKChyS4DKkB/HN8IEMrPcKL7zadhDrWX6aeAxBOIbF02jTyCo7rFEO4g3TLuy+aX29SStyzAd";
            sout << "bESo1w0hmnjboB/cUVh9SU0rWvyHnBveXBU1QFsmKEpEVXbD9iao+VArYlDKQgXS0elIQIJHLJ2v";
            sout << "8cVk5GtsXQU9Yd5vyzC9R/ZuUD+fuRcoKYwevCjnVegbn4mCK6VICihqWM5etEr9CqdjjzAtemN3";
            sout << "RhW/4c1v6Gfcb3LQIctJmk08SbUfkImRlULjt3sr+iF/9gMx5AneRDqnq1YRbiusqAfpCl83zBFm";
            sout << "/txWD4btmU3/Q9TzIYjcDm8JFIpptv1+F6myuN1ElJPj5dcmfBZ2/KQknRf7cFBSFCfeKS2glsIm";
            sout << "tTj1p8jK+qKf3GS+v/n6VutWgGXAU7bjZSfaWn3wfNX1rJXOX4Czp1dXxmXuxltVQ09bTpEMQL5o";
            sout << "F9LI3ExjgsokVCsnuAc25hTRWP6bUkWsd3fvbVK/Qrg8sYEpq+3836NJyb2BcFVBqmDJaW+MZ2+P";
            sout << "dJwzMjQMFfRNnsEBRwHuVTDwa4tyR+1yFOqG514ohI4UKamdebXPlrjm278ztqaN/4ASFsVoQb7O";
            sout << "nPvqiMT9REV9ZLiK8z2NK4dDr4KUCr/UihBZqX7qQWnFRyy0VooOFAyP9CjfohLthZ8Y0HWFDMpx";
            sout << "0imNkxXlh3CIDNTRXAmgFupIEQyY08sZX/Oqx4NdzpxWLh2S0VJmIupzuxWTnKBRJXWZEVPKqsak";
            sout << "zBsNzdtcqrF5dIIY/7d+8LFdEBIZ56wftYkRRvJt9S7mPIY++gohDronAX/ohfwXwu4jCm0OLWzO";
            sout << "l4FIAdeN0m65Nng2pWnF6M+qB+b5BT3I5cAh7GF4t3woiWOBF7LnjOYmHe7ZkzPzftxeZ820e+eJ";
            sout << "i1pFSQl3/H+aneIsjEQVGxgynGtvGW3pz/0f5rWrRdUG9ZYPJItWXCjJz2k/Eb3fHDA9JVIT9FEM";
            sout << "XCsN2FQguDWy7cDxNMKxVRuhomjmVCR50/W9/Wsjg6+tnNNhY5Iukh40jU9uN/WShMpzXNv2QKxR";
            sout << "bfUtL0zpojBbZOkAd1LZ++bQREzjPBFQ6G18eQa7DphNarttvCzw9qdgvmwpl3CfvW4PeFChxQ2V";
            sout << "SmfUcuFnESjEN30zsEyFtIJNVd1E+4C6vDxk+FRWl+jGbzNkQ1GK+9z6M0HgUxBXMXcHiJbMEJ3s";
            sout << "Ri6PqeKjZUAJzORigJmgOO5wURFI+3EVQ0NuPWfaQ/6UZ1n7fdXi8ncmO4jVwY1ptN/4tJL+bAm0";
            sout << "eu/c6ug2bfNCTx6TnutxBAg5AvxlDrJIUsx+TsM50J4OZmv7pI4dC0UWU3TpzaYHa/cQ+OY61UT/";
            sout << "j1/QPSquxIlWA46SGt/xrUg9iPIWw+2hdRBkhTBE6PrMMHLl5jxWpJ96YH5WDnifNnnhzRDcLfyf";
            sout << "9nZYWQaBzm3JangobvnsDPgjF91OfeFJhVPyUwS5u+Sxw+NKPj9wVAaW3gZVS2BOODAud/EvFfQF";
            sout << "08t3Ab27GGwWNx9ExN/jlq8EHAM+VRcyfn3hBVjLZdt9fs6zZliYdfyNaA/fgO1iLwY4DOSKgALr";
            sout << "Vs5+KDTmyNf5DkAg/W/d1tA/o76/qXUz3gHdm8Q1TqA3ZuR3g1BE6oS4T9Sg62oYIthP99doW8ll";
            sout << "FPr0aF+JHwXzG0k6Ao4wGdKmqi+n91pVYI7r2zE1kKtk7GyF0fSmcVnnP42TQfaUbaKB1bMT+a1V";
            sout << "NMIydv7QD5F2af3El9np7/1S69sGpoNK7PLow71jdlCewGVrq+iYxZaVhe3xHwerQQ1uGfmRxUSK";
            sout << "exonRQPz0yD5fkjRCqq+Hbys1CXe4iKa2uO0pW+yMlvRnMWpV3Bx6uxYR6pECBJ0x8DQHk4cBwa9";
            sout << "J/vAlf6dDaVh4PIZy6PF783iAPRusNy0TcCxXTJbIg5YqUb5QAyJ2HEPbIaKeZwSnhytAJKP98JL";
            sout << "JC+81f3cN/tJKfWQAJz4RgcrbhUfyf5yWK9rPOwvFf5WKfecfPWc6wpT4IqSrlDe3LQqxpFxJwfG";
            sout << "dzNo23TgOFK+H176FNuW7jXD1sUsh9MA3Yycm3BWZ85cK55DOI3T49K2WB0KnFLkhA9wPJNb20qt";
            sout << "m1M8QtKwF6jzpMnbBff/vM4oNL0K0QzXovI4gJTDUkHWUlZ3XxMk9PQIqoKZDp9v2JTNW6cs1zcV";
            sout << "Jcm2XE2ZhTCFmOQ/DIG1AQIzQfOY6s/VRvHPSkIJH76fo1ex2jj5CmbGw2JFNLPDQIIHEjQJGHFw";
            sout << "KpVGso6XF6CdMtcmlswoRrIvN0odvC0md0D1lf09ZuoyNt68aMSxgeBhoQYW4qC6E86Hef3TmzWO";
            sout << "esZCvDs2I3UVKgPEkICz2TEHy7dcC1VzU2k/F/cm3+y33lloDem4Dh2igflppvhthcYCLOmFiEW4";
            sout << "YtxiVJKpIAKbNHqv9qpxNdcbLCsxkENYKwmmG8E3fLSyE7St/z3dvuTuDI35lxANzv1N04YrvfEr";
            sout << "dIPmvepllDz4Ua9TyYQoZezD6UsivW0gfWdbG9dbYnwAZRKEgQjRD1zvGUt/nGCUKdtBDh/Qu7jD";
            sout << "c8KMBJx0meoY4jLZBSw3Rccd/KOvzC3UTSsBeTBSkQL7wuSMWZf2cTI3BiWaVTaUXREVmUG0eeSy";
            sout << "W+Vym1qM2tPWkUm7V3toeS94LU44OlGDPyoHHUOsT663Zew0ao3+rSqS+KASC4L+6oqP3ffSI2WC";
            sout << "517CtYtPA09gFqdWnN02mJ/+gEWrYUZXJsNh31AGQ4e4N2L1Tupy+L+mgkjTyHeiV6dUsvVQ2J36";
            sout << "R2VL8EOQcchBMinBo0WKkP6xoTPcCwwMI7T5sHHR+KVUs2DJXTNluNFhYyOic2ImOwhoOHKwfr7I";
            sout << "bJERGZYKwwBqGPO0mMnB81MZFumFzoo0SNhvNC9a74X8U6gKtDsQCeIHNXWsWxaO2LmjhlZqXEMC";
            sout << "nrLi4UnXweqUgDscbWdq6fE6Ad/ZimmUJlj5iF6aXWj51B2VIgtYXxBFlVPURZDw9z9KPdyidzM1";
            sout << "PSitwb6KwWZK8fJ4ZUVOUt1bIki9wAnpyDdAhrPtDVtngS8RJrcCVRrjQ91Vhr95kSTG4b6VtN23";
            sout << "m3lhkU/T8RAVAphAait/TICzXeXdnFjALDIubsx1e3FMhV/TJHflVQhnahwTaUuIVqb1ZkmP9aMw";
            sout << "0K1G37NbwIRzyHGVWnvJXxKfLeV3n0OJZ3W5dDmTOZSE1s7JdJ4rdEXpiMVsW07TB6JEtIz0c/AV";
            sout << "IvDmgF9QH5Ly4Ko171Lg/tVMjBIhCiBU4zQco6brJHx+MoxEsNUXgUCNoMqqjd1a3F5wGsvhlWpn";
            sout << "iwNpTje2A/ccVQmoJpDSNByMTB/0GsGJTjZ0dWR0KiltaQaKTlRFlGn/2jgbk+i7ujAGj/Gls6DY";
            sout << "WoR/asND5U/rlyzwJS77EefK16ew8w3Nfy2g/vVvpIUQBG67CnjUzxpnutsI7KvZak2Yehg2NIZQ";
            sout << "IAuyXMd5zixobwku63RvLT6Fd6D63HnQhEtgtPTcLJT6rQOf2cXAXN3RLOghcpM44flJ0PW679AQ";
            sout << "pgVrmELVQr2Dvv2fCb3W5k/JdgvTKrJ2YPIY9Y7q5aSZ28VC1u1k6y/KsppJ+6t+TW8PloS+qKNb";
            sout << "2tawgDRraMsNVUTMhABYEPZ+qoYspJPV4rKfVnELc8otpvkR404ulUsELxml0TndtntTjy/f9lmi";
            sout << "I7pfDqPsOUfwUtdhuW1XyIhX3RFmavc/VFLHu8gVSmJgdgxjraoe1ldt4F8vgQu22uZu5yBLtxpw";
            sout << "WgKVifBtJx/lZ4iAPMNJUZt+Fo+1K3uofYmOg78dsM3BSeghNcNI5ki4NrUJ3yWTzfvrUIr90Ee3";
            sout << "VUaGz0/wtOsFI74ef6BaTCYNAt7psf/dwoow4r4FzHgXNqr9MtWvfp22gGCaRLuUWTHgRzIkCflH";
            sout << "YyNFYHD+yTaKmSrYay2bBYFGRFe6Vx9b8FR7fmdyqq4HzRwQ2/FVeSQ50OHeT3vWTTg07M31JkZY";
            sout << "VlTjnw8Ew9N+o+qI9AFaftksVdXr2YjXMpJMwbHcqK6himQLSkzkUEQXsBI6vQSPobBtPM2oNlCs";
            sout << "oEf4AvHYmHxyyzVdSRjQqEoekWURI6htJxRQh0DaDhqOaRQmUp0AkB5StSD8z6o6Wyf0yvzT8OJo";
            sout << "NEjaoZbz82eivQUGf3RmYLZIx4xjZ32GA2fUN50RfgyF/KzW1GNLLykJ2NK+saJKGZB7RC2ZlsI6";
            sout << "CmkHIZeNwG131Opp+ygasp0GBJUzlKnEzmV9CIBigCv2oPPxewEr7T8/OGDPXWhY2LEgVbgyxLdD";
            sout << "MnZlJC28aanAWGoGMcuXgyacFhOWc7I7TTml8jlQv1oDRJU39PQwZZ93HwhhZ2s87wuRYCQdXSH+";
            sout << "pdtb9YblyosciNtYJguXl+2iBdGGIqNAp6oxYj/rI5l0pPY7EUkGEnOzQq/U3zCDPL1tdUymaOh8";
            sout << "+XGYMMo5L34oxvi79Rh4snSaOO5h0fl0aaZES/v/x5QTtQu4H7qwVfWIsOg8ujFFDFeZmmJpb7pc";
            sout << "ff03fNUsHBfS3yf1JvrXhVGDh7byfy8DTFCy07gXUaKJzQJNOjEqX+iu25I+RNxXbfHsRxsWdNEw";
            sout << "6aHRUUb+zThVJGkglO5W/S32SJznnjkHdFu1WXBU/DbM7b/quJTUgWnZRLy6CugMu4I/hp5ArKCh";
            sout << "vekyQySI/9TjOEPEFW37few/H060cZcz1V3DilvOTBrCoItzdjxZB/cmGxPln3mhkPqGr+NsXRdJ";
            sout << "tPMRc91NxvDP1oBnXXEYD418bmxfvqbXZm4Q+bMq07TT5rWABCZ+NFmkgkXryGhfKQWqidxbRenT";
            sout << "8teao4iAbwSHWB/Za5+OPYUS4b2u7OULXqkmbQDnTeJX6ou0VFYUpkXStbtLITLJrvAG0BrMq7G9";
            sout << "09vbgw6e+krF5JHaFXKAgVf3/SlvRrZi6zgPT7wsY1WLGlMAFNAC58UhizDbVV5Xivj/mVxi29s2";
            sout << "tZHKQRshEnuw1KvEp61O4HEnO2dw27v1000YgRz9HtQp9Ra0SsePIjlh8/h5O2VTqJgMlqgAiy9g";
            sout << "l7nvX3Ft3a/K7S8GlVMwM8z4DiSzNf0irgnC/+sVu3ZAy13UiviJTv0gZ6iVL78GdPSqhKq6x8IU";
            sout << "JGX2sbzthVZUpYPm65WjEBKUKsHWIdeAokKh+sS2TGEAo9COawULVwzYttKSY30UlsBLL/ofpjF/";
            sout << "eCWfzunbpZ3MmkXJYVygXCsGgEuxDmWrhcxIF5/pPZDafmaxqHCml/zxew2twDN9lEJV/jqZrwSL";
            sout << "I2awqrzxIp/4TfqYj4C8HOQGb4N246snRl3iH2tvzQZrCg1I2mp1s0+xiHESKtfecHfMt8hbb2QZ";
            sout << "50c/3MAKQb9WatUDqfZuTnnwXMo5vm0Sh9KqLYQj81LFOzKzf1NDil38GSmFGWPsNm7vm8Q6S6BI";
            sout << "MZafbg2gM+ohtKS/u/36ZADS9/bxf90Fzkn5UEjZUOIRBhYowQNilZzHCABNNXFO/5SUzSJqgLIA";

            // Put the data into the istream sin
            sin.str(sout.str());
            sout.str("");

            // Decode the base64 text into its compressed binary form
            base64_coder.decode(sin,sout);
            sin.clear();
            sin.str(sout.str());
            sout.str("");

            // Decompress the data into its original form
            compressor.decompress(sin,sout);

            // Return the decoded and decompressed data
            return sout.str();
        }

    // ----------------------------------------------------------------------------------------

    };

    face_tester a;

// ----------------------------------------------------------------------------------------

}



