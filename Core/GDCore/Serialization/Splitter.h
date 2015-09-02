/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_SPLITTER_H
#define GDCORE_SPLITTER_H
#include <functional>
#include <vector>
#include <set>
#include "GDCore/String.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

/**
 * \brief Split a tree of SerializerElement according to tags name.
 * It replaces cut subtree by a SerializerElement containing a reference to the
 * cut subtree.
 */
class GD_CORE_API Splitter
{
public:
    virtual ~Splitter() {};
    Splitter(gd::String pathSeparator_ = "/", gd::String nameAttribute_ = "name") :
        pathSeparator(pathSeparator_),
        nameAttribute(nameAttribute_)
    {};

    /**
     * \brief Represents an element as returned by gd::Splitter:Split
     */
    struct SplitElement {
        gd::String path;
        gd::String name;
        SerializerElement element;
    };

    /**
     * \brief Split the tree of SerializerElement into a vector of subtrees,
     * replacing the cut subtrees by a placeholder (a new SerializerElement containing attributes
     * referencing the subtree).
     */
	std::vector<SplitElement> Split(SerializerElement & element,
        const std::set<gd::String> & tags,
        gd::String path = "");

    /**
     * \brief Browse the tree of SerializerElement, calling the callback function
     * each time a SerializerElement with a reference to a subtree is found.
     * \param cb The callback. It must return the SerializerElement containing the
     * subtree that will be used to replace the placeholder SerializerElement.
     */
	void Unsplit(SerializerElement & element,
        std::function<SerializerElement(gd::String path, gd::String name)> cb);
private:
    gd::String pathSeparator;
    gd::String nameAttribute;
};

}

#endif
