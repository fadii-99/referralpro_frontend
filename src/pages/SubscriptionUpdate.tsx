import React, { useEffect, useState, useCallback } from "react";
import Button from "../components/Button";
import SmallLoader from "../components/SmallLoader";

type Billing = "monthly" | "yearly" | "";
type PlanKey = "starter" | "growth" | "custom";

const PLAN_ORDER: Record<Exclude<PlanKey, "custom">, 0 | 1> = {
  starter: 0,
  growth: 1,
};

const PLAN_META = {
  starter: { name: "Starter", seatsLabel: "5 seats", baseSeats: 5, monthlyPrice: 99 },
  growth: { name: "Growth", seatsLabel: "25 seats", baseSeats: 25, monthlyPrice: 299 },
};

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const yearlyWithDiscount = (monthlyTotal: number) => Math.round(monthlyTotal * 12 * 0.9);

function computeTotals(plan: PlanKey, mode: Billing, customSeats?: number) {
  if (plan === "custom") {
    const perSeat = 20;
    const monthlyTotal = (customSeats || 5) * perSeat;
    const total = mode === "monthly" ? monthlyTotal : mode === "yearly" ? monthlyTotal * 12 : 0;
    return { total, display: total ? `${money(total)}${mode === "monthly" ? "/mon" : "/yr"}` : "—" };
  }
  const meta = PLAN_META[plan];
  const cardBaseMonthly = Math.ceil(meta.monthlyPrice / meta.baseSeats) * meta.baseSeats - 1;
  const total = mode === "monthly" ? cardBaseMonthly : mode === "yearly" ? yearlyWithDiscount(cardBaseMonthly) : 0;
  return { total, display: total ? `${money(total)}${mode === "monthly" ? "/mon" : "/yr"}` : "—" };
}

