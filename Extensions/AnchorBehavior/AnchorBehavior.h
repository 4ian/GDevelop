/**
GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#ifndef ANCHORBEHAVIOR_H
#define ANCHORBEHAVIOR_H

#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
#include <SFML/Graphics/RenderTarget.hpp>
#include <SFML/Graphics/View.hpp>
#include <SFML/System/Vector2.hpp>
#include <vector>
namespace gd { class Layout; }
class RuntimeScene;
namespace gd { class SerializerElement; }
class RuntimeScenePlatformData;

/**
 * \brief Allow to anchor objects to the window's bounds.
 */
class GD_EXTENSION_API AnchorBehavior : public Behavior
{
public:
    enum HorizontalAnchor
    {
        ANCHOR_HORIZONTAL_NONE = 0,
        ANCHOR_HORIZONTAL_WINDOW_LEFT = 1,
        ANCHOR_HORIZONTAL_WINDOW_RIGHT = 2,
        ANCHOR_HORIZONTAL_PROPORTIONAL = 3
    };

    enum VerticalAnchor
    {
        ANCHOR_VERTICAL_NONE = 0,
        ANCHOR_VERTICAL_WINDOW_TOP = 1,
        ANCHOR_VERTICAL_WINDOW_BOTTOM = 2,
        ANCHOR_VERTICAL_PROPORTIONAL = 3
    };

    AnchorBehavior();
    virtual ~AnchorBehavior() {};
    virtual Behavior* Clone() const override { return new AnchorBehavior(*this); }

    /**
     * \brief Unserialize the behavior
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element) override;

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the behavior
     */
    virtual void SerializeTo(gd::SerializerElement & element) const override;

    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const override;
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) override;
    #endif

    virtual void OnActivate() override;

private:
    virtual void DoStepPreEvents(RuntimeScene & scene) override;
    virtual void DoStepPostEvents(RuntimeScene & scene) override;

    bool m_relativeToOriginalWindowSize; ///< True if the original size of the game window must be used.
    HorizontalAnchor m_leftEdgeAnchor;
    HorizontalAnchor m_rightEdgeAnchor;
    VerticalAnchor m_topEdgeAnchor;
    VerticalAnchor m_bottomEdgeAnchor;

    bool m_invalidDistances;
    //Distances (in window's units) from the XXX edge of the object to side of the window the edge is anchored on.
    //Note: If the edge anchor is set to PROPORTIONAL, then it contains the ratio of the distance to the window size.
    float m_leftEdgeDistance;
    float m_rightEdgeDistance;
    float m_topEdgeDistance;
    float m_bottomEdgeDistance;
};

#endif // ANCHORBEHAVIOR_H
