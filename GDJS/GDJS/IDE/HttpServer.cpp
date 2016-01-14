/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "HttpServer.h"
#include <stdio.h>
#include <string.h>
#include "mongoose/mongoose.h"

namespace gdjs
{

void HttpServer::Run(gd::String indexDirectory)
{
    //Some options ( Last option must be NULL )
    std::string indexDirectoryLocale = indexDirectory.ToLocale();
    const char *options[] = {"listening_ports", "2828", "document_root", indexDirectoryLocale.c_str(), NULL};

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
