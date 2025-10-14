import React, { useEffect, useRef, useState } from "react";
import Button from "../Button";
import {
  FiX,
  FiUser,
  FiMail,
  FiCamera,
  FiHome,
  FiGlobe,
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiLayers,
} from "react-icons/fi";
import { useUserContext } from "../../context/UserProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { categories } from "../../pages/Category";
import IndustryLogo from "./../../assets/figmaIcons/industry.png";

// Phone validation lib
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  getExampleNumber,
} from "libphonenumber-js";
import rawMetadata from "libphonenumber-js/metadata.full.json";
const metadata: any = rawMetadata;

const serverUrl = import.meta.env.VITE_SERVER_URL;

// Employees options
const EMPLOYEE_OPTIONS = ["1 – 50", "51 – 100", "100 – 500", "500+"];
// BizType options (UI labels)
const BIZTYPE_OPTIONS = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "LLC",
  "Nonprofit",
  "Other",
];

// ✅ UI label -> backend code
const BIZTYPE_MAP: Record<string, string> = {
  "Sole Proprietorship": "sole_proprietorship",
  Partnership: "partnership",
  Corporation: "corporation",
  LLC: "llc",
  Nonprofit: "nonprofit",
  Other: "other",
};

// ✅ backend code -> UI label
const BIZTYPE_REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BIZTYPE_MAP).map(([label, code]) => [code, label])
);

// US States
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

