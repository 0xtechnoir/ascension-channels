import { useContext, useEffect } from "react";

import { SmartObjectContext, FeedbackContext } from "@eveworld/contexts";
import {
  SmartDeployableInfo,
  NotFound,
  NetworkMismatch,
  EveLoadingAnimation,
  ClickToCopy,
} from "@eveworld/ui-components";
import { abbreviateAddress } from "@eveworld/utils";
import { Severity } from "@eveworld/types";

import SmartStorageUnitActions from "./SmartStorageUnitActions";
import EquippedModules from "./Modules";
import BaseImage from "../assets/base-image.png";

export default function EntityView() {
  const { smartDeployable, loading, isCurrentChain } =
    useContext(SmartObjectContext);
  const { handleOpenToast, handleClose } = useContext(FeedbackContext);

  useEffect(() => {
    if (loading) {
      handleOpenToast(Severity.Info, undefined, "Loading...");
    } else {
      handleClose();
    }
  }, [loading]);

  if (!loading && !smartDeployable) {
    return <NotFound />;
  }

  return (
    <EveLoadingAnimation position="diagonal">
      <div className="grid border border-brightquantum bg-crude">
        <div className="flex flex-col align-center border border-brightquantum">
          <div className="bg-brightquantum text-crude flex items-stretch justify-between px-2 py-1 font-semibold">
            <span className="uppercase">{smartDeployable?.name}</span>
            <span className="flex flex-row items-center">
              {abbreviateAddress(smartDeployable?.id)}
              <ClickToCopy
                text={smartDeployable?.id}
                className="text-crude"
              />{" "}
            </span>
          </div>
          <img src={BaseImage} />
          <SmartStorageUnitActions />

          <div className="Quantum-Container Title">Description</div>
          <div className="Quantum-Container font-normal text-xs !py-4">
            {smartDeployable?.description}
            {!isCurrentChain && (
              <NetworkMismatch
                eveType={smartDeployable?.__typename}
                itemName={smartDeployable?.name ?? ""}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 mobile:grid-cols-1 bg-crude">
          <SmartDeployableInfo />
          <EquippedModules />
        </div>
      </div>
    </EveLoadingAnimation>
  );
}
