"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";

export default function AdminPayoutsPage() {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const queryClient = useQueryClient();

  const { data: payoutsData } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/payouts?page=1&limit=50");
      console.log("Admin payouts data received:", data);
      return data.payouts;
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data } = await axios.post("/api/payouts/process", { payoutId });
      return data;
    },
    onSuccess: () => {
      toast.success("Payout processed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to process payout");
    },
  });

  const rejectPayoutMutation = useMutation({
    mutationFn: async ({
      payoutId,
      notes,
    }: {
      payoutId: string;
      notes: string;
    }) => {
      const { data } = await axios.patch(`/api/payouts/${payoutId}`, {
        status: "rejected",
        notes,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Payout rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      setIsRejectDialogOpen(false);
      setRejectionNotes("");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to reject payout");
    },
  });

  const handleReject = () => {
    if (!selectedPayoutId) return;

    if (!rejectionNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    rejectPayoutMutation.mutate({
      payoutId: selectedPayoutId,
      notes: rejectionNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
      rejected: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const pendingPayouts =
    payoutsData?.filter((p: { status: string }) => p.status === "pending") ||
    [];
  // const processingPayouts =
  //   payoutsData?.filter((p: { status: string }) => p.status === "processing") ||
  //   [];
  const completedPayouts =
    payoutsData?.filter((p: { status: string }) =>
      ["completed", "failed", "rejected"].includes(p.status)
    ) || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Payouts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Holder Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No pending payouts
                  </TableCell>
                </TableRow>
              ) : (
                pendingPayouts.map(
                  (payout: {
                    id: string;
                    createdAt: string;
                    store?: { name: string };
                    amount: string;
                    bankName: string;
                    accountNumber: string;
                    accountHolderName: string;
                    status: string;
                  }) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {format(
                          new Date(payout.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>{payout.store?.name}</TableCell>
                      <TableCell className="font-medium">
                        Rp {parseFloat(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{payout.bankName}</TableCell>
                      <TableCell>{payout.accountNumber}</TableCell>
                      <TableCell>{payout.accountHolderName}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              processPayoutMutation.mutate(payout.id)
                            }
                            disabled={processPayoutMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPayoutId(payout.id);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Processing Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processingPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No processing payouts
                  </TableCell>
                </TableRow>
              ) : (
                processingPayouts.map(
                  (payout: {
                    id: string;
                    createdAt: string;
                    store?: { name: string };
                    amount: string;
                    bankName: string;
                    transactionId?: string;
                    status: string;
                  }) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {format(
                          new Date(payout.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>{payout.store?.name}</TableCell>
                      <TableCell className="font-medium">
                        Rp {parseFloat(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{payout.bankName}</TableCell>
                      <TableCell>{payout.transactionId || "-"}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent> 
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Completed Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No completed payouts
                  </TableCell>
                </TableRow>
              ) : (
                completedPayouts.map(
                  (payout: {
                    id: string;
                    createdAt: string;
                    processedAt?: string;
                    store?: { name: string };
                    amount: string;
                    bankName: string;
                    transactionId?: string;
                    status: string;
                    notes?: string;
                  }) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {payout.processedAt
                          ? format(
                              new Date(payout.processedAt),
                              "MMM dd, yyyy HH:mm"
                            )
                          : format(
                              new Date(payout.createdAt),
                              "MMM dd, yyyy HH:mm"
                            )}
                      </TableCell>
                      <TableCell>{payout.store?.name}</TableCell>
                      <TableCell className="font-medium">
                        Rp {parseFloat(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{payout.bankName}</TableCell>
                      <TableCell>{payout.transactionId || "-"}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {payout.notes || "-"}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Rejection Reason</Label>
              <Textarea
                id="notes"
                placeholder="Enter reason for rejection..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPayoutMutation.isPending}
            >
              {rejectPayoutMutation.isPending
                ? "Rejecting..."
                : "Reject Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
