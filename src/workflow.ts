import * as crypto from "crypto";

export class UnexpectedError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.stack = error.stack;
  }
}

export type Workflow<Input, Result> = (
  payload: Payload<Input>,
  adapters?: object
) => Promise<Result>;

interface LoggingInput {
  label: string;
  message: string;
}
export interface Logger {
  info: (message: LoggingInput) => void;
  error: (message: LoggingInput) => void;
}

interface Meta {
  logger: Logger;
  adapters?: object;
}

export interface Payload<Input> {
  input: Input;
  meta: Meta;
}

const log_workflow_failed = (
  workflowName: string,
  errorMessage: string,
  logger: Logger,
  workflowId: string
) =>
  logger.info({
    message: `Workflow ${workflowName} failed with:\n\t"${errorMessage}"`,
    label: workflowId
  });

const log_unexpected_failure = (
  workflowName: string,
  error: Error,
  logger: Logger,
  workflowId: string
) =>
  logger.error({
    message: `Workflow ${workflowName} unexpectedly failed with:\n\t"${error}"`,
    label: workflowId
  });

const log_workflow_succeed = (
  workflowName: string,
  logger: Logger,
  workflowId: string
) => {
  logger.info({
    message: `Workflow ${workflowName} successfully passed`,
    label: workflowId
  });
};

export function makePayload<Input>(input: Input, meta: Meta) {
  return {
    input,
    meta
  };
}

export function makeWorkflow<Input, Result>(
  workflowName: string,
  handleRun: (payload: Input, adapters?: object) => Promise<Result>,
  acceptableErrors: Array<Function>
): Workflow<Input, Result> {
  return payload => {
    const workflowId = crypto.randomBytes(20).toString("hex");
    return handleRun(payload.input, payload.meta.adapters)
      .then(result => {
        log_workflow_succeed(workflowName, payload.meta.logger, workflowId);
        return result;
      })
      .catch(e => {
        if (
          acceptableErrors.find(acceptableError => e instanceof acceptableError)
        ) {
          log_workflow_failed(
            workflowName,
            e.message,
            payload.meta.logger,
            workflowId
          );
          throw e;
        } else {
          log_unexpected_failure(
            workflowName,
            e,
            payload.meta.logger,
            workflowId
          );
          throw new UnexpectedError(e);
        }
      });
  };
}
