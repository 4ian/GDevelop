package org.gdevelop.kotlin.map

import kotlinx.serialization.Serializable

/** Game-time source supplied by the runtime owner. Implementations must not read a wall clock. */
fun interface MapRuntimeClock {
	fun gameTimeMillis(): Long
}

@Serializable
enum class MapOverlayAnimationStatus { RUNNING, CANCELLED, COMPLETED }

/**
 * Fully portable animation state. [elapsedGameTimeMillis] is advanced only from a
 * [MapRuntimeClock], so replaying the same clock samples produces the same coordinates.
 */
@Serializable
data class MapOverlayAnimationState(
	val overlayId: MapOverlayId,
	val start: GeoCoordinate,
	val end: GeoCoordinate,
	val durationMillis: Long,
	val easing: MapAnimationEasing,
	val startedAtGameTimeMillis: Long,
	val elapsedGameTimeMillis: Long = 0,
	val coordinate: GeoCoordinate = start,
	val status: MapOverlayAnimationStatus = MapOverlayAnimationStatus.RUNNING,
) {
	init {
		require(durationMillis >= 0) { "durationMillis must not be negative" }
		require(elapsedGameTimeMillis >= 0) { "elapsedGameTimeMillis must not be negative" }
	}
}

/** Canonical semantic records; host camera observations are deliberately distinguished. */
@Serializable
sealed interface MapAnimationTraceRecord {
	@Serializable
	data class OverlayRequested(val state: MapOverlayAnimationState) : MapAnimationTraceRecord

	@Serializable
	data class OverlayCoordinateUpdated(
		val overlayId: MapOverlayId,
		val coordinate: GeoCoordinate,
		val elapsedGameTimeMillis: Long,
	) : MapAnimationTraceRecord

	@Serializable
	data class CameraRequested(val sequence: Long, val command: MapCameraCommand) : MapAnimationTraceRecord

	@Serializable
	data class CameraStateObserved(val sequence: Long?, val event: String, val camera: MapCameraState) :
		MapAnimationTraceRecord

	@Serializable
	data class Cancelled(val target: String, val sequence: Long? = null, val overlayId: MapOverlayId? = null) :
		MapAnimationTraceRecord

	@Serializable
	data class Completed(val target: String, val sequence: Long? = null, val overlayId: MapOverlayId? = null) :
		MapAnimationTraceRecord
}

class MapOverlayAnimationRuntime(
	private val clock: MapRuntimeClock,
	private val trace: (MapAnimationTraceRecord) -> Unit = {},
) {
	private val animations = linkedMapOf<MapOverlayId, MapOverlayAnimationState>()

	fun state(id: MapOverlayId): MapOverlayAnimationState? = animations[id]
	fun states(): List<MapOverlayAnimationState> = animations.values.toList()

	fun start(
		id: MapOverlayId, start: GeoCoordinate, end: GeoCoordinate, durationMillis: Long,
		easing: MapAnimationEasing = MapAnimationEasing.LINEAR
	): MapOverlayAnimationState {
		cancel(id)
		val initial = MapOverlayAnimationState(id, start, end, durationMillis, easing, clock.gameTimeMillis())
		animations[id] = initial
		trace(MapAnimationTraceRecord.OverlayRequested(initial))
		return advanceAt(id, initial.startedAtGameTimeMillis)!!
	}

	/** Samples the host game clock exactly once and advances all animations in insertion order. */
	fun advanceAll(): List<MapOverlayAnimationState> {
		val now = clock.gameTimeMillis()
		return animations.keys.toList().mapNotNull { advanceAt(it, now) }
	}

	fun advance(id: MapOverlayId): MapOverlayAnimationState? = advanceAt(id, clock.gameTimeMillis())

	fun cancel(id: MapOverlayId): MapOverlayAnimationState? {
		val current = animations[id] ?: return null
		if (current.status != MapOverlayAnimationStatus.RUNNING) return current
		val cancelled = current.copy(status = MapOverlayAnimationStatus.CANCELLED)
		animations[id] = cancelled
		trace(MapAnimationTraceRecord.Cancelled("overlay", overlayId = id))
		return cancelled
	}

	private fun advanceAt(id: MapOverlayId, now: Long): MapOverlayAnimationState? {
		val old = animations[id] ?: return null
		if (old.status != MapOverlayAnimationStatus.RUNNING) return old
		val elapsed = (now - old.startedAtGameTimeMillis).coerceAtLeast(0).coerceAtMost(old.durationMillis)
		val progress = if (old.durationMillis == 0L) 1.0 else elapsed.toDouble() / old.durationMillis
		val eased = ease(old.easing, progress)
		val longitudeDelta = shortestLongitudeDelta(old.start.longitude, old.end.longitude)
		val coordinate = GeoCoordinate(
			wrapLongitude(old.start.longitude + longitudeDelta * eased),
			old.start.latitude + (old.end.latitude - old.start.latitude) * eased,
		)
		val status =
			if (elapsed == old.durationMillis) MapOverlayAnimationStatus.COMPLETED else MapOverlayAnimationStatus.RUNNING
		val next = old.copy(elapsedGameTimeMillis = elapsed, coordinate = coordinate, status = status)
		animations[id] = next
		trace(MapAnimationTraceRecord.OverlayCoordinateUpdated(id, coordinate, elapsed))
		if (status == MapOverlayAnimationStatus.COMPLETED)
			trace(MapAnimationTraceRecord.Completed("overlay", overlayId = id))
		return next
	}
}

private fun shortestLongitudeDelta(start: Double, end: Double): Double {
	val direct = end - start
	return when {
		direct > 180.0 -> direct - 360.0
		direct < -180.0 -> direct + 360.0
		else -> direct
	}
}

private fun wrapLongitude(value: Double): Double = when {
	value > 180.0 -> value - 360.0
	value < -180.0 -> value + 360.0
	else -> value
}

private fun ease(easing: MapAnimationEasing, value: Double): Double = when (easing) {
	MapAnimationEasing.LINEAR -> value
	MapAnimationEasing.EASE_IN_QUAD -> value * value
	MapAnimationEasing.EASE_OUT_QUAD -> value * (2.0 - value)
	MapAnimationEasing.EASE_IN_OUT_QUAD -> if (value < .5) 2 * value * value else -1 + (4 - 2 * value) * value
}
