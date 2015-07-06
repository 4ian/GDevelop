// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_POINT_TrANSFORMS_H_
#define DLIB_POINT_TrANSFORMS_H_

#include "point_transforms_abstract.h"
#include "../algs.h"
#include "vector.h"
#include "../matrix.h"
#include "../matrix/matrix_la.h"
#include "../optimization/optimization.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class point_rotator
    {
    public:
        point_rotator (
        )
        {
            sin_angle = 0;
            cos_angle = 1;
        }

        point_rotator (
            const double& angle
        )
        {
            sin_angle = std::sin(angle);
            cos_angle = std::cos(angle);
        }

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const
        {
            double x = cos_angle*p.x() - sin_angle*p.y();
            double y = sin_angle*p.x() + cos_angle*p.y();

            return dlib::vector<double,2>(x,y);
        }

        const matrix<double,2,2> get_m(
        ) const 
        { 
            matrix<double,2,2> temp;
            temp = cos_angle, -sin_angle,
                   sin_angle, cos_angle;
            return temp; 
        }

        inline friend void serialize (const point_rotator& item, std::ostream& out)
        {
            serialize(item.sin_angle, out);
            serialize(item.cos_angle, out);
        }

        inline friend void deserialize (point_rotator& item, std::istream& in)
        {
            deserialize(item.sin_angle, in);
            deserialize(item.cos_angle, in);
        }

    private:
        double sin_angle;
        double cos_angle;
    };

// ----------------------------------------------------------------------------------------

    class point_transform
    {
    public:

        point_transform (
        )
        {
            sin_angle = 0;
            cos_angle = 1;
            translate.x() = 0;
            translate.y() = 0;
        }

        point_transform (
            const double& angle,
            const dlib::vector<double,2>& translate_
        )
        {
            sin_angle = std::sin(angle);
            cos_angle = std::cos(angle);
            translate = translate_;
        }

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const
        {
            double x = cos_angle*p.x() - sin_angle*p.y();
            double y = sin_angle*p.x() + cos_angle*p.y();

            return dlib::vector<double,2>(x,y) + translate;
        }

        const matrix<double,2,2> get_m(
        ) const 
        { 
            matrix<double,2,2> temp;
            temp = cos_angle, -sin_angle,
                   sin_angle, cos_angle;
            return temp; 
        }

        const dlib::vector<double,2> get_b(
        ) const { return translate; }

        inline friend void serialize (const point_transform& item, std::ostream& out)
        {
            serialize(item.sin_angle, out);
            serialize(item.cos_angle, out);
            serialize(item.translate, out);
        }

        inline friend void deserialize (point_transform& item, std::istream& in)
        {
            deserialize(item.sin_angle, in);
            deserialize(item.cos_angle, in);
            deserialize(item.translate, in);
        }

    private:
        double sin_angle;
        double cos_angle;
        dlib::vector<double,2> translate;
    };

// ----------------------------------------------------------------------------------------

    class point_transform_affine
    {
    public:

        point_transform_affine (
        )
        {
            m = identity_matrix<double>(2);
            b.x() = 0;
            b.y() = 0;
        }

        point_transform_affine (
            const matrix<double,2,2>& m_,
            const dlib::vector<double,2>& b_
        ) :m(m_), b(b_)
        {
        }

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const
        {
            return m*p + b;
        }

        const matrix<double,2,2>& get_m(
        ) const { return m; }

        const dlib::vector<double,2>& get_b(
        ) const { return b; }

        inline friend void serialize (const point_transform_affine& item, std::ostream& out)
        {
            serialize(item.m, out);
            serialize(item.b, out);
        }

        inline friend void deserialize (point_transform_affine& item, std::istream& in)
        {
            deserialize(item.m, in);
            deserialize(item.b, in);
        }

    private:
        matrix<double,2,2> m;
        dlib::vector<double,2> b;
    };

