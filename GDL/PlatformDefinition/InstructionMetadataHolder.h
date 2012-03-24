/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef INSTRUCTIONMETADATAHOLDER_H
#define INSTRUCTIONMETADATAHOLDER_H
#include <string>
#include "GDCore/PlatformDefinition/InstructionMetadataHolder.h"

/**
 * \brief (Currently) A simple wrapper around ExtensionsManager ( which currently take care of instruction metadata ).
 */
class GD_API InstructionMetadataHolder : public gd::InstructionMetadataHolder
{
public:
    InstructionMetadataHolder();
    virtual ~InstructionMetadataHolder();

    /**
     * Get information about an action from its type
     * Works for object, automatisms and static actions.
     */
    virtual const InstructionMetadata & GetActionMetadata(std::string actionType) const;

    /**
     * Get information about a condition from its type
     * Works for object, automatisms and static conditions.
     */
    virtual const InstructionMetadata & GetConditionMetadata(std::string conditionType) const;
};

#endif // INSTRUCTIONMETADATAHOLDER_H
