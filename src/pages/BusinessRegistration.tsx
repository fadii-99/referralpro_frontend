import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideDesign from "../components/SideDesign";
import Button from "../components/Button";
import MultiStepHeader from "./../components/MultiStepHeader";
import companyNameLogo from "./../assets/figmaIcons/companyName.png";
import messageIcon from "../assets/figmaIcons/sms.svg";
import IndustryLogo from "./../assets/figmaIcons/industry.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RegistrationContext } from "../context/RegistrationProvider";
import { categories } from "./Category";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const BusinessRegistration: React.FC = () => {
  const navigate = useNavigate();
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("BusinessRegistration must be used within <RegistrationProvider>");
  const { registrationData, setRegistrationData } = ctx;

  const isCompany = registrationData.profileType === "company";

  // preload from context
  const [firstName, setFirstName] = useState(registrationData.firstName || "");
  const [lastName, setLastName] = useState(registrationData.lastName || "");
  const [email, setEmail] = useState(registrationData.email || "");
  const [industry, setIndustry] = useState(registrationData.industry || "");
  const [companyName, setCompanyName] = useState(registrationData.companyName || "");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // ✅ Normalize helper
  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/–/g, "-");

  // ✅ Flatten + deduplicate subcategories
  const SUBCATEGORIES = Array.from(
    new Map(
      categories
        .flatMap(cat =>
          cat.subcategories.map(sub => ({
            subcategory: sub.trim(),
            icon: cat.icon,
          }))
        )
        .map(item => [item.subcategory.toLowerCase(), item]) // unique by lowercase
    ).values()
  ).sort((a, b) => a.subcategory.localeCompare(b.subcategory));


  // ✅ Progressive strict search
  const normalizedSearch = normalize(search);
  const filtered = SUBCATEGORIES.filter(sub =>
    !normalizedSearch
      ? true
      : normalize(sub.subcategory).includes(normalizedSearch) 

  );


  useEffect(() => {
    setFirstName(registrationData.firstName || "");
    setLastName(registrationData.lastName || "");
    setEmail(registrationData.email || "");
    setIndustry(registrationData.industry || "");
    setCompanyName(registrationData.companyName || "");
  }, [registrationData]);



 const handleContinue: React.MouseEventHandler<HTMLButtonElement> = async () => {
 const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|mil|info|biz|xyz|online|app|dev|io|ai|co|me|us|uk|pk|in|de|cn|au|ca|fr|jp|sg|my|ph|bd|sa|ae|qa|kw|om|nz|br|ru|es|it|nl|se|ch|no|dk|pl|be|id|hk|tw|vn|th|ng|ke|za|tr|ir|il|gr|ro|cz|hu|sk|si|hr|lt|lv|ee|fi|is|pt|ar|mx|cl|pe|ve|uy|kr|lk|np|mm|kh|la|mn|kz|uz|kg|tj|tm|af|iq|sy|jo|lb|ye|dz|ma|tn|gh|sn|ci|cm|ug|tz|rw|mw|zm|bw|na|mz|sz|sl|gm|gn|cd|cg|ao|et|sd|ss|bi|dj|er|so|bt|bn|mv|pg|fj|to|ws|vu|sb|pw|fm|tv|cc|gs|sh|aq|eh|ax|cat|mobi|name|jobs|tel|pro|travel|asia|coop|museum|aero|cat|int|post|gov|edu|law|bank|finance|insurance|capital|money|cash|loan|credit|fund|investments|markets|exchange|trading|shop|store|site|website|solutions|digital|media|design|agency|company|software|systems|support|services|technology|tech|cloud|space|host|hosting|server|network|email|chat|social|group|club|community|team|partners|global|world|earth|life|live|today|news|press|blog|wiki|docs|online|link|click|top|best|guru|ninja|zone|center|city|town|place|land|estate|realty|homes|house|property|rent|condos|apartments|school|college|university|academy|institute|training|education|courses|health|doctor|clinic|hospital|care|dental|pharmacy|fitness|diet|restaurant|cafe|bar|hotel|resort|vacations|travel|flights|holiday|pizza|beer|wine|coffee|food|recipes|kitchen|garden|tools|construction|builders|contractors|engineering|marketing|management|consulting|legal|lawyer|attorney|accountant|engineer|architect)$/i;

  const nameRegex = /^[A-Za-z]+$/;

  if (!nameRegex.test(firstName.trim())) {
    toast.error("First name should contain only letters without spaces.");
    return;
  }
  if (!nameRegex.test(lastName.trim())) {
    toast.error("Last name should contain only letters without spaces.");
    return;
  }

  const missingBasics =
    !firstName.trim() || !lastName.trim() || !email.trim() || !industry.trim();
  const missingCompany = isCompany && !companyName.trim();

  if (missingBasics || missingCompany) {
    toast.error("Please fill out all fields.");
    return;
  }

  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  try {
     setSubmitting(true);
    const res = await fetch(`${serverUrl}/auth/check_email/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.status === 200) {
      setRegistrationData((prev) => ({
        ...prev,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        industry: industry.trim(),
        companyName: isCompany ? companyName.trim() : "",
      }));

      navigate("/BusinessType");
    } else if (res.status === 400) {
      toast.error("Email is already registered.");
    }  else if (res.status === 429 || res.status === 504 || res.status === 502 || res.status === 503) {
      toast.error("Server is busy, please try again.");
    } 
    else {
      const errTxt = await res.text();
      toast.error(`Failed (${res.status}): ${errTxt || "Unknown error"}`);
    }

  } catch (err) {
    console.error(err);
    toast.error("Network error. Please try again.");
  } finally {
  setSubmitting(false); 
}
};



  return (
    <div className="grid md:grid-cols-5 w-full min-h-screen">
      <SideDesign />

      <div className="md:col-span-3 flex flex-col bg-[#F4F2FA]">
        <div className="sticky top-5 z-30 backdrop-blur w-full max-w-lg mx-auto">
          <div className="px-4">
            <MultiStepHeader
              title="Business Registration"
              current={1}
              total={6}
              onBack={() => navigate(-1)}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <div className="space-y-4">
              {/* First Name */}
              <div className="flex flex-row items-center justify-between gap-4 w-full">
                <div className="w-full">
                  <label className="block text-[11px] text-primary-blue font-semibold mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <img src={companyNameLogo} alt="" className="h-5 w-5 object-contain" />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 text-xs md:text-sm
                                text-gray-800 placeholder-gray-400 outline-none"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="w-full">
                  <label className="block text-[11px] text-primary-blue font-semibold mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <img src={companyNameLogo} alt="" className="h-5 w-5 object-contain" />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 text-xs md:text-sm
                                text-gray-800 placeholder-gray-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] text-primary-blue font-semibold mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <img src={messageIcon} alt="" className="h-5 w-5 object-contain" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 text-xs md:text-sm
                               text-gray-800 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block text-[11px] text-primary-blue font-semibold mb-1.5">
                  Industry Selection <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {industry ? (
                      <img
                        src={SUBCATEGORIES.find((s) => s.subcategory === industry)?.icon || IndustryLogo}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <img src={IndustryLogo} alt="" className="h-5 w-5 object-contain" />
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpen((s) => !s)}
                    className="w-full pl-12 pr-10 py-4 rounded-full bg-white border border-gray-200 text-left
                               text-xs md:text-sm text-gray-800 outline-none"
                  >
                    {industry || "Select your industry"}
                  </button>

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>

                  {open && (
                    <div
                      className="absolute z-30 mt-2 w-full bg-white border border-gray-200 
                                 rounded-2xl shadow-lg overflow-auto 
                                 max-h-56 text-[11px] sm:text-sm"
                    >
                      {/* Search input */}
                      <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                       <input
                          type="text"
                          value={search}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(val)) {
                              setSearch(val);
                            }
                          }}
                          placeholder="Search an industry..."
                          className="w-full px-3 py-2 rounded-full bg-white border border-gray-200 text-xs md:text-sm
                                    text-gray-800 placeholder-gray-400 outline-none"
                        />

                      </div>

                      <ul>
                        {filtered.length > 0 ? (
                          filtered.map((opt) => (
                            <li key={opt.subcategory}>
                              <button
                                type="button"
                                onClick={() => {
                                  setIndustry(opt.subcategory);
                                  setOpen(false);
                                  setSearch("");
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 
                                          hover:bg-primary-purple/10 ${
                                            industry === opt.subcategory ? "bg-primary-purple/20" : ""
                                          }`}
                                aria-selected={industry === opt.subcategory}
                              >
                                <span className="text-xs sm:text-sm">{opt.subcategory}</span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-400 text-xs sm:text-sm">
                            No such category found
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Name */}
              {isCompany && (
                <div>
                  <label className="block text-[11px] text-primary-blue font-semibold mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary-purple"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 21V9a2 2 0 012-2h2V5a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v12M9 21V9m6 12V9M3 21h18"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 text-xs md:text-sm
                                 text-gray-800 placeholder-gray-400 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

              <Button
                text="Next : Business Type Selection"
                onClick={handleContinue}
                loading={submitting}          
                disabled={submitting}          
              />

          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default BusinessRegistration;
