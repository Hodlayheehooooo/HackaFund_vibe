"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const SelectWinnerForm = ({ hackathonId }: { hackathonId: bigint }) => {
  const [winningTeamId, setWinningTeamId] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("HackaFund");

  const handleSelectWinner = async () => {
    try {
      await writeContractAsync({
        functionName: "selectWinner",
        args: [hackathonId, BigInt(winningTeamId)],
      });
    } catch (e) {
      console.error("Error selecting winner:", e);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-bold">Select Winner</h4>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Winning Team ID</span>
        </label>
        <input
          type="number"
          placeholder="Enter Team ID"
          className="input input-bordered"
          value={winningTeamId}
          onChange={e => setWinningTeamId(e.target.value)}
        />
      </div>
      <div className="card-actions justify-end mt-2">
        <button className="btn btn-primary" onClick={handleSelectWinner} disabled={isPending}>
          {isPending ? <span className="loading loading-spinner"></span> : "Select Winner"}
        </button>
      </div>
    </div>
  );
};
