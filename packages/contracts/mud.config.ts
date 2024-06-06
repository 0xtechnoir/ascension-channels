import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "tn_ns_1",
  tables: {
    FidRegistry: {
      valueSchema: {
        fid: "uint32",
        playerAddress: "address",
      },
    },
  },
});