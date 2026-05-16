import type { Metadata } from "next";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: "MemeBlast",
  description: "Dodge falling objects and auto-shoot your way to a high score.",
};

export default function GamePage() {
  return <GameClient />;
}
