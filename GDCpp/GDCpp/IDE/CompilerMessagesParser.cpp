/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#include "CompilerMessagesParser.h"
#include "GDCpp/CommonTools.h"
#include <iostream>

namespace GDpriv
{

void CompilerMessagesParser::ParseOutput(gd::String rawOutput)
{
    parsedMessages.clear();
    std::vector<std::string> output = SplitString<std::string>(rawOutput.ToUTF8(), '\n');

    for (unsigned int i = 0;i<output.size();++i)
    {
        CompilerMessage newMessage;

        //Parse file
        size_t fileEndPos = output[i].find_first_of(':', 2);
        if ( fileEndPos != gd::String::npos ) newMessage.file = gd::String::FromUTF8(output[i].substr(0, fileEndPos));

        //Get line
        size_t lineEndPos = gd::String::npos;
        if ( output[i].length()>fileEndPos && isdigit(output[i][fileEndPos+1]) )
        {
            lineEndPos = output[i].find_first_of(':', fileEndPos+1);
            if ( lineEndPos != gd::String::npos ) newMessage.line = ToInt(output[i].substr(fileEndPos+1, lineEndPos));
        }

        //Get column
        size_t colEndPos = gd::String::npos;
        if ( output[i].length()>lineEndPos && isdigit(output[i][lineEndPos+1]) )
        {
            colEndPos = output[i].find_first_of(':', lineEndPos+1);
            if ( colEndPos != gd::String::npos ) newMessage.column = ToInt(output[i].substr(lineEndPos+1, colEndPos));
        }

        if ( fileEndPos < output[i].length() )
            newMessage.message = gd::String::FromUTF8(output[i].substr(colEndPos != gd::String::npos ? colEndPos+1 : fileEndPos, output[i].length()));
        else
            newMessage.message = gd::String::FromUTF8(output[i]);

        if ( output[i].find("error") < output[i].length() ) newMessage.messageType = CompilerMessage::error;
        else newMessage.messageType = CompilerMessage::simple;

        parsedMessages.push_back(newMessage);
    }
}

}

#endif
