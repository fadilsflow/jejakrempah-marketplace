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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";

export default function SellerPayoutsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const queryClient = useQueryClient();

  const { data: storeData } = useQuery<{ id: string; name: string } | null>({
    queryKey: ["seller-stores"],
    queryFn: async () => {
      const { data } = await axios.get("/api/stores/me");
      return data.store;
    },
  });

  const { data: balanceData } = useQuery({
    queryKey: ["payout-balance", selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      const { data } = await axios.get(
        `/api/payouts/balance?storeId=${selectedStoreId}`
      );
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const { data: payoutsData } = useQuery({
    queryKey: ["payouts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/payouts?page=1&limit=50");
      console.log("Payouts data received:", data);
      return data.payouts;
    },
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (payoutData: {
      storeId: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
    }) => {
      const { data } = await axios.post("/api/payouts", payoutData);
      return data;
    },
    onSuccess: () => {
      toast.success("Payout request created successfully");
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payout-balance"] });
      setIsDialogOpen(false);
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create payout");
    },
  });

  const cancelPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      await axios.delete(`/api/payouts/${payoutId}`);
    },
    onSuccess: () => {
      toast.success("Payout cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payout-balance"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to cancel payout");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStoreId) {
      toast.error("Please select a store");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createPayoutMutation.mutate({
      storeId: selectedStoreId,
      amount: amountNum,
      bankName,
      accountNumber,
      accountHolderName,
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

  return (
    <div className=" space-y-6 mx-auto container px-6 md:px-12 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request Payout</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store">Store</Label>
                <Select
                  value={selectedStoreId}
                  onValueChange={setSelectedStoreId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeData && (
                      <SelectItem key={storeData.id} value={storeData.id}>
                        {storeData.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedStoreId && balanceData && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Earnings:</span>
                        <span className="font-medium">
                          Rp{" "}
                          {parseFloat(
                            balanceData.totalEarnings
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Fees:</span>
                        <span className="font-medium text-red-600">
                          - Rp{" "}
                          {parseFloat(balanceData.serviceFees).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid Out:</span>
                        <span className="font-medium text-red-600">
                          - Rp{" "}
                          {parseFloat(balanceData.totalPaid).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-medium text-orange-600">
                          - Rp{" "}
                          {parseFloat(
                            balanceData.pendingPayouts
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">
                          Available Balance:
                        </span>
                        <span className="font-bold text-green-600">
                          Rp{" "}
                          {parseFloat(
                            balanceData.availableBalance
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank/E-Wallet</Label>
                <select
                  id="bankName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                >
                  <option value="">Pilih Bank/E-Wallet</option>

                  <optgroup label="E-Wallet">
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="Dana">Dana</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="LinkAja">LinkAja</option>
                  </optgroup>

                  <optgroup label="Bank">
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BTN">BTN (Bank Tabungan Negara)</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Permata Bank">Permata Bank</option>
                    <option value="Danamon">Bank Danamon</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                    <option value="Maybank">Maybank Indonesia</option>
                    <option value="OCBC NISP">OCBC NISP</option>
                    <option value="Panin Bank">Panin Bank</option>
                    <option value="BII Maybank">BII Maybank</option>
                    <option value="Jenius">Jenius (BTPN)</option>
                    <option value="SeaBank">SeaBank</option>
                    <option value="Jago">Bank Jago</option>
                    <option value="Blu BCA">Blu by BCA Digital</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  placeholder="Full name as per bank account"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createPayoutMutation.isPending}
              >
                {createPayoutMutation.isPending
                  ? "Creating..."
                  : "Create Payout Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutsData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No payouts yet
                  </TableCell>
                </TableRow>
              ) : (
                payoutsData?.map(
                  (payout: {
                    id: string;
                    createdAt: string;
                    store?: { name: string };
                    amount: string;
                    bankName: string;
                    accountNumber: string;
                    status: string;
                  }) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {format(new Date(payout.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{payout.store?.name}</TableCell>
                      <TableCell>
                        Rp {parseFloat(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{payout.bankName}</TableCell>
                      <TableCell>{payout.accountNumber}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              cancelPayoutMutation.mutate(payout.id)
                            }
                            disabled={cancelPayoutMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
