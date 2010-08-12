/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

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
        static string Translate(const Instruction & condition, const InstructionInfos & infos);
        static string AddHTMLToParameter(string & parameter, string type);
        static void RemoveHTMLTags(string & str);

        static string LabelFromType(string type);
        static wxBitmap BitmapFromType(string type);

    protected:
    private:

        TranslateCondition() {};
        virtual ~TranslateCondition() {};
};

#endif // TRANSLATECONDITION_H

#endif
