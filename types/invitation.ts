export const INVITATION_STATUSES = ["pending", "accepted", "rejected"] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export interface Invitation {
  pairId: string;
  fromUid: string;
  toUid: string;
  participants: string[];
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function getInvitationPairId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

export function getInvitationParticipants(
  uidA: string,
  uidB: string
): [string, string] {
  return [uidA, uidB].sort() as [string, string];
}
