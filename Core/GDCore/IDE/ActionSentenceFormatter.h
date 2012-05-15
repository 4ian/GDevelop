/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TRANSLATEACTION_H
#define TRANSLATEACTION_H
#include <string>
#include <vector>
#include <map>
#include <utility>
#include <wx/bitmap.h>
#include "GDCore/Events/Instruction.h"
#include "GDCore/IDE/TextFormatting.h"
namespace gd { class InstructionMetadata;}

namespace gd
{

/**
 * \brief Generate user friendly sentences and information from an action.
 */
class GD_CORE_API ActionSentenceFormatter
{
public:

    /**
     * \brief Create a sentence from an action
     */
    std::string Translate(const gd::Instruction & action, const gd::InstructionMetadata & infos);

    /**
     * \brief Create a formatted sentence from an action
     */
    std::vector< std::pair<std::string, gd::TextFormatting> > GetAsFormattedText(const gd::Instruction & action, const gd::InstructionMetadata & infos);

    /**
     * \brief Return the TextFormatting object associated to the \a type.
     */
    TextFormatting GetFormattingFromType(const std::string & type);

    /**
     * \brief Return the label of a button from parameter type
     */
    std::string LabelFromType(const std::string & type);

    /**
     * \brief Return the bitmap of a button from parameter type
     */
    wxBitmap BitmapFromType(const std::string & type);

    /**
     * Load the configuration from wxConfigBase
     */
    void LoadTypesFormattingFromConfig();

    /**
     * Save the configuration to wxConfigBase
     */
    void SaveTypesFormattingToConfig();

    std::map<std::string, gd::TextFormatting> typesFormatting;

    static ActionSentenceFormatter *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new ActionSentenceFormatter;
        }

        return ( static_cast<ActionSentenceFormatter*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    ActionSentenceFormatter() {};
    virtual ~ActionSentenceFormatter() {};
    static ActionSentenceFormatter *_singleton;
};


}
#endif // TRANSLATEACTION_H
