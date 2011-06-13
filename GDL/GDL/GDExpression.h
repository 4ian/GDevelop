/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDEXPRESSION_H
#define GDEXPRESSION_H

#include <string>
#include <vector>
#include <iostream>
#include <boost/shared_ptr.hpp>
#include "GDL/GDMathParser.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
class Object;
class RuntimeScene;
class ObjectsConcerned;
class Game;
class ParameterInfo;
class Scene;

typedef boost::shared_ptr<Object> ObjSPtr;


/**
 * \brief Class representing an expression ( Used for example in parameters of Instruction ).
 *
 * Hold the plain expression string, the functions to call
 * beforing evaluating the expression with a parser, the value of the expression as an operator...
 * All of these values can be used thanks to GetAs[...] members functions.
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

        /**
         * Get the object identifier representing the object
         */
        inline unsigned int GetAsObjectIdentifier() const { return oID; }

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
        unsigned int    oID; ///< Object identifier, if expression contains an object name. Computed at creation..
        bool            boolEquivalent;

        #if defined(GD_IDE_ONLY)
        std::string firstErrorStr;
        size_t firstErrorPos;
        #endif
};

#endif // GDEXPRESSION_H
