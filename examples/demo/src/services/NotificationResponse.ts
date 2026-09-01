export type NotificationResponseDisposition = 'success' | 'retry' | 'failure';

function isResponseObject(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object' && !Array.isArray(data);
}

export function getNotificationResponseDisposition(data: unknown): NotificationResponseDisposition {
  if (!isResponseObject(data)) return 'failure';

  const errors = data.errors;
  const invalidPlayerIds =
    isResponseObject(errors) &&
    Array.isArray(errors.invalid_player_ids) &&
    errors.invalid_player_ids.length > 0;
  const notSubscribed =
    Array.isArray(errors) &&
    errors.some(
      (error) =>
        typeof error === 'string' &&
        error.trim().toLowerCase() === 'all included players are not subscribed',
    );
  const zeroRecipients = typeof data.recipients === 'number' && data.recipients === 0;

  if (invalidPlayerIds || notSubscribed || zeroRecipients) return 'retry';

  const hasValidId = typeof data.id === 'string' && data.id.length > 0;
  if (hasValidId && data.errors === undefined) return 'success';

  return 'failure';
}
