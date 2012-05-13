/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef GDEXPRESSION_H
#define GDEXPRESSION_H
#include <string>

/**
 * \brief Class representing an expression used as a parameters of Instruction.
 * This class is currently nothing more than a std::string.
 *
 * \see Instruction
 *
 * \ingroup Events
 */
class GD_CORE_API GDExpression
{
    public:

        /**
         * Construct an empty expression
         */
        GDExpression() {};

        /**
         * Construct an expression from a string
         */
        GDExpression(std::string plainString_) : plainString(plainString_) {};

        /**
         * Get the plain string representing the expression
         */
        inline const std::string & GetPlainString() const { return plainString; };

        virtual ~GDExpression() {};

    private:

        std::string plainString; ///<The plain expression
};

#endif // GDEXPRESSION_H

#endif
