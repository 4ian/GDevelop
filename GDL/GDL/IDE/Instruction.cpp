#if defined(GD_IDE_ONLY)

#include "GDL/IDE/Instruction.h"
#include "GDL/IDE/GDExpression.h"
#include <string>
#include <iostream>
#include <vector>
#include <assert.h>

using namespace std;

GDExpression Instruction::badExpression("");

Instruction::Instruction(string type_) :
renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false),
type(type_),
isLocal(true),
inverted(false)
{
    //ctor
    parameters.reserve(8);
}

Instruction::Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal_, bool inverted_) :
renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false),
type(type_),
isLocal(isLocal_),
inverted(inverted_),
parameters(parameters_)
{
    parameters.reserve(8);
}

Instruction::~Instruction()
{
    //dtor
}

void Instruction::SetParameter(unsigned int nb, const GDExpression & val)
{
    if ( nb >= parameters.size() )
    {
        cout << "Tentative d'écriture dans un paramètre invalide.\n\nCeci est peut être dû à un bug de Game Develop.\nReportez vous à l'aide pour savoir comment nous rapport une erreur.";
        return;
    }
    parameters[nb] = val;
}

#endif
