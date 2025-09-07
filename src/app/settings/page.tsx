"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User, Store, MapPin, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressDialog } from "@/components/checkout/address-dialog";
import { authClient } from "@/lib/auth-client";
import { generateSlug } from "@/lib/client-utils";
import { updateUserSchema, updateStoreSchema } from "@/lib/validations";
import type { z } from "zod";

type Address = {
  id: string;
  recipientName: string;
  phone?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
};

type Store = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
};

type UserFormData = z.infer<typeof updateUserSchema>;
type StoreFormData = z.infer<typeof updateStoreSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  // No longer need separate state variables since we're using forms

  // Address dialog state
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("user");

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Forms
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  const storeForm = useForm<StoreFormData>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
    },
  });

  // Fetch user store
  const { data: storeData, isLoading: isLoadingStore } = useQuery({
    queryKey: ["user-store"],
    queryFn: async () => {
      const response = await fetch("/api/stores/me");
      if (!response.ok) {
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: !!session?.user,
  });

  // Fetch user addresses
  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await fetch("/api/addresses");
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      return response.json();
    },
    enabled: !!session?.user,
  });

  const store = storeData?.store;
  const addresses = addressesData?.addresses || [];

  // Initialize form data when data loads
  useEffect(() => {
    if (session?.user) {
      userForm.reset({
        name: session.user.name || "",
        image: session.user.image || "",
      });
    }
  }, [session, userForm]);

  useEffect(() => {
    if (store) {
      storeForm.reset({
        name: store.name,
        slug: store.slug,
        description: store.description || "",
        logo: store.logo || "",
      });
    }
  }, [store, storeForm]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await authClient.updateUser(data);
    },
    onSuccess: () => {
      toast.success("User data updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to update user data");
    },
  });

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (data: StoreFormData) => {
      if (!store) throw new Error("No store found");

      const response = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update store");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Store data updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-store"] });
    },
    onError: (error) => {
      console.error("Error updating store:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update store"
      );
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await authClient.deleteUser();
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      router.push("/");
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    },
  });

  const handleUpdateUser = (data: UserFormData) => {
    updateUserMutation.mutate(data);
  };

  const handleUpdateStore = (data: StoreFormData) => {
    updateStoreMutation.mutate(data);
  };

  const handleStoreNameChange = (name: string) => {
    storeForm.setValue("name", name);
    if (name && !storeForm.getValues("slug")) {
      storeForm.setValue("slug", generateSlug(name));
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "YAKIN") {
      deleteAccountMutation.mutate();
      setShowDeleteDialog(false);
    } else {
      toast.error("Please type &apos;YAKIN&apos;  to confirm deletion");
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Please login to access settings
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "user", label: "User Data", icon: User },
    { id: "store", label: "Store Data", icon: Store },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "user":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form
                  onSubmit={userForm.handleSubmit(handleUpdateUser)}
                  className="space-y-4"
                >
                  <FormField
                    control={userForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            type="url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="w-full"
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update User Data"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "store":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStore ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading store...
                  </p>
                </div>
              ) : store ? (
                <Form {...storeForm}>
                  <form
                    onSubmit={storeForm.handleSubmit(handleUpdateStore)}
                    className="space-y-4"
                  >
                    <FormField
                      control={storeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Store name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleStoreNameChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="store-slug" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Store description"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/logo.png"
                              type="url"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={updateStoreMutation.isPending}
                      className="w-full"
                    >
                      {updateStoreMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Store Data"
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8">
                  <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Store Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven&apos;t created a store yet.
                  </p>
                  <Button onClick={() => router.push("/seller/new")}>
                    Create Store
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "addresses":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAddresses ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading addresses...
                  </p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Addresses</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a delivery address for your orders.
                  </p>
                  <Button onClick={handleAddAddress}>Add Address</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {addresses.map((address: Address) => (
                      <div
                        key={address.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {address.recipientName}
                          </h4>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {address.phone && (
                          <p className="text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.city}, {address.province}{" "}
                          {address.postalCode}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleAddAddress}
                    className="w-full"
                  >
                    Add New Address
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        );

      case "danger":
        return (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation">
                        Type &quot;YAKIN&quot; to confirm account deletion
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="YAKIN"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{renderTabContent()}</div>
      </div>

      {/* Address Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        address={editingAddress}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["addresses"] });
          setShowAddressDialog(false);
        }}
      />
    </div>
  );
}