// ----------------------------------------------------------------------------------------

    inline point_transform_affine operator* (
        const point_transform_affine& lhs,
        const point_transform_affine& rhs
    )
    {
        return point_transform_affine(lhs.get_m()*rhs.get_m(), lhs.get_m()*rhs.get_b()+lhs.get_b());
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine inv (
        const point_transform_affine& trans
    )
    {
        matrix<double,2,2> im = inv(trans.get_m());
        return point_transform_affine(im, -im*trans.get_b());
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    point_transform_affine find_affine_transform (
        const std::vector<dlib::vector<T,2> >& from_points,
        const std::vector<dlib::vector<T,2> >& to_points
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(from_points.size() == to_points.size() &&
                    from_points.size() >= 3,
            "\t point_transform_affine find_affine_transform(from_points, to_points)"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t from_points.size(): " << from_points.size()
            << "\n\t to_points.size():   " << to_points.size()
            );

        matrix<double,3,0> P(3, from_points.size());
        matrix<double,2,0> Q(2, from_points.size());

        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            P(0,i) = from_points[i].x();
            P(1,i) = from_points[i].y();
            P(2,i) = 1;

            Q(0,i) = to_points[i].x();
            Q(1,i) = to_points[i].y();
        }

        const matrix<double,2,3> m = Q*pinv(P);
        return point_transform_affine(subm(m,0,0,2,2), colm(m,2));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    point_transform_affine find_similarity_transform (
        const std::vector<dlib::vector<T,2> >& from_points,
        const std::vector<dlib::vector<T,2> >& to_points
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(from_points.size() == to_points.size() &&
                    from_points.size() >= 2,
            "\t point_transform_affine find_similarity_transform(from_points, to_points)"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t from_points.size(): " << from_points.size()
            << "\n\t to_points.size():   " << to_points.size()
            );

        // We use the formulas from the paper: Least-squares estimation of transformation
        // parameters between two point patterns by Umeyama.  They are equations 34 through
        // 43.

        dlib::vector<double,2> mean_from, mean_to;
        double sigma_from = 0, sigma_to = 0;
        matrix<double,2,2> cov;
        cov = 0;

        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            mean_from += from_points[i];
            mean_to += to_points[i];
        }
        mean_from /= from_points.size();
        mean_to   /= from_points.size();

        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            sigma_from += length_squared(from_points[i] - mean_from);
            sigma_to += length_squared(to_points[i] - mean_to);
            cov += (to_points[i] - mean_to)*trans(from_points[i] - mean_from);
        }

        sigma_from /= from_points.size();
        sigma_to   /= from_points.size();
        cov        /= from_points.size();

        matrix<double,2,2> u, v, s, d;
        svd(cov, u,d,v);
        s = identity_matrix(cov);
        if (det(cov) < 0 || (det(cov) == 0 && det(u)*det(v)<0))
        {
            if (d(1,1) < d(0,0))
                s(1,1) = -1;
            else
                s(0,0) = -1;
        }

        matrix<double,2,2> r = u*s*trans(v);
        double c = 1; 
        if (sigma_from != 0)
            c = 1.0/sigma_from * trace(d*s);
        vector<double,2> t = mean_to - c*r*mean_from;

        return point_transform_affine(c*r, t);
    }

// ----------------------------------------------------------------------------------------

    class point_transform_projective
    {
    public:

        point_transform_projective (
        )
        {
            m = identity_matrix<double>(3);
        }

        point_transform_projective (
            const matrix<double,3,3>& m_
        ) :m(m_)
        {
        }
        
        point_transform_projective (
            const point_transform_affine& tran
        ) 
        {
            set_subm(m, 0,0, 2,2) = tran.get_m();
            set_subm(m, 0,2, 2,1) = tran.get_b();
            m(2,0) = 0;
            m(2,1) = 0;
            m(2,2) = 1;
        }
        

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const
        {
            dlib::vector<double,3> temp(p);
            temp.z() = 1;
            temp = m*temp;
            if (temp.z() != 0)
                temp = temp/temp.z();
            return temp;
        }

        const matrix<double,3,3>& get_m(
        ) const { return m; }

        inline friend void serialize (const point_transform_projective& item, std::ostream& out)
        {
            serialize(item.m, out);
        }

        inline friend void deserialize (point_transform_projective& item, std::istream& in)
        {
            deserialize(item.m, in);
        }

    private:
        matrix<double,3,3> m;
    };

