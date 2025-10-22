import { mockCordova, mockExec } from '../mocks/cordova';
import InAppMessages from './InAppMessagesNamespace';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDisplayEvent,
} from './models/InAppMessage';

describe('InAppMessages', () => {
  let inAppMessages: InAppMessages;

  beforeEach(() => {
    inAppMessages = new InAppMessages();
    mockCordova();
  });

  test('should instantiate InAppMessages class', () => {
    expect(inAppMessages).toBeInstanceOf(InAppMessages);
  });

  describe('addEventListener', () => {
    const messageData = {
      click: {
        message: { messageId: 'test' },
        result: { closingMessage: true, actionId: 'test' },
      } satisfies InAppMessageClickEvent,
      willDisplay: {
        message: { messageId: 'test' },
      } satisfies InAppMessageWillDisplayEvent,
      didDisplay: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDisplayEvent,
      willDismiss: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDismissEvent,
      didDismiss: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDismissEvent,
    };

    test.each([
      ['click', 'setInAppMessageClickHandler', messageData.click],
      [
        'willDisplay',
        'setOnWillDisplayInAppMessageHandler',
        messageData.willDisplay,
      ],
      [
        'didDisplay',
        'setOnDidDisplayInAppMessageHandler',
        messageData.didDisplay,
      ],
      [
        'willDismiss',
        'setOnWillDismissInAppMessageHandler',
        messageData.willDismiss,
      ],
      [
        'didDismiss',
        'setOnDidDismissInAppMessageHandler',
        messageData.didDismiss,
      ],
    ] as const)(
      'should call cordova.exec for %s event',
      (eventType, methodName, data) => {
        const mockListener = vi.fn();
        inAppMessages.addEventListener(eventType, mockListener);

        expect(window.cordova.exec).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          'OneSignalPush',
          methodName,
          [],
        );

        // call to process listner
        mockExec.mock.calls[0][0](data);

        expect(mockListener).toHaveBeenCalledWith(data);
      },
    );
  });

  describe('removeEventListener', () => {
    test.each([
      ['click'],
      ['willDisplay'],
      ['didDisplay'],
      ['willDismiss'],
      ['didDismiss'],
    ] as const)('should remove %s event listener', (eventType) => {
      const mockListener = vi.fn();
      inAppMessages.addEventListener(eventType, mockListener);
      inAppMessages.removeEventListener(eventType, mockListener);

      // No cordova.exec call for removeEventListener, just internal array manipulation
      expect(window.cordova.exec).toHaveBeenCalledTimes(1); // Only the addEventListener call

      mockExec.mock.calls[0][0]('some-data');
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('addTrigger', () => {
    test('should call cordova.exec for addTrigger', () => {
      inAppMessages.addTrigger('key', 'value');

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTriggers',
        [{ key: 'value' }],
      );
    });
  });

  describe('addTriggers', () => {
    test('should call cordova.exec for addTriggers with string values', () => {
      const triggers = { key1: 'value1', key2: 'value2' };
      inAppMessages.addTriggers(triggers);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTriggers',
        [triggers],
      );
    });

    test('should convert non-string values to JSON strings', () => {
      const triggers = { key1: 'value1', key2: 123, key3: true };

      // @ts-expect-error - we want to test the conversion of non-string values to JSON strings
      inAppMessages.addTriggers(triggers);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTriggers',
        [{ key1: 'value1', key2: '123', key3: 'true' }],
      );
    });
  });

  describe('removeTrigger', () => {
    test('should call cordova.exec for removeTrigger', () => {
      inAppMessages.removeTrigger('key');

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeTriggers',
        [['key']],
      );
    });
  });

  describe('removeTriggers', () => {
    test('should call cordova.exec for removeTriggers with valid array', () => {
      const keys = ['key1', 'key2'];
      inAppMessages.removeTriggers(keys);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeTriggers',
        [keys],
      );
    });

    test('should handle non-array input gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      inAppMessages.removeTriggers('not-an-array' as any);

      expect(consoleSpy).toHaveBeenCalledWith(
        'OneSignal: removeTriggers: argument must be of type Array',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearTriggers', () => {
    test('should call cordova.exec for clearTriggers', () => {
      inAppMessages.clearTriggers();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'clearTriggers',
      );
    });
  });

  describe('setPaused', () => {
    test.each([[true], [false]])(
      'should call cordova.exec for setPaused with %s',
      (pauseValue) => {
        inAppMessages.setPaused(pauseValue);

        expect(window.cordova.exec).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          'OneSignalPush',
          'setPaused',
          [pauseValue],
        );
      },
    );
  });

  describe('getPaused', () => {
    test('should return a Promise and call cordova.exec for getPaused', async () => {
      const promise = inAppMessages.getPaused();
      expect(promise).toBeInstanceOf(Promise);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'isPaused',
        [],
      );
    });

    test('should resolve Promise when cordova.exec succeeds', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const result = await inAppMessages.getPaused();
      expect(result).toBe(true);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Test error');
      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });

      await expect(inAppMessages.getPaused()).rejects.toThrow('Test error');
    });
  });
});
