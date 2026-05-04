/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Party = "BJP" | "TMC" | "OTHERS";

export interface Constituency {
  id: string;
  name: string;
  candidateName?: string;
  leading_party: Party;
  bjp_votes: number;
  tmc_votes: number;
  others_votes: number;
  last_leading_party?: Party;
}

export interface ElectionStats {
  bjp: number;
  tmc: number;
  others: number;
  total: number;
}
