"use client";

import { useState } from "react";

const CONTRACT_ADDRESS = "0x7f2e721B91A4C92ffBA3C11B2D1c2b8b9a68FD9E";
const TOKEN_ADDRESS    = "0x3386fD670E77FC179A16F8D8C73c765d6e7CeC7b";

export default function StakingUI() {
  const [account, setAccount] = useState("");
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState("");

  // ── Connect ─────────────────────────────
  const connect = async () => {
    if (!window.ethereum) return alert("MetaMask жоқ");
    const acc = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(acc[0]);
  };

  // ── Stake (Approve + Stake бірге) ───────
  const handleStake = async () => {
    if (!account) return alert("Connect wallet");
    if (!amount)  return alert("Enter amount");

    try {
      setLoading(true);
      setStatus("Approving...");

      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();

      const token = new ethers.Contract(
        TOKEN_ADDRESS,
        ["function approve(address,uint256)"],
        signer
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function stake(uint256)"],
        signer
      );

      const value = ethers.parseUnits(amount, 18);

      // APPROVE
      const tx1 = await token.approve(CONTRACT_ADDRESS, value);
      await tx1.wait();

      setStatus("Staking...");

      // STAKE
      const tx2 = await contract.stake(value);
      await tx2.wait();

      setStatus("Success ✅");
      setAmount("");
    } catch (e) {
      setStatus("Error ❌");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Unstake ─────────────────────────────
  const handleUnstake = async () => {
    try {
      setLoading(true);
      setStatus("Unstaking...");

      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ["function unstake()"],
        signer
      );

      const tx = await contract.unstake();
      await tx.wait();

      setStatus("Unstaked 💰");
    } catch (e) {
      setStatus("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  const short = (a) => a && `${a.slice(0,6)}...${a.slice(-4)}`;

  // ── UI ──────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <h2 style={styles.title}>⚡ Staking App</h2>

        {/* Wallet */}
        <button onClick={connect} style={styles.connect}>
          {account ? short(account) : "Connect Wallet"}
        </button>

        {/* Input */}
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />

        {/* Stake */}
        <button
          onClick={handleStake}
          disabled={loading}
          style={styles.primary}
        >
          {loading ? "Processing..." : "Stake"}
        </button>

        {/* Unstake */}
        <button
          onClick={handleUnstake}
          disabled={loading}
          style={styles.danger}
        >
          Unstake
        </button>

        {/* Status */}
        {status && <p style={styles.status}>{status}</p>}

      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #020617, #0f172a)",
    fontFamily: "monospace",
  },

  card: {
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.05)",
    padding: 30,
    borderRadius: 16,
    width: 320,
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  title: {
    textAlign: "center",
    color: "#38bdf8",
    marginBottom: 10,
  },

  connect: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#1e293b",
    color: "#38bdf8",
    cursor: "pointer",
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#020617",
    color: "#fff",
  },

  primary: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#22c55e",
    color: "#020617",
    fontWeight: "bold",
    cursor: "pointer",
  },

  danger: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },

  status: {
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
  },
};