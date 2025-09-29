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
      const res = await fetch("/api/stores/areas");
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
        {data?.areas.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
