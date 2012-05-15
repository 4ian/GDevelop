/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TRANSLATECONDITION_H
#define TRANSLATECONDITION_H
#include <string>
#include <vector>
#include <map>
#include "GDCore/IDE/TextFormatting.h"
#include "GDCore/Events/Instruction.h"
#include <wx/bitmap.h>
namespace gd { class InstructionMetadata; }

namespace gd
{

/**
 * \brief Generate user friendly sentences and information from a condition.
 *
 * Implementation of the class is largely based on calls to gd::ActionSentenceFormatter.
 * \see gd::ActionSentenceFormatter
 */
class GD_CORE_API ConditionSentenceFormatter
{
public:

    /**
     * \brief Create a sentence from a condition
     */
    static std::string Translate(const gd::Instruction & condition, const gd::InstructionMetadata & infos);

    /**
     * \brief Create a formatted sentence from a condition
     */
    static std::vector< std::pair<std::string, TextFormatting> > GetAsFormattedText(const gd::Instruction & condition, const gd::InstructionMetadata & infos);

    /**
     * \brief Return the TextFormatting object associated to the \a type.
     */
    static TextFormatting GetFormattingFromType(const std::string & type);

    /**
     * \brief Return the label of a button from parameter type
     */
    static std::string LabelFromType(const std::string & type);

    /**
     * \brief Return the bitmap of a button from parameter type
     */
    static wxBitmap BitmapFromType(const std::string & type);

private:
    ConditionSentenceFormatter() {};
    virtual ~ConditionSentenceFormatter() {};
};

}

#endif // TRANSLATECONDITION_H
