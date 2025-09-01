"use client";
"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { CreateHackathonForm } from "~~/components/hackafund/CreateHackathonForm";
import { HackathonList } from "~~/components/hackafund/HackathonList";
import { HostHackathons } from "~~/components/hackafund/HostHackathons";

const HackaFundPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">HackaFund Dashboard</h1>

      <div role="tablist" className="tabs tabs-lifted">
        <a role="tab" className={`tab ${activeTab === "all" ? "tab-active" : ""}`} onClick={() => setActiveTab("all")}>
          All Hackathons
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "host" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("host")}
        >
          Host a Hackathon
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "my-hosted" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("my-hosted")}
        >
          My Hosted Hackathons
        </a>
      </div>

      <div className="mt-8">
        {activeTab === "all" && <HackathonList />}
        {activeTab === "host" && <CreateHackathonForm />}
        {activeTab === "my-hosted" && <HostHackathons />}
      </div>
    </div>
  );
};

export default HackaFundPage;
