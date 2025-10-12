import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

export type Review = {
  id: string;
  company: string;
  logo: string;
  referRating: number;
  googleRating: number;
};

type Ctx = {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  loadReviews: () => Promise<void>;
};

const AdminReviewContext = createContext<Ctx | null>(null);

export const useAdminReviewContext = () => {
  const ctx = useContext(AdminReviewContext);
  if (!ctx) throw new Error("useAdminReviewContext must be used inside provider");
  return ctx;
};

// 🚀 Dummy reviews
const dummyReviews: Review[] = [
  {
    id: "1",
    company: "KEISER",
    logo: "https://dummyimage.com/40x40/0b0d3b/fff.png&text=K",
    referRating: 5.0,
    googleRating: 5.0,
  },
  {
    id: "2",
    company: "Acme Corp",
    logo: "https://dummyimage.com/40x40/0b0d3b/fff.png&text=A",
    referRating: 4.8,
    googleRating: 4.9,
  },
  {
    id: "3",
    company: "Tech World",
    logo: "https://dummyimage.com/40x40/0b0d3b/fff.png&text=T",
    referRating: 4.7,
    googleRating: 4.6,
  },
];

export const AdminReviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setReviews(dummyReviews);
        return;
      }

      const res = await fetch(``);
      if (!res.ok) {
        setReviews(dummyReviews);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data?.reviews) ? data.reviews : [];

      const mapped: Review[] = arr.map((r: any) => ({
        id: String(r.id),
        company: r.company ?? "—",
        logo: r.logo ?? "",
        referRating: r.referRating ?? 0,
        googleRating: r.googleRating ?? 0,
      }));

      setReviews(mapped.length > 0 ? mapped : dummyReviews);
    } catch (err) {
      setReviews(dummyReviews);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const value = useMemo(
    () => ({ loading, error, reviews, loadReviews }),
    [loading, error, reviews, loadReviews]
  );

  return (
    <AdminReviewContext.Provider value={value}>
      {children}
    </AdminReviewContext.Provider>
  );
};
