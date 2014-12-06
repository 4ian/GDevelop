/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
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
	void SendNewGameCreated(std::string platformName, std::string templateName);

    static AnalyticsSender *Get();
    static void DestroySingleton();

private:
    AnalyticsSender();
    virtual ~AnalyticsSender() {};
	void SendData(std::string collection, gd::SerializerElement & data);

    const std::string projectId;
    const std::string writeKey;
    static AnalyticsSender *_singleton;
};

}
