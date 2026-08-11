# IfDo Semantic Instruction Operands

Status: Implemented

This specification defines a clean-break replacement for opaque serialized
instruction operands in IfDo source. It is intentionally incompatible with the
current catalog-form operand syntax.

## 1. Problem

GDevelop stores every instruction parameter as a string in its legacy event
serializer. The current IfDo catalog form exposes that storage detail directly:
every named argument is an outer JSON string containing the exact stored
parameter text.

This made an ordinary string require two encoded quote layers. That nested
quoting was not domain syntax. It was an implementation detail of the legacy
serializer leaking into the authoring language, making simple literals hard to
read and easy to generate incorrectly.

The generated instruction catalog reinforces the leak through authoring prose
that tells consumers to provide serialized operands and preserve embedded
quotes. A catalog should describe available instructions and semantic parameter
types. It should not teach a storage encoding.

## 2. Goals

1. Make named IfDo instruction arguments semantic and type-aware.
2. Represent an empty text value as `text=""`.
3. Represent ordinary text values directly, for example
   `timer_name="HUD"` and `text="Ready"`.
4. Represent calculated GDevelop expressions explicitly with `expr(...)`.
5. Keep the legacy GDevelop event serializer and runtime behavior unchanged.
6. Remove raw serialized-operand guidance from generated catalog files.
7. Make canonical `.events` output independent of legacy parameter-string
   quoting.
8. Reject operands that cannot be converted through catalog metadata instead
   of falling back to opaque positional strings.
9. Keep instruction type names, named parameter names, scope validation,
   sub-instructions, and event semantics unchanged.

## 3. Non-goals

- Changing GDevelop's legacy event JSON schema or its positional string
  parameter arrays.
- Changing the GDevelop expression language or runtime code generation.
- Adding prose aliases for instruction types.
- Making the instruction catalog an IfDo grammar manual.
- Preserving compatibility with the current IfDo operand syntax.
- Automatically migrating existing `.events` sources or version 1 instruction
  catalogs.
- Changing structural IfDo strings such as group names, comments, link targets,
  metadata fields, or instruction type names containing whitespace.

## 4. Current behavior

The current catalog resolver:

1. Parses every named argument as an untyped IfDo value.
2. Requires the parsed result to be a JavaScript string.
3. Copies that string directly into the legacy positional parameter array.

The current formatter performs the inverse operation by applying
`JSON.stringify` to every stored parameter string. It does not consult the
catalog parameter `type`.

The generated catalog already includes each parameter's GDevelop `type`, along
with optional/default/code-only metadata and accepted values. The catalog
generator also has access to `ValueTypeMetadata`, which can classify parameters
as text, number, boolean, object, behavior, variable, or resource values.

The current `@exact` source form bypasses semantic conversion by embedding the
legacy positional parameter strings. That escape hatch is incompatible with
the goals of this specification.

## 5. Proposed source syntax

### 5.1 Named semantic values

Catalog instruction arguments use ordinary typed IfDo values:

```events
do TextContainerCapability::TextContainerBehavior::SetValue object="MessageText" behavior="Text" modification_sign="=" text=""
do ResetTimer timer_name="HUD"
do SetNumberVariable variable="Health" modification_sign="=" value=100
do SetBooleanVariable variable="RoundActive" value=true
```

String values in this syntax are semantic values. They are not stored GDevelop
expression source.

Names remain strings even when the corresponding legacy parameter is stored
without GDevelop expression quotes:

```events
do Delete object="Enemy"
do PlaySound resource="HitSfx" loop=false volume=55 pitch=0.85
```

The compiler owns the conversion from these semantic values to the exact legacy
parameter strings.

### 5.2 Explicit calculated expressions

A value that must be evaluated by the GDevelop expression engine uses
`expr(...)`:

```events
do TextContainerCapability::TextContainerBehavior::SetValue object="ScoreText" behavior="Text" modification_sign="=" text=expr("Score: " + ToString(Variable(Score)))
do SetNumberVariable variable="Score" modification_sign="=" value=expr(Variable(BaseScore) * 2)
do ResetTimer timer_name=expr(VariableString(ActiveTimer))
```

The contents of `expr(...)` are GDevelop expression source. The IfDo scanner
finds the matching closing parenthesis while respecting nested parentheses and
GDevelop string literals.

