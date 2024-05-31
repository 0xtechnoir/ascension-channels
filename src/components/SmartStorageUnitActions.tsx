import { useState, useContext, useRef, useEffect } from "react";
import {
  SmartObjectContext,
  FeedbackContext,
  WalletContext,
  WorldContext,
} from "@eveworld/contexts";

import { isOwner } from "@eveworld/utils";
import { Close } from "@eveworld/assets";
import { Actions, Severity, State } from "@eveworld/types";
import { TextEdit } from "@eveworld/ui-components";
import { Modal } from "@mui/material";

export default function SmartStorageUnitActions() {
  const [showEditUnit, setShowEditUnit] = useState<boolean>(false);

  const { smartDeployable, isCurrentChain } = useContext(SmartObjectContext);
  const { walletClient, publicClient } = useContext(WalletContext);
  const { world } = useContext(WorldContext);
  const { handleSendTx } = useContext(FeedbackContext);

  if (smartDeployable === undefined || smartDeployable === null) return <></>;

  const isEntityOwner: boolean = isOwner(
    smartDeployable,
    walletClient?.account?.address
  );

  // If smart deployable is online, user is allowed to bring  offline
  const isOnline: boolean = smartDeployable.stateId === State.ONLINE;

  const handleAction = async (action: Actions) => {
    if (!world || !smartDeployable || !walletClient?.account || !publicClient)
      return;

    const getAction = async () => {
      if (!walletClient?.account) return;

      switch (action) {
        case Actions.BRING_OFFLINE:
          return publicClient.simulateContract({
            ...world,
            functionName: "eveworld__bringOffline",
            args: [BigInt(smartDeployable.id)],
            account: walletClient.account.address,
          });
        case Actions.BRING_ONLINE:
          return publicClient.simulateContract({
            ...world,
            functionName: "eveworld__bringOnline",
            args: [BigInt(smartDeployable.id)],
            account: walletClient.account.address,
          });
        default:
      }
    };

    const txRequest = await getAction();

    return txRequest && handleSendTx(txRequest.request);
  };

  const getDappUrl = (): string => {
    if (!smartDeployable?.dappUrl) return "";

    var pattern = /^((http|https|ftp):\/\/)/;

    let url = smartDeployable.dappUrl;
    if (!pattern.test(url)) {
      url = "http://" + url;
    }

    return url;
  };

  return (
    <div className="Quantum-Container font-semibold grid grid-cols-3 gap-2">
      <button
        onClick={() => setShowEditUnit(!showEditUnit)}
        className="primary primary-sm"
        disabled={!isCurrentChain || !isEntityOwner}
      >
        Edit unit
      </button>

      <button
        onClick={() =>
          handleAction(isOnline ? Actions.BRING_OFFLINE : Actions.BRING_ONLINE)
        }
        className="primary primary-sm"
        disabled={!isCurrentChain || !isEntityOwner}
      >
        {isOnline ? Actions.BRING_OFFLINE : Actions.BRING_ONLINE}
      </button>
      <button
        className="primary primary-sm"
        onClick={() => window.open(getDappUrl())}
        disabled={!smartDeployable?.dappUrl}
      >
        dApp link
      </button>

      <EditUnit
        visible={showEditUnit}
        handleClose={() => setShowEditUnit(false)}
      />
    </div>
  );
}

function EditUnit({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: () => void;
}) {
  const [isEdited, setIsEdited] = useState<boolean>(false);

  const { walletClient, publicClient } = useContext(WalletContext);
  const { world } = useContext(WorldContext);
  const { handleSendTx, handleOpenToast } = useContext(FeedbackContext);
  const { smartDeployable } = useContext(SmartObjectContext);

  // Every time the Edit Unit modal closes it should return to its default, unedited state
  useEffect(() => {
    setIsEdited(false);
  }, [visible]);

  const urlValueRef = useRef(smartDeployable?.dappUrl ?? "");
  const nameValueRef = useRef(smartDeployable?.name ?? "");
  const descriptionValueRef = useRef(smartDeployable?.description ?? "");

  const handleEdit = (
    refString: React.MutableRefObject<string>,
    eventString: string
  ): void => {
    setIsEdited(true);
    refString.current = eventString;
  };

  /** Async function that calls ´setEntityRecordOffchain´,
   * setting Smart Deployable URL, name, description in one transaction.
   **/
  const handleSave = async () => {
    if (!world || !smartDeployable || !walletClient?.account || !publicClient)
      return;

    try {
      const txRequest = await publicClient.simulateContract({
        ...world,
        functionName: "eveworld__setEntityMetadata",
        args: [
          BigInt(smartDeployable.id),
          nameValueRef.current,
          urlValueRef.current,
          descriptionValueRef.current,
        ],
        account: walletClient.account.address,
      });

      handleSendTx(txRequest.request, () => handleClose());
    } catch (e) {
      handleOpenToast(
        Severity.Error,
        undefined,
        "Transaction failed to execute"
      );
      console.error(e);
    }
  };

  return (
    <Modal open={visible} onClose={() => handleClose()}>
      <div className="Absolute-Center w-[280px] bg-crude !p-0">
        <div className="flex justify-between bg-brightquantum text-crude items-center pl-2 text-sm font-bold">
          Edit Unit
          <button className="primary border border-crude w-7 !p-0">
            <Close className="text-crude" onClick={() => handleClose()} />
          </button>
        </div>
        <div className="Quantum-Container !border-t-0 !py-4 grid gap-2">
          <TextEdit
            isMultiline={false}
            defaultValue={smartDeployable?.dappUrl}
            onChange={(str) => handleEdit(urlValueRef, str)}
            fieldType="DApp URL"
          />
          <TextEdit
            isMultiline={false}
            defaultValue={smartDeployable?.name}
            onChange={(str) => handleEdit(nameValueRef, str)}
            fieldType="Unit name"
          />
          <TextEdit
            isMultiline={true}
            defaultValue={smartDeployable?.description}
            onChange={(str) => handleEdit(descriptionValueRef, str)}
            fieldType="Unit description"
          />
          <div className="mb-2" />
          <div className="grid grid-cols-4 gap-2">
            <button className="ghost uppercase" onClick={() => handleClose()}>
              Cancel
            </button>
            <button
              className="primary primary-sm uppercase col-span-3"
              onClick={() => handleSave()}
              disabled={!isOwner || !isEdited}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
