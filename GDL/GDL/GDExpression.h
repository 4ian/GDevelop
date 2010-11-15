#ifndef GDEXPRESSION_H
#define GDEXPRESSION_H

#include <string>
#include <vector>
#include <iostream>
#include <boost/shared_ptr.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/nvp.hpp>
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
 * Class representing an expression.
 * Hold the plain expression string, the functions to call
 * beforing evaluating the expression with a parser, .
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

        /**
         * Evaluate as a math expression and return the result
         */
        double GetAsMathExpressionResult(const RuntimeScene & scene,
                                         ObjectsConcerned & objectsConcerned,
                                         ObjSPtr obj1 = boost::shared_ptr<Object>( ),
                                         ObjSPtr obj2 = boost::shared_ptr<Object>( )) const
         {
            std::vector < double > parametersValues;

            for (unsigned int i = 0;i<mathExpressionFunctions.size();++i)
                parametersValues.push_back((mathExpressionFunctions[i].function)(scene, objectsConcerned, obj1, obj2, mathExpressionFunctions[i]));

            if ( parametersValues.empty() ) parametersValues.push_back(0);

            return mathExpression.Eval(&parametersValues[0]);
         }

        /**
         * Evaluate as a text expression and return the result
         */
        std::string GetAsTextExpressionResult(const RuntimeScene & scene,
                                              ObjectsConcerned & objectsConcerned,
                                              ObjSPtr obj1 = boost::shared_ptr<Object>( ),
                                              ObjSPtr obj2 = boost::shared_ptr<Object>( )) const
        {

            std::string result;
            for (unsigned int i = 0;i<textExpressionFunctions.size();++i)
                result += (textExpressionFunctions[i].function)(scene, objectsConcerned, obj1, obj2, textExpressionFunctions[i]);

            return result;
        }

        /**
         * Preprocess expressions in order to allow evaluation as text or math expression.
         */
        bool PrepareForEvaluation(const Game & game, const Scene & scene);

        /**
         * Preprocess the math expression, in order to allow its evaluation.
         */
        bool PrepareForMathEvaluationOnly(const Game & game, const Scene & scene);

        /**
         * Preprocess the text expression, in order to allow its evaluation.
         */
        bool PrepareForTextEvaluationOnly(const Game & game, const Scene & scene);

        #if defined(GDE)
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

        mutable GDMathParser  mathExpression; ///<Object representing the mathemathic expression to parse and evaluate.
        std::vector < ExpressionInstruction > mathExpressionFunctions; ///< The functions to call to generate the values of the parameters to pass to the mathematic expression when evaluating.
        bool            isMathExpressionPreprocessed; ///<Indicate if the functions to call and the mathematic expression have been generated.

        std::vector < StrExpressionInstruction > textExpressionFunctions; ///< The functions to call to generate the text
        bool            isTextExpressionPreprocessed; ///<Indicate if the functions to call have been generated.

        #if defined(GDE)
        std::string firstErrorStr;
        size_t firstErrorPos;
        #endif
};

std::string ExpToStr(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction);
double ExpToNumber(const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction);

#endif // GDEXPRESSION_H
