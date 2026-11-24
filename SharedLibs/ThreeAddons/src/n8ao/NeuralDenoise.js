import model from './NeuralDenoiseModel.json';

const MATRIX_LAYOUTS = [
    ['tapInputWeight', 'tapInputWeights', 8, 9],
    ['tapOutputWeight', 'tapOutputWeights', 8, 8],
    ['globalWeight', 'globalWeights', 8, 3],
    ['keyWeight', 'keyProjectionWeights', 8, 8],
    ['valueWeight', 'valueProjectionWeights', 8, 8],
    ['headWeight', 'headWeights', 8, 32],
    ['outputWeight', 'outputWeights', 1, 8]
];

const scale = (name) => {
    const value = model.quantization?.scales?.[name];
    if (!(value > 0) || !Number.isFinite(value)) {
        throw new Error(`The bundled N8AO neural model has no valid ${name} scale.`);
    }
    return value;
};

if (
    model.architecture !== 'attention-v3-int8'
    || model.formatVersion !== 3
    || model.quantization?.scheme !== 'symmetric-int8-per-tensor'
    || model.quantization?.zeroPoint !== 0
    || model.supportedDenoiseSamples?.join(',') !== '4,8,16'
    || MATRIX_LAYOUTS.some(([, field, rows, columns]) => (
        model[field]?.length !== rows * columns
        || model[field].some((value) => !Number.isInteger(value) || value < -127 || value > 127)
    ))
) {
    throw new Error('The bundled N8AO neural denoise model has an unsupported layout.');
}

const glslFloat = (value) => {
    if (!Number.isFinite(value)) {
        throw new Error('The bundled N8AO neural model contains a non-finite value.');
    }
    if (Object.is(value, -0)) {
        return '0.0';
    }
    const text = Number(value).toString();
    return /[.eE]/.test(text) ? text : `${text}.0`;
};

const COMPONENTS = ['x', 'y', 'z', 'w'];
const tokenAccessors = (name) => [
    ...COMPONENTS.map((component) => `${name}.lo.${component}`),
    ...COMPONENTS.map((component) => `${name}.hi.${component}`)
];

const weightedTerm = (coefficient, input) => {
    if (coefficient === 0) {
        return null;
    }
    if (coefficient === 1) {
        return input;
    }
    if (coefficient === -1) {
        return `(-${input})`;
    }
    if (coefficient < 0) {
        return `(-${glslFloat(-coefficient)} * ${input})`;
    }
    return `${glslFloat(coefficient)} * ${input}`;
};

const floatWeightedTerm = (coefficient, input) => {
    if (coefficient === 0) {
        return null;
    }
    return `${glslFloat(coefficient)} * ${input}`;
};

const sumTerms = (terms) => terms.filter(Boolean).join(' + ') || '0.0';

const quantizedRow = (weights, row, width, inputs, tensorScale, bias) => {
    const terms = inputs.map((input, column) => (
        weightedTerm(weights[row * width + column], input)
    ));
    return `${glslFloat(tensorScale)} * (${sumTerms(terms)}) + ${glslFloat(bias[row])}`;
};

const vec4 = (values, indent = '        ') => `vec4(\n${values
    .map((value) => `${indent}    ${value}`)
    .join(',\n')}\n${indent})`;

const tokenLayer = ({ functionName, scaleName, weights, bias, width = 8, relu = false }) => {
    const inputs = tokenAccessors('inputToken');
    const tensorScale = scale(scaleName);
    const rows = Array.from({ length: 8 }, (_, row) => (
        quantizedRow(weights, row, width, inputs, tensorScale, bias)
    ));
    const low = vec4(rows.slice(0, 4));
    const high = vec4(rows.slice(4));
    const wrap = (value) => relu ? `max(${value}, vec4(0.0))` : value;
    return `
    NeuralToken neural${functionName[0].toUpperCase()}${functionName.slice(1)}(NeuralToken inputToken) {
        return NeuralToken(
            ${wrap(low)},
            ${wrap(high)}
        );
    }
`;
};

const foldedBias = (
    weights,
    bias,
    means,
    inverseStandardDeviations,
    rows,
    width,
    tensorScale,
    constantInputs = {}
) => Array.from({ length: rows }, (_, row) => {
    let value = bias[row];
    for (let column = 0; column < width; column++) {
        const weight = weights[row * width + column] * tensorScale;
        value -= weight * inverseStandardDeviations[column] * means[column];
        if (Object.hasOwn(constantInputs, column)) {
            value += weight * inverseStandardDeviations[column] * constantInputs[column];
        }
    }
    return value;
});

