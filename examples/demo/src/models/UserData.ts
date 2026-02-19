export interface UserData {
  aliases: Record<string, string>;
  tags: Record<string, string>;
  emails: string[];
  smsNumbers: string[];
  externalId?: string;
}

function toStringRecord(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, item]) => typeof item === 'string',
  ) as [string, string][];
  return Object.fromEntries(entries);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

export function userDataFromJson(json: Record<string, unknown>): UserData {
  const aliasesFromAliases = toStringRecord(json.aliases);
  const aliases =
    Object.keys(aliasesFromAliases).length > 0
      ? aliasesFromAliases
      : toStringRecord(json.identity);
  const tags = toStringRecord(json.tags);

  const externalId =
    (typeof json.external_id === 'string' && json.external_id) ||
    aliases.external_id;

  const emails = toStringArray(json.emails);
  const smsNumbers = toStringArray(json.sms_numbers);

  return {
    aliases,
    tags,
    emails,
    smsNumbers,
    externalId: externalId || undefined,
  };
}
