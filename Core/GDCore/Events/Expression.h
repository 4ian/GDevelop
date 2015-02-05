/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_EXPRESSION_H
#define GDCORE_EXPRESSION_H
#include <string>

namespace gd
{

/**
 * \brief Class representing an expression used as a parameter of a gd::Instruction.
 * This class is nothing more than a wrapper around a std::string.
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
    Expression(std::string plainString_) : plainString(plainString_) {};

    /**
     * \brief Get the plain string representing the expression
     */
    inline const std::string & GetPlainString() const { return plainString; };

    virtual ~Expression() {};

private:

    std::string plainString; ///<The expression string
};

}

#endif // GDCORE_EXPRESSION_H
