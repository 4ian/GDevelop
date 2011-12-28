/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDEXPRESSION_H
#define GDEXPRESSION_H

#include <string>
#include <vector>
class Game;
class Scene;
class ParameterInfo;


/**
 * \brief Class representing an expression ( Used for example in parameters of Instruction ).
 */
class GD_API GDExpression
{
    public:
        GDExpression();
        GDExpression(std::string plainString_);
        virtual ~GDExpression() {};

        /**
         * Get the plain string representing the expression
         */
        inline const std::string & GetPlainString() const { return plainString; };

        /**
         * Get a number representing a comparision operator.
         */
        inline short int GetAsCompOperator() const { return compOperator; };

        /**
         * Get a number representing a modification operator.
         */
        inline short int GetAsModOperator() const { return modOperator; };

        /**
         * Get the expression as a boolean
         */
        inline bool GetAsBool() const { return boolEquivalent; };

        #if defined(GD_IDE_ONLY)
        std::string GetFirstErrorDuringPreprocessingText() { return firstErrorStr; };
        size_t GetFirstErrorDuringPreprocessingPosition() { return firstErrorPos; };
        #endif

        /**
         * Enumeration of available comparison operators
         */
        enum compOperator
        {
            Equal, Inferior, Superior, InferiorOrEqual, SuperiorOrEqual, Different, Undefined
        };

        /**
         * Enumeration of available modification operators
         */
        enum modOperator
        {
            Set, Add, Substract, Multiply, Divide, UndefinedModification
        };

    private:

        /**
         * Tool function to add a parameter
         */
        bool AddParameterToList(const Game & game, const Scene & scene, std::vector < GDExpression > & parameters, std::string parameterStr, std::vector < ParameterInfo > parametersInfos, const size_t positionInExpression);

        /**
         * Tool function to prepare a parameter
         */
        bool PrepareParameter(const Game & game, const Scene & scene, GDExpression & parameter, const ParameterInfo & parametersInfo, const size_t positionInExpression);

        std::string     plainString; ///<The plain expression
        char            compOperator; ///<Char representing a comparison operator. Computed at creation.
        char            modOperator; ///<Char representing a modification operator. Computed at creation.
        bool            boolEquivalent;

        #if defined(GD_IDE_ONLY)
        std::string firstErrorStr;
        size_t firstErrorPos;
        #endif
};

#endif // GDEXPRESSION_H
