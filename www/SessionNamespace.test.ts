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
});
