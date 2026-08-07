package org.gdevelop.kotlin.diagnostics

import kotlinx.serialization.Serializable

@Serializable
enum class Severity { ERROR, WARNING, INFO }

@Serializable
data class SourceLocation(
	val sourceId: String,
	val jsonPointer: String,
)

@Serializable
data class Diagnostic(
	val code: String,
	val severity: Severity,
	val message: String,
	val location: SourceLocation,
)

data class ResultWithDiagnostics<T>(
	val value: T?,
	val diagnostics: List<Diagnostic>,
) {
	val hasErrors: Boolean = diagnostics.any { it.severity == Severity.ERROR }
}
