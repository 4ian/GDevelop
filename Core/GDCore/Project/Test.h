/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A test attached to a project or an events based extension.
 *
 * A test is identified by its name and holds a JavaScript source that is run
 * against the game at runtime by a test harness (for example, a gameplay test
 * stepping frames, simulating inputs and asserting on the game state).
 *
 * The `type` allows different kinds of tests to share this container in the
 * future - only "gameplay" is used for now.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Test {
 public:
  Test();
  virtual ~Test(){};

  /**
   * \brief Return a pointer to a new Test constructed from this one.
   */
  Test* Clone() const { return new Test(*this); };

  /**
   * \brief Get the name of the test.
   */
  const gd::String& GetName() const { return name; };

  /**
   * \brief Change the name of the test.
   */
  void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Get the type of the test ("gameplay" for now).
   */
  const gd::String& GetType() const { return type; };

  /**
   * \brief Change the type of the test.
   */
  void SetType(const gd::String& type_) { type = type_; };

  /**
   * \brief Get the description of the test.
   */
  const gd::String& GetDescription() const { return description; };

  /**
   * \brief Change the description of the test.
   */
  void SetDescription(const gd::String& description_) {
    description = description_;
  };

  /**
   * \brief Get the JavaScript source of the test.
   */
  const gd::String& GetSource() const { return source; };

  /**
   * \brief Change the JavaScript source of the test.
   */
  void SetSource(const gd::String& source_) { source = source_; };

  /** \name Last run summary
   * A small summary of the last run of the test, persisted with the project
   * (logs and screenshots are not persisted).
   */
  ///@{
  /**
   * \brief Get the status of the last run: empty if never run, or "passed",
   * "failed", "error".
   */
  const gd::String& GetLastRunStatus() const { return lastRunStatus; };

  /**
   * \brief Set the status of the last run.
   */
  void SetLastRunStatus(const gd::String& lastRunStatus_) {
    lastRunStatus = lastRunStatus_;
  };

  /**
   * \brief Get the timestamp (in milliseconds since epoch) of the last run,
   * or 0 if never run.
   */
  double GetLastRunAt() const { return lastRunAt; };

  /**
   * \brief Set the timestamp (in milliseconds since epoch) of the last run.
   */
  void SetLastRunAt(double lastRunAt_) { lastRunAt = lastRunAt_; };

  /**
   * \brief Get the duration (in milliseconds) of the last run.
   */
  double GetLastRunDurationMs() const { return lastRunDurationMs; };

  /**
   * \brief Set the duration (in milliseconds) of the last run.
   */
  void SetLastRunDurationMs(double lastRunDurationMs_) {
    lastRunDurationMs = lastRunDurationMs_;
  };

  /**
   * \brief Get the number of frames executed during the last run.
   */
  int GetLastRunFramesExecuted() const { return lastRunFramesExecuted; };

  /**
   * \brief Set the number of frames executed during the last run.
   */
  void SetLastRunFramesExecuted(int lastRunFramesExecuted_) {
    lastRunFramesExecuted = lastRunFramesExecuted_;
  };
  ///@}

  /**
   * \brief Serialize the test.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the test.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  gd::String name;
  gd::String type;  ///< "gameplay" for now - reserved for future test types.
  gd::String description;
  gd::String source;  ///< The JavaScript source of the test.
  gd::String lastRunStatus;  ///< Empty, "passed", "failed" or "error".
  double lastRunAt = 0;
  double lastRunDurationMs = 0;
  int lastRunFramesExecuted = 0;
};

}  // namespace gd
