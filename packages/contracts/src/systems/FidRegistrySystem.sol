pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { FidRegistry, FidRegistryTableId } from "../codegen/index.sol";
import { addressToEntityKey } from "../addressToEntityKey.sol";
import "forge-std/console.sol";

contract FidRegistrySystem is System {
  function registerFid(uint32 fid, address owner) public {
    bytes32 player = addressToEntityKey(_msgSender());
    FidRegistry.set(player, fid, owner);
    console.log("Registered FID %d to address %s", fid, owner);
  }

  function deleteFid(uint32 fid) public {
    bytes32 player = addressToEntityKey(_msgSender());
    FidRegistry.deleteRecord(player);
  }
}


