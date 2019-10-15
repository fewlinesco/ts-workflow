import { UnexpectedError, makePayload, makeWorkflow } from "../src/workflow";

class NegativeNumbersAreForbidden extends Error {}

class ItShouldBeOne extends Error {}

interface Input {
  value: number;
}

const handleRun = (payload: Input) => {
  if (payload.value === 1) {
    return Promise.resolve(true);
  } else if (payload.value < 0) {
    return Promise.reject(
      new NegativeNumbersAreForbidden("Input value should not be negative")
    );
  } else {
    return Promise.reject(new ItShouldBeOne("Input value should be 1"));
  }
};

const workflow = makeWorkflow("DummyWorkflow", handleRun, [ItShouldBeOne]);

test("it should be true with payload.value === 1", async () => {
  expect.assertions(2);

  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: 1 }, { logger: logger });

  await expect(workflow(payload)).resolves.toBe(true);

  expect(logger.info).toHaveBeenCalledWith(
    expect.objectContaining({
      message: "Workflow DummyWorkflow successfully passed"
    })
  );
});

test("it should throw UnexpectedError with a negative value in payload", async () => {
  expect.assertions(2);

  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: -1 }, { logger: logger });

  await expect(workflow(payload)).rejects.toBeInstanceOf(UnexpectedError);

  expect(logger.error).toHaveBeenCalled();
});

test("it should throw ItShouldBeOne when number is positive but not equal to 1", async () => {
  expect.assertions(2);

  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: 2 }, { logger: logger });

  await expect(workflow(payload)).rejects.toBeInstanceOf(ItShouldBeOne);
  expect(logger.info).toHaveBeenCalledWith(
    expect.objectContaining({
      message:
        'Workflow DummyWorkflow failed with:\n\t"Input value should be 1"'
    })
  );
});
