/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_INSTRUCTIONMETADATAHOLDER_H
#define GDCORE_INSTRUCTIONMETADATAHOLDER_H
#include <string>
#include "GDCore/Events/InstructionMetadata.h"

namespace gd
{

/**
 * \brief Deliver metadata for instructions
 *
 * \todo Enhance this class to avoid that each platform has to implement it.
 */
class GD_CORE_API InstructionMetadataHolder
{
public:
    InstructionMetadataHolder();
    virtual ~InstructionMetadataHolder();

    /**
     * Get information about an action from its type
     * Must work for object, automatisms and static actions.
     */
    virtual const InstructionMetadata & GetActionMetadata(std::string actionType) const;

    /**
     * Get information about a condition from its type
     * Must Work for object, automatisms and static conditions.
     */
    virtual const InstructionMetadata & GetConditionMetadata(std::string conditionType) const;

protected:
    static InstructionMetadata badInstructionMetadata;
};

}

#endif // GDCORE_INSTRUCTIONMETADATAHOLDER_H
