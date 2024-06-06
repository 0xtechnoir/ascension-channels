import React, { useEffect, useState } from "react";
import { useMUD } from "../mud/MUDContext";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, getComponentValue } from "@latticexyz/recs";

export const MudComponent = () => {
  const {
    components: { FidRegistry },
    network: { playerEntity },
    systemCalls: { registerFid },
  } = useMUD();

  // const [myAddr, setMyAddr] = useState<any>("");

  const registeredUsers = useEntityQuery([Has(FidRegistry)]);
  if (registeredUsers) {
    console.log("registeredUsers: ", registeredUsers);
    // loop through gameSessions and find the one with the matching gameId
    for (let i = 0; i < registeredUsers.length; i++) {
      const user = registeredUsers[i];
      const rec = getComponentValue(FidRegistry, user);
      console.log("user:");
      console.dir(rec);
      // if (rec?.gameId === gameId) {
      //   gameIsLive = rec.isLive;
      //   setGameIsWon(rec.isWon);
      // }
    }
  }

  

  // console.log("playerEntity: ", playerEntity);
  // const myFid: number = 192644;
  // useEffect(() => {

    

  //   const fetchData = async () => {
  //     const address = await getPlayerAddress(myFid);
  //     if (address) {
  //       setMyAddr(address);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const fid = 192644;
  const myAddr = "0x1234567890123456789012345678901234567890";

  return <div>
    <button onClick={() => registerFid(fid, myAddr)}>Register Fid</button>
  </div>;
};
