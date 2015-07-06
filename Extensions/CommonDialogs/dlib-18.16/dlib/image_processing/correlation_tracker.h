// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CORRELATION_TrACKER_H_
#define DLIB_CORRELATION_TrACKER_H_

#include "correlation_tracker_abstract.h"
#include "../geometry.h"
#include "../matrix.h"
#include "../array2d.h"
#include "../image_transforms/assign_image.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    class correlation_tracker
    {
    public:

        correlation_tracker (
        ) 
        {
            // Create the cosine mask used for space filtering.
            mask = make_cosine_mask();

            // Create the cosine mask used for the scale filtering.
            scale_cos_mask.resize(get_num_scale_levels());
            const long max_level = get_num_scale_levels()/2;
            for (unsigned long k = 0; k < get_num_scale_levels(); ++k)
            {
                double dist = std::abs((double)k-max_level)/max_level*pi/2;
                dist = std::min(dist, pi/2);
                scale_cos_mask[k] = std::cos(dist);
            }
        }

        template <typename image_type>
        void start_track (
            const image_type& img,
            const drectangle& p
        )
        {
            DLIB_CASSERT(p.is_empty() == false,
                "\t void correlation_tracker::start_track()"
                << "\n\t You can't give an empty rectangle."
            );

            B.set_size(0,0);

            point_transform_affine tform = inv(make_chip(img, p, F));
            for (unsigned long i = 0; i < F.size(); ++i)
                fft_inplace(F[i]);
            make_target_location_image(tform(center(p)), G);
            A.resize(F.size());
            for (unsigned long i = 0; i < F.size(); ++i)
            {
                A[i] = pointwise_multiply(G, F[i]);
                B += squared(real(F[i]))+squared(imag(F[i]));
            }

            position = p;

            // now do the scale space stuff
            make_scale_space(img, Fs);
            for (unsigned long i = 0; i < Fs.size(); ++i)
                fft_inplace(Fs[i]);
            make_scale_target_location_image(get_num_scale_levels()/2, Gs);
            Bs.set_size(0);
            As.resize(Fs.size());
            for (unsigned long i = 0; i < Fs.size(); ++i)
            {
                As[i] = pointwise_multiply(Gs, Fs[i]);
                Bs += squared(real(Fs[i]))+squared(imag(Fs[i]));
            }
        }


        unsigned long get_filter_size (
        ) const { return 128/2; } // must be power of 2

        unsigned long get_num_scale_levels(
        ) const { return 32; }  // must be power of 2

        unsigned long get_scale_window_size (
        ) const { return 23; }

        double get_regularizer_space (
        ) const { return 0.001; }
        inline double get_nu_space (
        ) const { return 0.025;}

        double get_regularizer_scale (
        ) const { return 0.001; }
        double get_nu_scale (
        ) const { return 0.025;}

        drectangle get_position (
        ) const 
        { 
            return position;
        }

        double get_scale_pyramid_alpha (
        ) const
        {
            return 1.020;
        }

        template <typename image_type>
        double update (
            const image_type& img,
            const drectangle& guess
        )
        {
            DLIB_CASSERT(get_position().is_empty() == false,
                "\t double correlation_tracker::update()"
                << "\n\t You must call start_track() first before calling update()."
            );


            const point_transform_affine tform = make_chip(img, guess, F);
            for (unsigned long i = 0; i < F.size(); ++i)
                fft_inplace(F[i]);

            // use the current filter to predict the object's location
            G = 0; 
            for (unsigned long i = 0; i < F.size(); ++i)
                G += pointwise_multiply(F[i],conj(A[i]));
            G = pointwise_multiply(G, reciprocal(B+get_regularizer_space()));
            ifft_inplace(G);
            const dlib::vector<double,2> pp = max_point_interpolated(real(G));


            // Compute the peak to side lobe ratio.
            const point p = pp;
            running_stats<double> rs;
            const rectangle peak = centered_rect(p, 8,8);
            for (long r = 0; r < G.nr(); ++r)
            {
                for (long c = 0; c < G.nc(); ++c)
                {
                    if (!peak.contains(point(c,r)))
                        rs.add(G(r,c).real());
                }
            }
            const double psr = (G(p.y(),p.x()).real()-rs.mean())/rs.stddev();


            // update the position of the object
            position = translate_rect(guess,tform(pp)-center(guess));

            // now update the position filters
            make_target_location_image(pp, G);
            B *= (1-get_nu_space());
            for (unsigned long i = 0; i < F.size(); ++i)
            {
                A[i] = get_nu_space()*pointwise_multiply(G, F[i]) + (1-get_nu_space())*A[i];
                B += get_nu_space()*(squared(real(F[i]))+squared(imag(F[i])));
            }



            // Now predict the scale change
            make_scale_space(img, Fs);
            for (unsigned long i = 0; i < Fs.size(); ++i)
                fft_inplace(Fs[i]);
            Gs = 0;
            for (unsigned long i = 0; i < Fs.size(); ++i)
                Gs += pointwise_multiply(Fs[i],conj(As[i]));
            Gs = pointwise_multiply(Gs, reciprocal(Bs+get_regularizer_scale()));
            ifft_inplace(Gs);
            const double pos = max_point_interpolated(real(Gs)).y();

            // update the rectangle's scale
            position *= std::pow(get_scale_pyramid_alpha(), pos-(double)get_num_scale_levels()/2);



            // Now update the scale filters
            make_scale_target_location_image(pos, Gs);
            Bs *= (1-get_nu_scale());
            for (unsigned long i = 0; i < Fs.size(); ++i)
            {
                As[i] = get_nu_scale()*pointwise_multiply(Gs, Fs[i]) + (1-get_nu_scale())*As[i];
                Bs += get_nu_scale()*(squared(real(Fs[i]))+squared(imag(Fs[i])));
            }


            return psr;
        }

        template <typename image_type>
        double update (
            const image_type& img
        )
        {
            return update(img, get_position());
        }

    private:

        template <typename image_type>
        void make_scale_space(
            const image_type& img,
            std::vector<matrix<std::complex<double>,0,1> >& Fs
        ) const
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;

            // Make an image pyramid and put it into the chips array.
            const long chip_size = get_scale_window_size();
            drectangle ppp = position*std::pow(get_scale_pyramid_alpha(), -(double)get_num_scale_levels()/2);
            dlib::array<array2d<pixel_type> > chips;
            std::vector<dlib::vector<double,2> > from_points, to_points;
            from_points.push_back(point(0,0));
            from_points.push_back(point(chip_size-1,0));
            from_points.push_back(point(chip_size-1,chip_size-1));
            for (unsigned long i = 0; i < get_num_scale_levels(); ++i)
            {
                array2d<pixel_type> chip(chip_size,chip_size);

                // pull box into chip
                to_points.clear();
                to_points.push_back(ppp.tl_corner());
                to_points.push_back(ppp.tr_corner());
                to_points.push_back(ppp.br_corner());
                transform_image(img,chip,interpolate_bilinear(),find_affine_transform(from_points, to_points));

                chips.push_back(chip);
                ppp *= get_scale_pyramid_alpha();
            }


            // extract HOG for each chip
            dlib::array<dlib::array<array2d<float> > > hogs(chips.size());
            for (unsigned long i = 0; i < chips.size(); ++i)
            {
                extract_fhog_features(chips[i], hogs[i], 4);
                hogs[i].resize(32);
                assign_image(hogs[i][31], chips[i]);
                assign_image(hogs[i][31], mat(hogs[i][31])/255.0);
            }

            // Now copy the hog features into the Fs outputs and also apply the cosine
            // windowing.
            Fs.resize(hogs[0].size()*hogs[0][0].size());
            unsigned long i = 0; 
            for (long r = 0; r < hogs[0][0].nr(); ++r)
            {
                for (long c = 0; c < hogs[0][0].nc(); ++c)
                {
                    for (unsigned long j = 0; j < hogs[0].size(); ++j)
                    {
                        Fs[i].set_size(hogs.size());
                        for (unsigned long k = 0; k < hogs.size(); ++k)
                        {
                            Fs[i](k) = hogs[k][j][r][c]*scale_cos_mask[k];
                        }
                        ++i;
                    }
                }
            } 
        }

        template <typename image_type>
        point_transform_affine make_chip (
            const image_type& img,
            drectangle p,
            std::vector<matrix<std::complex<double> > >& chip
        ) const
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            array2d<pixel_type> temp;
            const double padding = 1.4;
            const chip_details details(p*padding, chip_dims(get_filter_size(), get_filter_size()));
            extract_image_chip(img, details, temp);


            chip.resize(32);
            dlib::array<array2d<float> > hog;
            extract_fhog_features(temp, hog, 1, 3,3 );
            for (unsigned long i = 0; i < hog.size(); ++i)
                assign_image(chip[i], pointwise_multiply(matrix_cast<double>(mat(hog[i])), mask));

            assign_image(chip[31], temp);
            assign_image(chip[31], pointwise_multiply(mat(chip[31]), mask)/255.0);

            return inv(get_mapping_to_chip(details));
        }

        void make_target_location_image (
            const dlib::vector<double,2>& p,
            matrix<std::complex<double> >& g
        ) const
        {
            g.set_size(get_filter_size(), get_filter_size());
            g = 0;
            rectangle area = centered_rect(p, 21,21).intersect(get_rect(g));
            for (long r = area.top(); r <= area.bottom(); ++r)
            {
                for (long c = area.left(); c <= area.right(); ++c)
                {
                    double dist = length(point(c,r)-p);
                    g(r,c) = std::exp(-dist/3.0);
                }
            }
            fft_inplace(g);
            g = conj(g);
        }


        void make_scale_target_location_image (
            const double scale,
            matrix<std::complex<double>,0,1>& g
        ) const
        {
            g.set_size(get_num_scale_levels());
            for (long i = 0; i < g.size(); ++i)
            {
                double dist = std::pow((i-scale),2.0);
                g(i) = std::exp(-dist/1.000);
            }
            fft_inplace(g);
            g = conj(g);
        }

        matrix<double> make_cosine_mask (
        ) const
        {
            const long size = get_filter_size();
            matrix<double> temp(size,size);
            point cent = center(get_rect(temp));
            for (long r = 0; r < temp.nr(); ++r)
            {
                for (long c = 0; c < temp.nc(); ++c)
                {
                    point delta = point(c,r)-cent;
                    double dist = length(delta)/(size/2.0)*(pi/2);
                    dist = std::min(dist*1.0, pi/2);

                    temp(r,c) = std::cos(dist);
                }
            }
            return temp;
        }


        std::vector<matrix<std::complex<double> > > A, F;
        matrix<double> B;

        std::vector<matrix<std::complex<double>,0,1> > As, Fs;
        matrix<double,0,1> Bs;
        drectangle position;

        matrix<double> mask;
        std::vector<double> scale_cos_mask;

        // G and Gs do not logically contribute to the state of this object.  They are
        // here just so we can void reallocating them over and over.
        matrix<std::complex<double> > G;
        matrix<std::complex<double>,0,1> Gs;
    };
}

#endif // DLIB_CORRELATION_TrACKER_H_

