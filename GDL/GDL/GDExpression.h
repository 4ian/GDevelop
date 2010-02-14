#ifndef GDEXPRESSION_H
#define GDEXPRESSION_H

#include <string>
#include <vector>
#include <iostream>
#include "GDL/fparser/fparser.hh"
#include <boost/shared_ptr.hpp>
#include "GDL/ExpressionInstruction.h"
#include "GDL/ObjectIdentifiersManager.h"
class Object;
class RuntimeScene;
class ObjectsConcerned;

typedef boost::shared_ptr<Object> ObjSPtr;


/**
 * Class representing an expression.
 * Hold the plain expression string, the functions to call
 * beforing evaluating the expression with a parser, .
 */
class GD_API GDExpression
{
    public:
        GDExpression(std::string plainString_);
        virtual ~GDExpression();

        /**
         * Get the plain string representing the expression
         */
        inline std::string GetPlainString() const { return plainString; };

        /**
         * Get a number representing a comparision operator.
         */
        inline short int GetAsCompOperator() const { return compOperator; };

        /**
         * Get a number representing a modification operator.
         */
        inline short int GetAsModOperator() const { return modOperator; };

        inline unsigned int GetAsObjectIdentifier() const
        {
            if ( !oIDcomputed )
            {
                ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
                oID = objectIdentifiersManager->GetOIDfromName(plainString);
            }

            return oID;
        }

        /**
         * Parse the formula with the parameters in mathExpression.
         */
        inline int ParseMathExpression(std::string formula, std::string parameters)
        {
            return mathExpression.Parse(formula, parameters);
        }

        /**
         * Evaluate mathExpression with theses parameters.
         * Must have preprocessed ( parsed ) the mathExpression before,
         * and constructed a array of paremeters thanks to mathExpressionFunctions.
         */
        inline double EvalMathExpression(const double * parametersValues)
        {
            return mathExpression.Eval(parametersValues);
        }

        /**
         * Remove all functions to call to evaluate parameters of mathExpression.
         * Only do this before (re)parsing the math expression.
         */
        inline void ClearMathExprFunctions() { mathExpressionFunctions.clear(); }

        /**
         * Add a function to call to evaluate parameters of mathExpression.
         */
        inline void AddMathExprFunction(const ExpressionInstruction & exprInstruction) { mathExpressionFunctions.push_back(exprInstruction); };

        /**
         * Get the functions to call to evaluate parameters of mathExpression.
         */
        inline const std::vector < ExpressionInstruction > & GetMathExprFunctions() const { return mathExpressionFunctions; }

        inline bool IsPreprocessed() const { return isPreprocessed; }
        inline void SetPreprocessed() { isPreprocessed = true; }

        enum compOperator
        {
            Equal, Inferior, Superior, InferiorOrEqual, SuperiorOrEqual, Different, Undefined
        };

        enum modOperator
        {
            Set, Add, Substract, Multiply, Divide, UndefinedModification
        };


    protected:
    private:

        std::string     plainString; ///<The plain expression
        char            compOperator; ///<Char representing a comparison operator. Computed at creation.
        char            modOperator; ///<Char representing a modification operator. Computed at creation.
        mutable unsigned int    oID; ///< Object identifier, if expression contains an object name.
        mutable bool    oIDcomputed;

        FunctionParser  mathExpression; ///<Object representing the mathemathic expression to parse and evaluate.
        std::vector < ExpressionInstruction > mathExpressionFunctions; ///< The functions to call to generate the values of the parameters to pass to the mathematic expression when evaluating.
        bool            isPreprocessed; ///<Indicate if the functions to call and the mathematic expression have been preprocessed.

};

#endif // GDEXPRESSION_H
