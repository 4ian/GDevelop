/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "CompilerMessagesParser.h"
#include "GDCpp/CommonTools.h"
#include <iostream>

namespace GDpriv
{

void CompilerMessagesParser::ParseOutput(std::string rawOutput)
{
    parsedMessages.clear();
    std::vector<std::string> output = SplitString<std::string>(rawOutput, '\n');

    for (unsigned int i = 0;i<output.size();++i)
    {
        CompilerMessage newMessage;

        //Parse file
        size_t fileEndPos = output[i].find_first_of(':', 2);
        if ( fileEndPos != std::string::npos ) newMessage.file = output[i].substr(0, fileEndPos);

        //Get line
        size_t lineEndPos = std::string::npos;
        if ( output[i].length()>fileEndPos && isdigit(output[i][fileEndPos+1]) )
        {
            lineEndPos = output[i].find_first_of(':', fileEndPos+1);
            if ( lineEndPos != std::string::npos ) newMessage.line = ToInt(output[i].substr(fileEndPos+1, lineEndPos));
        }

        //Get column
        size_t colEndPos = std::string::npos;
        if ( output[i].length()>lineEndPos && isdigit(output[i][lineEndPos+1]) )
        {
            colEndPos = output[i].find_first_of(':', lineEndPos+1);
            if ( colEndPos != std::string::npos ) newMessage.column = ToInt(output[i].substr(lineEndPos+1, colEndPos));
        }

        if ( fileEndPos < output[i].length() )
            newMessage.message = output[i].substr(colEndPos != std::string::npos ? colEndPos+1 : fileEndPos, output[i].length());
        else
            newMessage.message = output[i];

        if ( output[i].find("error") < output[i].length() ) newMessage.messageType = CompilerMessage::error;
        else newMessage.messageType = CompilerMessage::simple;

        parsedMessages.push_back(newMessage);
    }
}

}

#endif

