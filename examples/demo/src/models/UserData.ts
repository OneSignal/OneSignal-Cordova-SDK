export interface UserData {
  aliases: Record<string, string>;
  tags: Record<string, string>;
  emails: string[];
  smsNumbers: string[];
  externalId?: string;
}

export function userDataFromJson(json: Record<string, unknown>): UserData {
  const identity =
    typeof json.identity === 'object' && json.identity !== null
      ? (json.identity as Record<string, unknown>)
      : {};
  const properties =
    typeof json.properties === 'object' && json.properties !== null
      ? (json.properties as Record<string, unknown>)
      : {};
  const subscriptions = Array.isArray(json.subscriptions)
    ? (json.subscriptions as Array<Record<string, unknown>>)
    : [];

  const aliases = Object.fromEntries(
    Object.entries(identity)
      .filter(
        ([key, value]) =>
          key !== 'external_id' &&
          key !== 'onesignal_id' &&
          typeof value === 'string',
      )
      .map(([key, value]) => [key, String(value)]),
  );

  const tagsSource =
    typeof properties.tags === 'object' && properties.tags !== null
      ? (properties.tags as Record<string, unknown>)
      : {};
  const tags = Object.fromEntries(
    Object.entries(tagsSource)
      .filter(([, value]) => typeof value === 'string')
      .map(([key, value]) => [key, String(value)]),
  );

  const emails: string[] = [];
  const smsNumbers: string[] = [];
  subscriptions.forEach((subscription) => {
    const type = subscription.type;
    const token = subscription.token;
    if (type === 'Email' && typeof token === 'string') {
      emails.push(token);
    } else if (type === 'SMS' && typeof token === 'string') {
      smsNumbers.push(token);
    }
  });

  const externalId =
    typeof identity.external_id === 'string' ? identity.external_id : undefined;

  return {
    aliases,
    tags,
    emails,
    smsNumbers,
    externalId,
  };
}
