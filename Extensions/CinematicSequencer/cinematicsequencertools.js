// @ts-check
gdjs.evtTools = gdjs.evtTools || {};
gdjs.evtTools.cinematicSequencer = gdjs.evtTools.cinematicSequencer || {};

/**
 * Global state to keep track of playing cinematics.
 */
gdjs.evtTools.cinematicSequencer.activeCinematics = {};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} sequenceJson
 */
gdjs.evtTools.cinematicSequencer.playSequence = function (runtimeScene, sequenceJson) {
    if (!sequenceJson) return;
    try {
        const sequenceData = JSON.parse(sequenceJson);
        const tracks = sequenceData.tracks || [];

        const seqName = sequenceData.name || "Cinematic_" + Date.now();
        gdjs.evtTools.cinematicSequencer.activeCinematics[seqName] = true;

        console.log("Playing Cinematic Sequence: " + seqName);

        // Simple implementation of Event Generation at Runtime
        // For each track, schedule movements based on keyframes.
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            if (track.type === 'object') {
                const objects = runtimeScene.getObjects(track.name);
                if (!objects || objects.length === 0) continue;

                for (let j = 0; j < track.keyframes.length; j++) {
                    const kf = track.keyframes[j];
                    const timeMs = kf.time * 1000;

                    // Relying on JS Timers as a simple mapping of engine's Timer
                    setTimeout(() => {
                        for (let o = 0; o < objects.length; o++) {
                            // Apply keyframe value (e.g. {x, y, angle})
                            if (kf.value && typeof kf.value === 'object') {
                                if (kf.value.x !== undefined) objects[o].setX(kf.value.x);
                                if (kf.value.y !== undefined) objects[o].setY(kf.value.y);
                                if (kf.value.angle !== undefined) objects[o].setAngle(kf.value.angle);
                            }
                        }
                    }, timeMs);
                }
            }
        }

        const maxTime = tracks.reduce((max, t) => {
            if (!t.keyframes || !t.keyframes.length) return max;
            return Math.max(max, t.keyframes[t.keyframes.length - 1].time);
        }, 0);

        setTimeout(() => {
            gdjs.evtTools.cinematicSequencer.activeCinematics[seqName] = false;
            console.log("Cinematic finished: " + seqName);
        }, (maxTime * 1000) + 100); // 100ms padding

    } catch (e) {
        console.error("Failed to parse or play cinematic:", e);
    }
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} sequenceName
 * @returns {boolean}
 */
gdjs.evtTools.cinematicSequencer.isPlaying = function (runtimeScene, sequenceName) {
    return !!gdjs.evtTools.cinematicSequencer.activeCinematics[sequenceName];
};
