import { mockCordova, mockExec } from '../mocks/cordova';
import Location from './LocationNamespace';

describe('Location', () => {
  let location: Location;

  beforeEach(() => {
    location = new Location();
    mockCordova();
  });

  test('should instantiate Location class', () => {
    expect(location).toBeInstanceOf(Location);
  });

  describe('requestPermission', () => {
    test('should call cordova.exec for requestPermission', () => {
      location.requestPermission();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'requestLocationPermission',
        [],
      );
    });
  });

  describe('setShared', () => {
    test.each([[true], [false]])(
      'should call cordova.exec for setShared with %s',
      (sharedValue) => {
        location.setShared(sharedValue);

        expect(window.cordova.exec).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          'OneSignalPush',
          'setLocationShared',
          [sharedValue],
        );
      },
    );
  });

  describe('isShared', () => {
    test('should return a Promise and call cordova.exec for isShared', () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const promise = location.isShared();
      expect(promise).toBeInstanceOf(Promise);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'isLocationShared',
        [],
      );
      return promise;
    });

    test('should resolve Promise when cordova.exec succeeds', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const result = await location.isShared();
      expect(result).toBe(true);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Location permission denied');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });
      await expect(location.isShared()).rejects.toThrow(mockError.message);
    });
  });
});