const StatusPill: React.FC<{ status: "Paid" | "Unpaid" }> = ({ status }) => {
  const map: Record<string, string> = {
    Paid: "text-green-600 bg-green-100",
    Unpaid: "text-rose-600 bg-rose-100",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
};

const SubscriptionUpdate: React.FC = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<0 | 1 | 3 | null>(0);
  const [customSeats, setCustomSeats] = useState<number>(5);
  const [customBilling, setCustomBilling] = useState<Billing>("");

  // Dummy overview + invoices
  const [overview, setOverview] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      // 🔽 Example API (commented)
      /*
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/subscription/details`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      setOverview(data.overview);
      setInvoices(data.invoices);
      */
      // 🔽 Dummy data
      setOverview({
        plan: "Growth",
        amount: "$299 /month (25 seats)",
        billed: "Billed Annually",
        nextPayment: "Jul 19th, 2026",
      });
      setInvoices([
        { id: "INV-2024-001", status: "Unpaid", amount: "$150", due: "June 15, 2024" },
        { id: "INV-2024-002", status: "Paid", amount: "$150", due: "July 15, 2024" },
        { id: "INV-2024-003", status: "Paid", amount: "$150", due: "Aug 15, 2024" },
      ]);
    } catch (err) {
      console.error("Error fetching subscription data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleBillingSwitch = (mode: Billing) => {
    setBilling(mode);
    if (selectedPlanId === null || selectedPlanId === 3) setSelectedPlanId(0);
  };
  const handleCustomBillingSelect = (mode: Billing) => setCustomBilling(mode);
  const handleSelectPlan = (plan: PlanKey) => {
    if (plan === "custom") {
      setSelectedPlanId(3);
      setCustomBilling("");
    } else {
      setSelectedPlanId(PLAN_ORDER[plan]);
    }
  };
  const handleUpdate = () => alert("Subscription updated!");

  
  const PlanCard: React.FC<{ id: "starter" | "growth" }> = ({ id }) => {
    const meta = PLAN_META[id];
    const totals = computeTotals(id, billing, customSeats);
    const planId = PLAN_ORDER[id];
    const selected = selectedPlanId === planId;
    return (
      <button
        type="button"
        onClick={() => handleSelectPlan(id)}
        className={[
          "relative w-full rounded-2xl sm:px-5 px-3 sm:py-6 py-4 text-left border transition-shadow",
          selected ? "bg-primary-purple text-white border-primary-purple shadow-lg"
                   : "bg-white text-primary-blue border-primary-blue/20 hover:shadow-md",
        ].join(" ")}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold opacity-90">{meta.name}</div>
            <div className="mt-1 text-[11px] opacity-70">{meta.seatsLabel}</div>
          </div>
          <div className={["w-5 h-5 rounded-full border flex items-center justify-center", selected ? "border-white bg-white/20" : "border-primary-blue/30"].join(" ")}>
            {selected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold tracking-tight">{totals.display.split("/")[0]}</span>
          <span className="ml-1 text-sm opacity-80">{billing === "monthly" ? "/mon" : "/yr"}</span>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SmallLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-[#F4F2FA] px-4 py-8">
      <h2 className="text-xl font-bold text-primary-blue mb-2">Subscription & Billing</h2>

      {/* Grid: Overview (left) + Update Subscription (right) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Overview */}
        {overview && (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h3 className="text-lg font-semibold text-primary-blue mb-4">Subscription Overview</h3>
            <div>
              <div className="font-semibold text-primary-purple mb-3">
                {overview.plan}{" "}
                <span className="text-gray-700 font-normal ml-2">{overview.amount}</span>
              </div>
              <div className="text-xs text-gray-500 my-1">• {overview.billed}</div>
              <div className="text-xs text-gray-500">• Next payment: {overview.nextPayment}</div>
            </div>
          </div>
        )}

        {/* Update Subscription (Cards) */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 text-sm font-semibold text-primary-blue mb-8">
            <button onClick={() => handleBillingSwitch("monthly")}
              className={`relative pb-2 ${billing === "monthly" && selectedPlanId !== 3 ? "text-primary-purple" : "text-primary-blue/70"}`}>
              Monthly
              {billing === "monthly" && selectedPlanId !== 3 && <span className="absolute left-0 -bottom-[2px] h-0.5 w-full bg-primary-purple rounded-full" />}
            </button>
            <button onClick={() => handleBillingSwitch("yearly")}
              className={`relative pb-2 ${billing === "yearly" && selectedPlanId !== 3 ? "text-primary-purple" : "text-primary-blue/70"}`}>
              Yearly
              {billing === "yearly" && selectedPlanId !== 3 && <span className="absolute left-0 -bottom-[2px] h-0.5 w-full bg-primary-purple rounded-full" />}
            </button>
            <button onClick={() => handleSelectPlan("custom")}
              className={`relative pb-2 ${selectedPlanId === 3 ? "text-primary-purple" : "text-primary-blue/70"}`}>
              Custom
              {selectedPlanId === 3 && <span className="absolute left-0 -bottom-[2px] h-0.5 w-full bg-primary-purple rounded-full" />}
            </button>
          </div>

          {/* Custom Plan */}
          {selectedPlanId === 3 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-primary-blue mb-2 mt-6">Select custom seats</h4>
              <label className="block text-xs text-primary-blue/70 mb-1">Per seat: $20</label>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={customSeats}
                onChange={(e) => setCustomSeats(Number(e.target.value))}
                className="w-full accent-primary-purple"
              />
              <div className="flex justify-between text-xs text-primary-blue font-semibold mt-1 mb-6">
                <span>Seats: {customSeats}</span>
                <span>
                  Total:{" "}
                  {customBilling === "monthly"
                    ? `$${customSeats * 20}/mon`
                    : customBilling === "yearly"
                    ? `$${customSeats * 20 * 12}/yr`
                    : "—"}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-xs text-primary-blue font-semibold mb-2">Duration</div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCustomBillingSelect("monthly")}
                    className={`w-full rounded-xl px-3 py-3 border text-left transition-all ${
                      customBilling === "monthly"
                        ? "bg-white border-primary-purple ring-2 ring-primary-purple/30"
                        : "bg-white border-primary-blue/20 hover:shadow-sm"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => handleCustomBillingSelect("yearly")}
                    className={`w-full rounded-xl px-3 py-3 border text-left transition-all ${
                      customBilling === "yearly"
                        ? "bg-white border-primary-purple ring-2 ring-primary-purple/30"
                        : "bg-white border-primary-blue/20 hover:shadow-sm"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Starter / Growth */}
          {selectedPlanId !== 3 && (
            <div className="grid grid-cols-2 gap-4">
              <PlanCard id="starter" />
              <PlanCard id="growth" />
            </div>
          )}

          <div className="mt-6">
            <Button text="Update Subscription" onClick={handleUpdate} />
          </div>
        </div>
      </div>

      {/* Billing Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h3 className="text-lg font-semibold text-primary-blue mb-6">Billing Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full md:text-sm text-xs text-left">
            <thead>
              <tr className="text-gray-500 font-semibold">
                <th className="px-4 py-2 text-nowrap">Invoice #</th>
                <th className="px-4 py-2 text-nowrap">Status</th>
                <th className="px-4 py-2 text-nowrap">Amount</th>
                <th className="px-4 py-2 text-nowrap">Due Date</th>
                <th className="px-4 py-2 text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-primary-blue font-medium">{inv.id}</td>
                  <td className="px-4 py-3"><StatusPill status={inv.status as "Paid" | "Unpaid"} /></td>
                  <td className="px-4 py-3 text-gray-700">{inv.amount}</td>
                  <td className="px-4 py-3 text-gray-700">{inv.due}</td>
                  <td className="px-4 py-3 text-primary-purple font-medium">
                    <button className="hover:underline">Download PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpdate;
