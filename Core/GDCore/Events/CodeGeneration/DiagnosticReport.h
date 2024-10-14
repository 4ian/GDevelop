/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

/**
 * \brief
 */
class GD_CORE_API ProjectDiagnostic {
 public:
  enum ErrorType {
    UndeclaredVariable,
    MissingBehavior,
    UnknownObject,
    MismatchedObjectType,
  };

  ProjectDiagnostic(ErrorType type_,
                    const gd::String &message_,
                    const gd::String &actualValue_,
                    const gd::String &expectedValue_,
                    const gd::String &objectName_ = "")
      : type(type_),
        message(message_),
        actualValue(actualValue_),
        expectedValue(expectedValue_),
        objectName(objectName_) {};
  virtual ~ProjectDiagnostic() {};

  ErrorType GetType() const { return type; };
  const gd::String &GetMessage() const { return message; }
  const gd::String &GetObjectName() const { return objectName; }
  const gd::String &GetActualValue() const { return actualValue; }
  const gd::String &GetExpectedValue() const { return expectedValue; }

 private:
  ErrorType type;
  gd::String message;
  gd::String objectName;
  gd::String actualValue;
  gd::String expectedValue;
};

/**
 * \brief
 */
class GD_CORE_API DiagnosticReport {
 public:
  DiagnosticReport() {};
  virtual ~DiagnosticReport() {};

  void Add(const gd::ProjectDiagnostic &projectDiagnostic) {
    projectDiagnostics.push_back(
        gd::make_unique<gd::ProjectDiagnostic>(projectDiagnostic));
  };

  const ProjectDiagnostic &Get(std::size_t index) const {
    return *projectDiagnostics[index].get();
  };

  std::size_t Count() const { return projectDiagnostics.size(); };

  const gd::String &GetSceneName() const { return sceneName; }

  void SetSceneName(const gd::String &sceneName_) { sceneName = sceneName_; }

  void LogAllDiagnostics() {
    for (auto &diagnostic : projectDiagnostics) {
      std::cout << diagnostic->GetMessage()
                << "(object: " << diagnostic->GetObjectName()
                << ", actual value: " << diagnostic->GetActualValue()
                << ", expected value: " << diagnostic->GetExpectedValue() << ")"
                << std::endl;
    }
  }

 private:
  std::vector<std::unique_ptr<gd::ProjectDiagnostic>> projectDiagnostics;
  gd::String sceneName;
};

/**
 * \brief
 */
class GD_CORE_API WholeProjectDiagnosticReport {
 public:
  WholeProjectDiagnosticReport() {};
  virtual ~WholeProjectDiagnosticReport() {};

  const DiagnosticReport &Get(std::size_t index) const {
    return *diagnosticReports[index].get();
  };

  void Clear() { diagnosticReports.clear(); };

  DiagnosticReport &AddNewDiagnosticReportForScene(
      const gd::String &sceneName) {
    auto diagnosticReport = gd::make_unique<gd::DiagnosticReport>();
    diagnosticReport->SetSceneName(sceneName);
    diagnosticReports.push_back(std::move(diagnosticReport));
    return *diagnosticReports[diagnosticReports.size() - 1].get();
  };

  std::size_t Count() const { return diagnosticReports.size(); };

  bool HasAnyIssue() {
    for (auto &diagnosticReport : diagnosticReports) {
      if (diagnosticReport->Count() > 0) {
        return true;
      }
    }
    return false;
  }

 private:
  std::vector<std::unique_ptr<gd::DiagnosticReport>> diagnosticReports;
};

}  // namespace gd