`expr(...)` is valid only for catalog parameters whose semantic kind permits a
GDevelop expression. The expression must parse and validate as the primitive
type required by that parameter.

An empty `expr()` is invalid. A literal must use its direct IfDo spelling.

### 5.3 Grammar

The catalog-argument grammar becomes:

```ebnf
catalog-argument = identifier, "=", semantic-operand ;

semantic-operand =
    string-literal
  | number-literal
  | boolean-literal
  | expression-operand ;

expression-operand = "expr", "(", gdevelop-expression, ")" ;
```

Catalog parameters do not accept an arbitrary unquoted raw token. Enumerated
values and symbolic values are represented as semantic strings:

```events
modification_sign="="
comparison_sign=">="
order="asc"
```

This keeps the grammar unambiguous and ensures the catalog parameter type, not
token shape guessing, controls lowering.

### 5.4 Canonical examples

```events
@event aiGeneratedEventId="initialize-ui"
if SceneJustBegins
do ResetTimer timer_name="HUD"
do TextContainerCapability::TextContainerBehavior::SetValue object="MessageText" behavior="Text" modification_sign="=" text=""
do TextContainerCapability::TextContainerBehavior::SetValue object="ScoreText" behavior="Text" modification_sign="=" text=expr("Score: " + ToString(Variable(Score)))
```

Canonical named instruction output never wraps a complete GDevelop text
literal inside another string literal. Consequently, ordinary empty and
non-empty text operands do not contain nested quote escaping.

Escapes that represent characters in the user's actual string value, such as a
newline, remain part of the normal IfDo string-literal grammar. They are not
legacy operand encoding.

## 6. Semantic parameter model

### 6.1 Catalog `valueKind`

Instruction catalog format version 2 adds a required `valueKind` to every
non-code-only parameter:

| `valueKind` | Accepted IfDo source         | Semantic meaning                                                      |
| ----------- | ---------------------------- | --------------------------------------------------------------------- |
| `text`      | string or `expr(...)`        | Text literal or calculated string expression                          |
| `number`    | finite number or `expr(...)` | Numeric literal or calculated numeric expression                      |
| `boolean`   | `true` or `false`            | Boolean value                                                         |
| `object`    | string                       | Object or object-group name                                           |
| `behavior`  | string                       | Behavior instance name                                                |
| `variable`  | string                       | Variable reference/name in the parameter's declared scope             |
| `resource`  | string                       | Project resource name                                                 |
| `name`      | string                       | Other symbolic name, choice, operator, or opaque non-expression value |

Code-only parameters retain `isCodeOnly: true` and do not require
`valueKind`. They are omitted from authored source and synthesized by the
compiler.

`valueKind` is derived from authoritative GDevelop parameter and
`ValueTypeMetadata`, not from a hardcoded instruction-name table. The original
GDevelop parameter `type` remains in the catalog for exact validation,
accepted-value handling, and future classifications.

Catalog generation fails if a non-code-only parameter cannot be assigned a
supported `valueKind`. It must not silently classify an unknown type as raw
text.

### 6.2 Literal lowering

The resolver lowers semantic values as follows:

| `valueKind` | IfDo value | Legacy parameter string                                 |
| ----------- | ---------- | ------------------------------------------------------- |
| `text`      | `""`       | GDevelop empty text literal                             |
| `text`      | `"HUD"`    | GDevelop text literal containing `HUD`                  |
| `number`    | `100`      | `100`                                                   |
| `boolean`   | `true`     | The exact true spelling required by the parameter type  |
| `boolean`   | `false`    | The exact false spelling required by the parameter type |
| `object`    | `"Enemy"`  | `Enemy`                                                 |
| `behavior`  | `"Text"`   | `Text`                                                  |
| `variable`  | `"Health"` | `Health`                                                |
| `resource`  | `"HitSfx"` | `HitSfx`                                                |
| `name`      | `"="`      | `=`                                                     |

Text literal lowering must use GDevelop's canonical expression node printer or
an equivalent shared escape routine. The compiler must not construct expression
source through ad hoc quote concatenation.

Boolean lowering is based on the exact GDevelop parameter type. For example,
`yesorno` and `trueorfalse` may use different legacy spellings while sharing
the same IfDo boolean syntax.

### 6.3 Expression lowering

