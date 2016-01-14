/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/String.h"
namespace gd { class SerializerElement; }

namespace gd
{

/**
 * \brief Used to send anonymous usage data to do
 * analytics on how is used GDevelop.
 */
class GD_CORE_API AnalyticsSender
{
public:
	void SendProgramOpening();
	void SendNewGameCreated(gd::String platformName, gd::String templateName);

    static AnalyticsSender *Get();
    static void DestroySingleton();

private:
    AnalyticsSender();
    virtual ~AnalyticsSender() {};
	void SendData(gd::String collection, gd::SerializerElement & data);

    const gd::String projectId;
    const gd::String writeKey;
    static AnalyticsSender *_singleton;
};

}
