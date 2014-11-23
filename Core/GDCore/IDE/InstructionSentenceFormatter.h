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
 * \brief Generate user friendly sentences and information from an action or condition metadata.
 */
class GD_CORE_API InstructionSentenceFormatter
{
public:

    /**
     * \brief Create a sentence from an instruction and its metadata.
     *
     * Sentence is provided in the gd::InstructionMetadata passed as parameter.
     * Parameters placeholders ("_PARAMx_", x being the parameter index) are replaced
     * by their values stored in the isntruction passed as parameter.
     */
    std::string Translate(const gd::Instruction & instr, const gd::InstructionMetadata & metadata);

    /**
     * \brief Create a formatted sentence from an instruction and its metadata.
     */
    std::vector< std::pair<std::string, gd::TextFormatting> > GetAsFormattedText(const gd::Instruction & instr, const gd::InstructionMetadata & metadata);

    /**
     * \brief Return the TextFormatting object associated to the \a type.
     */
    TextFormatting GetFormattingFromType(const std::string & type);

    /**
     * \brief Return the label of a parameter type
     */
    std::string LabelFromType(const std::string & type);

    /**
     * \brief Load the configuration from the default configuration,
     * or saved configuration if one was saved with wxWidgets.
     */
    void LoadTypesFormattingFromConfig();

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Return the bitmap of a button from parameter type
     */
    wxBitmap BitmapFromType(const std::string & type);

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
