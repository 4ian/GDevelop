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
#include <utility>
#include <wx/bitmap.h>
#include "GDL/Instruction.h"
#include "GDL/TextFormatting.h"
class InstructionInfos;

/**
 * \brief Generate user friendly sentences and information from an action
 */
class GD_API TranslateAction
{
    public:

        /**
         * Create a sentence from an action
         */
        string Translate(const Instruction & action, const InstructionInfos & infos);

        /**
         * Create a formatted sentence from an action
         */
        std::vector< std::pair<std::string, TextFormatting> > GetAsFormattedText(const Instruction & action, const InstructionInfos & infos);

        /**
         * Add some HTML code around the parameter if needed
         */
        TextFormatting GetFormattingFromType(const std::string & type);

        /**
         * Return the label of a button from parameter type
         */
        string LabelFromType(const std::string & type);

        /**
         * Return the bitmap of a button from parameter type
         */
        wxBitmap BitmapFromType(const std::string & type);

        void LoadTypesFormattingFromConfig();
        void SaveTypesFormattingToConfig();

        std::map<std::string, TextFormatting> typesFormatting;

        static TranslateAction *GetInstance()
        {
            if ( NULL == _singleton )
            {
                _singleton = new TranslateAction;
            }

            return ( static_cast<TranslateAction*>( _singleton ) );
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
        TranslateAction() {};
        virtual ~TranslateAction() {};
        static TranslateAction *_singleton;
};

#endif // TRANSLATEACTION_H

#endif
