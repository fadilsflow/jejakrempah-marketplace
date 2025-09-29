"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Settings, Save, RefreshCw, DollarSign } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

const serviceFeeSchema = z.object({
  service_fee_percentage: z
    .string()
    .min(1, "Service fee percentage is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid percentage format")
    .refine((val) => {
      const num = parseFloat(val);
      return num >= 0 && num <= 100;
    }, "Percentage must be between 0 and 100"),
});

type ServiceFeeForm = z.infer<typeof serviceFeeSchema>;

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ServiceFeePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ServiceFeeForm>({
    resolver: zodResolver(serviceFeeSchema),
    defaultValues: {
      service_fee_percentage: "5",
    },
  });

  // Fetch system settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async (data: ServiceFeeForm) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "service_fee_percentage",
          value: data.service_fee_percentage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update setting");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Service fee percentage updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating setting:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update setting"
      );
    },
  });

  const onSubmit = (data: ServiceFeeForm) => {
    if (!isEditing) {
      return;
    }
    updateSettingMutation.mutate(data);
  };

  const settings: SystemSetting[] = settingsData?.settings || [];
  const serviceFeeSetting = settings.find(s => s.key === "service_fee_percentage");

  // Set form value when data loads
  React.useEffect(() => {
    if (serviceFeeSetting) {
      form.setValue("service_fee_percentage", serviceFeeSetting.value);
    }
  }, [serviceFeeSetting, form]);

  // Reset form when editing starts
  React.useEffect(() => {
    if (isEditing && serviceFeeSetting) {
      form.setValue("service_fee_percentage", serviceFeeSetting.value);
    }
  }, [isEditing, serviceFeeSetting, form]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-6 md:px-12">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 md:px-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Service Fee Configuration</h1>
        <p className="text-muted-foreground">
          Configure the service fee percentage for all orders
        </p>
      </div>

      {/* Service Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Service Fee Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="service_fee_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Fee Percentage</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          disabled={!isEditing}
                          className="w-32"
                          placeholder="Enter percentage"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Current value: {serviceFeeSetting?.value || "5"}%
                      {serviceFeeSetting?.value && (
                        <span className="ml-2">
                          (Sellers receive {100 - parseFloat(serviceFeeSetting.value)}% of order total)
                        </span>
                      )}
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      disabled={updateSettingMutation.isPending}
                    >
                      {updateSettingMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(false);
                        if (serviceFeeSetting) {
                          form.setValue("service_fee_percentage", serviceFeeSetting.value);
                        }
                        form.clearErrors();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Service Fee
                    </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}