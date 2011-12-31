/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef INSTRUCTION_H
#define INSTRUCTION_H
#include <string>
#include <vector>
#include <iostream>
#include "GDL/GDExpression.h"

using namespace std;

/**
 * \brief An instruction is a member of an event. It can be a condition or an action.
 *
 * Instructions have a type, which is used to link the Instruction to a function.
 */
class GD_API Instruction
{
    public:

        Instruction(string type_ = "");
        Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal = true , bool pContraire = false);
        virtual ~Instruction();

        /** Access type
         * \return The type of the instruction
         */
        string GetType() const { return type; }

        /** Set type
         * \param val New value to set
         */
        void SetType(string val) { type = val; }

        /** Is the instruction local ( default ) ?
         * \return true if instruction is local
         */
        bool IsLocal() const { return isLocal; }

        /** Is the instruction global ?
         * \return true if instruction is global
         */
        bool IsGlobal() const { return !isLocal; }

        /** Set the instruction local ( default ) or not.
         * \param val New value to set
         */
        void SetLocal(bool val) { isLocal = val; }

        /** Is the instruction inverted ?
         * \return The current value of contraire
         */
        bool IsInverted() const { return inverted; }

        /** Set if the instruction is inverted or not.
         * \param val New value to set
         */
        void SetInversion(bool val) { inverted = val; }

        /** Access parameters
         * \return A vector of string containing parameters
         */
        inline const vector < GDExpression > & GetParameters() const { return parameters; }

        /** Access a parameter
         * \return The current value of the parameter
         */
        inline const GDExpression & GetParameter(unsigned int nb) const { return parameters[nb]; }

        /** Access a parameter
         * \return The current value of the parameter
         */
        inline GDExpression & GetParameter(unsigned int nb) { return parameters[nb]; }

        /** Access a parameter. Return a bad expression if the parameter requested does not exists.
         * \return The current value of the parameter
         */
        inline const GDExpression & GetParameterSafely(unsigned int nb) const
        {
            if ( nb >= parameters.size() )
                return badExpression;

            return parameters[nb];
        }

        /** Access a parameter. Return a bad expression if the parameter requested does not exists.
         * \return The current value of the parameter
         */
        inline GDExpression & GetParameterSafely(unsigned int nb)
        {
            if ( nb >= parameters.size() )
                return badExpression;

            return parameters[nb];
        }

        /** Set parameters
         * \param val A vector of string containing the parameters
         */
        inline void SetParameters(const vector < GDExpression > & val) { parameters = val; }

        /** Set parameter
         * \param nb The parameter number
         * \param val The new value of the parameter
         */
        void SetParameter(unsigned int nb, const GDExpression & val);

        /**
         * Return a reference to the vector containing sub instructions
         */
        inline const vector < Instruction > & GetSubInstructions() const { return subInstructions; };

        /**
         * Return a reference to the vector containing sub instructions
         */
        inline vector < Instruction > & GetSubInstructions() { return subInstructions; };

        /**
         * Change sub instructions
         */
        inline void SetSubInstructions(const vector < Instruction > & subInstructions_) { subInstructions = subInstructions_; };

        #if defined(GD_IDE_ONLY)
        mutable bool renderedHeightNeedUpdate;
        mutable unsigned int renderedHeight; ///<Height of the instruction rendered in an event editor
        mutable bool selected; ///<True if selected in an event editor
        #endif

    private:
        string type;
        bool isLocal;
        bool inverted;
        mutable vector < GDExpression > parameters;

        vector < Instruction > subInstructions;

        static GDExpression badExpression;
};

#endif // INSTRUCTION_H
