/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "InstructionMetadataHolder.h"
#include <string>

namespace gd
{
InstructionMetadata InstructionMetadataHolder::badInstructionMetadata;

InstructionMetadataHolder::InstructionMetadataHolder()
{
    //ctor
}

InstructionMetadataHolder::~InstructionMetadataHolder()
{
    //dtor
}

const InstructionMetadata & InstructionMetadataHolder::GetActionMetadata(std::string actionType) const
{
    return badInstructionMetadata;
}

const InstructionMetadata & InstructionMetadataHolder::GetConditionMetadata(std::string conditionType) const
{
    return badInstructionMetadata;
}

}
