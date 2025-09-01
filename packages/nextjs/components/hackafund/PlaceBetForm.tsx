"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const PlaceBetForm = ({ hackathonId }: { hackathonId: bigint }) => {
  const [teamId, setTeamId] = useState("");
  const [amount, setAmount] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("HackaFund");

  const handlePlaceBet = async () => {
    try {
      await writeContractAsync({
        functionName: "placeBet",
        args: [hackathonId, BigInt(teamId)],
        value: parseEther(amount),
      });
    } catch (e) {
      console.error("Error placing bet:", e);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h4 className="font-bold mb-2">Place Your Bet</h4>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Team ID</span>
        </label>
        <input
          type="number"
          placeholder="Enter Team ID"
          className="input input-bordered"
          value={teamId}
          onChange={e => setTeamId(e.target.value)}
        />
      </div>
      <div className="form-control mt-2">
        <label className="label">
          <span className="label-text">Amount (XDC)</span>
        </label>
        <EtherInput value={amount} onChange={setAmount} />
      </div>
      <div className="card-actions justify-end mt-4">
        <button className="btn btn-secondary" onClick={handlePlaceBet} disabled={isPending}>
          {isPending ? <span className="loading loading-spinner"></span> : "Place Bet"}
        </button>
      </div>
    </div>
  );
};
