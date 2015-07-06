// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_POINT_TrANSFORMS_ABSTRACT_Hh_
#ifdef DLIB_POINT_TrANSFORMS_ABSTRACT_Hh_

#include "../matrix/matrix_abstract.h"
#include "vector_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class point_transform_affine
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                applies an affine transformation to them.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/
    public:

        point_transform_affine (
        );
        /*!
            ensures
                - This object will perform the identity transform.  That is, given a point
                  as input it will return the same point as output.
        !*/

        point_transform_affine (
            const matrix<double,2,2>& m,
            const dlib::vector<double,2>& b
        );
        /*!
            ensures
                - #get_m() == m
                - #get_b() == b
                - When (*this)(p) is invoked it will return a point P such that:
                    - P == m*p + b
        !*/

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const;
        /*!
            ensures
                - applies the affine transformation defined by this object's constructor
                  to p and returns the result.
        !*/

        const matrix<double,2,2>& get_m(
        ) const;
        /*!
            ensures
                - returns the transformation matrix used by this object.
        !*/

        const dlib::vector<double,2>& get_b(
        ) const;
        /*!
            ensures
                - returns the offset vector used by this object.
        !*/

    };

    void serialize   (const point_transform_affine& item, std::ostream& out);
    void deserialize (point_transform_affine& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine operator* (
        const point_transform_affine& lhs,
        const point_transform_affine& rhs
    );
    /*!
        ensures
            - returns a transformation TFORM(x) that is equivalent to lhs(rhs(x)).  That
              is, for all valid x: TFORM(x) == lhs(rhs(x)).
    !*/

    // ----------------------------------------------------------------------------------------

    point_transform_affine inv (
        const point_transform_affine& trans
    );
    /*!
        ensures
            - If trans is an invertible transformation then this function returns a new
              transformation that is the inverse of trans. 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    point_transform_affine find_affine_transform (
        const std::vector<dlib::vector<T,2> >& from_points,
        const std::vector<dlib::vector<T,2> >& to_points
    );
    /*!
        requires
            - from_points.size() == to_points.size()
            - from_points.size() >= 3
        ensures
            - returns a point_transform_affine object, T, such that for all valid i:
                length(T(from_points[i]) - to_points[i])
              is minimized as often as possible.  That is, this function finds the affine
              transform that maps points in from_points to points in to_points.  If no
              affine transform exists which performs this mapping exactly then the one
              which minimizes the mean squared error is selected.  Additionally, if many
              equally good transformations exist, then the transformation with the smallest
              squared parameters is selected (i.e. if you wrote the transformation as a
              matrix then we say we select the transform with minimum Frobenius norm among
              all possible solutions).
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    point_transform_affine find_similarity_transform (
        const std::vector<dlib::vector<T,2> >& from_points,
        const std::vector<dlib::vector<T,2> >& to_points
    );
    /*!
        requires
            - from_points.size() == to_points.size()
            - from_points.size() >= 2
        ensures
            - This function is just like find_affine_transform() except it finds the best
              similarity transform instead of a full affine transform.  This means that it
              optimizes over only the space of rotations, scale changes, and translations.
              So for example, if you mapped the 3 vertices of a triangle through a
              similarity transform then the output would still be the same triangle.
              However, the triangle itself may be larger or smaller, rotated, or at a
              different location in the coordinate system.  This is not the case for a
              general affine transform which can stretch points in ways that cause, for
              example, an equilateral triangle to turn into an isosceles triangle.
    !*/

// ----------------------------------------------------------------------------------------

    class point_transform_projective
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                applies a projective transformation to them.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/

    public:

        point_transform_projective (
        );
        /*!
            ensures
                - This object will perform the identity transform.  That is, given a point
                  as input it will return the same point as output.
        !*/

        point_transform_projective (
            const matrix<double,3,3>& m
        );
        /*!
            ensures
                - #get_m() == m
        !*/

        point_transform_projective (
            const point_transform_affine& tran
        );
        /*!
            ensures
                - This object will perform exactly the same transformation as the given
                  affine transform.
        !*/

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const;
        /*!
            ensures
                - Applies the projective transformation defined by this object's constructor
                  to p and returns the result.  To define this precisely:
                    - let p_h == the point p in homogeneous coordinates.  That is:
                        - p_h.x() == p.x()
                        - p_h.y() == p.y()
                        - p_h.z() == 1 
                    - let x == get_m()*p_h 
                    - Then this function returns the value x/x.z()
        !*/

        const matrix<double,3,3>& get_m(
        ) const;
        /*!
            ensures
                - returns the transformation matrix used by this object.
        !*/

    };

    void serialize   (const point_transform_projective& item, std::ostream& out);
    void deserialize (point_transform_projective& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_projective operator* (
        const point_transform_projective& lhs,
        const point_transform_projective& rhs
    );
    /*!
        ensures
            - returns a transformation TFORM(x) that is equivalent to lhs(rhs(x)).  That
              is, for all valid x: TFORM(x) == lhs(rhs(x)).
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_projective inv (
        const point_transform_projective& trans
    );
    /*!
        ensures
            - If trans is an invertible transformation then this function returns a new
              transformation that is the inverse of trans. 
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_projective find_projective_transform (
        const std::vector<dlib::vector<double,2> >& from_points,
        const std::vector<dlib::vector<double,2> >& to_points
    );
    /*!
        requires
            - from_points.size() == to_points.size()
            - from_points.size() >= 4
        ensures
            - returns a point_transform_projective object, T, such that for all valid i:
                length(T(from_points[i]) - to_points[i])
              is minimized as often as possible.  That is, this function finds the projective
              transform that maps points in from_points to points in to_points.  If no
              projective transform exists which performs this mapping exactly then the one
              which minimizes the mean squared error is selected. 
    !*/

// ----------------------------------------------------------------------------------------

    class point_transform
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                rotates them around the origin by a given angle and then
                translates them.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/
    public:

        point_transform (
        );
        /*!
            ensures
                - This object will perform the identity transform.  That is, given a point
                  as input it will return the same point as output.
        !*/

        point_transform (
            const double& angle,
            const dlib::vector<double,2>& translate
        )
        /*!
            ensures
                - When (*this)(p) is invoked it will return a point P such that:
                    - P is the point p rotated counter-clockwise around the origin 
                      angle radians and then shifted by having translate added to it.
                      (Note that this is counter clockwise with respect to the normal
                      coordinate system with positive y going up and positive x going
                      to the right)
        !*/

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const;
        /*!
            ensures
                - rotates p, then translates it and returns the result.  The output
                  of this function is therefore equal to get_m()*p + get_b().
        !*/

        const matrix<double,2,2> get_m(
        ) const;
        /*!
            ensures
                - returns the transformation matrix used by this object.
        !*/

        const dlib::vector<double,2> get_b(
        ) const;
        /*!
            ensures
                - returns the offset vector used by this object.
        !*/

    };

    void serialize   (const point_transform& item, std::ostream& out);
    void deserialize (point_transform& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    class point_rotator
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                rotates them around the origin by a given angle.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/
    public:

        point_rotator (
        );
        /*!
            ensures
                - This object will perform the identity transform.  That is, given a point
                  as input it will return the same point as output.
        !*/

        point_rotator (
            const double& angle
        );
        /*!
            ensures
                - When (*this)(p) is invoked it will return a point P such that:
                    - P is the point p rotated counter-clockwise around the origin 
                      angle radians.
                      (Note that this is counter clockwise with respect to the normal
                      coordinate system with positive y going up and positive x going
                      to the right)
        !*/

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const;
        /*!
            ensures
                - rotates p and returns the result. The output of this function is
                  therefore equal to get_m()*p.
        !*/

        const matrix<double,2,2> get_m(
        ) const;
        /*!
            ensures
                - returns the transformation matrix used by this object.
        !*/
    };

    void serialize   (const point_rotator& item, std::ostream& out);
    void deserialize (point_rotator& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    const dlib::vector<T,2> rotate_point (
        const dlib::vector<T,2> center,
        const dlib::vector<T,2> p,
        double angle
    );
    /*!
        ensures
            - returns a point P such that:
                - P is the point p rotated counter-clockwise around the given
                  center point by angle radians.
                  (Note that this is counter clockwise with respect to the normal
                  coordinate system with positive y going up and positive x going
                  to the right)
    !*/

// ----------------------------------------------------------------------------------------

    matrix<double,2,2> rotation_matrix (
         double angle
    );
    /*!
        ensures
            - returns a rotation matrix which rotates points around the origin in a
              counter-clockwise direction by angle radians.
              (Note that this is counter clockwise with respect to the normal
              coordinate system with positive y going up and positive x going
              to the right)
              Or in other words, this function returns a matrix M such that, given a
              point P, M*P gives a point which is P rotated by angle radians around
              the origin in a counter-clockwise direction.
    !*/

// ----------------------------------------------------------------------------------------

    class point_transform_affine3d
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 3D points or vectors and 
                applies an affine transformation to them.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/
    public:

        point_transform_affine3d (
        );
        /*!
            ensures
                - This object will perform the identity transform.  That is, given a point
                  as input it will return the same point as output.
        !*/

        point_transform_affine3d (
            const matrix<double,3,3>& m,
            const dlib::vector<double,3>& b
        );
        /*!
            ensures
                - #get_m() == m
                - #get_b() == b
                - When (*this)(p) is invoked it will return a point P such that:
                    - P == m*p + b
        !*/

        const dlib::vector<double,3> operator() (
            const dlib::vector<double,3>& p
        ) const;
        /*!
            ensures
                - applies the affine transformation defined by this object's constructor
                  to p and returns the result.
        !*/

        const matrix<double,3,3>& get_m(
        ) const;
        /*!
            ensures
                - returns the transformation matrix used by this object.
        !*/

        const dlib::vector<double,3>& get_b(
        ) const;
        /*!
            ensures
                - returns the offset vector used by this object.
        !*/

    };

    void serialize   (const point_transform_affine3d& item, std::ostream& out);
    void deserialize (point_transform_affine3d& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d operator* (
        const point_transform_affine3d& lhs,
        const point_transform_affine3d& rhs
    );
    /*!
        ensures
            - returns a transformation TFORM(x) that is equivalent to lhs(rhs(x)).  That
              is, for all valid x: TFORM(x) == lhs(rhs(x)).
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d operator* (
        const point_transform_affine3d& lhs,
        const point_transform_affine& rhs
    );
    /*!
        ensures
            - returns a transformation TFORM(x) that is equivalent to lhs(rhs(x)).  That
              is, for all valid x: TFORM(x) == lhs(rhs(x)).
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d inv (
        const point_transform_affine3d& trans
    );
    /*!
        ensures
            - If trans is an invertible transformation then this function returns a new
              transformation that is the inverse of trans. 
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d rotate_around_x (
        double angle
    );
    /*!
        ensures
            - Returns a transformation that rotates a point around the x axis in a
              counter-clockwise direction by angle radians.  That is, the rotation appears
              counter-clockwise when the x axis points toward the observer, the coordinate
              system is right-handed, and the angle is positive.
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d rotate_around_y (
        double angle
    );
    /*!
        ensures
            - Returns a transformation that rotates a point around the y axis in a
              counter-clockwise direction by angle radians.  That is, the rotation appears
              counter-clockwise when the y axis points toward the observer, the coordinate
              system is right-handed, and the angle is positive.
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d rotate_around_z (
        double angle
    );
    /*!
        ensures
            - Returns a transformation that rotates a point around the z axis in a
              counter-clockwise direction by angle radians.  That is, the rotation appears
              counter-clockwise when the z axis points toward the observer, the coordinate
              system is right-handed, and the angle is positive.
    !*/

// ----------------------------------------------------------------------------------------

    point_transform_affine3d translate_point (
        const vector<double,3>& delta
    );
    /*!
        ensures
            - returns a transformation that simply translates points by adding delta to
              them.  That is, this function returns:
                point_transform_affine3d(identity_matrix<double>(3),delta);
    !*/

    point_transform_affine3d translate_point (
        double x,
        double y,
        double z
    );
    /*!
        ensures
            - returns translate_point(vector<double>(x,y,z))
    !*/

// ----------------------------------------------------------------------------------------

    class camera_transform
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object maps 3D points into the image plane of a camera.  Therefore,
                you can use it to compute 2D representations of 3D data from the point of
                view of some camera in 3D space.

            THREAD SAFETY
                It is safe for multiple threads to make concurrent accesses to this object
                without synchronization.
        !*/

    public:

        camera_transform  (
        );
        /*!
            ensures
                - #get_camera_pos()           == vector<double>(1,1,1) 
                - #get_camera_looking_at()    == vector<double>(0,0,0) 
                - #get_camera_up_direction()  == vector<double>(0,0,1) 
                - #get_camera_field_of_view() == 90
                - #get_num_pixels()           == 1 
        !*/

        camera_transform (
            const vector<double>& camera_pos,
            const vector<double>& camera_looking_at,
            const vector<double>& camera_up_direction,
            const double camera_field_of_view, 
            const unsigned long num_pixels
        );
        /*!
            requires
                - 0 < camera_field_of_view < 180
            ensures
                - #get_camera_pos() == camera_pos
                - #get_camera_looking_at() == camera_looking_at
                - #get_camera_up_direction() == camera_up_direction
                - #get_camera_field_of_view() == camera_field_of_view
                - #get_num_pixels() == num_pixels
        !*/

        dpoint operator() (
            const vector<double>& p
        ) const;
        /*!
            ensures
                - Maps the given 3D point p into the 2D image plane defined by the camera
                  parameters given to this object's constructor.  The 2D point in the image
                  plane is returned.
        !*/

        dpoint operator() (
            const vector<double>& p,
            double& scale,
            double& distance
        ) const;
        /*!
            ensures
                - Maps the given 3D point p into the 2D image plane defined by the camera
                  parameters given to this object's constructor.  The 2D point in the image
                  plane is returned.
                - #scale == a number that tells you how large things are at the point p.
                  Objects further from the camera appear smaller, in particular, they
                  appear #scale times their normal size.
                - #distance == how far away the point is from the image plane.  Objects in
                  front of the camera will have a positive distance and those behind a
                  negative distance.
        !*/

        vector<double> get_camera_pos(
        ) const;
        /*!
            ensures
                - returns the position, in 3D space, of the camera.  When operator() is
                  invoked it maps 3D points into the image plane of this camera.
        !*/

        vector<double> get_camera_looking_at(
        ) const;
        /*!
            ensures
                - returns the point in 3D space the camera is pointed at.  
        !*/

        vector<double> get_camera_up_direction(
        ) const;
        /*!
            ensures
                - returns a vector that defines what direction is "up" for the camera.
                  This means that as you travel from the bottom of the image plane to the
                  top you will be traveling in the direction of this vector.  Note that
                  get_camera_up_direction() doesn't need to be orthogonal to the camera's
                  line of sight (i.e. get_camera_looking_at()-get_camera_pos()), it just
                  needs to not be an exact multiple of the line of sight.  Any necessary
                  orthogonalization will be taken care of internally.
        !*/

        double get_camera_field_of_view(
        ) const;
        /*!
            ensures
                - returns the field of view of the camera in degrees.
        !*/

        unsigned long get_num_pixels(
        ) const;
        /*!
            ensures
                - 3D points that fall within the field of view of the camera are mapped by
                  operator() into the pixel coordinates of a get_num_pixels() by
                  get_num_pixels() image.  Therefore, you can use the output of operator()
                  to index into an image.  However, you still need to perform bounds
                  checking as there might be 3D points outside the field of view of the
                  camera and those will be mapped to 2D points outside the image.
        !*/

    };

    void serialize   (const camera_transform& item, std::ostream& out);
    void deserialize (camera_transform& item, std::istream& in);
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_POINT_TrANSFORMS_ABSTRACT_Hh_


