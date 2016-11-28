#ifndef TRANSLATABLESTRINGSFINDER_H
#define TRANSLATABLESTRINGSFINDER_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <memory>
#include <set>
#include <vector>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/Project/Project.h"

namespace gd
{

class GD_CORE_API TranslatableStringsFinder
{
public:
	static std::set<gd::String> GetTranslatableStrings(gd::Project & project);
};

class GD_CORE_API EventsListTranslatableStringsFinder : public ArbitraryEventsWorker
{
public:
	EventsListTranslatableStringsFinder(const gd::Project & project, std::set<gd::String> & translatableStrings);

protected:
	bool DoVisitInstruction(gd::Instruction & instruction, bool isCondition) override;

private:
	void FindTranslatable(gd::Instruction & instruction, const gd::InstructionMetadata & metadata);

	const gd::Project & project;
	std::vector< std::shared_ptr<gd::PlatformExtension> > allGameExtensions;

	std::set<gd::String> & translatableStrings;
};

}

#endif

#endif
