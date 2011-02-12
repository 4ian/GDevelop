/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef TRANSLATEACTION_H
#define TRANSLATEACTION_H

#include <string>
#include <vector>
#include <map>
#include <wx/bitmap.h>
#include "GDL/Instruction.h"
class InstructionInfos;

using namespace std;

/**
 * \brief Generate user friendly sentences and information from an action
 */
class GD_API TranslateAction
{
    public:

        /**
         * Create a sentence from an action
         */
        static string Translate(const Instruction & action, const InstructionInfos & infos);

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

    private:
        TranslateAction() {};
        virtual ~TranslateAction() {};
};

#endif // TRANSLATEACTION_H

#endif
