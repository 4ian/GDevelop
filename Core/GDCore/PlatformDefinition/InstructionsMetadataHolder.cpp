/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "InstructionsMetadataHolder.h"
#include <string>

namespace gd
{
InstructionMetadata InstructionsMetadataHolder::badInstructionMetadata;

InstructionsMetadataHolder::InstructionsMetadataHolder()
{
    //ctor
}

InstructionsMetadataHolder::~InstructionsMetadataHolder()
{
    //dtor
}

const InstructionMetadata & InstructionsMetadataHolder::GetActionMetadata(std::string actionType) const
{
    return badInstructionMetadata;
}

const InstructionMetadata & InstructionsMetadataHolder::GetConditionMetadata(std::string conditionType) const
{
    return badInstructionMetadata;
}

}
