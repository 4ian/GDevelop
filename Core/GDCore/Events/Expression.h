/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_EXPRESSION_H
#define GDCORE_EXPRESSION_H
#include "GDCore/String.h"

namespace gd
{

/**
 * \brief Class representing an expression used as a parameter of a gd::Instruction.
 * This class is nothing more than a wrapper around a gd::String.
 *
 * \see gd::Instruction
 *
 * \ingroup Events
 */
class GD_CORE_API Expression
{
public:

    /**
     * \brief Construct an empty expression
     */
    Expression() {};

    /**
     * \brief Construct an expression from a string
     */
    Expression(gd::String plainString_) : plainString(plainString_) {};

    /**
     * \brief Construct an expression from a const char *
     */
    Expression(const char * plainString_) : plainString(plainString_) {};

    /**
     * \brief Get the plain string representing the expression
     */
    inline const gd::String & GetPlainString() const { return plainString; };

    /**
     * \brief Mimics std::string::c_str
     */
    inline const char * c_str() const { return plainString.c_str(); };

    virtual ~Expression() {};

private:

    gd::String plainString; ///<The expression string
};

}

#endif // GDCORE_EXPRESSION_H
