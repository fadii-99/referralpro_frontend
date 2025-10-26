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
  const isSole = /^(sole|sole\s*trader|solo)$/i.test(effectiveBizType);

  // ----- STATUS Custom Dropdown (BusinessRegistration-style)
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusPanelRef = useRef<HTMLDivElement | null>(null);
  const statusListRef = useRef<HTMLUListElement | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusHighlighted, setStatusHighlighted] = useState<number>(-1);

  const statusOptions = useMemo<string[]>(
    () => (isSole ? ["completed", "cancelled"] : ["accept", "reject"]),
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

  // ------- FETCHES -------
  const fetchDetail = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    try {
      setLoadingDetail(true);
      const res = await fetch(`${serverUrl}/refer/list_company_referral/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ referral_id: localStorage.getItem("selectedReferralId") }),
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

  // ---------- ACTION HANDLER ----------
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
            status, // "completed" | "cancelled"
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          toast.error(`${errText}`);
          return;
        }

        await res.json();
        toast.success("✅ Status updated successfully!");
        await fetchDetail();
      } else {
        // Non-sole: accept requires employee; reject doesn't; note included
        if (status !== "reject" && !selectedEmployee) {
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
            status, // "accept" | "reject"
            employee_id: status === "reject" ? null : selectedEmployee?.id,
            note: note || "",
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          toast.error(`Failed: ${res.status} - ${errText}`);
          return;
        }

        await res.json();
        toast.success("✅ Status updated successfully!");
        await fetchDetail(); // brings back assigned_to_id/name etc.
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

  // ====== NEW GATING LOGIC (as requested) ======
  const normalizedStatus = (detail.status || "").trim().toLowerCase();
  const isPending = normalizedStatus === "pending";
  const isFriendOptedIn = normalizedStatus === "friend opted in";

  // When "Friend opted in": allow actions; When "pending": disable both.
  const canInteract = isFriendOptedIn; // single source of truth

  // Terminal if detail.status is completed/cancelled (global)
  const terminalStatus = ["completed", "cancelled"].includes(normalizedStatus);

  // ===== Visibility rules (unchanged except terminal) =====
  // Non-sole: after assignment, both Assignment selector and Status Update card should HIDE.
  const showAssignmentSelector = !isSole && !detail.assigned_to_id && !terminalStatus;
  // Show Status Update: for sole -> until terminal; for non-sole -> until terminal & not yet assigned
  const showStatusCard = isSole ? !terminalStatus : !terminalStatus && !detail.assigned_to_id;

  // Disable rule (existing) + new gate (canInteract)
  const disableSubmit = isSole
    ? submitting || !status || !canInteract
    : submitting || !status || (status !== "reject" && !selectedEmployee) || !canInteract;

  // ---- Helpers
  const statusBadgeClass = (raw?: string) => {
    const s = (raw || "").toLowerCase();
    if (s === "completed") return "text-emerald-600 bg-emerald-50";
    if (s === "cancelled") return "text-rose-600 bg-rose-50";
    return "text-amber-600 bg-amber-50";
  };

  const AssignmentInfoCard: React.FC = () => {
    if (isSole) return null; // sole me yeh card ki zarurat nahi
    if (!detail.assigned_to_id && !detail.assigned_to_name) return null;

    const assignedWhen = detail.assigned_at || "";
    const assignedName = detail.assigned_to_name || "";
    const assignedNotes = detail.assigned_notes || "";

    const display = (v: string) => (v && v.trim().length ? v : "—");

    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 h-full">
        <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-4">
          Assignment Info
        </h3>

        <div className="flex items-start justify-between gap-4 pt-2">
          {/* Left: Avatar + Details */}
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {getInitial(assignedName || "U")}
              </span>
            </div>

            <div className="flex flex-col">
              {/* Name pill */}
              <span className="inline-flex items-center w-fit px-3 py-1 rounded-lg text-xs sm:text-sm font-medium capitalize text-blue-700 bg-blue-50">
                {display(assignedName)}
              </span>

              {/* Labeled lines */}
              <div className="mt-2 space-y-1 text-xs text-gray-600 pt-2">
                <p>
                  <span className="font-semibold text-gray-700">Assigned To:</span>{" "}
                  {display(assignedName)}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Assigned At:</span>{" "}
                  {display(assignedWhen)}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Assigned Notes:</span>{" "}
                  {display(assignedNotes)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                  className={`flex items-center gap-1 ${detail.privacy ? "blur-sm select-none" : ""}`}
                >
                  <HiMail className="text-gray-500 text-sm" />
                  {detail.referred_to_email}
                </span>
                <span
                  className={`flex items-center gap-1 ${detail.privacy ? "blur-sm select-none" : ""}`}
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
                    : (detail.urgency || "").toLowerCase() === "low"
                    ? "text-amber-500 bg-amber-50"
                    : "text-slate-500 bg-slate-50"
                }`}
            >
              {detail.urgency}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Layout section ===== */}
      {!terminalStatus ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Assignment selector (non-sole only & not assigned) */}
          {showAssignmentSelector && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-2">
                Assignment
              </h3>
              {isPending && (
                <p className="text-[11px] sm:text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 mb-3">
                  Employee can be selected only after the friend opts in. While pending, it isn’t allowed
                </p>
              )}
              <div className="relative">
                <button
                  onClick={() => canInteract && setEmpDropdownOpen((v) => !v)}
                  disabled={!canInteract}
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm sm:text-base text-left focus:outline-none
                    ${canInteract ? "focus:ring-2 focus:ring-primary-purple" : "opacity-60 cursor-not-allowed"}
                    flex justify-between items-center`}
                >
                  {selectedEmployee ? selectedEmployee.name : "Select Employee"}
                  <HiChevronDown className="text-gray-400" />
                </button>
                {empDropdownOpen && canInteract && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {teamLoading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : membersFromApi.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No team members found</div>
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
                    <p className="text-sm font-medium text-primary-blue">{selectedEmployee.name}</p>
                    <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">⚠️ Only one employee can be assigned.</p>
            </div>
          )}

          {/* ✅ After assignment (non-sole): show read-only Assignment Info card; selector + status hidden */}
          {!isSole && detail.assigned_to_id && (
            <div className="lg:col-span-1">
              <AssignmentInfoCard />
            </div>
          )}

          {/* Status Update (hide after assignment for non-sole) */}
          {showStatusCard && (
            <div
              className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 ${
                isSole && !detail.assigned_to_id ? "lg:col-span-2" : ""
              }`}
            >
              <h3 className="text-base sm:text-lg font-semibold text-primary-blue mb-2">
                Status Update
              </h3>
              {/* Note for gating */}
              {!canInteract && (
                <p className="text-[11px] sm:text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 mb-3">
                  Status can be selected only after the friend opts in. While pending, it isn’t allowed
                </p>
              )}

              <div className="relative" ref={statusPanelRef}>
                <button
                  ref={statusTriggerRef}
                  type="button"
                  onClick={() => {
                    if (!canInteract) return;
                    setStatusOpen((s) => !s);
                    setTimeout(() => setStatusHighlighted(0), 0);
                  }}
                  onKeyDown={onStatusTriggerKeyDown}
                  aria-haspopup="listbox"
                  aria-expanded={statusOpen}
                  disabled={!canInteract}
                  className={`group w-full px-4 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-left
                             text-sm text-gray-800 outline-none ${canInteract ? "focus:ring-2 focus:ring-primary-purple" : "opacity-60 cursor-not-allowed"} relative`}
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

                {statusOpen && canInteract && (
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
                              <span className="text-sm text-primary-blue capitalize">{opt}</span>
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
                    disabled={!canInteract}
                    className={`w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none ${
                      canInteract ? "focus:ring-2 focus:ring-primary-purple" : "opacity-60 cursor-not-allowed"
                    }`}
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
        // ---------- TERMINAL LAYOUT ----------
        <>
          {/* Assigned summary still visible in terminal */}
          {!isSole && (detail.assigned_to_id || detail.assigned_to_name) && (
            <AssignmentInfoCard />
          )}

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
