// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/statistics.h>
#include <dlib/sparse_vector.h>
#include <map>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.cca");

    dlib::rand rnd;
// ----------------------------------------------------------------------------------------

    std::vector<std::map<unsigned long, double> > make_really_big_test_matrix (
    )
    {
        std::vector<std::map<unsigned long,double> > temp(30000);
        for (unsigned long i = 0; i < temp.size(); ++i)
        {
            for (int k = 0; k < 30; ++k)
                temp[i][rnd.get_random_32bit_number()%10000] = 1;
        }
        return temp;
    }

    template <typename T>
    std::vector<std::map<unsigned long, T> > mat_to_sparse (
        const matrix<T>& A
    )
    {
        std::vector<std::map<unsigned long,T> > temp(A.nr());
        for (long r = 0; r < A.nr(); ++r)
        {
            for (long c = 0; c < A.nc(); ++c)
            {
                temp[r][c] = A(r,c);
            }
        }
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    matrix<typename EXP::type> rm_zeros (
        const matrix_exp<EXP>& m
    )
    {
        // Do this to avoid trying to correlate super small numbers that are really just
        // zero.  Doing this avoids some potential false alarms in the unit tests below.
        return round_zeros(m, max(abs(m))*1e-14);
    }

// ----------------------------------------------------------------------------------------

    void check_correlation (
        matrix<double> L,
        matrix<double> R,
        const matrix<double>& Ltrans,
        const matrix<double>& Rtrans,
        const matrix<double,0,1>& correlations
    )
    {
        // apply the transforms
        L = L*Ltrans;
        R = R*Rtrans;

        // compute the real correlation values. Store them in A.
        matrix<double> A = compute_correlations(L, R);

        for (long i = 0; i < correlations.size(); ++i)
        {
            // compare what the measured correlation values are (in A) to the 
            // predicted values.
            cout << "error: "<< A(i) - correlations(i);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_cca3()
    {
        print_spinner();
        const unsigned long rank = rnd.get_random_32bit_number()%10 + 1;
        const unsigned long m = rank + rnd.get_random_32bit_number()%15;
        const unsigned long n = rank + rnd.get_random_32bit_number()%15;
        const unsigned long n2 = rank + rnd.get_random_32bit_number()%15;
        const unsigned long rank2 = rank + rnd.get_random_32bit_number()%5;

        dlog << LINFO << "m:  " << m;
        dlog << LINFO << "n:  " << n;
        dlog << LINFO << "n2: " << n2;
        dlog << LINFO << "rank:  " << rank;
        dlog << LINFO << "rank2: " << rank2;


        matrix<double> L = randm(m,rank, rnd)*randm(rank,n, rnd);
        //matrix<double> R = randm(m,rank, rnd)*randm(rank,n2, rnd);
        matrix<double> R = L*randm(n,n2);
        //matrix<double> L = randm(m,n, rnd);
        //matrix<double> R = randm(m,n2, rnd);

        matrix<double> Ltrans, Rtrans;
        matrix<double,0,1> correlations;

        {
            correlations = cca(L, R, Ltrans, Rtrans, min(m,n), max(n,n2));
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            dlog << LINFO << "correlations: "<< trans(correlations);

            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST_MSG(corr_error < 1e-13, Ltrans << "\n\n" << Rtrans);

            const double trans_error = max(abs(L*Ltrans - R*Rtrans));
            dlog << LINFO << "trans_error: "<< trans_error;
            DLIB_TEST(trans_error < 1e-10);
        }
        {
            correlations = cca(mat_to_sparse(L), mat_to_sparse(R), Ltrans, Rtrans, min(m,n), max(n,n2)+6, 4);
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            dlog << LINFO << "correlations: "<< trans(correlations);
            dlog << LINFO << "computed cors: " << trans(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)));

            const double trans_error = max(abs(L*Ltrans - R*Rtrans));
            dlog << LINFO << "trans_error: "<< trans_error;
            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST_MSG(corr_error < 1e-13, Ltrans << "\n\n" << Rtrans);

            DLIB_TEST(trans_error < 1e-10);
        }

        dlog << LINFO << "*****************************************************";
    }

    void test_cca2()
    {
        print_spinner();
        const unsigned long rank = rnd.get_random_32bit_number()%10 + 1;
        const unsigned long m = rank + rnd.get_random_32bit_number()%15;
        const unsigned long n = rank + rnd.get_random_32bit_number()%15;
        const unsigned long n2 = rank + rnd.get_random_32bit_number()%15;

        dlog << LINFO << "m:  " << m;
        dlog << LINFO << "n:  " << n;
        dlog << LINFO << "n2: " << n2;
        dlog << LINFO << "rank:  " << rank;


        matrix<double> L = randm(m,n, rnd);
        matrix<double> R = randm(m,n2, rnd);

        matrix<double> Ltrans, Rtrans;
        matrix<double,0,1> correlations;

        {
            correlations = cca(L, R, Ltrans, Rtrans, min(n,n2), max(n,n2)-min(n,n2));
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            dlog << LINFO << "correlations: "<< trans(correlations);

            if (Ltrans.nc() > 1)
            {
                // The CCA projection directions are supposed to be uncorrelated for
                // non-matching pairs of projections.
                const double corr_rot1_error = max(abs(compute_correlations(rm_zeros(L*rotate<0,1>(Ltrans)), rm_zeros(R*Rtrans))));
                dlog << LINFO << "corr_rot1_error: "<< corr_rot1_error;
                DLIB_TEST(std::abs(corr_rot1_error) < 1e-10);
            }
            // Matching projection directions should be correlated with the amount of
            // correlation indicated by the return value of cca().
            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST(corr_error < 1e-13);
        }
        {
            correlations = cca(mat_to_sparse(L), mat_to_sparse(R), Ltrans, Rtrans, min(n,n2), max(n,n2)-min(n,n2));
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            dlog << LINFO << "correlations: "<< trans(correlations);

            if (Ltrans.nc() > 1)
            {
                // The CCA projection directions are supposed to be uncorrelated for
                // non-matching pairs of projections.
                const double corr_rot1_error = max(abs(compute_correlations(rm_zeros(L*rotate<0,1>(Ltrans)), rm_zeros(R*Rtrans))));
                dlog << LINFO << "corr_rot1_error: "<< corr_rot1_error;
                DLIB_TEST(std::abs(corr_rot1_error) < 1e-10);
            }
            // Matching projection directions should be correlated with the amount of
            // correlation indicated by the return value of cca().
            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST(corr_error < 1e-13);
        }

        dlog << LINFO << "*****************************************************";
    }

    void test_cca1()
    {
        print_spinner();
        const unsigned long rank = rnd.get_random_32bit_number()%10 + 1;
        const unsigned long m = rank + rnd.get_random_32bit_number()%15;
        const unsigned long n = rank + rnd.get_random_32bit_number()%15;

        dlog << LINFO << "m: " << m;
        dlog << LINFO << "n: " << n;
        dlog << LINFO << "rank: " << rank;

        matrix<double> T = randm(n,n, rnd);

        matrix<double> L = randm(m,rank, rnd)*randm(rank,n, rnd);
        //matrix<double> L = randm(m,n, rnd);
        matrix<double> R = L*T;

        matrix<double> Ltrans, Rtrans;
        matrix<double,0,1> correlations;

        {
            correlations = cca(L, R, Ltrans, Rtrans, rank);
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            if (Ltrans.nc() > 1)
            {
                // The CCA projection directions are supposed to be uncorrelated for
                // non-matching pairs of projections.
                const double corr_rot1_error = max(abs(compute_correlations(rm_zeros(L*rotate<0,1>(Ltrans)), rm_zeros(R*Rtrans))));
                dlog << LINFO << "corr_rot1_error: "<< corr_rot1_error;
                DLIB_TEST(std::abs(corr_rot1_error) < 1e-10);
            }
            // Matching projection directions should be correlated with the amount of
            // correlation indicated by the return value of cca().
            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST(corr_error < 1e-13);

            const double trans_error = max(abs(L*Ltrans - R*Rtrans));
            dlog << LINFO << "trans_error: "<< trans_error;
            DLIB_TEST(trans_error < 1e-10);

            dlog << LINFO << "correlations: "<< trans(correlations);
        }
        {
            correlations = cca(mat_to_sparse(L), mat_to_sparse(R), Ltrans, Rtrans, rank);
            DLIB_TEST(Ltrans.nc() == Rtrans.nc());
            if (Ltrans.nc() > 1)
            {
                // The CCA projection directions are supposed to be uncorrelated for
                // non-matching pairs of projections.
                const double corr_rot1_error = max(abs(compute_correlations(rm_zeros(L*rotate<0,1>(Ltrans)), rm_zeros(R*Rtrans))));
                dlog << LINFO << "corr_rot1_error: "<< corr_rot1_error;
                DLIB_TEST(std::abs(corr_rot1_error) < 1e-10);
            }
            // Matching projection directions should be correlated with the amount of
            // correlation indicated by the return value of cca().
            const double corr_error = max(abs(compute_correlations(rm_zeros(L*Ltrans), rm_zeros(R*Rtrans)) - correlations));
            dlog << LINFO << "correlation error: "<< corr_error;
            DLIB_TEST(corr_error < 1e-13);

            const double trans_error = max(abs(L*Ltrans - R*Rtrans));
            dlog << LINFO << "trans_error: "<< trans_error;
            DLIB_TEST(trans_error < 1e-9);

            dlog << LINFO << "correlations: "<< trans(correlations);
        }

        dlog << LINFO << "*****************************************************";
    }

// ----------------------------------------------------------------------------------------

    void test_svd_fast(
        long rank,
        long m,
        long n
    )
    {
        print_spinner();
        matrix<double> A = randm(m,rank,rnd)*randm(rank,n,rnd);
        matrix<double> u,v;
        matrix<double,0,1> w;

        dlog << LINFO << "rank: "<< rank;
        dlog << LINFO << "m: "<< m;
        dlog << LINFO << "n: "<< n;

        svd_fast(A, u, w, v, rank, 2);
        DLIB_TEST(u.nr() == m);
        DLIB_TEST(u.nc() == rank);
        DLIB_TEST(w.nr() == rank);
        DLIB_TEST(w.nc() == 1);
        DLIB_TEST(v.nr() == n);
        DLIB_TEST(v.nc() == rank);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);

        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-13);
        svd_fast(mat_to_sparse(A), u, w, v, rank, 2);
        DLIB_TEST(u.nr() == m);
        DLIB_TEST(u.nc() == rank);
        DLIB_TEST(w.nr() == rank);
        DLIB_TEST(w.nc() == 1);
        DLIB_TEST(v.nr() == n);
        DLIB_TEST(v.nc() == rank);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-13);

        svd_fast(A, u, w, v, rank, 0);
        DLIB_TEST(u.nr() == m);
        DLIB_TEST(u.nc() == rank);
        DLIB_TEST(w.nr() == rank);
        DLIB_TEST(w.nc() == 1);
        DLIB_TEST(v.nr() == n);
        DLIB_TEST(v.nc() == rank);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST_MSG(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-9,max(abs(tmp(A - u*diagm(w)*trans(v)))));
        svd_fast(mat_to_sparse(A), u, w, v, rank, 0);
        DLIB_TEST(u.nr() == m);
        DLIB_TEST(u.nc() == rank);
        DLIB_TEST(w.nr() == rank);
        DLIB_TEST(w.nc() == 1);
        DLIB_TEST(v.nr() == n);
        DLIB_TEST(v.nc() == rank);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-10);

        svd_fast(A, u, w, v, rank+5, 0);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-11);
        svd_fast(mat_to_sparse(A), u, w, v, rank+5, 0);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-11);
        svd_fast(A, u, w, v, rank+5, 1);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-12);
        svd_fast(mat_to_sparse(A), u, w, v, rank+5, 1);
        DLIB_TEST(max(abs(trans(u)*u - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(trans(v)*v - identity_matrix<double>(u.nc()))) < 1e-13);
        DLIB_TEST(max(abs(tmp(A - u*diagm(w)*trans(v)))) < 1e-12);
    }

    void test_svd_fast()
    {
        for (int iter = 0; iter < 1000; ++iter)
        {
            const unsigned long rank = rnd.get_random_32bit_number()%10 + 1;
            const unsigned long m = rank + rnd.get_random_32bit_number()%10;
            const unsigned long n = rank + rnd.get_random_32bit_number()%10;

            test_svd_fast(rank, m, n);

        }
        test_svd_fast(1, 1, 1);
        test_svd_fast(1, 2, 2);
        test_svd_fast(1, 1, 2);
        test_svd_fast(1, 2, 1);
    }

// ----------------------------------------------------------------------------------------

    class test_cca : public tester
    {
    public:
        test_cca (
        ) :
            tester ("test_cca",
                "Runs tests on the cca() and svd_fast() routines.")
        {}

        void perform_test (
        )
        {
            for (int i = 0; i < 200; ++i)
            {
                test_cca1();
                test_cca2();
                test_cca3();
            }
            test_svd_fast();
        }
    } a;



}




