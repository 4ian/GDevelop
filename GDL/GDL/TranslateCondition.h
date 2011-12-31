/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef TRANSLATECONDITION_H
#define TRANSLATECONDITION_H

#include <string>
#include <vector>
#include <map>
#include "GDL/TextFormatting.h"
#include "GDL/Instruction.h"
#include <string>
#include <wx/bitmap.h>
class InstructionInfos;

using namespace std;

/**
 * Generate user friendly sentences and information from a condition
 */
class GD_API TranslateCondition
{
    public:

        /**
         * Create a sentence from a condition
         */
        static string Translate(const Instruction & condition, const InstructionInfos & infos);

        /**
         * Create a formatted sentence from a condition
         */
        static std::vector< std::pair<std::string, TextFormatting> > GetAsFormattedText(const Instruction & condition, const InstructionInfos & infos);

        /**
         * Add some HTML code around the parameter if needed
         */
        static TextFormatting GetFormattingFromType(const std::string & type);

        /**
         * Return the label of a button from parameter type
         */
        static string LabelFromType(const std::string & type);

        /**
         * Return the bitmap of a button from parameter type
         */
        static wxBitmap BitmapFromType(const string & type);

    protected:
    private:

        TranslateCondition() {};
        virtual ~TranslateCondition() {};
};

#endif // TRANSLATECONDITION_H

#endif
