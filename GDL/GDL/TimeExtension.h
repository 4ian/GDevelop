/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H

#include "GDL/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing time features.
 */
class TimeExtension : public ExtensionBase
{
    public:
        TimeExtension();
        virtual ~TimeExtension() {};

        bool HasDebuggingProperties() const { return true; };
        void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const;
        bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue);
        unsigned int GetNumberOfProperties(RuntimeScene & scene) const;

    private:
};

#endif // TIMEEXTENSION_H
