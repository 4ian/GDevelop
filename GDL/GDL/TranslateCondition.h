/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef TRANSLATECONDITION_H
#define TRANSLATECONDITION_H

#include <string>
#include <vector>
#include <map>
#include "GDL/Instruction.h"
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
         * Add some HTML code around the parameter if needed
         */
        static string AddHTMLToParameter(string & parameter, string type);

        /**
         * Make sure special characters ( <,>,& ) are transformed to their HTML equivalents.
         */
        static void RemoveHTMLTags(string & str);

        /**
         * Return the label of a button from parameter type
         */
        static string LabelFromType(string type);

        /**
         * Return the bitmap of a button from parameter type
         */
        static wxBitmap BitmapFromType(string type);

    protected:
    private:

        TranslateCondition() {};
        virtual ~TranslateCondition() {};
};

#endif // TRANSLATECONDITION_H

#endif