For `text` and `number`, `expr(...)` is parsed with the GDevelop expression
parser using the target project and event scope. The resulting expression must
match the catalog parameter's required primitive type.

The validated canonical expression source becomes the legacy parameter string.
An expression with unknown functions, invalid object/variable scope, or the
wrong result type is rejected before event JSON is constructed.

No other `valueKind` accepts `expr(...)` in this version. A future semantic kind
may opt in through a versioned catalog and grammar change.

### 6.4 Optional and default parameters

Omitted optional parameters have their catalog default at the semantic level.
The compiler preserves GDevelop's canonical omitted representation by writing
an empty legacy parameter slot. The formatter omits an optional named argument
when its legacy slot is empty. Catalog version 2 stores defaults as semantic
JSON values governed by `valueKind`, not as legacy parameter strings.

Legacy project JSON may omit trailing parameter slots that were added after an
instruction was first serialized. It may also contain blank interior slots for
parameters that current metadata marks required. The formatter omits every
blank slot from the named source form. The resolver reconstructs omitted
positions as empty legacy slots, so no placeholder value or additional source
syntax is needed.

Examples:

```json
{"dslName":"layer","type":"layer","valueKind":"text","isOptional":true,"defaultValue":""}
{"dslName":"volume","type":"number","valueKind":"number","isOptional":true,"defaultValue":100}
{"dslName":"loop","type":"yesorno","valueKind":"boolean","isOptional":true,"defaultValue":false}
```

Catalog generation rejects a default that cannot be converted to the declared
semantic kind. Dynamic expression defaults are not supported in catalog
version 2.

Newly authored instructions must supply required parameters exactly once.
Existing migrated instructions preserve blank required slots by omitting the
corresponding named argument. Code-only parameters must be absent from authored
source.

## 7. Canonical formatting and decompilation

The formatter uses the catalog entry and parameter `valueKind` for every legacy
parameter position.

### 7.1 Text

The formatter parses the stored parameter as a GDevelop text expression:

- A single text-literal node becomes an IfDo string literal.
- Any other valid text expression becomes `expr(<canonical expression>)`.
- Invalid or type-mismatched expression source blocks the save.

Examples:

```text
legacy empty text literal        -> text=""
legacy "HUD" text literal        -> timer_name="HUD"
legacy concatenation expression  -> text=expr("Score: " + ToString(Variable(Score)))
```

### 7.2 Numbers

- A finite numeric literal becomes an IfDo number.
- Any other valid numeric expression becomes `expr(<canonical expression>)`.
- Non-finite or invalid numeric source blocks the save.

### 7.3 Booleans, names, and references

Boolean legacy spellings are normalized to `true` or `false`. Objects,
behaviors, variables, resources, choices, and other names are emitted as IfDo
strings after catalog-aware validation.

### 7.4 No raw fallback

Canonical formatting must not fall back to `@exact` or another source construct
that embeds positional legacy parameter strings. Migration normalizes stale
registered signatures before formatting: it clears code-only data, omits
invalid closed-choice or boolean slots, aligns an inserted parameter with its
catalog default when a following value still matches, and canonicalizes
multiline expression whitespace outside string literals.

If an imported project uses a removed instruction absent from current metadata,
migration infers a minimal semantic named signature from its persisted uses and
stores that entry in the deprecated catalog. This inference is compatibility
data for the existing project, not an authoring API.

The `@exact` instruction form is removed from the accepted project `.events`
grammar. Instruction-depth prefixes and named catalog instructions continue to
represent logical sub-instruction trees.

## 8. Generated instruction catalog

### 8.1 Format version

`.gdevelop/instructions-catalog.json` and
`.gdevelop/deprecated-instructions-catalog.json` move from format version 1 to
format version 2.

Version 2 parameter entries contain semantic `valueKind` and semantic defaults.
Version 1 catalogs are rejected.

The deprecated catalog may also contain migration-inferred semantic signatures
for removed instructions found in an imported project. The normal authoring
catalog never receives these entries.

### 8.2 Catalog content

The generated catalog is data, not an encoding guide. The top-level
`authoring` object is removed, including:

- `catalogConditionSyntax`
- `catalogActionSyntax`
- Embedded grammar/encoding rules
- Advice about legacy event JSON parameter representation

No replacement catalog prose discusses quoting, escaping, positional parameter
strings, or serializer internals.

