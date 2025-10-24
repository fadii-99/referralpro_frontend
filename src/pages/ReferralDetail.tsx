import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Button from "../components/Button";
import SmallLoader from "../components/SmallLoader";
import { HiMail, HiPhone, HiChevronDown } from "react-icons/hi";
import { useTeamMembersContext } from "../context/TeamMembersProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../context/UserProvider";

const serverUrl = import.meta.env.VITE_SERVER_URL;

type ReferralDetailType = {
  id: number;
  reference_id: string;
  company_name: string;
  company_type: string;
  industry: string;
  status: string;
  urgency: string;
  approval: string;
  assigned_at: string | null;
  assigned_notes: string | null;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  referred_to_name: string;
  referred_to_email: string;
  referred_to_phone: string;
  notes: string;
  reason: string;
  date: string;
  privacy: boolean;
};

const getInitial = (name?: string): string => {
  const first = (name || "").trim().charAt(0);
  return first ? first.toUpperCase() : "?";
};

const ReferralDetail: React.FC = () => {
  const [detail, setDetail] = useState<ReferralDetailType | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const { membersFromApi, loading: teamLoading } = useTeamMembersContext();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);

  // status dropdown state
  const [status, setStatus] = useState<string>("");
  // note: non-sole only
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---- biz_type with live + cache (no flicker)
  const { user } = useUserContext();
  const [cachedBizType] = useState(
    () => (localStorage.getItem("userBizType") || "").trim().toLowerCase()
  );
  const effectiveBizType = useMemo(() => {
    const live = (user?.biz_type || "").trim().toLowerCase();
    return live || cachedBizType;
  }, [user?.biz_type, cachedBizType]);
  const isSole = /^(sole|sole\s*trader|solo|sole_trader)$/i.test(effectiveBizType);

  // ----- STATUS Custom Dropdown (BusinessRegistration-style)
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusPanelRef = useRef<HTMLDivElement | null>(null);
  const statusListRef = useRef<HTMLUListElement | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusHighlighted, setStatusHighlighted] = useState<number>(-1);

  const statusOptions = useMemo<string[]>(
    () => (isSole ? ["completed", "cancelled"] : ["Accept", "Reject"]),
    [isSole]
  );

  // outside click for status dropdown
  useEffect(() => {
    if (!statusOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (
        statusPanelRef.current &&
        !statusPanelRef.current.contains(t) &&
        statusTriggerRef.current &&
        !statusTriggerRef.current.contains(t)
      ) {
        setStatusOpen(false);
        setStatusHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [statusOpen]);

  const onStatusTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setStatusOpen(true);
      setTimeout(() => {
        statusListRef.current?.focus();
        setStatusHighlighted(0);
      }, 0);
    }
  };
  const onStatusListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!statusOptions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setStatusHighlighted((i) => (i + 1) % statusOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setStatusHighlighted((i) => (i - 1 + statusOptions.length) % statusOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = statusOptions[Math.max(0, statusHighlighted)];
      if (choice) {
        setStatus(choice);
        setStatusOpen(false);
        setStatusHighlighted(-1);
        statusTriggerRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setStatusOpen(false);
      setStatusHighlighted(-1);
      statusTriggerRef.current?.focus();
    }
  };

  const fetchDetail = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const referralId = localStorage.getItem("selectedReferralId");
    try {
      setLoadingDetail(true);
      const res = await fetch(`${serverUrl}/refer/list_company_referral/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ referral_id: referralId }),
      });
      const data = await res.json();
      const detailData = Array.isArray(data.referrals) ? data.referrals[0] : null;
      setDetail(detailData);
    } catch {
      toast.error("⚠️ Failed to load referral detail");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const id = localStorage.getItem("selectedId");
        const res = await fetch(
          `${serverUrl}/activity/?referral_id=${encodeURIComponent(id || "")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.results)) {
          setActivityLogs(data.results);
        }
      } catch (err) {
        console.error("Network error (activity):", err);
      }
    };
    fetchActivity();
  }, []);

  const handleStatusUpdate = async () => {
    if (!detail) return;
    if (!status) {
      toast.error("⚠️ Please select a status.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");

      if (isSole) {
        // Sole: NO note; endpoint complete1_referral
        const res = await fetch(`${serverUrl}/refer/complete1_referral/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            referral_id: detail.id,
            status, // "Complete" | "Cancel"
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          toast.error(`${errText}`);
          return;
        }

        const response = await res.json();
        toast.success("✅ Status updated successfully!");
        console.log("Sole status update response:", response);
        await fetchDetail();
      } else {
        // Non-sole: Accept requires employee; Reject doesn't; note included
        if (status !== "Reject" && !selectedEmployee) {
          toast.error("⚠️ Please select an employee before proceeding.");
          setSubmitting(false);
          return;
        }

        const res = await fetch(`${serverUrl}/refer/assign_rep/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            referral_id: detail.id,
            status, // "Accept" | "Reject"
            employee_id: status === "Reject" ? null : selectedEmployee?.id,
            note: note || "",
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          toast.error(`Failed: ${res.status} - ${errText}`);
          return;
        }

        const response = await res.json();
        toast.success("✅ Status updated successfully!");
        console.log("Assign/Status update response:", response);
        await fetchDetail();
      }
    } catch {
      toast.error("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDetail || !detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SmallLoader />
      </div>
    );
  }

  // Terminal if detail.status is Complete/Cancel (global)
  const terminalStatus = ["completed", "cancelled"].includes((detail.status || "").toLowerCase());

  // In sole: hide status card when terminal; always hide assignment for sole
  const showStatusCard =
    !isSole && !terminalStatus // non-sole + not terminal
      ? true
      : isSole && !terminalStatus // sole but not terminal (still needs Complete/Cancel)
      ? true
      : false;

  // Disable rule:
  const disableSubmit = isSole
    ? submitting || !status
    : submitting || !status || (status !== "Reject" && !selectedEmployee);

    // helper (place it near top inside the component file)
const statusBadgeClass = (raw?: string) => {
  const s = (raw || "").toLowerCase();
  if (s === "completed") return "text-emerald-600 bg-emerald-50";
  if (s === "cancelled") return "text-blue-600 bg-blue-50";
  return "text-amber-600 bg-amber-50";
};


  return (
    <div className="p-4 sm:p-6 flex flex-col min-h-screen space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary-blue text-center sm:text-left">
        Referral Details
      </h2>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
        <div className="flex flex-col items-start gap-1 sm:gap-2">
          <p className="text-xs text-gray-500">Reference ID</p>
          <p className="font-semibold text-primary-blue text-sm sm:text-base">
            #{detail.reference_id}
          </p>
        </div>
        <div className="text-left sm:text-right mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
          <p className="text-xs text-gray-500">{detail.date}</p>
          <span
  className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium mt-2 ${statusBadgeClass(
    detail.status
  )}`}
>
  {detail.status}
</span>

        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
          Customer Info
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                detail.referred_to_name || "User"
              )}&background=E5E7EB&color=374151`}
              alt={detail.referred_to_name}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
              <p className="font-medium text-primary-blue text-sm sm:text-base">
                {detail.referred_to_name}
              </p>
              <p className="text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 pb-2">
                <span
                  className={`flex items-center gap-1 ${
                    detail.privacy ? "blur-sm select-none" : ""
                  }`}
                >
                  <HiMail className="text-gray-500 text-sm" />
                  {detail.referred_to_email}
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    detail.privacy ? "blur-sm select-none" : ""
                  }`}
                >
                  <HiPhone className="text-gray-500" />
                  {detail.referred_to_phone}
                </span>
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Reason:</span> {detail.reason}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Notes:</span> {detail.notes}
              </p>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium capitalize
                ${
                  (detail.urgency || "").toLowerCase() === "urgent"
                    ? "text-rose-500 bg-rose-50"
                    : (detail.urgency || "").toLowerCase() === "normal"
                    ? "text-blue-500 bg-blue-50"
                    : "text-slate-500 bg-slate-50"
                }`}
            >
              {detail.urgency}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Layout section ===== */}
      {/* When terminal: activity becomes full-width; rest stays as usual */}
      {!terminalStatus ? (
        // ---------- NORMAL (non-terminal) LAYOUT: grid ----------
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Assignment (non-sole only & not assigned) */}
          {!isSole && !detail.assigned_to_id && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
                Assignment
              </h3>
              <div className="relative">
                <button
                  onClick={() => setEmpDropdownOpen((v) => !v)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm sm:text-base text-left focus:outline-none focus:ring-2 focus:ring-primary-purple flex justify-between items-center"
                >
                  {selectedEmployee ? selectedEmployee.name : "Select Employee"}
                  <HiChevronDown className="text-gray-400" />
                </button>
                {empDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {teamLoading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : membersFromApi.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No team members found
                      </div>
                    ) : (
                      membersFromApi.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => {
                            setSelectedEmployee(member);
                            setEmpDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {getInitial(member.name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary-blue">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedEmployee && (
                <div className="mt-5 flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-semibold">
                      {getInitial(selectedEmployee.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-blue">
                      {selectedEmployee.name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">⚠️ Only one employee can be assigned.</p>
            </div>
          )}

          {/* Status Update (custom dropdown) */}
          {showStatusCard && (
            <div
              className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 ${
                isSole && !detail.assigned_to_id ? "lg:col-span-2" : ""
              }`}
            >
              <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
                Status Update
              </h3>

              {/* Trigger */}
              <div className="relative" ref={statusPanelRef}>
                <button
                  ref={statusTriggerRef}
                  type="button"
                  onClick={() => {
                    setStatusOpen((s) => !s);
                    setTimeout(() => setStatusHighlighted(0), 0);
                  }}
                  onKeyDown={onStatusTriggerKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={statusOpen}
                  className="group w-full px-4 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-left
                             text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-purple relative"
                >
                  {status || "Select status"}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${statusOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {/* Flyout list */}
                {statusOpen && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <ul
                      ref={statusListRef}
                      tabIndex={0}
                      onKeyDown={onStatusListKeyDown}
                      role="listbox"
                      aria-activedescendant={
                        statusHighlighted >= 0 && statusOptions[statusHighlighted]
                          ? `status-${statusOptions[statusHighlighted]}`
                          : undefined
                      }
                      className="max-h-60 overflow-y-auto py-1 focus:outline-none"
                    >
                      {statusOptions.map((opt, idx) => {
                        const isActive = idx === statusHighlighted;
                        const isSelected = status === opt;
                        return (
                          <li key={opt} role="option" aria-selected={isSelected}>
                            <button
                              id={`status-${opt}`}
                              type="button"
                              onMouseEnter={() => setStatusHighlighted(idx)}
                              onClick={() => {
                                setStatus(opt);
                                setStatusOpen(false);
                                setStatusHighlighted(-1);
                                statusTriggerRef.current?.focus();
                              }}
                              className={[
                                "w-full px-4 py-2.5 flex items-center gap-3 text-left transition",
                                isActive ? "bg-primary-purple/10" : "hover:bg-primary-purple/10",
                              ].join(" ")}
                            >
                              <span className="text-sm text-primary-blue">{opt}</span>
                              {isSelected && (
                                <span className="ml-auto text-primary-purple text-sm">✓</span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Note: ONLY for non-sole */}
              {!isSole && (
                <>
                  <h4 className="text-sm font-semibold text-primary-blue mt-5">Note</h4>
                  <textarea
                    placeholder="Write here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    rows={4}
                  />
                </>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  text={submitting ? "Submitting..." : "Done"}
                  onClick={handleStatusUpdate}
                  disabled={disableSubmit}
                />
              </div>
            </div>
          )}

          {/* Activity Log (in-grid when not terminal) */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
              Activity Log
            </h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gray-200"></div>
              <div className="space-y-6">
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity yet.</p>
                ) : (
                  activityLogs.map((act) => {
                    const dateObj = new Date(act.created_at);
                    const date = dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const time = dateObj.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div key={act.id} className="relative">
                        <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-emerald-500"></span>
                        <p className="text-xs text-gray-500">{date}</p>
                        <p className="text-primary-blue font-medium text-sm">{act.title}</p>
                        <p className="text-xs text-gray-500">{act.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{time}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ---------- TERMINAL LAYOUT: Activity full-width ----------
        <>
          {/* Non-sole & unassigned: you may still show assignment/status if you want.
              Per your last instruction, only Activity goes full width; others remain as-is.
              For sole, status card is already hidden. */}

          {/* Full width Activity Log */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
              Activity Log
            </h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gray-200"></div>
              <div className="space-y-6">
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity yet.</p>
                ) : (
                  activityLogs.map((act) => {
                    const dateObj = new Date(act.created_at);
                    const date = dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const time = dateObj.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div key={act.id} className="relative">
                        <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-emerald-500"></span>
                        <p className="text-xs text-gray-500">{date}</p>
                        <p className="text-primary-blue font-medium text-sm">{act.title}</p>
                        <p className="text-xs text-gray-500">{act.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{time}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ReferralDetail;
