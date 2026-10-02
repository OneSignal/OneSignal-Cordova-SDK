import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { mockCordova } from '../mocks/cordova';
import Session from './SessionNamespace';

describe('Session', () => {
  let session: Session;

  beforeEach(() => {
    session = new Session();
    mockCordova();
  });

  test('should instantiate Session class', () => {
    expect(session).toBeInstanceOf(Session);
  });

  describe('addOutcome', () => {
    test('should call cordova.exec with correct parameters', () => {
      const outcomeName = 'test_outcome';

      session.addOutcome(outcomeName);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addOutcome',
        [outcomeName],
      );
    });
  });

  describe('addUniqueOutcome', () => {
    test('should call cordova.exec with correct parameters', () => {
      const outcomeName = 'unique_test_outcome';

      session.addUniqueOutcome(outcomeName);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addUniqueOutcome',
        [outcomeName],
      );
    });
  });

  describe('addOutcomeWithValue', () => {
    test('should call cordova.exec with correct parameters', () => {
      const outcomeName = 'purchase_value';
      const outcomeValue = 99.99;

      session.addOutcomeWithValue(outcomeName, outcomeValue);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addOutcomeWithValue',
        [outcomeName, outcomeValue],
      );
    });
  });

  describe('addOutcomeWithValue value', () => {
    test.each([-5, 0, 0.5])('should allow value %s', (value) => {
      session.addOutcomeWithValue('purchase', value);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addOutcomeWithValue',
        ['purchase', value],
      );
    });

    test.each([NaN, Infinity, -Infinity, '5', null, undefined])(
      'should not call cordova.exec for value %s',
      (value) => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        session.addOutcomeWithValue('purchase', value as unknown as number);

        expect(consoleSpy).toHaveBeenCalledWith(
          '[OneSignal] addOutcomeWithValue: value must be a finite number',
        );
        expect(window.cordova.exec).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      },
    );
  });

  describe('empty names', () => {
    test.each(['', null, undefined])('should not call cordova.exec for name %s', (name) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const missing = name as unknown as string;

      session.addOutcome(missing);
      session.addUniqueOutcome(missing);
      session.addOutcomeWithValue(missing, 1);

      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] addOutcome: name is required');
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] addUniqueOutcome: name is required');
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] addOutcomeWithValue: name is required');
      expect(window.cordova.exec).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
