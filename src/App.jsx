import { Analytics } from "@vercel/analytics/react";
import CoreValuesSortApp from "./CoreValuesSortApp";

export default function App() {
  return (
    <>
      <CoreValuesSortApp />
      <Analytics />
    </>
  );
}