import {
  Logger,
  Payload,
  UnexpectedError,
  Workflow,
  makePayload,
  makeWorkflow
} from "./workflow";

export type Logger = Logger;
export type Payload<Input> = Payload<Input>;
export type UnexpectedError = UnexpectedError;
export type Workflow<Input, Result> = Workflow<Input, Result>;

module.exports = {
  makePayload,
  makeWorkflow
};
