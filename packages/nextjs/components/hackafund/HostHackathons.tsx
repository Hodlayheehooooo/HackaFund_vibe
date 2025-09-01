"use client";

import { SelectWinnerForm } from "./SelectWinnerForm";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const statusMap = ["Open", "In Progress", "Closed", "Winner Selected"];

const HackathonCard = ({ hackathonId }: { hackathonId: bigint }) => {
  const { data: hackathon } = useScaffoldReadContract({
    contractName: "HackaFund",
    functionName: "hackathons",
    args: [hackathonId],
  });

  if (!hackathon) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-md mb-4">
      <div className="card-body">
        <h3 className="card-title">{hackathon.name}</h3>
        <p>Status: {statusMap[hackathon.status]}</p>
        <p>Prize Pool: {formatEther(hackathon.prizePool)} XDC</p>
        {hackathon.status === 2 && <SelectWinnerForm hackathonId={hackathonId} />}
      </div>
    </div>
  );
};

export const HostHackathons = () => {
  const { address } = useAccount();
  const { data: events, isLoading } = useScaffoldEventHistory({
    contractName: "HackaFund",
    eventName: "HackathonCreated",
    fromBlock: 0n,
    filters: { host: address },
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
      <h2 className="text-2xl font-bold mb-4">Your Hosted Hackathons</h2>
      {events?.length === 0 ? (
        <p>You have not hosted any hackathons yet.</p>
      ) : (
        events?.map(event => <HackathonCard key={event.log.transactionHash} hackathonId={event.args.hackathonId} />)
      )}
    </div>
  );
};