// Build country list
const countries = getCountries()
  .map((code) => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Props = {
  open: boolean;
  onClose: () => void;
};

const EditProfileModal: React.FC<Props> = ({ open, onClose }) => {
  const { user, loadUser } = useUserContext();

  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Phone with country
  const [country, setCountry] = useState("US");
  const [localPhone, setLocalPhone] = useState("");
  const [openCountry, setOpenCountry] = useState(false);

  // Business Info
  const [companyName, setCompanyName] = useState(user?.company_name || "");
  const [address1, setAddress1] = useState(user?.address1 || "");
  const [address2, setAddress2] = useState(user?.address2 || "");
  const [city, setCity] = useState(user?.city || "");
  const [usState, setUsState] = useState(user?.us_state || "");
  const [postCode, setPostCode] = useState(user?.post_code || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [industry, setIndustry] = useState(user?.industry || "");
  const [employees, setEmployees] = useState(user?.employees || "");
  const [bizType, setBizType] = useState(user?.biz_type || "");

  // Dropdown toggles
  const [openIndustry, setOpenIndustry] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);
  const [openBizType, setOpenBizType] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [search, setSearch] = useState("");

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  // Industry subcategories with icons
  const SUBCATEGORIES = Array.from(
    new Map(
      categories
        .flatMap((cat) =>
          cat.subcategories.map((sub) => ({
            subcategory: sub.trim(),
            icon: cat.icon,
          }))
        )
        .map((item) => [item.subcategory.toLowerCase(), item])
    ).values()
  ).sort((a, b) => a.subcategory.localeCompare(b.subcategory));

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/–/g, "-");
  const filtered = SUBCATEGORIES.filter((sub) =>
    !search ? true : normalize(sub.subcategory).startsWith(normalize(search))
  );

  useEffect(() => {
    if (!open) return;
    setName(user?.name || "");
    setAvatarPreview(user?.avatar || "");
    setAvatarFile(null);
    setCompanyName(user?.company_name || "");
    setAddress1(user?.address1 || "");
    setAddress2(user?.address2 || "");
    setCity(user?.city || "");
    setUsState(user?.us_state || "");
    setPostCode(user?.post_code || "");
    setWebsite(user?.website || "");
    setIndustry(user?.industry || "");
    setEmployees(user?.employees || "");

    // 🟣 Map backend biz_type -> UI label for dropdown display
    setBizType(
      user?.biz_type ? BIZTYPE_REVERSE_MAP[user.biz_type] || user.biz_type : ""
    );

    if (user?.phone) {
      const parsed = parsePhoneNumberFromString(user.phone);
      if (parsed) {
        setCountry(parsed.country || "US");
        setLocalPhone(parsed.nationalNumber.toString());
      }
    }
  }, [open, user]);

  if (!open) return null;

  const onPickFile = () => inputFileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required!");
      return;
    }

    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name.trim())) {
      toast.error("Full Name should only contain letters and spaces.");
      return;
    }

    

    // ✅ Build and validate phone
    const dialCode = countries.find((c) => c.code === country)?.dialCode || "";
    const fullPhone = `${dialCode}${localPhone}`;
    const parsed = parsePhoneNumberFromString(fullPhone);

    let expectedLength: number | null = null;
    try {
      const exampleNum = getExampleNumber(country as any, metadata);
      if (exampleNum) {
        expectedLength = exampleNum.nationalNumber.toString().length;
      }
    } catch {
      expectedLength = null;
    }

    if (!parsed || !parsed.isValid()) {
      const example = countries.find((c) => c.code === country);
      let msg = `Phone number for ${example?.name || country} must be valid.`;
      if (expectedLength) {
        msg += ` Expected ${expectedLength} digits.`;
      }
      toast.error(msg);
      return;
    }

    if (postCode && !/^[0-9]+$/.test(postCode.trim())) {
      toast.error("Post Code must be numeric.");
      return;
    }
    if (city && !/^[A-Za-z ]+$/.test(city.trim())) {
      toast.error("City name must contain only letters and spaces.");
      return;
    }
    if (website.trim()) {
      const websiteRegex =
        /^www\.[^\s]+\.(com|org|net|edu|gov|mil|info|biz|xyz|online|io|ai|tech|app|dev)(\.[a-z]{2,3})?$/i;
      if (!websiteRegex.test(website.trim())) {
        toast.error("Invalid website. Example: www.example.com");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();

      if (name.trim() !== user?.name) fd.append("full_name", name.trim());
      if (parsed.number !== user?.phone) fd.append("phone", parsed.number);
      if (avatarFile) fd.append("image", avatarFile);

      // 🟣 Normalize biz type
      const uiBizType = bizType.trim();
      const normalizedBizType =
        (uiBizType && BIZTYPE_MAP[uiBizType]) ||
        (uiBizType
          ? uiBizType
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/–/g, "-")
              .replace(/-/g, "_")
          : "");

      const businessPayload: any = {};
      if (bizType !== "sole") {
        if (companyName.trim() !== user?.company_name)
          businessPayload.company_name = companyName.trim();
        if (employees.trim() !== user?.employees)
          businessPayload.employees = employees.trim();

        // 🟣 Only attach biz_type if it actually changed
        if (normalizedBizType && normalizedBizType !== user?.biz_type) {
          businessPayload.biz_type = normalizedBizType;
        }
      }

      if (address1.trim() !== user?.address1)
        businessPayload.address1 = address1.trim();
      if (address2.trim() !== user?.address2)
        businessPayload.address2 = address2.trim();
      if (city.trim() !== user?.city) businessPayload.city = city.trim();
      if (usState.trim() !== user?.us_state)
        businessPayload.us_state = usState.trim();
      if (postCode.trim() !== user?.post_code)
        businessPayload.post_code = postCode.trim();
      if (website.trim() !== user?.website)
        businessPayload.website = website.trim();
      if (industry.trim() !== user?.industry)
        businessPayload.industry = industry.trim();

      if (Object.keys(businessPayload).length > 0) {
        fd.append("business_info", JSON.stringify(businessPayload));
      }

      if ([...fd.keys()].length === 0) {
        toast.info("No changes made.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${serverUrl}/auth/update_user/`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || `Failed (${res.status})`);
        return;
      }

      toast.success("Profile updated successfully!");
      await loadUser();
      onClose();
    } catch (err) {
      toast.error("Network error while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-2xl font-semibold text-primary-blue">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border grid place-items-center"
          >
            <FiX className="text-primary-purple" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-6 mt-3 flex flex-col items-center">
          <img
            src={avatarPreview}
            alt="avatar"
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow"
          />
          <button
            type="button"
            onClick={onPickFile}
            className="mt-2 px-3 py-2 rounded-full bg-secondary-blue text-white flex items-center gap-1 text-xs"
          >
            <FiCamera /> Change Photo
          </button>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>

        {/* Form */}
        <div className="px-6 pb-6 pt-4 space-y-5 overflow-y-auto max-h-[70vh]">
          <Field
            icon={<FiUser />}
            label="Full Name"
            required
            value={name}
            onChange={setName}
          />

          <PhoneField
            country={country}
            setCountry={setCountry}
            localPhone={localPhone}
            setLocalPhone={setLocalPhone}
            openCountry={openCountry}
            setOpenCountry={setOpenCountry}
          />

          <Field icon={<FiMail />} label="Email" value={user?.email || ""} disabled />

          <hr className="my-4" />

          {/* Hide these if bizType === "sole" */}
          {bizType !== "sole" && (
            <>
              <Field
                icon={<FiBriefcase />}
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
              />
              <DropdownField
                label="Employees"
                icon={<FiUsers />}
                open={openEmployees}
                setOpen={setOpenEmployees}
                options={EMPLOYEE_OPTIONS}
                value={employees}
                setValue={setEmployees}
              />
              <DropdownField
                label="Business Type"
                icon={<FiLayers />}
                open={openBizType}
                setOpen={setOpenBizType}
                options={BIZTYPE_OPTIONS}
                value={bizType}
                setValue={setBizType}
              />
            </>
          )}

          <Field
            icon={<FiHome />}
            label="Address 1"
            value={address1}
            onChange={setAddress1}
          />
          <Field
            icon={<FiHome />}
            label="Address 2"
            value={address2}
            onChange={setAddress2}
          />
          <Field icon={<FiMapPin />} label="City" value={city} onChange={setCity} />
          <IndustryField
            label="Industry"
            value={industry}
            setValue={setIndustry}
            open={openIndustry}
            setOpen={setOpenIndustry}
            search={search}
            setSearch={setSearch}
            filtered={filtered}
          />
          <DropdownField
            label="State"
            icon={<FiMapPin />}
            open={openState}
            setOpen={setOpenState}
            options={US_STATES}
            value={usState}
            setValue={setUsState}
          />
          <Field
            icon={<FiMapPin />}
            label="Post Code"
            value={postCode}
            onChange={setPostCode}
          />
          <Field
            icon={<FiGlobe />}
            label="Website"
            value={website}
            onChange={setWebsite}
          />

          <Button
            text={loading ? "Updating..." : "Update"}
            fullWidth
            onClick={handleSave}
            disabled={loading}
          />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

// 🔹 Field Component
const Field = ({ icon, label, value, onChange, required, disabled }: any) => (
  <div>
    <label className="block text-xs font-medium mb-2 text-primary-blue">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-purple">
        {icon}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full pl-12 pr-4 py-3 rounded-full border text-sm ${
          disabled ? "bg-gray-50 text-gray-500" : "bg-white"
        }`}
      />
    </div>
  </div>
);

// 🔹 DropdownField
const DropdownField = ({
  label,
  icon,
  open,
  setOpen,
  options,
  value,
  setValue,
}: any) => (
  <div>
    <label className="block text-xs font-medium mb-2 text-primary-blue">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-purple">
        {icon}
      </span>
      <button
        type="button"
        onClick={() => setOpen((s: boolean) => !s)}
        className="w-full pl-12 pr-10 py-3 rounded-full border bg-white text-sm text-gray-800 text-left"
      >
        {value || `Select ${label}`}
      </button>
      {open && (
        <ul className="absolute z-40 mt-1 w-full bg-white border rounded-2xl shadow-lg max-h-44 overflow-auto text-sm">
          {options.map((opt: string) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  setValue(opt);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-primary-purple/10"
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

// 🔹 IndustryField
const IndustryField = ({
  label,
  value,
  setValue,
  open,
  setOpen,
  search,
  setSearch,
  filtered,
}: any) => (
  <div>
    <label className="block text-xs font-medium mb-2 text-primary-blue">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2">
        <img
          src={
            value
              ? filtered.find((s: any) => s.subcategory === value)?.icon ||
                IndustryLogo
              : IndustryLogo
          }
          alt=""
          className="h-5 w-5"
        />
      </span>
      <button
        type="button"
        onClick={() => setOpen((s: boolean) => !s)}
        className="w-full pl-12 pr-10 py-3 rounded-full border bg-white text-sm text-gray-800 text-left"
      >
        {value || `Select ${label}`}
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border rounded-2xl shadow-lg max-h-56 overflow-auto text-sm">
          <div className="sticky top-0 bg-white border-b p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-full border text-sm"
            />
          </div>
          <ul>
            {filtered.length > 0 ? (
              filtered.map((opt: any) => (
                <li key={opt.subcategory}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(opt.subcategory);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-purple/10"
                  >
                    <img src={opt.icon} alt="" className="h-4 w-4" />{" "}
                    {opt.subcategory}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400">No result</li>
            )}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// 🔹 PhoneField
const PhoneField = ({
  country,
  setCountry,
  localPhone,
  setLocalPhone,
  openCountry,
  setOpenCountry,
}: any) => (
  <div>
    <label className="block text-xs font-medium mb-2 text-primary-blue">
      Phone
    </label>
    <div className="relative flex">
      <button
        type="button"
        onClick={() => setOpenCountry((s: boolean) => !s)}
        className="pl-3 pr-8 py-3 rounded-l-full bg-white border border-gray-200 text-sm text-gray-800 flex items-center"
        style={{ minWidth: "100px" }}
      >
        {countries.find((c) => c.code === country)?.dialCode || "+--"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-6 h-3 w-3 text-gray-500 transition-transform ${
            openCountry ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <input
        type="tel"
        placeholder="Enter Phone"
        value={localPhone}
        onChange={(e) =>
          setLocalPhone(e.target.value.replace(/\D/g, ""))
        }
        className="flex-1 pl-4 pr-4 py-3 rounded-r-full bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none"
      />

      {openCountry && (
        <ul className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-52 overflow-auto text-sm z-50">
          {countries.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  setCountry(c.code);
                  setOpenCountry(false);
                }}
                className="w-full flex justify-start gap-3 px-3 py-2 hover:bg-primary-purple/5"
              >
                <span className="font-semibold w-12">{c.dialCode}</span>
                <span>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default EditProfileModal;
