package org.gdevelop.kotlin.runtime

import org.gdevelop.kotlin.ir.ExtensionHostOperation
import org.gdevelop.kotlin.extensions.RuntimeCapabilityId

data class HostCapability(val id: RuntimeCapabilityId, val version: Int)
data class HostInvocationId(val value: String)
data class HostInvocation(val id: HostInvocationId, val operation: ExtensionHostOperation)
data class HostTransientInput(val values: Map<String, String> = emptyMap())

sealed interface HostOperationResult {
    data class Success(val value: String? = null) : HostOperationResult
    data class Failure(val code: String, val message: String) : HostOperationResult
    data class Cancelled(val reason: String) : HostOperationResult
    data class Unsupported(val missing: Set<RuntimeCapabilityId>) : HostOperationResult
}

data class HostCompletion(val invocation: HostInvocation, val result: HostOperationResult)
data class HostTraceRecord(val sequence: Long, val invocationId: HostInvocationId, val phase: String, val result: HostOperationResult? = null)

/** Target-neutral host boundary. Completions are delivered in invocation order. */
interface RuntimeHost {
    val capabilities: Set<HostCapability>
    val trace: List<HostTraceRecord>
    fun initialize()
    fun beginFrame(frame: Int, input: HostTransientInput = HostTransientInput())
    fun evaluateCondition(invocation: HostInvocation): HostOperationResult
    fun invokeAction(invocation: HostInvocation)
    fun deliverCompletions(consumer: (HostCompletion) -> Unit)
    fun dispose()
}

abstract class OrderedRuntimeHost : RuntimeHost {
    private data class Pending(val invocation: HostInvocation, var result: HostOperationResult? = null)
    private val pending = ArrayDeque<Pending>()
    private val records = mutableListOf<HostTraceRecord>()
    private var sequence = 0L
    private var active = false
    final override val trace get() = records.toList()
    final override fun initialize() { if (!active) { active = true; onInitialize() } }
    final override fun beginFrame(frame: Int, input: HostTransientInput) { check(active); onBeginFrame(frame, input) }
    final override fun evaluateCondition(invocation: HostInvocation): HostOperationResult =
        (unsupported(invocation.operation) ?: evaluate(invocation)).also { record(invocation, "condition", it) }
    final override fun invokeAction(invocation: HostInvocation) {
        val slot = Pending(invocation); pending.addLast(slot)
        val unavailable = unsupported(invocation.operation)
        if (unavailable != null) complete(slot, unavailable)
        else invoke(invocation) { complete(slot, it) }
    }
    final override fun deliverCompletions(consumer: (HostCompletion) -> Unit) {
        while (pending.firstOrNull()?.result != null) pending.removeFirst().also {
            val completion = HostCompletion(it.invocation, checkNotNull(it.result))
            record(completion.invocation, "completed", completion.result); consumer(completion)
        }
    }
    final override fun dispose() { if (active) { pending.clear(); onDispose(); active = false } }
    protected open fun onInitialize() = Unit
    protected open fun onBeginFrame(frame: Int, input: HostTransientInput) = Unit
    protected abstract fun evaluate(invocation: HostInvocation): HostOperationResult
    protected abstract fun invoke(invocation: HostInvocation): HostOperationResult
    /** Async adapters override this and call completion exactly once. */
    protected open fun invoke(invocation: HostInvocation, completion: (HostOperationResult) -> Unit) = completion(invoke(invocation))
    protected open fun onDispose() = Unit
    private fun unsupported(operation: ExtensionHostOperation): HostOperationResult.Unsupported? {
        val missing = operation.requiredCapabilities - capabilities.mapTo(mutableSetOf()) { it.id }
        return missing.takeIf { it.isNotEmpty() }?.let(HostOperationResult::Unsupported)
    }
    private fun record(invocation: HostInvocation, phase: String, result: HostOperationResult) {
        records += HostTraceRecord(sequence++, invocation.id, phase, result)
    }
    private fun complete(slot: Pending, result: HostOperationResult) {
        slot.result = result; record(slot.invocation, "invoked", result)
    }
}

class DeterministicHeadlessHost : OrderedRuntimeHost() {
    override val capabilities: Set<HostCapability> = emptySet()
    override fun evaluate(invocation: HostInvocation) = HostOperationResult.Unsupported(invocation.operation.requiredCapabilities)
    override fun invoke(invocation: HostInvocation) = HostOperationResult.Unsupported(invocation.operation.requiredCapabilities)
}
