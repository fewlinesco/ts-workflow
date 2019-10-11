# ts-workflow

Disclaimer: this package is made for our internal usage and is only open source for convenience so we might not consider Pull Requests or Issues.

A TypeScript implementation of the workflow pattern.

## Usage

Using workflow provides a framework to add error handling and logging to your business logic.

The workflow module exports:

- a `Workflow<Input, Result>` that represent the final function
- a `UnexpectedError` error type. This error is thrown if your business logic throws an undeclared error.
- a `Logger` interface with
  - `info` a function to handle usal logging (e.g. `console.log`, `winston.info`...)
  - `error` a function to handle error logging (e.g. `console.error`, `winston.error`...)
- a `Meta` interface that allows you to put a logger and a set of adapters that will be passed to your business logic.
- a `Payload<Input>` type that contains an `input: Input` and a `meta: Meta` field.
- a `makePayload(input: Input, meta: Meta)` function that should be used to create payloads.
- finally the default export is `makeWorkflow` function that use your business logic function to create a workflow. It accepts:
  - `workflowName: string` this should be unique per workflow and is used to identify your workflow in logs
  - `handleRun: (input: Input, adapters?: object) => Promise<Result>` your actual business logic functions. the input that will be passed is the input contained in the payload. the adapters are the adapters contained in the payload's meta.
  - `acceptableErrors` an Array of error classes that are accepted to be thrown by the workflow.

### Exemple of a workflow declaration

```javascript
// src/workflows/dummy-workflow.ts
import makeWorkflow from "workflow"

// A custom error class
export class WrongInput extends Error {}

// this is your actual business logic
function handleRun(input: Input, adapters: object): Promise<Result> {

  const adapter = adapters["dummyAdapter"] || realImplementation

  return someLogic(adapter(input))
}

// this is the errors you handle
const acceptableErrors = [WrongInput]

export default makeWorkflow("dummyWorkflow", handleRun, acceptableErrors)
```

### Exemple of usage in an express handler

```javascript
// src/handlers/some-module.ts
import {UnexpectedError} from "workflow"
import dummyWorkflow, {WrongInput} from "../worflows/dummy-workflow"

export function dummyHandle(req, res) {
  const payload = makePayload(req.params, {logger: {info: console.log, error: console.error}})

  return dummyWorkflow(payload)
    .then(data => res.status(200).json(data))
    .catch(error => {
      if (error instanceof WrongInput) {
        return res.status(422).json({message: error.message})
      } else {
        return res.status(500).json({message: "An unexpected error happened"})
      }
    })
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
