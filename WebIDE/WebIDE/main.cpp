
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCpp/CppPlatform.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDJS/JsPlatform.h"

using namespace emscripten;
using namespace gdjs;
using namespace gd;

namespace gd {
	void InitializePlatforms()
	{
		//TODO: Not sexy
		std::cout << "Initializing GDC++ platform" << std::endl;
		{
		    boost::shared_ptr<gd::Platform> platform(&CppPlatform::Get());
		    gd::PlatformManager::Get()->AddPlatform(platform);
	    }
		std::cout << "Initializing GDJS platform" << std::endl;
	    {
		    boost::shared_ptr<gd::Platform> platform(&JsPlatform::Get());
		    gd::PlatformManager::Get()->AddPlatform(platform);
	    }
		std::cout << "Platforms initialization ended." << std::endl;
	}
};

class ProjectHelper {
public:
	static gd::Project & CreateNewGDJSProject()
	{
		Project * project = new Project;
		project->AddPlatform(JsPlatform::Get());

		return *project;
	}

	static std::string DumpProjectXml(gd::Project & project)
	{
	    TiXmlDocument doc;
	    TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "ISO-8859-1", "" );
	    doc.LinkEndChild( decl );

	    TiXmlElement * root = new TiXmlElement( "Project" );
	    doc.LinkEndChild( root );

	    project.SaveToXml(root);

		TiXmlPrinter printer;
		doc.Accept( &printer );
		return printer.CStr();
	}

};

EMSCRIPTEN_BINDINGS(GD) {
    class_<ProjectHelper>("ProjectHelper")
	    .class_function("createNewGDJSProject", &ProjectHelper::CreateNewGDJSProject)
	    .class_function("dumpProjectXml", &ProjectHelper::DumpProjectXml)
	    ;

    function("initializePlatforms", &InitializePlatforms);
}


#if 0
int main(int argc, char const *argv[])
{
	std::cout << "* WebIDE!" << std::endl;
	std::cout << "* Chargement de la platform C++..." << std::endl;
	{
	    boost::shared_ptr<gd::Platform> platform(&CppPlatform::Get()); //TODO: Vilain hack
	    gd::PlatformManager::Get()->AddPlatform(platform);
    }
    {
	    boost::shared_ptr<gd::Platform> platform(&JsPlatform::Get()); //TODO: Vilain hack
	    gd::PlatformManager::Get()->AddPlatform(platform);
    }
/*
	std::cout << "* Essais..." << std::endl;

	gd::Project project;
	project.AddPlatform(CppPlatform::Get());

	gd::Layout & layout = project.InsertNewLayout("FirstLayout", 0);
	layout.InsertNewObject(project, "Sprite", "MyObject", 0);
	gd::Object & object = layout.GetObject("MyObject");

	gd::InitialInstance & instance = layout.GetInitialInstances().InsertNewInitialInstance();
	instance.SetX(42);
	instance.SetY(43);
	instance.SetObjectName("MyObject");

	layout.SetWindowDefaultTitle("Bien le bonjour");

	ProjectHelper::DumpProjectXml(project);*/

	return 0;
}
#endif