/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "HttpServer.h"
#include <stdio.h>
#include <string.h>
#include "mongoose/mongoose.h"

namespace gdjs
{

void HttpServer::Run(std::string indexDirectory)
{
    //Some options ( Last option must be NULL )
    const char *options[] = {"listening_ports", "2828", "document_root", indexDirectory.c_str(), NULL};

    //Setup callbacks, i.e. nothing to do :)
    struct mg_callbacks callbacks;
    memset(&callbacks, 0, sizeof(callbacks));

    ctx = mg_start(&callbacks, NULL, options);
}

void HttpServer::Stop()
{
    if ( ctx ) mg_stop(ctx);
}

HttpServer::~HttpServer()
{
    Stop();
}

}
#endif