// ----------------------------------------------------------------------------------------

    inline point_transform_projective operator* (
        const point_transform_projective& lhs,
        const point_transform_projective& rhs
    )
    {
        return point_transform_projective(lhs.get_m()*rhs.get_m());
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_projective inv (
        const point_transform_projective& trans
    )
    {
        return point_transform_projective(inv(trans.get_m()));
    }

// ----------------------------------------------------------------------------------------

    namespace impl_proj
    {

        inline point_transform_projective find_projective_transform_basic (
            const std::vector<dlib::vector<double,2> >& from_points,
            const std::vector<dlib::vector<double,2> >& to_points
        )
        /*!
            ensures
                - Uses the system of equations approach to finding a projective transform.
                  This is "Method 3" from Estimating Projective Transformation Matrix by
                  Zhengyou Zhang. 
                - It should be emphasized that the find_projective_transform_basic()
                  routine, which uses the most popular method for finding projective
                  transformations, doesn't really work well when the minimum error solution
                  doesn't have zero error.  In this case, it can deviate by a large amount
                  from the proper minimum mean squared error transformation.  Therefore,
                  our overall strategy will be to use the solution from
                  find_projective_transform_basic() as a starting point for a BFGS based
                  non-linear optimizer which will optimize the correct mean squared error
                  criterion.

                  A great essay on this subject is Homography Estimation by Elan Dubrofsky.
        !*/
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(from_points.size() == to_points.size() &&
                from_points.size() >= 4,
                "\t point_transform_projective find_projective_transform_basic(from_points, to_points)"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t from_points.size(): " << from_points.size()
                << "\n\t to_points.size():   " << to_points.size()
            );

            matrix<double,9,9> accum, u, v;
            matrix<double,9,1> w;
            matrix<double,2,9> B;
            accum = 0;
            B = 0;
            for (unsigned long i = 0; i < from_points.size(); ++i)
            {
                dlib::vector<double,3> f = from_points[i];
                f.z() = 1;
                dlib::vector<double,3> t = to_points[i];
                t.z() = 1;

                set_subm(B,0,0,1,3) = t.y()*trans(f);
                set_subm(B,1,0,1,3) =       trans(f);

                set_subm(B,0,3,1,3) = -t.x()*trans(f);
                set_subm(B,1,6,1,3) = -t.x()*trans(f);

                accum += trans(B)*B;
            }

            svd2(true, false, accum, u, w, v);
            long j = index_of_min(w);

            return point_transform_projective(reshape(colm(u,j),3,3)); 
        }

    // ----------------------------------------------------------------------------------------

        struct obj
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is the objective function we really want to minimize when looking
                    for a transformation matrix.  That is, we would like the transformed
                    points to be as close as possible to their "to" points.  Here,
                    closeness is measured using Euclidean distance.

            !*/
            obj(
                const std::vector<dlib::vector<double,2> >& from_points_,
                const std::vector<dlib::vector<double,2> >& to_points_
            ) : 
                from_points(from_points_) ,
                to_points(to_points_)
            {}
            const std::vector<dlib::vector<double,2> >& from_points;
            const std::vector<dlib::vector<double,2> >& to_points;

            double operator() (
                const matrix<double,9,1>& p
            ) const
            {
                point_transform_projective tran(reshape(p,3,3));

                double sum = 0;
                for (unsigned long i = 0; i < from_points.size(); ++i)
                {
                    sum += length_squared(tran(from_points[i]) - to_points[i]);
                }
                return sum;
            }
        };

        struct obj_der
        {
            /*!
                WHAT THIS OBJECT REPRESENTS
                    This is the derivative of obj.
            !*/

            obj_der(
                const std::vector<dlib::vector<double,2> >& from_points_,
                const std::vector<dlib::vector<double,2> >& to_points_
            ) : 
                from_points(from_points_) ,
                to_points(to_points_)
            {}
            const std::vector<dlib::vector<double,2> >& from_points;
            const std::vector<dlib::vector<double,2> >& to_points;

            matrix<double,9,1> operator() (
                const matrix<double,9,1>& p
            ) const
            {
                const matrix<double,3,3> H = reshape(p,3,3);

                matrix<double,3,3> grad;
                grad = 0;
                for (unsigned long i = 0; i < from_points.size(); ++i)
                {
                    dlib::vector<double,3> from, to;
                    from = from_points[i];
                    from.z() = 1;
                    to = to_points[i];
                    to.z() = 1;

                    matrix<double,3,1> w = H*from;
                    const double scale = (w(2) != 0) ? (1.0/w(2)) : (1);
                    w *= scale;
                    matrix<double,3,1> residual = (w-to)*2*scale;

                    grad(0,0) += from.x()*residual(0);
                    grad(0,1) += from.y()*residual(0);
                    grad(0,2) +=          residual(0);

                    grad(1,0) += from.x()*residual(1);
                    grad(1,1) += from.y()*residual(1);
                    grad(1,2) +=          residual(1);

                    grad(2,0) += -(from.x()*w(0)*residual(0) + from.x()*w(1)*residual(1));
                    grad(2,1) += -(from.y()*w(0)*residual(0) + from.y()*w(1)*residual(1));
                    grad(2,2) += -(         w(0)*residual(0) +          w(1)*residual(1));

                }
                return reshape_to_column_vector(grad);
            }
        };
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_projective find_projective_transform (
        const std::vector<dlib::vector<double,2> >& from_points,
        const std::vector<dlib::vector<double,2> >& to_points
    )
    {
        using namespace impl_proj;
        // make sure requires clause is not broken
        DLIB_ASSERT(from_points.size() == to_points.size() &&
                    from_points.size() >= 4,
            "\t point_transform_projective find_projective_transform(from_points, to_points)"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t from_points.size(): " << from_points.size()
            << "\n\t to_points.size():   " << to_points.size()
            );


        // Find a candidate projective transformation.  Also, find the best affine
        // transform and then compare it with the projective transform estimated using the
        // direct SVD method.  Use whichever one works better as the starting point for a
        // BFGS based optimizer.  If the best solution has large mean squared error and is
        // also close to affine then find_projective_transform_basic() might give a very
        // bad initial guess.  So also checking for a good affine transformation can
        // produce a much better final result in many cases.
        point_transform_projective tran1 = find_projective_transform_basic(from_points, to_points);
        point_transform_affine tran2 = find_affine_transform(from_points, to_points);

        // check which is best
        double error1 = 0;
        double error2 = 0;
        for (unsigned long i = 0; i < from_points.size(); ++i)
        {
            error1 += length_squared(tran1(from_points[i])-to_points[i]);
            error2 += length_squared(tran2(from_points[i])-to_points[i]);
        }
        matrix<double,9,1> params; 
        // Pick the minimum error solution among the two so far.
        if (error1 < error2)
            params = reshape_to_column_vector(tran1.get_m());
        else
            params = reshape_to_column_vector(point_transform_projective(tran2).get_m());


        // Now refine the transformation matrix so that we can be sure we have
        // at least a local minimizer.
        obj o(from_points, to_points);
        obj_der der(from_points, to_points);
        find_min(bfgs_search_strategy(),
                objective_delta_stop_strategy(1e-6,100),
                o,
                der,
                params,
                0);

        return point_transform_projective(reshape(params,3,3)); 
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    const dlib::vector<T,2> rotate_point (
        const dlib::vector<T,2>& center,
        const dlib::vector<T,2>& p,
        double angle
    )
    {
        point_rotator rot(angle);
        return rot(p-center)+center;
    }

// ----------------------------------------------------------------------------------------

    inline matrix<double,2,2> rotation_matrix (
         double angle
    )
    {
        const double ca = std::cos(angle);
        const double sa = std::sin(angle);

        matrix<double,2,2> m;
        m = ca, -sa,
            sa, ca;
        return m;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class point_transform_affine3d
    {
    public:

        point_transform_affine3d (
        )
        {
            m = identity_matrix<double>(3);
            b.x() = 0;
            b.y() = 0;
        }

        point_transform_affine3d (
            const matrix<double,3,3>& m_,
            const dlib::vector<double,3>& b_
        ) :m(m_), b(b_)
        {
        }

        const dlib::vector<double,3> operator() (
            const dlib::vector<double,3>& p
        ) const
        {
            return m*p + b;
        }

        const matrix<double,3,3>& get_m(
        ) const { return m; }

        const dlib::vector<double,3>& get_b(
        ) const { return b; }

        inline friend void serialize (const point_transform_affine3d& item, std::ostream& out)
        {
            serialize(item.m, out);
            serialize(item.b, out);
        }

        inline friend void deserialize (point_transform_affine3d& item, std::istream& in)
        {
            deserialize(item.m, in);
            deserialize(item.b, in);
        }

    private:
        matrix<double,3,3> m;
        dlib::vector<double,3> b;
    };

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d operator* (
        const point_transform_affine3d& lhs,
        const point_transform_affine& rhs
    )
    {
        matrix<double,3,3> m;
        m = 0;
        set_subm(m, get_rect(rhs.get_m())) = rhs.get_m();
        vector<double,3> b = rhs.get_b();

        return point_transform_affine3d(lhs.get_m()*m, lhs.get_m()*b+lhs.get_b());
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d operator* (
        const point_transform_affine3d& lhs,
        const point_transform_affine3d& rhs
    )
    {
        return point_transform_affine3d(lhs.get_m()*rhs.get_m(), lhs.get_m()*rhs.get_b()+lhs.get_b());
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d inv (
        const point_transform_affine3d& trans
    )
    {
        matrix<double,3,3> im = inv(trans.get_m());
        return point_transform_affine3d(im, -im*trans.get_b());
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d rotate_around_x (
        double angle
    )
    {
        const double ca = std::cos(angle);
        const double sa = std::sin(angle);

        matrix<double,3,3> m;
        m = 1,  0,  0,
            0, ca, -sa,
            0, sa, ca;

        vector<double,3> b;

        return point_transform_affine3d(m,b);
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d rotate_around_y (
        double angle
    )
    {
        const double ca = std::cos(angle);
        const double sa = std::sin(angle);

        matrix<double,3,3> m;
        m = ca,  0, sa,
             0,  1, 0,
            -sa, 0, ca;

        vector<double,3> b;

        return point_transform_affine3d(m,b);
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d rotate_around_z (
        double angle
    )
    {
        const double ca = std::cos(angle);
        const double sa = std::sin(angle);

        matrix<double,3,3> m;
        m = ca, -sa, 0,
            sa, ca,  0,
            0,   0,  1;

        vector<double,3> b;

        return point_transform_affine3d(m,b);
    }

// ----------------------------------------------------------------------------------------

    inline point_transform_affine3d translate_point (
        const vector<double,3>& delta
    )
    {
        return point_transform_affine3d(identity_matrix<double>(3),delta);
    }

    inline point_transform_affine3d translate_point (
        double x,
        double y,
        double z
    )
    {
        return translate_point(vector<double>(x,y,z));
    }

// ----------------------------------------------------------------------------------------

    class camera_transform
    {

    public:

        camera_transform  (
        )
        {
            *this = camera_transform(vector<double>(1,1,1), 
                                     vector<double>(0,0,0),
                                     vector<double>(0,0,1),
                                     90,
                                     1);
        }

        camera_transform (
            const vector<double>& camera_pos_,
            const vector<double>& camera_looking_at_,
            const vector<double>& camera_up_direction_,
            const double camera_field_of_view_, 
            const unsigned long num_pixels_
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(0 < camera_field_of_view_ && camera_field_of_view_ < 180,
                "\t camera_transform::camera_transform()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t camera_field_of_view_: " << camera_field_of_view_
                );

            camera_pos = camera_pos_;
            camera_looking_at = camera_looking_at_;
            camera_up_direction = camera_up_direction_;
            camera_field_of_view = camera_field_of_view_;
            num_pixels = num_pixels_;

            dlib::vector<double> X,Y,Z;
            Z = (camera_looking_at - camera_pos).normalize();
            Y = camera_up_direction - dot(camera_up_direction,Z)*Z; 
            Y = Y.normalize();
            X = Z.cross(Y);

            set_rowm(proj,0) = trans(X);
            // Minus because images have y axis going down but we want the 3d projection to appear using a normal coordinate system with y going up.
            set_rowm(proj,1) = -trans(Y); 
            set_rowm(proj,2) = trans(Z);

            width = num_pixels/2.0;
            dist_scale = width/std::tan(pi/180*camera_field_of_view/2);
        }

        vector<double> get_camera_pos()         const { return camera_pos; }
        vector<double> get_camera_looking_at()  const { return camera_looking_at; }
        vector<double> get_camera_up_direction()const { return camera_up_direction; }
        double get_camera_field_of_view()       const { return camera_field_of_view; }
        unsigned long get_num_pixels()                   const { return num_pixels; }

        inline dpoint operator() (
            const vector<double>& p,
            double& scale,
            double& distance
        ) const
        {
            vector<double> temp = p-camera_pos;
            temp = proj*temp;
            distance = temp.z();
            scale = dist_scale/(temp.z()>0 ? temp.z() : 1e-9);
            temp.x() = temp.x()*scale + width;
            temp.y() = temp.y()*scale + width;
            return temp;
        }

        dpoint operator() (
            const vector<double>& p
        ) const
        {
            double scale, distance;
            return (*this)(p,scale,distance);
        }

        inline friend void serialize (const camera_transform& item, std::ostream& out)
        {
            serialize(item.camera_pos, out);
            serialize(item.camera_looking_at, out);
            serialize(item.camera_up_direction, out);
            serialize(item.camera_field_of_view, out); 
            serialize(item.num_pixels, out);
            serialize(item.proj, out);
            serialize(item.dist_scale, out);
            serialize(item.width, out);
        }

        inline friend void deserialize (camera_transform& item, std::istream& in)
        {
            deserialize(item.camera_pos, in);
            deserialize(item.camera_looking_at, in);
            deserialize(item.camera_up_direction, in);
            deserialize(item.camera_field_of_view, in); 
            deserialize(item.num_pixels, in);
            deserialize(item.proj, in);
            deserialize(item.dist_scale, in);
            deserialize(item.width, in);
        }

    private:

        vector<double> camera_pos;
        vector<double> camera_looking_at;
        vector<double> camera_up_direction;
        double camera_field_of_view; 
        unsigned long num_pixels;
        matrix<double,3,3> proj;
        double dist_scale;
        double width;

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_POINT_TrANSFORMS_H_

