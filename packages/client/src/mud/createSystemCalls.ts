/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { getAddress } from 'viem';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { }: ClientComponents
) {
  const registerFid = async (fid: number, addr: string) => {
    try {
      const fid: number = 123456;
      const address = getAddress(addr)
      console.log(`Attempting to Register FID ${fid} with address ${addr}`);
      const tx = await worldContract.write.tn_ns_1__registerFid([fid, address]);
      await waitForTransaction(tx);
      console.log("tx: ", tx)
    } catch (e) {
      console.error("Error registering FID: ", e);
    }
  };

  return {
    registerFid,
  };
}
