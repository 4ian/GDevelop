/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(EMSCRIPTEN)
#include "Embind.h"
#include <emscripten/bind.h>
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include <set>

using namespace emscripten;
using namespace gd;

namespace gd
{
namespace internal {
    template<typename SetType>
    struct SetAccess {
        static val has(
            const SetType& s,
            typename SetType::value_type value
        ) {
            return val(s.find(value) != s.end());
        }
    };
}

/**
 * Utility function used to expose a std::set to Embind.
 */
template<typename T>
class_<std::set<T> > register_set(const char* name) {
    typedef std::set<T> SetType;

    return class_<std::set<T> >(name)
        .template constructor<>()
        //.function("insert", &SetType::insert)
        .function("size", &SetType::size)
        .function("has", &internal::SetAccess<SetType>::has)
        ;
}

namespace internal {
    template<typename MapType>
    struct MapKeys {
        static std::vector<typename MapType::key_type> keys(
            const MapType& m
        ) {
            std::vector<typename MapType::key_type> allKeys;
            for(typename MapType::const_iterator it = m.begin(); it != m.end(); ++it)
                allKeys.push_back(it->first);

            return allKeys;
        }
    };
}

/**
 * Utility function used to expose extra functions for std::map.
 */
template<typename T, typename U>
class_<std::map<T, U> > register_map_extra(class_<std::map<T, U> > theMap) {
    typedef std::map<T, U> MapType;

    return theMap
        .function("keys", &internal::MapKeys<MapType>::keys)
        ;
}
}

EMSCRIPTEN_BINDINGS(gd_std_wrappers) {
    register_vector<std::string>("VectorString");
    register_set<std::string>("SetString");
    register_map_extra(register_map<std::string, std::string>("MapStringString"));
    register_map_extra(register_map<std::string, gd::EventMetadata>("MapStringEventMetadata"));
    register_map_extra(register_map<std::string, gd::InstructionMetadata>("MapStringInstructionMetadata"));
    register_map_extra(register_map<std::string, gd::ExpressionMetadata>("MapStringExpressionMetadata"));
    register_map_extra(register_map<std::string, gd::StrExpressionMetadata>("MapStringStrExpressionMetadata"));
    register_map_extra(register_map<std::string, gd::PropertyDescriptor>("MapStringPropertyDescriptor"));

}

#endif