"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const CreateHackathonForm = () => {
  const [name, setName] = useState("");
  const [protocolCutBps, setProtocolCutBps] = useState("300");
  const [teamCutBps, setTeamCutBps] = useState("1500");
  const [speculatorCutBps, setSpeculatorCutBps] = useState("8200");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("HackaFund");

  const handleSubmit = async () => {
    const totalBps = parseInt(protocolCutBps) + parseInt(teamCutBps) + parseInt(speculatorCutBps);
    if (totalBps !== 10000) {
      notification.error("The sum of all cuts must be 10000 basis points (100%).");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "createHackathon",
        args: [name, BigInt(protocolCutBps), BigInt(teamCutBps), BigInt(speculatorCutBps)],
      });
      setName("");
      notification.success("Hackathon created successfully!");
    } catch (e) {
      console.error("Error creating hackathon:", e);
      notification.error("Error creating hackathon.");
    }
  };

  return (
    <div className="card bg-base-200 shadow-md mb-8">
      <div className="card-body">
        <h2 className="card-title">Create a New Hackathon</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Hackathon Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g., ETH Global Istanbul"
            className="input input-bordered"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Protocol Cut (BPS)</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={protocolCutBps}
            onChange={e => setProtocolCutBps(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Team Cut (BPS)</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={teamCutBps}
            onChange={e => setTeamCutBps(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Speculator Cut (BPS)</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={speculatorCutBps}
            onChange={e => setSpeculatorCutBps(e.target.value)}
          />
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <span className="loading loading-spinner"></span> : "Create Hackathon"}
          </button>
        </div>
      </div>
    </div>
  );
};
