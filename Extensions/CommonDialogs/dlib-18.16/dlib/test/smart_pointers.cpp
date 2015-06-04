// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/smart_pointers.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include "tester.h"

namespace  
{
    bool used_array_delete;
    template <typename T>
    struct test_deleter
    {
        void operator() (T* item) const
        {
            used_array_delete = false;
            delete item;
        }
    };

    template <typename T>
    struct test_deleter<T[]>
    {
        void operator() (T* item) const
        {
            used_array_delete = true;
            delete [] item;
        }
    };


    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.smart_pointers");

    int counter = 0;
    struct base
    {
        int num;
        virtual ~base() {}
    };

    struct derived : public base
    {
        derived() {  ++counter; }
        ~derived() { --counter; }
    };

    int deleter_called = 0;
    void deleter ( derived* p) { ++deleter_called; delete p; }
    void deleter_base ( base* p) { ++deleter_called; delete p; }
    typedef void (*D)(derived*);
    typedef void (*Db)(base*);

    void smart_pointers_test (
    )
    /*!
        ensures
            - runs tests on the smart pointers for compliance with the specs
    !*/
    {        
        counter = 0;
        deleter_called = 0;

        {
            DLIB_TEST_MSG(counter == 0,counter);
            scoped_ptr<base> p1(new derived);
            scoped_ptr<derived> p2(new derived);
            scoped_ptr<derived> p3;
            DLIB_TEST_MSG(counter == 2,counter);
            DLIB_TEST(!p3);

            p1->num = 1;
            p2->num = 2;
            DLIB_TEST(p1->num == 1);
            DLIB_TEST(p2->num == 2);

            (*p1).num = 3;
            (*p2).num = 4;
            DLIB_TEST(p1->num == 3);
            DLIB_TEST(p2->num == 4);

            DLIB_TEST_MSG(counter == 2,counter);

            DLIB_TEST(p1);
            DLIB_TEST(p2);

            DLIB_TEST_MSG(counter == 2,counter);
            p1.reset();
            DLIB_TEST_MSG(counter == 1,counter);
            DLIB_TEST(!p1);
            DLIB_TEST(p2);
            p1.reset(new derived);
            DLIB_TEST_MSG(counter == 2,counter);
            DLIB_TEST(p1);


            DLIB_TEST_MSG(counter == 2,counter);
            p2.reset();
            DLIB_TEST_MSG(counter == 1,counter);
            DLIB_TEST(!p2);
            derived* d = new derived;
            p2.reset(d);
            DLIB_TEST(p2.get() == d);
            DLIB_TEST_MSG(counter == 2,counter);
            DLIB_TEST(p2);
            DLIB_TEST(!p3);
            p2->num = 9;
            swap(p2,p3);
            DLIB_TEST(!p2);
            DLIB_TEST(p3);
            DLIB_TEST(p3->num == 9);
            p2.swap(p3);
            DLIB_TEST(p2);
            DLIB_TEST(!p3);
            DLIB_TEST(p2->num == 9);


            DLIB_TEST_MSG(counter == 2,counter);

        }
        DLIB_TEST_MSG(counter == 0,counter);

        {
            base* realp1 = new derived;
            derived* realp2 = new derived;
            dlib::shared_ptr<base> p1(realp1);
            dlib::shared_ptr<derived> p2(realp2,&deleter);
            dlib::shared_ptr<base> p3;
            dlib::shared_ptr<derived> p4;
            DLIB_TEST(p4.get() == 0);
            DLIB_TEST(p1);
            DLIB_TEST(p2);
            DLIB_TEST(!p3);
            DLIB_TEST(!p4);
            DLIB_TEST(p1.get() == realp1);
            DLIB_TEST(p2.get() == realp2);
            p1->num = 1;
            p2->num = 2;
            DLIB_TEST((*p1).num == 1);
            DLIB_TEST((*p2).num == 2);

            p1.swap(p3);
            DLIB_TEST(!p1);
            DLIB_TEST(p3);
            DLIB_TEST((*p3).num == 1);
            DLIB_TEST(p3->num == 1);
            swap(p1,p3);
            DLIB_TEST(p1);
            DLIB_TEST(!p3);
            DLIB_TEST((*p1).num == 1);
            DLIB_TEST(p1->num == 1);
            DLIB_TEST_MSG(counter == 2,counter);

            DLIB_TEST(p1.unique());
            DLIB_TEST(p2.unique());
            DLIB_TEST(!p3.unique());
            DLIB_TEST(!p4.unique());

            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(p2.use_count() == 1);
            DLIB_TEST(p3.use_count() == 0);
            DLIB_TEST(p4.use_count() == 0);

            dlib::shared_ptr<base> p11(p1);

            DLIB_TEST(!p1.unique());
            DLIB_TEST(p2.unique());
            DLIB_TEST(!p3.unique());
            DLIB_TEST(!p4.unique());

            DLIB_TEST(p1.use_count() == 2);
            DLIB_TEST(p2.use_count() == 1);
            DLIB_TEST(p3.use_count() == 0);
            DLIB_TEST(p4.use_count() == 0);

            dlib::shared_ptr<base> p22(p2);

            DLIB_TEST(!p1.unique());
            DLIB_TEST(!p2.unique());
            DLIB_TEST(!p3.unique());
            DLIB_TEST(!p4.unique());

            DLIB_TEST(p1.use_count() == 2);
            DLIB_TEST(p2.use_count() == 2);
            DLIB_TEST(p3.use_count() == 0);
            DLIB_TEST(p4.use_count() == 0);

            DLIB_TEST(p11.get() == realp1);
            DLIB_TEST(p11 == p1);
            DLIB_TEST(p22 == p2);
            DLIB_TEST(p3 == p4);
            DLIB_TEST(p11 != p22);
            DLIB_TEST(p1 != p2);
            DLIB_TEST(p3 != p1);
            DLIB_TEST(p3 != p11);
            DLIB_TEST(p3 != p2);


            p1 = p1 = p1;
            DLIB_TEST(p1.use_count() == 2);
            DLIB_TEST(p1->num == 1);
            DLIB_TEST(p11.use_count() == 2);
            p1.reset();
            DLIB_TEST(p1.get() == 0);
            DLIB_TEST(p1.use_count() == 0);
            DLIB_TEST(p1.unique() == false);
            DLIB_TEST(p11.use_count() == 1);
            p11 = p2;
            DLIB_TEST(p1.use_count() == 0);
            DLIB_TEST(p1.unique() == false);
            DLIB_TEST(p11.use_count() == 3);
            DLIB_TEST(p11.unique() == false);

            // now p11, p2, and p22 all reference the same thing and the rest are null
            DLIB_TEST_MSG((p11 < p2) == false,"")
                DLIB_TEST_MSG((p2 < p11) == false,"")

                DLIB_TEST(get_deleter<D>(p4) == 0);
            p4 = p2;
            DLIB_TEST(get_deleter<D>(p4) != 0);
            DLIB_TEST(get_deleter<D>(p4) == get_deleter<D>(p2));
            DLIB_TEST(get_deleter<D>(p4) == get_deleter<D>(p11));
            DLIB_TEST(get_deleter<int>(p4) == 0);

            realp1 = new derived;
            p1.reset(realp1, &deleter_base);
            DLIB_TEST(p1.get() == realp1);
            DLIB_TEST(p1.unique());
            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(*get_deleter<Db>(p1) == &deleter_base);
            DLIB_TEST(p1 != p4);
            p4 = dynamic_pointer_cast<derived>(p1);
            DLIB_TEST(!p1.unique());
            DLIB_TEST(p1.use_count() == 2);
            DLIB_TEST(p1 == p4);

            realp1 = new derived;
            p1.reset(realp1);
            DLIB_TEST(p1.get() == realp1);
            DLIB_TEST(p1.unique());
            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(get_deleter<D>(p1) == 0);


            auto_ptr<derived> ap1(new derived);
            auto_ptr<derived> ap2(new derived);
            ap1->num = 35;
            ap2->num = 36;

            DLIB_TEST(ap1.get() != 0);
            DLIB_TEST(ap2.get() != 0);
            p1 = ap2;
            p2 = ap1;

            DLIB_TEST(ap1.get() == 0);
            DLIB_TEST(p1.unique());
            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(ap2.get() == 0);
            DLIB_TEST(p2.unique());
            DLIB_TEST(p2.use_count() == 1);
            DLIB_TEST(p1->num == 36);
            DLIB_TEST(p2->num == 35);

        }

        DLIB_TEST_MSG(counter == 0,counter);
        DLIB_TEST_MSG(deleter_called == 2,counter);

        dlib::weak_ptr<base> wp4;
        {
            dlib::shared_ptr<derived> p1(new derived, &deleter_base);
            dlib::shared_ptr<derived> p2;
            dlib::shared_ptr<base> p3;

            dlib::weak_ptr<derived> wp1;
            dlib::weak_ptr<base> wp2;
            dlib::weak_ptr<base> wp3;

            dlib::weak_ptr<derived> wp1c(p1);
            dlib::weak_ptr<base> wp2c(p1);
            dlib::weak_ptr<base> wp3c(p2);

            DLIB_TEST(wp1c.use_count() == 1);
            DLIB_TEST(wp1c.lock() == p1);
            DLIB_TEST(wp1c.expired() == false);

            DLIB_TEST(wp2c.use_count() == 1);
            DLIB_TEST(wp2c.lock() == p1);
            DLIB_TEST(wp2c.expired() == false);

            DLIB_TEST(wp3c.use_count() == 0);
            DLIB_TEST(wp3c.lock() == dlib::shared_ptr<base>());
            DLIB_TEST(wp3c.expired() == true);

            DLIB_TEST(wp2.use_count() == 0);
            DLIB_TEST(wp2.expired() == true);
            DLIB_TEST(wp2.lock().use_count() == 0);
            DLIB_TEST(wp2.lock().unique() == false);

            wp1 = p1;
            wp2 = wp1;
            wp3 = p1;

            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(p1.unique());
            DLIB_TEST(wp1.use_count() == 1);
            DLIB_TEST(wp2.use_count() == 1);
            DLIB_TEST(wp3.use_count() == 1);
            DLIB_TEST(wp1.expired() == false);
            DLIB_TEST(wp2.expired() == false);
            DLIB_TEST(wp3.expired() == false);
            DLIB_TEST(wp1.lock() == p1);
            DLIB_TEST(wp2.lock() == p1);
            DLIB_TEST(wp3.lock() == p1);

            wp3.reset();

            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(p1.unique());
            DLIB_TEST(wp1.use_count() == 1);
            DLIB_TEST(wp2.use_count() == 1);
            DLIB_TEST(wp3.use_count() == 0);
            DLIB_TEST(wp1.expired() == false);
            DLIB_TEST(wp2.expired() == false);
            DLIB_TEST(wp3.expired() == true);
            DLIB_TEST(wp1.lock() == p1);
            DLIB_TEST(wp2.lock() == p1);
            DLIB_TEST(wp3.lock() == dlib::shared_ptr<base>());


            p1.reset();

            DLIB_TEST(p1.use_count() == 0);
            DLIB_TEST(p1.unique() == false);
            DLIB_TEST(wp1.use_count() == 0);
            DLIB_TEST(wp2.use_count() == 0);
            DLIB_TEST(wp3.use_count() == 0);
            DLIB_TEST(wp1.expired() == true);
            DLIB_TEST(wp2.expired() == true);
            DLIB_TEST(wp3.expired() == true);
            DLIB_TEST(wp1.lock() == dlib::shared_ptr<base>());
            DLIB_TEST(wp2.lock() == dlib::shared_ptr<base>());
            DLIB_TEST(wp3.lock() == dlib::shared_ptr<base>());

            p1.reset(new derived);

            DLIB_TEST(p1.use_count() == 1);
            DLIB_TEST(p1.unique() == true);
            DLIB_TEST(wp1.use_count() == 0);
            DLIB_TEST(wp2.use_count() == 0);
            DLIB_TEST(wp3.use_count() == 0);
            DLIB_TEST(wp1.expired() == true);
            DLIB_TEST(wp2.expired() == true);
            DLIB_TEST(wp3.expired() == true);
            DLIB_TEST(wp1.lock() == dlib::shared_ptr<base>());
            DLIB_TEST(wp2.lock() == dlib::shared_ptr<base>());
            DLIB_TEST(wp3.lock() == dlib::shared_ptr<base>());

            DLIB_TEST(wp4.expired() == true);
            DLIB_TEST(wp4.lock() == dlib::shared_ptr<base>());
            wp4 = p1;
            p3 = p1;
            DLIB_TEST(wp4.expired() == false);
            DLIB_TEST(wp4.lock() == p3);


            bool ok = false;
            try {
                dlib::shared_ptr<base> bad_ptr(wp1);
            } catch (dlib::bad_weak_ptr&)
            {
                ok = true;
            }
            DLIB_TEST(ok);
        }
        DLIB_TEST(wp4.expired() == true);
        DLIB_TEST(wp4.lock() == dlib::shared_ptr<base>());


        DLIB_TEST_MSG(counter == 0,counter);
        DLIB_TEST_MSG(deleter_called == 3,counter);

        {
            scoped_ptr<int[]> a(new int[10]);

            {
                used_array_delete = false;
                scoped_ptr<int[],test_deleter<int[]> > b(new int[10]);

                for (int i = 0; i < 10; ++i)
                {
                    a[i] = i;
                    b[i] = i;
                }
            }
            DLIB_TEST(used_array_delete == true);


            {
                used_array_delete = true;
                scoped_ptr<int,test_deleter<int> > c(new int);
            }
            DLIB_TEST(used_array_delete == false);

            scoped_ptr<const int[]> const_a(new int[10]);

        }

    }



    class smart_pointers_tester : public tester
    {
    public:
        smart_pointers_tester (
        ) :
            tester ("test_smart_pointers",
                    "Runs tests on the smart pointers.")
        {}

        void perform_test (
        )
        {
            smart_pointers_test();
        }
    } a;

}



