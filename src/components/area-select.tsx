"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
};

export function AreaSelect({ value, onChange, disabled }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/destination`);
      if (!res.ok) throw new Error("Gagal memuat area");
      return res.json() as Promise<{ areas: { id: string; name: string }[] }>;
    },
  });

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Memuat..." : "Pilih Area"} />
      </SelectTrigger>
      <SelectContent className="w-full">
        {data?.areas && data.areas.length > 0 ? (
          data.areas.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="none">
            Tidak ada area tersedia
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
