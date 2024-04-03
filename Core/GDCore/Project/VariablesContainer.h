/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_VARIABLESCONTAINER_H
#define GDCORE_VARIABLESCONTAINER_H
#include <memory>
#include <vector>
#include "GDCore/Project/Variable.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}
class TiXmlElement;

namespace gd {

/**
 * \brief Class defining a container for gd::Variable.
 *
 * \see gd::Variable
 * \see gd::Project
 * \see gd::Layout
 * \see gd::Object
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API VariablesContainer {
 public:
  VariablesContainer();
  VariablesContainer(const VariablesContainer&);
  virtual ~VariablesContainer(){};

  VariablesContainer& operator=(const VariablesContainer& rhs);

  /** \name Variables management
   * Members functions related to variables management.
   */
  ///@{

  /**
   * \brief Return true if the specified variable is in the container
   */
  bool Has(const gd::String& name) const;

  /**
   * \brief Return a reference to the variable called \a name.
   */
  Variable& Get(const gd::String& name);

  /**
   * \brief Return a reference to the variable called \a name.
   */
  const Variable& Get(const gd::String& name) const;

  /**
   * \brief Return a reference to the variable at the specified position in the
   * list.
   */
  Variable& Get(std::size_t index);

  /**
   * \brief Return a reference to the variable at the specified position in the
   * list.
   */
  const Variable& Get(std::size_t index) const;

  /**
   * Must add a new variable constructed from the variable passed as parameter.
   * \note No pointer or reference must be kept on the variable passed as
   * parameter. \param variable The variable that must be copied and inserted
   * into the container \param position Insertion position. If the position is
   * invalid, the variable is inserted at the end of the variable list. \return
   * Reference to the newly added variable
   */
  Variable& Insert(const gd::String& name,
                   const Variable& variable,
                   std::size_t position);

  /**
   * \brief Return the number of variables.
   */
  std::size_t Count() const { return variables.size(); };

  /**
   * \brief Return the name of the variable at a position
   */
  const gd::String& GetNameAt(std::size_t index) const;

#if defined(GD_IDE_ONLY)
  /**
   * \brief return the position of the variable called "name" in the variable
   * list
   */
  std::size_t GetPosition(const gd::String& name) const;

  /**
   * \brief Add a new empty variable at the specified position in the container.
   * \param name The new variable name
   * \param position Insertion position. If the position is invalid, the
   * variable is inserted at the end of the variable list. \return Reference to
   * the newly added variable
   */
  Variable& InsertNew(const gd::String& name, std::size_t position = -1);

  /**
   * \brief Remove the variable with the specified name from the container.
   * \note This operation is not recursive on variable children
   */
  void Remove(const gd::String& name);

  /**
   * \brief Remove the specified variable from the container.
   */
  void RemoveRecursively(const gd::Variable& variable);

  /**
   * \brief Rename a variable.
   * \return true if the variable was renamed, false otherwise.
   */
  bool Rename(const gd::String& oldName, const gd::String& newName);

  /**
   * \brief Swap the position of the specified variables.
   */
  void Swap(std::size_t firstVariableIndex, std::size_t secondVariableIndex);

  /**
   * \brief Move the specified variable at a new position in the list.
   */
  void Move(std::size_t oldIndex, std::size_t newIndex);
#endif

  /**
   * \brief Clear all variables of the container.
   */
  inline void Clear() { variables.clear(); }

  /**
   * \brief Call the callback for each variable with a name matching the specified search.
   */
  void ForEachVariableMatchingSearch(const gd::String& search, std::function<void(const gd::String& name, const gd::Variable& variable)> fn) const;
  ///@}

  /** \name Saving and loading
   * Members functions related to saving and loading the object.
   */
  ///@{
  /**
   * \brief Serialize variable container.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the variable container.
   */
  void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Reset the persistent UUID, used to recognize
   * the same variables between serialization.
   */
  VariablesContainer& ResetPersistentUuid();

  /**
   * \brief Remove the persistent UUID - when the variables no
   * longer need to be recognized between serializations.
   */
  VariablesContainer& ClearPersistentUuid();

  /**
   * \brief Get the persistent UUID used to recognize
   * the same variables between serialization.
   */
  const gd::String& GetPersistentUuid() const { return persistentUuid; };
  ///@}

 private:
  std::vector<std::pair<gd::String, std::shared_ptr<gd::Variable>>> variables;
  mutable gd::String persistentUuid;  ///< A persistent random version 4 UUID,
                                      ///< useful for computing changesets.
  static gd::Variable badVariable;
  static gd::String badName;

  /**
   * Initialize from another variables container, copying elements. Used by
   * copy-ctor and assign-op. Don't forget to update me if members were changed!
   */
  void Init(const VariablesContainer& other);
};

}  // namespace gd

#endif  // GDCORE_VARIABLESCONTAINER_H
