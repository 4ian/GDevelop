/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LAYER_H
#define LAYER_H
#include <string>
#include <vector>
#include <SFML/Graphics.hpp>
#include "GDL/Camera.h"

using namespace std;

/**
 * \brief Represents a layer of a scene. Contains cameras.
 * During runtime, RuntimeLayers are used instead of simple Layer.
 */
class GD_API Layer
{
    public:
        Layer();
        virtual ~Layer() {};

        /**
         * Change layer name
         */
        inline void SetName(const string & name_) { name = name_; }

        /**
         * Get layer name
         */
        inline const string & GetName() const { return name; }

        /**
         * Change if layer is displayed or not
         */
        inline void SetVisibility(bool isVisible_) { isVisible = isVisible_; }

        /**
         * True if layer will be displayed.
         */
        inline bool GetVisibility() const { return isVisible; }

        /**
         * Change cameras count, automatically adding/removing them.
         */
        inline void SetCamerasNumber(unsigned int n)
        {
            while ( cameras.size() < n)
                cameras.push_back(Camera());

            while ( cameras.size() > n)
                cameras.erase(cameras.begin()+cameras.size()-1);
        }

        /**
         * Get cameras count.
         */
        inline unsigned int GetCamerasNumber() const { return cameras.size(); };

        inline const Camera & GetCamera(unsigned int n) const { if ( n >= GetCamerasNumber() ) return badCamera; return cameras[n]; }
        inline Camera & GetCamera(unsigned int n) { if ( n >= GetCamerasNumber() ) return badCamera; return cameras[n]; }

        /**
         * Delete a camera.
         */
        inline void DeleteCamera(unsigned int n) { if ( n >= GetCamerasNumber() ) return; cameras.erase(cameras.begin()+n); }

    private:

        string name;
        bool isVisible;
        vector < Camera > cameras;

        string followLayer;

        static Camera badCamera;
};

#endif // LAYER_H
