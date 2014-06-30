// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KALMAN_FiLTER_H__
#define DLIB_KALMAN_FiLTER_H__

#include "kalman_filter_abstract.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        long states,
        long measurements
        >
    class kalman_filter
    {
    public:

        kalman_filter()
        {
            H = 0;
            A = 0;
            Q = 0;
            R = 0;
            x = 0;
            xb = 0;
            P = identity_matrix<double>(states);
            got_first_meas = false;
        }

        void set_observation_model ( const matrix<double,measurements,states>& H_) { H = H_; }
        void set_transition_model  ( const matrix<double,states,states>& A_) { A = A_; }
        void set_process_noise     ( const matrix<double,states,states>& Q_) { Q = Q_; }
        void set_measurement_noise ( const matrix<double,measurements,measurements>& R_) { R = R_; }
        void set_estimation_error_covariance( const matrix<double,states,states>& P_) { P = P_; }

        const matrix<double,measurements,states>& get_observation_model (
        ) const { return H; }

        const matrix<double,states,states>& get_transition_model (
        ) const { return A; }

        const matrix<double,states,states>& get_process_noise (
        ) const { return Q; }

        const matrix<double,measurements,measurements>& get_measurement_noise (
        ) const { return R; }

        void update (
        )
        {
            // propagate estimation error covariance forward
            P = A*P*trans(A) + Q;

            // propagate state forward
            x = xb;
            xb = A*x;
        }

        void update (const matrix<double,measurements,1>& z)
        {
            // propagate estimation error covariance forward
            P = A*P*trans(A) + Q;

            // compute Kalman gain matrix
            const matrix<double,states,measurements> K = P*trans(H)*pinv(H*P*trans(H) + R);

            if (got_first_meas)
            {
                const matrix<double,measurements,1> res = z - H*xb;
                // correct the current state estimate
                x = xb + K*res;
            }
            else
            {
                // Since we don't have a previous state estimate at the start of filtering,
                // we will just set the current state to whatever is indicated by the measurement
                x = pinv(H)*z; 
                got_first_meas = true;
            }

            // propagate state forward in time
            xb = A*x;

            // update estimation error covariance since we got a measurement.
            P = (identity_matrix<double,states>() - K*H)*P;
        }

        const matrix<double,states,1>& get_current_state(
        ) const
        {
            return x;
        }

        const matrix<double,states,1>& get_predicted_next_state(
        ) const
        {
            return xb;
        }

        const matrix<double,states,states>& get_current_estimation_error_covariance(
        ) const
        {
            return P;
        }

        friend inline void serialize(const kalman_filter& item, std::ostream& out)
        {
            int version = 1;
            serialize(version, out);
            serialize(item.got_first_meas, out);
            serialize(item.x, out);
            serialize(item.xb, out);
            serialize(item.P, out);
            serialize(item.H, out);
            serialize(item.A, out);
            serialize(item.Q, out);
            serialize(item.R, out);
        }

        friend inline void deserialize(kalman_filter& item, std::istream& in)
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw dlib::serialization_error("Unknown version number found while deserializing kalman_filter object.");

            deserialize(item.got_first_meas, in);
            deserialize(item.x, in);
            deserialize(item.xb, in);
            deserialize(item.P, in);
            deserialize(item.H, in);
            deserialize(item.A, in);
            deserialize(item.Q, in);
            deserialize(item.R, in);
        }

    private:

        bool got_first_meas;
        matrix<double,states,1> x, xb;
        matrix<double,states,states> P;

        matrix<double,measurements,states> H;
        matrix<double,states,states> A;
        matrix<double,states,states> Q;
        matrix<double,measurements,measurements> R;


    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KALMAN_FiLTER_H__

