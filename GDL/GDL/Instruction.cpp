#include "GDL/Instruction.h"
#include <string>
#include <iostream>
#include <vector>
#include <assert.h>
#include "GDL/GDExpression.h"

using namespace std;

GDExpression Instruction::badExpression("");

Instruction::Instruction(string type_) :
function(NULL),
objectFunction(NULL),
type(type_),
isLocal(true),
inverted(false)
#if defined(GDE)
,renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false)
#endif
{
    //ctor
    parameters.reserve(8);
}

Instruction::Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal_) :
function(NULL),
objectFunction(NULL),
type(type_),
isLocal(isLocal_),
inverted(false),
parameters(parameters_)
#if defined(GDE)
,renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false)
#endif
{
    parameters.reserve(8);
}

Instruction::Instruction(string type_, const vector <GDExpression> & parameters_, bool isLocal_, bool inverted_) :
function(NULL),
objectFunction(NULL),
type(type_),
isLocal(isLocal_),
inverted(inverted_),
parameters(parameters_)
#if defined(GDE)
,renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false)
#endif
{
    parameters.reserve(8);
}

Instruction::Instruction() :
function(NULL),
objectFunction(NULL),
isLocal(true),
inverted(false)
#if defined(GDE)
,renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false)
#endif
{
    //ctor
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