IfDo syntax belongs in the checked-in DSL specification and the project
authoring skill. Catalog entries contain only project/version-specific facts:
instruction types, descriptions, scopes, owners, parameter names and semantic
types, accepted values, optional/default metadata, and deprecation state.

Example compact entry:

```json
{
  "type": "TextContainerCapability::TextContainerBehavior::SetValue",
  "name": "Text",
  "eventScopes": ["scene"],
  "parameters": [
    { "dslName": "object", "type": "object", "valueKind": "object" },
    { "dslName": "behavior", "type": "behavior", "valueKind": "behavior" },
    {
      "dslName": "modification_sign",
      "type": "operator",
      "valueKind": "name",
      "acceptedValues": ["=", "+", "-"]
    },
    { "dslName": "text", "type": "string", "valueKind": "text" }
  ]
}
```

The serialized catalog must not contain generated authoring sentences about
operand encoding.

### 8.3 Deprecated catalog

The deprecated catalog uses the same version 2 semantic parameter contract.
It remains separate from the authoring catalog and may be merged internally to
load instructions that are still registered but deprecated.

Deprecation policy is unchanged: new authored events use only current catalog
entries.

## 9. Public format and API changes

### 9.1 IfDo source

Breaking changes:

- Catalog string arguments now mean semantic string values.
- Numeric arguments are JSON numbers rather than strings containing numeric
  source.
- Boolean arguments are `true` or `false`.
- Calculated text and number expressions require `expr(...)`.
- Arbitrary unquoted catalog argument tokens are rejected.
- `@exact` is removed from project source.

Structural metadata continues to use its existing typed value parser.

### 9.2 Catalog schema

Breaking changes:

- `formatVersion` becomes `2`.
- Non-code-only parameters require `valueKind`.
- `defaultValue` becomes semantic and type-matched.
- The top-level `authoring` object is removed.

### 9.3 JavaScript APIs

`parseCatalogInstructionArguments` no longer returns an untyped string map. It
returns a typed operand AST or is replaced by a catalog-aware parser owned by
`ProjectInstructionCatalog`.

`createCatalogInstructionResolver` and
`createCatalogInstructionFormatter` keep their roles but implement semantic
conversion. Their accepted catalog schema changes to version 2.

No runtime API changes are required.

## 10. Compatibility and migration

This is an intentional clean break.

- The new parser does not accept version 1 catalog operand syntax.
- Version 1 catalogs are rejected.
- The new formatter never emits the old syntax.
- There is no compatibility branch, warning-only reader, automatic rewrite, or
  hidden fallback.
- Existing repository fixtures, templates, examples, and tests are rewritten
  in the implementation change.
- Existing external projects using the experimental multi-file format must be
  regenerated from an authoritative legacy project representation or recreated
  with the new format. The editor does not mutate old `.events` files in place.

The legacy single-file GDevelop project JSON format remains supported because
this change affects only IfDo source and its generated catalogs. Converting
legacy project JSON into new multi-file sources always emits semantic operands.

## 11. Diagnostics and error handling

New or revised diagnostics include:

| Code                               | Meaning                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `IFDO_CATALOG_VERSION_UNSUPPORTED` | Catalog is not format version 2                                |
| `IFDO_CATALOG_VALUE_KIND_MISSING`  | A non-code-only parameter lacks `valueKind`                    |
| `IFDO_CATALOG_VALUE_KIND_INVALID`  | `valueKind` is unknown or incompatible with parameter metadata |
| `IFDO_OPERAND_TYPE_MISMATCH`       | IfDo literal type does not match `valueKind`                   |
| `IFDO_EXPRESSION_NOT_ALLOWED`      | `expr(...)` is used for a non-expression parameter             |
| `IFDO_EXPRESSION_TYPE_MISMATCH`    | Expression result type does not match the parameter            |
| `IFDO_EXPRESSION_INVALID`          | Expression parsing or project-scope validation failed          |
| `IFDO_PARAMETER_UNREPRESENTABLE`   | A legacy parameter cannot be formatted semantically            |
| `IFDO_EXACT_REMOVED`               | Source uses the removed `@exact` form                          |

Diagnostics identify the line, instruction type, parameter `dslName`, expected
semantic kind, and received source form. They do not recommend legacy
serializer syntax.

