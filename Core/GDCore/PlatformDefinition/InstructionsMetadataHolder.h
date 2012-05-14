/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_InstructionsMetadataHolder_H
#define GDCORE_InstructionsMetadataHolder_H
#include <string>
#include "GDCore/Events/InstructionMetadata.h"

namespace gd
{

/**
 * \brief Deliver metadata for instructions ( i.e. Actions and conditions )
 *
 * \todo Enhance this class to avoid that each platform has to implement it.
 */
class GD_CORE_API InstructionsMetadataHolder
{
public:
    InstructionsMetadataHolder();
    virtual ~InstructionsMetadataHolder();

    /**
     * Get information about an action from its type
     * Must work for object, automatisms and static actions.
     */
    virtual const gd::InstructionMetadata & GetActionMetadata(std::string actionType) const;

    /**
     * Get information about a condition from its type
     * Must Work for object, automatisms and static conditions.
     */
    virtual const gd::InstructionMetadata & GetConditionMetadata(std::string conditionType) const;

protected:
    static gd::InstructionMetadata badInstructionMetadata;
};

}

#endif // GDCORE_InstructionsMetadataHolder_H
