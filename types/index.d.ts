import { OSNotification, NotificationReceivedEvent, OpenedEvent, OpenedEventAction, OpenedEventActionType } from './Notification';
import { OutcomeEvent } from './Outcomes';
import { InAppMessageAction } from './InAppMessage';
import { PermissionChange, SubscriptionChange, EmailSubscriptionChange, SMSSubscriptionChange, DeviceState, IosPermissionStatus } from './Subscription';
import { LogLevel, ChangeEvent } from './Extras';
import { OneSignalPlugin } from './OneSignalPlugin';
export declare const OneSignal: OneSignalPlugin;
export { OneSignalPlugin };
export default OneSignal;
