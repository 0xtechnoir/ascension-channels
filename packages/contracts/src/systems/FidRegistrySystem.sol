pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { FidRegistry, FidRegistryTableId } from "../codegen/index.sol";
import "forge-std/console.sol";

contract FidRegistrySystem is System {
  function registerFid(uint32 fid, address owner) public {
    FidRegistry.set(fid, owner);
    console.log("Registered FID %d to address %s", fid, owner);
  }

  function getPlayerAddress(uint32 fid) public view returns (address) {
    return FidRegistry.getPlayerAddress(fid);
  }

  function deleteFid(uint32 fid) public {
    FidRegistry.deleteRecord(fid);
  }
}


