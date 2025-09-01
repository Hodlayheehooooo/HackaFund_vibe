"use client";

import React from "react";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface WinningTeamCardProps {
  key: React.Key;
  hackathonId: bigint;
  winningTeamId: bigint;
}

const WinningTeamCard = ({ hackathonId, winningTeamId }: WinningTeamCardProps) => {
  const { data: hackathon } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "hackathons",
    args: [hackathonId],
  });

  const { data: team } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "teams",
    args: [winningTeamId],
  });

  const { writeContractAsync, isPending } = useScaffoldWriteContract("HackaFund");

  const handleClaim = async () => {
    try {
      await writeContractAsync({
        functionName: "claimWinnings",
        args: [winningTeamId],
      });
    } catch (e) {
      console.error("Error claiming winnings:", e);
    }
  };

  if (!hackathon || !team) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-md mb-4">
      <div className="card-body">
        <h3 className="card-title">{hackathon.name}</h3>
        <p>
          Winning Team: {team.name} (ID: {winningTeamId.toString()})
        </p>
        <div className="card-actions justify-end">
          <button className="btn btn-success" onClick={handleClaim} disabled={isPending}>
            {isPending ? <span className="loading loading-spinner"></span> : "Claim Your Winnings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClaimWinnings = () => {
  const { data: events, isLoading } = useScaffoldEventHistory({
    contractName: "HackaFund",
    eventName: "WinnerSelected",
    fromBlock: 0n,
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Claim Winnings</h2>
      {events?.length === 0 ? (
        <p>No hackathons have a winner selected yet.</p>
      ) : (
        events?.map(event => (
          <WinningTeamCard
            key={event.log.transactionHash}
            hackathonId={event.args.hackathonId}
            winningTeamId={event.args.winningTeamId}
          />
        ))
      )}
    </div>
  );
};
