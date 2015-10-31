#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/AbstractFileSystem.h"


void LaunchExternalEventsEditor(gd::Project & project, gd::Layout & layout) {
	gd::SerializerElement serializedProject;
	project.SerializeTo(serializedProject);

	gd::SerializerElement serializedLayout;
	layout.SerializeTo(serializedLayout);

	gd::NativeFileSystem & fs = gd::NativeFileSystem::Get();
	fs.WriteToFile("project.json", gd::Serializer::ToJSON(serializedProject));
	fs.WriteToFile("layout.json", gd::Serializer::ToJSON(serializedProject));
}
