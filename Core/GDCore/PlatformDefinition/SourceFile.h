/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SOURCEFILE_H
#define SOURCEFILE_H
#include <ctime>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/weak_ptr.hpp>
namespace gd { class SerializerElement; }
class BaseEvent;

namespace gd
{

/**
 * \brief Internal class representing a "physical" source file.
 *
 * SourceFile represents a "physical" source file that must be compiled
 * so as to be used by the game as a dynamic extension.
 */
class GD_CORE_API SourceFile
{
public:
    SourceFile();
    virtual ~SourceFile();

    /**
     * Get the filename
     */
    std::string GetFileName() const { return filename; };

    /**
     * Change the filename
     */
    void SetFileName(std::string filename_) { filename = filename_; };

    /**
     * \brief Serialize the source file.
     */
    void SerializeTo(SerializerElement & element) const;

    /**
     * \brief Unserialize the source file.
     */
    void UnserializeFrom(const SerializerElement & element);

    /**
     * Set if the file is hidden from the user point of view and is only managed by Game Develop
     */
    void SetGDManaged(bool gdManaged_) { gdManaged = gdManaged_; };

    /**
     * Return true if the file is hidden from the user point of view and is only managed by Game Develop
     */
    bool IsGDManaged() const { return gdManaged; };

    /**
     * When a source file is GD-managed, it is usually created for a specific event ( C++ Code Event ).
     *
     * Using this method, the event can store in the source file a (weak) pointer to itself,
     * so that we can show to the user the event if the compilation fails in the source file.
     */
    void SetAssociatedEvent(boost::weak_ptr<BaseEvent> event) { associatedGdEvent = event; };

    /**
     * Return a (weak) pointer to the event associated to the source file, if any.
     *
     * \see SetAssociatedEvent
     */
    boost::weak_ptr<BaseEvent> GetAssociatedEvent() const { return associatedGdEvent; };

private:

    std::string filename; ///< Filename
    time_t lastBuildTimeStamp; ///< Time of the last build
    bool gdManaged; ///< True if the source file is hidden from the user point of view and is managed only by Game Develop.
    boost::weak_ptr<BaseEvent> associatedGdEvent; ///< When a source file is GD-managed, it is usually created for a specific event. This member is not saved: It is the event responsibility to call SetAssociatedEvent.
};

//"Tool" Functions

/**
 * Functor testing Source Files name
 */
struct ExternalSourceFileHasName : public std::binary_function<boost::shared_ptr<SourceFile>, std::string, bool> {
    bool operator()(const boost::shared_ptr<SourceFile> & externalEvents, std::string name) const { return externalEvents->GetFileName() == name; }
};

}

#endif // SOURCEFILE_H
