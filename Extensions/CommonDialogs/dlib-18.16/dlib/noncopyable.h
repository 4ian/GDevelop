//  (C) Copyright Beman Dawes 1999-2003. Distributed under the Boost
//  Software License, Version 1.0. (See accompanying file
//  LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//  Contributed by Dave Abrahams
//  See http://www.boost.org/libs/utility for documentation.

#ifndef DLIB_BOOST_NONCOPYABLE_HPP_INCLUDED
#define DLIB_BOOST_NONCOPYABLE_HPP_INCLUDED


namespace dlib
{
    class noncopyable
    {
        /*!
            This class makes it easier to declare a class as non-copyable.
            If you want to make an object that can't be copied just inherit
            from this object.
        !*/

    protected:
        noncopyable() {}
        ~noncopyable() {}
    private:  // emphasize the following members are private
        noncopyable(const noncopyable&);
        const noncopyable& operator=(const noncopyable&);

    };
}

#endif  // DLIB_BOOST_NONCOPYABLE_HPP_INCLUDED

