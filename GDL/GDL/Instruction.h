#ifndef INSTRUCTION_H
#define INSTRUCTION_H
#include <string>
#include <vector>
#include <iostream>
class RuntimeScene;
class Evaluateur;
class ObjectsConcerned;
class Object;
#include "GDL/GDExpression.h"

using namespace std;

class GD_API Instruction
{
    public:

        Instruction(string type_);
        Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal);
        Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal, bool pContraire);
        Instruction();

        //Main function to be called
        typedef bool (*ptrFunction)( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & instruction, const Evaluateur & eval );
        ptrFunction function;

        //Function to call on each object, if the instruction need one.
        typedef bool (Object::*ptrObjectFunction)( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & instruction, const Evaluateur & eval );
        ptrObjectFunction objectFunction;

        virtual ~Instruction();
        /** Access type
         * \return The type of the instruction
         */
        string GetType() const { return type; }
        /** Set type
         * \param val New value to set
         */
        void SetType(string val) { type = val; }

        /** Access objectFunctionType
         * \return The objectFunctionType of the instruction
         */
        inline string GetObjectFunctionType() const { return objectFunctionType; }
        /** Set objectFunctionType
         * \param val New value to set
         */
        inline void SetObjectFunctionType(string val) { objectFunctionType = val; }

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
        inline GDExpression & GetParameter(int nb) const
        {
            if ( nb < 0 || static_cast<unsigned>(nb) >= parameters.size() )
            {
                #ifndef RELEASE
                    std::cout << "Paramètre invalide demandé";
                    #ifdef DEBUG
                        //throw("");
                    #endif
                #endif
                return badExpression;
            }

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

    private:
        string type;
        string objectFunctionType;
        bool isLocal;
        bool inverted;
        mutable vector < GDExpression > parameters;

        static GDExpression badExpression;
};

#endif // INSTRUCTION_H
