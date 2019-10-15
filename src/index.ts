import {
  Logger,
  Payload,
  UnexpectedError,
  Workflow,
  makePayload as workflowMakePayload,
  makeWorkflow as workflowMakeWorkflow
} from "./workflow";

export type Logger = Logger;
export type Payload<Input> = Payload<Input>;
export type UnexpectedError = UnexpectedError;
export type Workflow<Input, Result> = Workflow<Input, Result>;

export const makePayload = workflowMakePayload;
export const makeWorkflow = workflowMakePayload;
