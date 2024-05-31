import { SmartObjectContext } from "@eveworld/contexts";
import {
  InventoryView,
  GatekeeperView,
  LensSellerView,
} from "@eveworld/ui-components";
import { TYPEIDS } from "@eveworld/utils";
import { useContext } from "react";

export default function EquippedModules() {
  const { smartDeployable } = useContext(SmartObjectContext);

  if (!smartDeployable) return <></>;
  /**
   * From indexer, check to see what modules have been equipped to this smart deployable
   * For every module found to be equipped,
   * render the appropriate module view
   * **/

  switch (smartDeployable.typeId) {
    case TYPEIDS.SMART_STORAGE_UNIT:
      return <InventoryView />;
    case TYPEIDS.GATEKEEPER:
      return <GatekeeperView />;
    case TYPEIDS.LENS_SELLER:
      return <LensSellerView />;
    default:
      return <></>;
  }
}