Project save remains transactional. Any catalog-generation, decompilation, or
round-trip failure occurs before source or catalog replacement.

## 12. Affected layers and files

Primary implementation:

- `newIDE/app/src/EventsSheet/IfDoEventsDsl/index.js`
  - typed catalog operand tokenizer and AST
  - balanced `expr(...)` scanner
  - removal of `@exact` parsing/formatting
- `newIDE/app/src/EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog.js`
  - catalog version 2 validation
  - semantic resolver and formatter
  - literal/expression lowering and decompilation
  - legacy blank/signature normalization and removed-instruction inference
- `newIDE/app/src/Mcp/McpEventKnowledge.js`
  - `valueKind` generation
  - semantic default generation
  - removal of catalog `authoring` content

Project storage and catalog orchestration:

- `newIDE/app/src/ProjectsStorage`
  - catalog version checks
  - transactional failure propagation
- Multi-file project composition/decomposition call sites that construct the
  resolver or formatter

Documentation and authoring guidance:

- `docs/gdevelop-events-dsl-spec.md`
- `docs/gdevelop-new-formats-spec.md`
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/references/events-dsl.md`
- Related constants/examples references that currently show catalog operands

The implementation is incomplete unless both project-authoring skill files are
updated in the same change:

- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
  must teach semantic catalog arguments, direct text literals, typed numbers
  and booleans, and `expr(...)`. Its event-authoring section must remove the old
  serialized-operand and embedded-quote instructions and use only version 2
  catalog examples.
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/references/events-dsl.md`
  must update its catalog-instruction grammar, rules, and examples to the same
  semantic syntax. It must remove the old raw-operand guidance and must not
  document `@exact` as accepted project syntax.

Tests:

- `newIDE/app/src/EventsSheet/IfDoEventsDsl/index.spec.js`
- `newIDE/app/src/EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog.spec.js`
- Multi-file compose/decompose, catalog serialization, round-trip, and
  validation specs under `newIDE/app/src/ProjectsStorage`
- Project-template skill snapshot or resource tests

The authoritative GDevelop parameter classification remains in Core metadata.
If JavaScript cannot derive all required `valueKind` values from exposed
metadata, the missing `ValueTypeMetadata` query is added to the bindings and
generated declarations rather than duplicating an incomplete type list.

## 13. Performance

Literal lowering is constant work per parameter.

Expression operands require parsing and validation. Decompilation already
performs project-level validation; expression parsing adds work proportional to
the expression source length. Implementations may cache a result by:

```text
catalog version + instruction type + parameter index + operand source + scope
```

The cache must be bounded to the current compile/decompile operation. No
cross-project cache is allowed because object, variable, behavior, resource,
and extension scopes differ.

Catalog size changes are negligible. Removing the repeated `authoring` object
reduces generated catalog size; adding `valueKind` increases each parameter
entry slightly.

## 14. Security and correctness

- `expr(...)` is parsed as GDevelop expression source; it never executes during
  compilation.
- Expression validation uses the exact target project and event scope.
- Object, behavior, variable, resource, and accepted-value checks occur before
  constructing legacy events.
- The balanced scanner has explicit source-size and nesting-depth limits
  consistent with the existing IfDo parser.
- Generated catalog descriptions are treated as data and never parsed as
  syntax.
- Unknown current metadata classifications fail closed. Removed legacy
  instructions are isolated to inferred entries in the deprecated catalog.

## 15. Rollout and implementation order

After approval, implementation proceeds as one atomic breaking-format change:

