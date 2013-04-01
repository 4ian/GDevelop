/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_AUTOMATISM_H
#define GDCORE_AUTOMATISM_H
#include <string>
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
namespace gd { class Layout; }
class TiXmlElement;
class wxWindow;

namespace gd
{

/**
 * \brief Base class used to represent an automatism that can be applied to an object
 *
 * \ingroup PlatformDefinition
 */
class Automatism
{
public:
    Automatism() {};
    virtual ~Automatism() {};

    /**
     * Must change the name identifying the automatism.
     */
    virtual void SetName(const std::string & name_) =0;

    /**
     * Must return the name identifying the automatism
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must return the name identifying the type of the automatism
     */
    virtual const std::string & GetTypeName() const =0;

    /**
     * Called when user wants to edit the automatism.
     */
    virtual void EditAutomatism( wxWindow* parent, gd::Project & project, gd::Layout * layout, gd::MainFrameWrapper & mainFrameWrapper ) {};

    /**
     * Save Automatism to XML
     */
    virtual void SaveToXml(TiXmlElement * eventElem) const {}

    /**
     * Load Automatism from XML
     */
    virtual void LoadFromXml(const TiXmlElement * eventElem) {}
};

}

#endif // GDCORE_AUTOMATISM_H
