/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Header de TranslateCondition.cpp
 */

#ifndef TRANSLATECONDITION_H
#define TRANSLATECONDITION_H

#include <string>
#include <vector>
#include <map>
#include "GDL/Instruction.h"
#include <wx/bitmap.h>
class InstructionInfos;

using namespace std;

class TranslateCondition
{
    public:
        static string Translate(const Instruction & condition, const InstructionInfos & infos, bool afficherPlus, bool useHTML = false);
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
