"use client";

import { formatEther } from "viem";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TeamCard = ({ teamId }: { teamId: bigint }) => {
  const { data: team } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "teams",
    args: [teamId],
  });

  const { writeContractAsync: claimPrize, isPending } = useScaffoldWriteContract("HackaFund");

  const handleClaim = async () => {
    try {
      await claimPrize({
        functionName: "claimPrize",
        args: [teamId],
      });
    } catch (e) {
      console.error("Error claiming prize:", e);
    }
  };

  if (!team) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-md mb-4">
      <div className="card-body">
        <h3 className="card-title">{team.name}</h3>
        <p>Total Bets: {formatEther(team.totalBets)} XDC</p>
        <p>Prize Pool Share: {formatEther(team.prizePoolShare)} XDC</p>
        {team.prizePoolShare > 0 && (
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={handleClaim} disabled={isPending}>
              {isPending ? <span className="loading loading-spinner"></span> : "Claim Prize"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const TeamStatus = () => {
  const { data: events, isLoading } = useScaffoldEventHistory({
    contractName: "HackaFund",
    eventName: "TeamCreated",
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
      <h2 className="text-2xl font-bold mb-4">Your Team Status</h2>
      {events?.length === 0 ? (
        <p>No teams created yet.</p>
      ) : (
        events?.map(event => <TeamCard key={event.log.transactionHash} teamId={event.args.teamId} />)
      )}
    </div>
  );
};
