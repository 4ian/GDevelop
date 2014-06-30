// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"

#include "tester.h"
#include <dlib/memory_manager_stateless.h>
#include <dlib/array2d.h>

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.matrix2");

    dlib::rand rnd;

    void matrix_test (
    )
    /*!
        ensures
            - runs tests on the matrix stuff compliance with the specs
    !*/
    {        
        typedef memory_manager_stateless<char>::kernel_2_2a MM;
        print_spinner();

        const double ident[] = {
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1 };

        const double uniform3[] = {
            3, 3, 3, 3,
            3, 3, 3, 3,
            3, 3, 3, 3,
            3, 3, 3, 3 
        };

        const double uniform1[] = {
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1 
        };

        const double uniform0[] = {
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0 
        };

        const int array[] = {
            42, 58, 9, 1,
            9, 5, 8, 2,
            98, 28, 4, 77, 
            9, 2, 44, 88 };

        const int array2[] = {
            1, 22, 3,
            4, 52, 6,
            7, 8, 9 };

        const int array2_r[] = {
            52, 6, 4,
            8, 9, 7,
            22, 3, 1
        };

        const double array_f[] = {
            -0.99, 
            0.99};


        matrix<double,2,1,MM> fm(array_f);

        DLIB_TEST(fm.size() == 2);
        matrix<double> dfm(fm);
        DLIB_TEST(round(fm)(0) == -1);
        DLIB_TEST(round(fm)(1) == 1);
        DLIB_TEST(round(dfm)(0) == -1);
        DLIB_TEST(round(dfm)(1) == 1);
        DLIB_TEST(round(dfm).size() == dfm.size());


        const int array3[] = { 1, 2, 3, 4 };

        matrix<double,3,3,MM> m3(array2);
        matrix<double> dm3;
        DLIB_TEST(dm3.size() == 0);
        DLIB_TEST(dm3.nr() == 0);
        DLIB_TEST(dm3.nc() == 0);
        dm3.set_size(3,4);
        DLIB_TEST(dm3.nr() == 3);
        DLIB_TEST(dm3.nc() == 4);
        DLIB_TEST(dm3.size() == 3*4);
        dm3.set_size(3,3);
        DLIB_TEST(dm3.nr() == 3);
        DLIB_TEST(dm3.nc() == 3);
        dm3 = m3;
        dm3(0,0)++;
        DLIB_TEST( dm3 != m3);
        dm3 = m3;
        DLIB_TEST( dm3 == m3);
        DLIB_TEST( abs(sum(squared(normalize(dm3))) - 1.0) < 1e-10);

        matrix<double,3,4> mrc;
        mrc.set_size(3,4);

        set_all_elements(mrc,1);

        DLIB_TEST(diag(mrc) == uniform_matrix<double>(3,1,1));
        DLIB_TEST(diag(matrix<double>(mrc)) == uniform_matrix<double>(3,1,1));

        matrix<double,2,3> mrc2;
        set_all_elements(mrc2,1);
        DLIB_TEST((removerc<1,1>(mrc) == mrc2));
        DLIB_TEST((removerc(mrc,1,1) == mrc2));

        matrix<int,3,3> m4, m5, m6;
        set_all_elements(m4, 4);
        set_all_elements(m5, 4);
        set_all_elements(m6, 1);

        DLIB_TEST(squared(m4) == pointwise_multiply(m4,m4));
        DLIB_TEST(cubed(m4) == pointwise_multiply(m4,m4,m4));
        DLIB_TEST(pow(matrix_cast<double>(m4),2) == squared(matrix_cast<double>(m4)));
        DLIB_TEST(pow(matrix_cast<double>(m4),3) == cubed(matrix_cast<double>(m4)));

        matrix<int> dm4;
        matrix<int,0,0,memory_manager_stateless<char>::kernel_2_2a> dm5;
        dm4 = dm4;
        dm4 = dm5;
        DLIB_TEST(dm4.nr() == 0);
        dm4 = m4;
        dm5 = m5;
        DLIB_TEST(dm4 == dm5);


        DLIB_TEST(m4 == m5);
        DLIB_TEST(m6 != m5);
        m4.swap(m6);
        DLIB_TEST(m6 == m5);
        DLIB_TEST(m4 != m5);

        DLIB_TEST(m3.nr() == 3);
        DLIB_TEST(m3.nc() == 3);

        matrix<double,4,1> v(array3), v2;
        DLIB_TEST(v.nr() == 4);
        DLIB_TEST(v.nc() == 1);

        std::vector<double> stdv(4);
        std_vector_c<double> stdv_c(4);
        dlib::array<double> arr;
        arr.resize(4);
        for (long i = 0; i < 4; ++i)
            stdv[i] = stdv_c[i] = arr[i] = i+1;

        DLIB_TEST(vector_to_matrix(stdv)(0) == 1);
        DLIB_TEST(vector_to_matrix(stdv)(1) == 2);
        DLIB_TEST(vector_to_matrix(stdv)(2) == 3);
        DLIB_TEST(vector_to_matrix(stdv)(3) == 4);
        DLIB_TEST(vector_to_matrix(stdv).nr() == 4);
        DLIB_TEST(vector_to_matrix(stdv).nc() == 1);
        DLIB_TEST(vector_to_matrix(stdv).size() == 4);
        DLIB_TEST(equal(trans(vector_to_matrix(stdv))*vector_to_matrix(stdv), trans(v)*v));
        DLIB_TEST(equal(trans(vector_to_matrix(stdv))*vector_to_matrix(stdv), tmp(trans(v)*v)));

        DLIB_TEST(vector_to_matrix(stdv_c)(0) == 1);
        DLIB_TEST(vector_to_matrix(stdv_c)(1) == 2);
        DLIB_TEST(vector_to_matrix(stdv_c)(2) == 3);
        DLIB_TEST(vector_to_matrix(stdv_c)(3) == 4);
        DLIB_TEST(vector_to_matrix(stdv_c).nr() == 4);
        DLIB_TEST(vector_to_matrix(stdv_c).nc() == 1);
        DLIB_TEST(vector_to_matrix(stdv_c).size() == 4);
        DLIB_TEST(equal(trans(vector_to_matrix(stdv_c))*vector_to_matrix(stdv_c), trans(v)*v));

        DLIB_TEST(vector_to_matrix(arr)(0) == 1);
        DLIB_TEST(vector_to_matrix(arr)(1) == 2);
        DLIB_TEST(vector_to_matrix(arr)(2) == 3);
        DLIB_TEST(vector_to_matrix(arr)(3) == 4);
        DLIB_TEST(vector_to_matrix(arr).nr() == 4);
        DLIB_TEST(vector_to_matrix(arr).nc() == 1);
        DLIB_TEST(vector_to_matrix(arr).size() == 4);
        DLIB_TEST(equal(trans(vector_to_matrix(arr))*vector_to_matrix(arr), trans(v)*v));

        DLIB_TEST(v(0) == 1);
        DLIB_TEST(v(1) == 2);
        DLIB_TEST(v(2) == 3);
        DLIB_TEST(v(3) == 4);
        matrix<double> dv = v;
        DLIB_TEST((trans(v)*v).size() == 1);
        DLIB_TEST((trans(v)*v).nr() == 1);
        DLIB_TEST((trans(v)*dv).nr() == 1);
        DLIB_TEST((trans(dv)*dv).nr() == 1);
        DLIB_TEST((trans(dv)*v).nr() == 1);
        DLIB_TEST((trans(v)*v).nc() == 1);
        DLIB_TEST((trans(v)*dv).nc() == 1);
        DLIB_TEST((trans(dv)*dv).nc() == 1);
        DLIB_TEST((trans(dv)*v).nc() == 1);
        DLIB_TEST((trans(v)*v)(0) == 1*1 + 2*2 + 3*3 + 4*4);
        DLIB_TEST((trans(dv)*v)(0) == 1*1 + 2*2 + 3*3 + 4*4);
        DLIB_TEST((trans(dv)*dv)(0) == 1*1 + 2*2 + 3*3 + 4*4);
        DLIB_TEST((trans(v)*dv)(0) == 1*1 + 2*2 + 3*3 + 4*4);

        dv = trans(dv)*v;
        DLIB_TEST(dv.nr() == 1);
        DLIB_TEST(dv.nc() == 1);

        dm3 = m3;
        DLIB_TEST(floor(det(m3)+0.01) == -444);
        DLIB_TEST(floor(det(dm3)+0.01) == -444);
        DLIB_TEST(min(m3) == 1);
        DLIB_TEST(min(dm3) == 1);
        DLIB_TEST(max(m3) == 52);
        DLIB_TEST(max(dm3) == 52);
        DLIB_TEST(sum(m3) == 112);
        DLIB_TEST(sum(dm3) == 112);
        DLIB_TEST(prod(m3) == 41513472);
        DLIB_TEST(prod(dm3) == 41513472);
        DLIB_TEST(prod(diag(m3)) == 1*52*9);
        DLIB_TEST(prod(diag(dm3)) == 1*52*9);
        DLIB_TEST(sum(diag(m3)) == 1+52+9);
        DLIB_TEST(sum(diag(dm3)) == 1+52+9);
        DLIB_TEST(equal(round(10000*m3*inv(m3))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*dm3*inv(m3))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*dm3*inv(dm3))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*m3*inv(dm3))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*tmp(m3*inv(m3)))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*tmp(dm3*inv(m3)))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*tmp(dm3*inv(dm3)))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(equal(round(10000*tmp(m3*inv(dm3)))/10000 , identity_matrix<double,3>()));
        DLIB_TEST(-1*m3 == -m3);
        DLIB_TEST(-1*dm3 == -m3);
        DLIB_TEST(-1*m3 == -dm3);
        DLIB_TEST(-1*dm3 == -dm3);

        DLIB_TEST(m3 == dm3);
        m3(1,1) = 99;
        DLIB_TEST(m3 != dm3);
        m3 = dm3;
        DLIB_TEST(m3 == dm3);

        matrix<double,4,4,MM> mident(ident);
        matrix<double,4,4> muniform0(uniform0);
        matrix<double,4,4> muniform1(uniform1);
        matrix<double,4,4> muniform3(uniform3);
        matrix<double,4,4> m1(array), m2;
        DLIB_TEST(m1.nr() == 4);
        DLIB_TEST(m1.nc() == 4);

        DLIB_TEST(muniform1 + muniform1 + muniform1 == muniform3);
        DLIB_TEST(muniform1*2 + muniform1 + muniform1 - muniform1 == muniform3);
        DLIB_TEST(2*muniform1 + muniform1 + muniform1 - muniform1 == muniform3);
        DLIB_TEST(muniform1 + muniform1 + muniform1 - muniform3 == muniform0);
        DLIB_TEST(equal(muniform3/3 , muniform1));
        DLIB_TEST(v != m1);
        DLIB_TEST(v == v);
        DLIB_TEST(m1 == m1);

        muniform0.swap(muniform1);
        DLIB_TEST((muniform1 == matrix_cast<double>(uniform_matrix<long,4,4,0>())));
        DLIB_TEST((muniform0 == matrix_cast<double>(uniform_matrix<long,4,4,1>())));
        DLIB_TEST((muniform1 == matrix_cast<double>(uniform_matrix<long>(4,4,0))));
        DLIB_TEST((muniform0 == matrix_cast<double>(uniform_matrix<long>(4,4,1))));
        swap(muniform0,muniform1);

        DLIB_TEST((mident == identity_matrix<double,4>()));
        DLIB_TEST((muniform0 == matrix_cast<double>(uniform_matrix<long,4,4,0>())));
        DLIB_TEST((muniform1 == matrix_cast<double>(uniform_matrix<long,4,4,1>())));
        DLIB_TEST((muniform3 == matrix_cast<double>(uniform_matrix<long,4,4,3>())));
        DLIB_TEST((muniform1*8 == matrix_cast<double>(uniform_matrix<long,4,4,8>())));

        set_all_elements(m2,7);
        DLIB_TEST(m2 == muniform1*7);
        m2 = array;
        DLIB_TEST(m2 == m1);

        const double m1inv[] = {
            -0.00946427624, 0.0593272941,  0.00970564379,  -0.00973323731, 
            0.0249312057,   -0.0590122427, -0.00583102756, 0.00616002729, 
            -0.00575431149, 0.110081189,   -0.00806792253, 0.00462297692, 
            0.00327847478,  -0.0597669712, 0.00317386196,  0.00990759201 
        };

        m2 = m1inv;
        DLIB_TEST((round(m2*m1) == identity_matrix<double,4>()));
        DLIB_TEST((round(tmp(m2*m1)) == identity_matrix<double,4>()));

        DLIB_TEST_MSG(round(m2*10000) == round(inv(m1)*10000),
                     round(m2*10000) - round(inv(m1)*10000)
                     << "\n\n" << round(m2*10000)
                     << "\n\n" << round(inv(m1)*10000)
                     << "\n\n" << m2 
                     << "\n\n" << inv(m1) 
                     );
        DLIB_TEST(m1 == abs(-1*m1));
        DLIB_TEST(abs(m2) == abs(-1*m2));

        DLIB_TEST_MSG(floor(det(m1)+0.01) == 3297875,"\nm1: \n" << m1 << "\ndet(m1): " << det(m1));


        ostringstream sout;
        m1 = m2;
        serialize(m1,sout);
        set_all_elements(m1,0);
        istringstream sin(sout.str());
        deserialize(m1,sin);
        DLIB_TEST_MSG(round(100000*m1) == round(100000*m2),"m1: \n" << m1 << endl << "m2: \n" << m2);


        set_all_elements(v,2);
        v2 =  pointwise_multiply(v, v*2);
        set_all_elements(v,8);
        DLIB_TEST(v == v2);
        DLIB_TEST(v == tmp(v2));
        DLIB_TEST((v == rotate<2,0>(v))); 

        m4 = array2;
        m5 = array2_r;
        DLIB_TEST((m5 == rotate<1,1>(m4)));

        m5 = array2;
        DLIB_TEST((m5*2 == pointwise_multiply(m5,uniform_matrix<int,3,3,2>())));
        DLIB_TEST((tmp(m5*2) == tmp(pointwise_multiply(m5,uniform_matrix<int,3,3,2>()))));

        v = tmp(v);




        matrix<double> dm10(10,5);
        DLIB_TEST(dm10.nr() == 10);
        DLIB_TEST(dm10.nc() == 5);
        set_all_elements(dm10,4);
        DLIB_TEST(dm10.nr() == 10);
        DLIB_TEST(dm10.nc() == 5);
        matrix<double,10,5> m10;
        DLIB_TEST(m10.nr() == 10);
        DLIB_TEST(m10.nc() == 5);
        set_all_elements(m10,4);
        DLIB_TEST(dm10 == m10);
        DLIB_TEST((clamp<0,3>(dm10) == clamp<0,3>(m10)));
        DLIB_TEST((clamp<0,3>(dm10)(0,2) == 3));

        set_all_elements(dm10,1);
        set_all_elements(m10,4);
        DLIB_TEST(4*dm10 == m10);
        DLIB_TEST(5*dm10 - dm10 == m10);
        DLIB_TEST((16*dm10)/4 == m10);
        DLIB_TEST(dm10+dm10+2*dm10 == m10);
        DLIB_TEST(dm10+tmp(dm10+2*dm10) == m10);
        set_all_elements(dm10,4);
        DLIB_TEST(dm10 == m10);
        DLIB_TEST_MSG(sum(abs(sigmoid(dm10) -sigmoid(m10))) < 1e-10,sum(abs(sigmoid(dm10) -sigmoid(m10))) );


        matrix<double, 7, 7,MM,column_major_layout> m7;
        matrix<double> dm7(7,7);
        dm7 = randm(7,7, rnd);
        m7 = dm7;

        DLIB_TEST_MSG(max(abs(dm7*inv(dm7) - identity_matrix<double>(7))) < 1e-12, max(abs(dm7*inv(dm7) - identity_matrix<double>(7))));
        DLIB_TEST(equal(inv(dm7),  inv(m7)));
        DLIB_TEST(abs(det(dm7) - det(m7)) < 1e-14);
        DLIB_TEST(abs(min(dm7) - min(m7)) < 1e-14);
        DLIB_TEST(abs(max(dm7) - max(m7)) < 1e-14);
        DLIB_TEST_MSG(abs(sum(dm7) - sum(m7)) < 1e-14,sum(dm7) - sum(m7));
        DLIB_TEST(abs(prod(dm7) -prod(m7)) < 1e-14);
        DLIB_TEST(equal(diag(dm7) , diag(m7)));
        DLIB_TEST(equal(trans(dm7) , trans(m7)));
        DLIB_TEST(equal(abs(dm7) , abs(m7)));
        DLIB_TEST(equal(round(dm7) , round(m7)));
        DLIB_TEST(matrix_cast<int>(dm7) == matrix_cast<int>(m7));
        DLIB_TEST((rotate<2,3>(dm7) == rotate<2,3>(m7)));
        DLIB_TEST((sum(pointwise_multiply(dm7,dm7) - pointwise_multiply(m7,m7))) < 1e-10);
        DLIB_TEST((sum(pointwise_multiply(dm7,dm7,dm7) - pointwise_multiply(m7,m7,m7))) < 1e-10);
        DLIB_TEST_MSG((sum(pointwise_multiply(dm7,dm7,dm7,dm7) - pointwise_multiply(m7,m7,m7,m7))) < 1e-10,
                     (sum(pointwise_multiply(dm7,dm7,dm7,dm7) - pointwise_multiply(m7,m7,m7,m7)))
        );


        matrix<double> temp(5,5);
        matrix<double> dsm(5,5);
        matrix<double,5,5,MM> sm;

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,1);

        dsm += dsm;
        sm += sm;
        DLIB_TEST(dsm == 2*temp);
        DLIB_TEST(sm == 2*temp);
        temp = dsm*sm + dsm;
        dsm += dsm*sm;
        DLIB_TEST_MSG(temp == dsm,temp - dsm);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,1);

        dsm += dsm;
        sm += sm;
        DLIB_TEST(dsm == 2*temp);
        DLIB_TEST(sm == 2*temp);
        temp = dsm*sm + dsm;
        sm += dsm*sm;
        DLIB_TEST_MSG(temp == sm,temp - sm);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,1);

        dsm += dsm;
        sm += sm;
        DLIB_TEST(dsm == 2*temp);
        DLIB_TEST(sm == 2*temp);
        temp = sm - dsm*sm ;
        sm -= dsm*sm;
        DLIB_TEST_MSG(temp == sm,temp - sm);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,1);

        dsm += dsm;
        sm += sm;
        DLIB_TEST(dsm == 2*temp);
        DLIB_TEST(sm == 2*temp);
        temp = dsm - dsm*sm ;
        dsm -= dsm*sm;
        DLIB_TEST_MSG(temp == dsm,temp - dsm);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,2);

        dsm *= 2;
        sm *= 2;
        DLIB_TEST(dsm == temp);
        DLIB_TEST(sm == temp);
        dsm /= 2;
        sm /= 2;
        DLIB_TEST(dsm == temp/2);
        DLIB_TEST(sm == temp/2);

        dsm += dsm;
        sm += sm;
        DLIB_TEST(dsm == temp);
        DLIB_TEST(sm == temp);
        dsm += sm;
        sm += dsm;
        DLIB_TEST(dsm == 2*temp);
        DLIB_TEST(sm == temp*3);
        dsm -= sm;
        sm -= dsm;
        DLIB_TEST(dsm == -temp);
        DLIB_TEST(sm == 4*temp);
        sm -= sm;
        dsm -= dsm;
        DLIB_TEST(dsm == 0*temp);
        DLIB_TEST(sm == 0*temp);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,3);
        dsm += sm+sm;
        DLIB_TEST(dsm == temp);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,-1);
        dsm -= sm+sm;
        DLIB_TEST(dsm == temp);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,-1);
        sm -= dsm+dsm;
        DLIB_TEST(sm == temp);

        set_all_elements(dsm,1);
        set_all_elements(sm,1);
        set_all_elements(temp,3);
        sm += dsm+dsm;
        DLIB_TEST(sm == temp);



        // test the implicit conversion to bool stuff
        {
            matrix<float> bt1(3,1);
            matrix<float,3,1> bt2;
            set_all_elements(bt1,2);
            set_all_elements(bt2,3);

			float val = trans(bt1)*bt2;
            DLIB_TEST((float)(trans(bt1)*bt2) == 18);
            DLIB_TEST((float)(trans(bt1)*bt2) != 19);
			DLIB_TEST(val == 18);
        }
        {
            matrix<float,3,1> bt1;
            matrix<float> bt2(3,1);
            set_all_elements(bt1,2);
            set_all_elements(bt2,3);

			float val = trans(bt1)*bt2;
            DLIB_TEST((float)(trans(bt1)*bt2) == 18);
            DLIB_TEST((float)(trans(bt1)*bt2) != 19);
			DLIB_TEST(val == 18);
        }
        {
            matrix<float> bt1(3,1);
            matrix<float> bt2(3,1);
            set_all_elements(bt1,2);
            set_all_elements(bt2,3);

			float val = trans(bt1)*bt2;
            DLIB_TEST((float)(trans(bt1)*bt2) == 18);
            DLIB_TEST((float)(trans(bt1)*bt2) != 19);
			DLIB_TEST(val == 18);
        }
        {
            matrix<float,3,1> bt1;
            matrix<float,3,1> bt2;
            set_all_elements(bt1,2);
            set_all_elements(bt2,3);

			float val = trans(bt1)*bt2;
            DLIB_TEST((float)(trans(bt1)*bt2) == 18);
            DLIB_TEST((float)(trans(bt1)*bt2) != 19);
			DLIB_TEST(val == 18);
        }




        {
            srand(423452);
            const long M = 50;
            const long N = 40;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double> u, u2;  
            matrix<double> q, q2;
            matrix<double> v, v2;

            matrix<double> a2;  
            a2 = tmp(a/2);


            svd2(true,true,a2+a2,u,q,v);

            double err = max(abs(a - subm(u,get_rect(a2+a2))*diagm(q)*trans(v)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            using dlib::equal;
            DLIB_TEST((equal(trans(u)*u , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v)*v , identity_matrix<double,N>(), 1e-10)));

            svd2(false,true,a2+a2,u,q,v2);
            svd2(true,false,a2+a2,u2,q,v);
            svd2(false,false,a2+a2,u,q2,v);

            err = max(abs(a - subm(u2,get_rect(a2+a2))*diagm(q2)*trans(v2)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            DLIB_TEST((equal(trans(u2)*u2 , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v2)*v2 , identity_matrix<double,N>(), 1e-10)));

        }


        {
            srand(423452);
            const long M = 3;
            const long N = 3;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,M,M> u, u2;  
            matrix<double> q, q2;
            matrix<double,N,N> v, v2;

            matrix<double,M,N,MM> a2;  
            a2 = tmp(a/2);


            svd2(true,true,a2+a2,u,q,v);

            double err = max(abs(a - subm(u,get_rect(a2+a2))*diagm(q)*trans(v)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            using dlib::equal;
            DLIB_TEST((equal(trans(u)*u , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v)*v , identity_matrix<double,N>(), 1e-10)));

            svd2(false,true,a2+a2,u,q,v2);
            svd2(true,false,a2+a2,u2,q,v);
            svd2(false,false,a2+a2,u,q2,v);

            err = max(abs(a - subm(u2,get_rect(a2+a2))*diagm(q2)*trans(v2)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            DLIB_TEST((equal(trans(u2)*u2 , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v2)*v2 , identity_matrix<double,N>(), 1e-10)));

        }

        {
            srand(423452);
            const long M = 3;
            const long N = 3;

            typedef matrix<double,0,0> mat;

            matrix<double,0,0,default_memory_manager, column_major_layout> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,M,M,default_memory_manager, column_major_layout> u, u2;  
            matrix<double,0,0,default_memory_manager, column_major_layout> q, q2;
            matrix<double,N,N,default_memory_manager, column_major_layout> v, v2;

            matrix<double,M,N,MM, column_major_layout> a2;  
            a2 = tmp(a/2);


            svd2(true,true,a2+a2,u,q,v);

            double err = max(abs(a - subm(u,get_rect(a2+a2))*diagm(q)*trans(v)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            using dlib::equal;
            DLIB_TEST((equal(trans(u)*u , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v)*v , identity_matrix<double,N>(), 1e-10)));

            svd2(false,true,a2+a2,u,q,v2);
            svd2(true,false,a2+a2,u2,q,v);
            svd2(false,false,a2+a2,u,q2,v);

            err = max(abs(a - subm(u2,get_rect(a2+a2))*diagm(q2)*trans(v2)));
            DLIB_TEST_MSG( err < 1e-11,"err: " << err);
            DLIB_TEST((equal(trans(u2)*u2 , identity_matrix<double,M>(), 1e-10)));
            DLIB_TEST((equal(trans(v2)*v2 , identity_matrix<double,N>(), 1e-10)));

        }



        {
            srand(423452);
            const long M = 10;
            const long N = 7;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,M,M> u;  
            matrix<double> q;
            matrix<double,N,N> v;

            matrix<double,M,N,MM> a2;  
            a2 = tmp(a/2);


            svd2(true,true,a2+a2,u,q,v);

            double err = sum(round(1e10*(a - subm(u,get_rect(a2+a2))*diagm(q)*trans(v))));
            DLIB_TEST_MSG(  err == 0,"err: " << err);
            DLIB_TEST((round(1e10*trans(u)*u)  == 1e10*identity_matrix<double,M>()));
            DLIB_TEST((round(1e10*trans(v)*v)  == 1e10*identity_matrix<double,N>()));
        }


        {
            srand(423452);
            const long M = 10;
            const long N = 7;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,M> u(M,N);  
            matrix<double> w;
            matrix<double,N,N> v(N,N);

            matrix<double,M,N,MM> a2;  
            a2 = tmp(a/2);


            svd(a2+a2,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
            DLIB_TEST((round(1e10*trans(u)*u)  == 1e10*identity_matrix<double,N>()));
            DLIB_TEST((round(1e10*trans(v)*v)  == 1e10*identity_matrix<double,N>()));
        }

        {
            srand(423452);
            const long M = 1;
            const long N = 1;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,M,N> u;  
            matrix<double> w;
            matrix<double,N,N> v;

            matrix<double,M,N> a2;  
            a2 = 0;
            a2 = tmp(a/2);


            svd(a2+a2,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
            DLIB_TEST((round(1e10*trans(u)*u)  == 1e10*identity_matrix<double,N>()));
            DLIB_TEST((round(1e10*trans(v)*v)  == 1e10*identity_matrix<double,N>()));
        }


        {
            srand(53434);
            const long M = 5;
            const long N = 5;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double,0,N> u(M,N);  
            matrix<double,N,N> w;
            matrix<double> v;

            svd(a,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
            DLIB_TEST((round(1e10*trans(u)*u)  == 1e10*identity_matrix<double,N>()));
            DLIB_TEST((round(1e10*trans(v)*v)  == 1e10*identity_matrix<double,N>()));
        }


        {
            srand(11234);
            const long M = 9;
            const long N = 4;

            matrix<double,0,0,MM> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double> u;  
            matrix<double,0,0,MM> w;
            matrix<double> v;

            svd(a,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
            DLIB_TEST((round(1e10*trans(u)*u)  == 1e10*identity_matrix<double,N>()));
            DLIB_TEST((round(1e10*trans(v)*v)  == 1e10*identity_matrix<double,N>()));
        }



        {
            srand(53934);
            const long M = 2;
            const long N = 4;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double> u;  
            matrix<double> w;
            matrix<double> v;

            svd(a,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
        }


        {
            srand(53234);
            const long M = 9;
            const long N = 40;

            matrix<double> a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            matrix<double> u;  
            matrix<double> w;
            matrix<double> v;

            svd(a,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
        }

        {
            srand(53234);
            const long M = 9;
            const long N = 40;

            typedef matrix<double,0,0,default_memory_manager, column_major_layout> mat;
            mat a(M,N);  
            for (long r = 0; r < a.nr(); ++r)
            {
                for (long c = 0; c < a.nc(); ++c)
                {
                    a(r,c) = 10*((double)::rand())/RAND_MAX;
                }
            }

            mat u;  
            mat w;
            mat v;

            svd(a,u,w,v);

            DLIB_TEST(  sum(round(1e10*(a - u*w*trans(v)))) == 0);
        }


        {
            matrix<double> a(3,3);
            matrix<double,3,3> b;
            set_all_elements(a,0);

            a(0,0) = 1;
            a(1,1) = 2;
            a(2,2) = 3;
            b = a;

            DLIB_TEST(diag(a)(0) == 1);
            DLIB_TEST(diag(a)(1) == 2);
            DLIB_TEST(diag(a)(2) == 3);
            DLIB_TEST(diag(a).nr() == 3);
            DLIB_TEST(diag(a).nc() == 1);

            DLIB_TEST(diag(b)(0) == 1);
            DLIB_TEST(diag(b)(1) == 2);
            DLIB_TEST(diag(b)(2) == 3);
            DLIB_TEST(diag(b).nr() == 3);
            DLIB_TEST(diag(b).nc() == 1);

            DLIB_TEST(pointwise_multiply(a,b)(0,0) == 1);
            DLIB_TEST(pointwise_multiply(a,b)(1,1) == 4);
            DLIB_TEST(pointwise_multiply(a,b)(2,2) == 9);
            DLIB_TEST(pointwise_multiply(a,b)(1,0) == 0);
            DLIB_TEST(pointwise_multiply(a,b,a)(1,0) == 0);
            DLIB_TEST(pointwise_multiply(a,b,a,b)(1,0) == 0);


            DLIB_TEST(complex_matrix(a,b)(0,0) == std::complex<double>(1,1));
            DLIB_TEST(complex_matrix(a,b)(2,2) == std::complex<double>(3,3));
            DLIB_TEST(complex_matrix(a,b)(2,1) == std::complex<double>(0,0));
        }

        {
            matrix<complex<double> > m(2,2), m2(2,2);
            complex<double> val1(1,2), val2(1.0/complex<double>(1,2));
            m = val1;
            m2 = val2;

            DLIB_TEST(equal(reciprocal(m) , m2));
        }
        {
            matrix<complex<float> > m(2,2), m2(2,2);
            complex<float> val1(1,2), val2(1.0f/complex<float>(1,2));
            m = val1;
            m2 = val2;

            DLIB_TEST(equal(reciprocal(m) , m2));
        }

        {
            matrix<float,3,1> m1, m2;
            set_all_elements(m1,2.0);
            set_all_elements(m2,1.0/2.0);
            DLIB_TEST(reciprocal(m1) == m2);
            DLIB_TEST((reciprocal(uniform_matrix<float,3,1>(2.0)) == m2));
            DLIB_TEST((round_zeros(uniform_matrix<float,3,1>(1e-8f)) == uniform_matrix<float,3,1>(0)) );
            set_all_elements(m1,2.0);
            m2 = m1;
            m1(1,0) = static_cast<float>(1e-8);
            m2(1,0) = 0;
            DLIB_TEST(round_zeros(m1) == m2);
            m1 = round_zeros(m1);
            DLIB_TEST(m1 == m2);
        }

        {
            matrix<matrix<double,2,2> > m;
            m.set_size(3,3);
            set_all_elements(m,uniform_matrix<double,2,2>(1));
            DLIB_TEST((sum(m) == uniform_matrix<double,2,2>(9)));
            DLIB_TEST((round_zeros(sqrt(sum(m)) - uniform_matrix<double,2,2>(3)) == uniform_matrix<double,2,2>(0)));
        }

        {
            matrix<int,2,2> m1;
            matrix<int> m2;
            m2.set_size(2,2);

            set_all_elements(m1,2);
            m2 = uniform_matrix<int,2,2>(2);

            m1 = m1 + m2;
            DLIB_TEST((m1 == uniform_matrix<int,2,2>(4)));

            set_all_elements(m1,2);
            set_all_elements(m2,2);
            m1 = m1*m1;
            DLIB_TEST((m1 == uniform_matrix<int,2,2>(8)));

            m1(1,0) = 1;
            set_all_elements(m2,8);
            m2(0,1) = 1;
            m1 = trans(m1);
            DLIB_TEST(m1 == m2);
        }

        {
            matrix<double,2,3> m;
            matrix<double> m2(2,3);

            set_all_elements(m,1);
            DLIB_TEST(mean(m) == 1);
            set_all_elements(m,2);
            DLIB_TEST(mean(m) == 2);
            m(0,0) = 1;
            m(0,1) = 1;
            m(0,2) = 1;
            DLIB_TEST(abs(mean(m) - 1.5) < 1e-10);
            DLIB_TEST(abs(variance(m) - 0.3) < 1e-10);

            set_all_elements(m2,1);
            DLIB_TEST(mean(m2) == 1);
            set_all_elements(m2,2);
            DLIB_TEST(mean(m2) == 2);
            m2(0,0) = 1;
            m2(0,1) = 1;
            m2(0,2) = 1;
            DLIB_TEST(abs(mean(m2) - 1.5) < 1e-10);
            DLIB_TEST(abs(variance(m2) - 0.3) < 1e-10);

            set_all_elements(m,0);
            DLIB_TEST(abs(variance(m)) < 1e-10);
            set_all_elements(m,1);
            DLIB_TEST(abs(variance(m)) < 1e-10);
            set_all_elements(m,23.4);
            DLIB_TEST(abs(variance(m)) < 1e-10);
        }

        {
            matrix<matrix<double,3,1,MM>,2,2,MM> m;
            set_all_elements(m,uniform_matrix<double,3,1>(1));
            DLIB_TEST((round_zeros(variance(m)) == uniform_matrix<double,3,1>(0)));
            DLIB_TEST((round_zeros(mean(m)) == uniform_matrix<double,3,1>(1)));
            m(0,0) = uniform_matrix<double,3,1>(9);
            DLIB_TEST((round_zeros(variance(m)) == uniform_matrix<double,3,1>(16)));
            DLIB_TEST((round_zeros(mean(m)) == uniform_matrix<double,3,1>(3)));

            matrix<matrix<double> > m2(2,2);
            set_all_elements(m2,uniform_matrix<double,3,1>(1));
            DLIB_TEST((round_zeros(variance(m2)) == uniform_matrix<double,3,1>(0)));
            DLIB_TEST((round_zeros(mean(m2)) == uniform_matrix<double,3,1>(1)));
            m2(0,0) = uniform_matrix<double,3,1>(9);
            DLIB_TEST((round_zeros(variance(m2)) == uniform_matrix<double,3,1>(16)));
            DLIB_TEST((round_zeros(mean(m2)) == uniform_matrix<double,3,1>(3)));
        }


        {
            matrix<double> m(4,4), m2;
            m = 1,2,3,4,
                1,2,3,4,
                4,6,8,10,
                4,6,8,10;
            m2 = m;

            DLIB_TEST(colm(m,range(0,3)) == m);
            DLIB_TEST(rowm(m,range(0,3)) == m);
            DLIB_TEST(colm(m,range(0,0)) == colm(m,0));
            DLIB_TEST(rowm(m,range(0,0)) == rowm(m,0));
            DLIB_TEST(colm(m,range(1,1)) == colm(m,1));
            DLIB_TEST(rowm(m,range(1,1)) == rowm(m,1));

            DLIB_TEST(colm(m,range(2,2)) == colm(m,2));
            DLIB_TEST(rowm(m,range(2,2)) == rowm(m,2));

            DLIB_TEST(colm(m,range(1,2)) == subm(m,0,1,4,2));
            DLIB_TEST(rowm(m,range(1,2)) == subm(m,1,0,2,4));

            set_colm(m,range(1,2)) = 9;
            set_subm(m2,0,1,4,2) = 9;
            DLIB_TEST(m == m2);

            set_colm(m,range(1,2)) = 11;
            set_subm(m2,0,1,4,2) = 11;
            DLIB_TEST(m == m2);
        }


    }






    class matrix_tester : public tester
    {
    public:
        matrix_tester (
        ) :
            tester ("test_matrix2",
                    "Runs tests on the matrix component.")
        {}

        void perform_test (
        )
        {
            matrix_test();
        }
    } a;

}


