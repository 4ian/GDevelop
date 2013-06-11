/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "HttpServer.h"
#include <stdio.h>
#include <string.h>
#include "mongoose/mongoose.h"

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