const tapInputScale = scale('tapInputWeight');
const tapInputBias = foldedBias(
    model.tapInputWeights,
    model.tapInputBias,
    model.tapFeatureMean,
    model.tapFeatureInverseStandardDeviation,
    8,
    9,
    tapInputScale,
    { 8: 1 }
);
const tapScaledAccessors = tokenAccessors('scaledInput');
const tapInputRows = Array.from({ length: 8 }, (_, row) => (
    quantizedRow(
        model.tapInputWeights,
        row,
        9,
        tapScaledAccessors,
        tapInputScale,
        tapInputBias
    )
));

const tapInputShader = `
    NeuralToken neuralTapInput(NeuralToken raw) {
        NeuralToken scaledInput = NeuralToken(
            raw.lo * ${vec4(model.tapFeatureInverseStandardDeviation.slice(0, 4), '            ')},
            raw.hi * ${vec4(model.tapFeatureInverseStandardDeviation.slice(4, 8), '            ')}
        );
        return NeuralToken(
            max(${vec4(tapInputRows.slice(0, 4))}, vec4(0.0)),
            max(${vec4(tapInputRows.slice(4))}, vec4(0.0))
        );
    }
`;

const globalScale = scale('globalWeight');
const globalBias = foldedBias(
    model.globalWeights,
    model.globalBias,
    model.globalFeatureMean,
    model.globalFeatureInverseStandardDeviation,
    8,
    3,
    globalScale
);
const globalInputs = COMPONENTS.slice(0, 3).map((component) => `scaledInput.${component}`);
const globalRows = Array.from({ length: 8 }, (_, row) => (
    quantizedRow(model.globalWeights, row, 3, globalInputs, globalScale, globalBias)
));
const globalInputShader = `
    NeuralToken neuralEncodeGlobal(vec4 raw) {
        vec3 scaledInput = raw.xyz * vec3(
            ${model.globalFeatureInverseStandardDeviation.map(glslFloat).join(', ')}
        );
        return NeuralToken(
            max(${vec4(globalRows.slice(0, 4))}, vec4(0.0)),
            max(${vec4(globalRows.slice(4))}, vec4(0.0))
        );
    }
`;

const queryInputs = tokenAccessors('key');
const queryRows = Array.from({ length: 4 }, (_, query) => sumTerms(
    queryInputs.map((input, column) => floatWeightedTerm(
        model.summaryQueries[query * 8 + column],
        input
    ))
));
const queryShader = `
    vec4 neuralQueryScores(NeuralToken key) {
        return ${vec4(queryRows)};
    }
`;

const summaryInputs = [];
for (let query = 0; query < 4; query++) {
    summaryInputs.push(
        ...COMPONENTS.map((component) => `runningSummaryLo[${query}].${component}`),
        ...COMPONENTS.map((component) => `runningSummaryHi[${query}].${component}`)
    );
}
const headScale = scale('headWeight');
const headRows = Array.from({ length: 8 }, (_, row) => (
    quantizedRow(model.headWeights, row, 32, summaryInputs, headScale, model.headBias)
));
const headShader = `
    NeuralToken neuralHead(
        vec4 runningSummaryLo[4],
        vec4 runningSummaryHi[4]
    ) {
        return NeuralToken(
            max(${vec4(headRows.slice(0, 4))}, vec4(0.0)),
            max(${vec4(headRows.slice(4))}, vec4(0.0))
        );
    }
`;

const outputExpression = quantizedRow(
    model.outputWeights,
    0,
    8,
    tokenAccessors('head'),
    scale('outputWeight'),
    [model.outputBias]
);
const outputShader = `
    float neuralOutput(NeuralToken head) {
        return ${outputExpression};
    }
`;

const neuralDenoiseShader = [
    tapInputShader,
    tokenLayer({
        functionName: 'tapOutput',
        scaleName: 'tapOutputWeight',
        weights: model.tapOutputWeights,
        bias: model.tapOutputBias,
        relu: true
    }),
    globalInputShader,
    tokenLayer({
        functionName: 'keyProject',
        scaleName: 'keyWeight',
        weights: model.keyProjectionWeights,
        bias: new Array(8).fill(0)
    }),
    tokenLayer({
        functionName: 'valueProject',
        scaleName: 'valueWeight',
        weights: model.valueProjectionWeights,
        bias: new Array(8).fill(0)
    }),
    queryShader,
    headShader,
    outputShader
].join('\n');

const int8WeightCount = MATRIX_LAYOUTS.reduce((sum, [, field]) => sum + model[field].length, 0);
const nonzeroInt8WeightCount = MATRIX_LAYOUTS.reduce(
    (sum, [, field]) => sum + model[field].filter((value) => value !== 0).length,
    0
);

export {
    model as neuralDenoiseModel,
    neuralDenoiseShader,
    int8WeightCount,
    nonzeroInt8WeightCount
};
