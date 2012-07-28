/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LAYER_H
#define LAYER_H
#include <string>
#include <vector>
#include "GDL/Camera.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Layer.h"
#endif

/**
 * \brief Represents a layer of a scene. Contains cameras.
 *
 * \ingroup GameEngine
 */
class GD_API Layer
#if defined(GD_IDE_ONLY)
: public gd::Layer
#endif
{
public:
    Layer();
    virtual ~Layer() {};

    /**
     * Change layer name
     */
    virtual void SetName(const std::string & name_) { name = name_; }

    /**
     * Get layer name
     */
    virtual const std::string & GetName() const { return name; }

    /**
     * Change if layer is displayed or not
     */
    virtual void SetVisibility(bool isVisible_) { isVisible = isVisible_; }

    /**
     * True if layer will be displayed.
     */
    virtual bool GetVisibility() const { return isVisible; }

    /**
     * Change cameras count, automatically adding/removing them.
     */
    inline void SetCameraCount(unsigned int n)
    {
        while ( cameras.size() < n)
            cameras.push_back(Camera());

        while ( cameras.size() > n)
            cameras.erase(cameras.begin()+cameras.size()-1);
    }

    /**
     * Get cameras count.
     */
    inline unsigned int GetCameraCount() const { return cameras.size(); };

    /**
     * Return a reference to a camera
     */
    inline const Camera & GetCamera(unsigned int n) const { if ( n >= GetCameraCount() ) return badCamera; return cameras[n]; }

    /**
     * Return a reference to a camera
     */
    inline Camera & GetCamera(unsigned int n) { if ( n >= GetCameraCount() ) return badCamera; return cameras[n]; }

    /**
     * Delete a camera.
     */
    inline void DeleteCamera(unsigned int n) { if ( n >= GetCameraCount() ) return; cameras.erase(cameras.begin()+n); }

    /**
     * Add an already existing camera.
     */
    inline void AddCamera(const Camera & camera) { cameras.push_back(camera); };

private:

    std::string name;
    bool isVisible;
    std::vector < Camera > cameras;

    static Camera badCamera;
};

/**
 * \brief Functor testing layer name
 *
 * \see Layer
 */
struct LayerHasName : public std::binary_function<Layer, std::string, bool> {
    bool operator()(const Layer & layer, const std::string & name) const { return layer.GetName() == name; }
};

#endif // LAYER_H