1. Add authoritative semantic parameter classification and catalog version 2.
2. Add typed operand AST parsing and `expr(...)`.
3. Add semantic lowering, expression validation, and canonical formatting.
4. Remove `@exact` project-source support and raw fallback.
5. Remove the generated catalog `authoring` object.
6. Update multi-file storage orchestration and version diagnostics.
7. Update
   `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
   and
   `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/references/events-dsl.md`
   to teach only semantic operands and `expr(...)`.
8. Rewrite the remaining checked-in docs, templates, examples, fixtures, and
   tests.
9. Run focused IfDo and storage tests, Flow, lint, formatting checks, and the
   required Windows desktop background launcher.

Catalog generation, parser, formatter, project storage, documentation, and
templates must land together. There is no mixed-version rollout.

## 16. Test plan

### 16.1 Parser and resolver

- `text=""` lowers to the legacy empty text expression.
- `text="Ready"` lowers to a GDevelop text literal.
- `timer_name="HUD"` lowers correctly.
- Numeric literals lower without string authoring syntax.
- Booleans lower to the exact spelling required by each boolean parameter type.
- Object, behavior, variable, resource, operator, and accepted-choice strings
  lower without expression quoting.
- `expr(...)` handles nested calls, nested parentheses, whitespace, and string
  literals.
- Text expressions are rejected for numeric parameters and vice versa.
- `expr(...)` is rejected for name/reference/resource parameters.
- Blank stored operands, omitted required legacy positions, duplicate/unknown
  arguments, optional/default values, and code-only parameters retain their
  defined behavior.
- Unquoted raw catalog tokens are rejected.
- `@exact` produces `IFDO_EXACT_REMOVED`.

### 16.2 Formatter

- Empty and non-empty stored text literals emit direct IfDo strings.
- Dynamic text and number expressions emit `expr(...)`.
- No canonical named instruction nests a complete GDevelop text literal inside
  an outer operand string.
- Names and symbolic values emit semantic strings.
- Invalid stored expressions fail instead of falling back.
- Logical sub-instructions remain structurally identical.
- Multiline expressions preserve string-literal content and canonicalize only
  insignificant outer line whitespace.
- Removed legacy instructions receive deterministic deprecated signatures.

### 16.3 Catalog

- Version 2 is deterministic and line-oriented.
- Every non-code-only parameter has the correct `valueKind`.
- Defaults are semantic and type-matched.
- Catalog JSON has no top-level `authoring` object.
- Catalog JSON contains no generated encoding/escaping guidance.
- Version 1 is rejected.
- Unknown parameter classification blocks generation.
- The bundled `gdevelop-project-files` skill and its `events-dsl.md` reference
  contain no old operand examples or instructions and consistently use direct
  literals plus `expr(...)`.

### 16.4 Round trip

For every current non-deprecated instruction and every registered deprecated
instruction required by fixtures:

```text
legacy JSON -> semantic IfDo -> legacy JSON
```

must preserve normalized event structure, parameter order and values,
instruction flags, sub-instruction trees, and event semantics.

Coverage includes string literals, string expressions, number literals, number
expressions, booleans, objects, behaviors, variables, resources, operators,
choices, empty optional values, and code-only parameters.

### 16.5 Project storage

- New projects generate version 2 catalogs and semantic `.events`.
- Legacy single-file JSON conversion generates only the new source form.
- Version 1 multi-file sources/catalogs fail before writes.
- Transaction recovery leaves the old project intact after any semantic
  formatting failure.

## 17. Alternatives considered

### 17.1 Special-case only the empty text literal

Interpreting only `text=""` specially would remove the immediate visual issue
but leave every other value as an opaque serialized operand. It would also make
empty text behave differently from non-empty text. Rejected.

### 17.2 Keep raw operands and add a shorthand

A shorthand such as `empty`, `literal("")`, or a second quoting delimiter
would preserve the underlying storage-oriented model. Authors would still need
to know when a parameter expects legacy expression source. Rejected.

### 17.3 Infer literals versus expressions from string contents

Guessing from parentheses, operators, or identifier shapes is ambiguous and
already causes quoting mistakes. The explicit `expr(...)` form is deterministic
and type-checkable. Rejected.

### 17.4 Retain `@exact` as a compatibility fallback

`@exact` would preserve a path for opaque positional parameter strings and
therefore preserve the encoding leak. The requested design explicitly does not
require compatibility. Rejected.

### 17.5 Put syntax instructions in every generated catalog

Generated catalogs would repeat stable language documentation and could drift
from the parser. The catalog should contain only project-specific semantic
facts. Rejected.

## 18. Open questions

There are no product-level open questions in this proposal:

- Compatibility is explicitly not required.
- Direct literals plus explicit `expr(...)` are the selected source model.
- Raw `@exact` source is removed.
- Generated catalogs contain semantic metadata and no operand-encoding
  guidance.

Implementation may discover a GDevelop parameter type that cannot be classified
through currently exposed metadata. That is an implementation defect to resolve
by exposing the authoritative Core classification, not a reason to add a raw
operand fallback.
