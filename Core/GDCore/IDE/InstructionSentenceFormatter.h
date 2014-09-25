/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY)
#ifndef TRANSLATEACTION_H
#define TRANSLATEACTION_H
#include <string>
#include <vector>
#include <map>
#include <utility>
class wxBitmap;
#include "GDCore/Events/Instruction.h"
#include "GDCore/IDE/TextFormatting.h"
namespace gd { class InstructionMetadata;}

namespace gd
{

/**
 * \brief Generate user friendly sentences and information from an action.
 */
class GD_CORE_API InstructionSentenceFormatter
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

    #if !defined(GD_NO_WX_GUI)
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
    #endif

    std::map<std::string, gd::TextFormatting> typesFormatting;

    static InstructionSentenceFormatter *Get()
    {
        if ( NULL == _singleton )
        {
            _singleton = new InstructionSentenceFormatter;
        }

        return ( static_cast<InstructionSentenceFormatter*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

    virtual ~InstructionSentenceFormatter() {};
private:
    InstructionSentenceFormatter() {};
    static InstructionSentenceFormatter *_singleton;
};


}
#endif // TRANSLATEACTION_H
#endif
