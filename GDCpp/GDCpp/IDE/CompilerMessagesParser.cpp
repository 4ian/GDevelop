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
    std::vector<gd::String> output = rawOutput.Split(U'\n');

    for (unsigned int i = 0;i<output.size();++i)
    {
        CompilerMessage newMessage;

        //Parse file
        size_t fileEndPos = output[i].find_first_of(gd::String(':'), 2);
        if ( fileEndPos != gd::String::npos ) newMessage.file = output[i].substr(0, fileEndPos);

        //Get line
        size_t lineEndPos = gd::String::npos;
        if ( output[i].length()>fileEndPos && isdigit(output[i][fileEndPos+1]) )
        {
            lineEndPos = output[i].find_first_of(gd::String(':'), fileEndPos+1);
            if ( lineEndPos != gd::String::npos ) newMessage.line = output[i].substr(fileEndPos+1, lineEndPos).ToInt();
        }

        //Get column
        size_t colEndPos = gd::String::npos;
        if ( output[i].length()>lineEndPos && isdigit(output[i][lineEndPos+1]) )
        {
            colEndPos = output[i].find_first_of(gd::String(':'), lineEndPos+1);
            if ( colEndPos != gd::String::npos ) newMessage.column = output[i].substr(lineEndPos+1, colEndPos).ToInt();
        }

        if ( fileEndPos < output[i].length() )
            newMessage.message = output[i].substr(colEndPos != gd::String::npos ? colEndPos+1 : fileEndPos, output[i].length());
        else
            newMessage.message = output[i];

        if ( output[i].find("error") < output[i].length() ) newMessage.messageType = CompilerMessage::error;
        else newMessage.messageType = CompilerMessage::simple;

        parsedMessages.push_back(newMessage);
    }
}

}

#endif
