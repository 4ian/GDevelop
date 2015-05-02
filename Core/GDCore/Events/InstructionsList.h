/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#ifndef GDCORE_INSTRUCTIONSLIST_H
#define GDCORE_INSTRUCTIONSLIST_H

#include <memory>
#include <vector>

#include "GDCore/Events/Instruction.h"
#include "GDCore/Tools/SPtrList.h"

namespace gd
{

typedef SPtrList<gd::Instruction> InstructionsList;

}

#endif
