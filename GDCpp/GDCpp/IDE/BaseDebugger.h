/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef BASEDEBUGGER_H
#define BASEDEBUGGER_H
#include <SFML/System.hpp>

class RuntimeObject;

/**
 * \brief Internal base class to implement a debugger.
 * Derive from this class and implement
 * UpdateGUI function which be called
 * automatically by the scene
 */
class GD_API BaseDebugger
{
    public:
        BaseDebugger() {};
        virtual ~BaseDebugger() {};

        /**
         * Called at each frame by RuntimeScene
         */
        void Update();

        virtual void OnRuntimeObjectAdded(RuntimeObject * object) {};
        virtual void OnRuntimeObjectAboutToBeRemoved(RuntimeObject * object) {};

        virtual void OnRuntimeObjectListFullRefresh() {};

    protected:
    private:
        virtual void UpdateGUI() = 0;

        sf::Clock timeInterval;
};

#endif // BASEDEBUGGER_H
#endif
