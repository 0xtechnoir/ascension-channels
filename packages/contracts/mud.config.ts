import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "tn_ns_1",
  tables: {
    FidRegistry: {
      keySchema: {
        fid: "uint32"
      },
      valueSchema: {
        playerAddress: "address",
      },
    },
  },
});