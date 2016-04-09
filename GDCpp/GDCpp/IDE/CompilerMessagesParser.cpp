/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#include "CompilerMessagesParser.h"
#include "GDCpp/Runtime/CommonTools.h"
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
        std::vector<gd::String> columns = output[i].Split(U':');

        if (columns.size() >= 3)
        {
            newMessage.file = columns[0];
            newMessage.line = columns[1].To<int>();
            newMessage.column = columns[2].To<int>();
        }
        if (!columns.empty()) newMessage.message = columns.back();

        if ( output[i].find("error") < output[i].length() )
            newMessage.messageType = CompilerMessage::error;
        else
            newMessage.messageType = CompilerMessage::simple;

        parsedMessages.push_back(newMessage);
    }
}

}

#endif
