/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#ifndef BASEDEBUGGER_H
#define BASEDEBUGGER_H
#include <SFML/System.hpp>

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

    protected:
    private:
        virtual void UpdateGUI() = 0;

        sf::Clock timeInterval;
};

#endif // BASEDEBUGGER_H
#endif
