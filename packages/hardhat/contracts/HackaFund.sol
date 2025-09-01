// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HackaFund {
    // State Variables
    uint256 private _nextHackathonId;
    uint256 private _nextTeamId;
    address public owner;
    uint256 public protocolFeeBps;

    enum HackathonStatus { Open, InProgress, Closed, WinnerSelected }

    struct PrizeDistribution {
        uint256 protocolCutBps;
        uint256 teamCutBps;
        uint256 speculatorCutBps;
    }

    struct HackathonEvent {
        uint256 id;
        address host;
        string name;
        uint256 totalPrizePool;
        HackathonStatus status;
        PrizeDistribution distribution;
        uint256 winningTeamId;
        bool protocolFeesWithdrawn;
    }

    struct Team {
        uint256 id;
        uint256 hackathonId;
        address payable teamAddress;
        string name;
        uint256 totalBets;
        bool prizeClaimed;
    }

    struct Bet {
        address speculator;
        uint256 amount;
        bool winningsClaimed;
    }

    mapping(uint256 => HackathonEvent) public hackathons;
    mapping(uint256 => Team) public teams;
    mapping(uint256 => Bet[]) public betsByTeam;
    mapping(uint256 => uint256[]) public teamIdsByHackathon;

    // Events
    event HackathonCreated(uint256 indexed hackathonId, address indexed host, string name);
    event TeamRegistered(uint256 indexed hackathonId, uint256 indexed teamId, string name, address teamAddress);
    event BetPlaced(uint256 indexed teamId, address indexed speculator, uint256 amount, uint256 upfrontContribution);
    event WinnerSelected(uint256 indexed hackathonId, uint256 indexed winningTeamId);
    event WinningsClaimed(uint256 indexed teamId, address indexed speculator, uint256 amount);
    event TeamPrizeClaimed(uint256 indexed teamId, uint256 amount);
    event ProtocolFeesWithdrawn(uint256 amount);

    // Modifiers
    modifier onlyHost(uint256 _hackathonId) {
        require(hackathons[_hackathonId].host == msg.sender, "Only the host can perform this action");
        _;
    }

    constructor(uint256 _initialProtocolFeeBps) {
        owner = msg.sender;
        protocolFeeBps = _initialProtocolFeeBps;
    }

    function createHackathon(
        string memory _name,
        uint256 _protocolCutBps,
        uint256 _teamCutBps,
        uint256 _speculatorCutBps
    ) external {
        require(bytes(_name).length > 0, "Hackathon name cannot be empty");
        require(_protocolCutBps + _teamCutBps + _speculatorCutBps == 10000, "Prize distribution must sum to 100%");

        uint256 hackathonId = _nextHackathonId++;
        hackathons[hackathonId] = HackathonEvent({
            id: hackathonId,
            host: msg.sender,
            name: _name,
            totalPrizePool: 0,
            status: HackathonStatus.Open,
            distribution: PrizeDistribution(_protocolCutBps, _teamCutBps, _speculatorCutBps),
            winningTeamId: 0,
            protocolFeesWithdrawn: false
        });

        emit HackathonCreated(hackathonId, msg.sender, _name);
    }

    function registerTeam(uint256 _hackathonId, string memory _name, address payable _teamAddress) external {
        require(hackathons[_hackathonId].status == HackathonStatus.Open, "Hackathon is not open for registration");
        require(bytes(_name).length > 0, "Team name cannot be empty");
        require(_teamAddress != address(0), "Invalid team address");

        uint256 teamId = _nextTeamId++;
        teams[teamId] = Team({
            id: teamId,
            hackathonId: _hackathonId,
            teamAddress: _teamAddress,
            name: _name,
            totalBets: 0,
            prizeClaimed: false
        });
        teamIdsByHackathon[_hackathonId].push(teamId);

        emit TeamRegistered(_hackathonId, teamId, _name, _teamAddress);
    }

    function placeBet(uint256 _teamId, uint256 _upfrontBps) external payable {
        Team storage team = teams[_teamId];
        require(team.id == _teamId, "Team does not exist");
        uint256 hackathonId = team.hackathonId;
        require(hackathons[hackathonId].status == HackathonStatus.Open, "Betting is not open");
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(_upfrontBps <= 10000, "Upfront percentage cannot exceed 100%");

        uint256 upfrontAmount = (msg.value * _upfrontBps) / 10000;
        
        team.totalBets += msg.value;
        hackathons[hackathonId].totalPrizePool += msg.value;
        
        betsByTeam[_teamId].push(Bet(msg.sender, msg.value, false));

        if (upfrontAmount > 0) {
            (bool success, ) = team.teamAddress.call{value: upfrontAmount}("");
            require(success, "Upfront transfer failed");
        }

        emit BetPlaced(_teamId, msg.sender, msg.value, upfrontAmount);
    }

    function selectWinner(uint256 _hackathonId, uint256 _winningTeamId) external onlyHost(_hackathonId) {
        HackathonEvent storage hackathon = hackathons[_hackathonId];
        require(hackathon.status == HackathonStatus.Open, "Hackathon is not open");
        require(teams[_winningTeamId].hackathonId == _hackathonId, "Winning team is not from this hackathon");

        hackathon.winningTeamId = _winningTeamId;
        hackathon.status = HackathonStatus.WinnerSelected;

        emit WinnerSelected(_hackathonId, _winningTeamId);
    }

    function claimWinnings(uint256 _teamId) external {
        Team storage team = teams[_teamId];
        require(team.id == _teamId, "Team does not exist");
        uint256 hackathonId = team.hackathonId;
        HackathonEvent storage hackathon = hackathons[hackathonId];
        require(hackathon.status == HackathonStatus.WinnerSelected, "Winner not selected yet");
        require(hackathon.winningTeamId == _teamId, "This team did not win");

        uint256 totalWinnings = (hackathon.totalPrizePool * hackathon.distribution.speculatorCutBps) / 10000;
        uint256 userWinnings = 0;

        for (uint i = 0; i < betsByTeam[_teamId].length; i++) {
            Bet storage bet = betsByTeam[_teamId][i];
            if (bet.speculator == msg.sender && !bet.winningsClaimed) {
                uint256 winnings = (bet.amount * totalWinnings) / team.totalBets;
                userWinnings += winnings;
                bet.winningsClaimed = true;
            }
        }

        require(userWinnings > 0, "No winnings to claim or already claimed");
        (bool success, ) = msg.sender.call{value: userWinnings}("");
        require(success, "Winnings transfer failed");

        emit WinningsClaimed(_teamId, msg.sender, userWinnings);
    }

    function claimTeamPrize(uint256 _teamId) external {
        Team storage team = teams[_teamId];
        require(team.id == _teamId, "Team does not exist");
        require(msg.sender == team.teamAddress, "Only winning team can claim");
        uint256 hackathonId = team.hackathonId;
        HackathonEvent storage hackathon = hackathons[hackathonId];
        require(hackathon.status == HackathonStatus.WinnerSelected, "Winner not selected yet");
        require(hackathon.winningTeamId == _teamId, "This team did not win");
        require(!team.prizeClaimed, "Prize already claimed");

        uint256 prizeAmount = (hackathon.totalPrizePool * hackathon.distribution.teamCutBps) / 10000;
        team.prizeClaimed = true;

        (bool success, ) = team.teamAddress.call{value: prizeAmount}("");
        require(success, "Prize transfer failed");

        emit TeamPrizeClaimed(_teamId, prizeAmount);
    }

    function withdrawProtocolFees() external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        uint256 totalFees = 0;

        for (uint i = 0; i < _nextHackathonId; i++) {
            HackathonEvent storage hackathon = hackathons[i];
            if (hackathon.status == HackathonStatus.WinnerSelected && !hackathon.protocolFeesWithdrawn) {
                totalFees += (hackathon.totalPrizePool * hackathon.distribution.protocolCutBps) / 10000;
                hackathon.protocolFeesWithdrawn = true;
            }
        }

        require(totalFees > 0, "No fees to withdraw");
        (bool success, ) = owner.call{value: totalFees}("");
        require(success, "Fee transfer failed");

        emit ProtocolFeesWithdrawn(totalFees);
    }
}
