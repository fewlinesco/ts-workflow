import makeWorkflow, { UnexpectedError, makePayload } from "../src/workflow";

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

test("it should be true with payload.value === 1", () => {
  expect.assertions(3);
  const neverCalled = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: 1 }, { logger: logger });

  return workflow(payload)
    .catch(() => neverCalled())
    .then(result => {
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Workflow DummyWorkflow successfully passed"
        })
      );
      expect(neverCalled).not.toHaveBeenCalled();
      return true;
    })
    .catch(() => expect(false).toBeTruthy())
    .then(() => {
      return true;
    });
});

test("it should throw UnexpectedError with a negative value in payload", () => {
  expect.assertions(3);
  const neverCalled = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: -1 }, { logger: logger });

  return workflow(payload)
    .then(() => {
      neverCalled();
      return true;
    })
    .catch(e => {
      expect(e).toBeInstanceOf(UnexpectedError);
      expect(logger.error).toHaveBeenCalled();
      return true;
    })
    .then(() => {
      expect(neverCalled).toHaveBeenCalledTimes(0);
      return true;
    })
    .catch(() => expect(false).toBeTruthy())
    .then(() => {
      return true;
    });
});

test("it should throw ItShouldBeOne when number is positive but not equal to 1", () => {
  expect.assertions(3);

  const neverCalled = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };
  const payload = makePayload({ value: 2 }, { logger: logger });

  return workflow(payload)
    .then(() => {
      neverCalled();
      return true;
    })
    .catch(e => {
      expect(e).toBeInstanceOf(ItShouldBeOne);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Workflow DummyWorkflow failed with:\n\t"Input value should be 1"'
        })
      );
      return true;
    })
    .then(() => {
      expect(neverCalled).not.toHaveBeenCalled();
      return true;
    })
    .catch(e => {
      expect(false).toBeTruthy();
      return true;
    })
    .then(() => {
      return true;
    });
});
