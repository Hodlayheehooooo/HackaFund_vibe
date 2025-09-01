"use client";

import { PlaceBetForm } from "./PlaceBetForm";
import { formatEther } from "viem";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TeamDetails = ({ teamId }: { teamId: bigint }) => {
  const { data: team } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "teams",
    args: [teamId],
  });

  if (!team) {
    return null;
  }

  return (
    <div className="ml-4 border-l-2 pl-4">
      <p className="font-semibold">{team.name}</p>
      <p>Total Bets: {formatEther(team.totalBets)} XDC</p>
    </div>
  );
};

const HackathonCard = ({ hackathonId }: { hackathonId: bigint }) => {
  const { data: hackathon } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "hackathons",
    args: [hackathonId],
  });

  const { data: teamEvents } = useScaffoldEventHistory({
    contractName: "HackaFund",
    eventName: "TeamCreated",
    fromBlock: 0n,
    filters: { hackathonId },
  });

  if (!hackathon) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-md mb-8">
      <div className="card-body">
        <h3 className="card-title">{hackathon.name}</h3>
        <p>Prize Pool: {formatEther(hackathon.prizePool)} XDC</p>
        <div className="my-4">
          <h4 className="font-bold">Teams:</h4>
          {teamEvents?.map(event => <TeamDetails key={event.log.transactionHash} teamId={event.args.teamId} />)}
        </div>
        <PlaceBetForm hackathonId={hackathonId} />
      </div>
    </div>
  );
};

export const HackathonList = () => {
  const { data: events, isLoading } = useScaffoldEventHistory({
    contractName: "HackaFund",
    eventName: "HackathonCreated",
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
    <div className="max-w-4xl mx-auto">
      {events?.length === 0 ? (
        <p>No hackathons available yet.</p>
      ) : (
        events?.map(event => <HackathonCard key={event.log.transactionHash} hackathonId={event.args.hackathonId} />)
      )}
    </div>
  );
};
