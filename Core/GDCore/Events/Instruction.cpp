/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Expression.h"
#include <string>
#include <iostream>
#include <vector>
#include <assert.h>

using namespace std;

namespace gd
{

gd::Expression Instruction::badExpression("");

Instruction::Instruction(string type_) :
renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false),
type(type_),
inverted(false)
{
    //ctor
    parameters.reserve(8);
}

Instruction::Instruction(string type_, const vector <gd::Expression> & parameters_, bool inverted_) :
renderedHeightNeedUpdate(true),
renderedHeight(0),
selected(false),
type(type_),
inverted(inverted_),
parameters(parameters_)
{
    parameters.reserve(8);
}

const gd::Expression & Instruction::GetParameter(unsigned int index) const
{
    if ( index >= parameters.size() ) return badExpression;

    return parameters[index];
}

gd::Expression & Instruction::GetParameter(unsigned int index)
{
    if ( index >= parameters.size() )  return badExpression;

    return parameters[index];
}

void Instruction::SetParametersCount(unsigned int size)
{
    while(size < parameters.size())
        parameters.erase(parameters.begin()+parameters.size()-1);
    while(size > parameters.size())
        parameters.push_back(gd::Expression(""));
}

Instruction::~Instruction()
{
    //dtor
}

void Instruction::SetParameter(unsigned int nb, const gd::Expression & val)
{
    if ( nb >= parameters.size() )
    {
        cout << "Trying to write an out of bound parameter.\n\n" << std::endl;
        return;
    }
    parameters[nb] = val;
}


}
